import type { Verbosity } from '@/islands/resume/types';
import type { ResumeItem } from '@/data/resume/types';

import { ExperienceCard } from '@/islands/resume/card-experience';
import { PandemicCard } from '@/islands/resume/card-pandemic';


function TimelineDot() {
  return (
    <div className='absolute left-1.75 top-5.5 size-2.5 rounded-full bg-background border-2 border-border z-10' />
  );
}


export function ExperienceTimeline(props: {
  items: ResumeItem[];
  searchTerms?: string[];
  verbosity: Verbosity;
}) {
  return (
    <div className='relative'>
      {/* Continuous vertical rail */}
      <div className='absolute left-2.75 top-0 bottom-0 w-0.5 bg-border-light z-10' />

      <div className='space-y-3'>
        {props.items.map((item) => {
          if (item.variant === 'pandemic') {
            return (
              <div key={item.id} className='relative'>
                <PandemicCard
                  isTimeline
                  item={item}
                  searchTerms={props.searchTerms}
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
                item={item}
                searchTerms={props.searchTerms}
                verbosity={props.verbosity}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
