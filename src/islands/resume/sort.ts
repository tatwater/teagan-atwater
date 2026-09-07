import type { ResumeItem, SkillTag } from '@/data/resume/types';


/**
 * Clicking a skill sorts rather than filters. Nothing is ever removed from the
 * page — entries that carry the tag rise to the top and the rest keep reading
 * underneath, so the list can't shrink to make the résumé look thin.
 *
 * Both halves stay in the order they were authored, which is chronological, so
 * a sorted list reads as "these first, then the rest, each still in time order"
 * rather than as a scramble.
 */
export function sortByTag(items: ResumeItem[], tag: SkillTag | null): ResumeItem[] {
  if (!tag)
    return items;

  const matched: ResumeItem[] = [];
  const rest: ResumeItem[] = [];

  for (const item of items)
    (item.tags.includes(tag) ? matched : rest).push(item);

  return [...matched, ...rest];
}


export function countMatchingTag(items: ResumeItem[], tag: SkillTag | null): number {
  return tag ? items.filter((item) => item.tags.includes(tag)).length : 0;
}


/**
 * How many entries carry each tag. The sidebar uses this to decide which pills
 * are controls at all: a tag on no entry sorts nothing, so making it clickable
 * would recreate the "looks clickable, does nothing" problem one level down.
 */
export function tagCoverage(items: ResumeItem[]): Map<SkillTag, number> {
  const counts = new Map<SkillTag, number>();

  for (const item of items)
    for (const tag of item.tags)
      counts.set(tag, (counts.get(tag) ?? 0) + 1);

  return counts;
}


/**
 * Experience and projects merge into one ranked list while a tag is active —
 * a project that matches deserves to outrank an experience that doesn't, and
 * the section split would otherwise trap it below.
 *
 * The 'pandemic' variant is left out: it exists to explain a gap in the
 * chronology, so it has no meaning in an order that isn't chronological. It
 * also nests other entries as sub-cards, which would render them twice in a
 * merged list.
 */
export function mergeableItems(items: ResumeItem[]): ResumeItem[] {
  return items.filter((item) =>
    (item.type === 'experience' || item.type === 'project') && item.variant !== 'pandemic');
}


/**
 * Float the active tag to the front of a card's tag row so the reason the card
 * ranked where it did is the first thing read. Everything else holds its
 * authored order, which is a deliberate rough hierarchy on most entries.
 */
export function tagsWithActiveFirst(tags: SkillTag[], tag: SkillTag | null): SkillTag[] {
  if (!tag || !tags.includes(tag))
    return tags;

  return [tag, ...tags.filter((t) => t !== tag)];
}
