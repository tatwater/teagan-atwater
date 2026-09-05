import type { DescriptionBlock, DescriptionBody } from '@/data/resume/types';


/** A bulleted body, resolved into the lists it renders as. */
export interface BulletRun {
  bullets: string[];
  label?: string;
}


/**
 * Flatten a description body to plain text.
 *
 * A bulleted body has no single string to search, highlight-test, or drop into
 * a print template, so every consumer that needs one goes through here — which
 * keeps prose and bullets equally findable rather than making bullets invisible
 * to search.
 *
 * `separator` joins the pieces: the default space suits matching, while the
 * print page passes a visible divider so the bullets still read as a list.
 */
export function descriptionText(body: DescriptionBody | undefined, separator = ' '): string {
  if (!body) return '';
  if (typeof body === 'string') return body;

  return body
    .flatMap((block) => (typeof block === 'string' ? [block] : [block.label, ...block.bullets]))
    .join(separator);
}


/**
 * Collapse a bulleted body into the runs it renders as: consecutive plain
 * bullets share a single list, and each labeled group opens a new one under its
 * own heading.
 */
export function toBulletRuns(blocks: DescriptionBlock[]): BulletRun[] {
  const runs: BulletRun[] = [];

  for (const block of blocks) {
    if (typeof block !== 'string') {
      runs.push({ bullets: [...block.bullets], label: block.label });
      continue;
    }

    const open = runs.at(-1);

    if (open && open.label === undefined) open.bullets.push(block);
    else runs.push({ bullets: [block] });
  }

  return runs;
}


/** Whether a body has anything to render — an empty string or empty list does not. */
export function hasDescription(body: DescriptionBody | undefined): boolean {
  // Strings and arrays both report emptiness through `length`.
  return Boolean(body) && body!.length > 0;
}
