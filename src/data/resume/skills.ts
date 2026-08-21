/**
 * The skill taxonomy: which tags exist, how they group, and where each is
 * allowed to appear. This file is the single source of truth for all three —
 * `SkillCategory` and `SkillTag` are derived from the record below, so adding a
 * tag to the vocabulary is one line here and nothing else.
 *
 * Visibility is a ladder rather than a set of independent switches; each level
 * is a superset of the one beneath it:
 *
 *   'hidden'  In the vocabulary, out of the UI. Entries may still carry the tag
 *             and it stays valid to tag with, but it renders on no card, no
 *             sidebar, no print page, and matches no search. This is the
 *             staging area — where a tag waits to be judged.
 *   'site'    Renders in the skills sidebar and on entry cards, but is left off
 *             the one-page printed résumé.
 *   'print'   Renders everywhere, the printed résumé included.
 *
 * Category order below is render order, in the sidebar and in print alike, and
 * a category whose tags are all hidden drops out of both on its own.
 */
export type SkillVisibility = 'hidden' | 'site' | 'print';


export const skillCategories = {
  'Craft & Design': {
    'Figma':                    'print',
    'Design Systems':           'print',
    'Design Tokens':            'print',
    'UI Design':                'site',
    'UX Design':                'site',
    'Motion':                   'print',
    'Responsive Design':        'print',
    'Semantic Markup':          'print',
    'Information Architecture': 'hidden',
    'Prototyping':              'hidden',
    'Accessibility':            'site',
    'Keyboard Navigation':      'print',
    'Screen Readers':           'print',
    'Adobe XD':                 'hidden',
  },

  'Web & Native': {
    'TypeScript':        'print',
    'React':             'print',
    'Electron':          'print',
    'Expo':              'print',
    'React Native':      'print',
    'Tailwind':          'print',
    'CSS':               'print',
    'CSS Modules':       'print',
    'Sass/Less':         'print',
    'Next.js':           'site',
    'Astro':             'site',
    'JavaScript':        'hidden',
    'HTML':              'hidden',
    'Styled Components': 'hidden',
    'Angular':           'hidden',
    'jQuery':            'hidden',
    'TanStack Start':    'hidden',
  },

  'State & Data Persistence': {
    'Atomic State':     'print',
    'React Context':    'print',
    'Immutable Stores': 'print',
    'Redux':            'hidden',
    'Device Storage':   'print',
    'Offline Support':  'print',
    'Sync Engines':     'print',
    'Postgres':         'print',
    'SQL':              'print',
    'Key-Value Stores': 'print',
    'Vector Databases': 'print',
    'NoSQL':            'print',
    'MongoDB':          'hidden',
    'Convex':           'site',
    'Supabase':         'site',
  },

  'Architecture & Rendering': {
    'Monorepos':                       'print',
    'Server-Side Rendering':           'print',
    'React Server Components':         'print',
    'Partial Pre-Rendering':           'print',
    'Incremental Static Regeneration': 'print',
    'Static Site Generation':          'print',
    'Web Performance':                 'hidden',
    'Vercel':                          'hidden',
    'CI/CD':                           'hidden',
    'Git':                             'hidden',
  },

  'Agentic Processes': {
    'Claude Code':             'print',
    'Codex':                   'print',
    'Agent Skills':            'print',
    'Sub-agent Orchestration': 'print',
    'Automated Testing':       'print',
    'Code Review':             'print',
  },

  'Backend & Services': {
    'Node.js':     'site',
    'REST APIs':   'site',
    'GraphQL':     'site',
    'Auth':        'site',
    'PHP':         'hidden',
    'Ruby':        'hidden',
    'Java':        'hidden',
    'Python':      'hidden',
    'Meteor':      'hidden',
    'Drupal':      'hidden',
    'React Email': 'hidden',
    'Full Stack':  'hidden',
  },

  'Product & Leadership': {
    'Product Strategy':  'site',
    'Roadmapping':       'hidden',
    'Team Leadership':   'site',
    'Mentorship':        'hidden',
    'Startup':           'site',
    'Fundraising':       'hidden',
    'Agile/Scrum':       'hidden',
    'Technical Writing': 'hidden',
    'Freelance':         'site',
    'Content Strategy':  'hidden',
    'SEO':               'hidden',
  },
} as const satisfies Record<string, Record<string, SkillVisibility>>;


export type SkillCategory = keyof typeof skillCategories;

export type SkillTag = {
  [C in SkillCategory]: keyof (typeof skillCategories)[C];
}[SkillCategory];


/** Render order for categories, and the order tags read within each. */
export const skillCategoryOrder = Object.keys(skillCategories) as SkillCategory[];


const visibilityByTag = new Map<SkillTag, SkillVisibility>(
  skillCategoryOrder.flatMap((category) =>
    Object.entries(skillCategories[category]) as [SkillTag, SkillVisibility][]),
);


export function visibilityOf(tag: SkillTag): SkillVisibility {
  return visibilityByTag.get(tag) ?? 'hidden';
}


/** True for anything the UI is allowed to render or match on. */
export function isTagVisible(tag: SkillTag): boolean {
  return visibilityOf(tag) !== 'hidden';
}


/**
 * The gate every render path runs an entry's tags through. Order is preserved,
 * so an entry still reads the way it was authored — just shorter.
 */
export function visibleTags<T extends SkillTag>(tags: readonly T[]): T[] {
  return tags.filter(isTagVisible);
}


function categoriesAtLeast(level: 'site' | 'print'): [SkillCategory, SkillTag[]][] {
  return skillCategoryOrder
    .map((category): [SkillCategory, SkillTag[]] => [
      category,
      (Object.keys(skillCategories[category]) as SkillTag[])
        .filter((tag) => level === 'print' ? visibilityOf(tag) === 'print' : isTagVisible(tag)),
    ])
    .filter(([, tags]) => tags.length > 0);
}


/** Categories and tags for the site's skills sidebar. */
export function sidebarSkillCategories(): [SkillCategory, SkillTag[]][] {
  return categoriesAtLeast('site');
}


/**
 * Categories and tags for the one-page printed résumé — the curated subset that
 * keeps it to a single page. Derived from the same record as everything else, so
 * the two can no longer drift.
 */
export function printSkillCategories(): [SkillCategory, SkillTag[]][] {
  return categoriesAtLeast('print');
}
