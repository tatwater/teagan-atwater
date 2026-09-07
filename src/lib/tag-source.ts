/**
 * Source rewriting for the dev-only tag editor.
 *
 * The editor saves whole state rather than a stream of operations — the full
 * taxonomy, and the full tag list for each entry it touched — so a rename and a
 * reassignment in the same session can't land out of order. These functions
 * turn that state back into the exact formatting the data files already use, so
 * a save produces a reviewable `git diff` and not a reformat of the world.
 *
 * Everything here is a string transform over source text: no AST, no codemod
 * dependency. That is only safe because the data files hold a narrow shape —
 * one `tags: [...]` per entry, all on one line — which `tags.test.ts` pins.
 */
import type { SkillVisibility } from '@/data/resume/skills';


export type TaxonomyRecord = Record<string, Record<string, SkillVisibility>>;


const SKILLS_OPEN = 'export const skillCategories = {';
const SKILLS_CLOSE = '} as const satisfies Record<string, Record<string, SkillVisibility>>;';


function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}


/**
 * Render the taxonomy with the alignment the file already uses: values line up
 * within a category, and categories are separated by a blank line.
 */
export function renderTaxonomy(taxonomy: TaxonomyRecord): string {
  const categories = Object.entries(taxonomy).map(([category, tags]) => {
    const entries = Object.entries(tags);
    const keyWidth = Math.max(0, ...entries.map(([tag]) => `${quote(tag)}:`.length));

    const lines = entries.map(([tag, visibility]) =>
      `    ${`${quote(tag)}:`.padEnd(keyWidth)} ${quote(visibility)},`);

    return [`  ${quote(category)}: {`, ...lines, '  },'].join('\n');
  });

  return categories.join('\n\n');
}


/** Swap the `skillCategories` literal in skills.ts for a freshly rendered one. */
export function replaceTaxonomy(source: string, taxonomy: TaxonomyRecord): string {
  const open = source.indexOf(SKILLS_OPEN);
  if (open === -1)
    throw new Error(`Could not find "${SKILLS_OPEN}" in skills.ts`);

  const bodyStart = open + SKILLS_OPEN.length;
  const close = source.indexOf(SKILLS_CLOSE, bodyStart);
  if (close === -1)
    throw new Error(`Could not find the end of the skillCategories literal in skills.ts`);

  return `${source.slice(0, bodyStart)}\n${renderTaxonomy(taxonomy)}\n${source.slice(close)}`;
}


const ENTRY_ID = (id: string) => new RegExp(`^\\s*id: ${quote(id)},\\s*$`, 'm');
const TAGS_LINE = /^([ \t]*)tags: \[[^\]]*\],[ \t]*$/m;
const ANY_ID_LINE = /^\s*id: '[^']*',\s*$/m;


/**
 * Rewrite one entry's `tags: [...]` line in place.
 *
 * The entry is found by its `id:` line and the tags line is the first one after
 * it. That's only correct while no other entry begins in between, so this
 * checks for exactly that and throws rather than writing into the wrong object.
 */
export function replaceEntryTags(source: string, id: string, tags: string[]): string {
  const idMatch = ENTRY_ID(id).exec(source);
  if (!idMatch)
    throw new Error(`Could not find an entry with id '${id}'`);

  const after = source.slice(idMatch.index + idMatch[0].length);
  const tagsMatch = TAGS_LINE.exec(after);
  if (!tagsMatch)
    throw new Error(`Entry '${id}' has no single-line tags: [...] property`);

  const nextId = ANY_ID_LINE.exec(after);
  if (nextId && nextId.index < tagsMatch.index)
    throw new Error(`Entry '${id}' has no tags: [...] of its own before the next entry begins`);

  const rendered = tags.length === 0
    ? '[]'
    : `[${tags.map(quote).join(', ')}]`;

  const start = idMatch.index + idMatch[0].length + tagsMatch.index;

  return source.slice(0, start)
    + `${tagsMatch[1]}tags: ${rendered},`
    + source.slice(start + tagsMatch[0].length);
}


/** Apply every entry in `tagsById` to one data file's source. */
export function replaceAllEntryTags(source: string, tagsById: Record<string, string[]>): string {
  return Object.entries(tagsById).reduce(
    (acc, [id, tags]) => replaceEntryTags(acc, id, tags),
    source,
  );
}


/** Which entry ids a given data file actually defines. */
export function entryIdsIn(source: string): string[] {
  return [...source.matchAll(/^\s*id: '([^']*)',\s*$/gm)].map((m) => m[1]);
}
