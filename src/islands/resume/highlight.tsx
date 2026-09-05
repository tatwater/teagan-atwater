import type { ResumeItem } from '@/data/resume/types';
import type { Verbosity } from '@/islands/resume/types';

import { descriptionText } from '@/data/resume/description';
import { visibleTags } from '@/data/resume/skills';


const VERBOSITY_ORDER: Verbosity[] = ['headline', 'summary', 'detail'];


function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


/**
 * Split a raw query into comparable terms. Single characters are dropped so a
 * stray keystroke doesn't highlight half the page.
 */
export function tokenizeSearch(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);
}


export function textMatchesTerms(text: string | null | undefined, terms: string[]): boolean {
  if (!text || terms.length === 0)
    return false;

  const lower = text.toLowerCase();

  return terms.some((term) => lower.includes(term));
}


/**
 * A card counts as a match when every search term appears somewhere in the text
 * the card can show. Match detection and highlighting share this vocabulary, so
 * a card can never be marked as matching without something to highlight.
 */
export function itemMatchesTerms(item: ResumeItem, terms: string[]): boolean {
  if (terms.length === 0)
    return true;

  const haystack = [
    item.title,
    item.organizationName,
    item.location,
    descriptionText(item.descriptionSummary),
    item.descriptionFull,
    ...visibleTags(item.tags),
  ].join(' ').toLowerCase();

  return terms.every((term) => haystack.includes(term));
}


/**
 * The card body only renders `descriptionSummary` at 'summary' and
 * `descriptionFull` at 'detail'. When a search matches text that the current
 * density keeps hidden, bump this card — and only this card — to the shallowest
 * density that actually reveals the match.
 */
export function resolveVerbosity(
  item: ResumeItem,
  verbosity: Verbosity,
  terms: string[],
): Verbosity {
  if (terms.length === 0)
    return verbosity;

  // Always-rendered fields need no bump.
  const alwaysVisible =
    [item.title, item.organizationName, item.location, ...visibleTags(item.tags)].join(' ');

  if (textMatchesTerms(alwaysVisible, terms))
    return verbosity;

  const needed: Verbosity | null =
    textMatchesTerms(descriptionText(item.descriptionSummary), terms) ? 'summary'
    : textMatchesTerms(item.descriptionFull, terms) ? 'detail'
    : null;

  if (!needed)
    return verbosity;

  return VERBOSITY_ORDER.indexOf(needed) > VERBOSITY_ORDER.indexOf(verbosity)
    ? needed
    : verbosity;
}


/**
 * Wrap every occurrence of a search term in <mark>. Terms match on a prefix so
 * "react" highlights the whole of "React" and "ReactJS", mirroring the prefix
 * matching MiniSearch uses to decide what counts as a hit.
 */
export function Highlight(props: {
  terms: string[];
  text: string;
}) {
  if (props.terms.length === 0)
    return <>{props.text}</>;

  const pattern = new RegExp(
    `(${props.terms.map((term) => `${escapeRegExp(term)}\\w*`).join('|')})`,
    'gi',
  );

  const parts = props.text.split(pattern);

  return (
    <>
      {parts.map((part, i) => (
        // String.split with a single capture group alternates literal/match.
        i % 2 === 1
          ? (
              <mark
                key={i}
                className='bg-primary/20 text-foreground px-0.5'
              >
                {part}
              </mark>
            )
          : part
      ))}
    </>
  );
}
