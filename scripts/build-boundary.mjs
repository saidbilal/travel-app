// Builds a smoothed "city silhouette" polygon from OpenStreetMap admin boundaries.
// Usage: node scripts/build-boundary.mjs "Københavns Kommune" src/cities/copenhagen/boundary.json
// The OSM municipality polygon is split along harbour channels, so we apply a
// morphological "close" (buffer out, then back in) to merge it into one silhouette.
import * as turf from '@turf/turf';
import { writeFileSync } from 'node:fs';

const [query, outFile, closeMeters = '450'] = process.argv.slice(2);
if (!query || !outFile) {
  console.error('usage: build-boundary.mjs <nominatim query> <out.json> [closeMeters]');
  process.exit(1);
}

const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&polygon_geojson=1&polygon_threshold=0.0002&limit=1`;
const res = await fetch(url, { headers: { 'User-Agent': 'travel-app boundary build script' } });
const [hit] = await res.json();
if (!hit) throw new Error('No result for ' + query);

// Drop holes (e.g. the Frederiksberg enclave) and keep only the outer rings.
const geom = hit.geojson;
const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
let shape = turf.featureCollection(polys.map((p) => turf.polygon([p[0]])));

const r = Number(closeMeters) / 1000;
let merged = turf.buffer(turf.union(shape), r, { units: 'kilometers', steps: 12 });
merged = turf.buffer(merged, -r, { units: 'kilometers', steps: 12 });
// Re-remove any holes produced by the close step, drop tiny specks (sea forts etc).
const outPolys = (merged.geometry.type === 'Polygon' ? [merged.geometry.coordinates] : merged.geometry.coordinates)
  .map((p) => [p[0]])
  .filter((p) => turf.area(turf.polygon(p)) > 200_000);
let out = turf.multiPolygon(outPolys);
out = turf.simplify(out, { tolerance: 0.00015, highQuality: true });
out = turf.truncate(out, { precision: 5 });
out.properties = { name: hit.display_name, source: 'OpenStreetMap contributors (ODbL)' };
writeFileSync(outFile, JSON.stringify(out));
console.log('polygons:', outPolys.length, 'points:', outPolys.reduce((n, p) => n + p[0].length, 0), 'bbox:', turf.bbox(out).map((v) => v.toFixed(4)).join(','));
