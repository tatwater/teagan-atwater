import type { SkillTag } from '@/data/resume/types';

import { useState } from 'react';
import { TagPill } from '@/islands/resume/tag-pill';
import { textMatchesTerms } from '@/islands/resume/highlight';
import { sidebarSkillCategories } from '@/data/resume/skills';
import { cn } from '@/lib/utils';


/**
 * The curated skill vocabulary — only tags at the 'sidebar' rung or above reach
 * here, and a category left empty by that drops out entirely.
 *
 * Clicking a tag sorts the entries by it rather than filtering them: matching
 * entries rise, nothing disappears. A tag no entry carries sorts nothing, so it
 * renders as an inert label instead of a button — the list still shows the full
 * vocabulary without promising an interaction it can't deliver.
 *
 * Tags also respond to search, highlighting in step with the matching tags on
 * the cards. That's a separate, weaker state than the active sort tag.
 *
 * To the keyboard the whole panel is one tab stop. At `lg` it sits before the
 * entries in the document, and with every pill a stop of its own it was
 * thirty-odd presses of Tab between the toolbar and the first job — so focus
 * roves instead: Tab lands on one pill, the arrow keys walk the rest, and the
 * next Tab leaves. Which pill Tab lands on is the last one focused, or failing
 * that the active sort tag, or failing that the first — so leaving and coming
 * back picks up where the reader was rather than at the top.
 */
export function SkillsPanel(props: {
  activeTag: SkillTag | null;
  coverage: Map<SkillTag, number>;
  onTagClick: (tag: SkillTag) => void;
  className?: string;
  searchTerms?: string[];
}) {
  const terms = props.searchTerms ?? [];
  const categories = sidebarSkillCategories();

  // Set on every focus, however it arrived — arrow, Tab, or a mouse click —
  // so the roving stop is always the pill the reader was last on.
  const [focusedTag, setFocusedTag] = useState<SkillTag | null>(null);

  const stops = categories.flatMap(
    ([, tags]) => tags.filter((tag) => (props.coverage.get(tag) ?? 0) > 0),
  );

  const tabStop =
    focusedTag !== null && stops.includes(focusedTag) ? focusedTag
    : props.activeTag !== null && stops.includes(props.activeTag) ? props.activeTag
    : stops[0] ?? null;

  // The pills wrap into rows of uneven length, so up and down have no column
  // to follow; all four arrows just walk the list, which is what the reader
  // reaches for either way.
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('button[aria-pressed]'),
    );
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;

    const lastIndex = buttons.length - 1;

    const nextIndex =
      event.key === 'ArrowDown' || event.key === 'ArrowRight' ? (index + 1) % buttons.length
      : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? (index + lastIndex) % buttons.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? lastIndex
      : null;

    if (nextIndex === null)
      return;

    event.preventDefault();
    buttons[nextIndex]?.focus();
  }

  return (
    <div
      aria-label='Skills'
      className={cn('flex flex-col gap-5', props.className)}
      onKeyDown={handleKeyDown}
      role='group'
    >
      <span className='text-[10px] font-mono uppercase tracking-widest text-muted-foreground'>
        {`Skills`}
      </span>

      {categories.map(([category, tags]) => (
        <div key={category} className='flex flex-col gap-1.5'>
          <span className='text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60'>
            {category}
          </span>
          <div className='flex flex-wrap gap-1'>
            {tags.map((tag) => {
              const count = props.coverage.get(tag) ?? 0;

              return (
                <TagPill
                  key={tag}
                  active={props.activeTag === tag}
                  highlighted={textMatchesTerms(tag, terms)}
                  onClick={count > 0 ? props.onTagClick : undefined}
                  onFocus={setFocusedTag}
                  small
                  tabIndex={tag === tabStop ? 0 : -1}
                  tag={tag}
                  title={count > 0
                    ? `Sort by ${tag} — ${count} ${count === 1 ? 'entry' : 'entries'}`
                    : undefined}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
