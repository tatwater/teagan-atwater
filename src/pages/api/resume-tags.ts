import type { APIRoute } from 'astro';
import type { TaxonomyRecord } from '@/lib/tag-source';

import { readFileSync, writeFileSync } from 'node:fs';
import { replaceAllEntryTags, replaceTaxonomy } from '@/lib/tag-source';
import { SKILL_VISIBILITY_ORDER, skillCategories } from '@/data/resume/skills';
import { educationItems } from '@/data/resume/education';
import { experienceItems } from '@/data/resume/experiences';
import { projectItems } from '@/data/resume/projects';


/**
 * Backing store for the dev-only tag editor at /resume/tags.
 *
 * This writes to the repository's own source files, so it exists only while
 * `astro dev` is running. Both handlers hard-refuse outside dev — the route is
 * still part of the built server bundle, and an endpoint that rewrites source
 * has no business answering in production.
 *
 * There is no undo here on purpose: the undo is `git checkout`, and the whole
 * design of the writer is to keep the resulting diff small enough to read.
 */
const SKILLS_PATH = 'src/data/resume/skills.ts';

const DATA_FILES = [
  { path: 'src/data/resume/experiences.ts', items: experienceItems },
  { path: 'src/data/resume/projects.ts', items: projectItems },
  { path: 'src/data/resume/education.ts', items: educationItems },
];


function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}


function devOnly(): Response | null {
  return import.meta.env.DEV
    ? null
    : json({ error: 'The tag editor is only available in development.' }, 404);
}


/** Everything the editor needs to render both directions of the mapping. */
export const GET: APIRoute = () => {
  const blocked = devOnly();
  if (blocked) return blocked;

  return json({
    taxonomy: skillCategories,
    entries: DATA_FILES.flatMap(({ items }) =>
      items.map((item) => ({
        id: item.id,
        hidden: Boolean(item.hidden),
        organizationName: item.organizationName,
        tags: item.tags,
        title: item.title,
        type: item.type,
      }))),
  });
};


interface SavePayload {
  taxonomy: TaxonomyRecord;
  tagsById: Record<string, string[]>;
}


/**
 * Reject anything that would produce a file that doesn't compile, before a
 * single byte is written. A half-applied save across four files is much worse
 * than a rejected one.
 */
function validate(payload: SavePayload): string[] {
  const problems: string[] = [];
  const { taxonomy, tagsById } = payload;

  if (!taxonomy || typeof taxonomy !== 'object')
    return ['Missing taxonomy.'];

  const homes = new Map<string, string[]>();

  for (const [category, tags] of Object.entries(taxonomy)) {
    if (!category.trim())
      problems.push('A category has an empty name.');

    for (const [tag, visibility] of Object.entries(tags)) {
      if (!tag.trim())
        problems.push(`Category "${category}" has a tag with an empty name.`);

      if (!SKILL_VISIBILITY_ORDER.includes(visibility))
        problems.push(`Tag "${tag}" has an unknown visibility "${visibility}".`);

      homes.set(tag, [...(homes.get(tag) ?? []), category]);
    }
  }

  for (const [tag, categories] of homes) {
    if (categories.length > 1)
      problems.push(`Tag "${tag}" is filed under ${categories.join(' and ')}.`);
  }

  const knownIds = new Set(DATA_FILES.flatMap(({ items }) => items.map((i) => i.id)));

  for (const [id, tags] of Object.entries(tagsById ?? {})) {
    if (!knownIds.has(id))
      problems.push(`Unknown entry "${id}".`);

    for (const tag of tags) {
      if (!homes.has(tag))
        problems.push(`Entry "${id}" is tagged "${tag}", which is not in the taxonomy.`);
    }

    if (new Set(tags).size !== tags.length)
      problems.push(`Entry "${id}" lists a tag twice.`);
  }

  return problems;
}


export const POST: APIRoute = async ({ request }) => {
  const blocked = devOnly();
  if (blocked) return blocked;

  let payload: SavePayload;

  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Could not parse the request body as JSON.' }, 400);
  }

  const problems = validate(payload);

  if (problems.length > 0)
    return json({ error: 'The save was rejected.', problems }, 400);

  try {
    // Build every new file in memory first, so a failure part-way through
    // leaves the working tree untouched rather than half-written.
    const pending: [string, string][] = [
      [SKILLS_PATH, replaceTaxonomy(readFileSync(SKILLS_PATH, 'utf8'), payload.taxonomy)],
    ];

    for (const { path, items } of DATA_FILES) {
      const ids = new Set(items.map((i) => i.id));
      const mine = Object.fromEntries(
        Object.entries(payload.tagsById ?? {}).filter(([id]) => ids.has(id)),
      );

      if (Object.keys(mine).length > 0)
        pending.push([path, replaceAllEntryTags(readFileSync(path, 'utf8'), mine)]);
    }

    for (const [path, contents] of pending)
      writeFileSync(path, contents, 'utf8');

    return json({ ok: true, written: pending.map(([path]) => path) });
  } catch (error) {
    return json(
      {
        error: 'Nothing was written.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
};
