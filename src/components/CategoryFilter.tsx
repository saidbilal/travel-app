import { Check } from 'lucide-react';
import type { CategoryId, IconId, TagId } from '../types';
import { CATEGORIES, type TagMeta } from '../categories';
import { PlaceIcon } from '../icons';

interface Props {
  selected: CategoryId[];
  counts: Record<CategoryId, number>;
  onToggle(id: CategoryId): void;
  /** Specific interests available in this city (they overlap the categories) */
  tags: TagMeta[];
  selectedTags: TagId[];
  tagCounts: Record<TagId, number>;
  onToggleTag(id: TagId): void;
  onClear(): void;
  onDone(): void;
  resultCount: number;
}

function Tile(props: { label: string; color: string; icon: IconId; count: number; on: boolean; onClick(): void }) {
  const { label, color, icon, count, on, onClick } = props;
  return (
    <button className={`cattile ${on ? 'is-on' : ''}`} style={{ ['--c' as string]: color }} aria-pressed={on} onClick={onClick}>
      <span className="cattile__icon">
        <PlaceIcon icon={icon} size={20} />
      </span>
      <span className="cattile__label">{label}</span>
      <span className="cattile__count">{count}</span>
      {on && (
        <span className="cattile__check" aria-hidden>
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

export function CategoryFilter(props: Props) {
  const { selected, counts, onToggle, tags, selectedTags, tagCounts, onToggleTag, onClear, onDone, resultCount } = props;
  const n = selected.length + selectedTags.length;
  // Hide categories with nothing in this city (e.g. Shopping in Copenhagen).
  const cats = CATEGORIES.filter((c) => counts[c.id] > 0 || selected.includes(c.id));
  return (
    <div className="catfilter">
      <div className="catfilter__head">
        <h2>What interests you?</h2>
        <button className="link-btn" onClick={onClear} disabled={n === 0}>
          Show all
        </button>
      </div>
      <p className="catfilter__hint">
        {n === 0 ? 'Showing everything. Pick one or more; places matching any of them are shown.' : `${n} selected`}
      </p>
      {tags.length > 0 && (
        <>
          <h3 className="catfilter__section">Specific</h3>
          <div className="catgrid">
            {tags.map((t) => (
              <Tile
                key={t.id}
                label={t.label}
                color={t.color}
                icon={t.icon}
                count={tagCounts[t.id]}
                on={selectedTags.includes(t.id)}
                onClick={() => onToggleTag(t.id)}
              />
            ))}
          </div>
          <h3 className="catfilter__section">Categories</h3>
        </>
      )}
      <div className="catgrid">
        {cats.map((c) => (
          <Tile
            key={c.id}
            label={c.label}
            color={c.color}
            icon={c.icon}
            count={counts[c.id]}
            on={selected.includes(c.id)}
            onClick={() => onToggle(c.id)}
          />
        ))}
      </div>
      <button className="btn btn--primary btn--block" onClick={onDone}>
        Show {resultCount} {resultCount === 1 ? 'place' : 'places'}
      </button>
    </div>
  );
}
