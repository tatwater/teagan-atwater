import type { SkillCategory, SkillTag } from '@/data/resume/types';

import { useState } from 'react';
import { faChevronDown, faChevronRight } from '@fortawesome/sharp-regular-svg-icons';
import { AnimatePresence, motion } from 'motion/react';
import { TagPill } from '@/islands/resume/tag-pill';
import { Icon } from '@/components/icon';
import { skillCategories } from '@/data/resume/skills';


export function TagFilterAccordion(props: {
  activeTags: Set<SkillTag>;
  onTagClick: (tag: SkillTag) => void;
  /** When true, all categories are expanded by default. */
  defaultOpen?: boolean;
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<SkillCategory>>(
    () => props.defaultOpen
      ? new Set(Object.keys(skillCategories) as SkillCategory[])
      : new Set(),
  );

  const toggleCategory = (cat: SkillCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className='flex flex-col gap-2'>
      <span className='text-[10px] font-mono uppercase tracking-widest text-muted-foreground'>
        {`Filter by Skill`}
      </span>
      <div className='flex flex-col gap-1'>
        {(Object.entries(skillCategories) as [SkillCategory, SkillTag[]][]).map(([category, tags]) => {
          const activeInCategory = tags.filter((t) => props.activeTags.has(t)).length;
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category}>
              <button
                className='flex items-center justify-between w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer group/cat'
                onClick={() => toggleCategory(category)}
                type='button'
              >
                <span className='flex items-center gap-2'>
                  <Icon
                    className='text-[10px] text-muted-foreground/40 group-hover/cat:text-muted-foreground transition-colors'
                    icon={isExpanded ? faChevronDown : faChevronRight}
                  />
                  {category}
                </span>
                {activeInCategory > 0 && (
                  <span className='text-[10px] font-mono font-medium text-primary'>
                    {activeInCategory}
                  </span>
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    className='overflow-hidden pt-1'
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeInOut' }}
                  >
                    <div className='pl-5.5 pb-1 flex flex-wrap gap-1'>
                      {tags.map((tag) => (
                        <TagPill
                          key={tag}
                          active={props.activeTags.has(tag)}
                          onClick={() => props.onTagClick(tag)}
                          small
                          tag={tag}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
