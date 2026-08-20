import type { OrgGroup, ResumeItem, SkillTag } from '@/data/resume/types';


function startGroup(key: string, item: ResumeItem): OrgGroup {
  return {
    key,
    organizationName: item.organizationName,
    organizationUrl: item.organizationUrl,
    logoSrc: item.logoSrc,
    logoShape: item.logoShape,
    items: [item],
    dateStart: item.dateStart,
    dateEnd: item.dateEnd,
    tags: [...item.tags],
  };
}


/** A null end date means "Present", which outranks any concrete date. */
function latestEnd(a: string | null, b: string | null): string | null {
  if (a === null || b === null) return null;
  return b > a ? b : a;
}


function mergeIntoGroup(group: OrgGroup, item: ResumeItem): void {
  group.items.push(item);
  group.dateStart = item.dateStart < group.dateStart ? item.dateStart : group.dateStart;
  group.dateEnd = latestEnd(group.dateEnd, item.dateEnd);

  for (const tag of item.tags) {
    if (!group.tags.includes(tag)) group.tags.push(tag);
  }
}


export function groupItems(items: ResumeItem[]): OrgGroup[] {
  const map = new Map<string, OrgGroup>();

  for (const item of items) {
    const key = item.groupKey ?? item.id;
    const group = map.get(key);

    if (group) {
      mergeIntoGroup(group, item);
    } else {
      map.set(key, startGroup(key, item));
    }
  }

  return Array.from(map.values());
}


/**
 * Split a group's tags into those every item shares — shown once in the group
 * footer — and the remainder, which each item shows on its own card.
 */
export function splitGroupTags(items: ResumeItem[]): {
  commonTags: SkillTag[];
  uniqueTagsByItemId: Map<string, SkillTag[]>;
} {
  const tagSets = items.map((item) => new Set(item.tags));
  const commonTags = (items[0]?.tags ?? []).filter((tag) => tagSets.every((set) => set.has(tag)));
  const commonTagSet = new Set(commonTags);

  return {
    commonTags,
    uniqueTagsByItemId: new Map(
      items.map((item) => [item.id, item.tags.filter((tag) => !commonTagSet.has(tag))]),
    ),
  };
}


/**
 * A group points at a single shared detail page when every item that links out
 * resolves to the same target. Otherwise each item keeps its own detail link.
 */
export function resolveSharedDetail(items: ResumeItem[]): ResumeItem | undefined {
  const linked = items.filter((item) => item.detailLabel);
  if (linked.length === 0) return undefined;

  const targets = new Set(linked.map((item) => item.detailId ?? item.id));

  return targets.size === 1 ? linked[0] : undefined;
}
