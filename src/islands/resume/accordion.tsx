import type { Verbosity, ViewMode } from '@/islands/resume/types';
import type { ResumeItem } from '@/data/resume/types';

import { useMemo } from 'react';
import { faChevronDown, faChevronRight } from '@fortawesome/sharp-regular-svg-icons';
import { AnimatePresence, motion } from 'motion/react';
import { EducationCard } from '@/islands/resume/card-education';
import { ExperienceCard } from '@/islands/resume/card-experience';
import { GroupedCard } from '@/islands/resume/card-grouped';
import { ProjectCard } from '@/islands/resume/card-project';
import { ExperienceTimeline } from '@/islands/resume/experience-timeline';
import { SECTION_COLOR, SECTION_ICON, SECTION_LABEL } from '@/islands/resume/constants';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { groupItems } from '@/data/resume/helpers';


function SectionContent(props: {
  groups: ReturnType<typeof groupItems> | null;
  items: ResumeItem[];
  searchTerms?: string[];
  showTimeline: boolean;
  type: ResumeItem['type'];
  verbosity: Verbosity;
  viewMode: ViewMode;
}) {
  if (props.showTimeline) {
    return (
      <ExperienceTimeline
        items={props.items}
        searchTerms={props.searchTerms}
        verbosity={props.verbosity}
      />
    );
  }

  if (props.type === 'experience' && props.viewMode === 'grouped' && props.groups) {
    return (
      <div className='flex flex-col gap-2'>
        {props.groups.map((group) =>
          group.items.length > 1 || group.items[0]?.variant
            ? (
                <GroupedCard
                  key={group.key}
                  group={group}
                  searchTerms={props.searchTerms}
                  verbosity={props.verbosity}
                />
              )
            : (
                <ExperienceCard
                  key={group.key}
                  item={group.items[0]}
                  searchTerms={props.searchTerms}
                  verbosity={props.verbosity}
                />
              )
        )}
      </div>
    );
  }

  if (props.type === 'education') {
    return (
      <div className='flex flex-col gap-2'>
        {props.items.map((item) => (
          <EducationCard
            key={item.id}
            item={item}
            searchTerms={props.searchTerms}
            verbosity={props.verbosity}
          />
        ))}
      </div>
    );
  }

  if (props.type === 'project') {
    return (
      <div className='flex flex-col gap-2'>
        {props.items.map((item) => (
          <ProjectCard
            key={item.id}
            item={item}
            searchTerms={props.searchTerms}
            verbosity={props.verbosity}
          />
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-2'>
      {props.items.map((item) => (
        <ExperienceCard
          key={item.id}
          item={item}
          searchTerms={props.searchTerms}
          verbosity={props.verbosity}
        />
      ))}
    </div>
  );
}


export function ResumeAccordion(props: {
  collapsed: boolean;
  items: ResumeItem[];
  onToggleCollapse: () => void;
  searchTerms?: string[];
  type: ResumeItem['type'];
  verbosity: Verbosity;
  viewMode: ViewMode;
}) {
  const groups = useMemo(
    () => (props.viewMode === 'grouped' ? groupItems(props.items) : null),
    [props.items, props.viewMode],
  );

  if (props.items.length === 0)
    return null;

  const showTimeline = props.viewMode === 'chronological' && props.type === 'experience';

  return (
    <section>
      <button
        className='group/header flex items-center gap-2 -mx-2 mb-1 px-3 py-2 rounded-xs w-[calc(100%+1rem)] hover:bg-accent/50 cursor-pointer'
        onClick={props.onToggleCollapse}
        type='button'
      >
        <Icon
          className={cn('text-xs', SECTION_COLOR[props.type])}
          icon={SECTION_ICON[props.type]}
        />
        <h2 className='text-xs font-mono uppercase tracking-widest text-muted-foreground group-hover/header:text-foreground transition-colors'>
          {SECTION_LABEL[props.type]}
        </h2>
        <span className='text-[10px] font-mono text-muted-foreground/50 ml-0.5'>
          ({props.items.length})
        </span>
        <div className='flex-1 h-px bg-border ml-2' />
        <Icon
          className='text-[10px] text-muted-foreground/40 group-hover/header:text-muted-foreground transition-colors'
          icon={props.collapsed ? faChevronRight : faChevronDown}
        />
      </button>

      <AnimatePresence initial={false}>
        {!props.collapsed && (
          <motion.div
            className='overflow-y-clip'  // clips the height animation without forcing overflow-x:auto (unlike overflow:hidden), so horizontal bleed from the pandemic card is visible
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <SectionContent
              groups={groups}
              items={props.items}
              searchTerms={props.searchTerms}
              showTimeline={showTimeline}
              type={props.type}
              verbosity={props.verbosity}
              viewMode={props.viewMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
