/* Popular Travel Regions: данные из Firebase (если коллекция пуста — остаются встроенные) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const app = initializeApp({ apiKey: "AIzaSyCuXw7P8HIFbA0FaHgf_KVN3w7QyKicW2c", authDomain: "tourcheck-62390.firebaseapp.com", projectId: "tourcheck-62390", appId: "1:982488738061:web:dd510dfa930aac936de844" });
/* Резервации -> Firebase (видны в админ-панели) */
const fsdb = getFirestore(app);
window.TCReservations = {
  create(b) {
    return setDoc(doc(fsdb, "reservations", String(b.id)), {
      tourId: b.tourId || "", tourName: b.tourName || "", city: b.city || "", place: b.place || "",
      date: b.date || "", time: b.time || "", seats: Number(b.seats) || 1,
      pricePerPerson: Number(b.pricePerPerson) || 0, total: Number(b.total) || 0,
      guestName: b.guestName || "", phone: b.phone || "",
      status: "new", createdAtISO: b.createdAt || new Date().toISOString(), createdAt: serverTimestamp()
    }).catch(e => console.warn("Reservation sync failed:", e));
  },
  cancel(id) {
    return updateDoc(doc(fsdb, "reservations", String(id)), { status: "cancelled" })
      .catch(e => console.warn("Reservation cancel sync failed:", e));
  }
};
try {
  const snap = await getDocs(collection(fsdb, "regions"));
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.name)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  if (list.length) {
    REGIONS_DATA.splice(0, REGIONS_DATA.length, ...list.map(r => ({
      id: r.id, name: r.name, image: r.image || "", tag: r.tag || "", desc: r.desc || "",
      weather: r.weather || { temp: "", text: "", icon: "" }, liveKey: r.liveKey || "", places: r.places || []
    })));
    renderRegions();
  }
} catch (e) { console.warn("Firebase regions:", e); }
