import type { ResumeItem } from '@/data/resume/types';

import { resumeItems } from '@/data/resume';


/**
 * The home page's curated reel.
 *
 * Order is editorial, not chronological, and each entry gets its own `name` and
 * `tagline` because the home page introduces the *thing* — the product or the
 * company — while the résumé introduces the *role*. `nmc` is "Founding Software
 * Engineer" on the résumé and "The New Money Company" here; `osler-cto` is
 * filed under ScopeAI's legal name but the world knows the product as Osler.
 *
 * Everything else — logo, dates, tags, whether there is a detail page — still
 * comes from the résumé entry, so this file never has to be kept in sync.
 *
 * `accent` names a CSS variable rather than holding a colour outright, because
 * the reel paints it as text as well as fill and so it has to be readable in
 * both themes; the light/dark pairs live in src/styles/global.css.
 *
 * `hidden` entries resolve here on purpose. Work can be worth showing on the
 * home page before it is worth putting on a résumé — `project-gli` is showcased
 * as mockups while its résumé entry stays hidden — so the reel deliberately does
 * not filter on that flag the way the résumé and the printed page do.
 */
interface HighlightSource {
  accent: string;  // CSS colour for the reel's selection bar, glow, and label
  id: string;  // id of a ResumeItem
  name: string;  // What the home page calls it
  tagline: string;  // One-liner written for the home page
}

const HIGHLIGHT_SOURCES: HighlightSource[] = [
  {
    accent: 'var(--reel-nmc)',
    id: 'nmc',
    name: 'The New Money Company',
    tagline: 'YC-backed fintech startup guaranteeing payments in trust-sensitive marketplaces',
  },
  {
    accent: 'var(--reel-gli)',
    id: 'project-gli',
    name: 'Gli',
    tagline: 'An ice conditions reporting platform for the Nordic / wild ice skating community',
  },
  {
    accent: 'var(--reel-sous)',
    id: 'project-sous',
    name: 'Sous',
    tagline: 'A smart, social platform encouraging more cooking at home',
  },
  {
    accent: 'var(--reel-car-app)',
    id: 'project-car-app',
    name: 'Personal Car App',
    tagline: 'A lifetime cost-of-ownership tracker for my own car',
  },
  // Shelved for now, copy kept — uncomment to bring the tab back. Its résumé
  // entry and its --reel-osler accent both stay where they are.
  // {
  //   accent: 'var(--reel-osler)',
  //   id: 'osler-cto',
  //   name: 'Osler',
  //   tagline: 'Structured, predictive EMR mapping exams and diagnoses to a representative patient avatar',
  // },
];

export interface Highlight extends HighlightSource {
  href: string | null;  // null until the entry earns a detail page
  item: ResumeItem;
}

export const highlights: Highlight[] = HIGHLIGHT_SOURCES.map((source) => {
  const item = resumeItems.find((candidate) => candidate.id === source.id);

  // A typo in an id would otherwise drop an entry from the home page silently.
  if (!item)
    throw new Error(`Home page highlight "${source.name}" references unknown résumé item "${source.id}"`);

  return {
    ...source,
    item,
    // Matches the résumé's opt-in rule: only entries with a `detailLabel` have a
    // page to link to — see getStaticPaths in src/pages/resume/[id].astro.
    href: item.detailLabel ? `/resume/${item.detailId ?? item.id}` : null,
  };
});
