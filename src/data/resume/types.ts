
export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'Data / Infra'
  | 'Design'
  | 'Product / Leadership'
  | 'Misc'
;

export type SkillTag =
  // Frontend
  | 'React' | 'TypeScript' | 'JavaScript' | 'HTML' | 'CSS' | 'Tailwind' | 'Motion' | 'Next.js'
  | 'Astro' | 'Angular' | 'Styled Components' | 'Sass/Less'
  // Backend
  | 'Node.js' | 'Ruby' | 'PHP' | 'Java' | 'Python' | 'REST APIs' | 'GraphQL' | 'Auth'
  // Data / Infra
  | 'MongoDB' | 'PostgreSQL' | 'Convex' | 'Vercel' | 'Git' | 'CI/CD' | 'React Email'
  // Design
  | 'UI Design' | 'UX Design' | 'Figma' | 'Adobe XD' | 'Design Systems' | 'Responsive Design'
  | 'Information Architecture' | 'Prototyping'
  // Product / Leadership
  | 'Product Strategy' | 'Agile/Scrum' | 'Team Leadership' | 'Mentorship' | 'Startup'
  | 'Fundraising' | 'Roadmapping' | 'Technical Writing'
  // Misc
  | 'Full Stack' | 'Web Performance' | 'Accessibility' | 'SEO' | 'Content Strategy' | 'Freelance'
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
  hideDates?: boolean;
  location?: string;
  logoShape?: 'circle' | 'square' | 'squircle';
  logoSrc?: string;  // Path relative to src/assets/logos/
  organizationUrl?: string;
  subCards?: SubCard[];  // Rendered inside a variant='pandemic' card
  variant?: 'pandemic';
}
