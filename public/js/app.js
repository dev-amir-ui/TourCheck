/* TourCheck — Əsas Tətbiq Məntiqi */

const $ = id => document.getElementById(id);

let currentTourForModal = null;
let currentBookingSlot = null;
let activeCategoryFilter = "";

function init() {
  // Theme init
  const savedTheme = Store.getTheme();
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  // Year init
  const yearEl = $("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Populate Filter Dropdowns
  populateFilters();

  // Attach Event Listeners
  setupEventListeners();

  // Set default language & render page
  setLanguage(currentLang);

  // Initialize Calculator
  updateCalculator();

  // Render Wishlist badge
  updateWishlistBadge();

  // Render Bookings
  renderBookings();
}

function populateFilters() {
  const citySelect = $("fCity");
  const catSelect = $("fCategory");
  const dateSelect = $("fDate");
  const liveRegionSelect = $("liveRegion");

  if (!citySelect || !catSelect || !dateSelect) return;

  const cities = [...new Set(TOURS.map(t => t.city))].sort();
  const cats = [...new Set(TOURS.map(t => t.category))].sort();

  // Clear previous options except first
  citySelect.innerHTML = `<option value="" data-i18n="allRegions">${t("allRegions")}</option>`;
  catSelect.innerHTML = `<option value="" data-i18n="allVibes">${t("allVibes")}</option>`;
  dateSelect.innerHTML = "";

  cities.forEach(c => {
    citySelect.add(new Option(c, c));
  });

  cats.forEach(c => catSelect.add(new Option(c, c)));

  nextDates(DAYS_AHEAD).forEach((d, i) => {
    const label = i === 0 ? `${t("DATE_LOCALES", {}) ? "Bu gün" : "Bu gün"} — ${formatDate(d)}` : formatDate(d);
    dateSelect.add(new Option(label, d));
  });

  const timeInput = $("fTime");
  if (timeInput) timeInput.value = "00:00";
}

function setupEventListeners() {
  // Theme toggle
  const themeToggle = $("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      Store.setTheme(next);
      updateThemeIcon(next);
    });
  }

  // Language buttons
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.lang);
      populateFilters();
      render();
      renderLiveChecker();
      renderRegions();
    });
  });

  // Search & Catalog Filter Events
  const searchForm = $("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", e => {
      e.preventDefault();
      render();
    });
  }

  const resetBtn = $("resetBtn");
  if (resetBtn) resetBtn.addEventListener("click", resetFilters);

  const searchInput = $("fSearch");
  if (searchInput) searchInput.addEventListener("input", debounce(render, 250));

  const sortSelect = $("fSort");
  if (sortSelect) sortSelect.addEventListener("change", render);

  ["fCity", "fCategory", "fDate", "fTime", "fSeats", "fPrice", "fOnlyAvail", "fEntranceInc"].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener("change", render);
  });

  // Price input synchronization with live typing
  const priceInput = $("fPrice");
  if (priceInput) priceInput.addEventListener("input", debounce(render, 300));

  // Quick Category Pills
  document.querySelectorAll(".cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategoryFilter = pill.dataset.cat || "";
      const catSelect = $("fCategory");
      if (catSelect) catSelect.value = activeCategoryFilter;
      render();
    });
  });

  // Live Budget Matcher events
  const budgetRange = $("liveBudgetRange");
  const budgetNumber = $("liveBudgetNumber");
  const liveRegion = $("liveRegion");
  const liveVibe = $("liveVibe");
  const livePersons = $("livePersons");

  if (budgetRange && budgetNumber) {
    budgetRange.addEventListener("input", () => {
      budgetNumber.value = budgetRange.value;
      renderLiveChecker();
    });
    budgetNumber.addEventListener("input", () => {
      budgetRange.value = budgetNumber.value;
      renderLiveChecker();
    });
  }

  // Budget Presets
  document.querySelectorAll(".budget-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".budget-preset").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const val = btn.dataset.budget;
      if (budgetRange) budgetRange.value = val;
      if (budgetNumber) budgetNumber.value = val;
      renderLiveChecker();
    });
  });

  if (liveRegion) liveRegion.addEventListener("change", renderLiveChecker);
  if (liveVibe) liveVibe.addEventListener("change", renderLiveChecker);
  if (livePersons) livePersons.addEventListener("change", renderLiveChecker);

  // Tour List interaction (Card clicks, slots, reserve, details, favorite)
  const tourList = $("tourList");
  if (tourList) {
    tourList.addEventListener("click", handleCatalogClick);
  }

  // Live Checker suggestions interaction
  const liveMatches = $("liveMatches");
  if (liveMatches) {
    liveMatches.addEventListener("click", handleCatalogClick);
  }

  // Calculator Inputs
  ["calcPersons", "calcTransport", "calcMeal", "calcGuide", "calcInsurance"].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener("change", updateCalculator);
    if (el && el.type === "number") el.addEventListener("input", updateCalculator);
  });

  // Modals management
  setupModals();

  // Wishlist Drawer
  setupWishlistDrawer();

  // Mobile navigation toggle
  const mobileMenuBtn = $("mobileMenuBtn");
  const navMenu = $("navMenu");
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("open");
      mobileMenuBtn.classList.toggle("open");
    });

    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        mobileMenuBtn.classList.remove("open");
      });
    });
  }
}

function updateThemeIcon(theme) {
  const icon = $("themeIcon");
  if (icon) {
    icon.textContent = theme === "dark" ? "☀️" : "🌙";
  }
}

/* ==========================================================================
   CANLI YOXLAMA (LIVE BUDGET & DESTINATION MATCHER)
   ========================================================================== */
function renderLiveChecker() {
  if (window.TCLive) window.TCLive.render();
}

/* ==========================================================================
   REGION SHOWCASE
   ========================================================================== */
function renderRegions() {
  const container = $("regionGrid");
  if (!container) return;

  container.innerHTML = REGIONS_DATA.map(reg => {
    const count = TOURS.filter(t => t.city.toLowerCase().includes(reg.name.toLowerCase().split(" ")[0]) || reg.name.toLowerCase().includes(t.city.toLowerCase())).length;

    return `
      <article class="region-card" data-id="${reg.id}" title="${escapeHTML(reg.name)}">
        <div class="region-card-media" style="background-image: url('${reg.image}')">
          <div class="region-card-overlay"></div>
          <div class="region-weather-badge">${reg.weather.icon} ${reg.weather.temp}</div>
          <span class="region-tag">${escapeHTML(reg.tag)}</span>
        </div>
        <div class="region-card-content">
          <h3>${escapeHTML(reg.name)}</h3>
          <p>${escapeHTML(reg.desc)}</p>
          <div class="region-card-footer">
            <span class="region-count">${({ az: "Burada axtar", en: "Search here", ru: "Искать здесь" })[currentLang] || "Search here"}</span>
            ${reg.places && reg.places.length ? `<button type="button" class="region-places-btn" data-places="${escapeHTML(reg.id)}">📍 ${reg.places.length}</button>` : ""}
            <span class="region-arrow">→</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  // Region card -> preselect it as the place to search and jump to the live search
  const KEY = { baku: "baku", quba: "quba", gabala: "gabala", sheki: "sheki", lenkeran: "lankaran", shusha: "shusha", ismayilli: "ismayilli" };
  container.querySelectorAll(".region-card").forEach(card => {
    card.addEventListener("click", (ev) => {
      const pb = ev.target.closest(".region-places-btn");
      const rg0 = REGIONS_DATA.find(r => r.id === card.dataset.id);
      if (rg0 && rg0.places && rg0.places.length) { ev.stopPropagation(); openRegionPage(rg0.id); return; }
      const sel = $("liveRegion");
      const rg = REGIONS_DATA.find(r => r.id === card.dataset.id);
      const k = (rg && rg.liveKey) || KEY[card.dataset.id];
      if (sel && k) sel.value = k;
      const sec = $("liveCheck");
      if (sec) sec.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* ==========================================================================
   CATALOG FILTER & RENDER
   ========================================================================== */
function resetFilters() {
  const sInput = $("fSearch");
  if (sInput) sInput.value = "";
  const city = $("fCity");
  if (city) city.value = "";
  const cat = $("fCategory");
  if (cat) cat.value = "";
  const date = $("fDate");
  if (date) date.selectedIndex = 0;
  const time = $("fTime");
  if (time) time.value = "00:00";
  const seats = $("fSeats");
  if (seats) seats.value = "1";
  const price = $("fPrice");
  if (price) price.value = "";
  const avail = $("fOnlyAvail");
  if (avail) avail.checked = true;
  const entrance = $("fEntranceInc");
  if (entrance) entrance.checked = false;
  const sort = $("fSort");
  if (sort) sort.value = "time";

  activeCategoryFilter = "";
  document.querySelectorAll(".cat-pill").forEach(p => p.classList.toggle("active", p.dataset.cat === ""));

  render();
}

function getFilteredResults() {
  const search = (($("fSearch") && $("fSearch").value) || "").toLowerCase().trim();
  const city = ($("fCity") && $("fCity").value) || "";
  const category = activeCategoryFilter || (($("fCategory") && $("fCategory").value) || "");
  const date = ($("fDate") && $("fDate").value) || nextDates(1)[0];
  const needSeats = Math.max(1, parseInt(($("fSeats") && $("fSeats").value) || "1", 10) || 1);
  const minTime = (($("fTime") && $("fTime").value) || "00:00");
  const maxPriceVal = ($("fPrice") && $("fPrice").value) || "";
  const maxPrice = maxPriceVal === "" ? Infinity : Number(maxPriceVal);
  const onlyAvail = $("fOnlyAvail") ? $("fOnlyAvail").checked : true;
  const onlyEntrance = $("fEntranceInc") ? $("fEntranceInc").checked : false;

  const results = [];

  TOURS.forEach(tour => {
    // Search keyword match
    if (search) {
      const tourTitle = getTourName(tour).toLowerCase();
      const tourDesc = getTourDesc(tour).toLowerCase();
      const matchCity = tour.city.toLowerCase();
      const matchPlace = tour.place.toLowerCase();
      if (!tourTitle.includes(search) && !tourDesc.includes(search) && !matchCity.includes(search) && !matchPlace.includes(search)) {
        return;
      }
    }

    // City match
    if (city && !tour.city.toLowerCase().includes(city.toLowerCase()) && !city.toLowerCase().includes(tour.city.toLowerCase())) {
      return;
    }

    // Category match
    if (category && tour.category !== category && tour.vibe !== category) {
      return;
    }

    // Entrance included filter
    if (onlyEntrance && !tour.entranceIncluded) {
      return;
    }

    // Price match
    if (tour.price > maxPrice) {
      return;
    }

    // Slots match & availability
    const slots = tour.times
      .filter(time => timeToMinutes(time) >= timeToMinutes(minTime))
      .filter(time => !isPast(date, time))
      .map(time => ({
        time,
        left: seatsLeft(tour, date, time)
      }))
      .filter(s => !onlyAvail || s.left >= needSeats);

    if (slots.length > 0) {
      results.push({ tour, slots });
    }
  });

  // Sorting
  const sort = $("fSort") ? $("fSort").value : "time";
  results.sort((a, b) => {
    if (sort === "price-low") return a.tour.price - b.tour.price;
    if (sort === "price-high") return b.tour.price - a.tour.price;
    if (sort === "rating") return b.tour.rating - a.tour.rating;
    if (sort === "seats") {
      const aSeats = a.slots.reduce((acc, s) => acc + s.left, 0);
      const bSeats = b.slots.reduce((acc, s) => acc + s.left, 0);
      return bSeats - aSeats;
    }
    // Default: earliest time
    return timeToMinutes(a.slots[0].time) - timeToMinutes(b.slots[0].time);
  });

  return results;
}

function render() {
  const date = $("fDate") ? $("fDate").value : "";
  const results = getFilteredResults();
  const listEl = $("tourList");
  const emptyEl = $("emptyState");
  const infoEl = $("resultInfo");

  if (!listEl || !emptyEl) return;

  const totalSlots = results.reduce((sum, r) => sum + r.slots.length, 0);

  emptyEl.hidden = results.length > 0;

  if (infoEl) {
    if (results.length > 0) {
      infoEl.innerHTML = `<strong>${formatDate(date)}</strong> — ${results.length} tur, ${totalSlots} aktiv seans tapıldı.`;
    } else {
      infoEl.textContent = "";
    }
  }

  listEl.innerHTML = results.map(({ tour, slots }) => {
    const isFav = Store.isFavorite(tour.id);
    return `
      <article class="tour-card" data-tour-id="${tour.id}">
        <div class="tour-card-image" style="background-image: url('${tour.image}')">
          <div class="tour-card-badge-group">
            <span class="badge badge-city">${escapeHTML(tour.city)}</span>
            <span class="badge badge-cat">${escapeHTML(tour.category)}</span>
            ${tour.isPopular ? `<span class="badge badge-pop">🔥 Populyar</span>` : ""}
          </div>
          <button class="wishlist-btn ${isFav ? "active" : ""}" data-action="favorite" data-tour="${tour.id}" aria-label="Sevimlilərə əlavə et">
            ${isFav ? "❤️" : "🤍"}
          </button>
        </div>

        <div class="tour-card-content">
          <div class="tour-card-header">
            <div class="tour-title-area">
              <h3>${escapeHTML(getTourName(tour))}</h3>
              <div class="tour-rating">
                <span class="star">★</span>
                <strong>${tour.rating}</strong>
                <span class="reviews-count">(${tour.reviews} rəy)</span>
              </div>
            </div>
            <div class="tour-price-box">
              <span class="price-val">${money(tour.price)}</span>
              <small class="price-sub">${t("perPerson")}</small>
            </div>
          </div>

          <p class="tour-desc">${escapeHTML(getTourDesc(tour))}</p>

          <div class="tour-highlights-chips">
            ${(tour.highlights || []).slice(0, 3).map(h => `<span class="chip">✓ ${escapeHTML(h)}</span>`).join("")}
          </div>

          <div class="tour-meta-grid">
            <div class="meta-item">
              <span class="meta-icon">📍</span>
              <span class="meta-text"><strong>${t("meetingPoint")}:</strong> ${escapeHTML(tour.place)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">⏱</span>
              <span class="meta-text"><strong>${t("duration")}:</strong> ${escapeHTML(tour.duration)}</span>
            </div>
            <div class="meta-item full">
              <span class="meta-icon">🎟</span>
              <span class="meta-text"><strong>${t("entranceInfo")}:</strong> ${escapeHTML(tour.entrance)}</span>
            </div>
          </div>

          <div class="tour-slots-section">
            <div class="slots-label">
              <span>📅 Canlı Seanslar və Boş Yerlər:</span>
            </div>
            <div class="slots-grid">
              ${slots.map(s => renderSlotHTML(tour, date, s)).join("")}
            </div>
          </div>

          <div class="tour-card-bottom-actions">
            <button class="btn btn-outline" data-action="details" data-tour="${tour.id}">
              ℹ️ ${t("btnDetails")}
            </button>
            <button class="btn btn-primary" data-action="reserve-first" data-tour="${tour.id}" data-date="${date}" data-time="${slots[0].time}">
              ⚡ ${t("btnReserve")} (${slots[0].time})
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderSlotHTML(tour, date, s) {
  const cls = s.left === 0 ? "none" : s.left <= 3 ? "low" : "ok";
  let label = "";

  if (s.left === 0) {
    label = t("seatsNone");
  } else if (s.left <= 3) {
    label = t("seatsLow", { n: s.left });
  } else {
    label = `${s.left} ${t("seatsAvailable")}`;
  }

  return `
    <div class="slot-pill ${cls}">
      <span class="slot-time">${s.time}</span>
      <span class="slot-badge">${label}</span>
      <button class="slot-btn" data-action="book" data-tour="${tour.id}" data-date="${date}" data-time="${s.time}" ${s.left === 0 ? "disabled" : ""}>
        ${s.left === 0 ? "Dolub" : "Rezerv"}
      </button>
    </div>
  `;
}

function handleCatalogClick(e) {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const tourId = target.dataset.tour;
  const date = target.dataset.date || ($("fDate") ? $("fDate").value : nextDates(1)[0]);
  const time = target.dataset.time || "08:00";
  const tour = TOURS.find(t => t.id === tourId);

  if (!tour) return;

  if (action === "favorite") {
    e.stopPropagation();
    const added = Store.toggleFavorite(tourId);
    showToast(added ? t("addedToWishlist") : t("removedFromWishlist"), "info");
    updateWishlistBadge();
    render();
    renderLiveChecker();
    renderWishlistDrawer();
  } else if (action === "details") {
    openTourDetailsModal(tour);
  } else if (action === "book" || action === "reserve-first" || action === "quickbook") {
    const chosenTime = target.dataset.time || tour.times[0];
    openBookingModal(tour, date, chosenTime);
  }
}

/* ==========================================================================
   MODALS (TOUR DETAILS & BOOKING)
   ========================================================================== */
function setupModals() {
  // Modal background clicks & Esc
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeAllModals();
    });
  });

  document.querySelectorAll(".modal-close-btn").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAllModals();
  });

  // Tour Details Tabs
  document.querySelectorAll(".detail-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".detail-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".detail-tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const tabPane = $(btn.dataset.target);
      if (tabPane) tabPane.classList.add("active");
    });
  });

  // Detail Modal Reserve CTA
  const detailModalBookBtn = $("detailModalBookBtn");
  if (detailModalBookBtn) {
    detailModalBookBtn.addEventListener("click", () => {
      if (currentTourForModal) {
        const date = $("fDate") ? $("fDate").value : nextDates(1)[0];
        closeModal("tourDetailModal");
        openBookingModal(currentTourForModal, date, currentTourForModal.times[0]);
      }
    });
  }

  // Booking Form
  const bookForm = $("bookForm");
  const bSeatsInput = $("bSeats");
  if (bSeatsInput) {
    bSeatsInput.addEventListener("input", updateBookingModalTotal);
  }

  if (bookForm) {
    bookForm.addEventListener("submit", onConfirmBooking);
  }

  // Ticket Modal Print
  const printTicketBtn = $("printTicketBtn");
  if (printTicketBtn) {
    printTicketBtn.addEventListener("click", () => {
      window.print();
    });
  }
}

function openTourDetailsModal(tour) {
  currentTourForModal = tour;
  const modal = $("tourDetailModal");
  if (!modal) return;

  $("detailModalTitle").textContent = getTourName(tour);
  $("detailModalCity").textContent = tour.city;
  $("detailModalCategory").textContent = tour.category;
  $("detailModalRating").textContent = `★ ${tour.rating} (${tour.reviews} ${t("reviewsCount", {}) || "rəy"})`;
  $("detailModalPrice").textContent = money(tour.price);
  $("detailModalHero").style.backgroundImage = `url('${tour.image}')`;
  $("detailModalDesc").textContent = getTourDesc(tour);
  $("detailModalMeeting").textContent = tour.place;
  $("detailModalDuration").textContent = tour.duration;
  $("detailModalEntrance").textContent = tour.entrance;

  // Itinerary
  const itinContainer = $("detailModalItinerary");
  if (itinContainer) {
    itinContainer.innerHTML = (tour.itinerary || []).map(item => `
      <div class="itinerary-step">
        <span class="itinerary-time">${item.time}</span>
        <div class="itinerary-content">
          <h5>${escapeHTML(item.title)}</h5>
          <p>${escapeHTML(item.desc)}</p>
        </div>
      </div>
    `).join("");
  }

  // Inclusions & Exclusions
  const incContainer = $("detailModalIncluded");
  if (incContainer) {
    incContainer.innerHTML = `
      <div class="inc-box">
        <h4>✅ ${t("includedTitle")}</h4>
        <ul>${(tour.included || []).map(i => `<li>${escapeHTML(i)}</li>`).join("")}</ul>
      </div>
      <div class="exc-box">
        <h4>❌ ${t("excludedTitle")}</h4>
        <ul>${(tour.excluded || []).map(i => `<li>${escapeHTML(i)}</li>`).join("")}</ul>
      </div>
    `;
  }

  // Weather & Gear Tips
  const weatherContainer = $("detailModalWeather");
  if (weatherContainer) {
    const regData = REGIONS_DATA.find(r => r.name.toLowerCase().includes(tour.city.toLowerCase())) || REGIONS_DATA[0];
    weatherContainer.innerHTML = `
      <div class="weather-card-preview">
        <div class="weather-temp">${regData.weather.icon} ${regData.weather.temp}</div>
        <div class="weather-desc">${regData.weather.text}</div>
      </div>
      <div class="gear-tips-box">
        <h4>🎒 Yanınızda Götürün:</h4>
        <div class="gear-tags">
          ${(tour.gearTips || []).map(g => `<span class="gear-tag">✓ ${escapeHTML(g)}</span>`).join("")}
        </div>
      </div>
    `;
  }

  // Reset tab to overview
  document.querySelectorAll(".detail-tab-btn").forEach((b, i) => b.classList.toggle("active", i === 0));
  document.querySelectorAll(".detail-tab-pane").forEach((p, i) => p.classList.toggle("active", i === 0));

  modal.classList.add("active");
  modal.hidden = false;
}

function openBookingModal(tour, date, time) {
  const left = seatsLeft(tour, date, time);
  currentBookingSlot = { tour, date, time, left };

  const modal = $("bookingModal");
  if (!modal) return;

  $("bookModalTourName").textContent = getTourName(tour);
  $("bookModalMeta").textContent = `${formatDate(date)} • Saat: ${time} • ${tour.city}`;
  $("bookModalAvailable").innerHTML = left > 0 ? `Canlı boş yer: <strong>${left} yer</strong>` : `<span class="text-bad">Bilet bitib</span>`;

  const seatsInput = $("bSeats");
  seatsInput.max = left;
  seatsInput.value = Math.min(Math.max(1, parseInt($("fSeats") ? $("fSeats").value : "1", 10) || 1), Math.max(1, left));

  $("bName").value = "";
  $("bPhone").value = "";
  $("bError").hidden = true;
  if ($("bExtWhen")) $("bExtWhen").hidden = true;

  updateBookingModalTotal();

  modal.classList.add("active");
  modal.hidden = false;
}

function updateBookingModalTotal() {
  if (!currentBookingSlot) return;
  const seats = Math.max(1, parseInt($("bSeats").value, 10) || 1);
  const total = seats * currentBookingSlot.tour.price;
  $("bTotal").textContent = money(total);
}

function onConfirmBooking(e) {
  e.preventDefault();
  if (!currentBookingSlot) return;

  const { tour } = currentBookingSlot;
  const date = tour.external ? $("bDate").value : currentBookingSlot.date;
  const time = tour.external ? $("bTime").value : currentBookingSlot.time;
  const seats = parseInt($("bSeats").value, 10) || 1;
  const name = $("bName").value.trim();
  const phone = $("bPhone").value.trim();
  const left = seatsLeft(tour, date, time);

  if (!name || !phone || !date || !time) {
    showBookingError(t("fillAllFields"));
    return;
  }

  if (seats > left) {
    showBookingError(t("exceedSeats"));
    return;
  }

  const bookingId = uid();
  const bookingObj = {
    id: bookingId,
    tourId: tour.id,
    tourName: getTourName(tour),
    city: tour.city,
    place: tour.place,
    date,
    time,
    seats,
    pricePerPerson: tour.price,
    total: seats * tour.price,
    guestName: name,
    phone,
    createdAt: new Date().toISOString()
  };

  Store.add(bookingObj);
  if (window.TCReservations) window.TCReservations.create(bookingObj);

  closeModal("bookingModal");
  showToast(t("bookingSuccess"), "success");

  // Re-render
  render();
  renderBookings();
  renderLiveChecker();

  // Open Boarding Pass / Ticket Modal
  openTicketModal(bookingObj);
}

function showBookingError(msg) {
  const errEl = $("bError");
  if (errEl) {
    errEl.textContent = msg;
    errEl.hidden = false;
  }
}

function openTicketModal(b) {
  const modal = $("ticketPassModal");
  if (!modal) return;

  $("ticketCode").textContent = b.id;
  $("ticketTourName").textContent = b.tourName;
  $("ticketGuestName").textContent = b.guestName;
  $("ticketPhone").textContent = b.phone;
  $("ticketDateTime").textContent = `${formatDate(b.date)} — ${b.time}`;
  $("ticketPlace").textContent = b.place;
  $("ticketSeats").textContent = `${b.seats} nəfər`;
  $("ticketTotal").textContent = money(b.total);

  modal.classList.add("active");
  modal.hidden = false;
}

function closeModal(modalId) {
  const modal = $(modalId);
  if (modal) {
    modal.classList.remove("active");
    modal.hidden = true;
  }
}

function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach(m => {
    m.classList.remove("active");
    m.hidden = true;
  });
  const drawer = $("wishlistDrawer");
  if (drawer) drawer.classList.remove("open");
}

/* ==========================================================================
   BOOKINGS LIST & CANCELLATION
   ========================================================================== */
function renderBookings() {
  const list = Store.all();
  const countEl = $("bookingCount");
  const listEl = $("bookingList");

  if (countEl) countEl.textContent = list.length;
  if (!listEl) return;

  if (list.length === 0) {
    listEl.innerHTML = `
      <div class="empty-bookings">
        <span class="empty-icon">🎫</span>
        <p>${t("noBookings")}</p>
        <a href="#liveCheck" class="btn btn-primary btn-sm">${t("heroBtnExplore")}</a>
      </div>
    `;
    return;
  }

  listEl.innerHTML = list.map(b => `
    <div class="booking-card" data-booking-id="${b.id}">
      <div class="booking-card-left">
        <div class="booking-badge">${t("ticketStatus")}</div>
        <h4>${escapeHTML(b.tourName)}</h4>
        <div class="booking-meta">
          <span>📅 ${formatDate(b.date)}, ${b.time}</span>
          <span>📍 ${escapeHTML(b.place)}</span>
          <span>👤 ${escapeHTML(b.guestName)} (${escapeHTML(b.phone)})</span>
        </div>
      </div>
      <div class="booking-card-right">
        <div class="booking-pricing">
          <span class="seats-count">${b.seats} bilet</span>
          <strong class="total-price">${money(b.total)}</strong>
          <small class="ticket-id-tag">#${b.id}</small>
        </div>
        <div class="booking-actions">
          <button class="btn btn-sm btn-ghost" data-action="view-ticket" data-booking="${b.id}">
            📄 ${t("printTicket")}
          </button>
          <button class="btn btn-sm btn-danger" data-action="cancel-booking" data-booking="${b.id}">
            🗑 ${t("cancelBooking")}
          </button>
        </div>
      </div>
    </div>
  `).join("");

  listEl.querySelectorAll("[data-action='view-ticket']").forEach(btn => {
    btn.addEventListener("click", () => {
      const b = Store.getById(btn.dataset.booking);
      if (b) openTicketModal(b);
    });
  });

  listEl.querySelectorAll("[data-action='cancel-booking']").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm(t("confirmCancel"))) {
        Store.remove(btn.dataset.booking);
        if (window.TCReservations) window.TCReservations.cancel(btn.dataset.booking);
        showToast(t("bookingCancelled"), "info");
        renderBookings();
        render();
        renderLiveChecker();
      }
    });
  });
}

/* ==========================================================================
   WISHLIST / FAVORITES DRAWER
   ========================================================================== */
function setupWishlistDrawer() {
  const toggleBtn = $("wishlistToggleBtn");
  const drawer = $("wishlistDrawer");
  const closeBtn = $("wishlistDrawerClose");

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener("click", () => {
      renderWishlistDrawer();
      drawer.classList.add("open");
    });
  }

  if (closeBtn && drawer) {
    closeBtn.addEventListener("click", () => {
      drawer.classList.remove("open");
    });
  }
}

function updateWishlistBadge() {
  const badge = $("wishlistCount");
  if (badge) {
    badge.textContent = Store.getWishlist().length;
  }
}

function renderWishlistDrawer() {
  const listEl = $("wishlistDrawerList");
  if (!listEl) return;

  const favIds = Store.getWishlist();
  const favTours = TOURS.filter(t => favIds.includes(t.id));

  if (favTours.length === 0) {
    listEl.innerHTML = `
      <div class="empty-wishlist">
        <span class="empty-icon">🤍</span>
        <p>Sevimlilər siyahınız boşdur.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = favTours.map(tour => `
    <div class="wishlist-item">
      <div class="wishlist-item-img" style="background-image: url('${tour.image}')"></div>
      <div class="wishlist-item-info">
        <h5>${escapeHTML(getTourName(tour))}</h5>
        <span class="wishlist-item-meta">${tour.city} • ${money(tour.price)}</span>
        <div class="wishlist-item-actions">
          <button class="btn btn-xs btn-primary" data-action="quickbook" data-tour="${tour.id}">Rezerv et</button>
          <button class="btn btn-xs btn-ghost" data-action="remove-fav" data-tour="${tour.id}">Sil</button>
        </div>
      </div>
    </div>
  `).join("");

  listEl.querySelectorAll("[data-action='remove-fav']").forEach(btn => {
    btn.addEventListener("click", () => {
      Store.toggleFavorite(btn.dataset.tour);
      updateWishlistBadge();
      renderWishlistDrawer();
      render();
    });
  });

  listEl.querySelectorAll("[data-action='quickbook']").forEach(btn => {
    btn.addEventListener("click", () => {
      const tour = TOURS.find(t => t.id === btn.dataset.tour);
      if (tour) {
        const date = $("fDate") ? $("fDate").value : nextDates(1)[0];
        $("wishlistDrawer").classList.remove("open");
        openBookingModal(tour, date, tour.times[0]);
      }
    });
  });
}

/* ==========================================================================
   FƏRDİ SƏYAHƏT XƏRC KALKULYATORU (CUSTOM TRIP COST CALCULATOR)
   ========================================================================== */
const CALC = {
  transport: { sprinter: { price: 120, cap: 18, icon: "🚐" }, minivan: { price: 180, cap: 6, icon: "🚘" }, sedan: { price: 80, cap: 4, icon: "🚗" } },
  meal: { none: { price: 0, icon: "🥡" }, standard: { price: 18, icon: "🍽️" }, national: { price: 32, icon: "🫖" } },
  guide: 50, insurance: 5
};
const CT = {
  az: { persons: "Sərnişin sayı", days: "Gün sayı", transport: "Nəqliyyat", meal: "Qidalanma", extras: "Əlavə xidmətlər",
    guide: "Peşəkar bələdçi (+50 ₼ / gün)", insurance: "Səyahət sığortası (+5 ₼ / nəfər)",
    live: "CANLI HESABLAMA", total: "Təxmini ümumi xərc", perPerson: "Nəfər başına", perDay: "Nəfər / gün",
    bTransport: "🚐 Nəqliyyat", bMeals: "🍽️ Qidalanma", bGuide: "🧑‍🏫 Bələdçi", bInsurance: "🛡️ Sığorta",
    disclaimer: "Qiymətə yanacaq, sürücü və seçilmiş xidmətlər daxildir.", cta: "Bu büdcəyə tur tap →", copy: "📋 Hesabı kopyala", copied: "✓ Kopyalandı",
    day: "gün", seats: "yer", perDayUnit: "/ gün", perPersonUnit: "/ nəfər",
    fits: "✓ {p} nəfər üçün kifayətdir", need: "⚠ {v} ədəd lazımdır ({c} yerlik)", cheaper: "💡 {n} seçsəniz {x} ₼ qənaət edərsiniz",
    summary: "{p} nəfər · {d} gün",
    t: { sprinter: ["Mercedes Sprinter", "Komfortlu mikroavtobus"], minivan: ["Vito / Viano VIP", "VIP miniven"], sedan: ["Komfort Sedan", "Kiçik qrup üçün"] },
    m: { none: ["Yeməksiz", "Öz hesabına"], standard: ["Standart nahar", "Nahar menyusu"], national: ["Milli süfrə", "+ çay dəstgahı"] } },
  en: { persons: "Passengers", days: "Number of days", transport: "Transport", meal: "Meals", extras: "Extras",
    guide: "Professional guide (+50 ₼ / day)", insurance: "Travel insurance (+5 ₼ / person)",
    live: "LIVE ESTIMATE", total: "Estimated total", perPerson: "Per person", perDay: "Per person / day",
    bTransport: "🚐 Transport", bMeals: "🍽️ Meals", bGuide: "🧑‍🏫 Guide", bInsurance: "🛡️ Insurance",
    disclaimer: "Price includes fuel, driver and all selected services.", cta: "Find tours for this budget →", copy: "📋 Copy estimate", copied: "✓ Copied",
    day: "day", seats: "seats", perDayUnit: "/ day", perPersonUnit: "/ person",
    fits: "✓ Fits {p} passengers", need: "⚠ {v} vehicles needed ({c} seats each)", cheaper: "💡 Choose {n} to save {x} ₼",
    summary: "{p} passengers · {d} day(s)",
    t: { sprinter: ["Mercedes Sprinter", "Comfort minibus"], minivan: ["Vito / Viano VIP", "VIP minivan"], sedan: ["Comfort Sedan", "For small groups"] },
    m: { none: ["No meals", "Own expense"], standard: ["Standard lunch", "Lunch menu"], national: ["National feast", "+ tea set"] } },
  ru: { persons: "Количество пассажиров", days: "Количество дней", transport: "Транспорт", meal: "Питание", extras: "Дополнительно",
    guide: "Профессиональный гид (+50 ₼ / день)", insurance: "Страховка (+5 ₼ / чел.)",
    live: "РАСЧЁТ ОНЛАЙН", total: "Итоговая сумма", perPerson: "На человека", perDay: "На человека / день",
    bTransport: "🚐 Транспорт", bMeals: "🍽️ Питание", bGuide: "🧑‍🏫 Гид", bInsurance: "🛡️ Страховка",
    disclaimer: "В цену входят топливо, водитель и все выбранные услуги.", cta: "Найти туры на этот бюджет →", copy: "📋 Скопировать расчёт", copied: "✓ Скопировано",
    day: "дн.", seats: "мест", perDayUnit: "/ день", perPersonUnit: "/ чел.",
    fits: "✓ Хватит для {p} чел.", need: "⚠ Нужно машин: {v} (по {c} мест)", cheaper: "💡 Выберите {n} — сэкономите {x} ₼",
    summary: "{p} чел. · {d} дн.",
    t: { sprinter: ["Mercedes Sprinter", "Комфортный микроавтобус"], minivan: ["Vito / Viano VIP", "VIP минивэн"], sedan: ["Комфорт седан", "Для небольшой группы"] },
    m: { none: ["Без питания", "За свой счёт"], standard: ["Стандартный обед", "Меню обеда"], national: ["Национальный стол", "+ чайный набор"] } }
};
let calcLastTotal = 0;

function updateCalculator() {
  const pEl = $("calcPersons");
  if (!pEl) return;
  const L = CT[currentLang] || CT.az;
  const fmt = (str, o) => str.replace(/\{(\w+)\}/g, (_, k) => o[k]);

  const persons = Math.min(40, Math.max(1, parseInt(pEl.value, 10) || 1));
  const days = Math.min(7, Math.max(1, parseInt($("calcDays").value, 10) || 1));
  const tKey = CALC.transport[$("calcTransport").value] ? $("calcTransport").value : "sprinter";
  const mKey = CALC.meal[$("calcMeal").value] ? $("calcMeal").value : "standard";
  const guideOn = $("calcGuide").checked, insOn = $("calcInsurance").checked;
  const rng = $("calcPersonsRange"); if (rng && rng.value != persons) rng.value = persons;
  if (document.activeElement !== pEl && String(pEl.value) !== String(persons)) pEl.value = persons;

  const costFor = k => Math.ceil(persons / CALC.transport[k].cap) * CALC.transport[k].price * days;
  const vehicles = Math.ceil(persons / CALC.transport[tKey].cap);
  const transportCost = costFor(tKey);
  const mealsCost = CALC.meal[mKey].price * persons * days;
  const guideCost = guideOn ? CALC.guide * days : 0;
  const insCost = insOn ? CALC.insurance * persons : 0;
  const total = transportCost + mealsCost + guideCost + insCost;
  const perPerson = Math.round(total / persons);
  const perDay = Math.round(total / persons / days);

  // static labels
  document.querySelectorAll("[data-ct]").forEach(el => { const v = L[el.dataset.ct]; if (typeof v === "string") el.textContent = v; });

  // days buttons
  $("calcDayBtns").innerHTML = [1, 2, 3, 4, 5, 6, 7].map(d =>
    `<button type="button" class="cx-day ${d === days ? "on" : ""}" data-day="${d}">${d} ${L.day}</button>`).join("");

  // transport cards
  $("calcTransportCards").innerHTML = Object.keys(CALC.transport).map(k => {
    const c = CALC.transport[k];
    return `<button type="button" class="cx-card ${k === tKey ? "on" : ""}" data-transport="${k}">
      <span class="ic">${c.icon}</span><b>${L.t[k][0]}</b><small>${L.t[k][1]} · ${c.cap} ${L.seats}</small>
      <span class="pr">${c.price} ₼ ${L.perDayUnit}</span></button>`;
  }).join("");

  // meal cards
  $("calcMealCards").innerHTML = Object.keys(CALC.meal).map(k => {
    const c = CALC.meal[k];
    return `<button type="button" class="cx-card ${k === mKey ? "on" : ""}" data-meal="${k}">
      <span class="ic">${c.icon}</span><b>${L.m[k][0]}</b><small>${L.m[k][1]}</small>
      <span class="pr">${c.price} ₼ ${L.perPersonUnit}</span></button>`;
  }).join("");

  // capacity note + cheaper tip
  const cap = $("calcCapNote");
  if (vehicles > 1) { cap.textContent = fmt(L.need, { v: vehicles, c: CALC.transport[tKey].cap }); cap.className = "cx-note warn"; }
  else { cap.textContent = fmt(L.fits, { p: persons }); cap.className = "cx-note"; }
  const best = Object.keys(CALC.transport).reduce((a, k) => costFor(k) < costFor(a) ? k : a, tKey);
  const tip = $("calcTip");
  if (best !== tKey && costFor(tKey) - costFor(best) > 0) { tip.hidden = false; tip.textContent = fmt(L.cheaper, { n: L.t[best][0], x: costFor(tKey) - costFor(best) }); }
  else tip.hidden = true;

  // breakdown with share bars
  const rows = [[L.bTransport, transportCost], [L.bMeals, mealsCost], [L.bGuide, guideCost], [L.bInsurance, insCost]];
  $("calcBreakdown").innerHTML = rows.map(([n, v]) =>
    `<div class="cx-row ${v ? "" : "zero"}"><span>${n}${n === L.bTransport && vehicles > 1 ? " ×" + vehicles : ""}</span><b>${money(v)}</b>
      <span class="bar"><i style="width:${total ? Math.round(v / total * 100) : 0}%"></i></span></div>`).join("");

  // totals (count-up)
  const totalEl = $("calcTotalVal"), from = calcLastTotal, t0 = performance.now();
  calcLastTotal = total;
  (function tick(now) {
    const k = Math.min(1, (now - t0) / 350);
    totalEl.textContent = money(Math.round(from + (total - from) * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(tick);
  })(t0);
  $("calcSummary").textContent = fmt(L.summary, { p: persons, d: days });
  $("calcPerPersonVal").textContent = money(perPerson);
  $("calcPerDayRow").hidden = days === 1;
  $("calcPerDayVal").textContent = money(perDay);
  $("calcFindBtn").textContent = L.cta;
  const cb = $("calcCopyBtn"); if (!cb.dataset.busy) cb.textContent = L.copy;

  window.__calc = { persons, days, total, perPerson, vehicles, tKey, mKey, guideOn, insOn };
}

(function initCalcControls() {
  const root = document.getElementById("calculator");
  if (!root) return;
  const set = (id, v) => { $(id).value = v; updateCalculator(); };
  root.addEventListener("click", e => {
    const st = e.target.closest("[data-step]"), dy = e.target.closest("[data-day]"),
      tr = e.target.closest("[data-transport]"), ml = e.target.closest("[data-meal]");
    if (st) set("calcPersons", Math.min(40, Math.max(1, (parseInt($("calcPersons").value, 10) || 1) + Number(st.dataset.step))));
    else if (dy) set("calcDays", dy.dataset.day);
    else if (tr) set("calcTransport", tr.dataset.transport);
    else if (ml) set("calcMeal", ml.dataset.meal);
  });
  $("calcPersonsRange").addEventListener("input", e => set("calcPersons", e.target.value));
  $("calcFindBtn").addEventListener("click", e => {
    e.preventDefault();
    const c = window.__calc; if (!c) return;
    const apply = (id, v) => { const el = $(id); if (!el) return; el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); };
    const budget = Math.min(150, Math.max(15, Math.round(c.perPerson / 5) * 5));
    apply("liveBudgetNumber", budget); apply("liveBudgetRange", budget);
    apply("livePersons", Math.min(20, c.persons));
    const sec = $("liveCheck"); if (sec) sec.scrollIntoView({ behavior: "smooth" });
  });
  $("calcCopyBtn").addEventListener("click", async () => {
    const c = window.__calc, L = CT[currentLang] || CT.az; if (!c) return;
    const txt = `TourCheck — ${L.total}: ${money(c.total)}\n${L.persons}: ${c.persons} · ${L.days}: ${c.days}\n${L.t[c.tKey][0]}${c.vehicles > 1 ? " ×" + c.vehicles : ""}, ${L.m[c.mKey][0]}\n${L.perPerson}: ${money(c.perPerson)}`;
    try { await navigator.clipboard.writeText(txt); } catch (e) {}
    const b = $("calcCopyBtn"); b.dataset.busy = "1"; b.textContent = L.copied;
    setTimeout(() => { delete b.dataset.busy; b.textContent = L.copy; }, 1500);
  });
  updateCalculator();
})();

/* ==========================================================================
   HELPER UTILS
   ========================================================================== */
function debounce(fn, ms) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// Start app on DOMContentLoaded
document.addEventListener("DOMContentLoaded", init);

