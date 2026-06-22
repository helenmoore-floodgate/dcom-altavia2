// DC + OM — Dragon Child & Old Man · Alta Via 2, June–July 2026.
// Trip content. Route geometry + per-day elevation/stats come from track-data.js (GPS).
const HB = "https://images.squarespace-cdn.com/content/v1/5c7be58cb7c92c5aeea73009";
const WM = (f, w) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=${w || 1600}`;

const trip = {
  brand: "DC + OM",
  expand: "Dragon Child & Old Man",
  who: "Helen & Nick Moore",
  dates: "Bressanone → Feltre · 27 Jun – 9 Jul 2026",
  title: "Alta Via 2",
  featuring: "featuring DC + OM",
  // dramatic, in-focus SUMMER scene around the Pisciadù — the Sella towers in golden light
  hero: WM("Frea pass Sella group Pisciadu Dolomites South Tyrol.jpg", 2400),
  heroCaption: "The Sella towers above the Pisciadù — Passo Gardena, Day 3",
  // four real photos from along the exact route (main-page strip)
  alongTheWay: [
    [WM("Marmolada da Viel del Pan.jpg", 1400), "The Marmolada from the Viel del Pan · Day 4"],
    [WM("Cima di Vezzana and Cimon della Pala, San Martino di Castrozza, Trentino-Alto Adige, Italy, 2025 October.jpg", 1400), "Cimon della Pala, the Pale di San Martino · Day 6"],
    [WM("Lago Pisciadu.jpg", 1400), "Lago Pisciadù under the Sella · Day 3"],
    [WM("La busa delle vette - panoramio.jpg", 1400), "The Busa delle Vette, above Feltre · Day 11"],
  ],
  kicker: "Almost time!!!",
  tagline:
    "Eleven days in which the Old Man cooks the Dragon Child across 153 kilometres of the Dolomites " +
    "on the Alta Via 2 — the Way of Legends.",
  stats: [
    ["153 km", "Bressanone → Feltre"],
    ["~11,400 m", "of climbing"],
    ["11 days", "hut to hut"],
    ["2,952 m", "high point"],
  ],
};

// DC = Dragon Child (Helen, from SF). OM = Old Man (Nick, via London → onward to Joburg).
// hotelKey links a leg's hotel name to logistics link hyperlinks (filled from research).
const logistics = {
  there: {
    title: "Getting there",
    blocks: [
      {
        who: "OM", name: "Old Man · Nick", from: "London",
        legs: [
          { kind: "stay", when: "19–24 Jun", text: "London — Heathrow, then the London City hotel, 20 Middlesex St." },
          { kind: "fly", when: "Wed 24 Jun", text: "LHR → VCE · BA 602 · 11:50 → 15:05 · Terminal 5" },
          { kind: "stay", when: "24–27 Jun", hotelKey: "american", text: "Hotel American-Dinesen · Campo San Vio 628, Dorsoduro, Venice." },
        ],
      },
      {
        who: "DC", name: "Dragon Child · Helen", from: "San Francisco",
        legs: [
          { kind: "fly", when: "Fri 26 Jun", text: "SFO → LHR · BA 286 · 19:30 PDT → Sat 27 Jun 13:55 · Terminal I → 5" },
          { kind: "fly", when: "Sat 27 Jun", text: "LHR → VCE · BA 608 · 17:20 → 20:40 · Terminal 5 → Marco Polo" },
        ],
      },
    ],
    together: [
      { kind: "stay", when: "Sat 27 Jun", hotelKey: "marconi", text: "DC + OM converge — Marconi House, 16 Via Sernaglia, Mestre (by the station). Check out Sun 10:00." },
      { kind: "stay", when: "28–29 Jun", hotelKey: "badhaus", text: "North to Bressanone — Boutique Hotel Badhaus, Adlerbrückengasse 5. Trek starts Mon 29." },
    ],
    notes: [
      "Sun 28 Jun — booked train north (seats reserved): 08:00 Venezia Mestre → Verona Porta Nuova 10:00 (Frecciarossa 9713), 10:20 → Bolzano/Bozen 11:56 (FR 8502), 12:02 → Bressanone/Brixen 12:32 (Regionale 17154). The Mestre hotel is an ~8–10 min walk from the station.",
      "Mon morning: city bus from Bressanone station to St. Andrä, then the Plose gondola to Kreuztal (~2,050 m) — the trek begins there.",
      "Last things: cash for the huts (many take cash only), a via-ferrata set + helmet for the cabled days, trail snacks, sun cream, a blister kit. Re every hut by phone a few days out.",
    ],
  },
  home: {
    title: "Leaving",
    blocks: [
      {
        who: "DC", name: "Dragon Child · Helen", from: "→ San Francisco",
        legs: [
          { kind: "fly", when: "Sun 12 Jul", text: "VCE → LHR · BA 611 · 07:35 → 09:00 · Marco Polo → Terminal 5" },
          { kind: "fly", when: "Sun 12 Jul", text: "1h45 layover · LHR → SFO · BA 285 · 10:45 → 13:50 PDT · Terminal 5 → I" },
        ],
      },
      {
        who: "OM", name: "Old Man · Nick", from: "→ Johannesburg",
        legs: [
          { kind: "stay", when: "Mon 13 Jul", text: "Hotel Villa Viridia check out, 12:00." },
          { kind: "fly", when: "Mon 13 Jul", text: "VCE → MAD · UX 1084 · 18:35 → 21:15" },
          { kind: "fly", when: "Mon 13 Jul", text: "2h30 layover · MAD → JNB · UX 157 · 23:45 → Tue 14 Jul 09:50 · Terminal 1" },
        ],
      },
    ],
    together: [
      { kind: "stay", when: "9–10 Jul", hotelKey: "piol", text: "L'Antico Piol, Via Monte Tomatico 15, Feltre. Check out Fri 10, 11:00." },
      { kind: "stay", when: "10–13 Jul", hotelKey: "viridia", text: "Hotel Villa Viridia, Campiello Zen, Cannaregio 1486, Venice." },
    ],
    notes: [
      "Off the Vette Feltrine at Croce d'Aune → DolomitiBus or taxi via Pedavena (a beer at the Birreria is tradition) → Feltre. Direct regional trains run Feltre → Venezia in about 2 h.",
      "DC flies home to San Francisco on the 12th; OM carries on to Johannesburg on the 13th.",
    ],
  },
};
// official website links (research-verified; hotelKey/linkKey hyperlink the names)
const links = {
  american: "https://www.hotelamerican.it/en",
  piol: "https://anticopioldefeltre.it/",
  viridia: "https://hotelvillaviridia.com/en/",
  marconi: "https://www.marconihouse.it/",
  badhaus: "https://badhaus.it/en/",
};

// each rec: { name, area, why, lat, lng, url } — feeds both the list and the interactive map.
const recs = {
  venice: {
    center: [45.438, 12.330], zoom: 14,
    coffee: [
      { name: "Pasticceria Tonolo", area: "Dorsoduro", why: "The local answer for coffee in Dorsoduro — 1886 pasticceria, porcelain-cup espresso, legendary frittelle.", lat: 45.4359167, lng: 12.3251742, url: "https://www.google.com/maps/search/?api=1&query=Pasticceria%20Tonolo%20Venezia" },
      { name: "Torrefazione Cannaregio", area: "Cannaregio", why: "Working roaster; stand at the bar for what many call the best espresso in Venice. Buy the 'Forte' beans.", lat: 45.4457088, lng: 12.3278642, url: "https://torrefazionecannaregio.it/" },
      { name: "Caffè Poggi dal 1919", area: "Dorsoduro", why: "Tiny neighbourhood bar by the Accademia — a genuine €1 espresso, no tourist terrace.", lat: 45.4306589, lng: 12.3293135, url: "https://www.google.com/maps/search/?api=1&query=Caff%C3%A8%20Poggi%20Dorsoduro%20Venezia" },
    ],
    activities: [
      { name: "Cantine del Vino già Schiavi", area: "Dorsoduro", why: "Cult bàcaro for inventive cicchetti and cheap good wine, eaten standing canal-side. Go early.", lat: 45.4309552, lng: 12.3267138, url: "https://www.cantinaschiavi.com/en/" },
      { name: "Vino Vero + a Cannaregio bàcaro crawl", area: "Cannaregio", why: "Natural wine and serious cicchetti, with Al Timon and Alla Vedova's €2 polpetta a few steps away.", lat: 45.4440469, lng: 12.3331243, url: "https://vinovero.wine/luoghi/venezia/" },
      { name: "Row Venice — voga alla veneta lesson", area: "Cannaregio", why: "Learn to row standing in a traditional batèla — repeatedly the best thing travellers do here.", lat: 45.445211, lng: 12.334364, url: "https://rowvenice.org/" },
    ],
  },
  feltre: {
    center: [46.026, 11.897], zoom: 13,
    coffee: [
      { name: "Birreria Pedavena", area: "Pedavena", why: "The traditional finish-line ritual: an 1896 brewery-monument at the foot of the Vette. Order the on-site 'Centenario' draft.", lat: 46.0343985, lng: 11.8840043, url: "https://www.labirreriapedavena.it/" },
      { name: "Pasticceria Garbuio", area: "Feltre", why: "Family pastry shop since 1925 — coffee with a slice of local polentina cake.", lat: 46.0179494, lng: 11.902861, url: "https://pasticceriagarbuio.it/" },
    ],
    activities: [
      { name: "Piazza Maggiore & the old town", area: "Feltre", why: "One of the Veneto's best-kept Renaissance hill-towns — frescoed palazzi, the literal end of the AV2.", lat: 46.0183371, lng: 11.9102515, url: "https://comune.feltre.bl.it/vivere-il-comune/luoghi/piazza-maggiore-centro-storico-cittadella/" },
      { name: "Castello di Alboino walls", area: "Feltre", why: "A short climb above the piazza for a panorama back over the Vette Feltrine you just walked.", lat: 46.0189306, lng: 11.9105656, url: "https://comune.feltre.bl.it/vivere-il-comune/luoghi/castello-di-alboino/" },
      { name: "Trattoria Al Pescatore", area: "Feltre", why: "Celebratory Feltrino dinner — fried Schiz cheese, Tosella, polentina, a glass of local prosecco.", lat: 46.0252292, lng: 11.9028403, url: "https://www.google.com/maps/search/?api=1&query=Trattoria%20Al%20Pescatore%20Feltre" },
    ],
  },
  // arrival night in Mestre — just coffee by the station for the early train north
  mestre: {
    center: [45.4836, 12.2333], zoom: 15,
    coffee: [
      { name: "Puro Gusto", area: "Inside Venezia Mestre station · platform level", why: "Opens 05:00, right on the platforms — the safe bet for an espresso and a pastry before the 08:00 train if you're tight on time. Open Sundays.", lat: 45.4825, lng: 12.2317, url: "https://www.google.com/maps/search/?api=1&query=Puro%20Gusto%20Stazione%20Venezia%20Mestre" },
      { name: "Bontà", area: "Venezia Mestre station · atrium", why: "In-station bar for a fast stand-up espresso without leaving the building — opens 06:00 (07:00 weekends).", lat: 45.4824, lng: 12.2319, url: "https://www.google.com/maps/search/?api=1&query=Bont%C3%A0%20Stazione%20Venezia%20Mestre" },
      { name: "Caffè Vergnano 1882", area: "Via Cappuccina 17 · ~400 m, on the way to the station", why: "Proper espresso and fresh brioches — the best standalone caffè between Via Sernaglia and the station. Closed Sundays, so a weekday option only.", lat: 45.4847, lng: 12.2354, url: "https://www.google.com/maps/search/?api=1&query=Caff%C3%A8%20Vergnano%201882%20Via%20Cappuccina%20Mestre" },
    ],
    activities: [],
  },
};

// ---- stops in trek order (travel + hike). Hike stops carry `day` + `ferrata`. ----
const stops = [
  {
    id: "venice1", type: "travel", short: "Venice",
    kicker: "Arrive · Sat 27 Jun", title: "Converge in Venice",
    sub: "Dragon Child in from SF, Old Man down from London — meeting in Mestre by the station, with an early train north in the morning.",
    hero: WM("Le Pale di San Martino dalla Baita Segantini.jpg", 2000),
    paragraphs: [
      "Two flights, one city. The Old Man comes down from London (after a few days in Dorsoduro), the Dragon Child lands from San Francisco on Saturday evening — and they converge at Marconi House in Mestre, on the mainland a few minutes from Venezia Mestre station and the airport.",
      "It's a practical first night, not a late one: the train north leaves at 08:00. Grab a coffee by the station and go. The real Venice — cicchetti, bàcari, a row on the lagoon — is saved for the very end of the trip.",
    ],
    stay: { name: "Marconi House", elev: "Mestre · by the station", note: "16 Via Sernaglia — a simple mainland base an ~8–10 min walk from Venezia Mestre station, ideal for the early train north.", linkKey: "marconi", link: null, img: WM("Campo san Vio sul Canal Grande a Venezia.jpg", 1600) },
    recsKey: "mestre", logisticsKey: "there",
    recsTitle: "Coffee by the <em>station</em>",
    recsNote: "Just coffee for now — there's an 08:00 train. The in-station bars open earliest (Puro Gusto from 05:00); Sunday closes a few places. The fun Venice waits for the end.",
    gallery: [],
  },
  {
    id: "bressanone", type: "travel", short: "Bressanone",
    kicker: "Travel · Sun 28 Jun", title: "North to Bressanone",
    sub: "South Tyrol's oldest town, and the start line of the Alta Via 2.",
    hero: WM("Sass de Putia Odle di Eores Serighelamoos jeuf de Börz Val Badia.jpg", 2200),
    transit: {
      date: "Sunday 28 June — booked, seats reserved",
      legs: [
        { dep: "08:00", from: "Venezia Mestre", arr: "10:00", to: "Verona Porta Nuova", train: "Frecciarossa 9713" },
        { dep: "10:20", from: "Verona Porta Nuova", arr: "11:56", to: "Bolzano · Bozen", train: "Frecciarossa 8502" },
        { dep: "12:02", from: "Bolzano · Bozen", arr: "12:32", to: "Bressanone · Brixen", train: "Regionale 17154" },
      ],
      toStation: "≈8–10 minutes on foot from Marconi House — up Via Sernaglia to Via Cappuccina, then straight to the Venezia Mestre forecourt. Flat and easy with a pack; leave by about 07:35 to be safe.",
    },
    paragraphs: [
      "Three trains up the Brenner line, and by early afternoon you step off in Bressanone / Brixen (559 m) — South Tyrol's oldest town, bilingual and arcaded, at the meeting of the Eisack and Rienz rivers and a prince-bishop's seat since 901 AD.",
      "Stock up: this is the last full town for eleven days. Dinner is Tyrolean — canederli, speck, a glass of Sylvaner. In the morning a bus runs to the Plose gondola and the trek begins.",
    ],
    stay: { name: "Boutique Hotel Badhaus", elev: "Bressanone · 559 m", note: "Adlerbrückengasse 5, in the arcaded old town. The bus to the St. Andrä cable car leaves from the station.", linkKey: "badhaus", link: "https://www.plose.org", img: WM("Sass de Putia Odle di Eores Serighelamoos jeuf de Börz Val Badia.jpg", 1600) },
    gallery: [],
  },

  {
    id: "day-01", type: "hike", day: 1, ferrata: false,
    kicker: "Day 1 · Mon 29 Jun", title: "Bressanone → Halslhütte",
    sub: "Up the Plose by gondola, over Rifugio Plose, then an easy drop to a family hut under the Peitlerkofel.",
    hero: WM("Il Sass de Putia dai prati del Passo delle Erbe.jpg", 2000),
    paragraphs: [
      "A gentle opener. The Plose gondola lifts you from St. Andrä to Kreuztal (≈2,050 m), saving 1,500 m of road. Trail 7 traverses to Rifugio Plose (2,447 m) and one of the great panoramas of the Eastern Alps — the Odle ahead, glaciers behind.",
      "Then trail 4 winds down through dwarf pine and pasture toward the Würzjoch country, easing onto the broad shelf of the Halslhütte. A short first day by design: a sun terrace, a slice of Kaiserschmarrn, legs saved for tomorrow.",
    ],
    highlights: [
      ["Plose gondola — the classic AV2 start", "You float 1,500 m up by cable car and step straight onto the high ridge — the whole trek opens with a sky-level shortcut instead of a slog up the road."],
      ["Rifugio Plose panorama", "From the terrace the entire Eastern Alps roll out — the Odle spires ahead, the Zillertal glaciers behind. One of the great first-morning views of the trip."],
      ["First sight of Sass de Putia", "The lone double-summit sentinel that marks the true northern edge of the Dolomites — your first 'oh, THAT'S why we came' moment, and tomorrow's playground."],
      ["An easy, sunlit first afternoon", "Short by design: packs down by mid-afternoon, a sun terrace, a slice of Kaiserschmarrn, and fresh legs banked for the big Putia crossing tomorrow."],
    ],
    caution: null,
    stay: { name: "Halslhütte", elev: "1,850 m", note: "Family-run hut beneath the Peitlerkofel — wood-panelled Stuben, a sun terrace facing the Dolomites, Knödel and Kaiserschmarrn. Overnight rooms.", link: "https://www.halslhuette.it", img: "https://www.plose.org/bilder/018_TVbrixen-betriebe_%C2%A9KOTTERSTEGER_CKOTTERSTEGER_230726_KOT_9304-2-scaled.jpg" },
    gallery: [
      [`${HB}/e35be80f-9ed8-445a-9b85-fd6304dbfaab/Trail+to+Sass+de+Putia+junction+%281%29.jpg`, "Looking ahead to Sass de Putia — tomorrow's crossing"],
      [WM("Peitlerkofel.jpg"), "The Peitlerkofel / Sass de Putia, sentinel of the first two days"],
    ],
  },
  {
    id: "day-02", type: "hike", day: 2, ferrata: true,
    kicker: "Day 2 · Tue 30 Jun", title: "Halslhütte → Rifugio Puez",
    sub: "Around Sass de Putia and past Rifugio Genova, then the cabled Sieles gully onto the lunar Puez plateau.",
    hero: `${HB}/4c96e5c4-f407-4fc8-bc9f-fa8f7dca74b2/Ascent+to+Forcella+di+Putia+5+%282%29.jpg`,
    paragraphs: [
      "The first real day. The path climbs onto the open flanks of Sass de Putia (2,875 m) to Forcella di Putia (2,357 m) — the gateway into the UNESCO Puez-Odle park — then contours to Passo Poma and the Schlüterhütte / Rifugio Genova (2,306 m), the classic coffee stop.",
      "From Genova trail 3 traverses high beneath the Odle east faces to Forcella de la Roa (2,617 m). The crux is the cable-protected gully below Forcella de Sieles; above it you top out on the vast grey karst of the Puez plateau and the lone Puezhütte.",
    ],
    highlights: [
      ["Sass de Putia / Peitlerkofel", "You climb right under the pale walls of the northernmost true Dolomite peak — an isolated tower rising straight out of green meadow, unforgettable up close."],
      ["Rifugio Genova — coffee stop", "An 1898 hut on a pasture shelf at the gateway to the Puez-Odle park — the perfect mid-morning espresso-and-strudel pause before the plateau."],
      ["Odle / Geisler east faces", "A whole morning traversing beneath the sheer east walls of the Geisler chain, Sass Rigais at its head — the most photographed skyline in the Dolomites, on your shoulder the entire time."],
      ["Cabled climb to Forcella de Sieles", "Your first taste of via ferrata — steel cables and iron rungs up a steep gully, a genuine little adventure that earns the plateau above."],
      ["The lunar Puez plateau", "You top out onto a vast grey karst tableland — the Dolomites' 'open-air geology textbook,' 250 million years of ancient seabed underfoot, utterly otherworldly."],
    ],
    caution: "Cable-protected gully below Forcella de Sieles — fine when dry, care in wet or lingering snow. The plateau is waterless and disorienting in fog.",
    stay: { name: "Rifugio Puez / Puezhütte", elev: "2,475 m", note: "CAI Bolzano's lone outpost on the plateau. Dorms, limited water (no showers), hearty pasta and Knödel. Cash preferred. Booked: 2× dorm beds.", link: "https://www.rifugiopuez.it", img: WM("Puezhütte.JPG") },
    gallery: [
      [`${HB}/fc80772e-d523-432e-86ce-c987f906d297/Sass+de+Putia+summit+2+%281%29.jpg`, "Sass de Putia summit — an optional ferrata detour"],
      [WM("Sas Rigais Furchëtta Sas dla Porta.jpg"), "Sass Rigais and the Furchetta — the wall you traverse beneath"],
      [`${HB}/1dd59e61-d514-4b27-b47f-9a391fdfcc97/Rifugio+Puez+Pasta+%281%29.jpg`, "Lunch reward at Rifugio Puez"],
    ],
  },
  {
    id: "day-03", type: "hike", day: 3, ferrata: true,
    kicker: "Day 3 · Wed 1 Jul", title: "Rifugio Puez → Rifugio Pisciadù",
    sub: "Tarns and rock needles to Passo Gardena, then the cabled couloir of Val Setus into the Sella.",
    hero: `${HB}/b1018b50-1094-40e7-b74c-052887793417/Trail+%232+Route+via+Forcella+Cir+9+%281%29.jpg`,
    paragraphs: [
      "Trail 2 crosses the karst past the turquoise tarn of Lech de Crespëina and threads the eroded needles of the Pizzes da Cir down to Passo Gardena (2,121 m) — buses, strudel, and the entire north wall of the Sella ahead.",
      "Then the day sharpens. Val Setus is a grey scree couloir; path 666 zig-zags up it and the top steepens onto ledges fitted with steel cables and rungs — the most exposed passage of the first half. Topping out, ten minutes of slabs reach the hut beside little Lago Pisciadù.",
    ],
    highlights: [
      ["Lech de Crespëina tarn", "An improbable turquoise tarn marooned on the bare karst — a jolt of colour in a sea of pale stone, and a perfect water break."],
      ["Pizzes da Cir needles", "You thread a forest of eroded rock spires on the descent to Passo Gardena — like walking through a cathedral of stone fingers."],
      ["Sella north wall from Passo Gardena", "The entire north rampart of the Sella massif fills the sky ahead — the wall you're about to climb. Strudel at the pass, awe included."],
      ["Cabled Val Setus couloir", "The day's crux and a real thrill — a grey scree couloir that steepens onto cabled ledges, hauling you up 150 vertical metres into the Sella. Helmets on."],
      ["Lago Pisciadù at the door", "You top out beside a tiny alpine lake tucked under the Cima Pisciadù tower, the hut right on its shore — one of the most dramatic hut settings on the whole route."],
    ],
    caution: "The upper Val Setus is steep, cable-protected and exposed — dangerous when wet or icy; snow can linger into July. Helmets sensible for stonefall.",
    stay: { name: "Rifugio Cavazza al Pisciadù", elev: "2,585 m", note: "CAI Bologna hut on the Sella's terrace beside its lake, shared with Tridentina ferrata climbers. Lively, dorms + rooms, showers for a fee.", link: "https://www.rifugiopisciadu.it", img: WM("Rifugio Cavazza al Pisciadù.jpg") },
    gallery: [
      [`${HB}/bd7b81c6-6026-4235-93fd-c3c71a0259c4/Trail+%23666+Val+Setus+3+%281%29.jpg`, "Val Setus — cables and steps on the day's crux"],
      [WM("Lago Pisciadu.jpg"), "Lago Pisciadù beside the hut"],
    ],
  },
  {
    id: "day-04", type: "hike", day: 4, ferrata: true,
    kicker: "Day 4 · Thu 2 Jul", title: "Rifugio Pisciadù → Lago Fedaia",
    sub: "Across the Sella moonscape, optionally over Piz Boè — the route's roof — then the Viel del Pan to the Marmolada.",
    hero: `${HB}/e9093bbc-8ed0-4c65-9b72-f64bf170e748/Trail+%23666+Near+Rifugio+Boe+3+%281%29.jpg`,
    paragraphs: [
      "A few cabled steps lead onto the Altopiano delle Mèisules — a pale stone desert at 2,800–2,900 m. Cairns cross to Rifugio Boè and the near-obligatory side-trip up Piz Boè (3,152 m), the highest point of the whole trek, the Marmolada and half the Alps on the horizon.",
      "A vast scree funnel drops to Passo Pordoi (2,239 m); across the road the Viel del Pan — the old smugglers' balcony — runs nearly level with the finest sustained view in the Dolomites: the full north face and glacier of the Marmolada, directly opposite. The trail swings down to the turquoise of Lago Fedaia.",
    ],
    highlights: [
      ["Piz Boè 3,152 m — the trip's high point", "An almost-obligatory 40-minute side-trip to the highest summit of the whole trek, with the Marmolada, Sassolungo and half the Alps spread out from a tiny summit hut."],
      ["Sella plateau moonscape", "You cross the Altopiano delle Mèisules — a pale stone desert at 2,900 m that genuinely looks like the Moon. Surreal, silent, unlike anywhere else on the route."],
      ["Viel del Pan balcony", "The centuries-old flour-smugglers' path runs nearly level along a green ridge with what may be the single finest sustained view in the Dolomites."],
      ["Marmolada glacier panorama", "From that balcony you stare straight across at the north face and glacier of the Marmolada, 3,343 m — the Queen of the Dolomites and the highest peak in the range."],
      ["Lago Fedaia", "The day ends at a turquoise reservoir right under the glacier, the hut on its shore — a real bed, proper showers, and the Marmolada out the window at dawn."],
    ],
    caution: "Short cabled steps above the hut; snowfields linger on the plateau and navigation is serious in fog. The Pordoi scree descent is long — poles help.",
    stay: { name: "Rifugio Castiglioni Marmolada", elev: "2,057 m", note: "Road-served inn on the Fedaia dam at the foot of the Marmolada — more hotel than hut. Rooms + dorms, proper showers, the glacier out the window. Booked: private room.", link: "https://www.rifugiomarmolada.it", img: WM("Rifugio Castiglioni Marmolada 01.jpg") },
    gallery: [
      [`${HB}/3d6b35b5-9d7e-4b01-8c66-24dde2c645d2/Trail+%23638+Route+via+Piz+Boe+5+%281%29.jpg`, "The walk-up to Piz Boè, 3,152 m"],
      [`${HB}/c32d9ddf-333d-4e2b-9c91-5966bae7b3c1/Rifugio+Viel+dal+Pan+5+%281%29.jpg`, "Rifugio Viel del Pan on the Padon ridge"],
      [WM("Marmolada da Viel del Pan.jpg"), "The Marmolada from the Viel del Pan"],
    ],
  },
  {
    id: "day-05", type: "hike", day: 5, ferrata: false,
    kicker: "Day 5 · Fri 3 Jul", title: "Lago Fedaia → Passo San Pellegrino",
    sub: "Around the Queen of the Dolomites via Val Contrin and the scree headwall of Passo delle Cirelle.",
    hero: WM("Rifugio Contrin - panoramio.jpg"),
    paragraphs: [
      "Down to Pian Trevisan, then path 602 turns south into the quiet, pastoral Val Contrin and climbs to Rifugio Contrin (2,016 m) beneath the Marmolada's south walls — a perfect lunch.",
      "Above Contrin the route sharpens to a steep funnel of dark scree at Passo delle Cirelle (2,683 m); the far side slides down into the flowered bowl of Fuciade, one of the best kitchens in the Dolomites, and an easy track to the hotels at Passo San Pellegrino.",
    ],
    highlights: [
      ["Marmolada south walls from Val Contrin", "You round the Queen of the Dolomites and look up at her vast pale south face from a quiet, larch-filled valley most trekkers never see."],
      ["Passo delle Cirelle 2,683 m", "A wild, stark scree pass between two ridges — half the hikers scree-run the far side, the other half curse it. Either way, an exhilarating high point."],
      ["The Fuciade basin", "You drop into one of the most beautiful high meadows in the Dolomites — flower-strewn pasture and hay huts ringed by towers, with WWI front-line ridges above."],
      ["Gourmet stop at Rifugio Fuciade", "Tucked in that basin is one of the best kitchens in the whole range — a genuinely special lunch in the middle of nowhere."],
    ],
    caution: "No cables today, but both sides of Passo delle Cirelle are steep, loose scree — tiring and tricky when wet; snow possible into July.",
    stay: { name: "Hotel Costabella", elev: "Passo San Pellegrino · 1,918 m", note: "Località San Pelegrin 27, Moena — booked: a private room, real beds, showers and half board at the pass. The classic hiker base before the Pale di San Martino.", link: "https://hotelcostabella.com/en/", img: WM("Passo San Pellegrino, Fuciade, verso le Pale.jpg") },
    gallery: [
      [`${HB}/0b3aff32-eb7a-4867-a117-261600aa07b7/Trail+%23607-+Route+via+Val+de+le+Cirele+%281%29.jpg`, "Up the Val de le Cirelle toward the pass"],
      [WM("Herbst in den Dolomiten - Dolomites UNESCO - Rifugio Fuciade - Flickr - PHOTOGRAPHY Toporowski.jpg"), "The Fuciade basin beneath the Costabella ridge"],
    ],
  },
  {
    id: "day-06", type: "hike", day: 6, ferrata: true,
    kicker: "Day 6 · Sat 4 Jul", title: "Passo San Pellegrino → Rifugio Mulaz",
    sub: "A grassy ridge above Val Venegia, then the stony grind to the Mulaz shelf — hello, Pale di San Martino.",
    hero: WM("Val Venegia ph Carlo A.Turra.jpg"),
    paragraphs: [
      "Gravel roads climb past Lago di Cavia to Passo Valles, then path 751 takes up one of the most scenic ridgelines of the route — high above Val Venegia while the pale ramparts of the Pale di San Martino grow across the sky: Cimon della Pala, the 'Matterhorn of the Dolomites'.",
      "Past Sasso Arduini the grass runs out: a steep 400 m grind on loose Focobon scree (an occasional cable near the top) reaches Passo del Mulaz (2,619 m), then ten minutes down to the hut on its shelf — front-row seats for sunset on the Focobon walls.",
    ],
    highlights: [
      ["Ridge traverse above Val Venegia", "One of the most scenic ridgelines of the whole route — a green high balcony with the idyllic Val Venegia falling away below and the Pale growing across the sky."],
      ["First full view of the Pale di San Martino", "The pale northern ramparts of the largest Dolomite massif rear up ahead — the moment the trip's grand finale comes into view."],
      ["Cimon della Pala (3,184 m)", "The 'Matterhorn of the Dolomites' — a soaring, perfect spire that dominates the skyline all afternoon. The peak that put the Dolomites on the map in Victorian times."],
      ["Sunset from the Mulaz shelf", "The hut sits alone on a rock shelf with no road for miles — front-porch seats for alpenglow on the Focobon walls and the best sunrise of the trip at the door."],
    ],
    caution: "The Focobon scree to Passo del Mulaz is steep and loose with a possible short cable near the pass. Fill water at Passo Valles — the climb is dry.",
    stay: { name: "Rifugio Volpi al Mulaz", elev: "2,571 m", note: "CAI Venezia's 1907 stone hut, helicopter-supplied, no road for miles. Dorms, hot meals — and the best sunrise of the trip from the doorstep.", link: "https://www.rifugiomulaz.it", img: WM("RifugioMulaz.jpg") },
    gallery: [
      [`${HB}/4d288237-fa2e-4df8-8c98-e2e969d1bcf2/Trail+%23751-+Route+via+Sasso+Arduini+%281%29.jpg`, "Approaching the Pale via Sasso Arduini"],
      [WM("Cima di Vezzana and Cimon della Pala, San Martino di Castrozza, Trentino-Alto Adige, Italy, 2025 October.jpg"), "Cima di Vezzana and Cimon della Pala"],
    ],
  },
  {
    id: "day-07", type: "hike", day: 7, ferrata: true,
    kicker: "Day 7 · Sun 5 Jul", title: "Rifugio Mulaz → Rifugio Rosetta",
    sub: "The Sentiero delle Farangole — the wildest, highest, most technical day — onto the lunar Pale plateau.",
    hero: WM("Le Pale di San Martino dalla Baita Segantini.jpg", 2000),
    paragraphs: [
      "Path 703 climbs ledges and cables out of the Mulaz amphitheatre to Passo delle Farangole (2,814 m), the highest pass of the standard route. The notch and its far side are the crux: a steep protected gully, iron rungs, real exposure, often old snow into early July. Helmets on.",
      "The reward is the long lonely traverse of the upper Comelle — chamois almost guaranteed — and a final cabled pull onto the Altopiano delle Pale, fifty square kilometres of bare white karst so stark it reads as lunar. Cairns cross it to Rifugio Rosetta.",
    ],
    highlights: [
      ["Passo delle Farangole 2,814 m — roof of the route", "The highest pass of the standard line and the wildest moment of the trek — a dramatic slot between rock spires, gained by an exposed cabled gully. The day you'll talk about most."],
      ["Focobon walls up close", "The protected traverse runs right under the towering Focobon faces — big, serious mountain architecture at arm's length."],
      ["Valle delle Comelle", "A long, lonely ledge-traverse high above a huge glacial gorge in the heart of the Pale — chamois almost guaranteed, solitude total."],
      ["The lunar Pale plateau", "You finish across fifty square kilometres of bare white karst at 2,600 m — so stark and empty it reads as another planet. The most otherworldly walking of the whole route."],
    ],
    caution: "The most technical day: cable-protected, exposed passages on both sides of the Farangole. Via ferrata kit advisable in poor conditions; helmet strongly recommended. Check snow with the Mulaz keeper.",
    stay: { name: "Rifugio Rosetta — Pedrotti", elev: "2,581 m", note: "Hub of the Pale plateau (SAT Trento), cable-car supplied and comfortable for the altitude. Dorms + rooms, showers. Weather exit: the Rosetta cable car to San Martino.", link: "https://www.rifugiorosetta.it", img: WM("Rifugio Rosetta (Pedrotti).JPG") },
    gallery: [
      [`${HB}/518a4354-c5e4-47ce-9cb6-4cd6b375494d/Trail+%23703-+Route+via+Forcella+Margherita+5+%281%29.jpg`, "Cabled passage on the Farangole traverse"],
      [`${HB}/1c44b9d5-36e6-4a60-8245-bf34008035b0/Cima+della+Rosetta+summit+%281%29.jpg`, "Cima della Rosetta — the evening stroll"],
    ],
  },
  {
    id: "day-08", type: "hike", day: 8, ferrata: true,
    kicker: "Day 8 · Mon 6 Jul", title: "Rifugio Rosetta → La Ritonda",
    sub: "Over Passo di Ball to the Pradidali amphitheatre, then the long descent into green Val Canali.",
    hero: WM("Pale-RifPradidali.jpg"),
    paragraphs: [
      "Path 702 traverses the head of Val di Roda on cabled ledges to Passo di Ball (2,443 m), then drops east into one of the most beautiful cirques anywhere — the Pradidali amphitheatre, Rifugio Pradidali (2,278 m) beneath Sass Maor and the Pala di San Martino.",
      "Then the knees take over: path 709 descends the full length of Val Pradidali, past the little lake and down through forest to Val Canali. After a week of rock, the meadows feel almost tropical; a short walk up-valley is the night's bed at La Ritonda.",
    ],
    highlights: [
      ["Passo di Ball cabled traverse", "An airy, cable-protected ledge line across a cliff face, San Martino di Castrozza straight below your boots — short, exposed and thrilling."],
      ["Rifugio Pradidali — Sass Maor, Cima Canali", "You drop into one of the most beautiful mountain cirques anywhere, ringed by the legendary walls of early British alpinism — hallowed climbing ground, and a perfect lunch."],
      ["Lago Pradidali", "A jewel-like tarn cupped high in the amphitheatre — a last splash of the high mountains before the long green descent."],
      ["Val Canali meadows", "After a week of bare rock, you descend into a soft, almost tropical valley of meadow and forest — one of the most beautiful valleys in the Alps, and a real bed at the bottom."],
    ],
    caution: "Short cabled, exposed passages around Passo di Ball; then a long, steep but honest descent — ~1,200 m down to the valley. Poles essential.",
    stay: { name: "Albergo Baita La Ritonda", elev: "1,190 m", note: "Family-run since 1965 in Val Canali — 11 rooms, Trentino kitchen, a terrace pointed straight back at the Pale. A real bed, a real shower, dinner à la carte.", link: "https://www.baitalaritonda.it", img: WM("Val Canali.jpg") },
    gallery: [
      [`${HB}/fdcbef2c-2020-43b7-bb8c-89fbdf0fc492/Trail+%23709%3A+Route+via+Val+Pradidali+6.jpg`, "Descending Val Pradidali"],
      [WM("Rifugio Pradidali NE.JPG"), "Rifugio Pradidali under Cima Canali"],
    ],
  },
  {
    id: "day-09", type: "hike", day: 9, ferrata: false,
    kicker: "Day 9 · Tue 7 Jul", title: "La Ritonda → Passo Cereda",
    sub: "Up past Rifugio Treviso and over Forcella d'Oltro — farewell to the Pale di San Martino.",
    hero: WM("Rifugio Treviso, 1630 m.jpg"),
    paragraphs: [
      "A gentle start up-valley past Malga Canali, a working alpine dairy, then forest path climbs to Rifugio Treviso (1,631 m), one of the oldest huts in the Dolomites, opened in 1897.",
      "From Treviso trail 718 climbs very steeply — 600 m in under two kilometres — to Forcella d'Oltro (2,229 m), your last gateway out of the Pale. Ahead, for the first time, the greener pre-Alps of the Cimonega with Sass de Mura front and centre; the descent drops through forest to the quiet road pass of Passo Cereda.",
    ],
    highlights: [
      ["Malga Canali (cheese stop)", "A working alpine dairy in a spectacular cirque — fresh mountain cheese straight from the source, the kind of stop that makes a hiking day."],
      ["Rifugio Treviso, 1897", "One of the oldest huts in the Dolomites, tucked into deep forest — a wonderfully atmospheric, historic pause on the climb."],
      ["Forcella d'Oltro — last look at the Pale", "A narrow notch that is your final gateway out of the Pale di San Martino — turn around here for a last farewell to the white peaks you've crossed."],
      ["First sight of Sass de Mura", "Over the pass a completely new world opens — the greener, wilder pre-Alps of the Cimonega, with the monarch Sass de Mura front and centre. The wild south begins."],
    ],
    caution: "No cables, but the Treviso–Oltro climb is relentless and the wooded descent gullies are slippery when wet.",
    stay: { name: "Rifugio Passo Cereda", elev: "1,361 m", note: "Family-run inn-hut on the pass: hotel-style rooms plus dorm places, hot showers, proper Primiero cooking. A soft night before the wildest day.", link: "https://www.rifugiocereda.com", img: WM("Dolomites - Alta Via 2, Stage 09-11 Rifugio Treviso to Rifugio Passo Cereda - panoramio.jpg") },
    gallery: [
      [`${HB}/b4233aa7-1677-4142-9999-3558981d6614/Trail+%23718-+Route+via+Passo+Regade+8+%281%29.jpg`, "Trail 718 — pinnacles and wildflowers above Val Canali"],
      [WM("Hut in Val Canali near farmhouse Valtegnarich.jpg"), "Val Canali pastures"],
    ],
  },
  {
    id: "day-10", type: "hike", day: 10, ferrata: true,
    kicker: "Day 10 · Wed 8 Jul", title: "Passo Cereda → Rifugio Boz",
    sub: "The toughest, wildest stage: Forcella Comedon into the empty heart of the Dolomiti Bellunesi.",
    hero: WM("Sass de mura PNDB.jpg"),
    paragraphs: [
      "Widely rated the hardest stage of the south: long, remote, no huts en route. Path 801 — your companion to the finish — gives away height then wins it back up an immense couloir beneath Sass de Mura.",
      "The crux is the final 250 m to Forcella Comedon (2,067 m): steep, eroded rock steps with fixed cables. Beyond lies the desolate Comedon bowl in the core of the national park, the Bivacco Feltre the only roof of the day, and a long ledge traverse under Sass de Mura easing down to little Rifugio Boz.",
    ],
    highlights: [
      ["Forcella Comedon — the wild gateway", "A steep, cabled rock crux that tops out into the desolate, empty heart of the Dolomiti Bellunesi — crossing it feels like stepping off the map."],
      ["Dolomiti Bellunesi: chamois, eagles, nobody", "The emptiest, most pristine corner of the entire route — a national park with no roads, no lifts, no villages. Just you, the chamois and the eagles."],
      ["Bivacco Feltre-Walter Bodo", "A tiny nine-bunk emergency shelter perched alone at the pass — the only roof for hours and a vivid reminder of how remote this stage really is."],
      ["Sass de Mura west-face ledges", "Grassy ledges traverse beneath the soaring west face of the Cimonega's monarch — committing, spectacular, and walked by almost no one."],
    ],
    caution: "Do not start this one in bad weather — escape routes are poor and there's no water on the climb. Cables on the Comedon crux; scrambling required.",
    stay: { name: "Rifugio Bruno Boz", elev: "1,718 m", note: "CAI Feltre's small, genuinely remote hut at Pian de la Regina — ~25 dorm places, polenta and local cheese, total quiet. Book ahead; the only bed for hours.", link: "https://www.rifugioboz.it", img: WM("PASSO ALVIS mt. 1881. verso malga neva seconda e rifugio boz - panoramio.jpg") },
    gallery: [
      [`${HB}/ab226182-2995-476a-90f0-842679948213/Trail+%23801-+Route+via+Troi+dei+Caserini+3+%281%29.jpg`, "Trail 801 through the Alpi Feltrine"],
      [`${HB}/09a5a833-225f-4492-8bd6-fa39c256aca4/Bivacco+Feltre+%281%29.jpg`, "Bivacco Feltre-Walter Bodo, the day's only shelter"],
    ],
  },
  {
    id: "day-11", type: "hike", day: 11, ferrata: true,
    kicker: "Day 11 · Thu 9 Jul", title: "Rifugio Boz → Croce d'Aune",
    sub: "Across the flowering Vette Feltrine, the cabled Sasso di Scarnia, and down the old mule road to the finish.",
    hero: WM("Busa delle Vette.jpg"),
    paragraphs: [
      "Above the hut, Passo Finestra opens the final act: the Vette Feltrine, the grassy southern ramparts of the Dolomites. The one serious moment comes early — the airy, cable-protected ledge across the flank of Sasso di Scarnia, big drops below — then grassy shoulders roll over the botanically famous Alpe Ramezza.",
      "On the rim of the silent Busa delle Vette stands Rifugio Dal Piaz (1,993 m), the last hut of the AV2 — on a clear evening you can see the Venetian lagoon glint. The finish is pure grace: 980 m down a beautifully graded military mule road to Croce d'Aune, where the Alta Via 2 ends. Then a beer at Birreria Pedavena, tradition demands it.",
    ],
    highlights: [
      ["Sasso di Scarnia balcony", "The one serious moment of the finale — an airy, cable-protected ledge across a precipitous flank, big drops into Val Canzoi below. A final shot of adrenaline."],
      ["Wildflowers of the Alpe Ramezza", "Botanically famous ground — edelweiss, alpine poppies and endemic flowers found nowhere else on Earth, carpeting the grassy southern ramparts."],
      ["Busa delle Vette amphitheatre", "A vast, silent glacio-karst bowl grazed by chamois under Monte Pavione — one last great hidden amphitheatre before the descent."],
      ["Sunset to the Venetian plain", "From Rifugio Dal Piaz, the last hut of the route, you can see the Venetian lagoon glint on a clear evening — the whole journey laid out behind and below you."],
      ["Birreria Pedavena — the finish beer", "The traditional finish-line ritual: a celebratory pint at Italy's most storied brewery, an 1896 monument at the very foot of the mountains you just crossed. You earned it."],
    ],
    caution: "The Sasso di Scarnia ledge is narrow, exposed and cable-protected — serious in wet or wind. A long final day; consider sleeping at Dal Piaz and finishing fresh.",
    stay: { name: "Finish — Croce d'Aune → Feltre", elev: "1,015 m / 270 m", note: "Option to overnight at Rifugio Dal Piaz on the rim, or finish in one push. From Croce d'Aune: DolomitiBus / taxi via Pedavena to Feltre.", link: "https://www.rifugiodalpiaz.com", img: WM("Rifugio Dal Piaz.jpg") },
    gallery: [
      [WM("La busa delle vette - panoramio.jpg"), "The Busa delle Vette"],
      [WM("Feltre - Piazza Maggiore.jpg"), "Piazza Maggiore, Feltre — journey's end"],
    ],
  },

  {
    id: "feltre", type: "travel", short: "Feltre",
    kicker: "Finish · Feltre", title: "Down to Feltre",
    sub: "Off the Vette Feltrine, a beer at Pedavena, and a Renaissance hill-town to celebrate in.",
    hero: WM("Feltre - Piazza Maggiore.jpg", 2000),
    paragraphs: [
      "The trail comes down to Croce d'Aune and Pedavena, where the customary finish-line beer waits at the 1896 Birreria — Italy's most storied brewery, now a monument. Four kilometres on lies Feltre.",
      "Feltre's centro storico is one of the best-preserved Renaissance towns in the Veneto: Piazza Maggiore ringed by frescoed palazzi, the Castello di Alboino above, panoramas back over the peaks you just walked. A night at L'Antico Piol, a Feltrino dinner, legs finally still.",
    ],
    stay: { name: "L'Antico Piol", elev: "Feltre, 270 m", note: "Via Monte Tomatico 15 — a quiet base a short walk below the old town. Check out Fri 10 Jul.", linkKey: "piol", link: null, img: WM("Feltre - Piazza Maggiore.jpg", 1600) },
    recsKey: "feltre",
    gallery: [],
  },
  {
    id: "venice2", type: "travel", short: "Venice",
    kicker: "Homeward · Venice", title: "Back to the lagoon",
    sub: "A last night in Cannaregio before DC + OM scatter — west to San Francisco, south to Johannesburg.",
    hero: WM("Venezia - Canale and Fondamenta di Cannaregio at evening.jpg", 2000),
    paragraphs: [
      "Trains carry DC + OM back to Venice for a final night in Cannaregio — the city's most lived-in sestiere, all canalside fondamente and evening spritz. A last bàcaro crawl, and maybe a rowing lesson on the lagoon.",
      "Then the trip unwinds in two directions: the Dragon Child flies home to San Francisco, the Old Man carries on to Johannesburg. Eleven days, 153 kilometres, one mountain range — done.",
    ],
    stay: { name: "Hotel Villa Viridia", elev: "Cannaregio, Venice", note: "Campiello Zen, Cannaregio 1486. DC checks out Sun 12 Jul, OM Mon 13 Jul.", linkKey: "viridia", link: null, img: WM("Venezia - Canale and Fondamenta di Cannaregio at evening.jpg", 1600) },
    recsKey: "venice", logisticsKey: "home",
    gallery: [],
  },
];

module.exports = { trip, logistics, recs, stops, links };
