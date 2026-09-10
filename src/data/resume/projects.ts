import type { ResumeItem } from '@/data/resume/types';


export const projectItems: ResumeItem[] = [
  {
    id: 'project-gli',
    title: 'Gli',
    organizationName: 'Gli',
    logoShape: 'squircle',
    logoSrc: 'gli.png',
    dateStart: '2026-07',
    dateEnd: null,
    type: 'project',
    tags: ['TypeScript', 'React', 'React Native', 'Expo', 'Postgres', 'Tailwind', 'Design Systems', 'Figma', 'Design Tokens', 'Motion', 'Responsive Design', 'Semantic Markup', 'UI Design', 'UX Design', 'Accessibility', 'Information Architecture', 'Prototyping', 'Vitest', 'CSS', 'TanStack Start', 'Vite', 'Device Storage', 'Offline Support', 'Sync Engines', 'Key-Value Stores', 'React Context', 'Convex', 'Monorepos', 'Vercel', 'CI/CD', 'Git', 'HITL Engineering', 'Agent Skills', 'Sub-agent Orchestration', 'Automated Guardrails', 'Continuous Verification', 'Claude Code', 'Automated Testing', 'Code Review', 'Node.js', 'Auth', 'Python', 'React Email', 'Full Stack', 'Product Strategy', 'Roadmapping'],
    descriptionHeadline: 'An ice conditions reporting platform for the Nordic / wild ice skating community',
    descriptionSummary: 'Designed and built a conditions reporting platform for wild ice skaters, with a lake corpus merged from 15 public catalogs into 25,000 provenance-carrying records, a satellite pipeline pairing optical & radar passes into a scrubbable timeline, an on-device hazard alert engine that projects a skater’s course and fires with no cell signal, and a weather-driven confidence model aging every report & hazard without claiming safety',
    descriptionFull: '',
    // detailLabel: 'Learn more',
  },
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
    tags: ['Astro', 'React', 'TypeScript', 'Tailwind', 'Convex', 'Motion', 'Figma', 'Design Systems', 'Design Tokens', 'Responsive Design', 'Semantic Markup', 'Keyboard Navigation', 'UI Design', 'UX Design', 'Accessibility', 'Information Architecture', 'Vitest', 'CSS', 'Vite', 'Postgres', 'Static Site Generation', 'Web Performance', 'Vercel', 'CI/CD', 'Git', 'HITL Engineering', 'Agent Skills', 'Sub-agent Orchestration', 'Automated Guardrails', 'Continuous Verification', 'Claude Code', 'Automated Testing', 'Code Review', 'Node.js', 'Auth', 'React Email', 'Full Stack', 'Product Strategy', 'Roadmapping'],
    descriptionHeadline: 'This site — Astro, React, Tailwind, Convex',
    descriptionSummary:
      'My personal website, now in its eleventh iteration. Built with Astro for server rendering, React islands for interactivity, Tailwind CSS v4 for styling, and Convex as the backend. Features a command palette, dark mode, and this résumé explorer',
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
    tags: ['TypeScript', 'Next.js', 'Supabase', 'Styled Components', 'Tailwind', 'Electron', 'Figma', 'Full Stack', 'Product Strategy', 'Design Systems', 'Design Tokens', 'Responsive Design', 'Semantic Markup', 'UI Design', 'UX Design', 'Accessibility', 'Information Architecture', 'Prototyping', 'React', 'Vitest', 'CSS', 'CSS Modules', 'TanStack Start', 'Vite', 'Immutable Stores', 'Device Storage', 'Postgres', 'React Context', 'Redux', 'Convex', 'Monorepos', 'Server-Side Rendering', 'React Server Components', 'Vercel', 'CI/CD', 'Git', 'HITL Engineering', 'Automated Guardrails', 'Sub-agent Orchestration', 'Continuous Verification', 'Claude Code', 'Code Review', 'Node.js', 'Auth', 'React Email', 'Roadmapping'],
    descriptionHeadline: 'Founded and solo-built a social platform for home cooking',
    descriptionSummary: 'Designed and built a social platform for home cooking, including a git-style data model for branching/forking recipes, a canonical ingredient database, a web scraping and normalization pipeline using LLM calls for structured enrichment of ingredients and steps, and a live “player” experience to help users prepare multiple dishes at once',
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
    tags: ['UX Design', 'Accessibility', 'Content Strategy', 'Product Strategy', 'Prototyping'],
    descriptionHeadline: 'Designed and renovated a century-old New Hampshire house as a family project',
    descriptionSummary:
      'A full gut renovation of a century-old property in Plainfield, NH, undertaken as a family creative project during the pandemic years. Involved design, planning, and hands-on construction work from concept through completion',
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
    tags: ['Figma', 'Freelance'],
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
    tags: ['Product Strategy', 'Full Stack', 'React', 'TypeScript', 'UI Design', 'UX Design', 'Figma', 'Design Systems', 'Design Tokens', 'Responsive Design', 'Semantic Markup', 'Information Architecture', 'Prototyping', 'Tailwind', 'Vitest', 'CSS', 'TanStack Start', 'Vite', 'Device Storage', 'Offline Support', 'Sync Engines', 'Postgres', 'React Context', 'Convex', 'Monorepos', 'Vercel', 'CI/CD', 'Git', 'HITL Engineering', 'Automated Guardrails', 'Sub-agent Orchestration', 'Continuous Verification', 'Claude Code', 'Code Review', 'Node.js', 'Auth', 'React Email', 'Roadmapping'],
    descriptionHeadline: 'A lifetime cost-of-ownership tracker for personal vehicles',
    descriptionSummary:
      'Designed and built a vehicle ownership journal and cost tracker across native mobile and web, including a full-tank fuel-economy engine that computes MPG across partial fills and corrections, a cash-basis ownership accounting model separating acquisition price from financing cash flow, and a two-axis permission system that lets people share a car\'s history with a partner or friend without exposing what they paid for it',
    descriptionFull:
      'Coming soon',
    descriptionPrint:
      'Coming soon',
    // detailLabel: 'Learn more',
  },
];
