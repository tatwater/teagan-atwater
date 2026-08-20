import type { ResumeItem } from '@/data/resume/types';


export type SectionFilter = 'all' | 'education' | 'experience' | 'project';
export type Verbosity = 'detail' | 'headline' | 'summary';
export type ViewMode = 'chronological' | 'grouped';

export type ResumeSearchDoc = Omit<ResumeItem, 'tags'> & {
  tags: string;
};
