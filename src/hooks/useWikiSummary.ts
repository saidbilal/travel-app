import { useEffect, useState } from 'react';

export interface WikiSummary {
  image?: string;
  imageFallback?: string;
  url?: string;
}

const cache = new Map<string, WikiSummary>();

/** Fetches a photo + link for a Wikipedia article (CORS-enabled public REST API). */
export function useWikiSummary(title: string | undefined) {
  const [data, setData] = useState<WikiSummary | null>(() => (title ? cache.get(title) ?? null : null));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!title) {
      setData(null);
      return;
    }
    const hit = cache.get(title);
    if (hit) {
      setData(hit);
      return;
    }
    setData(null);
    setLoading(true);
    const ctrl = new AbortController();
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, {
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        // A disambiguation page means the title was ambiguous: better no photo than a wrong one.
        if (j.type === 'disambiguation') throw new Error('disambiguation');
        const thumb: string | undefined = j.thumbnail?.source;
        // Ask for a sharper thumbnail for high-DPI phones; fall back to the original thumb if that size fails.
        const sharper = thumb?.replace(/\/(\d+)px-/, '/800px-');
        const summary: WikiSummary = {
          image: sharper ?? thumb,
          imageFallback: thumb,
          url: j.content_urls?.mobile?.page ?? j.content_urls?.desktop?.page,
        };
        cache.set(title, summary);
        setData(summary);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setData({});
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [title]);

  return { data, loading };
}
