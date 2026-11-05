import type { City } from '../types';
import { copenhagen } from './copenhagen';

/** Add a new city by creating src/cities/<id>/index.ts and listing it here. */
export const CITIES: City[] = [copenhagen];

export const CITY_BY_ID = Object.fromEntries(CITIES.map((c) => [c.id, c])) as Record<string, City>;
