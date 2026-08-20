import type { Verbosity } from '@/islands/resume/types';
import type { ResumeItem, SubCard } from '@/data/resume/types';

import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { faBiohazard, faChevronRight, faLocationDot } from '@fortawesome/sharp-regular-svg-icons';
import { resumeItems } from '@/data/resume';
import { DynamicDescription } from '@/islands/resume/dynamic-description';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { getInitials } from '@/islands/resume/helpers';
import { logoUrl } from '@/lib/logos';
import { Highlight } from '@/islands/resume/highlight';
import { Avatar } from '@/components/avatar';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';


function subCardClassName(primary: boolean, linkable: boolean): string {
  return cn(
    'flex flex-col gap-1 border p-3 transition-all duration-200 w-72',
    primary ? 'border-border bg-card' : 'border-border/40',
    linkable
      ? cn('hover:border-emerald-800/28 cursor-pointer', primary ? 'hover:bg-card' : 'hover:bg-muted/32')
      : 'cursor-default',
  );
}


/**
 * One entry in the pandemic card's carousel. Primary sub-cards read at full
 * strength; the rest are muted. Only entries with a detail page are clickable.
 */
function SubCardLink({
  subCard,
  searchTerms,
  verbosity,
}: {
  subCard: SubCard;
  searchTerms: string[];
  verbosity: Verbosity;
}) {
  const ref = resumeItems.find((i) => i.id === subCard.id);

  if (!ref)
    return null;

  const linkable = Boolean(ref.detailLabel);

  return (
    <CarouselItem className="basis-auto pl-0">
      <a
        className={subCardClassName(subCard.primary, linkable)}
        href={linkable ? `/resume/${subCard.id}` : undefined}
        onClick={linkable ? undefined : (e) => e.preventDefault()}
      >
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-1.5 min-w-0'>
            <Avatar
              alt={ref.organizationName ?? ''}
              fallback={getInitials(ref.organizationName || ref.title)}
              shape={ref.logoShape ?? 'squircle'}
              size='sm'
              src={logoUrl(ref.logoSrc)}
            />
            <span className={cn(
              'text-sm font-medium leading-snug truncate',
              subCard.primary ? 'text-foreground' : 'text-foreground/70',
            )}>
              <Highlight terms={searchTerms} text={ref.organizationName} />
            </span>
          </div>
          {linkable && (
            <Icon
              className='text-[10px] text-muted-foreground/64 shrink-0'
              icon={faChevronRight}
            />
          )}
        </div>
        {verbosity !== 'headline' && (
          <p className='text-xs text-muted-foreground leading-snug line-clamp-2'>
            <Highlight terms={searchTerms} text={ref.descriptionHeadline} />
          </p>
        )}
      </a>
    </CarouselItem>
  );
}


export function PandemicCard({
  item,
  searchTerms = [],
  verbosity,
  isTimeline = false,
}: {
  item: ResumeItem;
  searchTerms?: string[];
  verbosity: Verbosity;
  isTimeline?: boolean;
}) {
  const allSubs = item.subCards ?? [];

  return (
    <article
      className={cn(
        'relative border-t border-b border-dashed border-border/70 transition-all duration-200 backdrop-blur-[1.5px] -mx-4 md:-mx-6 z-0',
        'bg-muted/20',
      )}
      style={{
        backgroundImage: `
          conic-gradient(at calc(100% - 2px) calc(100% - 2px), color-mix(in srgb, var(--border) 8%, transparent) 270deg, #0000 0),
          conic-gradient(at calc(100% - 1px) calc(100% - 1px), color-mix(in srgb, var(--border) 8%, transparent) 270deg, #0000 0)
        `,
        backgroundSize: '60px 60px, 12px 12px',
      }}
    >
      <div className={cn(
        'pt-7.5 pb-5',
        isTimeline ? 'pl-13 pr-4 md:pl-15 md:pr-6' : 'px-4 md:px-6',
      )}>
        <div className='flex items-start gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-1.5 text-base'>
              <Icon icon={faBiohazard} />
              <h3 className='font-semibold text-foreground leading-snug'>
                <Highlight terms={searchTerms} text={item.title} />
              </h3>
            </div>
            {item.location && (
              <div className='flex items-center gap-1 mt-1 text-xs text-muted-foreground/64'>
                <Icon icon={faLocationDot} />
                <span>
                  {item.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Animated description */}
        <DynamicDescription item={item} searchTerms={searchTerms} verbosity={verbosity} />

        {/* Sub-cards carousel */}
        {allSubs.length > 0 && (
          <div className='mt-4'>
            <div className="flex items-center gap-2">
              <span className='text-[10px] font-mono uppercase tracking-widest text-muted-foreground'>
                {`Projects during this time`}
              </span>
              <div className="flex-1 h-px bg-border ml-2" />
            </div>

            <div
              className={cn(
                'mt-2',
                isTimeline
                  ? '-ml-13 -mr-4 md:-ml-15 md:-mr-6'
                  : '-mx-4 md:-mx-6',
              )}
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
              }}
            >
              <Carousel
                opts={{
                  align: 'start',
                  containScroll: 'trimSnaps',
                  dragFree: true,
                  duration: 15,
                }}
                plugins={[WheelGesturesPlugin()]}
              >
                <CarouselContent
                  className={cn(
                    'ml-0 gap-3',
                    isTimeline ? 'pl-13 md:pl-15' : 'pl-4 md:pl-6',
                  )}
                >
                  {allSubs.map((sc) => (
                    <SubCardLink
                      key={sc.id}
                      searchTerms={searchTerms}
                      subCard={sc}
                      verbosity={verbosity}
                    />
                  ))}

                  {/*
                    Empty spacer: accounts for the right padding (16px mobile / 24px desktop) minus
                    the 8px gap that precedes it, so the last card's right edge lines up with the
                    content area's right edge
                  */}
                  <CarouselItem
                    aria-hidden
                    className="basis-auto pl-0 w-1 md:w-3 shrink-0"
                  />
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
