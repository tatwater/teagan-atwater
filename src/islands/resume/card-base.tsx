import type { Verbosity } from '@/islands/resume/types';
import type { ResumeItem, SkillTag } from '@/data/resume/types';

import { faChevronRight, faLocationDot } from '@fortawesome/sharp-regular-svg-icons';
import { DynamicDescription } from '@/islands/resume/dynamic-description';
import { Highlight, textMatchesTerms } from '@/islands/resume/highlight';
import { OrgBadge } from '@/islands/resume/org-badge';
import { TagPill } from '@/islands/resume/tag-pill';
import { formatDateRange, getDuration } from '@/data/resume/dates';
import { visibleTags } from '@/data/resume/skills';
import { getInitials } from '@/islands/resume/helpers';
import { logoUrl } from '@/lib/logos';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';


type LogoShape = 'circle' | 'square' | 'squircle';

/**
 * When set, the card is rendered for use inside GroupedCard.
 * - 'shared-page': all items link to the same detail page — no border, no hover, no detail link
 * - 'own-page': each item has its own detail page — full border + hover, keep detail link
 */
type NestingMode = 'shared-page' | 'own-page';


interface CardBaseProps {
  item: ResumeItem;
  verbosity: Verbosity;
  logoShape?: LogoShape;
  nestingMode?: NestingMode;
  searchTerms?: string[];
  showDuration?: boolean;
  showLogoInTitle?: boolean;
  showOrgInHeader?: boolean;
  showTagFooter?: boolean;
  tagsOverride?: SkillTag[];  // When provided, overrides the tags shown in the tag footer
}


function CardTitle({ terms, text, className }: { terms: string[]; text: string; className?: string }) {
  return (
    <h3 className={cn('font-semibold text-foreground leading-snug', className)}>
      <Highlight terms={terms} text={text} />
    </h3>
  );
}


/**
 * The badge position at the start of the top row: an avatar beside the title, an
 * org badge, or — when neither is asked for — the title on its own.
 */
function CardBadge({
  item,
  logoShape,
  showLogoInTitle,
  showOrgInHeader,
  terms,
}: Pick<CardBaseProps, 'item' | 'logoShape' | 'showLogoInTitle' | 'showOrgInHeader'> & { terms: string[] }) {
  if (showLogoInTitle) {
    return (
      <div className='flex items-center gap-1.5 py-1'>
        <Avatar
          alt={item.title}
          fallback={getInitials(item.title)}
          shape={logoShape ?? 'circle'}
          size='sm'
          src={logoUrl(item.logoSrc)}
        />
        <CardTitle terms={terms} text={item.title} />
      </div>
    );
  }

  if (showOrgInHeader && item.organizationName) {
    return (
      <div className='-mt-1 -ml-2'>
        <OrgBadge
          logoShape={logoShape ?? 'circle'}
          logoSrc={item.logoSrc}
          organization={item.organizationName}
          organizationUrl={item.organizationUrl}
          searchTerms={terms}
          size='sm'
        />
      </div>
    );
  }

  // No org badge — title takes the badge position alongside dates
  return (
    <div className='flex-1 min-w-0'>
      <CardTitle terms={terms} text={item.title} />
    </div>
  );
}


/** Dates — left-aligned on mobile, right-aligned on sm+ */
function CardDates({ item, showDuration }: Pick<CardBaseProps, 'item' | 'showDuration'>) {
  if (item.hideDates) return null;

  return (
    <div className='flex flex-col items-start text-left sm:items-end sm:text-right shrink-0 text-xs font-mono'>
      <span className='text-muted-foreground whitespace-nowrap'>
        {formatDateRange(item.dateStart, item.dateEnd)}
      </span>
      {showDuration && (
        <span className='text-muted-foreground/64'>
          {getDuration(item.dateStart, item.dateEnd)}
        </span>
      )}
    </div>
  );
}


function CardLocation({ location, terms }: { location?: string; terms: string[] }) {
  if (!location) return null;

  return (
    <div className='flex items-center gap-1 mt-0.5 text-xs text-muted-foreground/64'>
      <Icon icon={faLocationDot} />
      <span>
        <Highlight terms={terms} text={location} />
      </span>
    </div>
  );
}


function DetailLink({ item }: Pick<CardBaseProps, 'item'>) {
  return (
    <a
      className={cn(
        'group/detail shrink-0 flex items-center justify-center gap-1 -my-px h-6 pr-2 text-xs font-mono font-medium whitespace-nowrap border border-transparent',
        'text-muted-foreground transition-colors',
        'group-hover:border-emerald-700 group-hover:bg-primary/10 group-hover:text-emerald-700',
        'group-focus-within:border-emerald-700 group-focus-within:bg-primary/10 group-focus-within:text-emerald-700',
        'pl-6 sm:pl-2',
      )}
      href={`/resume/${item.detailId ?? item.id}`}
      onClick={(e) => e.stopPropagation()}
    >
      {item.detailLabel}
      <Icon
        className='text-[10px] sm:transition-transform sm:group-hover/detail:translate-x-0.5'
        icon={faChevronRight}
      />
    </a>
  );
}


function CardTagFooter({
  item,
  nestingMode,
  orgBadgeInHeader,
  tags,
  terms,
}: Pick<CardBaseProps, 'item' | 'nestingMode'> & {
  orgBadgeInHeader: boolean;
  tags: SkillTag[];
  terms: string[];
}) {
  return (
    <div className={cn(
      'flex flex-col mt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-2',
      orgBadgeInHeader ? 'gap-3' : 'gap-2',
    )}>
      <div className='flex flex-wrap gap-1'>
        {tags.map((tag) => (
          <TagPill
            key={tag}
            highlighted={textMatchesTerms(tag, terms)}
            small
            tag={tag}
          />
        ))}
      </div>

      {item.detailLabel && nestingMode !== 'shared-page' && <DetailLink item={item} />}
    </div>
  );
}


/**
 * A nested 'shared-page' card sits flush inside its group, so it drops the frame
 * the standalone and 'own-page' variants both carry.
 */
function cardClassName(item: ResumeItem, nestingMode?: NestingMode): string {
  const framed = nestingMode !== 'shared-page';

  return cn(
    'relative pt-3.5 pl-5 pr-4 pb-4.5',
    framed && cn('border border-border bg-card', item.detailLabel && 'hover:border-emerald-800/28'),
    nestingMode === 'own-page' && 'relative z-0 hover:z-10',
    nestingMode === 'shared-page' && 'bg-card',
    'group transition-all duration-200',
  );
}


export function CardBase(props: CardBaseProps) {
  const { item, nestingMode } = props;
  const terms = props.searchTerms ?? [];
  // Hidden tags stay on the entry but never reach a pill.
  const displayTags = visibleTags(props.tagsOverride ?? item.tags);
  // The org badge sits in the badge slot, so the title needs its own full-width row.
  const orgBadgeInHeader = Boolean(!props.showLogoInTitle && props.showOrgInHeader && item.organizationName);

  return (
    <article className={cardClassName(item, nestingMode)}>
      {/* ── Top row: badge ←→ dates, stacks vertically on mobile ─────────── */}
      <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6'>
        <CardBadge
          item={item}
          logoShape={props.logoShape}
          showLogoInTitle={props.showLogoInTitle}
          showOrgInHeader={props.showOrgInHeader}
          terms={terms}
        />
        <CardDates item={item} showDuration={props.showDuration} />
      </div>

      {/* ── Title (full-width) — only when OrgBadge is in the badge position ── */}
      {orgBadgeInHeader && (
        <CardTitle className='mt-2 sm:mt-1' terms={terms} text={item.title} />
      )}

      {/* ── Location (full-width, always below the top row) ──────────────── */}
      <CardLocation location={item.location} terms={terms} />

      <DynamicDescription
        item={item}
        searchTerms={terms}
        verbosity={props.verbosity}
      />

      {/* ── Tag footer ───────────────────────────────────────────────────── */}
      {props.showTagFooter && (displayTags.length > 0 || item.detailLabel) && (
        <CardTagFooter
          item={item}
          nestingMode={nestingMode}
          orgBadgeInHeader={orgBadgeInHeader}
          tags={displayTags}
          terms={terms}
        />
      )}
    </article>
  );
}
