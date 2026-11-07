import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { List, LocateFixed, Locate, Maximize } from 'lucide-react';
import type { CategoryId, Tier } from './types';
import { CATEGORIES } from './categories';
import { CITIES, CITY_BY_ID } from './cities';
import { MapView, type MapViewHandle } from './components/MapView';
import { TopBar } from './components/TopBar';
import { BottomSheet } from './components/BottomSheet';
import { PlaceDetails, PlaceDetailsHeader } from './components/PlaceDetails';
import { PlaceList } from './components/PlaceList';
import { CategoryFilter } from './components/CategoryFilter';
import { CityPicker } from './components/CityPicker';
import { usePersistentState } from './hooks/usePersistentState';
import { useGeolocation } from './hooks/useGeolocation';
import { distanceMeters, formatDistance } from './lib/geo';

type Sheet = 'none' | 'list' | 'filters' | 'city';

const isTierArray = (v: unknown): v is Tier[] => Array.isArray(v) && v.every((x) => x === 1 || x === 2 || x === 3);
const CAT_IDS = new Set(CATEGORIES.map((c) => c.id));
const isCatArray = (v: unknown): v is CategoryId[] => Array.isArray(v) && v.every((x) => CAT_IDS.has(x));
const isCityId = (v: unknown): v is string => typeof v === 'string' && v in CITY_BY_ID;

/** Device-specific steps for turning location back on, since the browser won't ask again once blocked. */
function locationHelp() {
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (iOS) {
    return 'Location is blocked. On iPhone: Settings › Privacy & Security › Location Services (on) › Safari Websites › While Using the App. Then reload this page and tap the locate button again.';
  }
  if (/Android/.test(ua)) {
    return 'Location is blocked. Tap the icon left of the address bar › Permissions › Location › Allow, and make sure phone Location is on. Then tap the locate button again.';
  }
  return 'Location is blocked. Allow it for this site in your browser’s settings, then tap the locate button again.';
}

export default function App() {
  // Key bumped when the default city changed (Copenhagen → Barcelona) so everyone starts on the new default once.
  const [cityId, setCityId] = usePersistentState('ta.city.v2', CITIES[0].id, isCityId);
  const city = CITY_BY_ID[cityId] ?? CITIES[0];

  useEffect(() => {
    document.title = `City Sights · ${city.name}`;
  }, [city]);

  // Empty selection = show everything.
  const [tiers, setTiers] = usePersistentState<Tier[]>('ta.tiers', [], isTierArray);
  const [cats, setCats] = usePersistentState<CategoryId[]>('ta.categories', [], isCatArray);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>('none');
  const [toast, setToast] = useState<string | null>(null);
  const [seenHint, setSeenHint] = usePersistentState('ta.seenHint', false);

  const mapRef = useRef<MapViewHandle>(null);
  const geo = useGeolocation();
  const wantCenterOnUser = useRef(false);

  // ── Filtering ──
  const byCategory = useMemo(
    () => city.places.filter((p) => cats.length === 0 || cats.includes(p.category)),
    [city, cats],
  );
  const visible = useMemo(
    () => byCategory.filter((p) => tiers.length === 0 || tiers.includes(p.tier)),
    [byCategory, tiers],
  );
  const tierCounts = useMemo(() => {
    const c: Record<Tier, number> = { 1: 0, 2: 0, 3: 0 };
    byCategory.forEach((p) => c[p.tier]++);
    return c;
  }, [byCategory]);
  const catCounts = useMemo(() => {
    const c = Object.fromEntries(CATEGORIES.map((x) => [x.id, 0])) as Record<CategoryId, number>;
    city.places.filter((p) => tiers.length === 0 || tiers.includes(p.tier)).forEach((p) => c[p.category]++);
    return c;
  }, [city, tiers]);

  const selected = selectedId ? city.places.find((p) => p.id === selectedId) ?? null : null;

  // Deselect a place once it's filtered out.
  useEffect(() => {
    if (selectedId && !visible.some((p) => p.id === selectedId)) setSelectedId(null);
  }, [visible, selectedId]);

  const toggleTier = (t: Tier) =>
    setTiers((cur) => {
      const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t].sort();
      return next.length === 3 ? [] : next;
    });
  const toggleCat = (id: CategoryId) =>
    setCats((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return next.length === CATEGORIES.length ? [] : next;
    });

  // The first-run tip goes away by itself after a while.
  useEffect(() => {
    if (seenHint) return;
    const t = setTimeout(() => setSeenHint(true), 15000);
    return () => clearTimeout(t);
  }, [seenHint, setSeenHint]);

  // ── Toasts ──
  useEffect(() => {
    if (!toast) return;
    // Longer messages (like how to turn location on) stay up long enough to read.
    const t = setTimeout(() => setToast(null), Math.max(4200, toast.length * 60));
    return () => clearTimeout(t);
  }, [toast]);

  // ── Location ──
  const inCityArea = useCallback(
    (lat: number, lng: number) => {
      const [w, s, e, n] = city.maxBounds;
      return lng >= w && lng <= e && lat >= s && lat <= n;
    },
    [city],
  );

  const centerOnUser = useCallback(() => {
    const pos = geo.position;
    if (!pos) return;
    if (inCityArea(pos.lat, pos.lng)) {
      mapRef.current?.flyTo(pos.lng, pos.lat, 15);
    } else {
      const d = distanceMeters(pos, { lat: city.center[1], lng: city.center[0] });
      setToast(`You’re ${formatDistance(d)} from ${city.name}. Your blue dot will appear once you’re here.`);
    }
  }, [geo.position, inCityArea, city]);

  useEffect(() => {
    if (wantCenterOnUser.current && geo.position) {
      wantCenterOnUser.current = false;
      centerOnUser();
    }
  }, [geo.position, centerOnUser]);

  useEffect(() => {
    if (geo.status === 'denied') setToast(locationHelp());
    if (geo.status === 'unavailable') setToast('Couldn’t get your location right now.');
  }, [geo.status]);

  const onLocate = () => {
    setSelectedId(null);
    if (geo.position) centerOnUser();
    else {
      wantCenterOnUser.current = true;
      geo.start();
    }
  };

  const selectPlace = (id: string | null) => {
    setSelectedId(id);
    if (id) {
      setSheet('none');
      setSeenHint(true);
    }
  };

  const closeDetails = useCallback(() => setSelectedId(null), []);
  const closeSheet = useCallback(() => setSheet('none'), []);

  const detailsOpen = !!selected && sheet === 'none';
  const panelOpen = detailsOpen || sheet !== 'none';
  const mustSeeVisible = visible.filter((p) => p.tier === 1).length;

  return (
    <div className={`app ${panelOpen ? 'has-panel' : ''}`}>
      <MapView
        ref={mapRef}
        city={city}
        places={visible}
        selectedId={selectedId}
        onSelect={selectPlace}
        userPosition={geo.position && inCityArea(geo.position.lat, geo.position.lng) ? geo.position : null}
      />

      <TopBar
        city={city}
        tiers={tiers}
        tierCounts={tierCounts}
        onToggleTier={toggleTier}
        onAllTiers={() => setTiers([])}
        categoryFilterCount={cats.length}
        onOpenFilters={() => setSheet('filters')}
        onOpenCities={() => setSheet('city')}
      />

      <div className={`fabs ${panelOpen ? 'is-hidden' : ''}`}>
        <button className="fab" onClick={() => mapRef.current?.fitCity()} aria-label="Show the whole city centre">
          <Maximize size={20} />
        </button>
        <button
          className={`fab fab--locate ${geo.status === 'active' ? 'is-active' : ''} ${geo.status === 'locating' ? 'is-busy' : ''}`}
          onClick={onLocate}
          aria-label="Show my location"
        >
          {geo.status === 'active' ? <LocateFixed size={22} /> : <Locate size={22} />}
        </button>
      </div>

      <div className={`bottombar ${panelOpen ? 'is-hidden' : ''}`}>
        {!seenHint && visible.length > 0 && (
          <button className="hint" onClick={() => setSeenHint(true)} aria-label="Dismiss tip">
            <strong>Bigger icon = higher priority.</strong> Tap any icon for details and directions.
          </button>
        )}
        <button className="bottombar__btn" onClick={() => setSheet('list')}>
          <List size={20} aria-hidden />
          <span>
            <strong>{visible.length}</strong> {visible.length === 1 ? 'place' : 'places'}
            {mustSeeVisible > 0 && <span className="bottombar__sub"> · {mustSeeVisible} must-see</span>}
          </span>
          <span className="bottombar__cta">View list</span>
        </button>
      </div>

      <BottomSheet
        open={detailsOpen}
        onClose={closeDetails}
        label={selected ? `${selected.name} details` : 'Place details'}
        className="sheet--details"
        header={selected && <PlaceDetailsHeader key={selected.id} place={selected} onClose={closeDetails} />}
      >
        {selected && <PlaceDetails place={selected} cityName={city.name} userPosition={geo.position} onClose={closeDetails} />}
      </BottomSheet>

      <BottomSheet
        open={sheet === 'list'}
        onClose={closeSheet}
        label="List of places"
        className="sheet--tall"
        header={
          <div className="sheet__title">
            <h2>
              {visible.length} {visible.length === 1 ? 'place' : 'places'} in {city.name}
            </h2>
            <button className="link-btn" onClick={closeSheet}>
              Map
            </button>
          </div>
        }
      >
        <PlaceList places={visible} userPosition={geo.position} onSelect={selectPlace} />
      </BottomSheet>

      <BottomSheet open={sheet === 'filters'} onClose={closeSheet} label="Interests filter">
        <CategoryFilter
          selected={cats}
          counts={catCounts}
          onToggle={toggleCat}
          onClear={() => setCats([])}
          onDone={closeSheet}
          resultCount={visible.length}
        />
      </BottomSheet>

      <BottomSheet open={sheet === 'city'} onClose={closeSheet} label="Choose a city">
        <CityPicker
          cities={CITIES}
          currentId={city.id}
          onPick={(id) => {
            setCityId(id);
            setSelectedId(null);
            closeSheet();
          }}
        />
      </BottomSheet>

      {(sheet === 'filters' || sheet === 'city' || sheet === 'list') && (
        <div className="scrim" onClick={closeSheet} aria-hidden />
      )}

      <div className={`toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite" onClick={() => setToast(null)}>
        {toast}
      </div>
    </div>
  );
}
