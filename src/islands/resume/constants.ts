import type { ResumeItem } from '@/data/resume/types';
import type { Verbosity } from '@/islands/resume/types';

import { faArrowDownShortWide, faBuilding, faFolder, faGraduationCap } from '@fortawesome/sharp-regular-svg-icons';


/** The merged experience-and-projects list shown while a skill tag is active. */
export const SORTED_SECTION_ICON = faArrowDownShortWide;
export const SORTED_SECTION_LABEL = 'Experience & Projects';


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
  label: string;
  value: Verbosity;
};

const ALL_VERBOSITY_OPTIONS: VerbosityOption[] = [
  { label: 'Headline', value: 'headline' },
  { label: 'Summary',  value: 'summary' },
  { label: 'Detail',   value: 'detail' },
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
