import type { ResumeItem, SkillCategory, SkillTag } from '@/data/resume/types';

import { educationItems } from '@/data/resume/education';
import { experienceItems } from '@/data/resume/experiences';
import { projectItems } from '@/data/resume/projects';


export const resumeItems: ResumeItem[] = [
  ...experienceItems,
  ...projectItems,
  ...educationItems,
];

export const allTags: SkillTag[] = Array.from(
  new Set(resumeItems.flatMap((item) => item.tags))
).sort();

export const allGroupKeys: string[] = Array.from(
  new Set(resumeItems.map((item) => item.groupKey).filter((groupKey): groupKey is string => {
    return groupKey !== undefined;
  }))
);
