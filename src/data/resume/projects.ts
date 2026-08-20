import type { ResumeItem } from '@/data/resume/types';


export const projectItems: ResumeItem[] = [
  {
    id: 'project-personal-site',
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
    id: 'project-sous',
    title: 'Sous',
    organizationName: 'Sous',
    logoShape: 'squircle',
    logoSrc: 'sous.svg',
    dateStart: '2020-06',
    dateEnd: '2024-01',
    type: 'project',
    tags: ['Startup', 'Product Strategy', 'Full Stack', 'React', 'TypeScript', 'Node.js', 'Roadmapping', 'UI Design', 'UX Design'],
    descriptionHeadline: 'Solo-founded a consumer app startup (part-time, 3.5 yrs)',
    descriptionSummary:
      'Solo founded Sous, a consumer product startup, and took it from idea to working product over three-plus years. Wore every hat — product, engineering, design, and early business development.',
    descriptionFull:
      'Sous was a consumer app startup I founded and ran solo on a part-time basis for three and a half years. Starting from scratch, I defined the product vision, conducted user research, designed the UX and visual identity, and built the full-stack application myself. Running a solo startup sharpened my product instincts enormously — every decision had direct consequences. I navigated the full arc from idea validation through working product, including early conversations with investors and the humbling reality of finding product-market fit. The experience made me a significantly better engineer, designer, and thinker about what products are actually for.',
    descriptionPrint:
      'Solo founded a consumer app startup. Owned product vision, UX design, and full-stack engineering across a 3.5-year arc from zero to working product.',
    // detailLabel: 'Learn more',
  },
  {
    id: 'project-westgate',
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
    title: 'Car App / Gas Tracker',
    organizationName: '',
    logoShape: 'squircle',
    logoSrc: 'outback.png',
    dateStart: '2025-08',
    dateEnd: null,
    type: 'project',
    tags: ['Product Strategy', 'Full Stack', 'React', 'TypeScript', 'Node.js', 'UI Design', 'UX Design'],
    descriptionHeadline: 'Car App / Gas Tracker',
    descriptionSummary:
      'Description coming soon',
    descriptionFull:
      'Coming soon',
    descriptionPrint:
      'Coming soon',
    // detailLabel: 'Learn more',
  },
];
