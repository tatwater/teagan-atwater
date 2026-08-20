import type { ResumeItem } from '@/data/resume/types';
import type { Verbosity } from '@/islands/resume/types';

import { faBuilding, faFolder, faGraduationCap, faEllipsisStroke, faGrip, faGrid } from '@fortawesome/sharp-regular-svg-icons';


export const SECTION_BAR: Record<ResumeItem['type'], string> = {
  education: 'bg-chart-2',
  experience: 'bg-chart-4',
  project: 'bg-chart-3',
};

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

export const VERBOSITY_OPTIONS: {
  icon: typeof faEllipsisStroke;
  label: string;
  value: Verbosity;
}[] = [
  { icon: faEllipsisStroke, label: 'Headline', value: 'headline' },
  { icon: faGrip,           label: 'Summary',   value: 'summary' },
  { icon: faGrid,           label: 'Detail',      value: 'detail' },
];
