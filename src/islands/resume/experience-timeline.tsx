import type { Verbosity } from '@/islands/resume/types';
import type { ResumeItem, SkillTag } from '@/data/resume/types';

import { useMemo } from 'react';
import { ExperienceCard } from '@/islands/resume/card-experience';
import { PandemicCard } from '@/islands/resume/card-pandemic';


function TimelineDot() {
  return (
    <div className='absolute left-1.75 top-5.5 size-2.5 rounded-full bg-background border-2 border-border z-10' />
  );
}

function TimelineGap(props: {
  hiddenCount: number;
}) {
  return (
    <div className='relative pl-9 py-2 flex items-center gap-3'>
      <svg
        aria-hidden='true'
        className='absolute z-20 text-border-light'
        fill='none'
        height='36'
        style={{ left: '2px', top: '50%', transform: 'translateY(-50%)' }}
        viewBox='0 0 20 36'
        width='20'
      >
        {/* Mask to erase the rail behind the break */}
        <rect x='7' y='0' width='6' height='36' className='fill-background' />
        <path
          d='M10,0 L10,10 L16,14 L4,22 L10,26 L10,36'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
        />
      </svg>
      <span className='text-[10px] font-mono text-muted-foreground/80 uppercase tracking-wider'>
        {`${props.hiddenCount} filtered`}
      </span>
    </div>
  );
}


export function ExperienceTimeline(props: {
  activeTags: Set<SkillTag>;
  allItems: ResumeItem[];
  items: ResumeItem[];
  onTagClick: (tag: SkillTag) => void;
  verbosity: Verbosity;
}) {
  type Entry =
    | { kind: 'item'; item: ResumeItem }
    | { kind: 'gap'; hiddenCount: number };

  const entries = useMemo<Entry[]>(() => {
    const result: Entry[] = [];

    for (let i = 0; i < props.items.length; i++) {
      if (i > 0) {
        const prevIdx = props.allItems.findIndex((x) => x.id === props.items[i - 1].id);
        const currIdx = props.allItems.findIndex((x) => x.id === props.items[i].id);
        if (currIdx - prevIdx > 1) {
          result.push({ kind: 'gap', hiddenCount: currIdx - prevIdx - 1 });
        }
      }
      result.push({ kind: 'item', item: props.items[i] });
    }
    return result;
  }, [props.items, props.allItems]);


  return (
    <div className='relative'>
      {/* Continuous vertical rail */}
      <div className='absolute left-2.75 top-0 bottom-0 w-0.5 bg-border-light z-10' />

      <div className='space-y-3'>
        {entries.map((entry, i) => {
          if (entry.kind === 'gap') {
            return (
              <TimelineGap
                key={`gap-${i}`}
                hiddenCount={entry.hiddenCount}
              />
            );
          }

          const { item } = entry;

          if (item.variant === 'pandemic') {
            return (
              <div key={item.id} className='relative'>
                <PandemicCard
                  activeTags={props.activeTags}
                  isTimeline
                  item={item}
                  verbosity={props.verbosity}
                />
              </div>
            );
          }
          return (
            <div
              key={item.id}
              className='relative pl-9'
            >
              <TimelineDot />
              <ExperienceCard
                activeTags={props.activeTags}
                item={item}
                onTagClick={props.onTagClick}
                verbosity={props.verbosity}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
