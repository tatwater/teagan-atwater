import type { ResumeItem } from '@/data/resume/types';
import type { Verbosity } from '@/islands/resume/types';

import { faBuilding, faFolder, faGraduationCap, faEllipsisStroke, faGrip, faGrid } from '@fortawesome/sharp-regular-svg-icons';


export const SECTION_COLOR: Record<ResumeItem['type'], string> = {
  education: 'text-emerald-800',
  experience: 'text-emerald-800',
  project: 'text-emerald-800',
};

export const SECTION_ICON = {
  education: faGraduationCap,
  experience: faBuilding,
  project: faFolder,
};

export const SECTION_LABEL: Record<ResumeItem['type'], string> = {
  education: 'Education',
  experience: 'Experience',
  project: 'Projects',
};

type VerbosityOption = {
  icon: typeof faEllipsisStroke;
  label: string;
  value: Verbosity;
};

const ALL_VERBOSITY_OPTIONS: VerbosityOption[] = [
  { icon: faEllipsisStroke, label: 'Headline', value: 'headline' },
  { icon: faGrip,           label: 'Summary',   value: 'summary' },
  { icon: faGrid,           label: 'Detail',      value: 'detail' },
];

/**
 * Densities the toolbar doesn't offer. 'detail' is shelved as a button but the
 * density itself is intact: a search whose only hit lives in `descriptionFull`
 * still bumps that one card to it (see resolveVerbosity in
 * src/islands/resume/highlight.tsx). Empty this list to bring the button back.
 */
const HIDDEN_VERBOSITIES: Verbosity[] = ['detail'];

export const VERBOSITY_OPTIONS: VerbosityOption[] =
  ALL_VERBOSITY_OPTIONS.filter(({ value }) => !HIDDEN_VERBOSITIES.includes(value));
