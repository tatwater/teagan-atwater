import type { SkillVisibility } from '@/data/resume/skills';
import type { TaxonomyRecord } from '@/lib/tag-source';


/**
 * The tag editor's working copy.
 *
 * Categories and tags are arrays rather than objects because their order is
 * render order on the site — the sidebar and the printed résumé both read the
 * taxonomy top to bottom — and an array makes that explicit instead of relying
 * on JS object key ordering to survive a round trip through JSON.
 *
 * Every function here is pure and returns a new draft. Nothing writes to disk;
 * that happens once, on save, through the API route.
 */
export interface DraftTag {
  name: string;
  visibility: SkillVisibility;
}

export interface DraftCategory {
  name: string;
  tags: DraftTag[];
}

export interface DraftEntry {
  id: string;
  hidden: boolean;
  organizationName: string;
  title: string;
  type: 'experience' | 'education' | 'project';
}

export interface Draft {
  categories: DraftCategory[];
  tagsById: Record<string, string[]>;
}


export function draftFromApi(
  taxonomy: TaxonomyRecord,
  entries: (DraftEntry & { tags: string[] })[],
): Draft {
  return {
    categories: Object.entries(taxonomy).map(([name, tags]) => ({
      name,
      tags: Object.entries(tags).map(([tagName, visibility]) => ({ name: tagName, visibility })),
    })),
    tagsById: Object.fromEntries(entries.map((entry) => [entry.id, [...entry.tags]])),
  };
}


export function toTaxonomyRecord(draft: Draft): TaxonomyRecord {
  return Object.fromEntries(
    draft.categories.map((category) => [
      category.name,
      Object.fromEntries(category.tags.map((tag) => [tag.name, tag.visibility])),
    ]),
  );
}


export function allTags(draft: Draft): DraftTag[] {
  return draft.categories.flatMap((category) => category.tags);
}


export function categoryOf(draft: Draft, tag: string): string | undefined {
  return draft.categories.find((c) => c.tags.some((t) => t.name === tag))?.name;
}


export function visibilityOfTag(draft: Draft, tag: string): SkillVisibility | undefined {
  return allTags(draft).find((t) => t.name === tag)?.visibility;
}


/**
 * How many entries carry each tag. `only` narrows it to a subset of entry ids —
 * the résumé counts coverage across entries it actually renders, so a tag whose
 * sole carrier is shelved sorts nothing on the live page even though the editor
 * can see it. Passing the visible ids keeps the two in agreement.
 */
export function coverage(draft: Draft, only?: Set<string>): Map<string, number> {
  const counts = new Map<string, number>();

  for (const [id, tags] of Object.entries(draft.tagsById)) {
    if (only && !only.has(id)) continue;

    for (const tag of tags)
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }

  return counts;
}


export function entryHasTag(draft: Draft, entryId: string, tag: string): boolean {
  return (draft.tagsById[entryId] ?? []).includes(tag);
}


/**
 * Add or remove one tag on one entry. New tags append, so the authored order —
 * which is the order they read on a card — stays under your control.
 */
export function toggleTag(draft: Draft, entryId: string, tag: string): Draft {
  const current = draft.tagsById[entryId] ?? [];
  const next = current.includes(tag)
    ? current.filter((t) => t !== tag)
    : [...current, tag];

  return { ...draft, tagsById: { ...draft.tagsById, [entryId]: next } };
}


/**
 * Reorder one entry's tags. This order is the order the tags read on the card,
 * so the most relevant tag for a given job belongs at the front — and that
 * differs per entry, which is why it lives on the entry rather than being
 * derived from the taxonomy's order.
 */
export function reorderEntryTag(draft: Draft, entryId: string, from: number, to: number): Draft {
  const current = draft.tagsById[entryId] ?? [];

  if (from === to || from < 0 || from >= current.length || to < 0 || to >= current.length)
    return draft;

  const next = [...current];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return { ...draft, tagsById: { ...draft.tagsById, [entryId]: next } };
}


/** Nudge a tag one place along its entry's list, clamping at both ends. */
export function moveEntryTagBy(draft: Draft, entryId: string, tag: string, delta: number): Draft {
  const index = (draft.tagsById[entryId] ?? []).indexOf(tag);

  return index === -1 ? draft : reorderEntryTag(draft, entryId, index, index + delta);
}


/** Promote a tag straight to the front of its entry — the common case. */
export function moveEntryTagToFront(draft: Draft, entryId: string, tag: string): Draft {
  const index = (draft.tagsById[entryId] ?? []).indexOf(tag);

  return index === -1 ? draft : reorderEntryTag(draft, entryId, index, 0);
}


export function setVisibility(draft: Draft, tag: string, visibility: SkillVisibility): Draft {
  return {
    ...draft,
    categories: draft.categories.map((category) => ({
      ...category,
      tags: category.tags.map((t) => (t.name === tag ? { ...t, visibility } : t)),
    })),
  };
}


export function tagExists(draft: Draft, name: string): boolean {
  return allTags(draft).some((t) => t.name === name);
}


/**
 * Rename a tag everywhere at once. The cascade onto entries is the whole point:
 * a rename that updated only the taxonomy would leave every entry referencing a
 * tag that no longer exists, which the API's validation would then reject.
 */
export function renameTag(draft: Draft, from: string, to: string): Draft {
  const name = to.trim();

  if (!name)
    throw new Error('A tag needs a name.');

  if (name === from)
    return draft;

  if (tagExists(draft, name))
    throw new Error(`"${name}" already exists.`);

  if (!tagExists(draft, from))
    throw new Error(`"${from}" is not in the taxonomy.`);

  return {
    categories: draft.categories.map((category) => ({
      ...category,
      tags: category.tags.map((t) => (t.name === from ? { ...t, name } : t)),
    })),
    tagsById: Object.fromEntries(
      Object.entries(draft.tagsById).map(([id, tags]) => [
        id,
        tags.map((t) => (t === from ? name : t)),
      ]),
    ),
  };
}


/** Move a tag to another category, appending it at the end of that category. */
export function moveTag(draft: Draft, tag: string, toCategory: string): Draft {
  const existing = allTags(draft).find((t) => t.name === tag);

  if (!existing)
    throw new Error(`"${tag}" is not in the taxonomy.`);

  if (!draft.categories.some((c) => c.name === toCategory))
    throw new Error(`There is no "${toCategory}" category.`);

  if (categoryOf(draft, tag) === toCategory)
    return draft;

  return {
    ...draft,
    categories: draft.categories.map((category) => {
      if (category.name === toCategory)
        return { ...category, tags: [...category.tags, existing] };

      return { ...category, tags: category.tags.filter((t) => t.name !== tag) };
    }),
  };
}


export function addTag(
  draft: Draft,
  category: string,
  name: string,
  visibility: SkillVisibility = 'entry',
): Draft {
  const trimmed = name.trim();

  if (!trimmed)
    throw new Error('A tag needs a name.');

  if (tagExists(draft, trimmed))
    throw new Error(`"${trimmed}" already exists.`);

  if (!draft.categories.some((c) => c.name === category))
    throw new Error(`There is no "${category}" category.`);

  return {
    ...draft,
    categories: draft.categories.map((c) =>
      c.name === category
        ? { ...c, tags: [...c.tags, { name: trimmed, visibility }] }
        : c),
  };
}


/** Reorder a tag within its own category, which is its render order on the site. */
export function moveTagWithinCategory(draft: Draft, tag: string, delta: number): Draft {
  return {
    ...draft,
    categories: draft.categories.map((category) => {
      const index = category.tags.findIndex((t) => t.name === tag);
      const target = index + delta;

      if (index === -1 || target < 0 || target >= category.tags.length)
        return category;

      const tags = [...category.tags];
      [tags[index], tags[target]] = [tags[target], tags[index]];

      return { ...category, tags };
    }),
  };
}


/** Entry ids whose tag list differs from the one the editor loaded. */
export function changedEntryIds(initial: Draft, draft: Draft): string[] {
  return Object.keys(draft.tagsById).filter((id) =>
    JSON.stringify(draft.tagsById[id]) !== JSON.stringify(initial.tagsById[id]));
}


export function isDirty(initial: Draft, draft: Draft): boolean {
  return JSON.stringify(initial) !== JSON.stringify(draft);
}
