import type { CategoryId, IconId, TagId, Tier } from './types';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  color: string;
  icon: IconId;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'royal', label: 'Castles & Palaces', color: '#7B4FA0', icon: 'castle' },
  { id: 'museums', label: 'Museums & Art', color: '#C4513A', icon: 'museum' },
  { id: 'churches', label: 'Churches', color: '#4A6A93', icon: 'church' },
  { id: 'landmarks', label: 'Landmarks', color: '#A8751A', icon: 'statue' },
  { id: 'architecture', label: 'Architecture', color: '#23807E', icon: 'opera' },
  { id: 'nature', label: 'Parks & Water', color: '#3A8550', icon: 'park' },
  { id: 'neighborhoods', label: 'Neighborhoods', color: '#C24A75', icon: 'houses' },
  { id: 'food', label: 'Food & Markets', color: '#D0661F', icon: 'food' },
  { id: 'shopping', label: 'Shopping', color: '#8B5E3C', icon: 'gift' },
  { id: 'fun', label: 'Fun & Family', color: '#2E7DC2', icon: 'ferris' },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  CategoryMeta
>;

export interface TagMeta {
  id: TagId;
  label: string;
  color: string;
  icon: IconId;
}

/** Specific interests that overlap the categories above. */
export const TAGS: TagMeta[] = [
  { id: 'tapas', label: 'Tapas', color: '#B8432F', icon: 'wine' },
  { id: 'souvenirs', label: 'Souvenir shops', color: '#8B5E3C', icon: 'gift' },
];

export const TAG_BY_ID = Object.fromEntries(TAGS.map((t) => [t.id, t])) as Record<TagId, TagMeta>;

export interface TierMeta {
  tier: Tier;
  label: string;
  short: string;
  description: string;
  /** Marker diameter in CSS px at zoom 14 (scaled with zoom on the map) */
  size: number;
}

export const TIERS: TierMeta[] = [
  { tier: 1, label: 'Must-see', short: 'Must-see', description: 'The icons. Go here first.', size: 42 },
  { tier: 2, label: 'Worth a visit', short: 'Worth it', description: 'Great if you have a day or two.', size: 31 },
  { tier: 3, label: 'Hidden gems', short: 'Gems', description: 'For longer stays and special interests.', size: 23 },
];

export const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.tier, t])) as Record<Tier, TierMeta>;
