import type { SkillCategory } from '@/data/resume/types';

import { TagPill } from '@/islands/resume/tag-pill';
import { textMatchesTerms } from '@/islands/resume/highlight';
import { skillCategories } from '@/data/resume/skills';
import { cn } from '@/lib/utils';


// Order mirrors the printed résumé: the five craft categories first, then the
// two the one-page résumé leaves off.
const CATEGORY_ORDER: SkillCategory[] = [
  'Craft & Design',
  'Web & Native',
  'State & Data Persistence',
  'Architecture & Rendering',
  'Agentic Processes',
  'Backend & Services',
  'Product & Leadership',
];


/**
 * A read-only inventory of the skill vocabulary. Deliberately not interactive:
 * the résumé no longer offers any control that hides entries, so these are
 * labels, not filters. They do respond to search, highlighting in step with the
 * matching tags on the cards themselves.
 */
export function SkillsPanel(props: {
  className?: string;
  searchTerms?: string[];
}) {
  const terms = props.searchTerms ?? [];

  return (
    <div className={cn('flex flex-col gap-5', props.className)}>
      <span className='text-[10px] font-mono uppercase tracking-widest text-muted-foreground'>
        {`Skills`}
      </span>

      {CATEGORY_ORDER.map((category) => (
        <div key={category} className='flex flex-col gap-1.5'>
          <span className='text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60'>
            {category}
          </span>
          <div className='flex flex-wrap gap-1'>
            {skillCategories[category].map((tag) => (
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
