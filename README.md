# City Sights

A mobile-first sightseeing map. Pick a city and see its landmarks drawn as icons
on a clean "silhouette" map of the city, sized by how much a first-time visitor
should prioritise them.

Currently includes **Barcelona** (56 places, the default) and **Copenhagen**
(60 places). Switch cities from the city name at the top.

## Features

- **Silhouette map**: paper-coloured land, blue water, soft parks and faint
  streets, with everything outside the city boundary faded out. No clutter from
  shops or other map labels.
- **Icons that show what each place is**: castle, palace, museum, church, tower,
  park, harbour, market, and so on. Colour = category.
- **Three priority rankings**: *Must-see* (gold ring + star), *Worth a visit* and
  *Hidden gems*. Higher-ranked places are drawn larger, and their names win when
  labels compete for space.
- **Rank filter**: All, any single rank, or any combination (chips at the top).
- **Interests filter**: castles & palaces, museums & art, churches, landmarks,
  architecture, parks & water, neighbourhoods, food & markets, fun & family.
- **Place details**: photo (from Wikipedia), description, local tip, typical
  visit time, free/ticketed, and distance + walking time from you.
- **Directions**: one tap opens Google Maps (the app on phones) with directions
  to the place. A second button opens the place's Google Maps page for opening
  hours and reviews.
- **Your location**: live blue dot with accuracy halo (tap the locate button).
- **List view**: every place grouped by rank, sorted by distance from you when
  your location is on.
- Filters are remembered between visits. Works as an "Add to Home Screen" app.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (also reachable from your phone on the same Wi-Fi)
npm run build      # production build in dist/
```

Location needs HTTPS (or localhost), so to test GPS on a phone use the deployed
site rather than the LAN dev URL.

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds and publishes the site on every push to
`main`/`master`. Enable it once in **Settings → Pages → Build and deployment →
Source: GitHub Actions**. The site will be at
`https://<user>.github.io/travel-app/`.

## Adding a city

1. Generate its silhouette from the OpenStreetMap boundary:
   `node scripts/build-boundary.mjs "Municipality name" src/cities/<id>/boundary.json`
2. Create `src/cities/<id>/index.ts` with the city's bounds and places
   (see `src/cities/copenhagen/index.ts`).
3. Add it to `CITIES` in `src/cities/index.ts`. The first entry is the city
   shown on a first visit; after that the app remembers the last city chosen.

## Data & credits

- Map tiles: [OpenFreeMap](https://openfreemap.org), © OpenMapTiles, data ©
  OpenStreetMap contributors.
- City boundary: OpenStreetMap (ODbL).
- Photos: Wikipedia / Wikimedia Commons, loaded on demand.
- Place coordinates were checked against OpenStreetMap. Opening hours and prices
  change, so the app links to Google Maps for current details.
