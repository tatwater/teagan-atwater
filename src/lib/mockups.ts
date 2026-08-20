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
  src: string;
}


export function mockupsFor(id: string, name: string): Mockup[] {
  const prefix = `/src/assets/mockups/${id}/`;

  return Object.keys(MOCKUP_URLS)
    .filter((path) => path.startsWith(prefix))
    .sort()
    .map((path, index) => ({
      alt: MOCKUP_ALT[path.slice('/src/assets/mockups/'.length)]
        ?? `${name} — mockup ${index + 1}`,
      src: MOCKUP_URLS[path],
    }));
}
