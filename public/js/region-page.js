function closeRegionPage(fromPop){
  const el = document.getElementById("regionPage");
  if (el) el.remove();
  document.body.style.overflow = "";
  if (!fromPop && history.state && history.state.region) { try { history.back(); } catch(e){} }
}
window.addEventListener("popstate", () => { const el = document.getElementById("regionPage"); if (el) { el.remove(); document.body.style.overflow = ""; } });
document.addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("regionPage")) closeRegionPage(); });

function openRegionPage(id){
  const r = REGIONS_DATA.find(x => x.id === id); if (!r) return;
  const T = {
    az: { back: "← Geri", places: "Məkanlar", search: "Bu bölgədə tur axtar" },
    en: { back: "← Back", places: "Places to visit", search: "Search tours here" },
    ru: { back: "← Назад", places: "Места для посещения", search: "Искать туры здесь" }
  };
  const L = T[currentLang] || T.az;
  const places = r.places || [];
  const w = r.weather || {};
  const old = document.getElementById("regionPage"); if (old) old.remove();
  const ov = document.createElement("div");
  ov.id = "regionPage"; ov.className = "rpage";
  ov.innerHTML = `
    <div class="rpage-hero" style="background-image:url('${escapeHTML(r.image || "")}')">
      <div class="rpage-shade"></div>
      <div class="rpage-hero-in">
        <button type="button" class="rpage-back">${L.back}</button>
        <span class="rpage-tag">${escapeHTML(r.tag || "")}</span>
        <h1>${escapeHTML(r.name)}</h1>
        <p>${escapeHTML(r.desc || "")}</p>
        ${w.temp ? `<span class="rpage-weather">${escapeHTML(w.icon || "")} ${escapeHTML(w.temp)} · ${escapeHTML(w.text || "")}</span>` : ""}
      </div>
    </div>
    <div class="rpage-body">
      <div class="rpage-head">
        <h2>📍 ${L.places} <span>(${places.length})</span></h2>
        <button type="button" class="rpage-go">${L.search} →</button>
      </div>
      <div class="rpage-grid">
        ${places.map((p, i) => `
          <article class="rpage-place">
            <span class="rpage-num">${i + 1}</span>
            <div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description || "")}</p></div>
          </article>`).join("")}
      </div>
    </div>`;
  document.body.appendChild(ov);
  document.body.style.overflow = "hidden";
  ov.scrollTop = 0;
  try { history.pushState({ region: id }, "", "#region-" + id); } catch (e) {}
  ov.querySelector(".rpage-back").onclick = () => closeRegionPage();
  ov.querySelector(".rpage-go").onclick = () => {
    const KEY = { baku: "baku", quba: "quba", gabala: "gabala", sheki: "sheki", lenkeran: "lankaran", shusha: "shusha", ismayilli: "ismayilli" };
    const k = r.liveKey || KEY[r.id];
    closeRegionPage();
    const sel = document.getElementById("liveRegion");
    if (sel && k) sel.value = k;
    const sec = document.getElementById("liveCheck");
    if (sec) setTimeout(() => sec.scrollIntoView({ behavior: "smooth" }), 80);
  };
}
function openRegionPlaces(id){ openRegionPage(id); }
