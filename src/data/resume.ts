import type { ResumeItem } from '@/data/resume/types';

import { educationItems } from '@/data/resume/education';
import { experienceItems } from '@/data/resume/experiences';
import { projectItems } from '@/data/resume/projects';


export const resumeItems: ResumeItem[] = [
  ...experienceItems,
  ...projectItems,
  ...educationItems,
];
