import type { Verbosity, ViewMode } from '@/islands/resume/types';
import type { ResumeItem, SkillTag } from '@/data/resume/types';

import { useMemo } from 'react';
import { faChevronDown, faChevronRight } from '@fortawesome/sharp-regular-svg-icons';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EducationCard } from '@/islands/resume/card-education';
import { ExperienceCard } from '@/islands/resume/card-experience';
import { GroupedCard } from '@/islands/resume/card-grouped';
import { ProjectCard } from '@/islands/resume/card-project';
import { ExperienceTimeline } from '@/islands/resume/experience-timeline';
import {
  SECTION_COLOR,
  SECTION_ICON,
  SECTION_LABEL,
  SORTED_SECTION_ICON,
} from '@/islands/resume/constants';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { groupItems } from '@/data/resume/helpers';


interface CardProps {
  item: ResumeItem;
  activeTag?: SkillTag | null;
  searchTerms?: string[];
  verbosity: Verbosity;
}


/**
 * A ranked list mixes experience and projects, so each entry picks its own card
 * rather than inheriting one from the section it used to live in.
 */
function CardForItem(props: CardProps) {
  if (props.item.type === 'project')
    return <ProjectCard {...props} />;

  if (props.item.type === 'education')
    return <EducationCard {...props} />;

  return <ExperienceCard {...props} />;
}


/**
 * The ranked list, shown while a skill tag is active. Cards animate between
 * positions so a re-sort reads as movement rather than as the page redrawing
 * itself — unless the reader has asked for less motion, in which case they
 * simply snap.
 */
function SortedList(props: {
  activeTag: SkillTag | null;
  items: ResumeItem[];
  searchTerms?: string[];
  verbosity: Verbosity;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className='flex flex-col gap-2'>
      {props.items.map((item) => (
        <motion.div
          key={item.id}
          layout={reduceMotion ? false : 'position'}
          transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <CardForItem
            activeTag={props.activeTag}
            item={item}
            searchTerms={props.searchTerms}
            verbosity={props.verbosity}
          />
        </motion.div>
      ))}
    </div>
  );
}


function SectionContent(props: {
  activeTag: SkillTag | null;
  groups: ReturnType<typeof groupItems> | null;
  items: ResumeItem[];
  searchTerms?: string[];
  showTimeline: boolean;
  sorted: boolean;
  type: ResumeItem['type'];
  verbosity: Verbosity;
  viewMode: ViewMode;
}) {
  // Ranking outranks every other layout. The timeline's rail and the grouped
  // view's org clumping both encode an order this list no longer follows, so
  // both step aside rather than lie about it.
  if (props.sorted) {
    return (
      <SortedList
        activeTag={props.activeTag}
        items={props.items}
        searchTerms={props.searchTerms}
        verbosity={props.verbosity}
      />
    );
  }

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
  type: ResumeItem['type'];
  verbosity: Verbosity;
  viewMode: ViewMode;
  activeTag?: SkillTag | null;
  label?: string;
  searchTerms?: string[];
  sorted?: boolean;
}) {
  const groups = useMemo(
    () => (props.viewMode === 'grouped' ? groupItems(props.items) : null),
    [props.items, props.viewMode],
  );

  if (props.items.length === 0)
    return null;

  const sorted = Boolean(props.sorted);
  const showTimeline = !sorted && props.viewMode === 'chronological' && props.type === 'experience';
  const panelId = `resume-section-${props.type}${sorted ? '-sorted' : ''}`;

  return (
    <section>
      {/*
        The heading wraps the button rather than sitting inside it. A heading
        nested in a button is not exposed as a heading at all, which cost this
        page its only landmarks for jumping between sections — and the chevron
        was the sole indication of open or closed, which is no indication to
        anyone not looking at it. `aria-expanded` says it out loud.
      */}
      <h2>
        <button
          aria-controls={panelId}
          aria-expanded={!props.collapsed}
          className={cn(
            'group/header flex items-center gap-2 -mx-2 mb-1 px-3 py-2 rounded-xs w-[calc(100%+1rem)] cursor-pointer',
            'hover:bg-accent/50',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          )}
          onClick={props.onToggleCollapse}
          type='button'
        >
          <Icon
            className={cn('text-xs', SECTION_COLOR[props.type])}
            icon={sorted ? SORTED_SECTION_ICON : SECTION_ICON[props.type]}
          />
          <span className='text-xs font-mono uppercase tracking-widest text-muted-foreground group-hover/header:text-foreground transition-colors'>
            {props.label ?? SECTION_LABEL[props.type]}
          </span>
          <span className='text-[10px] font-mono text-muted-foreground/50 ml-0.5'>
            ({props.items.length})
          </span>
          <div className='flex-1 h-px bg-border ml-2' />
          <Icon
            className='text-[10px] text-muted-foreground/40 group-hover/header:text-muted-foreground transition-colors'
            icon={props.collapsed ? faChevronRight : faChevronDown}
          />
        </button>
      </h2>

      <AnimatePresence initial={false}>
        {!props.collapsed && (
          <motion.div
            className='overflow-y-clip'  // clips the height animation without forcing overflow-x:auto (unlike overflow:hidden), so horizontal bleed from the pandemic card is visible
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <SectionContent
              activeTag={props.activeTag ?? null}
              groups={groups}
              items={props.items}
              searchTerms={props.searchTerms}
              showTimeline={showTimeline}
              sorted={sorted}
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
