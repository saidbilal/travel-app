import type { Tier } from '../types';

/** A dot whose size mirrors the marker size for that tier, tying the filter to what you see on the map. */
export function TierDot({ tier }: { tier: Tier }) {
  return <span className={`tier-dot tier-dot--${tier}`} aria-hidden />;
}

export function Stars({ tier }: { tier: Tier }) {
  const n = 4 - tier;
  return (
    <span className="stars" aria-label={`${n} of 3 stars`}>
      {'★'.repeat(n)}
      <span className="stars__off">{'★'.repeat(3 - n)}</span>
    </span>
  );
}
