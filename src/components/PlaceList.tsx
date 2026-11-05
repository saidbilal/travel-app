import { ChevronRight } from 'lucide-react';
import type { Place, Tier } from '../types';
import { CATEGORY_BY_ID, TIERS } from '../categories';
import { PlaceIcon } from '../icons';
import { distanceMeters, formatDistance } from '../lib/geo';
import type { UserPosition } from '../hooks/useGeolocation';
import { Stars } from './TierDot';

interface Props {
  places: Place[];
  userPosition: UserPosition | null;
  onSelect(id: string): void;
}

export function PlaceList({ places, userPosition, onSelect }: Props) {
  const withDist = places.map((p) => ({ p, d: userPosition ? distanceMeters(userPosition, p) : null }));
  const groups = TIERS.map((t) => ({
    tier: t,
    items: withDist
      .filter((x) => x.p.tier === t.tier)
      .sort((a, b) => (a.d != null && b.d != null ? a.d - b.d : a.p.name.localeCompare(b.p.name))),
  })).filter((g) => g.items.length);

  if (!places.length) {
    return <p className="empty">No places match your filters.</p>;
  }

  return (
    <div className="plist">
      {userPosition && <p className="plist__hint">Sorted by distance from you within each ranking.</p>}
      {groups.map(({ tier, items }) => (
        <section key={tier.tier} className="plist__group">
          <h3 className="plist__heading">
            <Stars tier={tier.tier as Tier} /> {tier.label}
            <span className="plist__sub">{tier.description}</span>
          </h3>
          <ul>
            {items.map(({ p, d }) => {
              const cat = CATEGORY_BY_ID[p.category];
              return (
                <li key={p.id}>
                  <button className="prow" onClick={() => onSelect(p.id)}>
                    <span className={`prow__icon tier-${p.tier}`} style={{ ['--c' as string]: cat.color }}>
                      <PlaceIcon icon={p.icon} size="58%" />
                    </span>
                    <span className="prow__text">
                      <span className="prow__name">{p.name}</span>
                      <span className="prow__meta">
                        {cat.label} · {p.area}
                      </span>
                    </span>
                    {d != null && <span className="prow__dist">{formatDistance(d)}</span>}
                    <ChevronRight size={18} className="prow__chev" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
