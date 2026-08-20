import type { SkillCategory, SkillTag } from '@/data/resume/types';

import { describe, it, expect } from 'vitest';
import { printSkills, skillCategories } from '@/data/resume/skills';
import { resumeItems } from '@/data/resume';


const categories = Object.keys(skillCategories) as SkillCategory[];
const allCategorizedTags = categories.flatMap((category) => skillCategories[category]);


describe('skill taxonomy', () => {
  // TypeScript guarantees every category key exists, but not that every tag is
  // placed, placed once, or still referenced. These are the gaps it cannot close.
  it('places each tag in exactly one category', () => {
    const seen = new Map<SkillTag, SkillCategory[]>();

    for (const category of categories) {
      for (const tag of skillCategories[category]) {
        seen.set(tag, [...(seen.get(tag) ?? []), category]);
      }
    }

    const duplicated = [...seen.entries()].filter(([, homes]) => homes.length > 1);

    expect(duplicated).toEqual([]);
  });

  it('categorizes every tag used by a résumé entry', () => {
    const used = new Set(resumeItems.flatMap((item) => item.tags));
    const uncategorized = [...used].filter((tag) => !allCategorizedTags.includes(tag));

    expect(uncategorized).toEqual([]);
  });

  it('only prints tags that exist in the full vocabulary', () => {
    const stray: string[] = [];

    for (const [category, tags] of Object.entries(printSkills)) {
      for (const tag of tags ?? []) {
        if (!skillCategories[category as SkillCategory].includes(tag)) {
          stray.push(`${category}: ${tag}`);
        }
      }
    }

    expect(stray).toEqual([]);
  });

  it('keeps every category non-empty', () => {
    const empty = categories.filter((category) => skillCategories[category].length === 0);

    expect(empty).toEqual([]);
  });
});
