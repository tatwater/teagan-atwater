import type { Verbosity } from '@/islands/resume/types';
import type { ResumeItem, SkillTag } from '@/data/resume/types';

import { faChevronRight, faLocationDot } from '@fortawesome/sharp-regular-svg-icons';
import { DynamicDescription } from '@/islands/resume/dynamic-description';
import { OrgBadge } from '@/islands/resume/org-badge';
import { TagPill } from '@/islands/resume/tag-pill';
import { formatDateRange, getDuration, getInitials } from '@/islands/resume/helpers';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';


export function CardBase(props: {
  item: ResumeItem;
  verbosity: Verbosity;
  activeTags?: Set<SkillTag>;
  logoShape?: 'circle' | 'square' | 'squircle';
  /**
   * When set, the card is rendered for use inside GroupedCard.
   * - 'shared-page': all items link to the same detail page — no border, no hover, no detail link
   * - 'own-page': each item has its own detail page — full border + hover, keep detail link
   */
  nestingMode?: 'shared-page' | 'own-page';
  onTagClick?: (tag: SkillTag) => void;
  showDuration?: boolean;
  showLogoInTitle?: boolean;
  showOrgInHeader?: boolean;
  showTagFooter?: boolean;
  tagsOverride?: SkillTag[];  // When provided, overrides the tags shown in the tag footer
}) {
  const resolvedSrc = props.showLogoInTitle && props.item.logoSrc
    ? `/src/assets/logos/${props.item.logoSrc}`
    : undefined;

  const displayTags = props.tagsOverride ?? props.item.tags;

  return (
    <article
      className={cn(
        'relative pt-3.5 pl-5 pr-4 pb-4.5',
        !props.nestingMode && cn('border border-border bg-card', props.item.detailLabel && 'hover:border-emerald-800/28'),
        props.nestingMode === 'own-page' && cn('border border-border bg-card relative z-0 hover:z-10', props.item.detailLabel && 'hover:border-emerald-800/28'),
        props.nestingMode === 'shared-page' && 'bg-card',
        'group transition-all duration-200',
      )}
    >
      {/* ── Top row: badge ←→ dates, stacks vertically on mobile ─────────── */}
      <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6'>
        {/* Badge: Avatar+Title (showLogoInTitle), OrgBadge (org in header), or Title (fallback) */}
        {props.showLogoInTitle
          ? (
              <div className='flex items-center gap-1.5 py-1'>
                <Avatar
                  alt={props.item.title}
                  fallback={getInitials(props.item.title)}
                  shape={props.logoShape ?? 'circle'}
                  size='sm'
                  src={resolvedSrc}
                />
                <h3 className='font-semibold text-foreground leading-snug'>
                  {props.item.title}
                </h3>
              </div>
            )
          : props.showOrgInHeader && props.item.organizationName
            ? (
                <div className='-mt-1 -ml-2'>
                  <OrgBadge
                    logoShape={props.logoShape ?? 'circle'}
                    logoSrc={props.item.logoSrc}
                    organization={props.item.organizationName}
                    organizationUrl={props.item.organizationUrl}
                    size='sm'
                  />
                </div>
              )
            : (
                // No org badge — title takes the badge position alongside dates
                <div className='flex-1 min-w-0'>
                  <h3 className='font-semibold text-foreground leading-snug'>
                    {props.item.title}
                  </h3>
                </div>
              )
        }

        {/* Dates — left-aligned on mobile, right-aligned on sm+ */}
        {!props.item.hideDates && (
          <div className='flex flex-col items-start text-left sm:items-end sm:text-right shrink-0 text-xs font-mono'>
            <span className='text-muted-foreground whitespace-nowrap'>
              {formatDateRange(props.item.dateStart, props.item.dateEnd)}
            </span>
            {props.showDuration && (
              <span className='text-muted-foreground/64'>
                {getDuration(props.item.dateStart, props.item.dateEnd)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Title (full-width) — only when OrgBadge is in the badge position ── */}
      {!props.showLogoInTitle && props.showOrgInHeader && props.item.organizationName && (
        <h3 className='font-semibold text-foreground leading-snug mt-2 sm:mt-1'>
          {props.item.title}
        </h3>
      )}

      {/* ── Location (full-width, always below the top row) ──────────────── */}
      {props.item.location && (
        <div className='flex items-center gap-1 mt-0.5 text-xs text-muted-foreground/64'>
          <Icon icon={faLocationDot} />
          <span>
            {props.item.location}
          </span>
        </div>
      )}

      <DynamicDescription
        item={props.item}
        verbosity={props.verbosity}
      />

      {/* ── Tag footer ───────────────────────────────────────────────────── */}
      {props.showTagFooter && (
        <div className={cn(
          'flex flex-col mt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-2',
          !props.showLogoInTitle && props.showOrgInHeader && props.item.organizationName ? 'gap-3' : 'gap-2',
        )}>
          <div className='flex flex-wrap gap-1'>
            {displayTags.map((tag) => (
              <TagPill
                key={tag}
                active={(props.activeTags ?? new Set()).has(tag)}
                onClick={() => props.onTagClick?.(tag)}
                small
                tag={tag}
              />
            ))}
          </div>

          {props.item.detailLabel && props.nestingMode !== 'shared-page' && (
            <a
              className={cn(
                'group/detail shrink-0 flex items-center justify-center gap-1 -my-px h-6 pr-2 text-xs font-mono font-medium whitespace-nowrap border border-transparent',
                'text-muted-foreground transition-colors',
                'group-hover:border-emerald-700 group-hover:bg-primary/10 group-hover:text-emerald-700',
                'group-focus-within:border-emerald-700 group-focus-within:bg-primary/10 group-focus-within:text-emerald-700',
                'pl-6 sm:pl-2',
              )}
              href={`/resume/${props.item.detailId ?? props.item.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              {props.item.detailLabel}
              <Icon
                className='text-[10px] sm:transition-transform sm:group-hover/detail:translate-x-0.5'
                icon={faChevronRight}
              />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
