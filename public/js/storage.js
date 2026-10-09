/* Rezervlərin, sevimlilərin və tənzimləmələrin localStorage-da idarə edilməsi */
const STORAGE_KEYS = {
  BOOKINGS: "tourcheck.bookings.v2",
  WISHLIST: "tourcheck.wishlist.v2",
  THEME: "tourcheck.theme.v1",
  LANG: "tourcheck_lang"
};

const Store = {
  // Bookings
  all() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || [];
    } catch (e) {
      return [];
    }
  },
  save(list) {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  },
  add(booking) {
    const list = this.all();
    list.unshift(booking); // Ən yenilər yuxarıda
    this.save(list);
  },
  remove(id) {
    this.save(this.all().filter(b => b.id !== id));
  },
  getById(id) {
    return this.all().find(b => b.id === id);
  },
  bookedSeats(tourId, date, time) {
    return this.all()
      .filter(b => b.tourId === tourId && b.date === date && b.time === time)
      .reduce((sum, b) => sum + Number(b.seats || 0), 0);
  },

  // Wishlist / Favorites
  getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST)) || [];
    } catch (e) {
      return [];
    }
  },
  saveWishlist(list) {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  },
  isFavorite(tourId) {
    return this.getWishlist().includes(tourId);
  },
  toggleFavorite(tourId) {
    let list = this.getWishlist();
    const exists = list.includes(tourId);
    if (exists) {
      list = list.filter(id => id !== tourId);
    } else {
      list.push(tourId);
    }
    this.saveWishlist(list);
    return !exists;
  },

  // Theme
  getTheme() {
    try {
      return (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEYS.THEME)) || "light";
    } catch (e) {
      return "light";
    }
  },
  setTheme(theme) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
      }
    } catch (e) { /* ignore */ }
  }
};

// Seansın ilkin doluluğu (demo): tutumun müəyyən hissəsi
function baseTaken(tour, date, time) {
  const r = hashString(tour.id + "|" + date + "|" + time) % 100;
  // Bəzi saatlar dolu, bəziləri az, bəziləri çox boş
  const ratio = r < 12 ? 1 : r < 35 ? 0.75 : r < 60 ? 0.45 : r / 120;
  return Math.min(tour.capacity, Math.round(tour.capacity * ratio));
}

function seatsLeft(tour, date, time) {
  if (tour.external) return tour.capacity;
  const taken = baseTaken(tour, date, time) + Store.bookedSeats(tour.id, date, time);
  return Math.max(0, tour.capacity - taken);
}

