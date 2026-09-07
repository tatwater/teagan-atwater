import type { SkillCategory, SkillTag } from '@/data/resume/types';

import { describe, it, expect } from 'vitest';
import {
  isTagVisible,
  printSkillCategories,
  sidebarSkillCategories,
  skillCategories,
  skillCategoryOrder,
  visibilityAtLeast,
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
  it('treats visibility as a ladder, print implying sidebar', () => {
    const printed = printSkillCategories().flatMap(([, tags]) => tags);
    const listed = new Set(sidebarSkillCategories().flatMap(([, tags]) => tags));

    expect(printed.filter((tag) => !listed.has(tag))).toEqual([]);
  });

  it('keeps everything the sidebar lists renderable on entry cards', () => {
    const listed = sidebarSkillCategories().flatMap(([, tags]) => tags);

    expect(listed.filter((tag) => !isTagVisible(tag))).toEqual([]);
  });

  it('omits hidden tags from every render path', () => {
    const hidden = allTags.filter((tag) => visibilityOf(tag) === 'hidden');
    const rendered = new Set([
      ...allTags.filter(isTagVisible),
      ...sidebarSkillCategories().flatMap(([, tags]) => tags),
      ...printSkillCategories().flatMap(([, tags]) => tags),
    ]);

    expect(hidden.filter((tag) => rendered.has(tag))).toEqual([]);
  });

  // The rung that keeps the sidebar curated while entries stay richly tagged.
  // If this ever empties out, the sidebar has stopped being a curated subset.
  it('keeps the entry-only rung in use', () => {
    const entryOnly = allTags.filter((tag) => visibilityOf(tag) === 'entry');

    expect(entryOnly.length).toBeGreaterThan(0);
    expect(entryOnly.every((tag) => !visibilityAtLeast(tag, 'sidebar'))).toBe(true);
  });

  it('drops a category with nothing above the entry rung', () => {
    const entryOnly = skillCategoryOrder
      .filter((category) => tagsIn(category).every((tag) => !visibilityAtLeast(tag, 'sidebar')));
    const listed = new Set(sidebarSkillCategories().map(([category]) => category));

    expect(entryOnly.filter((category) => listed.has(category))).toEqual([]);
    expect(entryOnly.length).toBeGreaterThan(0);  // Backend & Services, Product & Leadership
  });

  it('preserves the record order in both render paths', () => {
    for (const [category, tags] of sidebarSkillCategories()) {
      expect(tags).toEqual(tagsIn(category).filter((tag) => visibilityAtLeast(tag, 'sidebar')));
    }

    expect(sidebarSkillCategories().map(([category]) => category))
      .toEqual(skillCategoryOrder.filter((category) =>
        tagsIn(category).some((tag) => visibilityAtLeast(tag, 'sidebar'))));
  });

  // The sidebar and the printed résumé are meant to mirror the same designed
  // one-pager for now. Splitting them later means giving some tags the
  // 'sidebar' rung — at which point this is the test to delete.
  it('holds the sidebar and print sets identical', () => {
    expect(sidebarSkillCategories()).toEqual(printSkillCategories());
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
