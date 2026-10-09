/* Çoxdilli dəstək: Azərbaycan (az), İngilis (en), Rus (ru) */
const TRANSLATIONS = {
  az: {
    // Header & Nav
    siteTitle: "TourCheck — Azərbaycan Turları & Canlı Bilet Yoxlama",
    navSearch: "Axtarış",
    navLiveCheck: "Canlı Yoxlama",
    navRegions: "Bölgələr",
    navTours: "Turlar",
    navTips: "Tövsiyələr",
    navCalculator: "Kalkulyator",
    navWishlist: "Sevimlilər",
    navBookings: "Rezervlərim",

    // Hero
    heroBadge: "🇦🇿 Azərbaycanın 1 nömrəli tur və bilet platforması",
    heroTitle: "Gözəl Qarabağdan Şahdağa: Turlar və Boş Yerləri Canlı Yoxla",
    heroDesc: "Bölgəni seç, büdcəni yoxla, canlı boş yerləri dərhal gör və bir kliklə biletini rezerv et.",
    heroBtnExplore: "Turları Kəşf Et",
    heroBtnLive: "Canlı Büdcə Yoxlaması",
    statTours: "Aktiv Tur",
    statRegions: "Rayon & Şəhər",
    statSatisfaction: "Müştəri Məmnuniyyəti",
    statLiveSeats: "Canlı Yer Nəzarəti",

    // Live Budget Checker
    liveCheckTitle: "Canlı Büdcə və Məkan Yoxlaması",
    liveCheckSubtitle: "Büdcənizi və istəyinizi daxil edin — sistem dərhal sizə uyğun rayon və turları tapsın!",
    liveBudgetLabel: "Büdcəniz (nəfər başına)",
    liveRegionLabel: "İstədiyiniz Region",
    liveVibeLabel: "Tur Növü",
    livePersonsLabel: "Səyahətçi sayı",
    allRegions: "Bütün Regionlar",
    allVibes: "Bütün Növlər",
    vibeNature: "Dağ və Təbiət",
    vibeCulture: "Tarix və Mədəniyyət",
    vibeAdventure: "Macəra və Ekstrim",
    vibeRelax: "İstirahət və Qastronomiya",
    vibeFamily: "Ailəvi İstirahət",
    liveMatchHeader: "Canlı Uyğunluq Nəticəsi",
    liveMatchScore: "Uyğunluq Reytinqi",
    liveBudgetMatchFound: "büdcənizə uyğun təklif tapıldı",
    liveBudgetTip: "Ağıllı Məsləhət",
    liveRemainingBudget: "Qalıq büdcə:",
    liveBookNow: "Dərhal Rezerv Et",
    liveViewDetails: "Detallara Bax",
    liveNoMatch: "Bu büdcə və parametrlərə uyğun tur tapılmadı. Büdcəni bir qədər artırmağı sınayın.",

    // Region Showcase
    regionSectionTitle: "Populyar Səyahət Bölgələri",
    regionSectionSubtitle: "Azərbaycanın füsunkar güşələrindən birini seçin və turlara baxın",
    regionToursCount: "tur mövcuddur",
    regionFilterBtn: "Turlara bax",

    // Search & Catalog
    catalogTitle: "Bütün Məkanlar və Tur Kataloqu",
    catalogSubtitle: "Tarix, saat və qiymətə görə filtr edin, boş yerləri dərhal yoxlayın",
    searchPlaceholder: "Tur və ya məkan adı ilə axtarın...",
    filterCity: "Rayon / Şəhər",
    filterCategory: "Kateqoriya",
    filterDate: "Tarix",
    filterTimeAfter: "Saatdan sonra",
    filterMinSeats: "Tələb olunan yer",
    filterMaxPrice: "Maks. qiymət (₼)",
    filterOnlyAvailable: "Yalnız boş yeri olanlar",
    filterEntranceIncluded: "Yalnız giriş biletləri daxil olanlar",
    btnSearch: "Axtar",
    btnReset: "Sıfırla",
    sortBy: "Sırala:",
    sortTime: "Ən tez saata görə",
    sortPriceLow: "Qiymət: Ucuzdan bahaya",
    sortPriceHigh: "Qiymət: Bahadan ucuza",
    sortSeats: "Ən çox boş yer",
    sortRating: "Ən yüksək reytinq",

    // Tour Card
    perPerson: "nəfər başına",
    duration: "Müddət",
    meetingPoint: "Görüş yeri",
    entranceInfo: "Giriş və Rüsum",
    seatsAvailable: "boş yer",
    seatsLow: "Son {n} yer!",
    seatsNone: "Bilet bitib",
    btnReserve: "Rezerv et",
    btnDetails: "Ətraflı",
    addedToWishlist: "Sevimlilərə əlavə edildi",
    removedFromWishlist: "Sevimlilərdən silindi",

    // Recommendations & Tips
    tipsSectionTitle: "Səyahətçilər Üçün Tövsiyələr",
    tipsSectionSubtitle: "Bələdçilərimizdən rayonlara getməzdən öncə bilməli olduğunuz qızıl qaydalar",
    tip1Title: "Şahdağ və Quba üçün nə götürməli?",
    tip1Desc: "Dağ havası qəfil dəyişə bilər. Su keçirməyən isti gödəkçə, relyefli ayaqqabı və şəxsiyyət vəsiqəsi mütləqdir.",
    tip2Title: "Şəki və Qəbələ Qastronomiyası",
    tip2Desc: "Şəkidə gil qabda bişən Pitini və məşhur Şəki halvasını, Qəbələdə isə təndir küküsünü dadmadan qayıtmayın.",
    tip3Title: "Milli Parklar & Giriş Qaydaları",
    tip3Desc: "Göy-göl və Şahdağ Milli Parkına giriş üçün 2 AZN ekoloji rüsum ödənilir (tur paketlərimizdə bu qiymətə daxildir).",
    tip4Title: "Qobustan & Palçıq Vulkanları",
    tip4Desc: "Ən yaxşı foto çəkiliş saatları səhər 09:00-11:00 arasıdır. Qobustan muzeyi giriş biletləri tələbələrə 50% endirimlidir.",

    // Calculator Section
    calcTitle: "Fərdi Səyahət Xərc Kalkulyatoru",
    calcSubtitle: "Öz xüsusi qrupunuz və ya ailəniz üçün büdcəni əvvəlcədən dəqiq hesablayın",
    calcRegion: "Səfər Regionu",
    calcPersons: "Sərnişin sayı",
    calcTransport: "Nəqliyyat Növü",
    calcTransportSprinter: "Mercedes Sprinter (Komfortlu mikroavtobus) - 120 ₼",
    calcTransportMinivan: "Vito / Viano VIP Miniven - 180 ₼",
    calcTransportSedan: "Komfort Sedan (4 nəfər) - 80 ₼",
    calcMeal: "Qidalanma Paketi",
    calcMealNone: "Yeməksiz (Öz hesabına) - 0 ₼",
    calcMealStandard: "Standart Nahar Menyusu - 18 ₼ / nəfər",
    calcMealNational: "Zəngin Milli Süfrə + Çay Dəstgahı - 32 ₼ / nəfər",
    calcGuide: "Peşəkar Bələdçi Xidməti (+50 ₼)",
    calcInsurance: "Səyahət Sığortası (+5 ₼ / nəfər)",
    calcTotal: "Təxmini Ümumi Xərc:",
    calcPerPerson: "Nəfər başına:",

    // Reviews Section
    reviewsTitle: "Müştəri Rəyləri",
    reviewsSubtitle: "Bizimlə səyahət edən 10,000+ bəxtiyar turistin fikirləri",

    // Bookings
    bookingsTitle: "Mənim Rezervlərim",
    noBookings: "Hələ ki heç bir rezervasiyanız yoxdur. Bəyəndiyiniz turu seçib rezerv edin!",
    ticketCode: "Bilet Kodu",
    totalPrice: "Ümumi Məbləğ",
    cancelBooking: "Ləğv et",
    printTicket: "Elektron Bileti Göstər",
    confirmCancel: "Bu rezervi ləğv etmək istədiyinizə əminsiniz?",
    bookingCancelled: "Rezerv uğurla ləğv edildi.",

    // Modals
    modalBookTitle: "Tur Rezervasiyası",
    nameLabel: "Ad və Soyadınız",
    phoneLabel: "Əlaqə Nömrəsi",
    seatsLabel: "Bilet Sayı",
    totalLabel: "Ödəniləcək Məbləğ:",
    btnConfirmBooking: "Rezervasiyanı Təsdiqlə",
    modalDetailsTitle: "Tur Haqqında Ətraflı Məlumat",
    tabOverview: "İcmal",
    tabItinerary: "Marşrut Proqramı",
    tabIncluded: "Nələr Daxildir",
    tabWeather: "Hava Durumu",
    includedTitle: "Qiymətə Daxildir:",
    excludedTitle: "Daxil Deyil:",

    // Ticket Pass Modal
    ticketPassTitle: "Rəsmi Elektron Bilet (Voucher)",
    ticketStatus: "TƏSDİQLƏNDİ",
    ticketGuest: "Sərnişin",
    ticketTour: "Tur Adı",
    ticketMeeting: "Toplanış Yeri",
    ticketDateTime: "Tarix və Saat",
    ticketSeats: "Yer Sayı",
    ticketAmount: "Ödəniş Məbləği",
    ticketNotice: "Görüş yerinə yola düşmə vaxtından ən azı 15 dəqiqə öncə yaxınlaşmağınız xahiş olunur.",
    btnPrint: "Çap Et / Saxla",
    btnClose: "Bağla",

    // Toast & Alerts
    bookingSuccess: "Rezervasiya uğurla tamamlandı! Elektron biletiniz hazırdır.",
    fillAllFields: "Zəhmət olmasa bütün xanaları düzgün doldurun.",
    exceedSeats: "Təəssüf ki, seçilmiş seansda bu qədər boş yer yoxdur.",

    // Footer
    footerDesc: "Azərbaycanın bütün güşələrinə peşəkar, etibarlı və komfortlu turlar. Canlı bilet yoxlaması ilə vaxtınıza qənaət edin.",
    footerLinks: "Faydalı Keçidlər",
    footerRegions: "Top Bölgələr",
    footerContact: "Əlaqə & Dəstək",
    footerCopyright: "Bütün hüquqlar qorunur. TourCheck platforması."
  },

  en: {
    // Header & Nav
    siteTitle: "TourCheck — Azerbaijan Tours & Live Ticket Availability",
    navSearch: "Search",
    navLiveCheck: "Live Checker",
    navRegions: "Regions",
    navTours: "Tours",
    navTips: "Tips",
    navCalculator: "Calculator",
    navWishlist: "Wishlist",
    navBookings: "My Bookings",

    // Hero
    heroBadge: "🇦🇿 Azerbaijan's #1 Tour & Ticket Booking Platform",
    heroTitle: "From Shusha to Shahdag: Check Tours & Live Seats Instantly",
    heroDesc: "Select your destination, test your budget in real time, monitor live seat availability, and book instantly.",
    heroBtnExplore: "Explore Tours",
    heroBtnLive: "Live Budget Checker",
    statTours: "Active Tours",
    statRegions: "Destinations",
    statSatisfaction: "Customer Rating",
    statLiveSeats: "Live Seat Tracking",

    // Live Budget Checker
    liveCheckTitle: "Live Budget & Destination Matcher",
    liveCheckSubtitle: "Enter your budget and travel vibe — our smart engine instantly finds matching regions & tours!",
    liveBudgetLabel: "Your Budget (per person)",
    liveRegionLabel: "Preferred Region",
    liveVibeLabel: "Tour Category",
    livePersonsLabel: "Travelers count",
    allRegions: "All Regions",
    allVibes: "All Types",
    vibeNature: "Mountains & Nature",
    vibeCulture: "History & Culture",
    vibeAdventure: "Adventure & Extreme",
    vibeRelax: "Relaxation & Gastronomy",
    vibeFamily: "Family Friendly",
    liveMatchHeader: "Live Match Result",
    liveMatchScore: "Match Score",
    liveBudgetMatchFound: "matching tour(s) found for your budget",
    liveBudgetTip: "Smart Tip",
    liveRemainingBudget: "Remaining balance:",
    liveBookNow: "Book Now",
    liveViewDetails: "View Details",
    liveNoMatch: "No tours found matching this exact budget. Try slightly increasing your budget.",

    // Region Showcase
    regionSectionTitle: "Popular Travel Regions",
    regionSectionSubtitle: "Pick a picturesque region of Azerbaijan and view available tours",
    regionToursCount: "tours available",
    regionFilterBtn: "Explore tours",

    // Search & Catalog
    catalogTitle: "Destinations & Tour Catalog",
    catalogSubtitle: "Filter by date, time, and price — instantly check live seat availability",
    searchPlaceholder: "Search tour or destination by keyword...",
    filterCity: "Region / City",
    filterCategory: "Category",
    filterDate: "Date",
    filterTimeAfter: "Time after",
    filterMinSeats: "Seats needed",
    filterMaxPrice: "Max price (₼)",
    filterOnlyAvailable: "Available seats only",
    filterEntranceIncluded: "Entrance ticket included only",
    btnSearch: "Search",
    btnReset: "Reset",
    sortBy: "Sort by:",
    sortTime: "Earliest departure",
    sortPriceLow: "Price: Low to high",
    sortPriceHigh: "Price: High to low",
    sortSeats: "Most seats available",
    sortRating: "Highest rating",

    // Tour Card
    perPerson: "per person",
    duration: "Duration",
    meetingPoint: "Meeting point",
    entranceInfo: "Entrance & Fees",
    seatsAvailable: "seats left",
    seatsLow: "Only {n} seats left!",
    seatsNone: "Sold out",
    btnReserve: "Book seat",
    btnDetails: "Details",
    addedToWishlist: "Added to wishlist",
    removedFromWishlist: "Removed from wishlist",

    // Recommendations & Tips
    tipsSectionTitle: "Traveler Recommendations",
    tipsSectionSubtitle: "Golden travel tips from local licensed tour guides before you set off",
    tip1Title: "What to pack for Shahdag & Quba?",
    tip1Desc: "Mountain weather is unpredictable. Waterproof windbreaker jackets, hiking shoes, and your ID document are essential.",
    tip2Title: "Gastronomy in Sheki & Gabala",
    tip2Desc: "Never miss clay-pot Piti and Sheki Halva in Sheki, along with aromatic Gabala walnut kuku and samovar tea.",
    tip3Title: "National Parks & Entrance Fees",
    tip3Desc: "Goygol and Shahdag National Parks charge a 2 AZN eco-entrance fee (already included in all our tour packages).",
    tip4Title: "Gobustan & Mud Volcanoes",
    tip4Desc: "Golden hour photography is ideal between 09:00 and 11:00 AM. Student IDs receive 50% discount at the museum.",

    // Calculator Section
    calcTitle: "Custom Trip Cost Calculator",
    calcSubtitle: "Calculate tailored costs in advance for your private family or group getaway",
    calcRegion: "Trip Region",
    calcPersons: "Number of Guests",
    calcTransport: "Transport Type",
    calcTransportSprinter: "Mercedes Sprinter (Comfort Minibus) - 120 ₼",
    calcTransportMinivan: "Vito / Viano VIP Minivan - 180 ₼",
    calcTransportSedan: "Comfort Sedan (4 persons) - 80 ₼",
    calcMeal: "Dining Package",
    calcMealNone: "No meal included (Self pay) - 0 ₼",
    calcMealStandard: "Standard Lunch Set - 18 ₼ / person",
    calcMealNational: "Grand National Feast + Tea Table - 32 ₼ / person",
    calcGuide: "Licensed Tour Guide (+50 ₼)",
    calcInsurance: "Travel Medical Insurance (+5 ₼ / person)",
    calcTotal: "Estimated Total Cost:",
    calcPerPerson: "Per Person:",

    // Reviews Section
    reviewsTitle: "Verified Traveler Reviews",
    reviewsSubtitle: "Feedback from 10,000+ adventurers who experienced tours with TourCheck",

    // Bookings
    bookingsTitle: "My Bookings",
    noBookings: "You have no active bookings yet. Browse tours above and reserve your seats!",
    ticketCode: "Booking Ref",
    totalPrice: "Total Amount",
    cancelBooking: "Cancel",
    printTicket: "View E-Ticket",
    confirmCancel: "Are you sure you want to cancel this booking?",
    bookingCancelled: "Reservation successfully cancelled.",

    // Modals
    modalBookTitle: "Tour Reservation",
    nameLabel: "Full Name",
    phoneLabel: "Phone Number",
    seatsLabel: "Number of Seats",
    totalLabel: "Total Amount to Pay:",
    btnConfirmBooking: "Confirm Reservation",
    modalDetailsTitle: "Tour Comprehensive Details",
    tabOverview: "Overview",
    tabItinerary: "Itinerary Schedule",
    tabIncluded: "Inclusions",
    tabWeather: "Live Weather",
    includedTitle: "Price Includes:",
    excludedTitle: "Price Excludes:",

    // Ticket Pass Modal
    ticketPassTitle: "Official Boarding E-Ticket (Voucher)",
    ticketStatus: "CONFIRMED",
    ticketGuest: "Traveler Name",
    ticketTour: "Tour Name",
    ticketMeeting: "Pick-up / Meeting Point",
    ticketDateTime: "Departure Date & Time",
    ticketSeats: "Seat Quantity",
    ticketAmount: "Total Paid",
    ticketNotice: "Please arrive at the departure point at least 15 minutes prior to scheduled departure time.",
    btnPrint: "Print / Save Pass",
    btnClose: "Close",

    // Toast & Alerts
    bookingSuccess: "Booking confirmed successfully! Your digital e-ticket is ready.",
    fillAllFields: "Please fill out all required fields properly.",
    exceedSeats: "Sorry, not enough seats remaining for this time slot.",

    // Footer
    footerDesc: "Comfortable, safe, and curated tours throughout all regions of Azerbaijan. Save time with live seat availability checks.",
    footerLinks: "Quick Links",
    footerRegions: "Top Destinations",
    footerContact: "Support & Contact",
    footerCopyright: "All rights reserved. TourCheck Platform."
  },

  ru: {
    // Header & Nav
    siteTitle: "TourCheck — Туры по Азербайджану и Онлайн Проверка Мест",
    navSearch: "Поиск",
    navLiveCheck: "Онлайн проверка",
    navRegions: "Регионы",
    navTours: "Каталог туров",
    navTips: "Советы",
    navCalculator: "Калькулятор",
    navWishlist: "Избранное",
    navBookings: "Мои брони",

    // Hero
    heroBadge: "🇦🇿 Ведущая платформа туров и билетов по Азербайджану",
    heroTitle: "От Шуши до Шахдага: Проверка туров и свободных мест в реальном времени",
    heroDesc: "Выберите регион, проверьте бюджет, мгновенно увидьте оставшиеся места и забронируйте билет в один клик.",
    heroBtnExplore: "Смотреть туры",
    heroBtnLive: "Онлайн подбор по бюджету",
    statTours: "Активных туров",
    statRegions: "Городов и районов",
    statSatisfaction: "Довольных туристов",
    statLiveSeats: "Контроль мест онлайн",

    // Live Budget Checker
    liveCheckTitle: "Онлайн проверка бюджета и мест",
    liveCheckSubtitle: "Укажите ваш бюджет и предпочтения — умная система мгновенно подберет подходящие туры и локации!",
    liveBudgetLabel: "Ваш бюджет (на человека)",
    liveRegionLabel: "Желаемый регион",
    liveVibeLabel: "Тип тура",
    livePersonsLabel: "Количество человек",
    allRegions: "Все регионы",
    allVibes: "Все типы",
    vibeNature: "Горы и природа",
    vibeCulture: "История и культура",
    vibeAdventure: "Приключения и экстрим",
    vibeRelax: "Отдых и гастрономия",
    vibeFamily: "Семейный отдых",
    liveMatchHeader: "Результат онлайн-подбора",
    liveMatchScore: "Индекс соответствия",
    liveBudgetMatchFound: "предложений найдено под ваш бюджет",
    liveBudgetTip: "Умный совет",
    liveRemainingBudget: "Остаток бюджета:",
    liveBookNow: "Забронировать",
    liveViewDetails: "Подробнее",
    liveNoMatch: "Туров под указанный бюджет не найдено. Попробуйте немного увеличить сумму.",

    // Region Showcase
    regionSectionTitle: "Популярные туристические регионы",
    regionSectionSubtitle: "Выберите живописный уголок Азербайджана и изучите туры",
    regionToursCount: "туров доступно",
    regionFilterBtn: "Смотреть туры",

    // Search & Catalog
    catalogTitle: "Каталог туров и локаций",
    catalogSubtitle: "Фильтруйте по дате, времени и стоимости, проверяя свободные места онлайн",
    searchPlaceholder: "Поиск тура или локации по ключевым словам...",
    filterCity: "Регион / Город",
    filterCategory: "Категория",
    filterDate: "Дата",
    filterTimeAfter: "Время после",
    filterMinSeats: "Необходимо мест",
    filterMaxPrice: "Макс. цена (₼)",
    filterOnlyAvailable: "Только с местами",
    filterEntranceIncluded: "Только с включенными билетами",
    btnSearch: "Найти",
    btnReset: "Сбросить",
    sortBy: "Сортировка:",
    sortTime: "По раннему времени",
    sortPriceLow: "Цена: от дешевых",
    sortPriceHigh: "Цена: от дорогих",
    sortSeats: "Больше свободных мест",
    sortRating: "Высокий рейтинг",

    // Tour Card
    perPerson: "за человека",
    duration: "Длительность",
    meetingPoint: "Место сбора",
    entranceInfo: "Вход и билеты",
    seatsAvailable: "мест свободно",
    seatsLow: "Осталось всего {n} мест!",
    seatsNone: "Мест нет",
    btnReserve: "Забронировать",
    btnDetails: "Подробнее",
    addedToWishlist: "Добавлено в избранное",
    removedFromWishlist: "Удалено из избранного",

    // Recommendations & Tips
    tipsSectionTitle: "Рекомендации путешественникам",
    tipsSectionSubtitle: "Золотые советы от местных лицензированных гидов перед поездкой",
    tip1Title: "Что взять с собой в Шахдаг и Губу?",
    tip1Desc: "Погода в горах переменчива. Теплая ветрозащитная куртка, треккинговая обувь и паспорт обязательны.",
    tip2Title: "Гастрономия в Шеки и Габале",
    tip2Desc: "Обязательно попробуйте настоящий пити в глиняном горшочке, шекинскую пахлаву/халву и габалинское кюкю.",
    tip3Title: "Национальные парки и вход",
    tip3Desc: "Вход в нацпарки Гёйгёль и Шахдаг стоит 2 AZN (в наших турах экологический сбор уже включен в стоимость).",
    tip4Title: "Гобустан и Грязевые вулканы",
    tip4Desc: "Лучшее время для фотосъемки — утро с 09:00 до 11:00. Студентам предоставляется скидка 50% в музее.",

    // Calculator Section
    calcTitle: "Калькулятор индивидуальных туров",
    calcSubtitle: "Рассчитайте точную смету для вашей семьи или компании друзей заранее",
    calcRegion: "Регион поездки",
    calcPersons: "Количество туристов",
    calcTransport: "Тип транспорта",
    calcTransportSprinter: "Mercedes Sprinter (комфортный микроавтобус) - 120 ₼",
    calcTransportMinivan: "Vito / Viano VIP Минивэн - 180 ₼",
    calcTransportSedan: "Комфортный седан (до 4 чел) - 80 ₼",
    calcMeal: "Питание",
    calcMealNone: "Без питания (самостоятельно) - 0 ₼",
    calcMealStandard: "Стандартный комплексный обед - 18 ₼ / чел",
    calcMealNational: "Богатый национальный стол + чайная церемония - 32 ₼ / чел",
    calcGuide: "Услуги лицензированного гида (+50 ₼)",
    calcInsurance: "Туристическая страховка (+5 ₼ / чел)",
    calcTotal: "Итоговая сумма:",
    calcPerPerson: "На человека:",

    // Reviews Section
    reviewsTitle: "Отзывы туристов",
    reviewsSubtitle: "Впечатления 10,000+ путешественников, открывших Азербайджан с TourCheck",

    // Bookings
    bookingsTitle: "Мои бронирования",
    noBookings: "У вас пока нет активных бронирований. Выберите понравившийся тур выше!",
    ticketCode: "Номер билета",
    totalPrice: "Общая сумма",
    cancelBooking: "Отменить",
    printTicket: "Электронный билет",
    confirmCancel: "Вы уверены, что хотите отменить эту бронь?",
    bookingCancelled: "Бронь успешно отменена.",

    // Modals
    modalBookTitle: "Бронирование тура",
    nameLabel: "Имя и фамилия",
    phoneLabel: "Контактный телефон",
    seatsLabel: "Количество мест",
    totalLabel: "Сумма к оплате:",
    btnConfirmBooking: "Подтвердить бронь",
    modalDetailsTitle: "Подробная информация о туре",
    tabOverview: "Обзор",
    tabItinerary: "Программа маршрута",
    tabIncluded: "Включено в цену",
    tabWeather: "Погода",
    includedTitle: "В стоимость входит:",
    excludedTitle: "Не входит в стоимость:",

    // Ticket Pass Modal
    ticketPassTitle: "Официальный электронный билет (Ваучер)",
    ticketStatus: "ПОДТВЕРЖДЕНО",
    ticketGuest: "Пассажир",
    ticketTour: "Название тура",
    ticketMeeting: "Точка сбора",
    ticketDateTime: "Дата и время",
    ticketSeats: "Количество мест",
    ticketAmount: "Оплачено",
    ticketNotice: "Пожалуйста, прибывайте на место сбора минимум за 15 минут до отправления.",
    btnPrint: "Печать / Сохранить",
    btnClose: "Закрыть",

    // Toast & Alerts
    bookingSuccess: "Бронирование успешно подтверждено! Ваш электронный билет готов.",
    fillAllFields: "Пожалуйста, заполните все обязательные поля.",
    exceedSeats: "К сожалению, на этот сеанс недостаточно свободных мест.",

    // Footer
    footerDesc: "Комфортные и безопасные туры по всем регионам Азербайджана. Экономьте время с онлайн-проверкой свободных мест.",
    footerLinks: "Полезные ссылки",
    footerRegions: "Топ регионы",
    footerContact: "Контакты и поддержка",
    footerCopyright: "Все права защищены. Платформа TourCheck."
  }
};

let currentLang = (typeof localStorage !== "undefined" ? localStorage.getItem("tourcheck_lang") : null) || "az";

function t(key, replacements = {}) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.az;
  let text = dict[key] || TRANSLATIONS.az[key] || key;
  for (const [k, v] of Object.entries(replacements)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }
  return text;
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("tourcheck_lang", lang);
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
    updatePageLanguage();
  }
  if (typeof render === "function") render();
  if (typeof renderLiveChecker === "function") renderLiveChecker();
  if (typeof renderRegions === "function") renderRegions();
  if (typeof renderBookings === "function") renderBookings();
  if (typeof updateCalculator === "function") updateCalculator();
}

function updatePageLanguage() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t(key);
  });
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.dataset.i18nTitle;
    el.title = t(key);
  });

  // Active language buttons state
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
}

