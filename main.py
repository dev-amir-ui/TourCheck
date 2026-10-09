#!/usr/bin/env python3
"""Terminal city helper for Azerbaijan.

Modes:
  1 - Plans:      you name places and/or events, the app checks each one (open/closed,
                  hours, prices) and then builds a route.
  2 - Where to go: pick a region + radius, the app pulls REAL places from OpenStreetMap
                  (Overpass API), optionally enriches with web-found prices/hours,
                  and gives advice. You can then ask follow-up questions about any
                  of the found places and Gemini will answer.
  3 - Change my location
  4 - Change region
  0 - Exit

Data sources:
  * OpenStreetMap Overpass API - real venues with addresses and coordinates (main source).
  * Web search (DuckDuckGo + SearXNG fallback) - events, ticket prices, menus, hours.
  * Page reader (r.jina.ai)                    - full page text for the top results.
  * Gemini                                     - autocorrects names, classifies place vs event,
                                                 estimates prices/hours when not found, and
                                                 writes the final answer. NO built-in search.
  * OpenStreetMap Nominatim + routing          - geocoding and travel legs.

Location: browser geolocation, manual entry, or IP fallback.
"""
import http.server
import json
import math
import os
import re
import socketserver
import sys
import threading
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from datetime import date, datetime, timedelta
from difflib import SequenceMatcher
from pathlib import Path
from urllib.parse import urlencode, urlparse
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
FALLBACK_MODELS = [
    m.strip()
    for m in os.getenv("GEMINI_FALLBACK_MODELS", "gemini-3.5-flash,gemini-2.5-flash").split(",")
    if m.strip()
]

SEARXNG_URL = (os.getenv("SEARXNG_URL") or "").strip().rstrip("/")

USER_AGENT = "city-helper-cli/1.0 (personal terminal project)"
LOCATION_CACHE = Path.home() / ".city_helper_location.json"
REGION_CACHE = Path.home() / ".city_helper_region.json"

COUNTRY = "Azerbaijan"

REGIONS = {
    "baku":       ("Baku",        40.4093, 49.8671, "Bakı"),
    "ganja":      ("Ganja",       40.6828, 46.3606, "Gəncə"),
    "sumgayit":   ("Sumgayit",    40.5897, 49.6686, "Sumqayıt"),
    "gabala":     ("Gabala",      40.9983, 47.8453, "Qəbələ"),
    "sheki":      ("Sheki",       41.1919, 47.1706, "Şəki"),
    "lankaran":   ("Lankaran",    38.7543, 48.8506, "Lənkəran"),
    "quba":       ("Quba",        41.3614, 48.5136, "Quba"),
    "khachmaz":   ("Khachmaz",    41.4644, 48.8053, "Xaçmaz"),
    "zagatala":   ("Zagatala",    41.6326, 46.6436, "Zaqatala"),
    "naftalan":   ("Naftalan",    40.5075, 46.8253, "Naftalan"),
    "shusha":     ("Shusha",      39.7600, 46.7500, "Şuşa"),
    "shamakhi":   ("Shamakhi",    40.6314, 48.6411, "Şamaxı"),
    "ismayilli":  ("Ismayilli",   40.7900, 48.1500, "İsmayıllı"),
    "goychay":    ("Goychay",     40.6500, 47.7400, "Göyçay"),
    "mingachevir":("Mingachevir", 40.7700, 47.0400, "Mingəçevir"),
    "nakhchivan": ("Nakhchivan",  39.2089, 45.4122, "Naxçıvan"),
}

WHOLE_COUNTRY = ("Whole Azerbaijan", 40.3, 47.7, "Azərbaycan")

SYSTEM_PROMPT = (
    "You are a city assistant for Azerbaijan. Answer in English, briefly and to the point. "
    "When the prompt contains structured place data (from OpenStreetMap) and web search results, "
    "rely on them first. "
    "If a price is not found in the data, give a realistic estimated price for that kind of venue "
    "in Azerbaijan, and mark it clearly as 'estimate' (in AZN). "
    "If an opening-hours value is not found, give a typical opening time for that kind of venue, "
    "and mark it as 'typical' (still prefer OSM opening_hours when present). "
    "Never write 'address not in OSM' — if the address is missing, give the district/city or the "
    "nearest known landmark instead. "
    "Give prices in Azerbaijani manat (AZN) unless the source says otherwise. "
    "For opening hours, trust OSM opening_hours first, then official venue sites, events.az, "
    "iticket.az, biletsiz.az, stubhub. DO NOT trust generic aggregators (triphobo, tripadvisor, "
    "wanderlog, yandex-uslugi, trip.com) for hours. "
    "Only recommend SPECIFIC named venues with a real address or coordinates. "
    "Do NOT recommend categories like 'apple orchards', 'canyons', 'city center'. "
    "Parks, public gardens, viewpoints, streets and squares are free — say 'free' for them."
)

WEEKDAYS = {"mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6}

AZ_BBOX = (38.0, 41.95, 44.0, 51.0)
AZ_COUNTRY_CODES = "az"
_GEOLOC_PORT = 8734

_TRANSLIT = str.maketrans({
    "ə": "a", "ç": "c", "ş": "s", "ğ": "g", "ü": "u", "ö": "o", "ı": "i",
    "Ə": "A", "Ç": "C", "Ş": "S", "Ğ": "G", "Ü": "U", "Ö": "O", "İ": "I",
    "ё": "e", "ж": "zh", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh",
    "щ": "shch", "ю": "yu", "я": "ya", "ы": "y", "э": "e",
})

_EVENT_WORDS = {
    "chempionat", "çempionat", "championship", "summit", "forum", "conference", "konfrans",
    "festival", "olimpiada", "olympiad", "tournament", "turnir", "match", "matç",
    "concert", "konsert", "show", "şou", "exhibition", "sərgi", "cup", "kubok",
    "final", "semifinal", "qualifier", "seçmə",
}

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.openstreetmap.fr/api/interpreter",
]


# ---------- text helpers ----------

def normalize_name(name: str) -> str:
    s = unicodedata.normalize("NFD", name)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.translate(_TRANSLIT)
    s = s.lower()
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def similarity(a: str, b: str) -> float:
    a_n, b_n = normalize_name(a), normalize_name(b)
    if not a_n or not b_n:
        return 0.0
    return SequenceMatcher(None, a_n, b_n).ratio()


def _clean_for_geocode(query: str) -> str:
    words = query.split()
    kept = [w for w in words if w.lower().strip(".,!?") not in _EVENT_WORDS]
    return " ".join(kept) if kept else query


# ---------- HTTP / geo ----------

def http_json(url: str, timeout: int = 10, data: bytes | None = None):
    headers = {"User-Agent": USER_AGENT}
    if data is not None:
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def haversine_m(a: tuple[float, float], b: tuple[float, float]) -> float:
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371000 * math.asin(math.sqrt(h))


def city_from_address(addr: dict) -> str:
    return addr.get("city") or addr.get("town") or addr.get("village") or addr.get("state") or ""


def _try_nominatim(q: str, near: tuple[float, float] | None, max_km: float) -> dict | None:
    base = {
        "q": q,
        "format": "jsonv2",
        "limit": 5,
        "addressdetails": 1,
        "countrycodes": AZ_COUNTRY_CODES,
    }
    attempts = []
    if near:
        d = 1.0
        box = f"{near[1] - d},{near[0] + d},{near[1] + d},{near[0] - d}"
        attempts.append({**base, "viewbox": box, "bounded": 1})
    attempts.append(base)

    for params in attempts:
        try:
            data = http_json("https://nominatim.openstreetmap.org/search?" + urlencode(params))
        except Exception as e:
            print(f"[geocode error on {q!r}] {type(e).__name__}: {e}")
            data = []
        time.sleep(1.1)
        for d0 in data:
            lat, lon = float(d0["lat"]), float(d0["lon"])
            if not (AZ_BBOX[0] <= lat <= AZ_BBOX[1] and AZ_BBOX[2] <= lon <= AZ_BBOX[3]):
                continue
            if near:
                dist_km = haversine_m(near, (lat, lon)) / 1000
                if dist_km > max_km:
                    continue
            return {
                "lat": lat, "lon": lon,
                "name": d0.get("display_name", q),
                "city": city_from_address(d0.get("address", {})),
            }
    return None


def geocode(query: str, near: tuple[float, float] | None = None, max_km: float = 250) -> dict | None:
    variants = [query]
    t = query.translate(_TRANSLIT)
    if t != query:
        variants.append(t)
    cleaned = _clean_for_geocode(query)
    if cleaned and cleaned not in variants:
        variants.append(cleaned)
        ct = cleaned.translate(_TRANSLIT)
        if ct != cleaned and ct not in variants:
            variants.append(ct)

    for v in variants:
        res = _try_nominatim(v, near, max_km)
        if res:
            if v != query:
                print(f"   [geocode: matched via {v!r}]")
            return res
    return None


def reverse_city(lat: float, lon: float) -> str:
    try:
        params = {"lat": lat, "lon": lon, "format": "jsonv2", "addressdetails": 1, "zoom": 10}
        data = http_json("https://nominatim.openstreetmap.org/reverse?" + urlencode(params))
        time.sleep(1.1)
        return city_from_address(data.get("address", {}))
    except Exception:
        return ""


# ---------- Overpass (OpenStreetMap) ----------

def _overpass(query: str) -> dict | None:
    body = urllib.parse.urlencode({"data": query}).encode()
    for url in OVERPASS_URLS:
        try:
            return http_json(url, timeout=30, data=body)
        except Exception as e:
            print(f"[Overpass failed on {url.split('/')[2]}] {type(e).__name__}: {e}")
            continue
    return None


# amenity / tourism / leisure tags we consider "places to go"
DEFAULT_KINDS = {
    "restaurant": "restaurant",
    "cafe": "cafe",
    "fast_food": "fast food",
    "bar": "bar",
    "pub": "pub",
    "museum": "museum",
    "attraction": "attraction",
    "artwork": "artwork",
    "viewpoint": "viewpoint",
    "park": "park",
    "garden": "garden",
    "theatre": "theatre",
    "cinema": "cinema",
    "mall": "mall",
}

# kinds that are basically always free to enter
FREE_KINDS = {"park", "garden", "viewpoint", "artwork", "attraction"}


def find_places_overpass(lat: float, lon: float, radius_m: int = 5000,
                         kinds: list[str] | None = None,
                         limit: int = 60) -> list[dict]:
    """Return real venues from OpenStreetMap with names, addresses, coordinates, hours."""
    kinds = kinds or list(DEFAULT_KINDS.keys())
    amenity_re = "|".join(kinds)

    query = f"""
[out:json][timeout:30];
(
  node["amenity"~"^({amenity_re})$"](around:{radius_m},{lat},{lon});
  way["amenity"~"^({amenity_re})$"](around:{radius_m},{lat},{lon});
  node["tourism"~"^({amenity_re})$"](around:{radius_m},{lat},{lon});
  way["tourism"~"^({amenity_re})$"](around:{radius_m},{lat},{lon});
  node["leisure"~"^({amenity_re})$"](around:{radius_m},{lat},{lon});
  way["leisure"~"^({amenity_re})$"](around:{radius_m},{lat},{lon});
);
out center tags;
"""
    resp = _overpass(query)
    if not resp:
        return []

    out = []
    for el in resp.get("elements", []):
        tags = el.get("tags") or {}
        name = tags.get("name") or tags.get("name:en") or tags.get("name:az")
        if not name:
            continue
        lat2 = el.get("lat") or (el.get("center") or {}).get("lat")
        lon2 = el.get("lon") or (el.get("center") or {}).get("lon")
        if lat2 is None or lon2 is None:
            continue

        amenity = tags.get("amenity") or tags.get("tourism") or tags.get("leisure") or "place"
        address_parts = [
            tags.get("addr:street"),
            tags.get("addr:housenumber"),
            tags.get("addr:city") or tags.get("addr:town") or tags.get("addr:village"),
        ]
        address = " ".join(p for p in address_parts if p) or None

        out.append({
            "name": name,
            "kind": amenity,
            "kind_ru": DEFAULT_KINDS.get(amenity, amenity),
            "lat": lat2,
            "lon": lon2,
            "address": address,
            "hours": tags.get("opening_hours"),
            "website": tags.get("website") or tags.get("contact:website"),
            "phone": tags.get("phone") or tags.get("contact:phone"),
            "cuisine": tags.get("cuisine"),
            "price_range": tags.get("price_range"),
            "dist_m": haversine_m((lat, lon), (lat2, lon2)),
            "free": amenity in FREE_KINDS,
        })

    out.sort(key=lambda p: p["dist_m"])
    return out[:limit]


# ---------- web search ----------

_web_warned = False


def _ddg(query: str, n: int) -> list[dict]:
    global _web_warned
    try:
        try:
            from ddgs import DDGS
        except ImportError:
            from duckduckgo_search import DDGS
    except ImportError:
        if not _web_warned:
            print("[web search: ddgs is not installed, run `pip install ddgs`]")
            _web_warned = True
        return []
    try:
        res = DDGS().text(query, max_results=n) or []
        time.sleep(0.5)
        return [
            {"title": r.get("title", ""), "body": (r.get("body") or "")[:400], "url": r.get("href", "")}
            for r in res
        ]
    except Exception as e:
        print(f"[web search DDG failed for {query!r}] {type(e).__name__}: {e}")
        return []


def _searxng(query: str, n: int) -> list[dict]:
    if not SEARXNG_URL:
        return []
    try:
        req = urllib.request.Request(
            f"{SEARXNG_URL}/search?" + urlencode({"q": query, "format": "json"}),
            headers={"User-Agent": USER_AGENT},
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.load(r)
        return [
            {"title": x.get("title", ""), "body": (x.get("content") or "")[:400], "url": x.get("url", "")}
            for x in (data.get("results") or [])[:n]
        ]
    except Exception as e:
        print(f"[web search SearXNG failed for {query!r}] {type(e).__name__}: {e}")
        return []


def web_search(query: str, n: int = 5) -> list[dict]:
    results = _ddg(query, n)
    if not results:
        results = _searxng(query, n)
    return results


def fetch_page_md(url: str, max_chars: int = 4000) -> str:
    if not url:
        return ""
    try:
        req = urllib.request.Request(
            f"https://r.jina.ai/{url}",
            headers={"User-Agent": USER_AGENT},
        )
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.read().decode("utf-8", "replace")[:max_chars]
    except Exception as e:
        print(f"[page read failed {url[:60]}...] {type(e).__name__}: {e}")
        return ""


def enrich_results(results: list[dict], top_n: int = 2) -> list[dict]:
    for r in results[:top_n]:
        page = fetch_page_md(r["url"])
        if page and len(page) > len(r.get("body", "")):
            r["body"] = page
    return results


def web_block(results: list[dict]) -> str:
    if not results:
        return (
            "Web results: NONE. No live data was found. "
            "Use realistic estimates for prices and typical hours for opening times, "
            "and mark them as 'estimate'/'typical'."
        )
    return "Web results:\n" + "\n".join(
        f"  - {r['title']}: {r['body']} ({r['url']})" for r in results
    )


def osm_block(places: list[dict]) -> str:
    if not places:
        return "OpenStreetMap: NONE (no venues found in the radius)"
    lines = ["OpenStreetMap venues (source of truth for name, address, coordinates):"]
    for p in places:
        parts = [f"  - {p['name']} ({p['kind_ru']})"]
        if p.get("address"):
            parts.append(f"addr: {p['address']}")
        parts.append(f"dist: {p['dist_m']/1000:.2f} km")
        if p.get("hours"):
            parts.append(f"hours: {p['hours']}")
        if p.get("cuisine"):
            parts.append(f"cuisine: {p['cuisine']}")
        if p.get("price_range"):
            parts.append(f"price_range: {p['price_range']}")
        if p.get("website"):
            parts.append(f"site: {p['website']}")
        if p.get("free"):
            parts.append("entry: free")
        parts.append(f"coords: {p['lat']:.5f},{p['lon']:.5f}")
        lines.append(" | ".join(parts))
    return "\n".join(lines)


# ---------- Gemini ----------

def ask_gemini(client: genai.Client, prompt: str, system: str | None = None) -> str:
    last_error = None
    models = [MODEL] + [m for m in FALLBACK_MODELS if m != MODEL]
    for model in models:
        try:
            resp = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(system_instruction=system or SYSTEM_PROMPT),
            )
            answer = resp.text or "(empty response)"
            if model != MODEL:
                answer = f"[fallback model: {model}]\n" + answer
            return answer
        except Exception as e:
            last_error = e
            print(f"[Gemini error on {model}] {type(e).__name__}: {e}")
            code = getattr(e, "code", None)
            if code in (401, 403) or "API key not valid" in str(e):
                return f"Gemini rejected the API key: {e}"
            if code != 404:  # 404 = model retired/unknown: go straight to the next one
                time.sleep(1)
    return (
        f"All Gemini attempts failed. Last error: {last_error}\n"
        "Check your quota at https://ai.dev/rate-limit or try again in a minute."
    )


CORRECT_SYSTEM = (
    "You fix typos in the names of places and events in Azerbaijan. "
    "The user typed something, and we ran a web search. Look at the results and figure out "
    "what the user actually meant.\n"
    "Return ONLY a JSON object: "
    '{"corrected": "<correct name>", "type": "place"|"event", '
    '"venue": "<venue name if event>", "city": "<city if known>", '
    '"confidence": 0.0-1.0}.\n'
    "If the search results clearly do not match anything, return confidence 0.0. "
    "No explanations. No ```."
)


def autocorrect_name(client, user_input: str, ctx: dict) -> dict:
    norm = normalize_name(user_input)
    queries = [f"{user_input} Azerbaijan"]
    if norm != user_input.lower():
        queries.append(f"{norm} Azerbaijan")
    cleaned = _clean_for_geocode(user_input)
    if cleaned != user_input:
        queries.append(f"{cleaned} Azerbaijan")

    seen_urls, results = set(), []
    for q in queries:
        for r in web_search(q, n=5):
            if r["url"] not in seen_urls:
                seen_urls.add(r["url"])
                results.append(r)
        if len(results) >= 8:
            break

    if not results:
        return {"corrected": user_input, "type": "place", "venue": "", "city": "",
                "confidence": 0.0, "search_results": []}

    prompt = (
        f"User typed: {user_input!r}\n"
        f"User's region: {ctx.get('region_name') or ctx.get('city') or 'unknown'}\n\n"
        "Search results:\n"
        + "\n".join(f"- {r['title']}: {r['body']} ({r['url']})" for r in results)
    )
    raw = ask_gemini(client, prompt, system=CORRECT_SYSTEM).strip()
    raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()
    m = re.search(r"\{.*\}", raw, re.DOTALL)
    if not m:
        return {"corrected": user_input, "type": "place", "venue": "", "city": "",
                "confidence": 0.0, "search_results": results}
    try:
        data = json.loads(m.group(0))
    except Exception:
        return {"corrected": user_input, "type": "place", "venue": "", "city": "",
                "confidence": 0.0, "search_results": results}

    return {
        "corrected": (data.get("corrected") or user_input).strip(),
        "type": (data.get("type") or "place").lower(),
        "venue": (data.get("venue") or "").strip(),
        "city": (data.get("city") or "").strip(),
        "confidence": float(data.get("confidence") or 0.0),
        "search_results": results,
    }


def smart_geocode(client, user_input: str, ctx: dict, correction: dict | None = None) -> dict | None:
    candidates = [user_input]
    norm = normalize_name(user_input)
    if norm != user_input.lower():
        candidates.append(norm)
    cleaned = _clean_for_geocode(user_input)
    if cleaned not in candidates:
        candidates.append(cleaned)
    if correction:
        corr = correction.get("corrected") or ""
        if corr and corr not in candidates:
            candidates.append(corr)
        cn = normalize_name(corr)
        if cn and cn not in candidates:
            candidates.append(cn)
        v = correction.get("venue") or ""
        if v and v not in candidates:
            candidates.append(v)
        vn = normalize_name(v)
        if vn and vn not in candidates:
            candidates.append(vn)

    for cand in candidates:
        g = geocode(cand, near=(ctx["lat"], ctx["lon"]))
        if not g:
            continue
        sim = similarity(user_input, g["name"])
        if sim < 0.25:
            print(f"   [geocode: {cand!r} → {g['name'][:50]} (sim {sim:.2f}, ignored)]")
            continue
        if cand != user_input:
            print(f"   [geocode: matched via {cand!r}]")
        return {"query": user_input, "matched": cand,
                "lat": g["lat"], "lon": g["lon"], "name": g["name"]}
    return None


# ---------- browser geolocation ----------

_geoloc_result: dict = {}
_geoloc_event = threading.Event()

GEOLOC_HTML = """<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Location permission</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px;
         max-width: 520px; margin: auto; line-height: 1.5; color: #222; }
  h2 { color: #111; }
  button { font-size: 16px; padding: 12px 24px; cursor: pointer; background: #007aff;
           color: white; border: none; border-radius: 8px; }
  button:hover { background: #005bb5; }
  .ok { color: #0a7a0a; font-weight: 600; }
  .err { color: #c00; font-weight: 600; }
</style></head>
<body>
<h2>City Helper wants your location</h2>
<p>Click the button, your browser will ask for permission - choose <b>Allow</b>.</p>
<button onclick="ask()">Allow location</button>
<p id="status"></p>
<script>
function ask() {
  var st = document.getElementById('status');
  st.textContent = 'Requesting...';
  if (!navigator.geolocation) { st.innerHTML = '<span class="err">Not supported.</span>'; return; }
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var lat = pos.coords.latitude, lon = pos.coords.longitude;
      st.innerHTML = '<span class="ok">OK: ' + lat.toFixed(5) + ', ' + lon.toFixed(5) + '</span>';
      fetch('/coords', { method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({lat: lat, lon: lon, accuracy: pos.coords.accuracy}) })
        .then(function () { st.innerHTML += '<br>You can close this window.'; });
    },
    function (err) {
      st.innerHTML = '<span class="err">Error: ' + err.message + '</span>';
      fetch('/coords', { method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({error: err.message}) });
    },
    {enableHighAccuracy: true, timeout: 20000, maximumAge: 0}
  );
}
</script></body></html>"""


class _GeoHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if urlparse(self.path).path == "/":
            body = GEOLOC_HTML.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_error(404)

    def do_POST(self):
        if urlparse(self.path).path == "/coords":
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            _geoloc_result.clear()
            _geoloc_result.update(data)
            _geoloc_event.set()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
        else:
            self.send_error(404)

    def log_message(self, *args):
        pass


def get_location_from_browser(timeout: float = 90.0) -> tuple[float, float] | None:
    _geoloc_result.clear()
    _geoloc_event.clear()
    try:
        server = socketserver.TCPServer(("127.0.0.1", _GEOLOC_PORT), _GeoHandler)
    except OSError as e:
        print(f"[geolocation] cannot open port {_GEOLOC_PORT}: {e}")
        return None
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    url = f"http://127.0.0.1:{_GEOLOC_PORT}/"
    print(f"\nOpening browser for location permission: {url}")
    webbrowser.open(url)
    try:
        if not _geoloc_event.wait(timeout=timeout):
            print("Timeout: the browser did not send coordinates.")
            return None
    finally:
        server.shutdown()
        server.server_close()
    if "lat" in _geoloc_result and "lon" in _geoloc_result:
        lat = float(_geoloc_result["lat"])
        lon = float(_geoloc_result["lon"])
        acc = _geoloc_result.get("accuracy")
        print(f"Coordinates received: {lat:.5f}, {lon:.5f}"
              + (f" (accuracy ±{acc:.0f} m)" if acc else ""))
        return lat, lon
    print(f"Browser returned an error: {_geoloc_result.get('error', 'unknown')}")
    return None


# ---------- location and region ----------

def detect_location_by_ip() -> dict:
    try:
        data = http_json(
            "http://ip-api.com/json/?fields=status,country,countryCode,city,lat,lon,timezone",
            timeout=5,
        )
        if data.get("status") == "success":
            if data.get("countryCode") == "AZ" or data.get("country") == COUNTRY:
                return data
            return {"_not_az": True, "country": data.get("country"), "city": data.get("city")}
    except Exception:
        pass
    return {}


def now_in(tz_name: str | None) -> datetime:
    try:
        return datetime.now(ZoneInfo(tz_name)) if tz_name else datetime.now().astimezone()
    except Exception:
        return datetime.now().astimezone()


def parse_coords(text: str) -> tuple[float, float] | None:
    nums = re.findall(r"-?\d+(?:[.,]\d+)?", text)
    if len(nums) != 2:
        return None
    lat, lon = (float(n.replace(",", ".")) for n in nums)
    if -90 <= lat <= 90 and -180 <= lon <= 180:
        return lat, lon
    return None


def make_ctx(lat: float, lon: float, label: str, tz: str | None, city: str,
             region_key: str = "", region_name: str = "") -> dict:
    return {
        "lat": lat, "lon": lon, "label": label, "tz": tz, "city": city,
        "region_key": region_key, "region_name": region_name,
        "place": f"{label} (exact coordinates {lat:.5f}, {lon:.5f})",
    }


def save_location(ctx: dict) -> None:
    try:
        LOCATION_CACHE.write_text(json.dumps(
            {k: ctx[k] for k in ("lat", "lon", "label", "tz", "city")}))
    except OSError:
        pass


def load_saved_location() -> dict | None:
    try:
        d = json.loads(LOCATION_CACHE.read_text())
        return make_ctx(d["lat"], d["lon"], d["label"], d.get("tz"), d.get("city", ""))
    except Exception:
        return None


def save_region(region_key: str) -> None:
    try:
        REGION_CACHE.write_text(json.dumps({"region": region_key}))
    except OSError:
        pass


def load_saved_region() -> str | None:
    try:
        d = json.loads(REGION_CACHE.read_text())
        return d.get("region")
    except Exception:
        return None


def pick_region() -> tuple[str, str, float, float, str]:
    keys = list(REGIONS.keys())
    saved = load_saved_region()
    print("\nWhere do you want to search?")
    for i, key in enumerate(keys, 1):
        name = REGIONS[key][0]
        mark = "  ← last used" if key == saved else ""
        print(f"  {i:2d} - {name}{mark}")
    print(f"  {len(keys)+1:2d} - {WHOLE_COUNTRY[0]} (search the entire country)")

    while True:
        raw = input("> ").strip().lower()
        if not raw and saved and saved in REGIONS:
            k = saved
            break
        if raw.isdigit():
            n = int(raw)
            if 1 <= n <= len(keys):
                k = keys[n - 1]
                break
            if n == len(keys) + 1:
                k = "__whole__"
                break
        matches = [kk for kk in keys if raw in kk or raw in REGIONS[kk][0].lower()]
        if len(matches) == 1:
            k = matches[0]
            break
        if raw in ("whole", "all", "country", "everything"):
            k = "__whole__"
            break
        print(f"Enter 1-{len(keys)+1}, or type a region name.")

    if k == "__whole__":
        save_region("__whole__")
        return ("__whole__", WHOLE_COUNTRY[0], WHOLE_COUNTRY[1], WHOLE_COUNTRY[2], WHOLE_COUNTRY[3])
    name, lat, lon, hint = REGIONS[k]
    save_region(k)
    return (k, name, lat, lon, hint)


def setup_context() -> dict:
    ip = detect_location_by_ip()
    tz = ip.get("timezone") if ip and not ip.get("_not_az") else None

    saved = load_saved_location()
    if saved:
        print(f"Saved location: {saved['label']} ({saved['lat']:.5f}, {saved['lon']:.5f})")
        if input("Use it? Enter = yes, n = choose another: ").strip().lower() != "n":
            region_key, region_name, rlat, rlon, _ = pick_region()
            saved["region_key"] = region_key
            saved["region_name"] = region_name
            return saved

    print(
        "\nHow should I find where you are?\n"
        "  1 - Allow browser geolocation (most accurate)\n"
        "  2 - Type an address or coordinates manually\n"
        "  3 - Rough guess by IP (city level, often wrong)"
    )
    while True:
        choice = input("> ").strip() or "1"
        if choice == "1":
            coords = get_location_from_browser()
            if not coords:
                print("Did not work. Try option 2 or 3.")
                continue
            lat, lon = coords
            if not (AZ_BBOX[0] <= lat <= AZ_BBOX[1] and AZ_BBOX[2] <= lon <= AZ_BBOX[3]):
                print(f"Those coordinates are outside Azerbaijan ({lat:.4f}, {lon:.4f}).")
                if input("Use anyway? y/n: ").strip().lower() != "y":
                    continue
            city = reverse_city(lat, lon)
            label = f"Current location ({lat:.5f}, {lon:.5f})"
            ctx = make_ctx(lat, lon, label, tz, city)
            break
        if choice == "2":
            text = input("Address or coordinates (e.g. 'Nizami küçəsi 203, Baku' or '40.4093, 49.8671'): ").strip()
            if not text:
                continue
            coords = parse_coords(text)
            if coords:
                lat, lon = coords
                if not (AZ_BBOX[0] <= lat <= AZ_BBOX[1] and AZ_BBOX[2] <= lon <= AZ_BBOX[3]):
                    print(f"Outside Azerbaijan ({lat:.4f}, {lon:.4f}).")
                    continue
                city = reverse_city(lat, lon)
                label = f"{lat:.5f}, {lon:.5f}"
                ctx = make_ctx(lat, lon, label, tz, city)
                break
            print("Looking it up in Azerbaijan...")
            g = geocode(text)
            if not g:
                print("Not found. Try adding the city, e.g. 'Baku'.")
                continue
            print(f"Found: {g['name']}\n  ({g['lat']:.5f}, {g['lon']:.5f})")
            if input("Correct? Enter = yes, n = try again: ").strip().lower() == "n":
                continue
            ctx = make_ctx(g["lat"], g["lon"], g["name"], tz, g["city"])
            break
        if choice == "3":
            if not ip:
                print("IP lookup failed. Pick 1 or 2.")
                continue
            if ip.get("_not_az"):
                print(f"IP not in Azerbaijan (says {ip.get('country')}). Pick 1 or 2.")
                continue
            print(
                f"\nWARNING: rough IP-based guess.\n"
                f"  {ip['city']}, {ip['country']} - {ip['lat']:.5f}, {ip['lon']:.5f}\n"
            )
            if input("Use it anyway? y/n: ").strip().lower() != "y":
                continue
            ctx = make_ctx(ip["lat"], ip["lon"],
                           f"{ip['city']}, {ip['country']} (approximate, by IP - NOT verified)",
                           tz, ip["city"])
            break
        print("Enter 1, 2 or 3.")

    region_key, region_name, rlat, rlon, _ = pick_region()
    ctx["region_key"] = region_key
    ctx["region_name"] = region_name
    save_location(ctx)
    return ctx


def parse_when(text: str, now: datetime) -> datetime | None:
    t = text.strip().lower()
    if t in ("", "now"):
        return now
    hour = minute = None
    ap = None
    tm = re.search(r"(\d{1,2}):(\d{2})\s*(am|pm)?\s*$", t)
    if tm:
        hour, minute, ap = int(tm.group(1)), int(tm.group(2)), tm.group(3)
    else:
        tm = re.search(r"(?<![\d.:-])(\d{1,2})\s*(am|pm)\s*$", t)
        if tm:
            hour, minute, ap = int(tm.group(1)), 0, tm.group(2)
    if tm:
        if ap == "pm" and hour < 12:
            hour += 12
        if ap == "am" and hour == 12:
            hour = 0
        if hour > 23 or minute > 59:
            return None
        rest = t[: tm.start()].strip()
    else:
        rest = t

    today = now.date()
    if rest in ("", "today"):
        day = today
    elif rest == "tomorrow":
        day = today + timedelta(days=1)
    else:
        wd = re.sub(r"^next\s+", "", rest)[:3]
        if re.fullmatch(r"(next\s+)?[a-z]+", rest) and wd in WEEKDAYS:
            ahead = (WEEKDAYS[wd] - today.weekday()) % 7
            if ahead == 0 and hour is not None and (hour, minute) <= (now.hour, now.minute):
                ahead = 7
            day = today + timedelta(days=ahead)
        else:
            m = re.fullmatch(r"(\d{4})-(\d{1,2})-(\d{1,2})", rest)
            if m:
                y, mo, d = map(int, m.groups())
            else:
                m = re.fullmatch(r"(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?", rest)
                if not m:
                    return None
                d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3) or today.year)
            try:
                day = date(y, mo, d)
            except ValueError:
                return None
    if hour is None:
        if day == today:
            return now
        hour, minute = 12, 0
    return datetime(day.year, day.month, day.day, hour, minute, tzinfo=now.tzinfo)


def ask_datetime(ctx: dict) -> tuple[datetime, str]:
    now = now_in(ctx["tz"])
    print(f"Now: {now:%A, %d.%m.%Y %H:%M}")
    while True:
        raw = input("When are you going? Enter = now, or '19:00', 'tomorrow 7pm', 'sat 14:30', '12.10 18:00': ")
        dt = parse_when(raw, now)
        if dt:
            break
        print("Examples: 19:00 | tomorrow 7pm | sat 14:30 | 2026-10-12 18:00")
    print(f"Planning for: {dt:%A, %d.%m.%Y %H:%M}")
    tz = ctx["tz"] or "local"
    text = f"{dt:%A, %d.%m.%Y %H:%M} (timezone {tz}; current time {now:%A, %d.%m.%Y %H:%M})"
    return dt, text


# ---------- routes ----------

def leg_info(a: tuple[float, float], b: tuple[float, float], profile: str) -> tuple[float, float, bool]:
    url = (
        f"https://routing.openstreetmap.de/routed-{profile}/route/v1/driving/"
        f"{a[1]},{a[0]};{b[1]},{b[0]}?overview=false"
    )
    try:
        data = http_json(url, timeout=8)
        r = data["routes"][0]
        return float(r["distance"]), float(r["duration"]), True
    except Exception:
        meters = haversine_m(a, b) * 1.3
        speed = 1.35 if profile == "foot" else 7.0
        return meters, meters / speed, False


def fmt_leg(meters: float, seconds: float, exact: bool) -> str:
    dist = f"{meters / 1000:.1f} km" if meters >= 1000 else f"{int(meters)} m"
    return f"{dist}, ~{max(1, round(seconds / 60))} min" + ("" if exact else " (estimate)")


def nearest_neighbour_order(start: tuple[float, float], stops: list[dict]) -> list[dict]:
    left, ordered, cur = stops[:], [], start
    while left:
        nxt = min(left, key=lambda s: haversine_m(cur, (s["lat"], s["lon"])))
        ordered.append(nxt)
        left.remove(nxt)
        cur = (nxt["lat"], nxt["lon"])
    return ordered


def maps_link(start: tuple[float, float], stops: list[dict], travelmode: str) -> str:
    params = {
        "api": 1,
        "origin": f"{start[0]},{start[1]}",
        "destination": f"{stops[-1]['lat']},{stops[-1]['lon']}",
        "travelmode": travelmode,
    }
    if len(stops) > 1:
        params["waypoints"] = "|".join(f"{s['lat']},{s['lon']}" for s in stops[:-1])
    return "https://www.google.com/maps/dir/?" + urlencode(params, safe=",|")


def build_route(client, ctx: dict, dt: datetime, when_text: str, places: list[str],
                cache: dict) -> None:
    if not places:
        return
    print("\nTravel mode:  1 - walking   2 - car/taxi")
    mode = input("> ").strip()
    profile, travelmode = ("car", "driving") if mode == "2" else ("foot", "walking")
    keep = input("Keep my order? Enter = optimize (nearest first), y = keep: ").strip().lower() == "y"

    start = (ctx["lat"], ctx["lon"])
    stops, missing = [], []
    print("\nLocating the places on the map...")
    for p in places:
        s = cache.get(p)
        if not s:
            g = geocode(p, near=(ctx["lat"], ctx["lon"]))
            if g:
                s = {"query": p, "lat": g["lat"], "lon": g["lon"], "name": g["name"]}
        if s:
            stops.append(s)
            print(f"  OK  {p} -> {s['name'][:70]}")
        else:
            missing.append(p)
            print(f"  --  {p}: not found")
    if not stops:
        print("No places could be located.")
        return
    if not keep:
        stops = nearest_neighbour_order(start, stops)

    print("\nCalculating legs...")
    legs, points, total_m, total_s = [], [start] + [(s["lat"], s["lon"]) for s in stops], 0.0, 0.0
    names = ["Your location"] + [s["query"] for s in stops]
    for i in range(len(points) - 1):
        m, s, exact = leg_info(points[i], points[i + 1], profile)
        total_m += m
        total_s += s
        legs.append(f"{names[i]} -> {names[i + 1]}: {fmt_leg(m, s, exact)}")

    print("\n=== Route ===")
    for line in legs:
        print("  " + line)
    print(f"  Total travel: {total_m / 1000:.1f} km, ~{round(total_s / 60)} min")
    print(f"\nOpen in Google Maps:\n{maps_link(start, stops, travelmode)}")

    prompt = (
        f"User's start point: {ctx['place']}.\n"
        f"Start date and time: {when_text}.\n"
        f"Travel mode: {travelmode}.\n"
        "Planned stops in this order, with travel legs between them:\n"
        + "\n".join(f"- {l}" for l in legs)
        + (f"\nCould not be located (mention them): {', '.join(missing)}" if missing else "")
        + "\n\nBuild a realistic timeline: arrival/departure at each stop, using the travel times. "
        "Flag anything that may be closed at the planned arrival. If a different order would work "
        "better, say so. Keep it short."
    )
    print("\nPlanning the timeline...\n")
    print(ask_gemini(client, prompt))


# ---------- Q&A over found places ----------

def qa_loop(client, ctx, region: str, when_text: str, top: list[dict]) -> None:
    """Interactive follow-up questions about the found places."""
    if not top:
        return
    print(
        "\nYou can now ask anything about these places "
        "(e.g. 'does #2 have vegan food?', 'is #3 open on Sunday?', "
        "'how much for two at #1?').\n"
        "Prefix with a number to focus on one place (e.g. '2 vegan?'). "
        "Empty line / 'q' = done."
    )
    while True:
        try:
            question = input("\nQ> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not question or question.lower() in ("q", "quit", "exit"):
            break

        focus = ""
        m = re.match(r"^\s*#?(\d{1,2})\b(.*)$", question)
        if m and 1 <= int(m.group(1)) <= len(top):
            p = top[int(m.group(1)) - 1]
            focus = (
                f"Focus on: {p['name']} ({p['kind_ru']}), "
                f"address: {p.get('address') or 'district ' + region}, "
                f"coords {p['lat']:.5f},{p['lon']:.5f}, "
                f"OSM hours: {p.get('hours') or 'not in OSM'}, "
                f"website: {p.get('website') or 'none'}"
                + (", entry: free" if p.get("free") else "")
                + ".\n"
            )
            question = m.group(2).strip() or f"Tell me more about {p['name']}."

        web_ctx = ""
        try:
            q = f"{region} Azerbaijan {question}"
            web = web_search(q, n=4)
            if web:
                web_ctx = web_block(enrich_results(web, top_n=2))
        except Exception as e:
            print(f"[web lookup failed: {e}]")

        prompt = (
            f"User's location: {ctx['place']}.\n"
            f"Region: {region}. Planned visit: {when_text}.\n"
            f"{focus}"
            f"User's question: {question}\n\n"
            f"{web_ctx}\n\n"
            "Answer briefly and concretely in English. Use the web data when relevant. "
            "Parks/gardens/viewpoints/squares are free — say so. If a price is not in the "
            "data, give a realistic estimate in AZN and mark it 'estimate'. "
            "Never write 'address not in OSM'."
        )
        print()
        print(ask_gemini(client, prompt))


# ---------- modes ----------

def mode_plans(client, ctx):
    dt, when_text = ask_datetime(ctx)
    print("\nEnter places or events one by one. Type q when done.\n")
    places = []
    while True:
        line = input(f"Place {len(places) + 1}: ").strip()
        if line.lower() == "q":
            break
        if line:
            places.append(line)
    if not places:
        print("Empty list.")
        return

    region = ctx.get("region_name") or "Azerbaijan"
    print(f"\nSearching across {region}...\n")
    blocks, cache, corrections_log = [], {}, []
    weekday = dt.strftime("%A")

    for i, q in enumerate(places, 1):
        print(f"\n--- {i}. {q} ---")
        print("   Checking the name...")
        corr = autocorrect_name(client, q, ctx)
        if corr["confidence"] >= 0.6 and corr["corrected"].lower() != q.lower():
            print(f"   → Did you mean: {corr['corrected']} "
                  f"(confidence {corr['confidence']:.2f}, type: {corr['type']})")
            if corr["venue"]:
                print(f"   → Venue: {corr['venue']}")
            corrections_log.append({"original": q, "result": corr})

        search_name = corr["corrected"] if corr["confidence"] >= 0.6 else q

        q_en = f"{search_name} {region} Azerbaijan opening hours {weekday} ticket price AZN"
        q_az = f"{search_name} {region} Azərbaycan bilet qiyməti saatlar"
        web = web_search(q_en, n=5) + web_search(q_az, n=3)
        web = enrich_results(web, top_n=3)
        print(f"   {len(web)} web results")

        coords = smart_geocode(client, q, ctx, corr)
        if coords:
            cache[q] = {"query": q, "lat": coords["lat"], "lon": coords["lon"],
                        "name": coords["name"]}
            print(f"   Located: {coords['name'][:60]}")
        else:
            print(f"   Could not locate automatically")
            manual = input(f"   Address or coords for {q!r} (or Enter to skip): ").strip()
            if manual:
                c = parse_coords(manual)
                if c:
                    cache[q] = {"query": q, "lat": c[0], "lon": c[1], "name": manual}
                else:
                    g = geocode(manual, near=(ctx["lat"], ctx["lon"]))
                    if g:
                        cache[q] = {"query": q, "lat": g["lat"], "lon": g["lon"], "name": g["name"]}
                        print(f"   OK: {g['name'][:60]}")
                    else:
                        print(f"   Still not found, skipping")

        note = ""
        if corr["confidence"] >= 0.5 and corr["corrected"].lower() != q.lower():
            note = (f"\nName correction: user typed {q!r}, probably means "
                    f"{corr['corrected']!r} (type: {corr['type']}).")
        blocks.append(f"### {i}. {q}{note}\n{web_block(web)}")

    if corrections_log:
        print("\nPlease confirm the corrections:")
        for entry in corrections_log:
            ans = input(f"  {entry['original']!r} → {entry['result']['corrected']!r}? y/n: ").strip().lower()
            if ans == "n":
                fixed = input("  Enter the correct name: ").strip()
                if fixed:
                    old = entry["original"]
                    for j, b in enumerate(blocks):
                        if b.startswith("### ") and old in b.split("\n", 1)[0]:
                            blocks[j] = b.replace(old, fixed, 1)
                            break
                    if old in cache:
                        cache[fixed] = cache.pop(old)
                        cache[fixed]["query"] = fixed
                    if old in places:
                        places[places.index(old)] = fixed

    prompt = (
        f"User's location: {ctx['place']}.\n"
        f"Region of interest: {region}.\n"
        f"Planned visit: {when_text}.\n\n"
        "Below is web data for each place or event.\n\n"
        + "\n\n".join(blocks)
        + "\n\nFor EACH item, write: is it open at the planned time, hours that day, and ticket/"
        "entry/average price. "
        "If hours are not found, say 'typical: <hours>' (still mark it typical). "
        "If a price is not found, give a realistic estimate in AZN and mark it 'estimate'. "
        "Parks, gardens, viewpoints, squares and streets are free — say 'free'. "
        "Never write 'address not in OSM'. "
        "Numbered list, same numbering."
    )
    print("\nAssembling the answer...\n")
    print(ask_gemini(client, prompt))

    if input("\nBuild a route for these places? Enter = yes, n = no: ").strip().lower() != "n":
        build_route(client, ctx, dt, when_text, places, cache)


def mode_where_to_go(client, ctx):
    """Mode 2: real venues from OpenStreetMap + advice from Gemini + follow-up Q&A."""
    dt, when_text = ask_datetime(ctx)

    region = ctx.get("region_name") or "Azerbaijan"
    if ctx.get("region_key") and ctx["region_key"] in REGIONS:
        rlat, rlon = REGIONS[ctx["region_key"]][1], REGIONS[ctx["region_key"]][2]
    elif ctx.get("region_key") == "__whole__":
        rlat, rlon = WHOLE_COUNTRY[1], WHOLE_COUNTRY[2]
    else:
        rlat, rlon = ctx["lat"], ctx["lon"]

    radius = input("Search radius, km (Enter = 5, 0 = 20 km): ").strip() or "5"
    try:
        radius_km = float(radius.replace(",", "."))
    except ValueError:
        radius_km = 5.0
    if radius_km <= 0:
        radius_km = 20.0
    radius_m = int(radius_km * 1000)

    wishes = input(
        "What are you in the mood for? (e.g. 'food', 'museums', 'parks', 'anything') - Enter = anything: "
    ).strip().lower()

    if any(w in wishes for w in ("food", "eat", "restaurant", "cafe", "coffee", "bar", "drink", "dinner", "lunch")):
        kinds = ["restaurant", "cafe", "fast_food", "bar", "pub"]
    elif any(w in wishes for w in ("museum", "history", "culture")):
        kinds = ["museum", "artwork", "theatre"]
    elif any(w in wishes for w in ("park", "walk", "nature", "garden")):
        kinds = ["park", "garden", "viewpoint"]
    elif any(w in wishes for w in ("shop", "mall", "buy")):
        kinds = ["mall"]
    else:
        kinds = list(DEFAULT_KINDS.keys())

    print(f"\nAsking OpenStreetMap for real places near {region} ({radius_km:.0f} km, "
          f"kinds: {', '.join(kinds)})...")
    places = find_places_overpass(rlat, rlon, radius_m=radius_m, kinds=kinds, limit=80)
    print(f"  {len(places)} venues found in OSM")

    if not places:
        print("\nOSM has no venues for this area with these filters.")
        print("Try a bigger radius, another region, or 'anything' as the mood.")
        return

    places = [p for p in places if p["name"]][:40]

    print("\nLooking up prices and extra info on the web for the top candidates...")
    for p in places[:6]:
        q = f"{p['name']} {region} Azerbaijan price menu hours AZN"
        web = web_search(q, n=3)
        p["web"] = web
        print(f"  {p['name']}: {len(web)} web results")

    osm_text = osm_block(places)
    web_parts = []
    for p in places[:6]:
        if p.get("web"):
            web_parts.append(f"### {p['name']}\n" + web_block(p["web"]))
    web_text = "\n\n".join(web_parts) if web_parts else "Web results: NONE"

    prompt = (
        f"User's location: {ctx['place']}.\n"
        f"Region of interest: {region}.\n"
        f"Planned visit: {when_text}.\n"
        f"Mood / preference: {wishes or 'anything'}.\n"
        f"Search radius: {radius_km:.0f} km.\n\n"
        "Below are REAL venues from OpenStreetMap (source of truth for name, address, "
        "coordinates, and hours where present). Use them. Do NOT invent places or categories.\n\n"
        + osm_text
        + "\n\nExtra web data for some of them (prices, menus, hours):\n\n"
        + web_text
        + "\n\nNow write a short, useful recommendation list. For each of the 5-7 best options:\n"
        "- name and what it is\n"
        "- address (if OSM has one; if not, name the district/city or the nearest landmark — "
        "NEVER write 'address not in OSM' or 'address unknown')\n"
        "- distance from the user's location (use the OSM dist value)\n"
        "- opening hours (OSM if present; otherwise typical hours marked 'typical')\n"
        "- price: free for parks, gardens, viewpoints, squares, streets. Otherwise use the web "
        "price if found, else a realistic estimate marked 'estimate'.\n"
        "- one short sentence: why it fits the mood.\n\n"
        "Do not pad the list with vague entries. If fewer than 5 real venues fit, say so."
    )
    print("\nAsking Gemini to summarise...\n")
    answer = ask_gemini(client, prompt)
    print(answer)

    top = places[:7]
    print("\nOptions:")
    for i, p in enumerate(top, 1):
        addr = p.get("address") or (p.get("kind_ru") or "place")
        free_tag = " | free" if p.get("free") else ""
        print(f"  {i}. {p['name']} - {p['kind_ru']} - {p['dist_m']/1000:.2f} km - {addr}{free_tag}")

    # Q&A over the found places
    qa_loop(client, ctx, region, when_text, top)

    pick = input("\nType numbers to build a route (comma-separated), or Enter to skip.\n> ").strip()
    if not pick:
        return
    chosen = []
    for token in (t.strip() for t in pick.split(",") if t.strip()):
        if token.isdigit() and 1 <= int(token) <= len(top):
            p = top[int(token) - 1]
            chosen.append(p["name"])
    if not chosen:
        return

    cache = {}
    for p in top:
        if p["name"] in chosen:
            cache[p["name"]] = {
                "query": p["name"], "lat": p["lat"], "lon": p["lon"], "name": p["name"],
            }
    build_route(client, ctx, dt, when_text, chosen, cache)


def check_ascii(name: str, value: str, secret: bool) -> None:
    bad = [c for c in value if not c.isascii() or c.isspace()]
    if bad:
        shown = "hidden" if secret else value
        sys.exit(
            f"{name} in .env contains non-ASCII or whitespace characters ({shown}). "
            "Retype by hand: latin letters, digits, '-' and '_' only, no quotes."
        )


def main():
    global API_KEY, MODEL
    if not API_KEY:
        sys.exit("GEMINI_API_KEY is missing. Create a .env file.")
    API_KEY = API_KEY.strip().strip("\"'")
    MODEL = MODEL.strip().strip("\"'")
    check_ascii("GEMINI_API_KEY", API_KEY, True)
    check_ascii("GEMINI_MODEL", MODEL, False)
    client = genai.Client(api_key=API_KEY)

    print("=== City Helper (Azerbaijan) ===")
    print(f"Web search: DuckDuckGo" + (f" + SearXNG ({SEARXNG_URL})" if SEARXNG_URL else ""))
    print(f"Places source: OpenStreetMap (Overpass API)")
    print(f"Gemini model: {MODEL}")
    ctx = setup_context()

    while True:
        print(f"\nRegion: {ctx.get('region_name') or '?'}  |  You: {ctx['label'][:60]}")
        print(
            "\nMode:\n"
            "  1 - Plans (check places/events: open/closed + prices, then route)\n"
            "  2 - Where to go (real venues from OSM + advice + Q&A, then route)\n"
            "  3 - Change my location\n"
            "  4 - Change region\n"
            "  0 - Exit"
        )
        choice = input("> ").strip()
        if choice == "1":
            mode_plans(client, ctx)
        elif choice == "2":
            mode_where_to_go(client, ctx)
        elif choice == "3":
            try:
                LOCATION_CACHE.unlink()
            except OSError:
                pass
            ctx = setup_context()
        elif choice == "4":
            region_key, region_name, _, _, _ = pick_region()
            ctx["region_key"] = region_key
            ctx["region_name"] = region_name
        elif choice in ("0", "q", "exit"):
            break
        else:
            print("Enter 1, 2, 3, 4 or 0.")


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print("\nBye!")