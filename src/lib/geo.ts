import type { Place } from '../types';

const R = 6371000;

/** Great-circle distance in metres. */
export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(m: number) {
  if (m < 950) return `${Math.max(10, Math.round(m / 10) * 10)} m`;
  if (m < 9500) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m / 1000).toLocaleString()} km`;
}

/** Rough walking time, ~4.8 km/h plus a bit for street layout. */
export function walkingMinutes(m: number) {
  return Math.max(1, Math.round((m * 1.25) / 80));
}

export function formatWalk(m: number) {
  const min = walkingMinutes(m);
  if (min > 90) return null;
  return `${min} min walk`;
}

/** Opens Google Maps (app on phones, website elsewhere) with directions to the place. */
export function directionsUrl(place: Place) {
  const p = new URLSearchParams({ api: '1', destination: `${place.lat},${place.lng}` });
  return `https://www.google.com/maps/dir/?${p.toString()}`;
}

/** Opens the place's own Google Maps page (opening hours, reviews, photos). */
export function placeUrl(place: Place, cityName: string) {
  const p = new URLSearchParams({ api: '1', query: `${place.name}, ${cityName}` });
  return `https://www.google.com/maps/search/?${p.toString()}`;
}

/** A circle polygon (for the GPS accuracy halo). */
export function circlePolygon(lng: number, lat: number, radiusM: number, steps = 48): GeoJSON.Polygon {
  const coords: [number, number][] = [];
  const dLat = radiusM / 111320;
  const dLng = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    coords.push([lng + dLng * Math.cos(t), lat + dLat * Math.sin(t)]);
  }
  return { type: 'Polygon', coordinates: [coords] };
}
