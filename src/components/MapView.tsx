import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import maplibregl, {
  type ExpressionSpecification,
  type GeoJSONSource,
  type LngLatBoundsLike,
  type Map as MLMap,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { City, Place, Tier } from '../types';
import { CATEGORY_BY_ID, TIER_BY_ID } from '../categories';
import { PALETTE, silhouetteStyle, worldMaskWithHole } from '../map/style';
import { ensureMarkerImages, markerImageId } from '../map/markerImages';
import { circlePolygon } from '../lib/geo';
import type { UserPosition } from '../hooks/useGeolocation';

export interface MapViewHandle {
  flyTo(lng: number, lat: number, zoom?: number): void;
  fitCity(): void;
}

interface Props {
  city: City;
  places: Place[];
  selectedId: string | null;
  onSelect(id: string | null): void;
  userPosition: UserPosition | null;
}

// Markers grow as you zoom in (and shrink as you zoom out) so the map stays readable.
const SCALE_MIN = 0.6;
const SCALE_MAX = 1.3;
const SCALE_SLOPE = 0.16; // per zoom level, 1.0 at zoom 14
const Z_MIN = 14 - (1 - SCALE_MIN) / SCALE_SLOPE;
const Z_MAX = 14 + (SCALE_MAX - 1) / SCALE_SLOPE;
const SELECTED_GROWTH = 1.3;

/** zoom → value, piecewise-linear with the same breakpoints as the marker scale. */
function byZoom(f: (scale: number) => number | ExpressionSpecification): ExpressionSpecification {
  return ['interpolate', ['linear'], ['zoom'], 10, f(SCALE_MIN), Z_MIN, f(SCALE_MIN), Z_MAX, f(SCALE_MAX), 20, f(SCALE_MAX)];
}

/** Like byZoom, but the value also depends on the feature's tier (zoom must stay the outermost expression). */
function byZoomTier(f: (scale: number, tier: Tier) => number): ExpressionSpecification {
  const m = (s: number): ExpressionSpecification => ['match', ['get', 'tier'], 1, f(s, 1), 2, f(s, 2), f(s, 3)];
  return byZoom(m);
}

const TEXT_SIZE: Record<Tier, number> = { 1: 13.5, 2: 12.5, 3: 11.5 };
/** Name labels appear from these zoom levels (whole numbers: layout values are evaluated per tile zoom). */
const LABEL_MINZOOM: Record<Tier, number> = { 1: 0, 2: 14, 3: 15 };

const PLACE_LAYERS = ['places-selected', 'places-1', 'places-2', 'places-3'];
type Pad = { top: number; bottom: number; left: number; right: number };

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

function isDesktop() {
  return window.matchMedia('(min-width: 768px)').matches;
}

/** Keeps a focused point clear of the floating UI (header on top; sheet below on phones, panel on the left on desktop). */
function focusPadding(): Pad {
  if (isDesktop()) return { top: 90, bottom: 40, left: 440, right: 40 };
  const h = window.innerHeight;
  return { top: 130, bottom: Math.round(h * 0.6), left: 30, right: 30 };
}

/**
 * Camera padding in MapLibre is sticky (it affects every later camera move), so for
 * one-off "centre this point in the free area" moves we convert it to an offset instead.
 */
function paddingToOffset(p: Pad): [number, number] {
  return [(p.left - p.right) / 2, (p.top - p.bottom) / 2];
}

function overviewPadding(): Pad {
  if (isDesktop()) return { top: 90, bottom: 60, left: 450, right: 80 };
  return { top: 130, bottom: 110, left: 24, right: 24 };
}

export const MapView = forwardRef<MapViewHandle, Props>(function MapView({ city, places, selectedId, onSelect, userPosition }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [loaded, setLoaded] = useState(false);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const placesRef = useRef(places);
  placesRef.current = places;
  const firstPlacesSync = useRef(true);

  // ── Create the map once per city ──
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current!,
      style: silhouetteStyle(),
      bounds: city.initialBounds as LngLatBoundsLike,
      fitBoundsOptions: { padding: overviewPadding() },
      maxBounds: city.maxBounds as LngLatBoundsLike,
      minZoom: 11,
      maxZoom: 18.5,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: false,
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    mapRef.current = map;
    firstPlacesSync.current = true;
    // Handy for debugging / automated UI checks: open the app with ?debug.
    if (import.meta.env.DEV || location.search.includes('debug')) (window as unknown as { __map: MLMap }).__map = map;

    // Tap → nearest landmark within a finger-sized box, preferring higher-ranked ones.
    const hit = (pt: maplibregl.Point, pad: number) => {
      const feats = map.queryRenderedFeatures(
        [
          [pt.x - pad, pt.y - pad],
          [pt.x + pad, pt.y + pad],
        ],
        { layers: PLACE_LAYERS.filter((l) => map.getLayer(l)) },
      );
      let best: { id: string; score: number } | null = null;
      for (const f of feats) {
        const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates;
        const sp = map.project([lng, lat]);
        const d = Math.hypot(sp.x - pt.x, sp.y - pt.y);
        const tier = Number(f.properties?.tier ?? 3);
        const score = d + tier * 6 - (f.layer.id === 'places-selected' ? 100 : 0);
        if (!best || score < best.score) best = { id: String(f.properties?.id), score };
      }
      return best?.id ?? null;
    };

    map.on('click', (e) => {
      const id = hit(e.point, isDesktop() ? 6 : 14);
      onSelectRef.current(id);
    });
    map.on('mousemove', (e) => {
      map.getCanvas().style.cursor = hit(e.point, 4) ? 'pointer' : '';
    });

    map.on('load', async () => {
      // Collapse the attribution to its (i) button on small screens.
      containerRef.current?.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');

      // Fade everything outside the city so its silhouette stands out.
      map.addSource('city-mask', { type: 'geojson', data: worldMaskWithHole(city.boundary) });
      map.addSource('city-boundary', { type: 'geojson', data: city.boundary });
      map.addLayer(
        { id: 'city-mask', type: 'fill', source: 'city-mask', paint: { 'fill-color': PALETTE.landOutside, 'fill-opacity': 0.82 } },
        'district-labels',
      );
      map.addLayer(
        {
          id: 'city-outline-glow',
          type: 'line',
          source: 'city-boundary',
          paint: { 'line-color': PALETTE.outline, 'line-opacity': 0.08, 'line-width': 8, 'line-blur': 4 },
        },
        'district-labels',
      );
      map.addLayer(
        {
          id: 'city-outline',
          type: 'line',
          source: 'city-boundary',
          paint: {
            'line-color': PALETTE.outline,
            'line-opacity': 0.45,
            'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1.2, 16, 2.2],
            'line-dasharray': [3, 2],
          },
        },
        'district-labels',
      );

      // GPS accuracy halo.
      map.addSource('user-accuracy', { type: 'geojson', data: EMPTY_FC });
      map.addLayer({
        id: 'user-accuracy',
        type: 'fill',
        source: 'user-accuracy',
        paint: { 'fill-color': '#1A73E8', 'fill-opacity': 0.12, 'fill-outline-color': 'rgba(26,115,232,0.35)' },
      });

      // Landmarks: icon + name in one symbol so names never cover icons or each other.
      map.addSource('places', { type: 'geojson', data: EMPTY_FC });

      const em = (s: number, tier: Tier, growth: number, textSize: number) => (TIER_BY_ID[tier].size * s * growth) / 2 / textSize + 0.25;

      const placeLayer = (id: string, tier: Tier | null) => {
        const t = tier ?? 1;
        const growth = tier ? 1 : SELECTED_GROWTH;
        const name: ExpressionSpecification = ['get', 'name'];
        map.addLayer({
          id,
          type: 'symbol',
          source: 'places',
          filter: tier ? ['all', ['==', ['get', 'tier'], tier], ['!=', ['get', 'id'], '']] : ['==', ['get', 'id'], ''],
          layout: {
            'icon-image': ['get', 'image'],
            'icon-size': byZoom((s) => s * growth),
            'icon-allow-overlap': true,
            'icon-ignore-placement': false,
            'icon-padding': 0,
            'text-field': tier && LABEL_MINZOOM[t] > 0 ? ['step', ['zoom'], '', LABEL_MINZOOM[t], name] : name,
            'text-font': [tier === 3 ? 'Noto Sans Regular' : 'Noto Sans Bold'],
            'text-size': tier ? TEXT_SIZE[t] : ['match', ['get', 'tier'], 1, TEXT_SIZE[1] + 1, 2, TEXT_SIZE[2] + 1, TEXT_SIZE[3] + 1.5],
            'text-max-width': 8,
            'text-optional': true,
            'text-variable-anchor': ['top', 'bottom', 'right', 'left'],
            'text-radial-offset': tier
              ? byZoom((sc) => em(sc, t, 1, TEXT_SIZE[t]))
              : byZoomTier((sc, tt) => em(sc, tt, growth, TEXT_SIZE[tt] + 1)),
            'text-justify': 'auto',
            'text-padding': 2,
            'text-allow-overlap': !tier,
          },
          paint: {
            'text-color': '#1F2A30',
            'text-halo-color': 'rgba(250,247,241,0.96)',
            'text-halo-width': 1.6,
          },
        });
      };
      // Layers higher in the stack are drawn on top and claim label space first,
      // so must-sees win over worth-a-visit, which win over hidden gems.
      placeLayer('places-3', 3);
      placeLayer('places-2', 2);
      placeLayer('places-1', 1);
      map.addLayer(
        {
          id: 'places-selected-halo',
          type: 'circle',
          source: 'places',
          filter: ['==', ['get', 'id'], ''],
          paint: {
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.22,
            'circle-radius': byZoomTier((sc, tt) => (TIER_BY_ID[tt].size * sc * SELECTED_GROWTH) / 2 + 9),
            'circle-stroke-color': ['get', 'color'],
            'circle-stroke-width': 2,
            'circle-stroke-opacity': 0.6,
          },
        },
      );
      placeLayer('places-selected', null);

      await ensureMarkerImages(map, city.places);
      setLoaded(true);
    });

    return () => {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      setLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  // ── Sync landmarks with the filtered list ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    (map.getSource('places') as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: places.map((p) => ({
        type: 'Feature',
        properties: { id: p.id, name: p.name, tier: p.tier, image: markerImageId(p), color: CATEGORY_BY_ID[p.category].color },
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      })),
    });

    // After a filter change, if (almost) none of the results are on screen, zoom to show them.
    if (firstPlacesSync.current) {
      firstPlacesSync.current = false;
      return;
    }
    if (!places.length) return;
    const view = map.getBounds();
    const onScreen = places.filter((p) => view.contains([p.lng, p.lat])).length;
    if (onScreen < Math.min(3, places.length)) {
      const b = new maplibregl.LngLatBounds();
      places.forEach((p) => b.extend([p.lng, p.lat]));
      map.fitBounds(b, { padding: overviewPadding(), maxZoom: 15.5, duration: 700 });
    }
  }, [places, loaded]);

  // ── Highlight + focus the selected place ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const sel = selectedId ?? '';
    for (const t of [1, 2, 3] as Tier[]) {
      map.setFilter(`places-${t}`, ['all', ['==', ['get', 'tier'], t], ['!=', ['get', 'id'], sel]]);
    }
    map.setFilter('places-selected', ['==', ['get', 'id'], sel]);
    map.setFilter('places-selected-halo', ['==', ['get', 'id'], sel]);
    if (!selectedId) return;
    const p = placesRef.current.find((x) => x.id === selectedId);
    if (!p) return;
    map.easeTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 14.5), offset: paddingToOffset(focusPadding()), duration: 650 });
  }, [selectedId, loaded]);

  // ── "You are here" ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const src = map.getSource('user-accuracy') as GeoJSONSource | undefined;
    if (!userPosition) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      src?.setData(EMPTY_FC);
      return;
    }
    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'user-dot';
      el.innerHTML = '<div class="user-dot__heading"></div><div class="user-dot__pulse"></div><div class="user-dot__core"></div>';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Your location');
      userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([userPosition.lng, userPosition.lat])
        .addTo(map);
    }
    userMarkerRef.current.setLngLat([userPosition.lng, userPosition.lat]);
    const el = userMarkerRef.current.getElement();
    el.classList.toggle('has-heading', userPosition.heading != null);
    if (userPosition.heading != null) el.style.setProperty('--heading', `${userPosition.heading}deg`);
    src?.setData({
      type: 'Feature',
      properties: {},
      geometry: circlePolygon(userPosition.lng, userPosition.lat, Math.min(userPosition.accuracy, 2000)),
    });
  }, [userPosition, loaded]);

  useImperativeHandle(
    ref,
    () => ({
      flyTo(lng, lat, zoom = 15) {
        mapRef.current?.flyTo({ center: [lng, lat], zoom, offset: paddingToOffset(overviewPadding()), duration: 900 });
      },
      fitCity() {
        mapRef.current?.fitBounds(city.initialBounds as LngLatBoundsLike, { padding: overviewPadding(), duration: 700 });
      },
    }),
    [city],
  );

  return <div ref={containerRef} className="map" />;
});
