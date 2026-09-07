import type { SkillTag } from '@/data/resume/types';

import { useState } from 'react';
import { TagPill } from '@/islands/resume/tag-pill';
import { textMatchesTerms } from '@/islands/resume/highlight';
import { useSingleLineFit } from '@/islands/resume/use-single-line-fit';
import { cn } from '@/lib/utils';


/**
 * A card's tag row, held to a single line.
 *
 * Entries carry far more tags than belong on a card — the long tail exists to
 * feed search and the command palette. The row shows as many as fit in the
 * entry's authored order, which is curated per entry precisely so the ones that
 * matter for that job lead. The rest sit behind an expander.
 *
 * This adds rather than hides: nothing is removed from the page and the count
 * states plainly how much more there is, so it stays on the right side of the
 * rule that the résumé never lets a visitor shrink the work on display.
 */
export function CardTagRow(props: {
  tags: SkillTag[];
  activeTag?: SkillTag | null;
  terms: string[];
}) {
  const [expanded, setExpanded] = useState(false);

  // A search that matches a tag we'd otherwise drop would highlight something
  // that isn't on the page, so the row opens itself — the same courtesy
  // `resolveVerbosity` extends when a match hides below the current density.
  const revealForSearch = props.terms.length > 0
    && props.tags.some((tag) => textMatchesTerms(tag, props.terms));

  // Sorting floats the active tag to the front, so the row's order changes
  // without its length doing — the key has to cover both.
  const { count, ref } = useSingleLineFit({
    itemCount: props.tags.length,
    resetKey: props.tags.join('\u0000'),
  });

  const measuring = count === null;
  const open = expanded || revealForSearch || measuring;
  const shown = open ? props.tags : props.tags.slice(0, count);
  const hidden = props.tags.length - shown.length;

  // While measuring, the toggle carries the widest label it could ever hold, so
  // the real one is guaranteed to fit the space reserved for it.
  const label = measuring
    ? `+${props.tags.length} more`
    : expanded ? 'Show less' : `+${hidden} more`;

  const showToggle = measuring || expanded || (hidden > 0 && !revealForSearch);

  return (
    <div className='flex-1 min-w-0 flex flex-wrap gap-1' ref={ref}>
      {shown.map((tag) => (
        <TagPill
          key={tag}
          active={props.activeTag === tag}
          highlighted={textMatchesTerms(tag, props.terms)}
          small
          tag={tag}
        />
      ))}

      {showToggle && (
        <button
          aria-expanded={expanded}
          className={cn(
            'shrink-0 h-5.5 px-1.5 border border-dashed border-border font-mono text-[10px]',
            'text-muted-foreground cursor-pointer transition-colors',
            'hover:border-primary/60 hover:text-foreground',
            measuring && 'invisible',
          )}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          type='button'
        >
          {label}
        </button>
      )}
    </div>
  );
}
