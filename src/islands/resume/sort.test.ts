import type { ResumeItem, SkillTag } from '@/data/resume/types';

import { describe, it, expect } from 'vitest';
import {
  countMatchingTag,
  mergeableItems,
  sortByTag,
  tagsWithActiveFirst,
} from '@/islands/resume/sort';


function item(id: string, tags: SkillTag[], overrides: Partial<ResumeItem> = {}): ResumeItem {
  return {
    id,
    tags,
    type: 'experience',
    title: id,
    organizationName: id,
    dateStart: '2020-01',
    dateEnd: null,
    descriptionHeadline: '',
    descriptionSummary: '',
    descriptionFull: '',
    ...overrides,
  };
}


describe('sortByTag', () => {
  const items = [
    item('a', ['React']),
    item('b', ['Postgres']),
    item('c', ['React', 'Tailwind']),
    item('d', []),
  ];

  it('floats matches to the top without dropping anything', () => {
    const sorted = sortByTag(items, 'React');

    expect(sorted.map((i) => i.id)).toEqual(['a', 'c', 'b', 'd']);
    expect(sorted).toHaveLength(items.length);
  });

  it('holds authored order within both the matched and unmatched halves', () => {
    expect(sortByTag(items, 'Tailwind').map((i) => i.id)).toEqual(['c', 'a', 'b', 'd']);
  });

  it('is a no-op with no active tag', () => {
    expect(sortByTag(items, null)).toBe(items);
  });

  it('leaves the order alone when nothing matches', () => {
    expect(sortByTag(items, 'Fundraising').map((i) => i.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('never loses an entry, whatever the tag', () => {
    for (const tag of ['React', 'Tailwind', 'Postgres', 'Vitest'] as SkillTag[]) {
      expect(sortByTag(items, tag).map((i) => i.id).sort()).toEqual(['a', 'b', 'c', 'd']);
    }
  });
});


describe('countMatchingTag', () => {
  const items = [item('a', ['React']), item('b', []), item('c', ['React'])];

  it('counts the entries carrying the tag', () => {
    expect(countMatchingTag(items, 'React')).toBe(2);
    expect(countMatchingTag(items, 'Postgres')).toBe(0);
    expect(countMatchingTag(items, null)).toBe(0);
  });
});


describe('mergeableItems', () => {
  it('merges experience and projects, and leaves education out', () => {
    const items = [
      item('exp', []),
      item('proj', [], { type: 'project' }),
      item('edu', [], { type: 'education' }),
    ];

    expect(mergeableItems(items).map((i) => i.id)).toEqual(['exp', 'proj']);
  });

  it('drops the chronological-gap card, which has no place in a ranked list', () => {
    const items = [item('exp', []), item('pandemic', [], { variant: 'pandemic' })];

    expect(mergeableItems(items).map((i) => i.id)).toEqual(['exp']);
  });
});


describe('tagsWithActiveFirst', () => {
  const tags: SkillTag[] = ['TypeScript', 'React', 'Tailwind'];

  it('floats the active tag to the front, holding the rest in order', () => {
    expect(tagsWithActiveFirst(tags, 'Tailwind')).toEqual(['Tailwind', 'TypeScript', 'React']);
  });

  it('leaves the row untouched when the tag is absent or unset', () => {
    expect(tagsWithActiveFirst(tags, 'Postgres')).toBe(tags);
    expect(tagsWithActiveFirst(tags, null)).toBe(tags);
  });

  it('is already correct when the active tag leads', () => {
    expect(tagsWithActiveFirst(tags, 'TypeScript')).toEqual(['TypeScript', 'React', 'Tailwind']);
  });
});
