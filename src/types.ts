import type { MultiPolygon, Polygon, Feature } from 'geojson';

/** 1 = must-see, 2 = worth a visit, 3 = hidden gem / if you have time */
export type Tier = 1 | 2 | 3;

export type CategoryId =
  | 'royal'
  | 'museums'
  | 'churches'
  | 'landmarks'
  | 'architecture'
  | 'nature'
  | 'neighborhoods'
  | 'food'
  | 'fun';

export type IconId =
  | 'castle'
  | 'palace'
  | 'fortress'
  | 'museum'
  | 'art'
  | 'church'
  | 'dome'
  | 'cathedral'
  | 'tower'
  | 'statue'
  | 'mermaid'
  | 'fountain'
  | 'harbour'
  | 'street'
  | 'houses'
  | 'canal'
  | 'opera'
  | 'theatre'
  | 'library'
  | 'townhall'
  | 'market'
  | 'food'
  | 'garden'
  | 'park'
  | 'cemetery'
  | 'zoo'
  | 'aquarium'
  | 'beach'
  | 'swim'
  | 'lake'
  | 'bridge'
  | 'ski'
  | 'planet'
  | 'ferris'
  | 'gate'
  | 'science'
  | 'urban'
  | 'basilica'
  | 'gaudi'
  | 'stadium'
  | 'viewpoint'
  | 'music'
  | 'cablecar'
  | 'skyscraper'
  | 'modern';

export type Cost = 'free' | 'paid' | 'mixed';

export interface Place {
  id: string;
  name: string;
  /** Name in the local language, if different */
  localName?: string;
  tier: Tier;
  category: CategoryId;
  icon: IconId;
  lat: number;
  lng: number;
  /** Neighbourhood / district */
  area: string;
  summary: string;
  tip?: string;
  /** Typical time to spend, human readable */
  duration: string;
  cost: Cost;
  /** English Wikipedia article title, used to fetch a photo */
  wiki?: string;
}

export interface City {
  id: string;
  name: string;
  localName?: string;
  country: string;
  /** [lng, lat] */
  center: [number, number];
  /** The area shown on first load: [west, south, east, north] */
  initialBounds: [number, number, number, number];
  /** How far the user may pan: [west, south, east, north] */
  maxBounds: [number, number, number, number];
  /** The city silhouette */
  boundary: Feature<MultiPolygon | Polygon>;
  places: Place[];
}
