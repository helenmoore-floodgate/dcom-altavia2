/* DCOM · Alta Via 2 — interactions
   Tab toggle · Leaflet route map · interactive elevation · snake-grid red line
   · day-page red-line reveal · lightbox. Reads data injected as window.__ROUTE__
   (index) and window.__DAY__ (day pages). */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from((r || document).querySelectorAll(s));
  const fmt = (n) => Math.round(n).toLocaleString("en-US");

  /* ---------------------------------------------------------------- tabs */
  function initTabs() {
    const tabBtns = $$(".tabs [data-view]");
    if (!tabBtns.length) return;
    const views = $$(".view");
    function show(name) {
      views.forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
      tabBtns.forEach((t) => t.classList.toggle("active", t.dataset.view === name));
      if (name === "route" && window.__map) setTimeout(() => window.__map.invalidateSize(), 60);
      if (name === "itinerary") setTimeout(layoutSnake, 30);
      try { history.replaceState(null, "", "#" + name); } catch (e) {}
    }
    tabBtns.forEach((t) => t.addEventListener("click", (e) => { e.preventDefault(); show(t.dataset.view); }));
    window.__showView = show;
    const h = (location.hash || "").replace("#", "");
    show(h === "itinerary" ? "itinerary" : "route");
  }

  // jump to a stage box in the itinerary view (from map markers / elevation labels)
  function gotoStage(stage) {
    if (window.__showView) window.__showView("itinerary");
    setTimeout(() => {
      const el = document.getElementById("stage-" + stage);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
        el.classList.add("flash");
        setTimeout(() => el.classList.remove("flash"), 1200);
      }
    }, 90);
  }
  window.__gotoStage = gotoStage;

  /* ---------------------------------------------------------------- map */
  function initMap() {
    const el = document.getElementById("map");
    if (!el || typeof L === "undefined" || !window.__ROUTE__) return;
    const R = window.__ROUTE__;
    const map = L.map(el, { scrollWheelZoom: false, zoomControl: true });
    window.__map = map;
    L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      maxZoom: 17, attribution: "© OpenTopoMap (CC-BY-SA) · © OpenStreetMap contributors",
    }).addTo(map);

    // white casing under a red route line
    L.polyline(R.full, { color: "#ffffff", weight: 7, opacity: 0.55 }).addTo(map);
    const line = L.polyline(R.full, { color: "#d63a26", weight: 4, opacity: 0.95 }).addTo(map);
    const bounds = line.getBounds();
    map.fitBounds(bounds, { padding: [30, 30] }); // set a view immediately

    try {
      (R.markers || []).forEach((m) => {
        const icon = L.divIcon({
          className: "hut-divicon", html: '<div class="hut-marker">' + (m.day || "") + "</div>",
          iconSize: [26, 26], iconAnchor: [13, 13],
        });
        const mk = L.marker([m.lat, m.lng], { icon }).addTo(map);
        const link = m.href ? '<a class="popup-link" href="' + m.href + '">View day →</a>' : "";
        mk.bindPopup(
          '<div class="popup-day">' + (m.kicker || ("Night " + (m.day || ""))) + "</div>" +
          '<div class="popup-name">' + m.name + "</div>" +
          '<div class="popup-elev">' + (m.elev || "") + "</div>" + link
        );
      });
    } catch (e) { if (window.console) console.error("DCOM map markers:", e); }

    // the container is often still unsized at first paint — re-measure and re-fit
    setTimeout(() => { map.invalidateSize(); map.fitBounds(bounds, { padding: [30, 30] }); }, 150);
  }

  /* ---------------------------------------------------------------- rec map (travel pages) */
  function initRecMap() {
    const el = document.getElementById("rec-map");
    if (!el || typeof L === "undefined" || !window.__RECMAP__) return;
    const R = window.__RECMAP__;
    const map = L.map(el, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "© OpenStreetMap · © CARTO",
    }).addTo(map);
    const pts = [];
    (R.pins || []).forEach((p) => {
      const icon = L.divIcon({ className: "", html: '<div class="rec-pin"></div>', iconSize: [22, 22], iconAnchor: [11, 20] });
      const mk = L.marker([p.lat, p.lng], { icon }).addTo(map);
      const link = p.url ? '<a class="popup-link" href="' + p.url + '" target="_blank" rel="noopener">Visit →</a>' : "";
      mk.bindPopup('<div class="popup-name">' + p.name + "</div><div class=\"popup-elev\">" + (p.area || "") + "</div>" + link);
      pts.push([p.lat, p.lng]);
    });
    if (pts.length) map.fitBounds(pts, { padding: [45, 45], maxZoom: 16 });
    else map.setView(R.center, R.zoom);
    setTimeout(() => map.invalidateSize(), 160);
  }

  /* ---- train-journey map (stations + the line they trace) ---- */
  function initTrainMap() {
    const el = document.getElementById("train-map");
    if (!el || typeof L === "undefined" || !window.__TRAINMAP__) return;
    const sts = (window.__TRAINMAP__.stations || []).filter((s) => s.lat != null && s.lng != null);
    if (sts.length < 2) return;
    const map = L.map(el, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap · © CARTO" }).addTo(map);
    const latlngs = sts.map((s) => [s.lat, s.lng]);
    L.polyline(latlngs, { color: "#d63a26", weight: 4, opacity: 0.92 }).addTo(map);
    const cLng = sts.reduce((a, s) => a + s.lng, 0) / sts.length;
    sts.forEach((s, i) => {
      const icon = L.divIcon({ className: "", html: '<div class="train-pin">' + (i + 1) + "</div>", iconSize: [26, 26], iconAnchor: [13, 13] });
      const mk = L.marker([s.lat, s.lng], { icon }).addTo(map);
      mk.bindPopup('<div class="popup-name">' + (i + 1) + ". " + s.name + "</div>");
      const dir = s.lng > cLng ? "left" : "right";
      mk.bindTooltip(s.short, { permanent: true, direction: dir, offset: [dir === "left" ? -15 : 15, 0], className: "train-lbl" });
    });
    map.fitBounds(latlngs, { padding: [55, 65], maxZoom: 10 });
    setTimeout(() => map.invalidateSize(), 160);
  }

  /* ---------------------------------------------------------------- elevation hover */
  // points: [{x,y,d,e}] in svg user units. svg viewBox 0 0 1000 H.
  function attachElevHover(svg, points, opts) {
    opts = opts || {};
    const card = svg.closest(".elev-card") || svg.parentElement;
    const cursor = $(".elev-cursor", svg);
    const dot = $(".elev-dot", svg);
    let tip = card.querySelector(".elev-tip");
    if (!tip) { tip = document.createElement("div"); tip.className = "elev-tip"; card.appendChild(tip); }
    const vbW = 1000;
    function onMove(ev) {
      const rect = svg.getBoundingClientRect();
      const px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
      const ux = (px / rect.width) * vbW;
      // nearest point by x
      let best = points[0], bd = Infinity;
      for (const p of points) { const dd = Math.abs(p.x - ux); if (dd < bd) { bd = dd; best = p; } }
      if (cursor) { cursor.setAttribute("x1", best.x); cursor.setAttribute("x2", best.x); cursor.style.opacity = 1; }
      if (dot) { dot.setAttribute("cx", best.x); dot.setAttribute("cy", best.y); dot.style.opacity = 1; }
      const sx = rect.left + (best.x / vbW) * rect.width - card.getBoundingClientRect().left;
      const sy = (best.y / (opts.vbH || 300)) * rect.height - card.getBoundingClientRect().top + rect.top - card.getBoundingClientRect().top;
      tip.style.left = sx + "px";
      tip.style.top = ((best.y / (opts.vbH || 300)) * rect.height + (rect.top - card.getBoundingClientRect().top)) + "px";
      tip.innerHTML = "<b>" + fmt(best.e) + " m</b>&nbsp; " + best.d.toFixed(1) + " km";
      tip.style.opacity = 1;
    }
    function onLeave() {
      if (cursor) cursor.style.opacity = 0;
      if (dot) dot.style.opacity = 0;
      tip.style.opacity = 0;
    }
    svg.addEventListener("mousemove", onMove);
    svg.addEventListener("touchmove", onMove, { passive: true });
    svg.addEventListener("mouseleave", onLeave);
    svg.addEventListener("touchend", onLeave);
  }

  function initOverallElev() {
    const svg = $("#overall-elev");
    if (!svg || !window.__ROUTE__ || !window.__ROUTE__.profile) return;
    attachElevHover(svg, window.__ROUTE__.profile.points, { vbH: window.__ROUTE__.profile.vbH || 320 });
    // hut labels -> jump to stage
    $$(".elev-hut-label", svg).forEach((lab) => {
      lab.addEventListener("click", () => { if (lab.dataset.stage) gotoStage(lab.dataset.stage); });
    });
  }

  function initDayElev() {
    const svg = $("#day-elev-svg");
    if (!svg || !window.__DAY__ || !window.__DAY__.elev) return;
    attachElevHover(svg, window.__DAY__.elev.points, { vbH: window.__DAY__.elev.vbH || 300 });
  }

  /* ---- interactive distance + climb chart (hover any day) ---- */
  function initDualChart() {
    const svg = $(".dual-svg");
    if (!svg || !window.__DUAL__) return;
    const D = window.__DUAL__, card = svg.closest(".dualchart");
    const cursor = $(".dl-cursor", svg), dk = $(".dl-dot-km", svg), dm = $(".dl-dot-m", svg);
    let tip = card.querySelector(".dual-tip");
    if (!tip) { tip = document.createElement("div"); tip.className = "dual-tip"; card.appendChild(tip); }
    function move(ev) {
      const rect = svg.getBoundingClientRect();
      const px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
      const ux = (px / rect.width) * D.vbW;
      let best = D.days[0], bd = Infinity;
      for (const p of D.days) { const dd = Math.abs(p.x - ux); if (dd < bd) { bd = dd; best = p; } }
      if (cursor) { cursor.setAttribute("x1", best.x); cursor.setAttribute("x2", best.x); cursor.style.opacity = 1; }
      if (dk) { dk.setAttribute("cx", best.x); dk.setAttribute("cy", best.kmY); dk.style.opacity = 1; }
      if (dm) { dm.setAttribute("cx", best.x); dm.setAttribute("cy", best.mY); dm.style.opacity = 1; }
      const cr = card.getBoundingClientRect();
      tip.style.left = (rect.left - cr.left + (best.x / D.vbW) * rect.width) + "px";
      tip.style.top = (rect.top - cr.top + 4) + "px";
      tip.innerHTML = "<span class='dt-day'>Day " + best.day + "</span><span class='dt-km'>" + best.km + " km</span><span class='dt-m'>+" + fmt(best.m) + " m climb</span>";
      tip.style.opacity = 1;
    }
    function leave() { if (cursor) cursor.style.opacity = 0; if (dk) dk.style.opacity = 0; if (dm) dm.style.opacity = 0; tip.style.opacity = 0; }
    svg.addEventListener("mousemove", move);
    svg.addEventListener("touchmove", move, { passive: true });
    svg.addEventListener("mouseleave", leave);
    svg.addEventListener("touchend", leave);
  }

  /* ===== weather engine — Open-Meteo (best-match Alpine model), shared by day cards, the calendar + the modal ===== */
  const WX_CACHE = {};
  function wxURL(lat, lng, date) {
    return "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lng +
      "&start_date=" + date + "&end_date=" + date + "&timezone=auto" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max" +
      "&hourly=temperature_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m,freezing_level_height";
  }
  function wxFetch(lat, lng, date) {
    const k = lat + "," + lng + "," + date;
    if (!WX_CACHE[k]) WX_CACHE[k] = fetch(wxURL(lat, lng, date)).then((r) => r.json());
    return WX_CACHE[k];
  }
  function wmo(c) {
    const m = { 0: ["Clear sky", "sun"], 1: ["Mostly clear", "sun"], 2: ["Partly cloudy", "pcloud"], 3: ["Overcast", "cloud"], 45: ["Fog", "fog"], 48: ["Rime fog", "fog"], 51: ["Light drizzle", "rain"], 53: ["Drizzle", "rain"], 55: ["Heavy drizzle", "rain"], 56: ["Freezing drizzle", "rain"], 57: ["Freezing drizzle", "rain"], 61: ["Light rain", "rain"], 63: ["Rain", "rain"], 65: ["Heavy rain", "rain"], 66: ["Freezing rain", "rain"], 67: ["Freezing rain", "rain"], 71: ["Light snow", "snow"], 73: ["Snow", "snow"], 75: ["Heavy snow", "snow"], 77: ["Snow grains", "snow"], 80: ["Rain showers", "rain"], 81: ["Rain showers", "rain"], 82: ["Violent showers", "storm"], 85: ["Snow showers", "snow"], 86: ["Snow showers", "snow"], 95: ["Thunderstorm", "storm"], 96: ["Storm + hail", "storm"], 99: ["Severe storm", "storm"] };
    return m[c] || ["—", "cloud"];
  }
  const wxEsc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad2 = (n) => (n < 10 ? "0" + n : "" + n);
  function meteoblueURL(lat, lng) {
    const la = Math.abs(+lat).toFixed(3) + (+lat >= 0 ? "N" : "S");
    const lo = Math.abs(+lng).toFixed(3) + (+lng >= 0 ? "E" : "W");
    return "https://www.meteoblue.com/en/weather/week/" + la + lo;
  }
  function wxIcon(code, cls) {
    const t = wmo(code)[1];
    const cloud = (f) => '<path d="M6.5 17h10.2a3.2 3.2 0 0 0 .4-6.38 4.7 4.7 0 0 0-9-1.27A3.5 3.5 0 0 0 6.5 17z" fill="' + f + '"/>';
    const sun = (cx, cy, r, ray) => {
      let s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#f3a712"/>';
      if (ray) for (const a of [0, 45, 90, 135, 180, 225, 270, 315]) {
        const d = a * Math.PI / 180;
        s += '<line x1="' + (cx + Math.cos(d) * (r + 1.5)).toFixed(1) + '" y1="' + (cy + Math.sin(d) * (r + 1.5)).toFixed(1) + '" x2="' + (cx + Math.cos(d) * (r + 3.2)).toFixed(1) + '" y2="' + (cy + Math.sin(d) * (r + 3.2)).toFixed(1) + '" stroke="#f3a712" stroke-width="1.5" stroke-linecap="round"/>';
      }
      return s;
    };
    let inner;
    if (t === "sun") inner = sun(12, 11, 4.4, true);
    else if (t === "pcloud") inner = sun(8.5, 8.5, 3.1, true) + cloud("#b4b9be");
    else if (t === "cloud") inner = cloud("#aeb3b8");
    else if (t === "fog") inner = cloud("#b4b9be") + '<line x1="6" y1="20" x2="16" y2="20" stroke="#aeb3b8" stroke-width="1.4" stroke-linecap="round"/><line x1="8.5" y1="22.4" x2="18" y2="22.4" stroke="#c4c9ce" stroke-width="1.4" stroke-linecap="round"/>';
    else if (t === "rain") inner = cloud("#9aa0a6") + '<line x1="9" y1="19" x2="8" y2="22" stroke="#3f7fae" stroke-width="1.7" stroke-linecap="round"/><line x1="12.5" y1="19" x2="11.5" y2="22.6" stroke="#3f7fae" stroke-width="1.7" stroke-linecap="round"/><line x1="16" y1="19" x2="15" y2="22" stroke="#3f7fae" stroke-width="1.7" stroke-linecap="round"/>';
    else if (t === "snow") inner = cloud("#9aa0a6") + '<circle cx="9" cy="20.6" r="1.1" fill="#8fc0e6"/><circle cx="12.5" cy="21.6" r="1.1" fill="#8fc0e6"/><circle cx="16" cy="20.6" r="1.1" fill="#8fc0e6"/>';
    else if (t === "storm") inner = cloud("#8a9097") + '<path d="M12.6 18l-2.6 4.2h2l-1 3.3 3.4-4.6h-2.1z" fill="#f3a712"/>';
    else inner = cloud("#aeb3b8");
    return '<svg class="wxi ' + (cls || "") + '" viewBox="0 0 24 27" fill="none" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }
  function wxDayIdx(h, date, lo, hi) {
    const idx = []; if (!h || !h.time) return idx;
    for (let i = 0; i < h.time.length; i++) { if (h.time[i].slice(0, 10) === date) { const hr = +h.time[i].slice(11, 13); if (hr >= lo && hr <= hi) idx.push(i); } }
    return idx;
  }
  function wxBad(data, date) {
    const h = data.hourly, idx = wxDayIdx(h, date, 6, 20);
    if (!idx.length) return null;
    const seq = idx.map((i) => { const p = h.precipitation_probability ? h.precipitation_probability[i] : 0; const mm = h.precipitation ? h.precipitation[i] : 0; const c = h.weather_code ? h.weather_code[i] : 0; return { hr: +h.time[i].slice(11, 13), bad: (p >= 50 || mm >= 0.4 || c >= 95), storm: c >= 95 }; });
    if (!seq.some((s) => s.bad)) return { ok: true, text: "Looks dry right through the walking day — a good window." };
    const wins = []; let cur = null;
    for (const s of seq) { if (s.bad) { if (!cur) cur = { s: s.hr, e: s.hr, storm: s.storm }; else { cur.e = s.hr; cur.storm = cur.storm || s.storm; } } else if (cur) { wins.push(cur); cur = null; } }
    if (cur) wins.push(cur);
    const fmtW = (w) => w.s === w.e ? (pad2(w.s) + ":00") : (pad2(w.s) + "–" + pad2(w.e + 1) + ":00");
    const storm = wins.some((w) => w.storm);
    return { ok: false, storm: storm, text: (storm ? "Storms most likely " : "Wettest ") + wins.map(fmtW).join(" & ") + " — drier outside those hours." };
  }
  function wxMeanFL(data, date) {
    const h = data.hourly, idx = wxDayIdx(h, date, 6, 20);
    if (!idx.length || !h.freezing_level_height) return null;
    let s = 0, n = 0; for (const i of idx) { if (h.freezing_level_height[i] != null) { s += h.freezing_level_height[i]; n++; } }
    return n ? s / n : null;
  }
  function wxHourlyGraph(data, date) {
    const h = data.hourly, idx = wxDayIdx(h, date, 5, 21);
    if (!idx.length) return "";
    const W = 340, H = 122, padL = 4, padR = 4, padT = 12, padB = 20, n = idx.length;
    const bw = (W - padL - padR) / n;
    const temps = idx.map((i) => h.temperature_2m[i]);
    const probs = idx.map((i) => h.precipitation_probability ? h.precipitation_probability[i] : 0);
    const tmin = Math.min.apply(null, temps), tmax = Math.max.apply(null, temps), tR = Math.max(1, tmax - tmin);
    const yT = (t) => padT + (1 - (t - tmin) / tR) * (H - padT - padB);
    let bars = "", labels = "";
    idx.forEach((i, k) => {
      const p = probs[k], x = padL + k * bw, col = p >= 60 ? "#d63a26" : p >= 30 ? "#e0922f" : "#c7d2c9";
      const bh = (p / 100) * (H - padT - padB);
      bars += '<rect x="' + (x + 0.8).toFixed(1) + '" y="' + (H - padB - bh).toFixed(1) + '" width="' + (bw - 1.6).toFixed(1) + '" height="' + Math.max(0, bh).toFixed(1) + '" rx="1" fill="' + col + '"/>';
      const hr = +h.time[i].slice(11, 13);
      if (hr % 3 === 0) labels += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" class="wxg-ax">' + hr + '</text>';
    });
    const line = '<polyline fill="none" stroke="#1c1a17" stroke-width="1.6" points="' + idx.map((i, k) => (padL + k * bw + bw / 2).toFixed(1) + "," + yT(temps[k]).toFixed(1)).join(" ") + '"/>';
    const tHi = '<text x="' + (padL + bw / 2).toFixed(1) + '" y="' + (yT(temps[0]) - 4).toFixed(1) + '" class="wxg-t">' + Math.round(temps[0]) + '°</text>';
    const li = temps.length - 1;
    const tLo = '<text x="' + (padL + li * bw + bw / 2).toFixed(1) + '" y="' + (yT(temps[li]) - 4).toFixed(1) + '" text-anchor="end" class="wxg-t">' + Math.round(temps[li]) + '°</text>';
    return '<svg class="wxg" viewBox="0 0 ' + W + ' ' + H + '">' + bars + line + tHi + tLo + labels + '</svg>';
  }
  function fmtLongDate(date) {
    return new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }
  function wxMetric(label, val) { return '<div class="wxm-cell"><b>' + val + '</b><span>' + label + '</span></div>'; }

  /* ---- blurred weather modal (same in-page treatment as the photo lightbox) ---- */
  function ensureWxModal() {
    let m = document.getElementById("wx-modal");
    if (m) return m;
    m = document.createElement("div");
    m.id = "wx-modal"; m.className = "wx-modal";
    m.innerHTML = '<div class="wxm-card"><button class="wxm-x" aria-label="Close">×</button><div class="wxm-body"></div></div>';
    document.body.appendChild(m);
    const close = () => m.classList.remove("open");
    m.addEventListener("click", (e) => { if (e.target === m) close(); });
    m.querySelector(".wxm-x").addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    return m;
  }
  function openWxModal(cell) {
    const m = ensureWxModal(), body = m.querySelector(".wxm-body");
    const lat = cell.dataset.lat, lng = cell.dataset.lng, date = cell.dataset.date, name = cell.dataset.name, day = cell.dataset.day;
    body.innerHTML = '<div class="wxm-loading">Loading the latest forecast…</div>';
    m.classList.add("open");
    wxFetch(lat, lng, date).then((data) => {
      const d = data.daily;
      if (!d || !d.time || !d.time.length) { body.innerHTML = '<div class="wxm-loading">This day isn’t within forecast range yet — the high-resolution alpine models only reach about 16 days out. It will fill in automatically as the date gets closer.</div>'; return; }
      const w = wmo(d.weather_code[0]), bad = wxBad(data, date), fl = wxMeanFL(data, date);
      const sun = (d.sunrise && d.sunrise[0]) ? d.sunrise[0].slice(11, 16) : null, set = (d.sunset && d.sunset[0]) ? d.sunset[0].slice(11, 16) : null;
      body.innerHTML =
        '<div class="wxm-head"><div class="wxm-h-l"><span class="wxm-day">Day ' + wxEsc(day) + '</span><h3>' + wxEsc(name) + '</h3><span class="wxm-date">' + fmtLongDate(date) + '</span></div>' + wxIcon(d.weather_code[0], "wxm-icon") + '</div>' +
        '<div class="wxm-now"><span class="wxm-temp"><b>' + Math.round(d.temperature_2m_max[0]) + '°</b> / ' + Math.round(d.temperature_2m_min[0]) + '°C</span><span class="wxm-cond">' + w[0] + '</span></div>' +
        (bad ? '<div class="wxm-verdict ' + (bad.ok ? "good" : (bad.storm ? "storm" : "wet")) + '">' + wxEsc(bad.text) + '</div>' : "") +
        '<div class="wxg-title">Hour by hour — bars are the chance of rain, the line is temperature</div>' + wxHourlyGraph(data, date) +
        '<div class="wxm-grid">' +
          wxMetric("Rain chance", (d.precipitation_probability_max ? d.precipitation_probability_max[0] : "—") + "%") +
          wxMetric("Rain total", (d.precipitation_sum ? d.precipitation_sum[0] : 0) + " mm") +
          wxMetric("Max wind", Math.round(d.wind_speed_10m_max[0]) + " km/h") +
          (fl != null ? wxMetric("Freezing level", Math.round(fl) + " m") : "") +
          (d.uv_index_max ? wxMetric("UV index", Math.round(d.uv_index_max[0])) : "") +
          ((sun && set) ? wxMetric("Daylight", sun + "–" + set) : "") +
        '</div>' +
        '<div class="wxm-foot"><a class="wxm-src" href="' + meteoblueURL(lat, lng) + '" target="_blank" rel="noopener">Full meteogram on meteoblue →</a><span class="wxm-attr">Live data: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> · best-match Alpine model</span></div>';
    }).catch(() => { body.innerHTML = '<div class="wxm-loading">Couldn’t reach the forecast right now — try again in a moment.</div>'; });
  }
  function initWxCalendar() {
    const cells = $$(".wxc-cell");
    if (!cells.length) return;
    cells.forEach((cell) => {
      const lat = cell.dataset.lat, lng = cell.dataset.lng, date = cell.dataset.date;
      const ic = $(".wxc-icon", cell), tp = $(".wxc-temp", cell);
      wxFetch(lat, lng, date).then((data) => {
        const d = data.daily;
        if (!d || !d.time || !d.time.length) { cell.classList.add("soon"); tp.textContent = "soon"; ic.innerHTML = wxIcon(3, "wxc-svg"); return; }
        ic.innerHTML = wxIcon(d.weather_code[0], "wxc-svg");
        tp.innerHTML = "<b>" + Math.round(d.temperature_2m_max[0]) + "°</b> " + Math.round(d.temperature_2m_min[0]) + "°";
        const bad = wxBad(data, date); if (bad && !bad.ok) cell.classList.add(bad.storm ? "isstorm" : "iswet");
      }).catch(() => { tp.textContent = "—"; });
      cell.addEventListener("click", () => openWxModal(cell));
    });
  }
  function initWeather() {
    const el = $(".weather");
    if (!el) return;
    const body = $(".wx-body", el), lat = el.dataset.lat, lng = el.dataset.lng, date = el.dataset.date;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = Math.round((new Date(date + "T12:00:00") - today) / 86400000);
    if (days > 15) { body.innerHTML = "<span class='wx-soon'>The mountain forecast lands here about two weeks out — check back closer to the day. It then refreshes itself every time you open the page.</span>"; return; }
    if (days < -1) { body.innerHTML = "<span class='wx-soon'>This day is behind us now. 🎒</span>"; return; }
    wxFetch(lat, lng, date).then((data) => {
      const d = data.daily; if (!d || !d.time || !d.time.length) throw 0;
      const w = wmo(d.weather_code[0]), bad = wxBad(data, date);
      const pp = d.precipitation_probability_max ? d.precipitation_probability_max[0] : null, psum = d.precipitation_sum ? d.precipitation_sum[0] : 0, wind = Math.round(d.wind_speed_10m_max[0]);
      const meta = []; if (pp != null) meta.push("☔ " + pp + "% chance"); if (psum > 0) meta.push(psum + " mm rain"); meta.push("💨 " + wind + " km/h");
      body.innerHTML =
        '<div class="wx-main">' + wxIcon(d.weather_code[0], "wx-cardicon") + '<span class="wx-temp"><b>' + Math.round(d.temperature_2m_max[0]) + '°</b> / ' + Math.round(d.temperature_2m_min[0]) + '°C</span><span class="wx-desc">' + w[0] + '</span></div>' +
        (bad ? '<div class="wx-verdict ' + (bad.ok ? "good" : (bad.storm ? "storm" : "wet")) + '">' + wxEsc(bad.text) + '</div>' : "") +
        '<div class="wxg-title">Hour by hour — bars are the chance of rain, the line is temperature</div>' + wxHourlyGraph(data, date) +
        '<div class="wx-meta">' + meta.join(" &nbsp;·&nbsp; ") + '</div>' +
        '<div class="wx-src"><a href="' + meteoblueURL(lat, lng) + '" target="_blank" rel="noopener">Full meteogram on meteoblue →</a> &nbsp;·&nbsp; data: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>, refreshes every visit</div>';
    }).catch(() => { body.innerHTML = "<span class='wx-soon'>Couldn't reach the forecast right now — try again in a bit.</span>"; });
  }

  /* ---------------------------------------------------------------- snake red line */
  function layoutSnake() {
    const grid = $(".snake-grid");
    const svg = $(".snake-line");
    if (!grid || !svg) return;
    const boxes = $$(".daybox", grid);
    if (!boxes.length) return;
    // current column count
    const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
    // assign serpentine grid positions (DOM order preserved = trek order)
    boxes.forEach((b, i) => {
      const row = Math.floor(i / cols);
      const colInRow = i % cols;
      const col = row % 2 === 0 ? colInRow : (cols - 1 - colInRow);
      b.style.gridRow = row + 1;
      b.style.gridColumn = col + 1;
    });
    // draw line through centers in DOM order
    requestAnimationFrame(() => {
      const gb = grid.getBoundingClientRect();
      svg.setAttribute("viewBox", "0 0 " + gb.width + " " + gb.height);
      svg.setAttribute("preserveAspectRatio", "none");
      let d = "";
      boxes.forEach((b, i) => {
        const r = b.getBoundingClientRect();
        const cx = r.left - gb.left + r.width / 2;
        const cy = r.top - gb.top + r.height / 2;
        d += (i === 0 ? "M" : "L") + cx.toFixed(1) + " " + cy.toFixed(1) + " ";
      });
      let p = svg.querySelector("path");
      if (!p) { p = document.createElementNS("http://www.w3.org/2000/svg", "path"); svg.appendChild(p); }
      p.setAttribute("d", d.trim());
      if (cols < 2) svg.style.display = "none"; else svg.style.display = "";
    });
  }

  /* ---------------------------------------------------------------- lightbox */
  function initLightbox() {
    const figs = $$(".gallery figure");
    if (!figs.length) return;
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = '<img alt=""><p></p>';
    document.body.appendChild(lb);
    const img = $("img", lb), cap = $("p", lb);
    figs.forEach((f) => f.addEventListener("click", () => {
      const i = $("img", f); if (!i) return;
      img.src = i.src; cap.textContent = (f.querySelector("figcaption") || {}).textContent || "";
      lb.classList.add("open");
    }));
    lb.addEventListener("click", () => lb.classList.remove("open"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("open"); });
  }

  /* ---------------------------------------------------------------- day intro reveal */
  var INTRO_SPEED = 1; // 1 = final pace; bump up only to inspect the animation
  function initDayIntro() {
    const intro = $(".day-intro");
    if (!intro) return;
    const photo = $(".intro-photo", intro);
    const shade = $(".intro-shade", intro);
    const line = $(".intro-line", intro);
    document.body.style.overflow = "hidden";
    // show the hike photo immediately (it matches the hero beneath → seamless reveal)
    if (photo) photo.style.opacity = "1";
    if (shade) shade.style.opacity = "1";

    const BEAT = 320 * INTRO_SPEED, DRAW = 1600 * INTRO_SPEED, HOLD = 650 * INTRO_SPEED, FADE = 700 * INTRO_SPEED;
    function finish(fast) {
      intro.style.transition = "opacity " + (fast ? 0.35 : 0.8) + "s ease";
      intro.style.opacity = "0";
      intro.classList.add("done");
      document.body.style.overflow = "";
      setTimeout(() => intro.remove(), fast ? 380 : 820);
    }
    if (line && line.getTotalLength) {
      const len = line.getTotalLength() || 2000;
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      requestAnimationFrame(() => {
        setTimeout(() => {
          line.style.transition = "stroke-dashoffset " + (DRAW / 1000) + "s cubic-bezier(.55,.08,.2,1)";
          line.style.strokeDashoffset = "0";
        }, BEAT);
        setTimeout(() => { line.style.transition = "opacity " + (FADE / 1000) + "s ease"; line.style.opacity = "0.12"; }, BEAT + DRAW + HOLD);
      });
      setTimeout(() => finish(false), BEAT + DRAW + HOLD + FADE);
    } else {
      setTimeout(() => finish(false), 900);
    }
    intro.addEventListener("click", () => finish(true));
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    initTabs();
    initMap();
    initRecMap();
    initTrainMap();
    initOverallElev();
    layoutSnake();
    initLightbox();
    initDayIntro();
    initDayElev();
    initDualChart();
    initWxCalendar();
    initWeather();
    let t;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(layoutSnake, 120); });
    window.addEventListener("load", () => setTimeout(layoutSnake, 200));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

// click an elevation pin → open + scroll to its highlight
function openHl(day, i) {
  var d = document.getElementById("hl-" + day + "-" + i);
  if (!d) return;
  d.open = true;
  d.scrollIntoView({ behavior: "smooth", block: "center" });
  d.classList.add("hl-flash");
  setTimeout(function () { d.classList.remove("hl-flash"); }, 1300);
}
