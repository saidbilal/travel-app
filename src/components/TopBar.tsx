import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { City, Tier } from '../types';
import { TIERS } from '../categories';
import { TierDot } from './TierDot';

interface Props {
  city: City;
  tiers: Tier[];
  tierCounts: Record<Tier, number>;
  onToggleTier(t: Tier): void;
  onAllTiers(): void;
  categoryFilterCount: number;
  onOpenFilters(): void;
  onOpenCities(): void;
}

export function TopBar({ city, tiers, tierCounts, onToggleTier, onAllTiers, categoryFilterCount, onOpenFilters, onOpenCities }: Props) {
  const all = tiers.length === 0;
  return (
    <header className="topbar">
      <div className="topbar__row">
        <button className="city-btn" onClick={onOpenCities} aria-label={`City: ${city.name}. Change city`}>
          <span className="city-btn__name">{city.name}</span>
          <span className="city-btn__country">{city.country}</span>
          <ChevronDown size={18} aria-hidden />
        </button>
        <button
          className={`icon-btn filter-btn ${categoryFilterCount ? 'is-active' : ''}`}
          onClick={onOpenFilters}
          aria-label={`Interests filter${categoryFilterCount ? `, ${categoryFilterCount} selected` : ''}`}
        >
          <SlidersHorizontal size={20} aria-hidden />
          <span className="filter-btn__label">Interests</span>
          {categoryFilterCount > 0 && <span className="badge">{categoryFilterCount}</span>}
        </button>
      </div>
      <div className="chips" role="group" aria-label="Filter by ranking">
        <button className={`chip ${all ? 'is-on' : ''}`} aria-pressed={all} onClick={onAllTiers}>
          All
        </button>
        {TIERS.map((t) => {
          const on = tiers.includes(t.tier);
          return (
            <button
              key={t.tier}
              className={`chip chip--tier chip--t${t.tier} ${on ? 'is-on' : ''}`}
              aria-pressed={on}
              aria-label={`${t.label} (${tierCounts[t.tier]})`}
              onClick={() => onToggleTier(t.tier)}
            >
              <TierDot tier={t.tier} />
              {t.short}
              <span className="chip__count">{tierCounts[t.tier]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
