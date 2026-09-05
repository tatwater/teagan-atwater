import type { ResumeItem } from '@/data/resume/types';


export const projectItems: ResumeItem[] = [
  {
    id: 'project-personal-site',
    hideFromPrint: true,
    title: 'Personal Site v11',
    organizationName: '',
    logoShape: 'squircle',
    logoSrc: 'ta.png',
    dateStart: '2026-03-14',
    dateEnd: null,
    type: 'project',
    tags: ['Astro', 'React', 'TypeScript', 'Tailwind', 'Convex', 'Motion'],
    descriptionHeadline: 'This site — Astro, React, Tailwind, Convex',
    descriptionSummary:
      'My personal website, now in its eleventh iteration. Built with Astro for server rendering, React islands for interactivity, Tailwind CSS v4 for styling, and Convex as the backend. Features a command palette, dark mode, and this résumé explorer.',
    descriptionFull:
      'This site is a continuous personal project that I\'ve rebuilt from scratch more times than I can fully justify. Version 11 is built on Astro with React islands for interactive components, Tailwind CSS v4 for styling, and Convex for the backend. It features a ⌘K command palette powered by MiniSearch, a dark/light mode system, and this interactive résumé explorer. Every version of this site is an opportunity to try new tools, push my design sensibilities, and build something I\'m genuinely proud of — the eleventh time is no exception.',
    descriptionPrint:
      'Personal site (v11) built with Astro, React, Tailwind CSS v4, and Convex. Features a ⌘K command palette, dark mode, and an interactive résumé explorer.',
    // detailLabel: 'Learn more',
  },
  {
    // Gli is too early to stand as a résumé entry, so `hidden` keeps it off both
    // the interactive résumé and the printed page. It lives here anyway because
    // the home page reel resolves its entries out of the résumé data by id — see
    // src/data/highlights.ts, which reads hidden entries deliberately. Drop the
    // flag once there is real copy and the work can speak for itself.
    id: 'project-gli',
    hidden: true,
    title: 'Gli',
    organizationName: 'Gli',
    logoShape: 'squircle',
    // TODO: add gli.* to src/assets/logos/ and set logoSrc.
    dateStart: '2026-07',
    dateEnd: null,
    type: 'project',
    tags: ['TypeScript', 'React', 'React Native', 'Expo', 'Postgres', 'Tailwind', 'Design Systems'],
    descriptionHeadline: 'An ice conditions reporting platform for the Nordic / wild ice skating community',
    // TODO: real copy. Nothing below is written yet; the home page shows the
    // headline above and the mockups, and needs none of these.
    descriptionSummary: '',
    descriptionFull: '',
    // detailLabel: 'Learn more',
  },
  {
    id: 'project-sous',
    title: 'Sous',
    organizationName: 'Sous',
    logoShape: 'squircle',
    logoSrc: 'sous.svg',
    dateStart: '2020-06',
    dateEnd: '2024-01',
    type: 'project',
    tags: ['TypeScript', 'Next.js', 'Supabase', 'Styled Components', 'Tailwind', 'Electron', 'Expo', 'Figma', 'Full Stack', 'Product Strategy'],
    descriptionHeadline: 'Founded and solo-built a social platform for home cooking',
    descriptionSummary: 'Designed and built a social platform for home cooking, including a git-style data model for branching/forking recipes, a canonical ingredient database, a web scraping and normalization pipeline, and a live \u201cplayer\u201d experience to help users prepare multiple dishes at once',
    descriptionFull:
      'Sous was a social platform for home cooking that I designed and built entirely on my own over three and a half years. I took it on deliberately: I wanted to own the full stack rather than a slice of it, and a real product with real complexity was the only way to learn that honestly.\n\nThe interesting problems were in the data. Recipes want to be forked and adapted, so I built a git-style data model for branching them, backed by a canonical ingredient database and a scraping and normalization pipeline to get messy recipes from the web into a consistent shape. On top of that sat a live \u201cplayer\u201d experience that walks a cook through preparing multiple dishes at once, which turns out to be a scheduling problem as much as an interface one.\n\nAlong the way I taught myself TypeScript, Postgres, auth, Tailwind, Electron, modern rendering strategies, and Figma. That self-directed foundation is exactly what I brought with me to The New Money Company.',
    descriptionPrint:
      'Designed and built a social platform for home cooking solo: a git-style data model for branching recipes, a canonical ingredient database, a scraping and normalization pipeline, and a live \u201cplayer\u201d guiding a cook through several dishes at once.',
    // detailLabel: 'Learn more',
  },
  {
    // Shelved for now, data kept — drop `hidden` and restore its row in the
    // pandemic card's subCards to bring it back.
    id: 'project-westgate',
    hidden: true,
    hideFromPrint: true,
    title: 'Westgate House',
    organizationName: 'Westgate House',
    logoShape: 'squircle',
    logoSrc: 'westgate.jpg',
    dateStart: '2020-06',
    dateEnd: '2023-12',
    type: 'project',
    tags: ['UI Design', 'UX Design', 'Product Strategy', 'Information Architecture'],
    descriptionHeadline: 'Designed and renovated a century-old New Hampshire house as a family project',
    descriptionSummary:
      'A full gut renovation of a century-old property in Plainfield, NH, undertaken as a family creative project during the pandemic years. Involved design, planning, and hands-on construction work from concept through completion.',
    descriptionFull:
      'The Westgate House was a deeply personal project: a century-old New Hampshire property that my family took on as a shared renovation during the pandemic. We approached it like a design project — stripping it back to the bones, rethinking the layout and circulation, and rebuilding with intention. I was involved from early planning through finish work, learning an enormous amount about physical construction, project management, and what it means to design a space people actually live in. The project ran for several years and remains one of the most satisfying things I\'ve been part of.',
    // detailLabel: 'Learn more',
  },
  {
    // Shelved for now, data kept — drop `hidden` and restore its row in the
    // pandemic card's subCards to bring it back.
    id: 'project-opengate',
    title: 'OpenGate Wellness',
    organizationName: 'OpenGate Wellness',
    logoShape: 'squircle',
    logoSrc: 'opengate.png',
    dateStart: '2023-10',
    dateEnd: '2023-12',
    type: 'project',
    hidden: true,
    tags: [],
    descriptionHeadline: 'Designed a brand & logo for a friend starting his health & wellness coaching business',
    descriptionSummary: '',
    descriptionFull: '',
    // detailLabel: 'Learn more',
  },
  {
    id: 'project-car-app',
    hideFromPrint: true,
    title: 'Personal Car App / Gas Tracker',
    organizationName: '',
    logoShape: 'squircle',
    logoSrc: 'outback.png',
    dateStart: '2025-08',
    dateEnd: null,
    type: 'project',
    tags: ['Product Strategy', 'Full Stack', 'React', 'TypeScript', 'Node.js', 'UI Design', 'UX Design'],
    descriptionHeadline: 'A lifetime cost-of-ownership tracker for personal vehicles',
    descriptionSummary:
      'Description coming soon',
    descriptionFull:
      'Coming soon',
    descriptionPrint:
      'Coming soon',
    // detailLabel: 'Learn more',
  },
];
