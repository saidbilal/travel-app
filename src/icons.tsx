import type { ComponentType, ReactNode, SVGProps } from 'react';
import {
  Binoculars,
  Bridge,
  Building2,
  CableCar,
  Castle,
  Church,
  Drama,
  FerrisWheel,
  Fish,
  FlaskConical,
  Flower2,
  Landmark,
  Music,
  Library,
  MountainSnow,
  Orbit,
  Palette,
  PawPrint,
  Sailboat,
  ShoppingBag,
  Store,
  Theater,
  TreeDeciduous,
  TreePalm,
  Utensils,
  Waves,
  WavesLadder,
  Shapes,
} from 'lucide-react';
import type { IconId } from './types';

export interface IconProps {
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
}

/** Hand-drawn icons in the same 24x24 / stroke style as lucide, for things lucide doesn't cover. */
function makeIcon(children: ReactNode): ComponentType<IconProps> {
  return function CustomIcon({ size = 24, strokeWidth = 2, className }: IconProps) {
    const props: SVGProps<SVGSVGElement> = {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className,
      'aria-hidden': true,
    };
    return <svg {...props}>{children}</svg>;
  };
}

const Palace = makeIcon(
  <>
    <path d="M2 21h20" />
    <path d="M3.5 21v-8h17v8" />
    <path d="M8.5 13v-1.5a3.5 3.5 0 0 1 7 0V13" />
    <path d="M12 8V5.5" />
    <path d="M10.8 6.5h2.4" />
    <path d="M6.5 16v2M10 16v2M14 16v2M17.5 16v2" />
  </>,
);

const Fortress = makeIcon(
  <>
    <path d="M12 2.5l2.4 4.6 5.1.7-3.4 3.8 1.2 5.1L12 14.3l-5.3 2.4 1.2-5.1-3.4-3.8 5.1-.7z" />
    <path d="M7 21h10" />
    <path d="M12 14.3V21" />
  </>,
);

const Dome = makeIcon(
  <>
    <path d="M3 21h18" />
    <path d="M5 21v-7h14v7" />
    <path d="M6.5 14a5.5 5.5 0 0 1 11 0" />
    <path d="M12 8.5V3.5" />
    <path d="M10.5 5h3" />
    <path d="M9 17.5v1.5M12 17v4M15 17.5v1.5" />
  </>,
);

const Cathedral = makeIcon(
  <>
    <path d="M3 21h18" />
    <path d="M4 21v-9l4-3 4 3" />
    <path d="M12 21V12" />
    <path d="M12 21h8v-9l-4-3-4 3" />
    <path d="M8 9V3M16 9V3" />
    <path d="M7 4.5h2M15 4.5h2" />
    <path d="M8 21v-3M16 21v-3" />
  </>,
);

const RoundTower = makeIcon(
  <>
    <path d="M6.5 21V7.5c0-1.4 2.5-2.5 5.5-2.5s5.5 1.1 5.5 2.5V21" />
    <path d="M6.5 7.5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5" />
    <path d="M12 5V2.5" />
    <path d="M4 21h16" />
    <path d="M9.5 13.5v1.5M14.5 16v1.5M12 18.5V21" />
  </>,
);

const Statue = makeIcon(
  <>
    <circle cx="12" cy="4" r="1.8" />
    <path d="M12 6.5v5.5" />
    <path d="M8.5 9.5 12 8l3.5-2" />
    <path d="M10 15l2-3 2 3" />
    <path d="M7.5 17h9" />
    <path d="M8.5 17v4h7v-4" />
    <path d="M6 21h12" />
  </>,
);

const Mermaid = makeIcon(
  <>
    {/* Sitting on a rock, tail curled to the side with a forked fin */}
    <circle cx="8" cy="4.5" r="2" />
    <path d="M8 7v4.5c0 1.6 1 2.5 2.5 2.5H15" />
    <path d="M8 8.5l2.8 1.8" />
    <path d="M15 14l3-2.2M15 14l3.4.8" />
    <path d="M3 21c.6-2.6 2.6-4 5-4h6c2.4 0 4.4 1.4 5 4" />
    <path d="M2 21h20" />
  </>,
);

const Fountain = makeIcon(
  <>
    <path d="M12 16V7" />
    <path d="M12 7c-.5-2-2.4-3.5-4.6-3.5-1.7 0-2.9 1.3-2.9 3.2" />
    <path d="M12 7c.5-2 2.4-3.5 4.6-3.5 1.7 0 2.9 1.3 2.9 3.2" />
    <path d="M4.5 10v.5M19.5 10v.5" />
    <path d="M3 16h18" />
    <path d="M4.5 16c0 2.8 3.4 5 7.5 5s7.5-2.2 7.5-5" />
  </>,
);

const Houses = makeIcon(
  <>
    <path d="M2.5 21V10l3.5-4 3.5 4v11" />
    <path d="M9.5 21V8l3-3.5 3 3.5v13" />
    <path d="M15.5 21v-9l3-3 3 3v9" />
    <path d="M2 21h20" />
    <path d="M6 13v1.5M12.5 11v1.5M18.5 14.5V16M12.5 16v1.5" />
  </>,
);

const Canal = makeIcon(
  <>
    <path d="M3 13V7l3-3 3 3v6" />
    <path d="M15 13V7l3-3 3 3v6" />
    <path d="M2 13h20" />
    <path d="M2 17c1.7 1 3.3 1 5 0s3.3-1 5 0 3.3 1 5 0 3.3-1 5 0" />
    <path d="M2 21c1.7 1 3.3 1 5 0s3.3-1 5 0 3.3 1 5 0 3.3-1 5 0" />
  </>,
);

const TownHall = makeIcon(
  <>
    <path d="M2 21h20" />
    <path d="M3 21v-9h6M21 21v-9h-6" />
    <path d="M9 21V6l3-3.5L15 6v15" />
    <circle cx="12" cy="9.5" r="1.6" />
    <path d="M10.5 21v-4a1.5 1.5 0 0 1 3 0v4" />
    <path d="M5.5 15v2M18.5 15v2" />
  </>,
);

const Cemetery = makeIcon(
  <>
    <path d="M7 20V9a5 5 0 0 1 10 0v11" />
    <path d="M12 9.5v6M9.5 12h5" />
    <path d="M3.5 20h17" />
  </>,
);

const Gate = makeIcon(
  <>
    <path d="M3 21V8h18v13" />
    <path d="M2 8h20" />
    <path d="M5 8V5h14v3" />
    <path d="M8.5 21v-6a3.5 3.5 0 0 1 7 0v6" />
  </>,
);

const Basilica = makeIcon(
  <>
    {/* Cluster of spires, the tallest in the middle with a cross */}
    <path d="M2 21h20" />
    <path d="M3.5 21v-8l1.5-4.5L6.5 13v8" />
    <path d="M6.5 21V10l1.75-5L10 10v11" />
    <path d="M10 21V8.5l2-5.5 2 5.5V21" />
    <path d="M14 21V10l1.75-5L17.5 10v11" />
    <path d="M17.5 21v-8l1.5-4.5 1.5 4.5v8" />
    <path d="M12 3V1M11 1.9h2" />
    <path d="M11 21v-2.5a1 1 0 0 1 2 0V21" />
  </>,
);

const Gaudi = makeIcon(
  <>
    {/* House with a wavy, dragon-back roof and round windows */}
    <path d="M2 21h20" />
    <path d="M4 21V9.5c1.3-1.8 2.7-2.7 4-2.7 1.6 0 2.4 1.4 4 1.4s2.4-2.7 4.3-2.7c1.4 0 2.6 1 3.7 2.8V21" />
    <circle cx="8" cy="12.5" r="1.3" />
    <circle cx="12" cy="12.5" r="1.3" />
    <circle cx="16" cy="12.5" r="1.3" />
    <path d="M7 17h2M15 17h2" />
    <path d="M11 21v-3.5a1 1 0 0 1 2 0V21" />
  </>,
);

const Stadium = makeIcon(
  <>
    <ellipse cx="12" cy="14" rx="9.5" ry="6.5" />
    <ellipse cx="12" cy="14" rx="5" ry="3" />
    <path d="M12 11v6" />
    <path d="M3.5 9.5V4M20.5 9.5V4" />
    <path d="M2.5 4h2M19.5 4h2" />
  </>,
);

const Skyscraper = makeIcon(
  <>
    {/* Bullet-shaped tower */}
    <path d="M7.5 21V10.5C7.5 6 9.5 2.5 12 2.5s4.5 3.5 4.5 8V21" />
    <path d="M5 21h14" />
    <path d="M10 9h4M9.5 12.5h5M9.5 16h5" />
  </>,
);

const ICONS: Record<IconId, ComponentType<IconProps>> = {
  castle: Castle,
  palace: Palace,
  fortress: Fortress,
  museum: Landmark,
  art: Palette,
  church: Church,
  dome: Dome,
  cathedral: Cathedral,
  tower: RoundTower,
  statue: Statue,
  mermaid: Mermaid,
  fountain: Fountain,
  harbour: Sailboat,
  street: ShoppingBag,
  houses: Houses,
  canal: Canal,
  opera: Drama,
  theatre: Theater,
  library: Library,
  townhall: TownHall,
  market: Store,
  food: Utensils,
  garden: Flower2,
  park: TreeDeciduous,
  cemetery: Cemetery,
  zoo: PawPrint,
  aquarium: Fish,
  beach: TreePalm,
  swim: WavesLadder,
  lake: Waves,
  bridge: Bridge,
  ski: MountainSnow,
  planet: Orbit,
  ferris: FerrisWheel,
  gate: Gate,
  science: FlaskConical,
  urban: Shapes,
  basilica: Basilica,
  gaudi: Gaudi,
  stadium: Stadium,
  viewpoint: Binoculars,
  music: Music,
  cablecar: CableCar,
  skyscraper: Skyscraper,
  modern: Building2,
};

export function PlaceIcon({ icon, ...rest }: IconProps & { icon: IconId }) {
  const Cmp = ICONS[icon] ?? Landmark;
  return <Cmp {...rest} />;
}
