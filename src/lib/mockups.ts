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
  'nmc/02-order-management.jpg':
    'The New Money Company\u2019s order workspace on a tablet, open on order O-1001 for $108,007.50: a checklist running from uploading the buyer\u2019s purchase order through marking the order shipped and delivered to reconciling payment, beside a sidebar of the documents the order generates along the way',
  'nmc/03-purchase-order-pdf.jpg':
    'A purchase order the platform generated, printed and lying on an oak table — order O-1001, Net 30, routing seven lines of sauces from a Chicago seller to a buyer in São Paulo, footed \u201CPowered by The New Money Company\u201D',
  'nmc/04-invoice-review-and-pay.jpg':
    'An invoice open on a laptop before payment: I-1001, issued February 1 2025 and due March 2, six lines of lab equipment billed to a buyer in Geneva, totalling $108,007.50 USD beside a Pay Invoice button',
  'project-car-app/01-home-screen-cost-overview.jpg':
    'The personal car app\u2019s home screen on a phone, headed by a 2025 Outback: a nudge that it has been nine days since the last fill-up, a lifetime cost curve, and tiles reading 33.3 mpg average fuel economy, 616 mi average projected range, and 9¢/gal against the previous ninety days',
  'project-car-app/02-fill-up-review-screen.jpg':
    'The personal car app\u2019s review screen after logging a fill-up: 32.3 miles per gallon, 3% below average and 10¢ per mile, over the entry it was worked out from — 500.5 miles, 15.5 gallons, and 50.50 dollars on November 5, 2024',
  'project-gli/01-phone-in-hand-explore-map.jpg':
    'Gli\u2019s explore map open on a phone, showing Mascoma Lake with ice condition reports pinned along the shoreline',
  'project-gli/02-satellite-card-close-up.jpg':
    'A close-up of Gli\u2019s satellite layer over Mascoma Lake in Enfield, New Hampshire: a Sentinel-2 true colour capture from December 22 2025 at 1% cloud cover, scrubbable along a timeline of every earlier pass over the lake',
  'project-gli/03-logo-lockups.jpg':
    'The Gli wordmark in both of its lockups, reversed white on black and black on white, each underscored by a skate blade trailing pale blue ice',
  'project-sous/01-recipe-detail-on-laptop.jpg':
    'A Sous recipe open on a laptop — BBQ Chicken, grilled, an hour and twenty minutes for six servings: its ingredients and equipment down one column, five steps down the other with every ingredient linked back into the prose, a timer offered against the step that needs one, and a cook\u2019s own note left under the grilling step',
  'project-sous/02-meal-player-ingredients-crossed-off.jpg':
    'Sous\u2019 meal player held in one hand against a pantry wall of glass jars — spiralled pasta, rigatoni, grains and flour — with a whole dinner\u2019s shopping gathered into one list: the challah\u2019s water, vegetable oil, salt, flour and butter already struck through, its yeast, sugar, honey and sesame seeds still to fetch, and the mushroom risotto carrying on underneath',
  'project-sous/03-meal-player-chicken-step-4.jpg':
    'Sous\u2019 meal player face up on an oak table part-way through cooking, open on Baked Chicken Breasts at step four — whisking the salt, pepper, garlic powder and paprika, each measure tagged beneath the instruction — over a row of the three other dishes waiting at their own steps, the challah on six of seven and the green beans on three of six',
};


export interface MockupImage {
  alt: string;
  kind: 'image';
  src: string;
}

export interface MockupVideo {
  alt: string;
  kind: 'video';
  position?: string;
  src: string;
}

/**
 * A Mockuuups player embed.
 *
 * Everything but `alt` is a Mockuuups player setting, carried through verbatim
 * rather than interpreted here, so retuning a mockup is an edit to the table
 * below and not a code change. They are strings for the same reason: they are
 * HTML attributes on their element, and `triggerLoop` reads `'true'` rather
 * than `true` so nothing has to guess how a boolean should be serialised.
 */
export interface MockupEmbed {
  alt: string;
  aspectRatio: string;
  backgroundColor: string;
  cameraZoom: string;
  clickRange: string;
  cursorAffectPage: string;
  cursorRange: string;
  kind: 'embed';
  mockupId: string;
  position?: string;
  trigger: string;
  triggerLoop: string;
  triggerThreshold: string;
}

export type Mockup = MockupImage | MockupVideo | MockupEmbed;


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
const MOCKUP_VIDEOS: Record<string, MockupVideo[]> = {
  'nmc': [
    {
      alt: 'The New Money Company — product walkthrough',
      kind: 'video',
      src: 'https://framerusercontent.com/assets/3Skn8cgIBaBLCUD3Y8gU51uIB4Q.mp4',
    },
  ],
};


/**
 * Mockuuups player embeds, keyed by highlight id.
 *
 * Like the videos below these are not files in the repository, but the trade is
 * a different one: the clip is rendered in the reader's browser by a script of
 * Mockuuups', so this costs a third-party request on the home page and the slot
 * goes blank if their service is down. It also cannot honour reduced motion the
 * way a <video> can — see MockupPlayer in src/islands/home-reel.tsx for what
 * the reel does about that.
 */
const MOCKUP_EMBEDS: Record<string, MockupEmbed[]> = {
  'project-sous': [
    {
      alt: 'Three phones side by side showing Sous: a shared post for a salmon dinner, written up by the cook and linked back to the recipes it came from; a profile keeping 154 badges, a three-day streak and four active challenges; and the Pan-Seared Salmon recipe itself, credited to the cook who wrote it',
      aspectRatio: '4 / 3',
      backgroundColor: '#000000',
      cameraZoom: '40',
      clickRange: '15-22-12-22',
      cursorAffectPage: 'false',
      cursorRange: '1-1-1-1',
      kind: 'embed',
      mockupId: '45ea5780-7132-4ab7-bad7-1c6a336e9a9b',
      // Second in the photoset, under the laptop shot. It shares the 02- prefix
      // with a still, and `app-` sorting before `meal-` is what settles the two
      // — renumber rather than rename if that order ever needs to change.
      position: '02-app-on-phones',
      trigger: 'load',
      triggerLoop: 'false',
      triggerThreshold: '0',
    },
  ],
};


/**
 * A highlight's photoset, in the order the reel renders it.
 *
 * Stills sort by filename, which is the whole reason they are prefixed `01-`,
 * `02-` and so on. Videos and embeds are not files, so they cannot join that
 * sort on their own — by default they simply lead, on the grounds that a
 * highlight with a walkthrough usually wants to open on it.
 *
 * `position` is the way out of that default: give a video or an embed a key
 * that reads like one of those filenames and it is filed among the stills as
 * though it were one, which is how the Sous embed sits second, under the laptop
 * shot. Omitting it keeps the leading slot, which is what the NMC video wants.
 */
export function mockupsFor(id: string, name: string): Mockup[] {
  const prefix = `/src/assets/mockups/${id}/`;

  const stills = Object.keys(MOCKUP_URLS)
    .filter((path) => path.startsWith(prefix))
    .sort()
    .map((path, index) => ({
      key: path.slice(prefix.length),
      shot: {
        alt: MOCKUP_ALT[path.slice('/src/assets/mockups/'.length)]
          ?? `${name} — mockup ${index + 1}`,
        kind: 'image' as const,
        src: MOCKUP_URLS[path],
      } satisfies MockupImage,
    }));

  const motion = [...(MOCKUP_EMBEDS[id] ?? []), ...(MOCKUP_VIDEOS[id] ?? [])];

  const filed = motion
    .filter((shot) => shot.position !== undefined)
    .map((shot) => ({ key: shot.position as string, shot }));

  const ordered = [...stills, ...filed]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((entry) => entry.shot);

  return [...motion.filter((shot) => shot.position === undefined), ...ordered];
}
