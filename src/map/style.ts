import type { ExpressionSpecification, StyleSpecification } from 'maplibre-gl';

/**
 * A minimal "silhouette" basemap: paper-coloured land, ink-blue water, soft
 * parks and faint streets. No POI labels, so our own landmark icons stand out.
 * Vector tiles: OpenFreeMap (OpenMapTiles schema, no API key needed).
 */
export const PALETTE = {
  land: '#F4EFE6',
  landOutside: '#D8D1C4',
  water: '#8DB8CF',
  waterDeep: '#7AA9C2',
  park: '#D6E4C4',
  wood: '#C9DBB5',
  building: '#E9E2D5',
  buildingOutline: '#DDD4C4',
  road: '#FFFFFF',
  roadMajor: '#FFFDF8',
  rail: '#D3CBBD',
  label: '#8C8273',
  outline: '#3B4A54',
};

export function silhouetteStyle(): StyleSpecification {
  const line: ExpressionSpecification = ['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false];
  const poly: ExpressionSpecification = ['match', ['geometry-type'], ['Polygon', 'MultiPolygon'], true, false];

  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      omt: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
        attribution:
          '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">© OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': PALETTE.land } },
      {
        id: 'landcover-wood',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landcover',
        filter: ['all', poly, ['match', ['get', 'class'], ['wood', 'grass'], true, false]],
        paint: { 'fill-color': PALETTE.wood, 'fill-opacity': 0.55 },
      },
      {
        id: 'park',
        type: 'fill',
        source: 'omt',
        'source-layer': 'park',
        filter: poly,
        paint: { 'fill-color': PALETTE.park, 'fill-opacity': 0.85 },
      },
      {
        id: 'landuse-green',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landuse',
        filter: ['all', poly, ['match', ['get', 'class'], ['cemetery', 'pitch', 'playground', 'garden'], true, false]],
        paint: { 'fill-color': PALETTE.park, 'fill-opacity': 0.7 },
      },
      {
        id: 'water',
        type: 'fill',
        source: 'omt',
        'source-layer': 'water',
        filter: ['all', poly, ['!=', ['get', 'brunnel'], 'tunnel']],
        paint: { 'fill-color': PALETTE.water, 'fill-antialias': true },
      },
      {
        id: 'waterway',
        type: 'line',
        source: 'omt',
        'source-layer': 'waterway',
        filter: line,
        paint: { 'line-color': PALETTE.water, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 17, 3] },
      },
      {
        id: 'building',
        type: 'fill',
        source: 'omt',
        'source-layer': 'building',
        minzoom: 14,
        paint: {
          'fill-color': PALETTE.building,
          'fill-outline-color': PALETTE.buildingOutline,
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 1],
        },
      },
      {
        id: 'pier',
        type: 'fill',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['all', poly, ['==', ['get', 'class'], 'pier']],
        paint: { 'fill-color': PALETTE.land },
      },
      {
        id: 'rail',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 12,
        filter: ['all', line, ['match', ['get', 'class'], ['rail', 'transit'], true, false], ['!=', ['get', 'brunnel'], 'tunnel']],
        paint: { 'line-color': PALETTE.rail, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.6, 17, 1.6] },
      },
      {
        id: 'road-minor',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 13,
        filter: ['all', line, ['match', ['get', 'class'], ['minor', 'service', 'pedestrian', 'path'], true, false], ['!=', ['get', 'brunnel'], 'tunnel']],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': PALETTE.road,
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 0.9],
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 13, 0.6, 18, 9],
        },
      },
      {
        id: 'road-major',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 10,
        filter: ['all', line, ['match', ['get', 'class'], ['primary', 'secondary', 'tertiary', 'trunk', 'motorway'], true, false], ['!=', ['get', 'brunnel'], 'tunnel']],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': PALETTE.roadMajor,
          'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 10, 0.6, 18, 16],
        },
      },
      {
        id: 'bridge',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 12,
        filter: ['all', line, ['==', ['get', 'brunnel'], 'bridge']],
        layout: { 'line-cap': 'butt', 'line-join': 'round' },
        paint: {
          'line-color': PALETTE.road,
          'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 12, 1, 18, 14],
        },
      },
      {
        id: 'district-labels',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        minzoom: 11.5,
        filter: ['match', ['get', 'class'], ['suburb', 'quarter', 'neighbourhood'], true, false],
        layout: {
          'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 16, 12],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.18,
          'text-max-width': 8,
          'text-padding': 8,
        },
        paint: {
          'text-color': PALETTE.label,
          'text-opacity': 0.75,
          'text-halo-color': PALETTE.land,
          'text-halo-width': 1.5,
        },
      },
    ],
  };
}

/** A polygon covering the whole world with the city cut out, used to fade everything outside the city. */
export function worldMaskWithHole(boundary: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>): GeoJSON.Feature<GeoJSON.Polygon> {
  const g = boundary.geometry;
  const outerRings = g.type === 'Polygon' ? [g.coordinates[0]] : g.coordinates.map((p) => p[0]);
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-180, -85],
          [180, -85],
          [180, 85],
          [-180, 85],
          [-180, -85],
        ],
        ...outerRings,
      ],
    },
  };
}
