#!/usr/bin/env python3
"""HTTP API for TourCheck. Reuses all logic from main.py (CLI stays untouched).

Run:  pip install fastapi uvicorn google-genai python-dotenv ddgs
      uvicorn app:app --port 8000
Open: http://127.0.0.1:8000

Flow (fast first, slow second):
  /api/places  -> real venues from OpenStreetMap, instantly usable
  /api/locate  -> geocode typed place names
  /api/enrich  -> web prices/hours + ONE Gemini call, merged into the items
"""
import json
import re
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from google import genai
from pydantic import BaseModel

import main as ch

BASE = Path(__file__).parent
PUBLIC = BASE / "public"  # static site; on Vercel public/** is served by the CDN
HTML = PUBLIC / "index.html"
LANGS = {"az": "Azerbaijani", "en": "English", "ru": "Russian"}
# rough per-person fallback (AZN) when neither the web nor Gemini gives a number
KIND_PRICE = {"restaurant": 30, "cafe": 12, "fast_food": 8, "bar": 20, "pub": 20, "museum": 8, "attraction": 5,
              "theatre": 20, "cinema": 10, "mall": 0, "artwork": 0}
TOURIST_KINDS = ["museum", "attraction", "viewpoint", "park", "garden", "theatre", "cinema", "restaurant", "cafe"]

app = FastAPI(title="TourCheck API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

if not ch.API_KEY:
    raise SystemExit("GEMINI_API_KEY is missing. Create a .env file.")
client = genai.Client(api_key=ch.API_KEY.strip().strip("\"'"))

ENRICH_SYSTEM = (
    "You are a careful travel assistant for Azerbaijan. For each listed place you get OpenStreetMap facts and web "
    "snippets. Return ONLY one JSON object, no ``` and no commentary: "
    '{"summary": "<3-5 short sentences of practical advice for the planned time>", '
    '"places": {"<exact place name as given>": {"price_azn": number or null, "price_note": "", '
    '"estimate_azn": number, "hours": string or null, "open": true|false|null}}}. '
    "price_azn is ONE per-person price in AZN found in the snippets; null if none is stated. "
    "estimate_azn is ALWAYS a number: your best realistic per-person estimate in AZN for this kind of place "
    "in Azerbaijan (e.g. museum 5-15, cafe 10-20, restaurant 25-45), used only when price_azn is null. "
    "open is true/false only if the hours clearly say so for the planned time, else null. "
    "Never invent prices, hours or addresses."
)


def fallback_price(it: dict) -> float:
    return float(KIND_PRICE.get(it.get("kind"), 15))


def region_of(key: str):
    if key in ch.REGIONS:
        return ch.REGIONS[key][0], ch.REGIONS[key][1], ch.REGIONS[key][2]
    return ch.WHOLE_COUNTRY[0], ch.WHOLE_COUNTRY[1], ch.WHOLE_COUNTRY[2]


def kinds_for(mood: str) -> list[str]:
    m = mood.lower()
    if any(w in m for w in ("food", "eat", "restaurant", "cafe", "coffee", "bar", "dinner", "lunch", "yemək", "еда", "кафе")):
        return ["restaurant", "cafe", "fast_food", "bar", "pub"]
    if any(w in m for w in ("museum", "history", "culture", "muzey", "музей")):
        return ["museum", "artwork", "theatre"]
    if any(w in m for w in ("park", "walk", "nature", "garden", "парк", "природ")):
        return ["park", "garden", "viewpoint"]
    return TOURIST_KINDS


def diversify(found: list[dict], per_kind: int = 3, total: int = 9) -> list[dict]:
    """Nearest-first, but not nine cafes in a row."""
    out, count = [], {}
    for p in found:
        if count.get(p["kind"], 0) < per_kind:
            out.append(p)
            count[p["kind"]] = count.get(p["kind"], 0) + 1
        if len(out) >= total:
            break
    return out


def when_of(text: str):
    now = ch.now_in("Asia/Baku")
    dt = ch.parse_when(text or "", now) or now
    return dt, f"{dt:%A, %d.%m.%Y %H:%M} (timezone Asia/Baku)"


class PlacesReq(BaseModel):
    region: str = "baku"
    radius_km: float = 5
    mood: str = ""


class LocateReq(BaseModel):
    places: list[str]
    region: str = "baku"


class EnrichReq(BaseModel):
    items: list[dict]
    region: str = "baku"
    when: str = ""
    lang: str = "en"
    deep: bool = False  # read full pages (slower) - used for typed names


class Stop(BaseModel):
    name: str
    lat: float
    lon: float


class RouteReq(BaseModel):
    lat: float
    lon: float
    stops: list[Stop]
    mode: str = "walk"  # walk | car
    optimize: bool = True


@app.get("/api/regions")
def regions():
    out = [{"key": k, "name": v[0], "lat": v[1], "lon": v[2]} for k, v in ch.REGIONS.items()]
    out.append({"key": "__whole__", "name": ch.WHOLE_COUNTRY[0], "lat": ch.WHOLE_COUNTRY[1], "lon": ch.WHOLE_COUNTRY[2]})
    return out


@app.post("/api/places")
def places(req: PlacesReq):
    _, rlat, rlon = region_of(req.region)
    found = ch.find_places_overpass(rlat, rlon, radius_m=int(min(max(req.radius_km, 1), 50) * 1000),
                                    kinds=kinds_for(req.mood), limit=120)
    keys = ("name", "kind", "kind_ru", "lat", "lon", "address", "hours", "dist_m", "free")
    out = []
    for p in diversify(found):
        it = {k: p.get(k) for k in keys}
        it["price"] = 0.0 if it["free"] else None
        it["open"] = None
        out.append(it)
    return {"places": out}


@app.post("/api/locate")
def locate(req: LocateReq):
    names = [p.strip() for p in req.places if p.strip()][:6]
    if not names:
        raise HTTPException(400, "No places given")
    _, rlat, rlon = region_of(req.region)
    items = []
    for n in names:
        g = ch.geocode(n, near=(rlat, rlon))
        items.append({"name": n, "lat": g["lat"] if g else None, "lon": g["lon"] if g else None,
                      "address": g["name"] if g else None, "price": None, "open": None})
    return {"items": items}


def _facts_line(it: dict) -> str:
    bits = []
    if it.get("kind_ru"):
        bits.append(f"kind: {it['kind_ru']}")
    if it.get("address"):
        bits.append(f"addr: {str(it['address'])[:80]}")
    if it.get("hours"):
        bits.append(f"hours (OSM): {it['hours']}")
    if it.get("free"):
        bits.append("entry: free")
    return " | ".join(bits) or "no OSM data"


@app.post("/api/enrich")
def enrich(req: EnrichReq):
    items = req.items[:9]
    if not items:
        raise HTTPException(400, "No items")
    rname, _, _ = region_of(req.region)
    dt, when_text = when_of(req.when)

    def look(it):
        q = f"{it['name']} {rname} Azerbaijan opening hours {dt:%A} ticket price AZN"
        web = ch.web_search(q, n=4)
        return ch.enrich_results(web, top_n=1) if req.deep else web

    with ThreadPoolExecutor(4) as ex:
        webs = list(ex.map(look, items))
    blocks = [f"### {it['name']}\nOSM: {_facts_line(it)}\n{ch.web_block(w)}" for it, w in zip(items, webs)]
    prompt = (f"Region: {rname}. Planned visit: {when_text}. Write the summary in {LANGS.get(req.lang, 'English')}.\n\n"
              + "\n\n".join(blocks))
    raw = ch.ask_gemini(client, prompt, system=ENRICH_SYSTEM).strip()
    m = re.search(r"\{.*\}", raw, re.DOTALL)
    try:
        data = json.loads(m.group(0)) if m else None
    except Exception:
        data = None
    if not isinstance(data, dict):
        for it in items:  # Gemini unavailable: still give a rough price, flagged as an estimate
            it["price"], it["estimated"] = (0.0, False) if it.get("free") else (fallback_price(it), True)
        return {"items": items, "answer": raw[:600], "failed": True}

    facts = data.get("places") if isinstance(data.get("places"), dict) else {}
    for it in items:
        f = facts.get(it["name"]) or {}
        price = f.get("price_azn")
        est = f.get("estimate_azn")
        it["estimated"] = False
        if isinstance(price, (int, float)) and not isinstance(price, bool):
            it["price"] = float(price)
        elif it.get("free"):
            it["price"] = 0.0
        else:  # not found anywhere: show an honest estimate, flagged so the page can mark it
            ok = isinstance(est, (int, float)) and not isinstance(est, bool) and 0 <= est <= 500
            it["price"] = float(est) if ok else fallback_price(it)
            it["estimated"] = True
        if isinstance(f.get("open"), bool):
            it["open"] = f["open"]
        it["hours"] = it.get("hours") or f.get("hours")
    return {"items": items, "answer": str(data.get("summary") or ""), "failed": False}


@app.post("/api/route")
def route(req: RouteReq):
    if not req.stops:
        raise HTTPException(400, "No stops")
    profile, tmode = ("car", "driving") if req.mode == "car" else ("foot", "walking")
    start = (req.lat, req.lon)
    stops = [s.model_dump() for s in req.stops]
    if req.optimize:
        stops = ch.nearest_neighbour_order(start, stops)
    pts = [start] + [(s["lat"], s["lon"]) for s in stops]
    names = ["Start"] + [s["name"] for s in stops]
    legs, tm, ts = [], 0.0, 0.0
    for i in range(len(pts) - 1):
        m, s, exact = ch.leg_info(pts[i], pts[i + 1], profile)
        tm, ts = tm + m, ts + s
        legs.append({"from": names[i], "to": names[i + 1], "text": ch.fmt_leg(m, s, exact)})
    return {"legs": legs, "total": f"{tm / 1000:.1f} km, ~{round(ts / 60)} min",
            "maps_url": ch.maps_link(start, stops, tmode), "order": [s["name"] for s in stops]}


@app.get("/")
def index():
    return FileResponse(HTML)


@app.get("/admin")
def admin():
    return FileResponse(PUBLIC / "admin.html")


for _d in ("css", "js", "assets"):  # local dev only; Vercel serves public/** itself
    if (PUBLIC / _d).is_dir():
        app.mount(f"/{_d}", StaticFiles(directory=PUBLIC / _d), name=_d)