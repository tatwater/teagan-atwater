import type { Verbosity } from '@/islands/resume/types';
import type { OrgGroup, ResumeItem, SkillTag } from '@/data/resume/types';

import { faChevronRight } from '@fortawesome/sharp-regular-svg-icons';
import { CardBase } from '@/islands/resume/card-base';
import { PandemicCard } from '@/islands/resume/card-pandemic';
import { OrgBadge } from '@/islands/resume/org-badge';
import { TagPill } from '@/islands/resume/tag-pill';
import { textMatchesTerms } from '@/islands/resume/highlight';
import { resolveSharedDetail, splitGroupTags } from '@/data/resume/helpers';
import { formatDateRange, getDuration } from '@/data/resume/dates';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';


interface GroupedCardProps {
  group: OrgGroup;
  verbosity: Verbosity;
  searchTerms?: string[];
}


function GroupHeader({ group }: { group: OrgGroup }) {
  return (
    <div className='flex flex-col gap-1 px-4 py-3 bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
      <div className='flex items-center gap-2 min-w-0'>
        <OrgBadge
          logoShape={group.logoShape ?? 'squircle'}
          logoSrc={group.logoSrc}
          organization={group.organizationName}
          organizationUrl={group.organizationUrl}
        />
        <span className='text-xs font-mono text-muted-foreground/64'>
          ({group.items.length} roles)
        </span>
      </div>

      <div className='flex flex-col items-start text-left shrink-0 text-xs font-mono font-medium sm:items-end sm:text-right'>
        <span className='text-muted-foreground whitespace-nowrap'>
          {formatDateRange(group.dateStart, group.dateEnd)}
        </span>
        <span className='text-muted-foreground/64'>
          {getDuration(group.dateStart, group.dateEnd)}
        </span>
      </div>
    </div>
  );
}


function SharedDetailLink({ item }: { item: ResumeItem }) {
  return (
    <a
      className={cn(
        'shrink-0 flex items-center gap-1 -my-px h-6 px-2 text-xs font-mono font-medium whitespace-nowrap border border-transparent',
        'text-muted-foreground transition-colors',
        'group-hover:border-emerald-700 group-hover:bg-primary/10 group-hover:text-emerald-700',
        'group-focus-within:border-emerald-700 group-focus-within:bg-primary/10 group-focus-within:text-emerald-700',
      )}
      href={`/resume/${item.detailId ?? item.id}`}
      onClick={(e) => e.stopPropagation()}
    >
      {item.detailLabel}
      <Icon
        className='text-[10px]'
        icon={faChevronRight}
      />
    </a>
  );
}


function GroupFooter({
  commonTags,
  searchTerms,
  sharedDetail,
}: {
  commonTags: SkillTag[];
  searchTerms: string[];
  sharedDetail?: ResumeItem;
}) {
  return (
    <div className='flex flex-col gap-2 px-4 py-3 bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
      <div className='flex flex-wrap gap-1'>
        {commonTags.map((tag) => (
          <TagPill
            key={tag}
            highlighted={textMatchesTerms(tag, searchTerms)}
            small
            tag={tag}
          />
        ))}
      </div>

      {sharedDetail && <SharedDetailLink item={sharedDetail} />}
    </div>
  );
}


export function GroupedCard(props: GroupedCardProps) {
  const { group, searchTerms, verbosity } = props;
  const terms = searchTerms ?? [];

  // Pandemic card renders with its own custom component in any view mode
  if (group.items[0]?.variant === 'pandemic') {
    return (
      <PandemicCard
        item={group.items[0]}
        searchTerms={searchTerms}
        verbosity={verbosity}
      />
    );
  }

  const sharedDetail = resolveSharedDetail(group.items);
  const { commonTags, uniqueTagsByItemId } = splitGroupTags(group.items);
  const showFooter = commonTags.length > 0 || Boolean(sharedDetail);

  const footer = showFooter
    ? <GroupFooter commonTags={commonTags} searchTerms={terms} sharedDetail={sharedDetail} />
    : null;

  return (
    <div
      className={cn(
        'border border-border bg-card transition-all duration-200',
        sharedDetail && 'group hover:border-emerald-800/28',
      )}
    >
      {sharedDetail ? (
        // Mode 1: shared detail page
        <div className='flex flex-col divide-y divide-border'>
          <GroupHeader group={group} />
          {group.items.map((item) => {
            const uniqueTags = uniqueTagsByItemId.get(item.id) ?? [];

            return (
              <CardBase
                key={item.id}
                item={item}
                nestingMode='shared-page'
                searchTerms={searchTerms}
                showDuration={true}
                showTagFooter={uniqueTags.length > 0}
                tagsOverride={uniqueTags}
                verbosity={verbosity}
              />
            );
          })}
          {footer}
        </div>
      ) : (
        // Mode 2: own detail pages
        <div className='flex flex-col'>
          <GroupHeader group={group} />
          {group.items.map((item, index) => {
            const isLast = index === group.items.length - 1;
            const uniqueTags = uniqueTagsByItemId.get(item.id) ?? [];

            return (
              <div
                key={item.id}
                className={cn(
                  '-mx-px -mt-px',
                  // When there's no footer, extend the last card 1px down so its bottom border
                  // coincides with the outer card's bottom border (no double-border at bottom)
                  isLast && !showFooter && '-mb-px',
                )}
              >
                <CardBase
                  item={item}
                  nestingMode='own-page'
                  searchTerms={searchTerms}
                  showDuration={true}
                  showTagFooter={uniqueTags.length > 0 || !!item.detailLabel}
                  tagsOverride={uniqueTags}
                  verbosity={verbosity}
                />
              </div>
            );
          })}
          {footer}
        </div>
      )}
    </div>
  );
}
