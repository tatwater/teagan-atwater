import type { SkillTag } from '@/data/resume/types';

import { cn } from '@/lib/utils';


/**
 * A skill tag. Three visual states, deliberately distinct from one another:
 *
 *   active       You clicked it, and the list is sorted by it. Solid.
 *   highlighted  The current search matches it. Tinted.
 *   default      Neither.
 *
 * `onClick` is what makes a pill a control. Without it the pill renders as a
 * span with no hover and no pointer, because a tag that can't do anything
 * shouldn't look like it can — that was the original complaint.
 */
export function TagPill(props: {
  tag: SkillTag;
  active?: boolean;
  highlighted?: boolean;
  label?: string;
  onClick?: (tag: SkillTag) => void;
  /** Fires when the pill takes focus, however it got it. See SkillsPanel. */
  onFocus?: (tag: SkillTag) => void;
  small?: boolean;
  /** For a parent that roves focus over its pills; the default is a tab stop. */
  tabIndex?: number;
  title?: string;
}) {
  const className = cn(
    'inline-flex items-center gap-1 border font-mono transition-all select-none',
    props.small
      ? 'h-5.5 px-1.5 text-[10px]'
      : 'h-6.5 px-2 text-xs',
    props.active
      ? 'border-primary bg-primary text-primary-foreground'
      : props.highlighted
        ? 'border-primary bg-primary/10 text-primary'
        : 'border-border bg-muted/50 text-muted-foreground',
    props.onClick && !props.active && 'hover:border-primary/60 hover:text-foreground',
  );

  if (!props.onClick) {
    return (
      <span className={className} title={props.title}>
        {props.label ?? props.tag}
      </span>
    );
  }

  return (
    <button
      aria-pressed={Boolean(props.active)}
      className={cn(
        className,
        'cursor-pointer',
        // The pills sit shoulder to shoulder in the sidebar, so the ring is
        // offset off the border rather than drawn on top of the neighbour's.
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'focus-visible:ring-offset-1 focus-visible:ring-offset-background',
      )}
      onClick={() => props.onClick?.(props.tag)}
      onFocus={() => props.onFocus?.(props.tag)}
      tabIndex={props.tabIndex}
      title={props.title}
      type='button'
    >
      {props.label ?? props.tag}
    </button>
  );
}
