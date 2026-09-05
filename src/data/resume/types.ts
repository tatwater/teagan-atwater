/**
 * Item shapes for résumé entries. The skill taxonomy itself — which tags exist,
 * how they group, and where each is allowed to render — lives in
 * `@/data/resume/skills`, which derives these two types from the vocabulary so
 * a tag is only ever declared once. They are re-exported here so entry files
 * keep importing everything about an item from one place.
 */
import type { SkillCategory, SkillTag, SkillVisibility } from '@/data/resume/skills';

export type { SkillCategory, SkillTag, SkillVisibility };


/**
 * A labeled run of bullets — the "Built" / "Impact" split the printed résumé
 * uses to break a long entry into sections a reader can scan.
 */
export interface DescriptionBulletGroup {
  bullets: string[];
  label: string;
}

/** One entry in a bulleted body: a plain bullet, or a labeled run of them. */
export type DescriptionBlock = string | DescriptionBulletGroup;

/**
 * The body of a description. A string renders as prose — blank lines separate
 * paragraphs — and an array renders as a bulleted list. Consecutive plain
 * bullets share one list; each labeled group gets its own heading and list.
 */
export type DescriptionBody = string | DescriptionBlock[];

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
  descriptionSummary: DescriptionBody;  // Short prose, or the entry's bullets
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
