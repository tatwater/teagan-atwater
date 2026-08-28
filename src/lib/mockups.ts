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
const MOCKUP_ALT: Record<string, string> = {
  'project-car-app/01-home-screen-cost-overview.jpg':
    'The personal car app\u2019s home screen on a phone, headed by a 2025 Outback: a nudge that it has been nine days since the last fill-up, a lifetime cost curve, and tiles reading 33.3 mpg average fuel economy, 616 mi average projected range, and 9¢/gal against the previous ninety days',
  'project-car-app/02-fill-up-review-screen.jpg':
    'The personal car app\u2019s review screen after logging a fill-up: 32.3 miles per gallon, 3% below average and 10¢ per mile, over the entry it was worked out from — 500.5 miles, 15.5 gallons, and 50.50 dollars on November 5, 2024',
  'project-gli/01-phone-in-hand-explore-map.jpg':
    'Gli\u2019s explore map open on a phone, showing Mascoma Lake with ice condition reports pinned along the shoreline',
  'project-gli/02-conditions-card-close-up.jpg':
    'A close-up of Gli\u2019s lake summary card: conditions rated Good, last reported two hours ago by three skaters, six to eight inches of ice, and two hazards',
  'project-gli/03-logo-lockups.jpg':
    'The Gli wordmark in both of its lockups, reversed white on black and black on white, each underscored by a skate blade trailing pale blue ice',
};


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
