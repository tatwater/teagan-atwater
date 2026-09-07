/**
 * The skill taxonomy: which tags exist, how they group, and where each is
 * allowed to appear. This file is the single source of truth for all three —
 * `SkillCategory` and `SkillTag` are derived from the record below, so adding a
 * tag to the vocabulary is one line here and nothing else.
 *
 * Visibility is a ladder rather than a set of independent switches; each level
 * is a superset of the one beneath it:
 *
 *   'hidden'   In the vocabulary, out of the UI. Entries may still carry the
 *              tag and it stays valid to tag with, but it renders on no card,
 *              no sidebar, no print page, and matches no search. This is the
 *              staging area — where a tag waits to be judged.
 *   'entry'    Renders on entry cards and detail pages, and is matched by both
 *              the résumé search and the site-wide command palette. Left out of
 *              the skills sidebar. This is where the long tail lives: an entry
 *              can carry as many of these as it likes without crowding the
 *              curated list.
 *   'sidebar'  Also listed in the skills sidebar.
 *   'print'    Also printed on the one-page résumé.
 *
 * The sidebar and print sets are deliberately identical today — nothing sits at
 * 'sidebar' — because both are meant to mirror the designed paper résumé. The
 * rung is kept distinct so the two can be split again later without reworking
 * the ladder.
 *
 * Category order below is render order, in the sidebar and in print alike, and
 * a category with nothing above 'entry' drops out of both on its own.
 */
export type SkillVisibility = 'hidden' | 'entry' | 'sidebar' | 'print';


export const skillCategories = {
  'Craft & Design': {
    'Figma':                    'print',
    'Design Systems':           'print',
    'Design Tokens':            'print',
    'Motion':                   'print',
    'Responsive Design':        'print',
    'Semantic Markup':          'print',
    'Keyboard Navigation':      'print',
    'Screen Readers':           'print',
    'UI Design':                'entry',
    'UX Design':                'entry',
    'Accessibility':            'entry',
    'Information Architecture': 'entry',
    'Prototyping':              'entry',
    'Adobe XD':                 'entry',
  },

  'Web & Native': {
    'TypeScript':        'print',
    'React':             'print',
    'Electron':          'print',
    'React Native':      'print',
    'Expo':              'print',
    'Tailwind':          'print',
    'Vitest':            'print',
    'CSS':               'print',
    'CSS Modules':       'print',
    'Sass/Less':         'entry',
    'Next.js':           'entry',
    'Astro':             'entry',
    'TanStack Start':    'entry',
    'Vite':              'entry',
    'Styled Components': 'entry',
    'JavaScript':        'entry',
    'HTML':              'entry',
    'Angular':           'hidden',
    'jQuery':            'entry',
  },

  'State & Data Persistence': {
    'Atomic State':     'print',
    'Immutable Stores': 'print',
    'Device Storage':   'print',
    'Offline Support':  'print',
    'Sync Engines':     'print',
    'Postgres':         'print',
    'SQL':              'hidden',
    'Key-Value Stores': 'print',
    'Vector Databases': 'print',
    'NoSQL':            'print',
    'React Context':    'entry',
    'Redux':            'entry',
    'MongoDB':          'entry',
    'Convex':           'entry',
    'Supabase':         'entry',
  },

  'Architecture & Rendering': {
    'Monorepos':                       'print',
    'Server-Side Rendering':           'print',
    'React Server Components':         'print',
    'Partial Pre-Rendering':           'print',
    'Incremental Static Regeneration': 'print',
    'Static Site Generation':          'print',
    'Web Performance':                 'entry',
    'Vercel':                          'entry',
    'CI/CD':                           'entry',
    'Git':                             'entry',
  },

  'Agentic Processes': {
    'HITL Engineering':        'print',
    'Agent Skills':            'print',
    'Sub-agent Orchestration': 'print',
    'Automated Guardrails':    'print',
    'Continuous Verification': 'print',
    'Claude Code':             'entry',
    'Codex':                   'hidden',
    'Automated Testing':       'entry',
    'Code Review':             'entry',
  },

  'Backend & Services': {
    'Node.js':     'entry',
    'REST APIs':   'entry',
    'GraphQL':     'entry',
    'Auth':        'entry',
    'NextAuth':    'entry',
    'PHP':         'entry',
    'Ruby':        'hidden',
    'Java':        'hidden',
    'Python':      'hidden',
    'Meteor':      'entry',
    'Drupal':      'entry',
    'React Email': 'entry',
    'Full Stack':  'entry',
  },

  'Product & Leadership': {
    'Product Strategy':  'entry',
    'Roadmapping':       'hidden',
    'Team Leadership':   'hidden',
    'Mentorship':        'hidden',
    'Startup':           'entry',
    'Fundraising':       'hidden',
    'Agile/Scrum':       'entry',
    'Technical Writing': 'hidden',
    'Freelance':         'entry',
    'Content Strategy':  'entry',
    'SEO':               'entry',
  },
} as const satisfies Record<string, Record<string, SkillVisibility>>;


export type SkillCategory = keyof typeof skillCategories;

export type SkillTag = {
  [C in SkillCategory]: keyof (typeof skillCategories)[C];
}[SkillCategory];


/** Render order for categories, and the order tags read within each. */
export const skillCategoryOrder = Object.keys(skillCategories) as SkillCategory[];


/** The ladder, lowest rung first. Index doubles as the comparable rank. */
export const SKILL_VISIBILITY_ORDER: SkillVisibility[] = ['hidden', 'entry', 'sidebar', 'print'];


const visibilityByTag = new Map<SkillTag, SkillVisibility>(
  skillCategoryOrder.flatMap((category) =>
    Object.entries(skillCategories[category]) as [SkillTag, SkillVisibility][]),
);


export function visibilityOf(tag: SkillTag): SkillVisibility {
  return visibilityByTag.get(tag) ?? 'hidden';
}


/** True when a tag sits at `level` or higher on the ladder. */
export function visibilityAtLeast(tag: SkillTag, level: SkillVisibility): boolean {
  return SKILL_VISIBILITY_ORDER.indexOf(visibilityOf(tag))
    >= SKILL_VISIBILITY_ORDER.indexOf(level);
}


/** True for anything the UI is allowed to render or match on. */
export function isTagVisible(tag: SkillTag): boolean {
  return visibilityAtLeast(tag, 'entry');
}


/**
 * The gate every render path runs an entry's tags through. Order is preserved,
 * so an entry still reads the way it was authored — just shorter.
 */
export function visibleTags<T extends SkillTag>(tags: readonly T[]): T[] {
  return tags.filter(isTagVisible);
}


function categoriesAtLeast(level: SkillVisibility): [SkillCategory, SkillTag[]][] {
  return skillCategoryOrder
    .map((category): [SkillCategory, SkillTag[]] => [
      category,
      (Object.keys(skillCategories[category]) as SkillTag[])
        .filter((tag) => visibilityAtLeast(tag, level)),
    ])
    .filter(([, tags]) => tags.length > 0);
}


/** Categories and tags for the site's skills sidebar. */
export function sidebarSkillCategories(): [SkillCategory, SkillTag[]][] {
  return categoriesAtLeast('sidebar');
}


/**
 * Categories and tags for the one-page printed résumé — the curated subset that
 * keeps it to a single page. Derived from the same record as everything else, so
 * the two can no longer drift.
 */
export function printSkillCategories(): [SkillCategory, SkillTag[]][] {
  return categoriesAtLeast('print');
}
