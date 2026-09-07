import type { ResumeItem } from '@/data/resume/types';

import { educationItems } from '@/data/resume/education';
import { experienceItems } from '@/data/resume/experiences';
import { projectItems } from '@/data/resume/projects';


/** Where the taxonomy lives, relative to the repository root. */
export const SKILLS_PATH = 'src/data/resume/skills.ts';

/**
 * The files an entry can live in, paired with the items each one defines. The
 * dev-only tag editor writes tags back into these files by path, and the tests
 * that hold the writer to the real files read the same manifest, so a manifest
 * that drifted would silently stop covering a file.
 *
 * `resumeItems` is derived from it rather than listed alongside it, which is
 * what keeps the two from disagreeing: adding a data file is one edit.
 */
export const RESUME_DATA_FILES: { items: ResumeItem[]; path: string }[] = [
  { items: experienceItems, path: 'src/data/resume/experiences.ts' },
  { items: projectItems, path: 'src/data/resume/projects.ts' },
  { items: educationItems, path: 'src/data/resume/education.ts' },
];

export const resumeItems: ResumeItem[] = RESUME_DATA_FILES.flatMap((file) => file.items);
