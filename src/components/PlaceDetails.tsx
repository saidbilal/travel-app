import { useState } from 'react';
import { BookOpen, Clock, ExternalLink, Footprints, Lightbulb, MapPin, Navigation, Ticket, X } from 'lucide-react';
import type { Cost, Place } from '../types';
import { CATEGORY_BY_ID, TAG_BY_ID, TIER_BY_ID } from '../categories';
import { PlaceIcon } from '../icons';
import { useWikiSummary } from '../hooks/useWikiSummary';
import { directionsUrl, distanceMeters, formatDistance, formatWalk, placeUrl } from '../lib/geo';
import type { UserPosition } from '../hooks/useGeolocation';
import { Stars } from './TierDot';

const COST_LABEL: Record<Cost, string> = {
  free: 'Free',
  paid: 'Ticket needed',
  mixed: 'Free outside, tickets inside',
};

interface Props {
  place: Place;
  cityName: string;
  userPosition: UserPosition | null;
  onClose(): void;
}

export function PlaceDetailsHeader({ place, onClose }: { place: Place; onClose(): void }) {
  const { data, loading } = useWikiSummary(place.wiki);
  // 0: sharp image, 1: original thumbnail, 2: give up and show the icon fallback.
  const [stage, setStage] = useState(0);
  const cat = CATEGORY_BY_ID[place.category];
  const src = stage === 0 ? data?.image : stage === 1 ? data?.imageFallback : undefined;

  return (
    <div className="hero" style={{ ['--c' as string]: cat.color }}>
      <div className="hero__fallback" aria-hidden>
        <PlaceIcon icon={place.icon} size={56} strokeWidth={1.6} />
      </div>
      {src && (
        <img
          key={src}
          className="hero__img"
          src={src}
          alt={place.name}
          onError={() => setStage((n) => n + 1)}
          onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
        />
      )}
      {loading && <div className="hero__shimmer" aria-hidden />}
      <button className="hero__close icon-btn" onClick={onClose} aria-label="Close details">
        <X size={20} />
      </button>
    </div>
  );
}

export function PlaceDetails({ place, cityName, userPosition }: Props) {
  const cat = CATEGORY_BY_ID[place.category];
  const tier = TIER_BY_ID[place.tier];
  const { data } = useWikiSummary(place.wiki);
  const dist = userPosition ? distanceMeters(userPosition, place) : null;
  const walk = dist != null ? formatWalk(dist) : null;

  return (
    <article className="details">
      <div className="details__badges">
        <span className={`tier-badge tier-badge--${place.tier}`}>
          <Stars tier={place.tier} /> {tier.label}
        </span>
        <span className="cat-badge" style={{ ['--c' as string]: cat.color }}>
          <PlaceIcon icon={cat.icon} size={14} />
          {cat.label}
        </span>
        {place.tags?.map((t) => {
          const tag = TAG_BY_ID[t];
          return (
            <span key={t} className="tag-badge" style={{ ['--c' as string]: tag.color }}>
              <PlaceIcon icon={tag.icon} size={13} />
              {tag.label}
            </span>
          );
        })}
      </div>

      <h2 className="details__title">{place.name}</h2>
      {place.localName && place.localName !== place.name && <p className="details__local">{place.localName}</p>}

      <ul className="facts">
        <li>
          <MapPin size={16} aria-hidden />
          {place.area}
        </li>
        {dist != null && (
          <li>
            <Footprints size={16} aria-hidden />
            {formatDistance(dist)}
            {walk ? ` · ${walk}` : ' away'}
          </li>
        )}
        <li>
          <Clock size={16} aria-hidden />
          {place.duration}
        </li>
        <li>
          <Ticket size={16} aria-hidden />
          {COST_LABEL[place.cost]}
        </li>
      </ul>

      <div className="actions">
        <a className="btn btn--primary" href={directionsUrl(place)} target="_blank" rel="noopener noreferrer">
          <Navigation size={18} aria-hidden />
          Directions in Google Maps
        </a>
        <div className="actions__row">
          <a className="btn" href={placeUrl(place, cityName)} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} aria-hidden />
            Hours & reviews
          </a>
          {data?.url && (
            <a className="btn" href={data.url} target="_blank" rel="noopener noreferrer">
              <BookOpen size={16} aria-hidden />
              Wikipedia
            </a>
          )}
        </div>
      </div>

      <p className="details__summary">{place.summary}</p>

      {place.tip && (
        <p className="tip">
          <Lightbulb size={18} aria-hidden />
          <span>{place.tip}</span>
        </p>
      )}
      {data?.image && <p className="credit">Photo via Wikipedia / Wikimedia Commons</p>}
    </article>
  );
}
