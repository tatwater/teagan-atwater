import type { ResumeItem, SkillTag } from '@/data/resume/types';

import { describe, it, expect } from 'vitest';
import { groupItems, resolveSharedDetail, splitGroupTags } from '@/data/resume/helpers';


function item(overrides: Partial<ResumeItem> & { id: string }): ResumeItem {
  return {
    dateEnd: '2024-01',
    dateStart: '2023-01',
    descriptionFull: '',
    descriptionHeadline: '',
    descriptionSummary: '',
    organizationName: 'Acme',
    tags: [],
    title: 'Role',
    type: 'experience',
    ...overrides,
  };
}


describe('groupItems', () => {
  it('keeps ungrouped entries in their own group, keyed by id', () => {
    const groups = groupItems([item({ id: 'a' }), item({ id: 'b' })]);

    expect(groups.map((g) => g.key)).toEqual(['a', 'b']);
    expect(groups.every((g) => g.items.length === 1)).toBe(true);
  });

  it('collapses entries that share a groupKey', () => {
    const groups = groupItems([
      item({ id: 'a', groupKey: 'acme' }),
      item({ id: 'b', groupKey: 'acme' }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].items.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('widens the group span to the earliest start and latest end', () => {
    const [group] = groupItems([
      item({ id: 'a', groupKey: 'acme', dateStart: '2022-06', dateEnd: '2023-01' }),
      item({ id: 'b', groupKey: 'acme', dateStart: '2021-01', dateEnd: '2024-09' }),
    ]);

    expect(group.dateStart).toBe('2021-01');
    expect(group.dateEnd).toBe('2024-09');
  });

  it('treats a null end date as Present, outranking any concrete date', () => {
    const [group] = groupItems([
      item({ id: 'a', groupKey: 'acme', dateEnd: null }),
      item({ id: 'b', groupKey: 'acme', dateEnd: '2024-09' }),
    ]);

    expect(group.dateEnd).toBeNull();
  });

  it('treats a null end date as Present regardless of arrival order', () => {
    const [group] = groupItems([
      item({ id: 'a', groupKey: 'acme', dateEnd: '2024-09' }),
      item({ id: 'b', groupKey: 'acme', dateEnd: null }),
    ]);

    expect(group.dateEnd).toBeNull();
  });

  it('merges tags without duplicating them', () => {
    const [group] = groupItems([
      item({ id: 'a', groupKey: 'acme', tags: ['React', 'TypeScript'] as SkillTag[] }),
      item({ id: 'b', groupKey: 'acme', tags: ['TypeScript', 'Astro'] as SkillTag[] }),
    ]);

    expect(group.tags).toEqual(['React', 'TypeScript', 'Astro']);
  });

  it('does not mutate the source item tag arrays', () => {
    const source = item({ id: 'a', groupKey: 'acme', tags: ['React'] as SkillTag[] });
    groupItems([source, item({ id: 'b', groupKey: 'acme', tags: ['Astro'] as SkillTag[] })]);

    expect(source.tags).toEqual(['React']);
  });
});


describe('splitGroupTags', () => {
  it('separates tags every entry shares from the rest', () => {
    const { commonTags, uniqueTagsByItemId } = splitGroupTags([
      item({ id: 'a', tags: ['React', 'TypeScript'] as SkillTag[] }),
      item({ id: 'b', tags: ['TypeScript', 'Astro'] as SkillTag[] }),
    ]);

    expect(commonTags).toEqual(['TypeScript']);
    expect(uniqueTagsByItemId.get('a')).toEqual(['React']);
    expect(uniqueTagsByItemId.get('b')).toEqual(['Astro']);
  });

  it('reports no common tags when the entries share none', () => {
    const { commonTags } = splitGroupTags([
      item({ id: 'a', tags: ['React'] as SkillTag[] }),
      item({ id: 'b', tags: ['Astro'] as SkillTag[] }),
    ]);

    expect(commonTags).toEqual([]);
  });

  it('handles an empty group', () => {
    const { commonTags, uniqueTagsByItemId } = splitGroupTags([]);

    expect(commonTags).toEqual([]);
    expect(uniqueTagsByItemId.size).toBe(0);
  });
});


describe('resolveSharedDetail', () => {
  it('returns nothing when no entry links out', () => {
    expect(resolveSharedDetail([item({ id: 'a' }), item({ id: 'b' })])).toBeUndefined();
  });

  it('returns the linking entry when every link points at one page', () => {
    const shared = resolveSharedDetail([
      item({ id: 'a', detailLabel: 'Read more', detailId: 'acme' }),
      item({ id: 'b', detailLabel: 'Read more', detailId: 'acme' }),
    ]);

    expect(shared?.id).toBe('a');
  });

  it('returns nothing when entries link to different pages', () => {
    const shared = resolveSharedDetail([
      item({ id: 'a', detailLabel: 'Read more' }),
      item({ id: 'b', detailLabel: 'Read more' }),
    ]);

    expect(shared).toBeUndefined();
  });

  it('ignores entries that do not link out when judging sameness', () => {
    const shared = resolveSharedDetail([
      item({ id: 'a', detailLabel: 'Read more', detailId: 'acme' }),
      item({ id: 'b' }),
    ]);

    expect(shared?.id).toBe('a');
  });
});
