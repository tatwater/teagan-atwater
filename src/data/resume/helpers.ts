import type { OrgGroup, ResumeItem } from '@/data/resume/types';


export function groupItems(items: ResumeItem[]): OrgGroup[] {
  const map = new Map<string, OrgGroup>();

  for (const item of items) {
    const key = item.groupKey ?? item.id;

    if (map.has(key)) {
      const group = map.get(key)!;
      group.items.push(item);
      // Earliest start
      if (item.dateStart < group.dateStart) group.dateStart = item.dateStart;
      // Latest end (null wins = Present)
      if (item.dateEnd === null) {
        group.dateEnd = null;
      } else if (group.dateEnd !== null && item.dateEnd > group.dateEnd) {
        group.dateEnd = item.dateEnd;
      }
      // Merge tags (deduplicated)
      for (const tag of item.tags) {
        if (!group.tags.includes(tag)) group.tags.push(tag);
      }
    } else {
      map.set(key, {
        key,
        organizationName: item.organizationName,
        organizationUrl: item.organizationUrl,
        logoSrc: item.logoSrc,
        logoShape: item.logoShape,
        items: [item],
        dateStart: item.dateStart,
        dateEnd: item.dateEnd,
        tags: [...item.tags],
      });
    }
  }

  return Array.from(map.values());
}
