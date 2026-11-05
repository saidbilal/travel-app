import { Check } from 'lucide-react';
import type { CategoryId } from '../types';
import { CATEGORIES } from '../categories';
import { PlaceIcon } from '../icons';

interface Props {
  selected: CategoryId[];
  counts: Record<CategoryId, number>;
  onToggle(id: CategoryId): void;
  onClear(): void;
  onDone(): void;
  resultCount: number;
}

export function CategoryFilter({ selected, counts, onToggle, onClear, onDone, resultCount }: Props) {
  const none = selected.length === 0;
  return (
    <div className="catfilter">
      <div className="catfilter__head">
        <h2>What interests you?</h2>
        <button className="link-btn" onClick={onClear} disabled={none}>
          Show all
        </button>
      </div>
      <p className="catfilter__hint">{none ? 'Showing every category. Tap to pick only what you like.' : `${selected.length} selected`}</p>
      <div className="catgrid">
        {CATEGORIES.map((c) => {
          const on = selected.includes(c.id);
          return (
            <button
              key={c.id}
              className={`cattile ${on ? 'is-on' : ''}`}
              style={{ ['--c' as string]: c.color }}
              aria-pressed={on}
              onClick={() => onToggle(c.id)}
            >
              <span className="cattile__icon">
                <PlaceIcon icon={c.icon} size={20} />
              </span>
              <span className="cattile__label">{c.label}</span>
              <span className="cattile__count">{counts[c.id]}</span>
              {on && (
                <span className="cattile__check" aria-hidden>
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button className="btn btn--primary btn--block" onClick={onDone}>
        Show {resultCount} {resultCount === 1 ? 'place' : 'places'}
      </button>
    </div>
  );
}
