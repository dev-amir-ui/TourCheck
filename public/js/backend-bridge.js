/* TourCheck backend bridge: results from /api/* rendered as live-cards + reservation */
(function () {
  const API = location.protocol === "file:" ? "http://127.0.0.1:8000" : "";
  const g = id => document.getElementById(id);
  const $ = g;
  const L = {
    az: { find: "Yer axtar", check: "Adları yoxla", run1: "Yerlər axtarılır…", run2: "Qiymət və saatlar yoxlanılır… (10–30 san)", checking: "yoxlanılır…", noGeo: "Brauzer yer təyinatını dəstəkləmir", geoDenied: "Marşrut sizin real yerinizdən qurulur — brauzerdə yerə icazə verin", est: "təxmini", estHint: "Mənbədə qiymət tapılmadı — təxmini qiymət", estNote: "təxmini qiymət", stepPlaces: "① Yerlər", stepPrices: "② Qiymət və saatlar", done: "✅ Hazırdır", foundN: "yer tapıldı", enrichFail: "Qiymət/saat tapılmadı", loc: "📍 Mənim yerim", ph: "Yer adları (hər sətirdə biri) — yoxlamaq üçün, və ya əhval: muzey, yemək, park…",
      when: "Nə vaxt? (məs. sabah 19:00)", run: "Axtarılır… 20–60 san çəkə bilər", none: "Yer tapılmadı (və ya OpenStreetMap məşğuldur — bir az sonra yenidən cəhd edin)", err: "Xəta: ", geo: "Yer müəyyən edildi",
      hint: "Region seçin və «Axtar» düyməsini basın, ya da yer adlarını yazıb «Yoxla» basın.", start: "Hələ axtarış edilməyib",
      route: "Marşrut qur", walk: "Piyada", car: "Maşın", reserve: "Rezerv et", price: "Qiymət", noPrice: "qiymət tapılmadı", free: "Pulsuz",
      atVenue: "məkanda ödəniş", open: "açıq", closed: "bağlı", noHours: "saat tapılmadı", noPick: "Marşrut üçün yer seçin" },
    en: { find: "Find places", check: "Check names", run1: "Looking for places…", run2: "Checking prices and hours… (10–30 s)", checking: "checking…", noGeo: "This browser has no geolocation", geoDenied: "The route starts from your real location — please allow location access in the browser", est: "estimate", estHint: "No price found in sources — estimated", estNote: "estimated price", stepPlaces: "① Places", stepPrices: "② Prices & hours", done: "✅ Done", foundN: "places found", enrichFail: "Prices/hours unavailable", loc: "📍 My location", ph: "Place names (one per line) to check, or a mood: museums, food, parks…",
      when: "When? (e.g. tomorrow 7pm)", run: "Searching… may take 20–60 s", none: "Nothing found (or OpenStreetMap is busy — try again in a moment)", err: "Error: ", geo: "Location set",
      hint: "Pick a region and press “Search”, or type place names and press “Check”.", start: "No search yet",
      route: "Build route", walk: "Walking", car: "Car", reserve: "Reserve", price: "Price", noPrice: "price not found", free: "Free",
      atVenue: "pay at venue", open: "open", closed: "closed", noHours: "hours not found", noPick: "Select places for the route" },
    ru: { find: "Найти места", check: "Проверить названия", run1: "Ищем места…", run2: "Проверяем цены и часы… (10–30 с)", checking: "проверяем…", noGeo: "Браузер не поддерживает геолокацию", geoDenied: "Маршрут строится от вашего реального местоположения — разрешите доступ к геопозиции в браузере", est: "примерно", estHint: "Цена в источниках не найдена — примерная", estNote: "примерная цена", stepPlaces: "① Места", stepPrices: "② Цены и часы", done: "✅ Готово", foundN: "мест найдено", enrichFail: "Цены/часы недоступны", loc: "📍 Моё место", ph: "Названия мест (по одному в строке) для проверки, или настроение: музеи, еда, парки…",
      when: "Когда? (напр. завтра 19:00)", run: "Ищем… может занять 20–60 с", none: "Ничего не найдено (или OpenStreetMap занят — попробуйте ещё раз)", err: "Ошибка: ", geo: "Местоположение задано",
      hint: "Выберите регион и нажмите «Искать», либо впишите названия мест и нажмите «Проверить».", start: "Поиск ещё не выполнялся",
      route: "Построить маршрут", walk: "Пешком", car: "Машина", reserve: "Резерв", price: "Цена", noPrice: "цена не найдена", free: "Бесплатно",
      atVenue: "оплата на месте", open: "открыто", closed: "закрыто", noHours: "часы не найдены", noPick: "Отметьте места для маршрута" }
  };
  const tx = k => (L[currentLang] || L.az)[k];
  const MOOD = { "": "", adventure: "attraction", nature: "park nature", culture: "museum culture", relax: "food cafe", family: "park" };
  const HAV = (a, b) => { const r = Math.PI / 180, dl = (b.lat - a.lat) * r, dn = (b.lon - a.lon) * r;
    const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
  const ICON = { restaurant: "🍽", cafe: "☕", fast_food: "🍔", bar: "🍸", pub: "🍺", museum: "🏛", attraction: "⭐", artwork: "🎨",
    viewpoint: "🌄", park: "🌳", garden: "🌷", theatre: "🎭", cinema: "🎬", mall: "🛍" };
  let items = [], answer = "", pos = null, busy = false, regions = [];

  /* the user's real position: start of every route and the base for "km from you" */
  function getPos() {
    return new Promise((res, rej) => {
      if (pos) return res(pos);
      if (!navigator.geolocation) return rej(new Error(tx("noGeo")));
      navigator.geolocation.getCurrentPosition(
        p => { pos = { lat: p.coords.latitude, lon: p.coords.longitude }; render(); res(pos); },
        () => rej(new Error(tx("geoDenied"))), { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
    });
  }

  const fmt = s => escapeHTML(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const hash = str => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36);

  async function post(path, body) {
    const r = await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(((await r.json().catch(() => ({}))).detail) || r.status);
    return r.json();
  }

  function card(p, persons) {
    const i = items.indexOf(p);
    const price = p.loading ? `<strong class="ai-noprice ai-shimmer">⏳ ${tx("checking")}</strong>`
      : p.price == null ? `<strong class="ai-noprice">${tx("noPrice")}</strong>`
      : p.price === 0 ? `<strong>${tx("free")}</strong>`
      : p.estimated ? `<strong>~${money(p.price)}</strong><small class="savings-tag" title="${tx("estHint")}">${tx("est")}</small>` + (persons > 1 ? `<small class="savings-tag">×${persons} ≈ ${money(p.price * persons)}</small>` : "")
      : `<strong>${money(p.price)}</strong>` + (persons > 1 ? `<small class="savings-tag">×${persons} = ${money(p.price * persons)}</small>` : "");
    const st = p.open === true ? `✅ ${tx("open")}` : p.open === false ? `⛔ ${tx("closed")}` : "";
    const where = pos && p.lat != null ? `${HAV(pos, p).toFixed(1)} km` : "";
    return `<div class="live-card">
      <div class="live-card-img ph" style="background-image:linear-gradient(135deg,var(--primary),var(--primary-light))">${ICON[p.kind] || "📍"}
        ${p.kind_ru ? `<span class="live-card-badge">${escapeHTML(p.kind_ru)}</span>` : ""}
        ${st ? `<span class="live-card-rating">${st}</span>` : ""}</div>
      <div class="live-card-body">
        <h4>${escapeHTML(p.name)}</h4>
        <p class="live-card-desc">${escapeHTML(String(p.address || p.kind_ru || "").slice(0, 90))}</p>
        <div class="live-card-meta"><span>🕒 ${p.loading ? '<i class="ai-shimmer">⏳</i>' : escapeHTML(p.hours ? String(p.hours).slice(0, 40) : tx("noHours"))}</span>${where ? `<span>📍 ${escapeHTML(where)}</span>` : ""}</div>
        <div class="live-card-footer">
          <div class="live-card-price">${price}</div>
          <div class="live-card-actions">
            <label class="ai-pick" title="${tx("route")}"><input type="checkbox" data-route="${i}" ${p.lat != null ? "checked" : "disabled"}> 🗺</label>
            <button type="button" class="btn btn-sm btn-primary" data-reserve="${i}">${tx("reserve")}</button>
          </div>
        </div>
      </div></div>`;
  }

  function render() {
    if (!g("liveMatches")) return;
    const budget = Number(g("liveBudgetNumber").value) || 50;
    const persons = Number(g("livePersons").value) || 1;
    const shown = items.filter(p => p.price == null || p.price <= budget);
    if (pos) shown.sort((a, b) => (a.lat == null) - (b.lat == null) || (a.lat == null ? 0 : HAV(pos, a) - HAV(pos, b)));
    const pct = items.length ? Math.round(shown.length / items.length * 100) : 0;
    const loading = items.some(p => p.loading);
    g("liveMatchCount").textContent = !items.length ? tx("start")
      : loading ? `${items.length} ${tx("foundN")} — ${tx("checking")}` : `${shown.length} ${t("liveBudgetMatchFound")}`;
    g("liveMatchScore").textContent = loading || !items.length ? "…" : pct + "%";
    g("liveMatchGauge").classList.toggle("loading", loading);
    g("liveMatchGauge").style.width = Math.max(5, loading ? 100 : pct) + "%";
    g("liveMatchTip").innerHTML = loading ? `<span class="ai-shimmer">⏳ ${escapeHTML(tx("run2"))}</span>`
      : answer ? `<strong>${t("liveBudgetTip")}:</strong>\n${fmt(answer)}` : escapeHTML(tx("hint"));
    g("liveMatches").innerHTML = shown.length ? shown.map(p => card(p, persons)).join("")
      : `<div class="empty-live-box"><div class="empty-icon">🔍</div><p>${items.length ? t("liveNoMatch") : escapeHTML(tx("hint"))}</p></div>`;
    g("aiRouteRow").hidden = !shown.some(p => p.lat != null);
    g("aiRoute").innerHTML = ""; g("liveMatches").classList.remove("shrink");
  }

  const base = () => ({ region: g("liveRegion").value || "baku", when: g("aiWhen").value, lang: currentLang });
  const status = m => { g("aiStatus").textContent = m; };

  /* step 1 (fast): places appear at once; step 2 (slow): prices/hours/advice fill in */
  let doneTimer;
  function progress(stage, msg) {   // 0 hidden, 1 places, 2 prices, 3 done, -1 error
    const box = g("aiProgress"); clearTimeout(doneTimer);
    box.hidden = stage === 0; box.dataset.stage = stage;
    if (stage === 0) return;
    g("aiProgText").textContent = stage === 1 ? tx("run1") : stage === 2 ? tx("run2") : stage === 3 ? tx("done") : msg;
    g("aiStep1").className = stage === 1 ? "active" : stage > 1 ? "done" : "";
    g("aiStep2").className = stage === 2 ? "active" : stage === 3 ? "done" : "";
    if (stage === 3) doneTimer = setTimeout(() => progress(0), 3500);
  }
  function setBusy(on, mode) {
    ["aiFindBtn", "aiCheckBtn"].forEach(id => { g(id).disabled = on; g(id).classList.remove("is-busy"); });
    if (on) g(mode === "find" ? "aiFindBtn" : "aiCheckBtn").classList.add("is-busy");
  }

  /* step 1 (fast): places appear at once; step 2 (slow): prices/hours/advice fill in */
  async function search(mode) {
    if (busy) return;
    const names = g("aiInput").value.split("\n").map(x => x.trim()).filter(Boolean);
    if (mode === "check" && !names.length) return;
    getPos().catch(() => {});
    busy = true; answer = ""; items = []; status(""); setBusy(true, mode); render(); progress(1);
    g("aiProgress").scrollIntoView({ behavior: "smooth", block: "nearest" });
    try {
      const d = mode === "check"
        ? await post("/api/locate", { region: base().region, places: names })
        : await post("/api/places", { region: base().region, radius_km: Number(g("aiRadius").value) || 5,
            mood: g("aiInput").value.trim() || MOOD[g("liveVibe").value] || "" });
      const list = d.items || d.places || [];
      if (!list.length) { progress(-1, tx("none")); return; }
      items = list.map(p => ({ ...p, loading: true })); render(); progress(2);
      try {
        const e = await post("/api/enrich", { items: list, ...base(), deep: mode === "check" });
        items = e.items; answer = e.answer || "";
        e.failed ? progress(-1, tx("enrichFail")) : progress(3);
      } catch (err) {
        items = list; progress(-1, tx("enrichFail") + " (" + err.message + ")");
      }
      render();
    } catch (err) { progress(-1, tx("err") + err.message); }
    finally { busy = false; setBusy(false); }
  }
  g("aiFindBtn").onclick = () => search("find");
  g("aiCheckBtn").onclick = () => search("check");
  g("aiLocBtn").onclick = () => getPos().then(() => status(tx("geo"))).catch(e => status(e.message));

  g("aiRouteBtn").onclick = async () => {
    const picked = [...g("liveMatches").querySelectorAll("[data-route]:checked")].map(c => items[+c.dataset.route]).filter(p => p.lat != null);
    if (!picked.length) { g("aiStatus").textContent = tx("noPick"); return; }
    try {
      const start = await getPos();
      const d = await post("/api/route", { ...start, stops: picked.map(s => ({ name: s.name, lat: s.lat, lon: s.lon })), mode: g("aiMode").value });
      const first = tx("loc");
      const nodes = d.legs.map((l, i) => `
        <li class="rt-leg"><div class="rt-line"><i></i></div><span>${l.text ? escapeHTML(l.text) : ""}</span></li>
        <li class="rt-node"><div class="rt-dot">${i + 1}</div><div class="rt-name">${escapeHTML(l.to)}</div></li>`).join("");
      g("liveMatches").classList.add("shrink");
      g("aiRoute").innerHTML = `<div class="rt-card">
        <div class="rt-head"><div class="rt-total">${g("aiMode").value === "car" ? "🚗" : "🚶"} ${escapeHTML(d.total)}</div></div>
        <ul class="rt-list">
          <li class="rt-node start"><div class="rt-dot">📍</div><div class="rt-name">${escapeHTML(first)}</div></li>${nodes}
        </ul>
        <div class="rt-actions"><a class="btn btn-primary" href="${escapeHTML(d.maps_url)}" target="_blank" rel="noopener">Google Maps ↗</a></div>
      </div>`;
      g("aiRoute").scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (e) { g("aiStatus").textContent = e.message; }
  };

  /* reservation: reuses the site's own booking modal, Store and ticket */
  function reserve(s) {
    const persons = Math.min(20, Math.max(1, Number(g("livePersons").value) || 1));
    const tour = { id: "ext-" + hash(s.name), name: s.name, city: g("liveRegion").selectedOptions[0]?.text || "",
      place: (s.address || s.name) + (s.price == null ? " • " + tx("atVenue") : s.estimated ? " • " + tx("estNote") : ""), price: s.price || 0, capacity: 20, external: true };
    currentBookingSlot = { tour, date: "", time: "", left: tour.capacity };
    $("bookModalTourName").textContent = s.name;
    $("bookModalMeta").textContent = tour.city;
    $("bookModalAvailable").innerHTML = s.price == null ? `${tx("noPrice")} — ${tx("atVenue")}` : s.price === 0 ? tx("free") : `${tx("price")}: <strong>${s.estimated ? "~" : ""}${s.price} ₼</strong>${s.estimated ? " (" + tx("est") + ")" : ""}`;
    $("bSeats").max = 20; $("bSeats").value = persons; $("bName").value = ""; $("bPhone").value = ""; $("bError").hidden = true;
    $("bDate").value = toISODate(new Date()); $("bDate").min = $("bDate").value;
    $("bExtWhen").hidden = false;
    updateBookingModalTotal();
    const m = $("bookingModal"); m.classList.add("active"); m.hidden = false;
  }
  g("liveMatches").addEventListener("click", e => {
    const b = e.target.closest("[data-reserve]"); if (b) reserve(items[+b.dataset.reserve]);
  });

  function labels() {
    g("aiInput").placeholder = tx("ph"); g("aiWhen").placeholder = tx("when");
    g("aiFindBtn").textContent = tx("find"); g("aiCheckBtn").textContent = tx("check");
    g("aiLocBtn").textContent = tx("loc");
    g("aiStep1").textContent = tx("stepPlaces"); g("aiStep2").textContent = tx("stepPrices"); g("aiRouteBtn").textContent = tx("route");
    g("aiMode").innerHTML = `<option value="walk">${tx("walk")}</option><option value="car">${tx("car")}</option>`;
  }
  fetch(API + "/api/regions").then(r => r.json()).then(rs => {
    regions = rs.filter(r => r.key !== "__whole__");
    g("liveRegion").innerHTML = regions.map(r => `<option value="${r.key}">${escapeHTML(r.name)}</option>`).join("");
  }).catch(() => { g("aiStatus").textContent = tx("err") + "backend"; });

  window.TCLive = { render };
  const orig = window.setLanguage;
  window.setLanguage = function () { const r = orig.apply(this, arguments); labels(); render(); return r; };
  labels(); render();
})();
