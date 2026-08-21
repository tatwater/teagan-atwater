import type { SkillCategory, SkillTag } from '@/data/resume/types';

import { describe, it, expect } from 'vitest';
import {
  isTagVisible,
  printSkillCategories,
  sidebarSkillCategories,
  skillCategories,
  skillCategoryOrder,
  visibilityOf,
} from '@/data/resume/skills';
import { resumeItems } from '@/data/resume';


const tagsIn = (category: SkillCategory) => Object.keys(skillCategories[category]) as SkillTag[];
const allTags = skillCategoryOrder.flatMap(tagsIn);


describe('skill taxonomy', () => {
  // `SkillTag` is derived from the record, so "is this tag categorized?" is now a
  // compile error rather than a test. These are the gaps TypeScript still can't
  // close: a tag filed under two categories, and a category emptied by curation.
  it('places each tag in exactly one category', () => {
    const seen = new Map<SkillTag, SkillCategory[]>();

    for (const category of skillCategoryOrder) {
      for (const tag of tagsIn(category)) {
        seen.set(tag, [...(seen.get(tag) ?? []), category]);
      }
    }

    const duplicated = [...seen.entries()].filter(([, homes]) => homes.length > 1);

    expect(duplicated).toEqual([]);
  });

  it('keeps every category non-empty', () => {
    const empty = skillCategoryOrder.filter((category) => tagsIn(category).length === 0);

    expect(empty).toEqual([]);
  });
});


describe('skill visibility', () => {
  it('treats visibility as a ladder, print implying site', () => {
    const printed = printSkillCategories().flatMap(([, tags]) => tags);
    const shown = new Set(sidebarSkillCategories().flatMap(([, tags]) => tags));

    expect(printed.filter((tag) => !shown.has(tag))).toEqual([]);
  });

  it('omits hidden tags from the sidebar and from print', () => {
    const hidden = allTags.filter((tag) => visibilityOf(tag) === 'hidden');
    const rendered = new Set([
      ...sidebarSkillCategories().flatMap(([, tags]) => tags),
      ...printSkillCategories().flatMap(([, tags]) => tags),
    ]);

    expect(hidden.filter((tag) => rendered.has(tag))).toEqual([]);
    expect(hidden.length).toBeGreaterThan(0);  // the mechanism is actually in use
  });

  it('drops a category whose tags are all hidden', () => {
    const fullyHidden = skillCategoryOrder
      .filter((category) => tagsIn(category).every((tag) => !isTagVisible(tag)));
    const listed = new Set(sidebarSkillCategories().map(([category]) => category));

    expect(fullyHidden.filter((category) => listed.has(category))).toEqual([]);
  });

  it('preserves the record order in both render paths', () => {
    for (const [category, tags] of sidebarSkillCategories()) {
      expect(tags).toEqual(tagsIn(category).filter(isTagVisible));
    }

    expect(sidebarSkillCategories().map(([category]) => category))
      .toEqual(skillCategoryOrder.filter((category) => tagsIn(category).some(isTagVisible)));
  });

  // Curation hides tags, not entries. An entry stripped of every visible tag
  // still renders — it just loses its footer — so this is a nudge, not a law.
  it('leaves every tagged entry at least one visible tag', () => {
    const stripped = resumeItems
      .filter((item) => item.tags.length > 0 && !item.tags.some(isTagVisible))
      .map((item) => item.id);

    expect(stripped).toEqual([]);
  });
});
