import type { City } from '../types';
import { barcelona } from './barcelona';
import { copenhagen } from './copenhagen';

/**
 * Add a new city by creating src/cities/<id>/index.ts and listing it here.
 * The first city is the one shown on a first visit.
 */
export const CITIES: City[] = [barcelona, copenhagen];

export const CITY_BY_ID = Object.fromEntries(CITIES.map((c) => [c.id, c])) as Record<string, City>;
