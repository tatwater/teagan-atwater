/**
 * Skill taxonomy follows the printed résumé's grouping. The five categories the
 * résumé itself shows come first; the last two hold the parts of Teagan's
 * history the one-page résumé leaves out but the site still tags entries with.
 */
export type SkillCategory =
  | 'Craft & Design'
  | 'Web & Native'
  | 'State & Data Persistence'
  | 'Architecture & Rendering'
  | 'Agentic Processes'
  | 'Backend & Services'
  | 'Product & Leadership'
;

export type SkillTag =
  // Craft & Design
  | 'Figma' | 'Adobe XD' | 'Design Systems' | 'Design Tokens' | 'UI Design' | 'UX Design'
  | 'Motion' | 'Responsive Design' | 'Semantic Markup' | 'Information Architecture'
  | 'Prototyping' | 'Accessibility' | 'Keyboard Navigation' | 'Screen Readers'
  // Web & Native
  | 'TypeScript' | 'React' | 'JavaScript' | 'HTML' | 'CSS' | 'CSS Modules' | 'Sass/Less'
  | 'Styled Components' | 'Tailwind' | 'Electron' | 'Expo' | 'React Native' | 'Next.js'
  | 'Astro' | 'Angular' | 'jQuery'
  // State & Data Persistence
  | 'Atomic State' | 'React Context' | 'Immutable Stores' | 'Redux' | 'Device Storage'
  | 'Offline Support' | 'Sync Engines' | 'Postgres' | 'SQL' | 'MongoDB' | 'NoSQL'
  | 'Key-Value Stores' | 'Vector Databases' | 'Convex' | 'Supabase'
  // Architecture & Rendering
  | 'Monorepos' | 'Server-Side Rendering' | 'React Server Components' | 'Partial Pre-Rendering'
  | 'Incremental Static Regeneration' | 'Static Site Generation' | 'Web Performance'
  | 'Vercel' | 'CI/CD' | 'Git'
  // Agentic Processes
  | 'Claude Code' | 'Codex' | 'Agent Skills' | 'Sub-agent Orchestration' | 'Automated Testing'
  | 'Code Review'
  // Backend & Services
  | 'Node.js' | 'REST APIs' | 'GraphQL' | 'Auth' | 'PHP' | 'Ruby' | 'Java' | 'Python'
  | 'Meteor' | 'Drupal' | 'React Email' | 'Full Stack'
  // Product & Leadership
  | 'Product Strategy' | 'Roadmapping' | 'Team Leadership' | 'Mentorship' | 'Startup'
  | 'Fundraising' | 'Agile/Scrum' | 'Technical Writing' | 'Freelance' | 'Content Strategy'
  | 'SEO'
;

export interface OrgGroup {
  key: string;
  dateEnd: string | null;
  dateStart: string;
  items: ResumeItem[];
  organizationName: string;
  tags: SkillTag[];
  logoShape?: 'circle' | 'square' | 'squircle';
  logoSrc?: string;
  organizationUrl?: string;
}

export interface SubCard {
  id: string;  // id of a ResumeItem
  primary: boolean;
}

export interface ResumeItem {
  id: string;
  dateEnd: string | null;  // null = Present
  dateStart: string;
  descriptionFull: string;  // Full paragraph
  descriptionHeadline: string;  // One-liner
  descriptionSummary: string;  // 1–2 sentence description
  organizationName: string;
  tags: SkillTag[];
  title: string;
  type: 'experience' | 'education' | 'project';
  descriptionPrint?: string;
  detailId?: string;  // Override URL slug: `/resume/{detailId}` instead of `/resume/{id}`
  detailLabel?: string;  // When present, a button with this text linking to /resume/{id} will be shown; omit to hide entirely
  groupKey?: string;
  hidden?: boolean;  // Hide from resume list but still generate a /resume/{id} page
  hideFromPrint?: boolean;  // Keep on the site, omit from the print-friendly resume
  hideDates?: boolean;
  location?: string;
  logoShape?: 'circle' | 'square' | 'squircle';
  logoSrc?: string;  // Path relative to src/assets/logos/
  organizationUrl?: string;
  subCards?: SubCard[];  // Rendered inside a variant='pandemic' card
  variant?: 'pandemic';
}
