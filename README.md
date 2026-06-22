# Alta Via 2 — DC + OM

A personal trip site for the **Alta Via 2** Dolomites hut-to-hut trek (Bressanone → Feltre,
27 Jun – 9 Jul 2026), made for Helen ("Dragon Child") and her dad Nick ("Old Man").

It's a static site: an interactive Leaflet route map over a recorded GPS track, GPS-accurate
per-day elevation profiles, a snake-grid day-by-day itinerary, animated day-page reveals,
collapsible history sections, full flight/hotel logistics, and local recommendations.

## Host it (GitHub Pages)
1. Create a new GitHub repo (e.g. `alta-via-2`) and push this folder to it.
2. Repo → **Settings → Pages** → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. It goes live at `https://<your-user>.github.io/<repo>/` in a minute or two.

A `.nojekyll` file is included so GitHub serves every file as-is. All asset paths are relative,
so it works from a project sub-path. Maps, fonts and photos load from public CDNs (Leaflet,
Google Fonts, Wikimedia Commons) — no build server needed to host.

## Edit & rebuild
- **Trip content** → `data.js`  ·  **history** → `history.js`
- **Route + elevation** come from a recorded GPS track, parsed by `scripts/parse_track.js` → `track-data.js`
- After any edit, regenerate the HTML:

  ```sh
  node build.js        # Node 16+, zero dependencies → writes index.html + days/*.html
  ```

## Stickers (optional)
Drop three transparent cut-out PNGs into `assets/` and they appear automatically (hidden until present):
- `sticker-vf.png` — the "Old Man" climbing sticker, shown at every via-ferrata section on the elevation
- `sticker-a.png`, `sticker-b.png` — tasteful corner stickers, one per page

## Credits
Photos: [The Hiking Club](https://www.thehiking.club/alta-via-2-dolomites) & [Wikimedia Commons](https://commons.wikimedia.org).
Route & elevation from a recorded Wikiloc GPX (±). Font: Hanken Grotesk (a free stand-in for Graphik).
