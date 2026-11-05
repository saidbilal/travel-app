import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import type { Place } from '../types';
import { CATEGORY_BY_ID, TIER_BY_ID } from '../categories';
import { PlaceIcon } from '../icons';

/** Extra room around the circle for the ring, star badge and shadow (CSS px). */
export const MARKER_PAD = 8;

export function markerImageId(p: Place) {
  return `mk-${p.icon}-${p.category}-${p.tier}`;
}

function iconInnerSvg(p: Place) {
  const svg = renderToStaticMarkup(createElement(PlaceIcon, { icon: p.icon, size: 24 }));
  return svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] ?? '';
}

/** Builds the marker artwork: a category-coloured disc with the landmark icon, gold ring + star for must-sees. */
function markerSvg(p: Place) {
  const size = TIER_BY_ID[p.tier].size;
  const color = CATEGORY_BY_ID[p.category].color;
  const W = size + MARKER_PAD * 2;
  const c = W / 2;
  const r = size / 2;
  const border = p.tier === 1 ? 3 : p.tier === 2 ? 2 : 1.75;
  const iconPx = size * 0.56;
  const iconScale = iconPx / 24;
  const iconStroke = p.tier === 3 ? 2.4 : 2.1;
  const parts: string[] = [];
  if (p.tier === 1) parts.push(`<circle cx="${c}" cy="${c}" r="${r + 2.5}" fill="#E8A900"/>`);
  parts.push(`<circle cx="${c}" cy="${c}" r="${r - border / 2}" fill="${color}" stroke="#fff" stroke-width="${border}"/>`);
  parts.push(
    `<g transform="translate(${c - iconPx / 2} ${c - iconPx / 2}) scale(${iconScale})" fill="none" stroke="#fff" stroke-width="${iconStroke}" stroke-linecap="round" stroke-linejoin="round">${iconInnerSvg(p).replace(/currentColor/g, '#fff')}</g>`,
  );
  if (p.tier === 1) {
    const bx = c + r * 0.72;
    const by = c - r * 0.72;
    parts.push(`<circle cx="${bx}" cy="${by}" r="8" fill="#E8A900" stroke="#fff" stroke-width="1.5"/>`);
    // 5-point star
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? 4.6 : 2;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push(`${(bx + rad * Math.cos(a)).toFixed(2)},${(by + rad * Math.sin(a)).toFixed(2)}`);
    }
    parts.push(`<polygon points="${pts.join(' ')}" fill="#fff"/>`);
  }
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">${parts.join('')}</svg>`, W };
}

async function rasterize(svg: string, W: number, ratio: number) {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const px = Math.round(W * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d')!;
  ctx.shadowColor = 'rgba(15, 25, 35, 0.35)';
  ctx.shadowBlur = 4 * ratio;
  ctx.shadowOffsetY = 1.5 * ratio;
  ctx.drawImage(img, 0, 0, px, px);
  return ctx.getImageData(0, 0, px, px);
}

/** Rasterises and registers every marker image the given places need. */
export async function ensureMarkerImages(map: MLMap, places: Place[]) {
  // Draw at a high resolution so markers stay crisp when they scale up with zoom.
  const ratio = Math.min(4, Math.max(2, Math.ceil((window.devicePixelRatio || 1) * 1.3)));
  const todo = new Map<string, Place>();
  for (const p of places) {
    const id = markerImageId(p);
    if (!map.hasImage(id) && !todo.has(id)) todo.set(id, p);
  }
  await Promise.all(
    [...todo].map(async ([id, p]) => {
      const { svg, W } = markerSvg(p);
      const data = await rasterize(svg, W, ratio);
      if (!map.hasImage(id)) map.addImage(id, data, { pixelRatio: ratio });
    }),
  );
}
