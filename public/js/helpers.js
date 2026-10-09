/* Köməkçi funksiyalar və çoxdilli formatlaşdırma */

const DATE_LOCALES = {
  az: {
    months: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"],
    weekdays: ["Bazar", "B.e.", "Ç.a.", "Çərşənbə", "C.a.", "Cümə", "Şənbə"],
    today: "Bu gün",
    tomorrow: "Sabah"
  },
  en: {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    today: "Today",
    tomorrow: "Tomorrow"
  },
  ru: {
    months: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    weekdays: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    today: "Сегодня",
    tomorrow: "Завтра"
  }
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function toISODate(d) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const lang = typeof currentLang !== "undefined" ? currentLang : "az";
  const loc = DATE_LOCALES[lang] || DATE_LOCALES.az;

  return d + " " + loc.months[m - 1] + ", " + loc.weekdays[dt.getDay()];
}

function nextDates(count) {
  const out = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    out.push(toISODate(d));
  }
  return out;
}

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isPast(dateISO, time) {
  if (!dateISO || !time) return false;
  const [y, m, d] = dateISO.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return new Date(y, m - 1, d, h, mi).getTime() < Date.now();
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function escapeHTML(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function money(n) {
  return Number(n).toLocaleString() + " ₼";
}

function uid() {
  return "TC-" + Math.floor(100000 + Math.random() * 900000);
}

function getTourName(tour) {
  if (!tour) return "";
  if (typeof tour.name === "object") {
    return tour.name[currentLang] || tour.name.az || "";
  }
  return tour.name || "";
}

function getTourDesc(tour) {
  if (!tour) return "";
  if (typeof tour.desc === "object") {
    return tour.desc[currentLang] || tour.desc.az || "";
  }
  return tour.desc || "";
}

// Global Toast message notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  const icon = type === "error" ? "⚠️" : type === "info" ? "ℹ️" : "✅";
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${escapeHTML(message)}</span>`;
  toast.className = `toast show ${type}`;
  toast.hidden = false;

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.className = "toast";
    setTimeout(() => { toast.hidden = true; }, 300);
  }, 3200);
}

