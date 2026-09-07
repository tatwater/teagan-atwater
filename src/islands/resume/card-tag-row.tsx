import type { SkillTag } from '@/data/resume/types';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { TagPill } from '@/islands/resume/tag-pill';
import { textMatchesTerms } from '@/islands/resume/highlight';
import { cn } from '@/lib/utils';


/** Matches the `gap-1` between pills, in pixels. */
const GAP = 4;

/**
 * Pill widths are fractional, so a row whose rounded widths sum to exactly the
 * container's still wraps. Everything here is measured with
 * `getBoundingClientRect`, and this covers what's left.
 */
const EPSILON = 1;


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
 *
 * Clipping with `overflow: hidden` was the obvious approach and it was wrong:
 * the row fills the card's width, so the toggle parked at its right edge with a
 * gap between it and the last visible tag, reading as though it belonged to the
 * detail link rather than to the tags. Instead the pills are measured and only
 * the ones that fit are rendered, which lets the toggle sit inline directly
 * after them. The measuring pass runs in a layout effect, before the browser
 * paints, so the full row is never visible.
 */
export function CardTagRow(props: {
  tags: SkillTag[];
  activeTag?: SkillTag | null;
  terms: string[];
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const pillWidths = useRef<number[]>([]);
  const toggleWidth = useRef(0);

  // `null` means "not measured yet", which renders every pill so the effect
  // below has something to measure.
  const [fit, setFit] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  // A search that matches a tag we'd otherwise drop would highlight something
  // that isn't on the page, so the row opens itself — the same courtesy
  // `resolveVerbosity` extends when a match hides below the current density.
  const revealForSearch = props.terms.length > 0
    && props.tags.some((tag) => textMatchesTerms(tag, props.terms));

  const measuring = fit === null;
  const open = expanded || revealForSearch || measuring;
  const shown = open ? props.tags : props.tags.slice(0, fit);
  const hidden = props.tags.length - shown.length;

  /** How many pills fit on one line once the toggle has been given its room. */
  const computeFit = useCallback((available: number) => {
    const widths = pillWidths.current;

    if (widths.length === 0 || available === 0) return null;

    const total = widths.reduce((sum, w) => sum + w, 0) + GAP * (widths.length - 1);

    // Everything fits, so no toggle is needed and none is reserved for.
    if (total <= available - EPSILON) return widths.length;

    const budget = available - toggleWidth.current - GAP - EPSILON;
    let used = 0;
    let count = 0;

    for (const width of widths) {
      const next = count === 0 ? width : used + GAP + width;

      if (next > budget) break;

      used = next;
      count += 1;
    }

    // Never drop to nothing: one pill plus a large count still reads.
    return Math.max(1, count);
  }, []);

  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const children = Array.from(el.children) as HTMLElement[];

    // Widths only need capturing while every pill is mounted. They don't change
    // with the container, so a resize can re-fit from the cached measurements.
    if (open && children.length > props.tags.length) {
      pillWidths.current = children
        .slice(0, props.tags.length)
        .map((c) => c.getBoundingClientRect().width);
      toggleWidth.current = children[props.tags.length].getBoundingClientRect().width;
    }

    const apply = () => {
      const next = computeFit(el.getBoundingClientRect().width);

      if (next !== null) setFit((prev) => (prev === next ? prev : next));
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(el);

    return () => observer.disconnect();
  }, [computeFit, open, props.tags]);

  // While measuring, the toggle carries the widest label it could ever hold, so
  // the real one is guaranteed to fit the space reserved for it.
  const toggleLabel = measuring
    ? `+${props.tags.length} more`
    : expanded ? 'Show less' : `+${hidden} more`;

  const showToggle = measuring || expanded || (hidden > 0 && !revealForSearch);

  return (
    <div className='flex-1 min-w-0 flex flex-wrap gap-1' ref={rowRef}>
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
          {toggleLabel}
        </button>
      )}
    </div>
  );
}
