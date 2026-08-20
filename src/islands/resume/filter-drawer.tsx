import type { SkillTag } from '@/data/resume/types';

import { ResultCountBlock } from '@/islands/resume/result-count-block';
import { TagFilterAccordion } from '@/islands/resume/tag-filter-accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';


export function ResumeFilterDrawer(props: {
  activeTags: Set<SkillTag>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearTags: () => void;
  onTagClick: (tag: SkillTag) => void;
  resultCount: number;
  showInternships: boolean;
  onShowInternshipsChange: (v: boolean) => void;
  totalCount: number;
}) {
  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <SheetContent className='max-w-72'>
        <SheetHeader>
          <SheetTitle>{`Filter by tag`}</SheetTitle>
        </SheetHeader>

        {/* Scrollable accordion body */}
        <div className='flex-1 overflow-y-auto min-h-0 px-4 pb-6'>
          <TagFilterAccordion
            activeTags={props.activeTags}
            onTagClick={props.onTagClick}
            defaultOpen
          />
        </div>

        {/* Result count + clear — full-bleed footer */}
        <div className='relative'>
          <div className='absolute -top-8 inset-x-0 h-8 bg-linear-to-t from-background to-transparent pointer-events-none' />
          <ResultCountBlock
            hasActiveTags={props.activeTags.size > 0}
            onClearTags={props.onClearTags}
            onShowInternshipsChange={props.onShowInternshipsChange}
            resultCount={props.resultCount}
            showInternships={props.showInternships}
            totalCount={props.totalCount}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
