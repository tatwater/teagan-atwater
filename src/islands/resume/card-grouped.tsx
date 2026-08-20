import type { Verbosity } from '@/islands/resume/types';
import type { OrgGroup, SkillTag } from '@/data/resume/types';

import { faChevronRight } from '@fortawesome/sharp-regular-svg-icons';
import { CardBase } from '@/islands/resume/card-base';
import { PandemicCard } from '@/islands/resume/card-pandemic';
import { OrgBadge } from '@/islands/resume/org-badge';
import { TagPill } from '@/islands/resume/tag-pill';
import { formatDateRange, getDuration } from '@/islands/resume/helpers';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';


export function GroupedCard(props: {
  group: OrgGroup;
  verbosity: Verbosity;
  activeTags: Set<SkillTag>;
  onTagClick: (tag: SkillTag) => void;
}) {
  // Pandemic card renders with its own custom component in any view mode
  if (props.group.items[0]?.variant === 'pandemic') {
    return (
      <PandemicCard
        activeTags={props.activeTags}
        item={props.group.items[0]}
        verbosity={props.verbosity}
      />
    );
  }

  const itemsWithLinks = props.group.items.filter((item) => item.detailLabel);
  const hasSharedDetailPage = itemsWithLinks.length > 0 && new Set(itemsWithLinks.map((item) => item.detailId ?? item.id)).size === 1;

  const allItemTagSets = props.group.items.map((item) => new Set(item.tags));
  const commonTags = (props.group.items[0]?.tags ?? []).filter((tag) =>
    allItemTagSets.every((set) => set.has(tag))
  );
  const commonTagSet = new Set(commonTags);
  const uniqueTagsMap = new Map(
    props.group.items.map((item) => [
      item.id,
      item.tags.filter((tag) => !commonTagSet.has(tag)),
    ])
  );

  // Footer is shown when there are shared tags, or when Mode 1 has a detail link.
  const detailItem = hasSharedDetailPage ? props.group.items.find((item) => item.detailLabel) : undefined;
  const showFooter = commonTags.length > 0 || (hasSharedDetailPage && !!detailItem?.detailLabel);

  const header = (
    <div className='flex flex-col gap-1 px-4 py-3 bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
      <div className='flex items-center gap-2 min-w-0'>
        <OrgBadge
          logoShape={props.group.logoShape ?? 'squircle'}
          logoSrc={props.group.logoSrc}
          organization={props.group.organizationName}
          organizationUrl={props.group.organizationUrl}
        />
        <span className='text-xs font-mono text-muted-foreground/64'>
          ({props.group.items.length} roles)
        </span>
      </div>

      <div className='flex flex-col items-start text-left shrink-0 text-xs font-mono font-medium sm:items-end sm:text-right'>
        <span className='text-muted-foreground whitespace-nowrap'>
          {formatDateRange(props.group.dateStart, props.group.dateEnd)}
        </span>
        <span className='text-muted-foreground/64'>
          {getDuration(props.group.dateStart, props.group.dateEnd)}
        </span>
      </div>
    </div>
  );

  const footer = showFooter ? (
    <div className='flex flex-col gap-2 px-4 py-3 bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
      <div className='flex flex-wrap gap-1'>
        {commonTags.map((tag) => (
          <TagPill
            key={tag}
            active={props.activeTags.has(tag)}
            onClick={() => props.onTagClick(tag)}
            small
            tag={tag}
          />
        ))}
      </div>

      {hasSharedDetailPage && detailItem?.detailLabel && (
        <a
          className={cn(
            'shrink-0 flex items-center gap-1 -my-px h-6 px-2 text-xs font-mono font-medium whitespace-nowrap border border-transparent',
            'text-muted-foreground transition-colors',
            'group-hover:border-emerald-700 group-hover:bg-primary/10 group-hover:text-emerald-700',
            'group-focus-within:border-emerald-700 group-focus-within:bg-primary/10 group-focus-within:text-emerald-700',
          )}
          href={`/resume/${detailItem.detailId ?? detailItem.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          {detailItem.detailLabel}
          <Icon
            className='text-[10px]'
            icon={faChevronRight}
          />
        </a>
      )}
    </div>
  ) : null;


  return (
    <div
      className={cn(
        'border border-border bg-card transition-all duration-200',
        hasSharedDetailPage && 'group hover:border-emerald-800/28',
      )}
    >
      {hasSharedDetailPage ? (
        // Mode 1: shared detail page
        <div className='flex flex-col divide-y divide-border'>
          {header}
          {props.group.items.map((item) => {
            const uniqueTags = uniqueTagsMap.get(item.id) ?? [];
            return (
              <CardBase
                key={item.id}
                activeTags={props.activeTags}
                item={item}
                nestingMode='shared-page'
                onTagClick={props.onTagClick}
                showDuration={true}
                showTagFooter={uniqueTags.length > 0}
                tagsOverride={uniqueTags}
                verbosity={props.verbosity}
              />
            );
          })}
          {footer}
        </div>
      ) : (
        // Mode 2: own detail pages
        <div className='flex flex-col'>
          {header}
          {props.group.items.map((item, index) => {
            const isLast = index === props.group.items.length - 1;
            const uniqueTags = uniqueTagsMap.get(item.id) ?? [];

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
                  activeTags={props.activeTags}
                  item={item}
                  nestingMode='own-page'
                  onTagClick={props.onTagClick}
                  showDuration={true}
                  showTagFooter={uniqueTags.length > 0 || !!item.detailLabel}
                  tagsOverride={uniqueTags}
                  verbosity={props.verbosity}
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
