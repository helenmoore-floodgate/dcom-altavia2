// Parse the Wikiloc Alta Via 2 KML and emit track-data.js:
//  - full downsampled track for the Leaflet map
//  - per-night segmentation (snapped to accurate OSM hut coords)
//  - per-day elevation geometry (jagged line path + hover points) from real GPS
//  - overall trip elevation profile with hut tick positions
// Run: node scripts/parse_track.js
const fs = require("fs");
const path = require("path");

const KML = "/Users/helenmoore/Downloads/alta-via-2-gpx.kml";
const OUT = path.join(__dirname, "..", "track-data.js");

// ---- accurate overnight waypoints (OSM), in trek order. stage 0 = start.
const NIGHTS = [
  { key: "bressanone", name: "Bressanone", lat: 46.7158647, lng: 11.6568621, stage: 0 },
  { key: "halsl", name: "Halslhütte", lat: 46.666834, lng: 11.770555, stage: 1 },
  { key: "puez", name: "Rif. Puez", lat: 46.590116, lng: 11.82924, stage: 2 },
  { key: "pisciadu", name: "Rif. Pisciadù", lat: 46.5364745, lng: 11.8219459, stage: 3 },
  { key: "fedaia", name: "Lago Fedaia", lat: 46.4634338, lng: 11.8619958, stage: 4 },
  { key: "sanpellegrino", name: "Passo San Pellegrino", lat: 46.3783576, lng: 11.7917199, stage: 5 },
  { key: "mulaz", name: "Rif. Mulaz", lat: 46.3114333, lng: 11.8382144, stage: 6 },
  { key: "rosetta", name: "Rif. Rosetta", lat: 46.2674223, lng: 11.8390203, stage: 7 },
  { key: "laritonda", name: "La Ritonda", lat: 46.2179527, lng: 11.8769754, stage: 8 },
  { key: "cereda", name: "Passo Cereda", lat: 46.193196, lng: 11.9051686, stage: 9 },
  { key: "boz", name: "Rif. Boz", lat: 46.1465941, lng: 11.9165227, stage: 10 },
  { key: "croceaune", name: "Croce d'Aune", lat: 46.0620322, lng: 11.8295667, stage: 11 },
];
// extra non-overnight via-points to label on the map
const VIA = [
  { key: "genova", name: "Rif. Genova", lat: 46.635329, lng: 11.804627, onStage: 2 },
];

const R = 6371000;
const toRad = (d) => (d * Math.PI) / 180;
function hav(a, b) {
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const kml = fs.readFileSync(KML, "utf8");
const cm = kml.match(/<LineString>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/)[1].trim();
const track = cm.split(/\s+/).filter(Boolean).map((t) => {
  const [lng, lat, ele] = t.split(",").map(Number);
  return { lat, lng, ele };
});

// cumulative distance (m) along the track
const cum = [0];
for (let i = 1; i < track.length; i++) cum[i] = cum[i - 1] + hav(track[i - 1], track[i]);
const totalM = cum[cum.length - 1];

function nearest(lat, lng) {
  let bi = 0, bd = Infinity;
  for (let i = 0; i < track.length; i++) {
    const d = hav({ lat, lng }, track[i]);
    if (d < bd) { bd = d; bi = i; }
  }
  return { idx: bi, dist: bd };
}

// snap each night to nearest track index
const snaps = NIGHTS.map((n) => {
  const s = nearest(n.lat, n.lng);
  return { ...n, idx: s.idx, snapDist: Math.round(s.dist), trackEle: Math.round(track[s.idx].ele), cumKm: +(cum[s.idx] / 1000).toFixed(2) };
});
console.log("NIGHT SNAPS:");
snaps.forEach((s) => console.log(
  "  " + s.key.padEnd(14), "idx", String(s.idx).padStart(4),
  "ele", String(s.trackEle).padStart(5) + "m", "snapDist", String(s.snapDist).padStart(5) + "m",
  "cum", String(s.cumKm).padStart(6) + "km"));
const idxs = snaps.map((s) => s.idx);
console.log("monotonic:", idxs.every((v, i) => i === 0 || v >= idxs[i - 1]));

// ---- geometry helpers ----
const vbW = 1000;
function buildProfile(seg, vbH, padL, padR, padT, padB, maxPts, padFrac) {
  // seg: array of {ele, cum(m)} ; returns {linePath, areaPath, points, lo, hi, km, ticks}
  const startCum = seg[0].cum;
  const km = (seg[seg.length - 1].cum - startCum) / 1000;
  let lo = Infinity, hi = -Infinity;
  for (const p of seg) { lo = Math.min(lo, p.ele); hi = Math.max(hi, p.ele); }
  const pad = Math.max(30, (hi - lo) * (padFrac || 0.12));
  lo = Math.floor((lo - pad) / 50) * 50;
  hi = Math.ceil((hi + pad) / 50) * 50;
  // downsample evenly to maxPts, always keeping endpoints
  const step = Math.max(1, Math.floor(seg.length / maxPts));
  const ds = [];
  for (let i = 0; i < seg.length; i += step) ds.push(seg[i]);
  if (ds[ds.length - 1] !== seg[seg.length - 1]) ds.push(seg[seg.length - 1]);
  const X = (cumM) => padL + ((cumM - startCum) / 1000 / km) * (vbW - padL - padR);
  const Y = (e) => padT + (1 - (e - lo) / (hi - lo)) * (vbH - padT - padB);
  // light 5-point smoothing of the displayed line — tames GPS noise, keeps the shape
  const sm = ds.map((p, i) => {
    let s = 0, c = 0;
    for (let k = -2; k <= 2; k++) { const j = i + k; if (j >= 0 && j < ds.length) { s += ds[j].ele; c++; } }
    return s / c;
  });
  const points = ds.map((p, i) => ({
    x: +X(p.cum).toFixed(1), y: +Y(sm[i]).toFixed(1),
    d: +((p.cum - startCum) / 1000).toFixed(2), e: Math.round(sm[i]),
  }));
  let line = "";
  points.forEach((p, i) => (line += (i === 0 ? "M" : "L") + p.x + "," + p.y + " "));
  const area = line + "L " + X(seg[seg.length - 1].cum) + "," + vbH + " L " + padL + "," + vbH + " Z";
  return { linePath: line.trim(), areaPath: area, points, lo, hi, km: +km.toFixed(1), vbH, padL, padR, padT, padB, X: null };
}

function ascentDescent(seg) {
  // light smoothing then threshold to tame GPS noise
  const e = seg.map((p) => p.ele);
  const sm = e.map((_, i) => {
    let s = 0, c = 0;
    for (let k = -2; k <= 2; k++) { const j = i + k; if (j >= 0 && j < e.length) { s += e[j]; c++; } }
    return s / c;
  });
  let up = 0, down = 0;
  for (let i = 1; i < sm.length; i++) { const d = sm[i] - sm[i - 1]; if (d > 0) up += d; else down += d; }
  return { up: Math.round(up), down: Math.round(-down) };
}

// ---- per-day segments ----
const DAY_META = [
  { from: "Bressanone", to: "Halslhütte" },
  { from: "Halslhütte", to: "Rifugio Puez" },
  { from: "Rifugio Puez", to: "Rifugio Pisciadù" },
  { from: "Rifugio Pisciadù", to: "Lago Fedaia" },
  { from: "Lago Fedaia", to: "Passo San Pellegrino" },
  { from: "Passo San Pellegrino", to: "Rifugio Mulaz" },
  { from: "Rifugio Mulaz", to: "Rifugio Rosetta" },
  { from: "Rifugio Rosetta", to: "La Ritonda" },
  { from: "La Ritonda", to: "Passo Cereda" },
  { from: "Passo Cereda", to: "Rifugio Boz" },
  { from: "Rifugio Boz", to: "Croce d'Aune" },
];

// Day 1 begins where the Plose gondola drops you (~2050 m, Kreuztal): the Bressanone→top
// ascent is ridden, not walked. From there you climb to Rifugio Plose, then descend to
// Halslhütte. Start the Day-1 profile at the first track point reaching ~2050 m.
const ploseStart = track.findIndex((p) => p.ele >= 2045);
console.log("Day1 gondola-top start: idx", ploseStart, "ele", Math.round(track[ploseStart].ele) + "m", "cum", (cum[ploseStart] / 1000).toFixed(2) + "km");

const days = [];
for (let d = 0; d < 11; d++) {
  const a = d === 0 ? ploseStart : snaps[d].idx, b = snaps[d + 1].idx;
  const slice = track.slice(a, b + 1).map((p, i) => ({ ...p, cum: cum[a + i] }));
  // full-bleed: line touches both edges (padL = padR = 0)
  const prof = buildProfile(slice, 300, 0, 0, 16, 12, 160);
  const ad = ascentDescent(slice);
  // downsampled coords for map highlight
  const cstep = Math.max(1, Math.floor(slice.length / 120));
  const coords = [];
  for (let i = 0; i < slice.length; i += cstep) coords.push([+slice[i].lat.toFixed(5), +slice[i].lng.toFixed(5)]);
  days.push({
    day: d + 1, from: DAY_META[d].from, to: DAY_META[d].to,
    stats: {
      dist_km: +((cum[b] - cum[a]) / 1000).toFixed(1),
      ascent_m: ad.up, descent_m: ad.down,
      lo_m: Math.round(Math.min(...slice.map((p) => p.ele))),
      hi_m: Math.round(Math.max(...slice.map((p) => p.ele))),
      start_m: Math.round(slice[0].ele), end_m: Math.round(slice[slice.length - 1].ele),
    },
    coords,
    elev: (() => {
      const hiPt = prof.points.reduce((m, p) => (p.e > m.e ? p : m), prof.points[0]);
      return { vbH: prof.vbH, linePath: prof.linePath, areaPath: prof.areaPath, points: prof.points, lo: prof.lo, hi: prof.hi, km: prof.km, hiX: hiPt.x, hiE: hiPt.e };
    })(),
  });
}

// ---- overall profile ----
const fullSeg = track.map((p, i) => ({ ele: p.ele, cum: cum[i] }));
const overall = buildProfile(fullSeg, 360, 0, 0, 18, 26, 600, 0.04);
// hut tick x positions on the overall profile
overall.huts = snaps.map((s) => {
  const xfrac = (s.cumKm * 1000 - fullSeg[0].cum) / 1000 / overall.km;
  const x = +(overall.padL + xfrac * (vbW - overall.padL - overall.padR)).toFixed(1);
  return { x, label: s.name, stage: s.stage, elev: Math.round(track[s.idx].ele), d: s.cumKm };
});

// ---- full track for map (downsample every 2nd point) ----
const full = [];
for (let i = 0; i < track.length; i += 2) full.push([+track[i].lat.toFixed(5), +track[i].lng.toFixed(5)]);
if (full[full.length - 1][0] !== +track[track.length - 1].lat.toFixed(5)) full.push([+track[track.length - 1].lat.toFixed(5), +track[track.length - 1].lng.toFixed(5)]);

const lats = track.map((p) => p.lat), lngs = track.map((p) => p.lng);
const bounds = [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]];

// markers: nights 1..11 (skip the start node as a hut) + via points
const markers = snaps.filter((s) => s.stage >= 1).map((s) => ({
  key: s.key, name: s.name, stage: s.stage, lat: +s.lat.toFixed(6), lng: +s.lng.toFixed(6),
  elevTrack: s.trackEle,
}));

const out = {
  totalKm: +(totalM / 1000).toFixed(1),
  bounds, full, markers,
  overall: {
    vbH: overall.vbH, linePath: overall.linePath, areaPath: overall.areaPath,
    points: overall.points, huts: overall.huts, lo: overall.lo, hi: overall.hi, km: overall.km,
    padL: overall.padL, padR: overall.padR, padB: overall.padB,
  },
  days,
};

fs.writeFileSync(OUT, "// AUTO-GENERATED by scripts/parse_track.js — do not edit by hand.\nconst trackData = " + JSON.stringify(out) + ";\nif (typeof module !== 'undefined') module.exports = trackData;\n");

console.log("\nPER-DAY (from GPS):");
days.forEach((d) => console.log(
  "  Day " + d.day, (d.from + " → " + d.to).padEnd(36),
  String(d.stats.dist_km).padStart(5) + "km",
  "+" + String(d.stats.ascent_m).padStart(4) + " -" + String(d.stats.descent_m).padStart(4),
  "lo " + d.stats.lo_m + " hi " + d.stats.hi_m));
console.log("\nTotal track:", out.totalKm, "km; wrote", OUT, "(" + Math.round(fs.statSync(OUT).size / 1024) + " KB)");
