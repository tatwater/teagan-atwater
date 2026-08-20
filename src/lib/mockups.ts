/**
 * Home page mockup photosets.
 *
 * Each highlight owns a directory under src/assets/mockups/<résumé item id>/.
 * Globbing them lets Vite emit hashed, cache-busted URLs the same way logos are
 * handled — see src/lib/logos.ts for why the raw /src path cannot be used.
 *
 * Highlights with no directory yet resolve to an empty list, and the home page
 * renders labelled placeholders instead.
 */
const MOCKUP_URLS = import.meta.glob('/src/assets/mockups/*/*.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;

/** Real alt text, keyed by the path under src/assets/mockups/. */
const MOCKUP_ALT: Record<string, string> = {};


export interface Mockup {
  alt: string;
  kind: 'image' | 'video';
  src: string;
}


/**
 * Remote videos, keyed by highlight id, rendered above that highlight's stills.
 *
 * These deliberately do not live under src/assets/mockups/ the way images do.
 * The New Money Company clip is 34 MB — more than this repository should carry
 * permanently for one home page slot — so it is hotlinked from the CDN that
 * already serves it under a year-long immutable cache header. The trade is a
 * dependency on someone else's asset: if one of these is ever pruned or
 * re-hashed the slot goes blank, while the globbed stills and the placeholder
 * fallback below carry on unaffected.
 */
const MOCKUP_VIDEOS: Record<string, Mockup[]> = {
  'nmc-swe': [
    {
      alt: 'The New Money Company — product walkthrough',
      kind: 'video',
      src: 'https://framerusercontent.com/assets/3Skn8cgIBaBLCUD3Y8gU51uIB4Q.mp4',
    },
  ],
};


export function mockupsFor(id: string, name: string): Mockup[] {
  const prefix = `/src/assets/mockups/${id}/`;

  const stills = Object.keys(MOCKUP_URLS)
    .filter((path) => path.startsWith(prefix))
    .sort()
    .map((path, index) => ({
      alt: MOCKUP_ALT[path.slice('/src/assets/mockups/'.length)]
        ?? `${name} — mockup ${index + 1}`,
      kind: 'image' as const,
      src: MOCKUP_URLS[path],
    }));

  // Videos take the top slots; stills follow in filename order.
  return [...(MOCKUP_VIDEOS[id] ?? []), ...stills];
}
