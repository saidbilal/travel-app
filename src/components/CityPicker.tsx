import { Check, MapPin } from 'lucide-react';
import type { City } from '../types';

interface Props {
  cities: City[];
  currentId: string;
  onPick(id: string): void;
}

export function CityPicker({ cities, currentId, onPick }: Props) {
  return (
    <div className="citypicker">
      <h2>Choose a city</h2>
      <ul>
        {cities.map((c) => (
          <li key={c.id}>
            <button className={`cityrow ${c.id === currentId ? 'is-on' : ''}`} onClick={() => onPick(c.id)}>
              <MapPin size={20} aria-hidden />
              <span className="cityrow__text">
                <span className="cityrow__name">{c.name}</span>
                <span className="cityrow__meta">
                  {c.country} · {c.places.length} places
                </span>
              </span>
              {c.id === currentId && <Check size={20} aria-hidden />}
            </button>
          </li>
        ))}
      </ul>
      <p className="citypicker__soon">More cities are coming soon.</p>
    </div>
  );
}
