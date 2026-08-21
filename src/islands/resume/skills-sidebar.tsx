import { TagPill } from '@/islands/resume/tag-pill';
import { textMatchesTerms } from '@/islands/resume/highlight';
import { sidebarSkillCategories } from '@/data/resume/skills';
import { cn } from '@/lib/utils';


/**
 * A read-only inventory of the visible skill vocabulary — tags marked 'hidden'
 * in the taxonomy never reach here, and a category left empty by that drops out
 * entirely. Deliberately not interactive: the résumé no longer offers any
 * control that hides entries, so these are labels, not filters. They do respond
 * to search, highlighting in step with the matching tags on the cards.
 */
export function SkillsPanel(props: {
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
            {tags.map((tag) => (
              <TagPill
                key={tag}
                highlighted={textMatchesTerms(tag, terms)}
                small
                tag={tag}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
