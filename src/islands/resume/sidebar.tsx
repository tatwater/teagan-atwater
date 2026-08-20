import type { SkillTag } from '@/data/resume/types';
import type { SectionFilter } from '@/islands/resume/types';

import { useHotkey } from '@tanstack/react-hotkeys';
import { SECTION_OPTIONS } from '@/islands/resume/constants';
import { TagFilterAccordion } from '@/islands/resume/tag-filter-accordion';
import { ResultCountBlock } from '@/islands/resume/result-count-block';
import { cn } from '@/lib/utils';


export function ResumeSidebar(props: {
  activeTags: Set<SkillTag>;
  onTagClick: (tag: SkillTag) => void;
  onClearTags: () => void;
  activeSection: SectionFilter;
  onSectionChange: (s: SectionFilter) => void;
  resultCount: number;
  totalCount: number;
  showInternships: boolean;
  onShowInternshipsChange: (v: boolean) => void;
}) {
  useHotkey('Mod+X', (e) => {
    e.preventDefault();
    if (props.activeTags.size > 0) props.onClearTags();
  }, {
    ignoreInputs: true,
  });

  return (
    <aside className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto min-h-0 p-4 pb-6 flex flex-col gap-6'>
        {/* Section filter */}
        <div className='flex flex-col gap-2'>
          <span className='text-[10px] font-mono uppercase tracking-widest text-muted-foreground'>
            {`Section`}
          </span>
          <div className='flex flex-col gap-0.5'>
            {SECTION_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                className={cn(
                  'flex items-center justify-between px-2 py-1.5 text-xs transition-all border cursor-pointer',
                  props.activeSection === value
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
                onClick={() => props.onSectionChange(value)}
                type='button'
              >
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <TagFilterAccordion
          activeTags={props.activeTags}
          onTagClick={props.onTagClick}
        />
      </div>

      <div className='relative'>
        <div className='absolute -top-8 inset-x-0 h-8 bg-linear-to-t from-background to-transparent pointer-events-none' />
        <div className='-mx-px'>
          <ResultCountBlock
            hasActiveTags={props.activeTags.size > 0}
            onClearTags={props.onClearTags}
            onShowInternshipsChange={props.onShowInternshipsChange}
            resultCount={props.resultCount}
            showInternships={props.showInternships}
            totalCount={props.totalCount}
          />
        </div>
      </div>
    </aside>
  );
}
