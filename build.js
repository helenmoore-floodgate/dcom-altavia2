// DCOM · Alta Via 2 — static site generator.
// data.js (content) + track-data.js (GPS) + history.js (background) → index + day pages.
// Run: node build.js
const fs = require("fs");
const path = require("path");
const { trip, logistics, recs, stops, links } = require("./data.js");
const trackData = require("./track-data.js");
const history = require("./history.js");

const OUT = __dirname;
const CSS_VER = Date.now();
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const hikes = stops.filter((s) => s.type === "hike");
const dayData = (n) => trackData.days[n - 1];
const VBW = 1000;

// which history entry belongs to which stop
const HIST = {
  venice1: "venice", venice2: "venice", bressanone: "bressanone", feltre: "feltre",
  "day-01": "halsl", "day-02": "puez", "day-03": "pisciadu", "day-04": "fedaia",
  "day-05": "sanpellegrino", "day-06": "mulaz", "day-07": "rosetta", "day-08": "laritonda",
  "day-09": "cereda", "day-10": "boz", "day-11": "feltre",
};

/* ---- rich highlight research (per-day: exact names, photos, coffee/lunch, positions) ---- */
const HLDATA = {};
for (let day = 1; day <= 11; day++) {
  try { HLDATA[day] = JSON.parse(fs.readFileSync(path.join(__dirname, `scripts/hl/day-${day}.json`), "utf8")); }
  catch (e) { HLDATA[day] = null; }
}
const HLTYPE = {
  coffee:  { ic: "☕", c: "#9b5a22", lab: "Coffee stop" },
  lunch:   { ic: "🍴", c: "#c1671d", lab: "Lunch" },
  summit:  { ic: "▲", c: "#33332a", lab: "Summit" },
  pass:    { ic: "⌃", c: "#5a5a48", lab: "Pass" },
  ferrata: { ic: "⚑", c: "#d63a26", lab: "Via ferrata" },
  lake:    { ic: "≈", c: "#3f7fae", lab: "Lake" },
  scenery: { ic: "◆", c: "#5d7d34", lab: "View" },
  hut:     { ic: "⌂", c: "#7a6533", lab: "Hut" },
  valley:  { ic: "∨", c: "#5d7d34", lab: "Valley" },
  meadow:  { ic: "✿", c: "#6f9a36", lab: "Meadow" },
};
const hlType = (t) => HLTYPE[t] || HLTYPE.scenery;
const attr = (s) => esc(s).replace(/"/g, "&quot;");

// elevation markers — one numbered pin per highlight, sitting on the GPS line at its position
function hlMarkers(s, d) {
  const data = HLDATA[s.day];
  if (!data || !data.highlights) return "";
  const km = d.elev.km || 1, pts = d.elev.points || [], vbH = d.elev.vbH || 300;
  const yAt = (pos) => {
    if (!pts.length) return 50;
    const tx = pos * km; let best = pts[0];
    for (const p of pts) if (Math.abs(p.d - tx) < Math.abs(best.d - tx)) best = p;
    return (best.y / vbH) * 100;
  };
  return data.highlights.map((h, i) => {
    const x = Math.max(2, Math.min(98, (h.pos ?? 0) * 100));
    const y = Math.max(7, Math.min(80, yAt(h.pos ?? 0)));
    const ty = hlType(h.type), isF = h.type === "ferrata";
    const food = h.type === "coffee" || h.type === "lunch";
    const emoji = food ? `<span class="hl-emoji">${ty.ic}</span>` : "";
    const stick = ""; // Nick-harness sticker placeholder removed
    return `<div class="hl-pin ${isF ? "is-vf" : ""}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;--mc:${ty.c}" title="${attr((i + 1) + ". " + h.t)}" onclick="openHl(${s.day},${i})">${emoji}<span class="pin">${i + 1}</span>${stick}</div>`;
  }).join("");
}

// highlight dropdowns — number chip, real photo, exact place, 1–2 paragraphs
function hlList(s) {
  const data = HLDATA[s.day];
  if (!data || !data.highlights) {
    return (s.highlights || []).map((h) => `<details class="hl"><summary><span class="hl-ttl">${esc(Array.isArray(h) ? h[0] : h)}</span><span class="hl-chev"></span></summary><div class="hl-body"><p>${esc(Array.isArray(h) ? h[1] : "")}</p></div></details>`).join("");
  }
  return data.highlights.map((h, i) => {
    const ty = hlType(h.type), food = h.type === "coffee" || h.type === "lunch";
    const paras = String(h.descr || "").split(/\n\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join("");
    const photo = h.photo ? `<div class="hl-photo"><img src="${h.photo}${h.photo.includes("?") ? "" : "?width=900"}" alt="${attr(h.place || h.t)}" loading="lazy" onerror="this.closest('.hl-photo').remove()"></div>` : "";
    const place = h.place ? `<div class="hl-place"><span class="hl-tag" style="--mc:${ty.c}">${esc(ty.lab)}</span><span>${esc(h.place)}</span></div>` : "";
    return `<details class="hl" id="hl-${s.day}-${i}"><summary><span class="hl-num" style="--mc:${ty.c}">${i + 1}</span><span class="hl-ttl">${esc(h.t)}${food ? ` ${ty.ic}` : ""}</span><span class="hl-chev"></span></summary><div class="hl-body">${photo}${place}${paras}</div></details>`;
  }).join("");
}

// coffee & lunch callout for the day
function coffeeLunch(s) {
  const data = HLDATA[s.day];
  if (!data || (!data.coffee && !data.lunch)) return "";
  const row = (ic, lab, txt) => txt ? `<div class="cl-row"><span class="cl-ic">${ic}</span><div><b>${lab}</b> — ${esc(txt)}</div></div>` : "";
  return `<div class="panel cl-panel"><h4>Where's the coffee?</h4>${row("☕", "Coffee", data.coffee)}${row("🍴", "Lunch", data.lunch)}</div>`;
}

// coffee / lunch / ferrata markers along the whole-route overall profile
function overallMarkers() {
  const huts = (trackData.overall && trackData.overall.huts) || [];
  const hutX = {};
  huts.forEach((h) => { hutX[h.stage] = h.x; });
  const out = [];
  for (let day = 1; day <= 11; day++) {
    const data = HLDATA[day]; if (!data || !data.highlights) continue;
    const x0 = hutX[day - 1], x1 = hutX[day];
    if (x0 == null || x1 == null) continue;
    data.highlights.forEach((h) => {
      if (!["coffee", "lunch", "ferrata"].includes(h.type)) return;
      const xv = x0 + (h.pos ?? 0) * (x1 - x0);
      const ty = hlType(h.type);
      out.push(`<div class="op-mark ${h.type}" style="left:${((xv / VBW) * 100).toFixed(2)}%" title="${attr("Day " + day + " · " + h.t)}"><span class="op-ic">${ty.ic}</span><span class="op-stem"></span></div>`);
    });
  }
  return `<div class="op-overlay">${out.join("")}</div>`;
}

/* ------------------------------------------------------------ shared chrome */
const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,800&display=swap" rel="stylesheet">`;

function head(title, depth, opts) {
  opts = opts || {};
  const p = depth ? "../" : "";
  const leaflet = opts.map ? `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">` : "";
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="cache-control" content="no-cache, no-store, must-revalidate"><meta http-equiv="pragma" content="no-cache"><meta http-equiv="expires" content="0">
<title>${esc(title)}</title>
<meta property="og:type" content="website">
<meta property="og:site_name" content="Alta Via 2 · DC + OM">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="Eleven days hut-to-hut across the Dolomites — Bressanone to Feltre on the Alta Via 2. Almost time!!!">
<meta property="og:image" content="https://dcom-altavia2.com/assets/og-poster.jpg?v=2">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="https://dcom-altavia2.com/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="Eleven days hut-to-hut across the Dolomites. Almost time!!!">
<meta name="twitter:image" content="https://dcom-altavia2.com/assets/og-poster.jpg?v=2">
${fonts}
${leaflet}
<link rel="stylesheet" href="${p}css/style.css?v=${CSS_VER}">
</head><body>`;
}
function header(depth, onIndex) {
  const p = depth ? "../" : "";
  const tabs = onIndex
    ? `<div class="tabs"><button data-view="route" class="active">Route</button><button data-view="itinerary">Itinerary</button></div>`
    : `<div class="tabs"><a href="${p}index.html#route">Route</a><a href="${p}index.html#itinerary">Itinerary</a></div>`;
  return `<header class="site-header">
  <a class="brand" href="${p}index.html"><b>Alta Via 2</b> <span class="sub">— DC + OM</span></a>
  <nav>${tabs}</nav>
</header>`;
}
function footer(depth, opts) {
  opts = opts || {};
  const leafletJs = opts.map ? `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>` : "";
  return `<footer><div class="wrap">
  <div class="big">DC + OM <em>·</em> Alta Via 2</div>
  <p class="foot-offline"><a class="btn-offline" href="${depth ? "../" : ""}offline.html" download="AltaVia2-DCOM-offline.html">📥 Download the offline trail copy</a><span>One self-contained file — every day's plan on your phone with no signal needed.</span></p>
  <p>Dragon Child &amp; Old Man · ${esc(trip.dates)}. Route &amp; elevation from a recorded GPS track (±). Photos: <a class="ilink" href="https://www.thehiking.club/alta-via-2-dolomites" target="_blank" rel="noopener">The Hiking Club</a> &amp; <a class="ilink" href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a>. Always reconfirm huts and conditions.</p>
</div></footer>
${leafletJs}
<script src="${depth ? "../" : ""}js/main.js?v=${CSS_VER}"></script>
</body></html>`;
}

/* ------------------------------------------------------------ stickers */
const CORNERS = ["pos-tr", "pos-br", "pos-bl", "pos-tl"];
function cornerSticker(depth, seed) {
  const p = depth ? "../" : "";
  const file = ["assets/sticker-a.png", "assets/sticker-b.png"][seed % 2];
  const pos = CORNERS[seed % CORNERS.length];
  return `<img class="sticker sticker-corner ${pos}" src="${p}${file}" alt="" onerror="this.remove()">`;
}

/* ------------------------------------------------------------ hyperlinks */
function stayNameHTML(stay) {
  const url = (stay.linkKey && links[stay.linkKey]) || stay.link;
  return url ? `<a class="ilink" href="${url}" target="_blank" rel="noopener">${esc(stay.name)}</a>` : esc(stay.name);
}

/* ------------------------------------------------------------ elevation (overall, labelled) */
function niceStep(range) {
  const raw = range / 5, pow = Math.pow(10, Math.floor(Math.log10(raw))), norm = raw / pow;
  return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * pow;
}
function overallElevSVG(geom, huts) {
  const padL = geom.padL, padR = geom.padR, padT = geom.padT || 18, padB = geom.padB, vbH = geom.vbH, lo = geom.lo, hi = geom.hi;
  const Y = (e) => padT + (1 - (e - lo) / (hi - lo)) * (vbH - padT - padB);
  let grid = "";
  const step = niceStep(hi - lo);
  for (let e = Math.ceil(lo / step) * step; e <= hi; e += step) {
    const y = Y(e).toFixed(1);
    grid += `<line class="grid" x1="0" y1="${y}" x2="${VBW}" y2="${y}"/>`;
    grid += `<text class="axis-label" x="5" y="${(+y - 4).toFixed(1)}" text-anchor="start">${e} m</text>`;
  }
  let h = "";
  huts.forEach((ht, i) => {
    if (ht.stage === 0) return;
    const hy = Y(ht.elev), above = i % 2 === 0, ty = above ? hy - 11 : hy + 17;
    const anchor = ht.x > VBW - 64 ? "end" : ht.x < 64 ? "start" : "middle";
    const lx = Math.max(4, Math.min(VBW - 4, ht.x));
    h += `<line class="hut-tick" x1="${ht.x}" y1="${padT}" x2="${ht.x}" y2="${vbH - padB}"/>`;
    h += `<circle r="3.2" cx="${ht.x}" cy="${hy.toFixed(1)}" fill="#d63a26"/>`;
    h += `<text class="elev-hut-label" x="${lx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${anchor}" data-stage="${ht.stage}">${esc(ht.label)}</text>`;
  });
  return `<svg id="overall-elev" class="elev-svg" viewBox="0 0 ${VBW} ${vbH}" preserveAspectRatio="none" role="img" aria-label="Trip elevation profile">
  ${grid}<path class="area" d="${geom.areaPath}"/><path class="line" d="${geom.linePath}"/>${h}
  <line class="elev-cursor" x1="0" y1="${padT}" x2="0" y2="${vbH - padB}"/><circle class="elev-dot" r="4.5" cx="0" cy="0"/></svg>`;
}
/* full-bleed day elevation — line touches both edges, no axis labels */
function dayElevSVG(geom) {
  const vbH = geom.vbH, lo = geom.lo, hi = geom.hi, padT = 16, padB = 12;
  const Y = (e) => padT + (1 - (e - lo) / (hi - lo)) * (vbH - padT - padB);
  let grid = "";
  const step = niceStep(hi - lo);
  for (let e = Math.ceil(lo / step) * step; e <= hi; e += step) {
    const y = Y(e).toFixed(1);
    grid += `<line class="grid" x1="0" y1="${y}" x2="${VBW}" y2="${y}"/>`;
  }
  return `<svg id="day-elev-svg" class="elev-svg" viewBox="0 0 ${VBW} ${vbH}" preserveAspectRatio="none" role="img" aria-label="Today's elevation">
  ${grid}<path class="area" d="${geom.areaPath}"/><path class="line" d="${geom.linePath}"/>
  <line class="elev-cursor" x1="0" y1="${padT}" x2="0" y2="${vbH - padB}"/><circle class="elev-dot" r="4.5" cx="0" cy="0"/></svg>`;
}

/* ------------------------------------------------------------ derived day stats */
function timeRange(st) {
  const h = st.dist_km / 4.3 + st.ascent_m / 520 + st.descent_m / 1700;
  return `${Math.max(2, Math.round((h - 0.4) * 2) / 2)}–${Math.round((h + 0.7) * 2) / 2} h`;
}
function character(st, ferrata) {
  if (st.dist_km < 8 && st.ascent_m < 500) return "Easy";
  if (st.ascent_m > 1500 || st.dist_km > 19) return "Big day";
  return ferrata ? "Demanding" : "Moderate";
}

/* ------------------------------------------------------------ history toggle */
// One verified, 100%-factual fun fact per trek day — tied to that day's geography where possible.
const FUN_FACTS = {
  1: "You're starting in South Tyrol (Südtirol / Alto Adige), one of the few corners of Italy with three official languages — German, Italian and Ladin. German speakers are the majority up here, which is why tonight you sleep in a Hütte, not a rifugio.",
  2: "Reinhold Messner — the first person to climb Everest without bottled oxygen, and the first to summit all fourteen 8,000-metre peaks — grew up in the Funes (Villnöss) valley, directly beneath the Odle spires you walk past today.",
  3: "The Sella massif you cross today is ringed by the Sellaronda, one of the world's most famous ski circuits — a loop around four mountain passes (Gardena, Sella, Pordoi and Campolongo) that you can ski the whole way around in a single day.",
  4: "That huge wall across the valley is the Marmolada (3,343 m) — the highest peak in the Dolomites, nicknamed the 'Queen of the Dolomites', and home to the range's only sizeable glacier.",
  5: "The Dolomites' pale rock glows pink and red at sunrise and sunset — a phenomenon so characteristic of these mountains that it has its own Ladin name: enrosadira.",
  6: "These pale summits were once a warm, shallow sea. The rock is essentially fossilised coral reef, built up on an ocean floor more than 200 million years ago, in the Triassic period.",
  7: "The Dolomites — the rock, the mineral and the whole mountain range — take their name from the French geologist Déodat de Dolomieu, who first identified the unusual carbonate stone here in 1791.",
  8: "A century ago the Dolomites were a battlefield. During the First World War (1915–1918), Italian and Austro-Hungarian armies fought a brutal 'White War' across these mountains, carving tunnels into the rock and fixing the cabled routes that became the first via ferrata.",
  9: "The Dolomites were declared a UNESCO World Heritage Site in 2009 — listed across nine separate mountain groups (including the Pale di San Martino) for both their beauty and their importance to the science of how mountains form.",
  10: "These wild Feltre peaks lie inside the Dolomiti Bellunesi National Park, protected since 1990 and famous among botanists for rare alpine wildflowers — several of which grow nowhere else on Earth.",
  11: "A fitting send-off: the Alta Via 2 is nicknamed the 'Alta Via delle Leggende' — the High Route of Legends — after the Ladin myths and folklore tied to the peaks you've just crossed.",
};
function funFact(day) {
  const f = FUN_FACTS[day];
  if (!f) return "";
  return `<div class="funfact">
    <div class="ff-label">💡 Fun fact</div>
    <p class="ff-text">${esc(f)}</p>
  </div>`;
}

function historyToggle(stopId, opts) {
  opts = opts || {};
  const h = history[stopId] || history[HIST[stopId]];
  if (!h) return "";
  return `<div class="history-block${opts.main ? " main" : ""}">
  <h3 class="hist-name">${esc(h.title)}</h3>
  <details class="history"${opts.open ? " open" : ""}>
  <summary><span class="hint">Historical things to know</span><span class="chev"></span></summary>
  <div class="hbody">${h.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
</details></div>`;
}

/* ------------------------------------------------------------ snake grid box */
function snakeBox(s) {
  const href = `days/${s.id}.html`;
  if (s.type === "hike") {
    const st = dayData(s.day).stats;
    const vf = s.ferrata ? `<span class="badge-vf">Via ferrata</span>` : "";
    return `<a class="daybox" id="stage-${s.day}" href="${href}">
  <div class="thumb" style="background-image:url('${s.hero}')"><span class="num">${s.day}</span></div>
  <div class="box-body">
    <div class="box-top"><span class="daynum">${esc(s.kicker)}</span>${vf}</div>
    <h3>${esc(s.title)}</h3>
    <div class="box-sub">${esc(s.sub)}</div>
    <div class="box-stats">${st.dist_km} km · +${st.ascent_m} m · ${timeRange(st)}</div>
  </div></a>`;
  }
  return `<a class="daybox" id="stop-${s.id}" href="${href}">
  <div class="thumb" style="background-image:url('${s.hero}')"></div>
  <div class="box-body">
    <div class="box-top"><span class="daynum">${esc(s.kicker)}</span></div>
    <h3>${esc(s.title)}</h3>
    <div class="box-sub">${esc(s.sub)}</div>
    <div class="box-stats">${esc(s.stay.name)}</div>
  </div></a>`;
}

/* ------------------------------------------------------------ logistics */
function legRow(l) {
  const site = l.hotelKey && links[l.hotelKey]
    ? ` <a class="ilink" href="${links[l.hotelKey]}" target="_blank" rel="noopener">site ↗</a>` : "";
  return `<div class="logi-row ${l.kind === "fly" ? "fly" : ""}">
      <div class="when">${esc(l.when || "")}</div>
      <div class="detail">${esc(l.text)}${site}</div>
    </div>`;
}
function logiSection(block) {
  const ordered = [...block.blocks].sort((a, b) => (a.who === "OM" ? -1 : 1)); // Old Man first
  const person = ordered.map((b) => `
    <div class="logi-person">
      <div class="who"><b>${esc(b.name)}</b><span class="frm">${esc(b.from)}</span></div>
      <div class="logi-tl">${b.legs.map(legRow).join("")}</div>
    </div>`).join("");
  const together = block.together && block.together.length
    ? `<div class="logi-together"><div class="label">Together</div><div class="logi-tl">${block.together.map(legRow).join("")}</div></div>` : "";
  const notes = block.notes && block.notes.length
    ? `<div class="logi-notes"><div class="label">Things to think about</div><ul>${block.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>` : "";
  return `<div class="logi-col"><h3 class="logi-title">${esc(block.title)}</h3>${person}${together}${notes}</div>`;
}

/* ------------------------------------------------------------ recs + rec map */
function recItem(it) {
  const nm = it.url ? `<a class="ilink" href="${it.url}" target="_blank" rel="noopener">${esc(it.name)}</a>` : esc(it.name);
  return `<div class="rec"><div class="rec-name">${nm} <span class="area">${esc(it.area)}</span></div><div class="rec-why">${esc(it.why)}</div></div>`;
}
// live per-day weather section — coords from the GPS midpoint, date from the trek schedule
function weatherSection(s, d) {
  const co = (d && d.coords) || [];
  if (!co.length) return "";
  const mid = co[Math.floor(co.length / 2)];
  const dt = new Date(Date.UTC(2026, 5, 29)); // Day 1 = Mon 29 Jun 2026
  dt.setUTCDate(dt.getUTCDate() + (s.day - 1));
  const iso = dt.toISOString().slice(0, 10);
  const human = dt.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  return `<section class="day-section wx-sec"><div class="wrap">
    <div class="weather" data-lat="${mid[0]}" data-lng="${mid[1]}" data-date="${iso}">
      <div class="wx-head"><span class="wx-when">Forecast · ${esc(human)}</span><span class="wx-loc">${esc(d.to || s.title)} area</span></div>
      <div class="wx-body"><span class="wx-soon">Loading the latest mountain forecast…</span></div>
    </div>
  </div></section>`;
}

// main-page weather calendar — one tile per trek day, filled client-side from Open-Meteo, click → modal
function wxCalendar() {
  const cells = hikes.map((s) => {
    const d = dayData(s.day);
    const co = d.coords || [];
    const mid = co.length ? co[Math.floor(co.length / 2)] : [46.5, 11.8];
    const dt = new Date(Date.UTC(2026, 5, 29)); // Day 1 = Mon 29 Jun 2026
    dt.setUTCDate(dt.getUTCDate() + (s.day - 1));
    const iso = dt.toISOString().slice(0, 10);
    const wd = dt.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });
    const dm = dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
    const name = d.to || s.short || s.title;
    return `<button class="wxc-cell" type="button" data-day="${s.day}" data-lat="${mid[0]}" data-lng="${mid[1]}" data-date="${iso}" data-name="${esc(name)}">
      <span class="wxc-row"><span class="wxc-wd">${esc(wd)}</span><span class="wxc-dn">Day ${s.day}</span></span>
      <span class="wxc-date">${esc(dm)}</span>
      <span class="wxc-icon" aria-hidden="true"></span>
      <span class="wxc-temp">··</span>
      <span class="wxc-place">${esc(name)}</span>
    </button>`;
  }).join("");
  return `<div class="elev-block wx-cal-block">
    <div class="section-head"><h2>The <em>weather</em></h2><p>Live forecast for every day, taken at that day's actual point on the route — tap any day for the hour-by-hour detail and where it might turn. Each fills in once it's within range (~16 days out) and refreshes on every visit.</p></div>
    <div class="wx-cal">${cells}</div>
    <p class="wx-cal-foot">Live data from <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> — best-match Alpine model. Deep forecasts open on <a href="https://www.meteoblue.com/" target="_blank" rel="noopener">meteoblue</a>.</p>
  </div>`;
}

function recsBlock(key) {
  const r = recs[key];
  const col = (title, items) => (items && items.length) ? `<div><h4>${esc(title)}</h4>${items.map(recItem).join("")}</div>` : "";
  return `<div class="recs">${col("Coffee & bàcari", r.coffee)}${col("Worth doing", r.activities)}</div>`;
}

/* ------------------------------------------------------------ mini charts */
function miniCharts() {
  const ds = hikes.map((s) => ({ day: s.day, ...dayData(s.day).stats }));
  const maxKm = Math.max(...ds.map((d) => d.dist_km));
  const maxUp = Math.max(...ds.map((d) => d.ascent_m));
  const barChart = (title, cap, val, max, cls) => `
    <div class="barchart">
      <div class="bc-head"><h4>${title}</h4><span class="cap">${cap}</span></div>
      <div class="bars">${ds.map((d) => {
        const v = val(d), h = Math.max(4, Math.round((v / max) * 100));
        return `<div class="bar-col" title="Day ${d.day}"><span class="bar-val">${v}</span><span class="bar ${cls}" style="height:${h}%"></span><span class="bar-day">${d.day}</span></div>`;
      }).join("")}</div>
    </div>`;
  // dual-axis line: distance vs climb, each normalised to its own max
  const W = 1000, H = 250, pl = 8, pr = 8, pt = 18, pb = 28, n = ds.length;
  const X = (i) => pl + (i / (n - 1)) * (W - pl - pr);
  const Yk = (v) => pt + (1 - v / maxKm) * (H - pt - pb);
  const Ym = (v) => pt + (1 - v / maxUp) * (H - pt - pb);
  const lp = (Y, key) => ds.map((d, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(d[key]).toFixed(1)}`).join(" ");
  const dots = (Y, key, c) => ds.map((d, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(d[key]).toFixed(1)}" r="4" fill="${c}"/>`).join("");
  const xax = ds.map((d, i) => `<text x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" class="dl-ax">${d.day}</text>`).join("");
  const dualData = { vbW: W, days: ds.map((d, i) => ({ x: +X(i).toFixed(1), day: d.day, km: d.dist_km, kmY: +Yk(d.dist_km).toFixed(1), m: d.ascent_m, mY: +Ym(d.ascent_m).toFixed(1) })) };
  return `<div class="minicharts">
    ${barChart("Distance", "km per day", (d) => d.dist_km, maxKm, "blue")}
    ${barChart("Climb", "metres ascended per day", (d) => d.ascent_m, maxUp, "red")}
  </div>
  <div class="dualchart">
    <div class="bc-head"><h4>Distance &amp; climb, day by day</h4><span class="cap"><span class="lg-km">●</span> distance &nbsp; <span class="lg-m">●</span> climb &nbsp;·&nbsp; hover a day</span></div>
    <svg class="dual-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <line class="dl-cursor" x1="0" y1="${pt}" x2="0" y2="${H - pb}"/>
      <path class="dl-km" d="${lp(Yk, "dist_km")}"/><path class="dl-m" d="${lp(Ym, "ascent_m")}"/>
      ${dots(Yk, "dist_km", "#3f7fae")}${dots(Ym, "ascent_m", "#d63a26")}${xax}
      <circle class="dl-hdot dl-dot-km" r="5.5" cx="0" cy="0"/><circle class="dl-hdot dl-dot-m" r="5.5" cx="0" cy="0"/>
    </svg>
  </div>
  <script>window.__DUAL__ = ${JSON.stringify(dualData)};</script>`;
}

/* ------------------------------------------------------------ INDEX */
function indexPage() {
  const markers = trackData.markers.map((m) => {
    const s = hikes.find((h) => h.day === m.stage);
    return { name: m.name, day: m.stage, stage: m.stage, lat: m.lat, lng: m.lng,
      elev: (m.elevTrack ? m.elevTrack + " m" : ""), kicker: "Night " + m.stage,
      href: "days/" + (s ? s.id : "day-0" + m.stage) + ".html" };
  });
  const routeJS = { full: trackData.full, bounds: trackData.bounds, markers,
    profile: { points: trackData.overall.points, vbH: trackData.overall.vbH } };
  const overallSVG = overallElevSVG(trackData.overall, trackData.overall.huts);
  const boxes = stops.map(snakeBox).join("\n      ");

  return `${head(`Alta Via 2 · DC + OM · 2026`, 0, { map: true })}
${header(0, true)}

<section class="hero">
  <div class="bg" style="background-image:url('${trip.hero}')"></div>
  <div class="hero-inner">
    <div class="av-kicker">${esc(trip.kicker)}</div>
    <div class="av-title">${esc(trip.title)}</div>
    <div class="av-featuring">${esc(trip.featuring)}</div>
    <p class="tagline">${esc(trip.tagline)}</p>
    <div class="meta-row">${trip.stats.map(([a, b]) => `<span><b>${esc(a)}</b> ${esc(b)}</span>`).join("")}</div>
  </div>
  <div class="hero-caption">${esc(trip.heroCaption)}</div>
</section>

<section class="dcom-photo-sec">
  <figure class="framed-photo">
    <img src="assets/dcom-photo.jpg" alt="DC + OM" onerror="this.closest('.dcom-photo-sec').style.display='none'">
    <figcaption>Almost time!!!</figcaption>
  </figure>
</section>

<main>
<section id="view-route" class="view active">
  <div class="wrap view-pad">
    <div class="section-head">
      <h2>The <em>route</em></h2>
      <p>153 km north to south across six Dolomite groups. Zoom the map; click a night to open that day.</p>
    </div>
    <div class="map-frame">
      <div id="map"></div>
      <div class="map-legend">
        <div class="label">Alta Via 2 — DC + OM</div>
        <div class="ln"><span class="swatch"></span> recorded route (${trackData.totalKm} km)</div>
        <div class="ln"><span class="dot"></span> overnight hut — click to open the day</div>
      </div>
    </div>
    ${wxCalendar()}
    <div class="elev-block">
      <div class="section-head"><h2>The <em>profile</em></h2><p>The whole climb, hut to hut. Hover for elevation; click any hut name to jump to its day.</p></div>
      <div class="elev-card">${overallSVG}</div>
      ${miniCharts()}
    </div>
    <div class="elev-block along-block">
      <div class="section-head"><h2>Along the <em>way</em></h2><p>A few real glimpses of the actual line — Sella, Pale, Pisciadù, the Vette Feltrine.</p></div>
      <div class="along-grid">${trip.alongTheWay.map(([src, cap]) => `<figure class="along-fig"><img src="${src}" alt="${esc(cap)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>`).join("")}</div>
    </div>
    <div class="elev-block">
      <div class="section-head"><h2>The <em>history</em></h2><p>Why this line, across these mountains, matters — the route's origins, its legends, and its UNESCO geology.</p></div>
      ${historyToggle("route", { main: true, open: true })}
    </div>
  </div>
</section>

<section id="view-itinerary" class="view">
  <div class="wrap view-pad">
    <div class="section-head"><h2>Day by <em>day</em></h2><p>Two travel days, eleven on the trail, two to come home. The red line is the order we walk it.</p></div>
    <div class="snake">
      <svg class="snake-line" preserveAspectRatio="none"></svg>
      <div class="snake-grid">
      ${boxes}
      </div>
    </div>
    <section class="logi"><div style="padding-top:64px">
      <div class="section-head"><h2>Logistics</h2><p>Old Man in from London, Dragon Child from San Francisco — and home in two directions.</p></div>
      <div class="logi-cols">${logiSection(logistics.there)}${logiSection(logistics.home)}</div>
    </div></section>
  </div>
</section>
</main>

<script>window.__ROUTE__ = ${JSON.stringify(routeJS)};</script>
${footer(0, { map: true })}`;
}

/* ------------------------------------------------------------ HIKE DAY PAGE */
function hikeDayPage(s, i) {
  const d = dayData(s.day), st = d.stats;
  const prev = stops[i - 1], next = stops[i + 1];
  const elev = dayElevSVG({ vbH: d.elev.vbH, lo: d.elev.lo, hi: d.elev.hi, areaPath: d.elev.areaPath, linePath: d.elev.linePath });
  const vf = s.ferrata ? `<span class="badge-vf">Via ferrata</span>` : "";
  const vfMarker = s.ferrata
    ? `<div class="vf-marker" style="left:${(d.elev.hiX / 10).toFixed(1)}%"><span class="vf-flag">⚑ Via ferrata</span><span class="vf-stem"></span><img class="vf-sticker-img" src="../assets/sticker-vf.png" alt="" onerror="this.style.display='none'"></div>` : "";
  const caution = s.caution ? `<div class="panel warn"><h4>Watch out for</h4><p style="font-size:.94rem;color:var(--ink-2)">${esc(s.caution)}</p></div>` : "";
  const gallery = (s.gallery && s.gallery.length) ? `
<section class="gallery-sec"><div class="wrap">
  <div class="label">Along the way</div>
  <div class="gallery">${s.gallery.map(([src, cap]) => `<figure><img src="${src}" alt="${esc(cap)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>`).join("")}</div>
</div></section>` : "";
  const stayName = stayNameHTML(s.stay);
  const accom = s.stay.img
    ? `<div class="accom-inner"><div class="photo" style="background-image:url('${s.stay.img}')"></div>
       <div class="info"><div class="label">Tonight</div><h3>${stayName}</h3><div class="elev">${esc(s.stay.elev)}</div><p>${esc(s.stay.note)}</p>${s.stay.link ? `<a class="btn" href="${s.stay.link}" target="_blank" rel="noopener">Hut site →</a>` : ""}</div></div>`
    : `<div class="accom-inner"><div class="info full"><div class="label">Tonight</div><h3>${stayName}</h3><div class="elev">${esc(s.stay.elev)}</div><p>${esc(s.stay.note)}</p>${s.stay.link ? `<a class="btn" href="${s.stay.link}" target="_blank" rel="noopener">Hut site →</a>` : ""}</div></div>`;

  return `${head(`${esc(s.title)} · DC + OM`, 1)}
<div class="day-intro"><div class="intro-photo" style="background-image:url('${s.hero}')"></div><div class="intro-shade"></div>
  <svg viewBox="0 0 ${VBW} ${d.elev.vbH}" preserveAspectRatio="none"><path class="intro-line" d="${d.elev.linePath}"/></svg></div>
${header(1, false)}
<section class="day-hero">
  <div class="bg" style="background-image:url('${s.hero}')"></div>
  <div class="hero-inner">
    <div class="daynum">${esc(s.kicker)} ${vf}</div>
    <h1>${esc(s.title)}</h1>
    <p class="sub">${esc(s.sub)}</p>
  </div>
</section>

<div class="daystat"><div class="wrap">
  <div class="cell"><b>${st.dist_km} km</b><span>distance</span></div>
  <div class="cell"><b>+${st.ascent_m} m</b><span>climb</span></div>
  <div class="cell"><b>−${st.descent_m} m</b><span>descent</span></div>
  <div class="cell"><b>${st.hi_m} m</b><span>high point</span></div>
  <div class="cell"><b>${timeRange(st)}</b><span>${character(st, s.ferrata)}</span></div>
</div></div>

${weatherSection(s, d)}

<section class="day-elev" style="padding:48px 0 0">
  <div class="day-elev-cap"><span class="lo">Today's elevation — from the GPS track</span><span class="hi">▲ ${st.hi_m} m</span></div>
  <div class="day-elev-fb">${elev}${hlMarkers(s, d)}</div>
</section>

<section class="day-section"><div class="wrap"><div class="day-grid">
  <div class="prose">${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
  <div class="side">
    <div class="panel"><h4>Highlights — tap to expand</h4><div class="hl-list">${hlList(s)}</div></div>
    ${coffeeLunch(s)}
    ${caution}
  </div>
</div></div></section>

<section class="accom"><div class="wrap">${accom}</div></section>

<section class="day-section"><div class="wrap">
  <div class="journal-wrap"><div class="label">Journal — ${esc(s.kicker)}</div>
    <div class="book">
      <div class="book-page left"><div class="jdate">Date <span class="rule"></span></div></div>
      <div class="book-page right"><p class="jph">To be filled in once we've seen all the awesome, incredible, amazing, exciting, grandiose, breathtaking, jaw-dropping, soul-stirring, once-in-a-lifetime aspects of the Dolomites.</p></div>
    </div>
  </div>
</div></section>

<section class="day-section"><div class="wrap">${historyToggle(s.id)}${funFact(s.day)}</div></section>
${gallery}

<div class="pager">
  ${prev ? `<a href="${prev.id}.html"><span class="dir">← Previous</span><b>${esc(prev.short || prev.title)}</b></a>` : `<a class="spacer"></a>`}
  ${next ? `<a class="next" href="${next.id}.html"><span class="dir">Next →</span><b>${esc(next.short || next.title)}</b></a>` : `<a class="next" href="../index.html#itinerary"><span class="dir">Back to</span><b>All days</b></a>`}
</div>

<script>window.__DAY__ = ${JSON.stringify({ elev: { points: d.elev.points, vbH: d.elev.vbH } })};</script>
${footer(1)}`;
}

/* ---- train-journey map (stations + the line they trace) ---- */
const TRAIN_STATIONS = {
  "Venezia Mestre": { lat: 45.4817, lng: 12.2380, short: "Mestre" },
  "Verona Porta Nuova": { lat: 45.4289, lng: 10.9817, short: "Verona" },
  "Bolzano · Bozen": { lat: 46.4979, lng: 11.3548, short: "Bolzano" },
  "Bressanone · Brixen": { lat: 46.7170, lng: 11.6564, short: "Bressanone" },
};
function transitStations(transit) {
  const names = [transit.legs[0].from, ...transit.legs.map((l) => l.to)];
  return names.map((n) => { const st = TRAIN_STATIONS[n] || {}; return { name: n, short: st.short || n, lat: st.lat, lng: st.lng }; });
}

/* ------------------------------------------------------------ TRAVEL DAY PAGE */
function travelDayPage(s, i) {
  const prev = stops[i - 1], next = stops[i + 1];
  const recsHtml = s.recsKey ? `<section class="day-section"><div class="wrap">
    <div class="section-head"><h2>${s.recsTitle || "While you're <em>here</em>"}</h2><p>${esc(s.recsNote || "Reddit-sourced, local-leaning — on the map below, each pin links to the place.")}</p></div>
    <div class="rec-map-wrap"><div class="rec-map" id="rec-map"></div></div>
    ${recsBlock(s.recsKey)}
  </div></section>` : "";
  const transitHtml = s.transit ? `<section class="day-section"><div class="wrap">
    <div class="section-head"><h2>The <em>train</em> north</h2><p>${esc(s.transit.date)}.</p></div>
    <div class="transit">${s.transit.legs.map((l) => `<div class="tleg"><div class="tl-end"><b>${esc(l.dep)}</b><span>${esc(l.from)}</span></div><div class="tl-mid"><span class="tl-train">${esc(l.train)}</span><span class="tl-line"></span></div><div class="tl-end tl-r"><b>${esc(l.arr)}</b><span>${esc(l.to)}</span></div></div>`).join("")}</div>
    <div class="train-map-wrap"><div class="train-map" id="train-map"></div><div class="train-map-cap">West to Verona, then north up the Adige &amp; Isarco valleys — straight into the Dolomites.</div></div>
    <p class="transit-note"><b>Getting to the station:</b> ${esc(s.transit.toStation)}</p>
  </div></section>` : "";
  const logiHtml = s.logisticsKey ? `<section class="day-section"><div class="wrap"><div class="section-head"><h2>${esc(logistics[s.logisticsKey].title)}</h2></div>${logiSection(logistics[s.logisticsKey])}</div></section>` : "";
  const histHtml = `<section class="day-section"><div class="wrap">${historyToggle(s.id)}</div></section>`;
  const stayName = stayNameHTML(s.stay);
  const accom = `<div class="accom-inner"><div class="photo" style="background-image:url('${s.stay.img}')"></div>
    <div class="info"><div class="label">Base</div><h3>${stayName}</h3><div class="elev">${esc(s.stay.elev)}</div><p>${esc(s.stay.note)}</p>${(s.stay.linkKey && links[s.stay.linkKey]) ? `<a class="btn" href="${links[s.stay.linkKey]}" target="_blank" rel="noopener">Hotel site →</a>` : ""}</div></div>`;

  const recJS = s.recsKey ? `<script>window.__RECMAP__ = ${JSON.stringify({
    center: recs[s.recsKey].center, zoom: recs[s.recsKey].zoom,
    pins: [...recs[s.recsKey].coffee, ...recs[s.recsKey].activities].map((r) => ({ name: r.name, area: r.area, lat: r.lat, lng: r.lng, url: r.url })),
  })};</script>` : "";
  const trainJS = s.transit ? `<script>window.__TRAINMAP__ = ${JSON.stringify({ stations: transitStations(s.transit), legs: s.transit.legs.map((l) => ({ from: l.from, to: l.to, train: l.train })) })};</script>` : "";

  return `${head(`${esc(s.title)} · DC + OM`, 1, { map: !!(s.recsKey || s.transit) })}
${header(1, false)}
<section class="day-hero">
  <div class="bg" style="background-image:url('${s.hero}')"></div>
  <div class="hero-inner">
    <div class="daynum">${esc(s.kicker)}</div>
    <h1>${esc(s.title)}</h1>
    <p class="sub">${esc(s.sub)}</p>
  </div>
</section>
<section class="day-section"><div class="wrap"><div class="prose" style="max-width:70ch">${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</div></div></section>
${transitHtml}
<section class="accom"><div class="wrap">${accom}</div></section>
${recsHtml}
${logiHtml}
${histHtml}
<div class="pager">
  ${prev ? `<a href="${prev.id}.html"><span class="dir">← Previous</span><b>${esc(prev.short || prev.title)}</b></a>` : `<a class="spacer"></a>`}
  ${next ? `<a class="next" href="${next.id}.html"><span class="dir">Next →</span><b>${esc(next.short || next.title)}</b></a>` : `<a class="next" href="../index.html#itinerary"><span class="dir">Back to</span><b>All days</b></a>`}
</div>
${recJS}${trainJS}
${footer(1, { map: !!(s.recsKey || s.transit) })}`;
}

/* ============================ OFFLINE single-file build (no internet needed) ============================ */
// a small inline route map drawn straight from the day's GPS coords (works fully offline)
function routeMapSVG(coords) {
  if (!coords || coords.length < 2) return "";
  const lats = coords.map((c) => c[0]), lngs = coords.map((c) => c[1]);
  const minLa = Math.min(...lats), maxLa = Math.max(...lats), minLo = Math.min(...lngs), maxLo = Math.max(...lngs);
  const W = 600, H = 320, pad = 22;
  const midLa = (minLa + maxLa) / 2, kx = Math.cos(midLa * Math.PI / 180);
  const spanLo = Math.max(1e-6, (maxLo - minLo) * kx), spanLa = Math.max(1e-6, maxLa - minLa);
  const sc = Math.min((W - 2 * pad) / spanLo, (H - 2 * pad) / spanLa);
  const ox = ((W - 2 * pad) - spanLo * sc) / 2, oy = ((H - 2 * pad) - spanLa * sc) / 2;
  const X = (lo) => pad + ox + (lo - minLo) * kx * sc;
  const Y = (la) => pad + oy + (maxLa - la) * sc;
  const step = Math.max(1, Math.floor(coords.length / 320));
  const pts = coords.filter((_, i) => i % step === 0);
  const dpath = pts.map((c, i) => (i ? "L" : "M") + X(c[1]).toFixed(1) + " " + Y(c[0]).toFixed(1)).join(" ");
  const a = coords[0], b = coords[coords.length - 1];
  return `<svg class="o-map" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><rect width="${W}" height="${H}" fill="#e9e4d8"/><path d="${dpath}" fill="none" stroke="#d63a26" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${X(a[1]).toFixed(1)}" cy="${Y(a[0]).toFixed(1)}" r="6.5" fill="#3f7a3f" stroke="#fff" stroke-width="2"/><circle cx="${X(b[1]).toFixed(1)}" cy="${Y(b[0]).toFixed(1)}" r="6.5" fill="#d63a26" stroke="#fff" stroke-width="2"/></svg>`;
}
function trainMapSVG(stations) {
  const ss = (stations || []).filter((s) => s.lat != null && s.lng != null);
  if (ss.length < 2) return "";
  const lats = ss.map((s) => s.lat), lngs = ss.map((s) => s.lng);
  const minLa = Math.min(...lats), maxLa = Math.max(...lats), minLo = Math.min(...lngs), maxLo = Math.max(...lngs);
  const W = 600, H = 430, pad = 58;
  const midLa = (minLa + maxLa) / 2, kx = Math.cos(midLa * Math.PI / 180);
  const spanLo = Math.max(1e-6, (maxLo - minLo) * kx), spanLa = Math.max(1e-6, maxLa - minLa);
  const sc = Math.min((W - 2 * pad) / spanLo, (H - 2 * pad) / spanLa);
  const ox = ((W - 2 * pad) - spanLo * sc) / 2, oy = ((H - 2 * pad) - spanLa * sc) / 2;
  const X = (lo) => pad + ox + (lo - minLo) * kx * sc;
  const Y = (la) => pad + oy + (maxLa - la) * sc;
  const line = ss.map((s, i) => (i ? "L" : "M") + X(s.lng).toFixed(1) + " " + Y(s.lat).toFixed(1)).join(" ");
  const dots = ss.map((s, i) => {
    const x = X(s.lng), y = Y(s.lat), right = x > W / 2;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5" fill="#d63a26" stroke="#fff" stroke-width="2"/><text x="${(x + (right ? -12 : 12)).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${right ? "end" : "start"}" class="tm-lbl">${esc((i + 1) + "  " + s.short)}</text>`;
  }).join("");
  return `<svg class="o-trainmap" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#e9e4d8"/><path d="${line}" fill="none" stroke="#d63a26" stroke-width="3" stroke-linejoin="round"/>${dots}</svg>`;
}
function offlinePins(s, d) {
  const data = HLDATA[s.day];
  if (!data || !data.highlights) return "";
  const km = d.elev.km || 1, pts = d.elev.points || [], vbH = d.elev.vbH || 300;
  const yAt = (pos) => { if (!pts.length) return 50; const tx = pos * km; let best = pts[0]; for (const p of pts) if (Math.abs(p.d - tx) < Math.abs(best.d - tx)) best = p; return (best.y / vbH) * 100; };
  return data.highlights.map((h, i) => {
    const x = Math.max(2, Math.min(97, (h.pos ?? 0) * 100)), y = Math.max(8, Math.min(82, yAt(h.pos ?? 0)));
    return `<div class="o-pin" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;background:${hlType(h.type).c}">${i + 1}</div>`;
  }).join("");
}
function offlineHighlights(s) {
  const data = HLDATA[s.day];
  if (!data || !data.highlights) return "";
  return data.highlights.map((h, i) => {
    const ty = hlType(h.type), food = h.type === "coffee" || h.type === "lunch";
    const paras = String(h.descr || "").split(/\n\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join("");
    const place = h.place ? `<div class="o-place"><b>${esc(ty.lab)}:</b> ${esc(h.place)}</div>` : "";
    return `<details class="o-hl"><summary><span class="o-num" style="background:${ty.c}">${i + 1}</span> ${esc(h.t)}${food ? " " + ty.ic : ""}</summary><div class="o-hlb">${place}${paras}</div></details>`;
  }).join("");
}
// full-route SVG (offline replacement for the Leaflet route map on the home page)
function fullRouteSVG() {
  const all = [];
  hikes.forEach((s) => { (dayData(s.day).coords || []).forEach((c) => all.push(c)); });
  if (all.length < 2) return "";
  const lats = all.map((c) => c[0]), lngs = all.map((c) => c[1]);
  const minLa = Math.min(...lats), maxLa = Math.max(...lats), minLo = Math.min(...lngs), maxLo = Math.max(...lngs);
  const W = 560, H = 660, pad = 30;
  const midLa = (minLa + maxLa) / 2, kx = Math.cos(midLa * Math.PI / 180);
  const spanLo = Math.max(1e-6, (maxLo - minLo) * kx), spanLa = Math.max(1e-6, maxLa - minLa);
  const sc = Math.min((W - 2 * pad) / spanLo, (H - 2 * pad) / spanLa);
  const ox = ((W - 2 * pad) - spanLo * sc) / 2, oy = ((H - 2 * pad) - spanLa * sc) / 2;
  const X = (lo) => pad + ox + (lo - minLo) * kx * sc, Y = (la) => pad + oy + (maxLa - la) * sc;
  const step = Math.max(1, Math.floor(all.length / 900));
  const pts = all.filter((_, i) => i % step === 0);
  const d = pts.map((c, i) => (i ? "L" : "M") + X(c[1]).toFixed(1) + " " + Y(c[0]).toFixed(1)).join(" ");
  const a = all[0], b = all[all.length - 1];
  const hutDots = hikes.map((s) => { const co = dayData(s.day).coords || []; return co.length ? co[co.length - 1] : null; }).filter(Boolean)
    .map((h) => `<circle cx="${X(h[1]).toFixed(1)}" cy="${Y(h[0]).toFixed(1)}" r="3.6" fill="#fff" stroke="#d63a26" stroke-width="2"/>`).join("");
  return `<svg class="of-routemap" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><rect width="${W}" height="${H}" fill="#e9e4d8"/><path d="${d}" fill="none" stroke="#d63a26" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${hutDots}<circle cx="${X(a[1]).toFixed(1)}" cy="${Y(a[0]).toFixed(1)}" r="6" fill="#3f7a3f" stroke="#fff" stroke-width="2"/><circle cx="${X(b[1]).toFixed(1)}" cy="${Y(b[0]).toFixed(1)}" r="6" fill="#d63a26" stroke="#fff" stroke-width="2"/></svg>`;
}

// pull a `window.__NAME__ = {...};` JSON object out of a rendered page (brace-balanced)
function extractAssign(html, name) {
  const i = html.indexOf("window.__" + name + "__ = ");
  if (i < 0) return null;
  let j = html.indexOf("{", i);
  if (j < 0) return null;
  let depth = 0, instr = false, esc = false, end = -1;
  for (let k = j; k < html.length; k++) {
    const c = html[k];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') instr = !instr;
    if (instr) continue;
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = k + 1; break; } }
  }
  if (end < 0) return null;
  try { return JSON.parse(html.slice(j, end)); } catch (e) { return null; }
}
function bodyInner(html) { const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i); return m ? m[1] : html; }
function stripScripts(html) { return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ""); }
function inlineImgs(html, IMG) {
  const look = (u) => { let b = u.split("?")[0]; if (b.startsWith("../")) b = b.slice(3); return IMG[b] || null; };
  const E = "(?:jpe?g|png|webp|gif|avif)";
  return html
    .replace(new RegExp('(src|href)="([^"]+\\.' + E + '(?:\\?[^"]*)?)"', "gi"), (m, a, u) => { const d = look(u); return d ? `${a}="${d}"` : m; })
    .replace(new RegExp("(src|href)='([^']+\\." + E + "(?:\\?[^']*)?)'", "gi"), (m, a, u) => { const d = look(u); return d ? `${a}='${d}'` : m; })
    .replace(new RegExp('url\\("([^"]+\\.' + E + '(?:\\?[^"]*)?)"\\)', "gi"), (m, u) => { const d = look(u); return d ? `url("${d}")` : m; })
    .replace(new RegExp("url\\('([^']+\\." + E + "(?:\\?[^']*)?)'\\)", "gi"), (m, u) => { const d = look(u); return d ? `url('${d}')` : m; })
    .replace(new RegExp("url\\(([^\"')][^)]*\\." + E + "(?:\\?[^)]*)?)\\)", "gi"), (m, u) => { const d = look(u); return d ? `url(${d})` : m; });
}
function rewriteLinks(html) {
  return html
    .replace(/href="(?:\.\.\/)?offline\.html"\s*download="[^"]*"/g, 'href="#home"')
    .replace(/href="(?:\.\.\/)?index\.html#itinerary"/g, 'href="#home/itinerary"')
    .replace(/href="(?:\.\.\/)?index\.html#[\w-]+"/g, 'href="#home"')
    .replace(/href="(?:\.\.\/)?index\.html"/g, 'href="#home"')
    .replace(/href="days\/([\w-]+)\.html"/g, 'href="#$1"')
    .replace(/href="([a-z0-9-]+)\.html"/gi, 'href="#$1"');
}

// THE full offline bundle: the entire site as one self-contained, clickable, offline HTML file
function buildOffline() {
  let IMG = {};
  try { IMG = JSON.parse(fs.readFileSync(path.join(__dirname, "scripts/.offline-imgs.json"), "utf8")); }
  catch (e) { console.warn("offline: image cache missing — run the image cache step"); }
  let fontB64 = "";
  try { fontB64 = fs.readFileSync(path.join(__dirname, "scripts/HankenGrotesk.ttf")).toString("base64"); } catch (e) {}
  const css = inlineImgs(fs.readFileSync(path.join(__dirname, "css/style.css"), "utf8"), IMG);
  let mainjs = fs.readFileSync(path.join(__dirname, "js/main.js"), "utf8");

  const pages = [], data = {};
  function processPage(id, fullHtml, s) {
    const route = extractAssign(fullHtml, "ROUTE"), dual = extractAssign(fullHtml, "DUAL"),
      day = extractAssign(fullHtml, "DAY"), recmap = extractAssign(fullHtml, "RECMAP"), trainmap = extractAssign(fullHtml, "TRAINMAP");
    let body = stripScripts(bodyInner(fullHtml));
    body = body.replace('<div id="map"></div>', fullRouteSVG());
    if (s && s.transit) body = body.replace('<div class="train-map" id="train-map"></div>', trainMapSVG(transitStations(s.transit)));
    body = body.replace(/<div class="rec-map" id="rec-map"><\/div>/, '<div class="of-mapnote">The pins need a signal — the places are listed just below ↓</div>');
    body = inlineImgs(rewriteLinks(body), IMG);
    pages.push({ id, body });
    const d = {};
    if (route) d.route = route; if (dual) d.dual = dual; if (day) d.day = day; if (recmap) d.recmap = recmap; if (trainmap) d.trainmap = trainmap;
    data[id] = d;
  }
  processPage("home", indexPage(), null);
  stops.forEach((s, i) => processPage(s.id, s.type === "hike" ? hikeDayPage(s, i) : travelDayPage(s, i), s));

  const templates = pages.map((p) => `<script type="text/html" id="ofp-${p.id}">${p.body}</script>`).join("\n");
  const fontFace = fontB64 ? `@font-face{font-family:"Hanken Grotesk";src:url(data:font/ttf;base64,${fontB64}) format("truetype");font-weight:100 900;font-style:normal;font-display:swap}` : "";
  const extraCSS = `#ofapp .map-frame{height:auto!important}.of-routemap{display:block;width:100%;height:auto;background:#e9e4d8}.of-mapnote{padding:26px 18px;color:var(--ink-3);font-size:.9rem;text-align:center;border:1px solid var(--line);border-radius:8px}.leaflet-control-container{display:none}`;
  const router = `
  /* ---- offline single-file SPA router ---- */
  var OFP = window.__OFP__ || { data: {} };
  var ofApp = document.getElementById("ofapp");
  function ofSet(d){ d=d||{}; window.__ROUTE__=d.route||null; window.__DAY__=d.day||null; window.__DUAL__=d.dual||null; window.__RECMAP__=d.recmap||null; window.__TRAINMAP__=d.trainmap||null; }
  function ofGo(){
    var h=(location.hash||"#home").slice(1), tab=null;
    if(h.indexOf("/")>=0){ var p=h.split("/"); h=p[0]; tab=p[1]; }
    var tpl=document.getElementById("ofp-"+h); if(!tpl){ h="home"; tpl=document.getElementById("ofp-home"); }
    ofApp.innerHTML=tpl.innerHTML;
    var di=ofApp.querySelectorAll(".day-intro"); for(var k=0;k<di.length;k++) di[k].remove();
    ofSet(OFP.data[h]);
    initTabs(); layoutSnake(); initLightbox();
    initOverallElev(); initDualChart(); initWxCalendar();
    initDayElev(); initWeather();
    if(tab==="itinerary"){ var b=$('[data-view="itinerary"]'); if(b) b.click(); }
    window.scrollTo(0,0);
  }
  window.addEventListener("hashchange", ofGo);
  var _oft; window.addEventListener("resize", function(){ clearTimeout(_oft); _oft=setTimeout(layoutSnake,160); });
  ofGo();
`;
  mainjs = mainjs.replace(/if \(document\.readyState === "loading"\) document\.addEventListener\("DOMContentLoaded", boot\);\s*else boot\(\);\s*\}\)\(\);/, router + "})();");

  const stamp = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#1c1a17"><title>Alta Via 2 · DC + OM</title>
<style>${fontFace}${css}${extraCSS}</style></head>
<body><div id="ofapp"></div>
${templates}
<script>window.__OFP__ = ${JSON.stringify({ data })};</script>
<script>${mainjs}</script>
</body></html>`;
}

/* ------------------------------------------------------------ write */
if (!fs.existsSync(path.join(OUT, "days"))) fs.mkdirSync(path.join(OUT, "days"));
fs.readdirSync(path.join(OUT, "days")).forEach((f) => { if (f.endsWith(".html")) fs.unlinkSync(path.join(OUT, "days", f)); });
fs.writeFileSync(path.join(OUT, "index.html"), indexPage());
stops.forEach((s, i) => {
  fs.writeFileSync(path.join(OUT, "days", `${s.id}.html`), s.type === "hike" ? hikeDayPage(s, i) : travelDayPage(s, i));
});
fs.writeFileSync(path.join(OUT, "offline.html"), buildOffline());
console.log(`Built index.html + ${stops.length} stop pages (${hikes.length} hike days) + offline.html.`);
