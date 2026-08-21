/**
 * Item shapes for résumé entries. The skill taxonomy itself — which tags exist,
 * how they group, and where each is allowed to render — lives in
 * `@/data/resume/skills`, which derives these two types from the vocabulary so
 * a tag is only ever declared once. They are re-exported here so entry files
 * keep importing everything about an item from one place.
 */
import type { SkillCategory, SkillTag, SkillVisibility } from '@/data/resume/skills';

export type { SkillCategory, SkillTag, SkillVisibility };


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
