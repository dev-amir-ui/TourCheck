/* Zəngin Azərbaycan turları, bölgələr, rəylər və bələdçi məlumatları */

const REGIONS_DATA = [
  {
    id: "baku",
    name: "Bakı & Abşeron",
    image: "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80",
    weather: { temp: "22°C", text: "Açıq hava", icon: "☀️" },
    tag: "Paytaxt & Tarix",
    desc: "Qədim İçərişəhər, alov qüllələri, palçıq vulkanları və Xəzər sahili."
  },
  {
    id: "quba",
    name: "Quba & Xınalıq",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    weather: { temp: "15°C", text: "Sərin dağ havası", icon: "⛅" },
    tag: "Dağ & Meşə",
    desc: "Qəçrəş meşəliyi, Qırmızı Qəsəbə və 2300m yüksəklikdə yerləşən Xınalıq kəndi."
  },
  {
    id: "qusar",
    name: "Qusar & Şahdağ",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    weather: { temp: "11°C", text: "Dağ mehi", icon: "🏔️" },
    tag: "Qış & Macəra",
    desc: "Şahdağ Dağ-Xizək Kurortu, Laza donmuş şəlalələri və unikal kanyonlar."
  },
  {
    id: "gabala",
    name: "Qəbələ",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    weather: { temp: "19°C", text: "Mülayim", icon: "🌤️" },
    tag: "Teleferik & Göllər",
    desc: "Tufandağ teleferiki, Nohurgöl mənzərəsi və Yeddi Gözəl şəlaləsi."
  },
  {
    id: "sheki",
    name: "Şəki",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    weather: { temp: "20°C", text: "Gözəl hava", icon: "☀️" },
    tag: "Tarixi İrs & Piti",
    desc: "UNESCO irsi Şəki Xan Sarayı, Karvansara və Kiş Alban Məbədi."
  },
  {
    id: "lenkeran",
    name: "Lənkəran & Lerik",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    weather: { temp: "23°C", text: "Subtropik istilik", icon: "🌿" },
    tag: "Çay & Sitrus",
    desc: "Xanbulan gölü, Hirkan meşələri, çay plantasiyaları və Lənkəran ləvəngisi."
  },
  {
    id: "goygol",
    name: "Gəncə & Göygöl",
    image: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=800&q=80",
    weather: { temp: "17°C", text: "Şəffaf səma", icon: "🏞️" },
    tag: "Milli Park & Göl",
    desc: "Kəpəz dağının ətəyindəki zümrüd Göygöl və füsunkar Maralgöl."
  },
  {
    id: "shusha",
    name: "Şuşa & Qarabağ",
    image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80",
    weather: { temp: "16°C", text: "Təmiz dağ havası", icon: "🏰" },
    tag: "Mədəniyyət Beşiyi",
    desc: "Cıdır Düzü, İsa Bulağı, Şuşa Qalası və Yuxarı Gövhər Ağa Məscidi."
  },
  {
    id: "ismayilli",
    name: "İsmayıllı & Lahıc",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    weather: { temp: "18°C", text: "Təmiz hava", icon: "🍃" },
    tag: "Qədim Sənətkarlıq",
    desc: "Daş döşəməli küçələr, qədim misgərlik emalatxanaları və Asma körpü."
  }
];

const TOURS = [
  {
    id: "quba-xinaliq",
    name: {
      az: "Xınalıq Kəndi və Qəçrəş Meşəsi Dağ Macərası",
      en: "Khinalug Village & Gachresh Forest Mountain Expedition",
      ru: "Высокогорное село Хыналыг и реликтовый лес Гечреш"
    },
    city: "Quba",
    category: "Macəra",
    vibe: "adventure",
    place: "20 Yanvar metro stansiyası (Azercell önü)",
    times: ["07:00", "07:30"],
    duration: "13 saat",
    price: 50,
    capacity: 16,
    rating: 4.9,
    reviews: 148,
    isPopular: true,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "Dünyanın ən hündür yaşayış məntəqələrindən biri olan unikal Xınalıq kəndinə unudulmaz səyahət və Quba meşəliklərində samovar çayı.",
      en: "An epic high-altitude trek to one of the world's oldest inhabited mountain settlements, followed by forest tea by the river.",
      ru: "Захватывающая поездка в одно из самых высокогорных и древних сёл Европы с чаепитием в лесу Гечреш."
    },
    entrance: "Milli Park və Kənd İrsi biletləri qiymətə daxildir",
    highlights: ["Xınalıq Etnodiyar Muzeyi", "Qudyalçay Kanyonu", "Qəçrəş meşə zolağı", "Dağ uaz transferi"],
    included: ["Komfortlu mikroavtobus", "Peşəkar dağ bələdçisi", "Səhər yeməyi", "Milli Park giriş rüsumu", "Fotoçəkiliş"],
    excluded: ["Nahar yeməyi", "Fərdi suvenirlər"],
    gearTips: ["İsti dağ gödəkçəsi", "Möhkəm idman ayaqqabısı", "Şəxsiyyət vəsiqəsi"],
    itinerary: [
      { time: "07:00", title: "Bakıdan hərəkət", desc: "20 Yanvar metrosundan komfortlu Sprinterlə çıxış." },
      { time: "09:30", title: "Qubada səhər yeməyi", desc: "Qəçrəş meşəsində kənd pendiri və isti təndir çörəyi." },
      { time: "11:30", title: "Qudyalçay Kanyonu", desc: "Füsunkar kanyon boyu foto fasiləsi və dağ yolları." },
      { time: "13:00", title: "Xınalıq Kəndinə çatış", desc: "Tarixi evlər, yerli sakinlər, muzey və dağ mənzərəsi." },
      { time: "16:00", title: "Dönüş və çay süfrəsi", desc: "Meşədə samovar çayı və Bakıya qayıdış." }
    ]
  },
  {
    id: "gabala-tufandag",
    name: {
      az: "Qəbələ Tufandağ Teleferik, Nohurgöl və Yeddi Gözəl",
      en: "Gabala Tufandag Cable Car, Nohur Lake & 7 Beauties",
      ru: "Габала: Канатная дорога Туфандаг, озеро Нохур и водопад"
    },
    city: "Qəbələ",
    category: "Ailəvi",
    vibe: "family",
    place: "Gənclik metro stansiyası (Stadion tərəf)",
    times: ["07:30", "08:15"],
    duration: "12 saat",
    price: 48,
    capacity: 20,
    rating: 4.8,
    reviews: 215,
    isPopular: true,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "Tufandağ kanat xətti ilə dağların zirvəsinə qalxın, göl kənarında qayıqla gəzin və füsunkar şəlalə mənzərəsindən zövq alın.",
      en: "Ascend to mountain peaks via Tufandag cable cars, enjoy peaceful boat rides on lake Nohur and scenic waterfalls.",
      ru: "Поднимитесь на канатной дороге на вершины Туфандага, прокатитесь на катамаранах по озеру Нохур."
    },
    entrance: "Nohurgöl ərazisi və şəlaləyə giriş daxildir (Teleferik bileti daxildir)",
    highlights: ["Tufandağ teleferiki (4 xətt)", "Nohurgöl qayıq gəzintisi", "Yeddi Gözəl şəlaləsi"],
    included: ["Komfortlu nəqliyyat", "Tur rəhbəri", "Səhər çay süfrəsi", "Teleferik kartı", "Sığorta"],
    excluded: ["Göl kənarında fərdi qayıq icarəsi", "Nahar"],
    gearTips: ["Rahat gəzinti geyimi", "Gün eynəyi", "Powerbank"],
    itinerary: [
      { time: "07:30", title: "Yola düşmə", desc: "Gənclik metrosundan hərəkət." },
      { time: "10:30", title: "Nohurgöl gəzintisi", desc: "Göl ətrafında meşə mehi və foto çəkilişləri." },
      { time: "12:30", title: "Tufandağ Kompleksi", desc: "Kanatla zirvələrə qalxış və dağ restoranları." },
      { time: "15:30", title: "Yeddi Gözəl Şəlaləsi", desc: "Pilləkanlarla şəlalənin füsunkar pillələrinə qalxış." },
      { time: "18:00", title: "Bakıya qayıdış", desc: "Komfortlu yol və axşam saat 21:00-da çatma." }
    ]
  },
  {
    id: "sheki-khan-palace",
    name: {
      az: "Şəki Xan Sarayı, Karvansara və Kiş Alban Məbədi",
      en: "Sheki Khan's Palace, Karvansaray & Kish Albanian Church",
      ru: "Дворец Шекинских Ханов, Караван-сарай и древний храм Киш"
    },
    city: "Şəki",
    category: "Mədəniyyət",
    vibe: "culture",
    place: "Bakı Beynəlxalq Avtovağzal kompleksi",
    times: ["06:45"],
    duration: "14 saat",
    price: 55,
    capacity: 18,
    rating: 4.95,
    reviews: 182,
    isPopular: true,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "UNESCO irsi büllur şəbəkəli Xan Sarayı, tarixi Karvansaray, qədim Kiş məbədi və məşhur Şəki pitisi dequstasiyası.",
      en: "Discover the UNESCO-listed stained glass Sheki Khan Palace, ancient silk road caravanserais, and authentic clay pot Piti.",
      ru: "Посетите шедевр ЮНЕСКО — Дворец Ханов с витражами шебеке, древний храм Киш и попробуйте знаменитый шекинский пити."
    },
    entrance: "Xan Sarayı və Kiş Məbədi rəsmi giriş biletləri daxildir",
    highlights: ["Şəki Xan Sarayı (Şəbəkə sənəti)", "Yuxarı Karvansara", "Kiş Alban Məbədi", "Şəki Halvası mağazaları"],
    included: ["Mersedes Sprinter nəqliyyat", "Tarixçi bələdçi", "Muzey biletləri", "Şəki halvası dequstasiyası"],
    excluded: ["Piti nahar menyusu (əlavə 15 ₼)"],
    gearTips: ["Rahat ayaqqabı", "Fotoaparat", "Nağd xərclik (halva alış-verişi üçün)"],
    itinerary: [
      { time: "06:45", title: "Çıxış", desc: "Bakıdan Şəkiyə doğru səfərin başlanması." },
      { time: "11:30", title: "Kiş Alban Məbədi", desc: "Qafqazın ən qədim xristian məbədlərindən biri ilə tanışlıq." },
      { time: "13:00", title: "Məşhur Şəki Pitisi naharı", desc: "Tarixi Şəki restoranında ənənəvi piti süfrəsi." },
      { time: "14:30", title: "Şəki Xan Sarayı", desc: "Mıx və yapışqansız hazırlanan şəbəkə pəncərələr və freskalar." },
      { time: "16:30", title: "Karvansara və Halva bazarı", desc: "İpək yolu karvansarası və təzə şirniyyat alış-verişi." }
    ]
  },
  {
    id: "qusar-shahdag",
    name: {
      az: "Şahdağ Qış-Yay İstirahət Kompleksi və Laza Şəlaləsi",
      en: "Shahdag Mountain Resort & Frozen Laza Waterfalls",
      ru: "Курорт Шахдаг и живописные водопады горного села Лаза"
    },
    city: "Qusar",
    category: "Macəra",
    vibe: "adventure",
    place: "20 Yanvar metrosu (Velotrek yanı)",
    times: ["07:00", "08:00"],
    duration: "13 saat",
    price: 45,
    capacity: 22,
    rating: 4.85,
    reviews: 310,
    isPopular: true,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "Azərbaycanın ən böyük dağ kurortunda kanat gəzintisi, coaster attraksionu və Laza kəndinin möhtəşəm şəlalələri.",
      en: "Experience adrenaline at Shahdag Mountain Resort with alpine coasters, ski tracks, cable lifts, and dramatic waterfalls.",
      ru: "Горные развлечения в Шахдаге, альпийский родельбан (коастер), канатные дороги и сказочные водопады Лазы."
    },
    entrance: "Kompleksə və Milli Park zonasına giriş daxildir",
    highlights: ["Şahdağ Coaster (Rodelbahn)", "Teleferik mənzərəsi", "Laza dağ kəndi şəlalələri"],
    included: ["VIP nəqliyyat", "Tur rəhbəri", "Səhər çayı", "Kompleksə giriş bileti"],
    excluded: ["Xizək / Tubing / Coaster biletləri (ərazidə seçilir)"],
    gearTips: ["Termal geyim", "Eynək və əlcək", "Su keçirməyən çəkmə"],
    itinerary: [
      { time: "07:00", title: "Bakıdan çıxış", desc: "Qusar istiqamətinə yola düşmə." },
      { time: "10:30", title: "Laza Kəndi", desc: "Qayalıqların arasındakı büllur şəlalələrə piyada yürüş." },
      { time: "12:30", title: "Şahdağ Turizm Mərkəzi", desc: "Kanat, rodelbahn, kvadrosikl və sərbəst istirahət." },
      { time: "17:00", title: "Toplanış və qayıdış", desc: "Dağ havası ilə zənginləşmiş günün sonu." }
    ]
  },
  {
    id: "baku-gobustan-mud",
    name: {
      az: "Qobustan Qaya Rəsmləri və Canlı Palçıq Vulkanları",
      en: "Gobustan Rock Petroglyphs & Active Mud Volcanoes",
      ru: "Наскальные рисунки Гобустана и грязевые вулканы"
    },
    city: "Bakı",
    category: "Təbiət",
    vibe: "nature",
    place: "28 May metro stansiyası (Dəmiryol Vağzalı tərəf)",
    times: ["09:00", "13:30"],
    duration: "5 saat",
    price: 35,
    capacity: 15,
    rating: 4.9,
    reviews: 195,
    isPopular: false,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "40,000 illik qədim qaya rəsmləri, interaktiv muzey və dünyanın ən aktiv qaynayan palçıq vulkanlarına maraqlı ekskursiya.",
      en: "Witness 40,000-year-old prehistoric rock petroglyphs, sound stones, and bubbling mud volcanoes in a half-day tour.",
      ru: "Древнейшие наскальные рисунки эпохи мезолита, интерактивный музей и бурлящие грязевые сопки."
    },
    entrance: "Qobustan Dövlət Tarixi Qoruğu biletləri daxildir",
    highlights: ["Qobustan Qoruğu və Qavaldaş", "İnteraktiv 3D Muzey", "Aktiv palçıq vulkanları sahəsi"],
    included: ["Klimalı mikroavtobus", "İngilis/Azərbaycan dili bələdçi", "Bütün muzey biletləri", "Su"],
    excluded: ["Palçıq vulkanlarına UAZ taksi (əlavə 5 ₼)"],
    gearTips: ["Giriş üçün tələbə vəsiqəsi (varsa)", "Toz keçirməyən idman ayaqqabısı"],
    itinerary: [
      { time: "09:00", title: "28 Maydan çıxış", desc: "Xəzər sahili boyu Qobustana hərəkət." },
      { time: "10:00", title: "Qobustan Muzeyi və Qayalıqlar", desc: "Petroqliflər və Qavaldaş musiqi daşının nümayişi." },
      { time: "12:00", title: "Palçıq Vulkanları", desc: "Ay mənzərəsini xatırladan vulkan kraterləri." },
      { time: "14:00", title: "Bakı mərkəzinə qayıdış", desc: "Turu 28 May metrosunda tamamlama." }
    ]
  },
  {
    id: "lenkeran-khanbulan",
    name: {
      az: "Lənkəran Xanbulan Gölü, Çay Plantasiyaları və Lerik",
      en: "Lankaran Lake Khanbulan, Tea Plantations & Lerik",
      ru: "Ленкорань: озеро Ханбулан, чайные плантации и Лерик"
    },
    city: "Lənkəran",
    category: "Qastronomiya",
    vibe: "relax",
    place: "Elmlər Akademiyası metro stansiyası",
    times: ["07:00"],
    duration: "14 saat",
    price: 42,
    capacity: 18,
    rating: 4.88,
    reviews: 134,
    isPopular: true,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "Hirkan Milli Parkının qəlbində zümrüd Xanbulan gölü, ətirli Lənkəran çay plantasiyaları və Lerik uzunömürlülər diyarı.",
      en: "Tranquil Khanbulan lake nestled in Hirkan forest, aromatic tea fields, citrus orchards, and famed Lerik waterfalls.",
      ru: "Изумрудное озеро Ханбулан среди реликтовых гирканских лесов, чайные плантации и родина долгожителей — Лерик."
    },
    entrance: "Hirkan Milli Parkı rüsumu daxildir",
    highlights: ["Xanbulan meşə gölü", "Lənkəran çay sahələri", "Təbəssüm şəlaləsi Lerik", "Milli Ləvəngi süfrəsi"],
    included: ["Komfortlu nəqliyyat", "Bələdçi", "Milli parka giriş", "Təbii Lənkəran çayı ikramı"],
    excluded: ["Ləvəngili günorta naharı"],
    gearTips: ["Nəm keçirməyən geyim", "Rahat ayaqqabı"],
    itinerary: [
      { time: "07:00", title: "Elmlər Akademiyasından çıxış", desc: "Cənub subtropik zonasına səyahət." },
      { time: "10:30", title: "Lənkəran Çay Fabriki və Plantasiya", desc: "Təzə çay yarpaqlarının toplanması və dequstasiya." },
      { time: "12:00", title: "Xanbulan Gölü", desc: "Göl ətrafında sakit təbiət gəzintisi və foto fasiləsi." },
      { time: "14:30", title: "Lerik Meşələri və Şəlalə", desc: "Dağ havası və büllur su bulaqları." },
      { time: "17:30", title: "Bakıya dönüş", desc: "Axşam Bakıya qayıdış." }
    ]
  },
  {
    id: "goygol-maralgol",
    name: {
      az: "Göy-Göl Milli Parkı və Maralgöl Təbiət Möcüzəsi",
      en: "Goygol National Park & Fairytale Lake Maralgol",
      ru: "Национальный парк Гёйгёль и озеро Маралгёль"
    },
    city: "Gəncə",
    category: "Təbiət",
    vibe: "nature",
    place: "Bakı Dəmiryol Vağzalı (Sürət qatarı / Mikroavtobus)",
    times: ["06:30"],
    duration: "16 saat",
    price: 65,
    capacity: 16,
    rating: 4.96,
    reviews: 240,
    isPopular: true,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "Kəpəz dağının ətəyində yerləşən Azərbaycanın incisi Göygöl və dağların qoynundakı Maralgölə xüsusi safari transferi.",
      en: "Discover Azerbaijan's emerald jewel lake Goygol beneath Mount Kapaz, along with mystical mountain lake Maralgol.",
      ru: "Жемчужина Азербайджана — чистейшее озеро Гёйгёль у подножия горы Кяпаз и высокогорное озеро Маралгёль."
    },
    entrance: "Göygöl Milli Parkına giriş rüsumu daxildir",
    highlights: ["Göygöl panoraması", "Maralgölə xüsusi mikroavtobus marşrutu", "Nizami Gəncəvi Məqbərəsi"],
    included: ["Komfortlu transfer", "Peşəkar bələdçi", "Milli Park biletləri", "Səhər yeməyi"],
    excluded: ["Gəncə paxlavası alış-verişi", "Nahar"],
    gearTips: ["Sərin hava üçün qalın gödəkçə", "Rahat idman ayaqqabısı"],
    itinerary: [
      { time: "06:30", title: "Yola düşmə", desc: "Gəncə istiqamətinə sürətli və rahat transfer." },
      { time: "11:30", title: "Göygöl Milli Parkı", desc: "Göygöl sahili boyu təbiət gəzintisi." },
      { time: "13:30", title: "Maralgölə keçid", desc: "Xüsusi transfer və Maralgölün büllur mənzərəsi." },
      { time: "16:00", title: "Gəncə şəhər gəzintisi", desc: "Şüşə körpü və tarixi Xan bağı." },
      { time: "17:30", title: "Bakıya qayıdış", desc: "Yolda çay fasiləsi və Bakıya çatma." }
    ]
  },
  {
    id: "baku-old-city-full",
    name: {
      az: "Qədim İçərişəhər, Qız Qalası və Şirvanşahlar Sarayı",
      en: "Old City Baku, Maiden Tower & Shirvanshahs Palace",
      ru: "Старый Город Баку (Ичеришехер), Девичья Башня и дворец"
    },
    city: "Bakı",
    category: "Tarix",
    vibe: "culture",
    place: "İçərişəhər metro çıxışı (Qoşa Qala Qapıları)",
    times: ["10:00", "14:30", "17:30"],
    duration: "3 saat",
    price: 25,
    capacity: 15,
    rating: 4.92,
    reviews: 320,
    isPopular: false,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "Bakının ürəyi olan minillik İçərişəhərin qədim küçələri, Şirvanşahlar saray kompleksi, sirli Qız Qalası və Miniatür Kitab Muzeyi.",
      en: "Walk through medieval Baku alleyways, Shirvanshahs Palace, legendary Maiden Tower, and filming locations of classic cinema.",
      ru: "Погрузитесь в тайны средневекового Ичеришехер, Дворца Ширваншахов и легендарной Девичьей Башни."
    },
    entrance: "Şirvanşahlar Sarayı və Qız Qalası rəsmi biletləri daxildir",
    highlights: ["Qoşa Qala Qapıları", "Şirvanşahlar Sarayı", "Qız Qalası müşahidə meydançası", "Çırtma / 'Brilliantovaya Ruka' küçəsi"],
    included: ["Peşəkar sertifikatlı bələdçi", "Muzey biletləri", "Qulaqlıq audio sistemi", "Milli paxlava və çay"],
    excluded: ["Fərdi xərclər"],
    gearTips: ["Daş küçələr üçün rahat ayaqqabı", "Fotoaparat"],
    itinerary: [
      { time: "10:00", title: "Qoşa Qala Qapısında görüş", desc: "Tarixi qala divarları haqqında hekayə." },
      { time: "10:45", title: "Şirvanşahlar Sarayı", desc: "Taxt zalı, türbələr və qədim hamam qalıqları." },
      { time: "11:45", title: "Məşhur kino küçələri", desc: "Brilyant Əl filminin çəkildiyi məkanlar." },
      { time: "12:30", title: "Qız Qalası və dam panoraması", desc: "Xəzər dənizinə açılan möhtəşəm mənzərə." }
    ]
  },
  {
    id: "ismayilli-lahic-craft",
    name: {
      az: "Lahıc Misgərlik Qəsəbəsi və Asma Körpü Macərası",
      en: "Lahic Copper Craft Village & Hanging Bridge Tour",
      ru: "Поселок медников Лагич и знаменитый подвесной мост"
    },
    city: "İsmayıllı",
    category: "Mədəniyyət",
    vibe: "culture",
    place: "Koroğlu metro stansiyası (Piramida önü)",
    times: ["08:00"],
    duration: "11 saat",
    price: 38,
    capacity: 18,
    rating: 4.82,
    reviews: 110,
    isPopular: false,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "Qədim kanalizasiya sistemi, çəkic səsləri gələn misgər dükanları, daş evlər və Qirdiman çayı üzərində həyəcanverici Asma Körpü.",
      en: "Explore cobblestone alleys of master coppersmiths, century-old water systems, and the thrilling footbridge over the canyon.",
      ru: "Аутентичный Лагич: звон молотков в мастерских медников, древние мощеные улочки и подвесной мост над каньоном."
    },
    entrance: "Tarix-Diyarşünaslıq Muzeyi bileti daxildir",
    highlights: ["Lahıc Misgərlik emalatxanaları", "Zərgərlik və əl sənətləri", "İsmayıllı Asma körpüsü"],
    included: ["Komfortlu nəqliyyat", "Bələdçi", "Muzey girişi", "Kənd çay dəstgahı"],
    excluded: ["Mis suvenirlər", "Nahar"],
    gearTips: ["Daş küçələr üçün möhkəm ayaqqabı", "Nağd pul"],
    itinerary: [
      { time: "08:00", title: "Bakıdan hərəkət", desc: "Şamaxı dolamaları ilə İsmayıllıya doğru səfər." },
      { time: "10:30", title: "Asma Körpü keçidi", desc: "Kanyon üzərində yellənən körpüdə adrenalin və fotolar." },
      { time: "11:45", title: "Lahıc Qəsəbəsi", desc: "Ustaların canlı mis döymə nümayişləri və muzey ziyarəti." },
      { time: "15:00", title: "İsmayıllı meşəsində samovar", desc: "Meşə qoynunda yerli kəklikotu çayı." },
      { time: "17:00", title: "Bakıya dönüş", desc: "Axşam saat 19:30-da çatma." }
    ]
  },
  {
    id: "shusha-qarabag-history",
    name: {
      az: "Şuşa Cıdır Düzü, Qala Divarları və İsa Bulağı Ziyarəti",
      en: "Shusha Jidir Duzu, Fortress Walls & Isa Spring Visit",
      ru: "Шуша: плато Джыдыр Дюзю, Шушинская крепость и Иса Булагы"
    },
    city: "Şuşa",
    category: "Tarix",
    vibe: "culture",
    place: "Bakı Heydər Əliyev Mərkəzi yanı",
    times: ["06:00"],
    duration: "18 saat",
    price: 95,
    capacity: 20,
    rating: 5.0,
    reviews: 280,
    isPopular: true,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "Azərbaycanın mədəniyyət paytaxtı Şuşaya xüsusi icazəli rəsmi səyahət: Cıdır Düzü panoraması, Molla Pənah Vaqif məqbərəsi və Xan Qızı Natəvanın evi.",
      en: "A profoundly historic journey to Shusha: legendary Jidir Duzu cliffs, fortress gates, Govhar Agha mosque, and spring waters.",
      ru: "Официальный исторический тур в Шушу: легендарная равнина Джыдыр Дюзю, крепостные стены, мавзолей Вагифа."
    },
    entrance: "Dövlət portalı rəsmi icazə və qoruq biletləri daxildir",
    highlights: ["Cıdır Düzü qayalıqları", "Şuşa Qala divarları", "Yuxarı Gövhər Ağa Məscidi", "İsa Bulağı"],
    included: ["VIP Mercedes Sprinter", "Sertifikatlı Qarabağ bələdçisi", "Rəsmi giriş icazələri", "Səhər və nahar yeməyi", "Sığorta"],
    excluded: ["Fərdi xərclər"],
    gearTips: ["Şəxsiyyət vəsiqəsi (ƏSLİ MÜTLƏQDİR)", "Rahat ayaqqabı", "İsti jaket"],
    itinerary: [
      { time: "06:00", title: "Bakıdan Zəfər Yolu ilə çıxış", desc: "Füzuli və Şuşa istiqamətinə hərəkət." },
      { time: "11:30", title: "Şuşaya giriş", desc: "Gəncə Qapısı və Qala Divarlarında qarşılanma." },
      { time: "12:30", title: "Cıdır Düzü", desc: "Dərin dərə mənzərəsi, Daşaltı çayı və əfsanəvi Cıdır Düzü." },
      { time: "14:30", title: "Vaqif Türbəsi və Gövhər Ağa Məscidi", desc: "Tarixi memarlıq inciləri ilə tanışlıq." },
      { time: "16:30", title: "İsa Bulağı fasiləsi", desc: "Büllur bulaq suyu və çay süfrəsi." },
      { time: "18:00", title: "Dönüş", desc: "Bakıya rahat və təhlükəsiz qayıdış." }
    ]
  },
  {
    id: "absheron-ateshgah-yanardag",
    name: {
      az: "Abşeron İrsi: Atəşgah Məbədi və Əbədi Yanan Yanardağ",
      en: "Absheron Heritage: Ateshgah Fire Temple & Yanardag",
      ru: "Наследие Апшерона: Храм огня Атешгях и горящая гора Янардаг"
    },
    city: "Bakı",
    category: "Tarix",
    vibe: "culture",
    place: "Gənclik Mall önü",
    times: ["10:30", "15:00", "18:30"],
    duration: "4 saat",
    price: 30,
    capacity: 16,
    rating: 4.87,
    reviews: 165,
    isPopular: false,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "Odlar Yurdu Azərbaycanın əfsanəvi məbədi Atəşgah və minilliklərdir sönməyən təbii qaz mənbəyi Yanardağ kompleksi.",
      en: "Explore the sacred 17th-century Fire Temple of Surakhani and the naturally burning hillside of Yanardag at dusk.",
      ru: "Узнайте историю Страны Огней: древний храм зороастрийцев Атешгях и негаснущее пламя горы Янардаг."
    },
    entrance: "Hər iki dövlət qoruğuna rəsmi bilet daxildir",
    highlights: ["Atəşgah hücrələri və qədim yazılar", "Yanardağ amfiteatrı", "Küləkli Mərdəkan Qalası"],
    included: ["Klimalı transfer", "Bələdçi", "Bütün giriş biletləri", "Milli şərbət ikramı"],
    excluded: ["Fərdi xərclər"],
    gearTips: ["Küləyə qarşı eynək", "Fotoaparat"],
    itinerary: [
      { time: "10:30", title: "Gənclikdən çıxış", desc: "Suraxanı qəsəbəsinə transfer." },
      { time: "11:15", title: "Atəşgah Məbədi", desc: "İpək yolu tacirlərinin ibadətgahı və alov ocağı." },
      { time: "13:00", title: "Yanardağ Təbii Qoruğu", desc: "Təbii alov divarı və muzey eksponatları." },
      { time: "14:30", title: "Bakı mərkəzinə dönüş", desc: "Gənclik Mall önündə turu bitirmə." }
    ]
  },
  {
    id: "shamaxi-observatory",
    name: {
      az: "Şamaxı Astrofizika Rəsədxanası və Diri Baba Türbəsi",
      en: "Shamakhi Astrophysical Observatory & Diri Baba Tomb",
      ru: "Шемахинская астрофизическая обсерватория и мавзолей Дири Баба"
    },
    city: "Şamaxı",
    category: "Mədəniyyət",
    vibe: "culture",
    place: "20 Yanvar metro stansiyası",
    times: ["08:30"],
    duration: "9 saat",
    price: 36,
    capacity: 18,
    rating: 4.89,
    reviews: 112,
    isPopular: false,
    entranceIncluded: true,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    desc: {
      az: "Pirqulu dağlarında nəhəng 2 metrlik teleskopla tanışlıq, Şamaxı Cümə Məscidi və qayaya həkk olunmuş sirli Diri Baba türbəsi.",
      en: "Visit one of the largest observatories in the Caucasus atop mount Pirgulu, ancient Juma Mosque, and the rock-carved Diri Baba mausoleum.",
      ru: "Посетите знаменитую обсерваторию в Пиргулу, древнейшую Джума-мечеть и двухъярусный скальный мавзолей Дири Баба."
    },
    entrance: "Rəsədxana və Diri Baba muzey biletləri daxildir",
    highlights: ["2-metrlik Teleskop kompleksi", "Qədim Şamaxı Cümə Məscidi", "Qayalıq Diri Baba Türbəsi"],
    included: ["Komfortlu nəqliyyat", "Elmi bələdçi", "Rəsədxana giriş icazəsi", "Səhər çayı"],
    excluded: ["Nahar yeməyi"],
    gearTips: ["Sərin hava üçün jaket", "Şəxsiyyət vəsiqəsi"],
    itinerary: [
      { time: "08:30", title: "Çıxış", desc: "Mərəzə və Şamaxıya hərəkət." },
      { time: "09:45", title: "Diri Baba Türbəsi", desc: "Qaya daxilindəki memarlıq möcüzəsi." },
      { time: "11:30", title: "Şamaxı Cümə Məscidi", desc: "Qafqazın ən qədim məscidlərindən biri." },
      { time: "13:30", title: "Pirqulu Astrofizika Rəsədxanası", desc: "Teleskop və ulduzlar aləmi haqqında ekskursiya." },
      { time: "17:30", title: "Bakıya çatma", desc: "Təhlükəsiz dönüş." }
    ]
  }
];

const TESTIMONIALS = [
  {
    name: "Aysel Məmmədova",
    role: "Fotoqraf & Səyyah",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    tour: "Xınalıq Kəndi Dağ Macərası",
    comment: "Canlı yoxlama funksiyası möhtəşəmdir! 50 AZN büdcə qoydum və dərhal Xınalıq turu çıxdı. Hər şey saatı-saatına dəqiq təşkil olunmuşdu."
  },
  {
    name: "Rəşad Quliyev",
    role: "Ailəvi səyahətçi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    tour: "Qəbələ Tufandağ & Nohurgöl",
    comment: "Uşaqlarla birlikdə getdik. Giriş biletlərinin qiymətə daxil olması və kanat növbəsində gözləməməyimiz böyük üstünlük oldu."
  },
  {
    name: "Elena Smirnova",
    role: "Tourist from Saint Petersburg",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    tour: "Шеки и Дворец Ханов",
    comment: "Прекрасный сервис и очень удобный сайт! Выбрали русский язык, моментально проверили свободные места и получили онлайн ваучер."
  }
];

const DAYS_AHEAD = 10;

