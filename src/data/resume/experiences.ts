import type { ResumeItem } from '@/data/resume/types';


export const experienceItems: ResumeItem[] = [
  {
    id: 'nmc-swe',
    title: 'Founding Software Engineer',
    organizationName: 'The New Money Company',
    organizationUrl: 'https://newmoneycompany.com/',
    logoShape: 'squircle',
    logoSrc: 'nmc.png',
    location: 'San Francisco, CA · Remote',
    // The contract engagement that opened this role is folded in rather than
    // split out: one entry, dated from the January 2024 start, the way the
    // printed résumé states it.
    dateStart: '2024-01',
    dateEnd: null,
    type: 'experience',
    tags: ['TypeScript', 'React', 'Tailwind', 'Electron', 'PHP', 'Postgres', 'Design Systems', 'Monorepos', 'Full Stack', 'Startup'],
    descriptionHeadline: 'Employee #1 and sole frontend owner at a YC W24 fintech',
    descriptionSummary:
      'Employee #1 at a four-person fintech and its only frontend engineer, building every user interface on a shared design system — six production web apps and several internal dashboards serving 1,000+ users. The products I build process $250K+/month in transaction volume.',
    descriptionFull:
      'I am employee #1 and the sole frontend engineer at The New Money Company, a four-person Y Combinator W24 fintech. I started on contract in January 2024, established the front-end patterns the team still works in, and came on full-time a few months later. Every user interface at the company is mine, built on a shared design system that keeps six production web apps and several internal dashboards — serving over a thousand users — visually consistent.\n\nThe work has ranged widely. I rebranded and rebuilt the UI of an acquired marketplace codebase, closing gaps in the inherited experience before we scaled it, and wrote the email dispatcher lambda behind our match alerts. I also built a native Electron email client with built-in AI chat, so sales reps can manage marketplace matches and trades inside their own networks.\n\nBeyond the interfaces, I set all of the frontend architecture: the monorepo structure, the boundaries between apps and shared packages, and the refactor roadmap we use to manage technical debt and centralize shared logic. At a company this size the useful instinct is to unblock yourself, so I have written SQL and PHP for endpoints and PDF templates that did not exist yet, and shipped ahead of design when a launch depended on it. As agentic tooling matured I folded it into daily delivery and code review.',
    descriptionPrint:
      'Employee #1 and sole frontend engineer at a four-person YC W24 fintech. Built every interface across 6 production web apps and internal dashboards serving 1,000+ users, set all frontend architecture, and shipped a native Electron client. Products I built process $250K+/month in transaction volume.',
    detailLabel: 'Learn more',
    detailId: 'nmc',
  },
  {
    // Shelved for now, data kept — drop `hidden` to bring the card back. Its
    // sub-cards are commented out below and come back separately.
    id: 'pandemic',
    hidden: true,
    title: 'COVID-19 Pandemic',
    organizationName: '',
    location: 'New Hampshire',
    dateStart: '2020-04',
    dateEnd: '2024-12',
    type: 'experience',
    variant: 'pandemic',
    hideDates: true,
    // Tags are intentionally empty — visibility is derived from sub-card tags
    tags: [],
    descriptionHeadline: 'A period of building, making, and staying grounded.',
    descriptionSummary:
      'The pandemic became an unlikely creative window. I built Sous, a consumer app, from idea to product. My family gutted and renovated a century-old house in New Hampshire. Eventually after the world re-opened, I started picking up shifts serving and bartending at Worthy Kitchen. Throughout, I stayed active outdoors — skiing, cycling, running — and took my health seriously.',
    descriptionFull:
      'The pandemic years were disorienting for everyone, but they turned into a strangely generative stretch for me. I\'d already been working on Sous — a consumer app I was building solo — but the sudden stillness gave the project real room to breathe. I went deep on product, design, and engineering in parallel, building something I was genuinely proud of over three-plus years.\n\nAt the same time, my family took on an ambitious renovation: The Westgate House, a century-old New Hampshire property that we designed and rebuilt largely from scratch as a shared project. It was equal parts creative exercise and logistical grind — and one of the most hands-on, satisfying things I\'ve ever done.\n\nI also spent time behind the bar at Worthy Kitchen in Woodstock, Vermont, which turned out to be a grounding and surprisingly fun chapter. And I leaned hard into the outdoors — skiing, cycling, running — making physical health a genuine priority for the first time.',
    // Commented-out rows are shelved rather than gone — each one's entry still
    // carries its write-up and a matching `hidden` flag. Uncomment a row and
    // clear that flag to bring it back.
    subCards: [
      { id: 'project-sous', primary: true },
      // { id: 'project-westgate', primary: true },
      // { id: 'project-opengate', primary: true },
      { id: 'oho-react-contract', primary: true },
      // { id: 'worthy-kitchen', primary: false },
    ],
  },
  {
    id: 'worthy-kitchen',
    title: 'Server & Bartender',
    organizationName: 'Worthy Kitchen',
    organizationUrl: 'https://www.worthykitchen.com/',
    logoShape: 'circle',
    logoSrc: 'worthy.webp',
    location: 'Woodstock, VT',
    dateStart: '2022-01',
    dateEnd: '2024-01',
    type: 'experience',
    hidden: true,
    tags: ['Freelance'],
    descriptionHeadline: 'Served and bartended at Worthy Kitchen in Woodstock, VT',
    descriptionSummary:
      'Worked as a server and bartender at Worthy Kitchen, a beloved gastropub in Woodstock, Vermont. A grounding re-entry into the physical world after years of solo remote work.',
    descriptionFull:
      'Worthy Kitchen in Woodstock, Vermont is the kind of place where regulars feel at home and the energy behind the bar is genuinely fun. I joined the team as a server and eventually moved behind the bar — learning craft beer and cocktail service, staying sharp in a fast-paced environment, and rediscovering the pleasure of face-to-face work after years of building things alone at a computer. It was a grounding chapter that I look back on with real fondness.',
    // detailLabel: 'Learn more',
  },
  {
    id: 'oho-react-contract',
    title: 'Frontend Engineer (Contract)',
    organizationName: 'OHO Interactive',
    organizationUrl: 'https://oho.com',
    logoShape: 'squircle',
    logoSrc: 'oho.jpeg',
    location: 'Somerville, MA · Remote',
    dateStart: '2023-01',
    dateEnd: '2023-03',
    type: 'experience',
    groupKey: 'oho',
    tags: ['React', 'TypeScript', 'Design Systems', 'Freelance'],
    descriptionHeadline: 'Returned to OHO to help modernize their component library',
    descriptionSummary:
      'Came back to OHO Interactive on contract to help the team adopt React and TypeScript, building toward a better developer experience in their reusable frontend component library.',
    descriptionFull:
      'Years after my last stint at OHO Interactive, the team brought me back on contract to help them move their reusable frontend component library toward React and TypeScript. The goal was a more modern developer experience for the engineers building client sites on top of it — typed, composable components in place of patterns the agency had outgrown. It was a satisfying return: the same studio, the same standards, a decade of my own experience to bring to it.',
    descriptionPrint:
      'Contract engagement helping the agency adopt React and TypeScript in their reusable frontend component library.',
    // detailLabel: 'Learn more',
  },
  {
    id: 'osler-cto',
    title: 'Co-founder',
    organizationName: 'ScopeAI (now EMRLD)',
    organizationUrl: 'https://emrld.health/',
    location: 'Hanover, NH',
    logoShape: 'squircle',
    logoSrc: 'scope.png',
    dateStart: '2018-12',
    dateEnd: '2020-04',
    type: 'experience',
    tags: ['Startup', 'Team Leadership', 'Product Strategy', 'Next.js', 'Redux', 'GraphQL', 'MongoDB', 'Styled Components', 'Adobe XD', 'UI Design'],
    descriptionHeadline: 'Co-founded a clinical software startup and led its design and engineering',
    descriptionSummary:
      'Co-founded ScopeAI and built an interactive electronic medical record demo for primary care doctors, mapping exams and diagnoses onto a representative patient avatar. Hired and managed a team of eight, and led the company rebrand to Osler.',
    descriptionFull:
      'ScopeAI — later Osler, and now EMRLD — was a clinical software startup I co-founded in Hanover, New Hampshire. Our product was an interactive electronic medical record demo built for primary care doctors: a heavily structured data model that mapped exams and diagnoses onto a representative patient avatar, iterated toward an MVP alongside practicing clinicians.\n\nElectronic medical records are an entrenched market, so we made great design our competitive advantage. I did that work in Adobe XD, and in my final months led a full company rebrand to Osler, covering naming, identity, and UI.\n\nI also hired and managed a team of eight: another full-time design engineer, two backend engineering interns, and five data interns. The avatar-driven diagnostic tool I architected outlived my tenure — it is the company\'s core product today, used for medical education and training.',
    descriptionPrint:
      'Co-founded a clinical software startup. Architected an avatar-driven EMR demo iterated with practicing clinicians, made design the competitive advantage in an entrenched market, and hired and managed a team of eight. The tool is the company\'s core product today.',
    // detailLabel: 'Learn more',
  },
  {
    id: 'fiber-cto',
    title: 'Co-founder',
    organizationName: 'Fiber',
    logoShape: 'squircle',
    logoSrc: 'fiber.jpeg',
    location: 'Somerville, MA',
    dateStart: '2017-07',
    dateEnd: '2018-09',
    type: 'experience',
    tags: ['Startup', 'Team Leadership', 'Product Strategy', 'Meteor', 'MongoDB', 'React', 'Node.js', 'Full Stack'],
    descriptionHeadline: 'Co-founded Fiber and built its products end to end',
    descriptionSummary:
      'Co-founded Fiber and built two Meteor/MERN applications as the business evolved — a video-centric education platform and a data analytics dashboard — plus a Gatsby marketing site. Defined the target market and scope, and hired the company\'s first engineer.',
    descriptionFull:
      'Fiber was a startup I co-founded in Somerville, Massachusetts. As the business found its shape I built two Meteor/MERN applications to match it: first a video-centric education platform, then a data analytics dashboard, alongside a Gatsby marketing site.\n\nMy work was not only technical. I helped define the target market and scope the product, iterating closely with design to decide what was worth building. I also interviewed and hired the company\'s first engineer. Fiber was the first time I owned both what to build and how to build it, and it shaped how I think about the relationship between the two.',
    descriptionPrint:
      'Co-founded Fiber. Built two Meteor/MERN apps as the business evolved — a video-centric education platform and a data analytics dashboard — plus a Gatsby marketing site. Defined target market and scope, and hired the first engineer.',
    // detailLabel: 'Learn more',
  },
  {
    id: 'oho-fullstack',
    title: 'Frontend Engineer',
    organizationName: 'OHO Interactive',
    organizationUrl: 'https://oho.com',
    logoShape: 'squircle',
    logoSrc: 'oho.jpeg',
    location: 'Somerville, MA',
    dateStart: '2017-01',
    dateEnd: '2017-06',
    type: 'experience',
    groupKey: 'oho',
    tags: ['Drupal', 'PHP', 'jQuery', 'JavaScript', 'HTML', 'CSS', 'Responsive Design', 'Agile/Scrum'],
    descriptionHeadline: 'Joined a Boston digital agency full-time after graduation',
    descriptionSummary:
      'Worked across teams at OHO Interactive to build and ship large-scale Drupal PHP/jQuery sites for the agency\'s clients, having first arrived there as an intern and then on contract.',
    descriptionFull:
      'OHO Interactive is a Boston digital agency I kept returning to — first as an intern, then on contract, and after graduation as a full-time engineer. In this role I worked across teams to build and ship large-scale Drupal sites in PHP and jQuery, the kind of projects where the content model matters as much as the interface.\n\nAgency work meant several clients at once, each with its own requirements and expectations, and OHO held high standards for code quality alongside a genuinely collaborative culture. It is where I learned the craft of shipping client work in production, and the reason I came back twice more.',
    descriptionPrint:
      'Worked across teams to build and ship large-scale Drupal PHP/jQuery sites for a Boston digital agency, first as an intern, then on contract, then full-time after graduation.',
    // detailLabel: 'Learn more',
  },
  {
    id: 'shadow-art-founder',
    title: 'Founder',
    organizationName: 'Shadow Art Studios',
    logoShape: 'squircle',
    logoSrc: 'shadow-art.png',
    location: 'Remote',
    dateStart: '2011-08',
    dateEnd: '2016-08',
    type: 'experience',
    tags: ['Freelance', 'Full Stack', 'UI Design', 'UX Design', 'HTML', 'CSS', 'JavaScript', 'Content Strategy', 'Responsive Design'],
    descriptionHeadline: 'Ran a freelance web design & development studio for 5 years',
    descriptionSummary:
      'Founded and operated Shadow Art Studios, a freelance web design and development practice. Worked directly with clients to assess needs, design custom websites, and manage projects from scoping through launch.',
    descriptionFull:
      'Shadow Art Studios was my freelance web design and development practice, which I ran for five years starting in 2011. I worked directly with small businesses and individuals to understand their needs, design custom websites, and build and launch them end-to-end. Running my own studio meant I had to be good at everything: client communication, project scoping and budgeting, design, front-end and back-end development, and quality assurance. It was a formative period that gave me a broad, practical foundation across the full web stack and taught me how to run a client services business with integrity.',
    descriptionPrint:
      'Operated a freelance web design and development studio — handled client communication, scoping, design, and full-stack development end-to-end.',
    // detailLabel: 'Learn more',
  },
  {
    id: 'oho-freelance',
    title: 'Freelance Web Developer',
    organizationName: 'OHO Interactive',
    organizationUrl: 'https://oho.com',
    logoShape: 'squircle',
    logoSrc: 'oho.jpeg',
    location: 'Cambridge, MA',
    dateStart: '2014-12',
    dateEnd: '2015-01',
    type: 'experience',
    groupKey: 'oho',
    // Deliberately blank, the way Northfield Mount Hermon is in education.ts: a
    // one-month engagement from a decade ago earns a line on the timeline and
    // nothing more. Empty descriptions render no paragraph at any verbosity, and
    // no tags keeps it out of skill filtering and search results.
    tags: [],
    descriptionHeadline: '',
    descriptionSummary: '',
    descriptionFull: '',
    // detailLabel: 'Learn more',
  },
];
