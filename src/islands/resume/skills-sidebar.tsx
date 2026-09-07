import type { SkillTag } from '@/data/resume/types';

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

  return (
    <div className={cn('flex flex-col gap-5', props.className)}>
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
                  small
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
