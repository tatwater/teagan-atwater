import type { Mockup } from '@/lib/mockups';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';


export interface ReelItem {
  accent: string;  // CSS colour, resolved per theme — see src/styles/global.css
  id: string;
  name: string;
  shots: Mockup[];
  tagline: string;
}

const PLACEHOLDER_COUNT = 3;


/**
 * A mockup that happens to move.
 *
 * Two things need doing by hand. React does not serialise `muted` into the SSR
 * markup — it is a property, not an attribute — so Chrome sees an unmuted
 * autoplaying video in the first paint and refuses to start it; setting the
 * property on mount and asking again fixes that. And the reel's own rule is
 * that readers who prefer reduced motion never see it move, which a looping
 * clip would otherwise ignore: they get the same frame, paused, with controls
 * if they want to play it themselves.
 */
function MockupVideo({ alt, src }: { alt: string; src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      return;
    }

    const video = ref.current;
    if (!video) return;

    video.muted = true;
    // Rejects when the browser blocks playback anyway; the poster frame stands
    // in and there is nothing useful to do about it.
    void video.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      aria-label={alt}
      autoPlay={!reducedMotion}
      className='w-full border border-border-light'
      controls={reducedMotion}
      loop
      muted
      playsInline
      preload='metadata'
      src={src}
    />
  );
}


/**
 * The home page reel.
 *
 * Picking a project in the sidebar swaps the photoset beside it rather than
 * navigating anywhere — detail pages are opt-in per entry and most do not have
 * one yet. Until a project's mockups exist it shows labelled placeholders, so
 * the interaction is complete even though the art is not.
 *
 * The reel advances on its own until the reader does anything at all — scroll,
 * click, key, or touch — at which point it stops for good rather than fighting
 * them for control. Readers who prefer reduced motion never see it move.
 */
export default function HomeReel(props: {
  intervalMs?: number;
  items: ReelItem[];
}) {
  const { items } = props;
  const intervalMs = props.intervalMs ?? 12_000;

  const [activeIndex, setActiveIndex] = useState(0);
  const [autoAdvancing, setAutoAdvancing] = useState(true);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const stopAutoAdvancing = useCallback(() => setAutoAdvancing(false), []);

  // Any deliberate interaction ends the reel's autonomy — including the click
  // that selects a tab, which lands on window before this listener is removed.
  useEffect(() => {
    if (!autoAdvancing)
      return;

    const events: (keyof WindowEventMap)[] = ['click', 'keydown', 'scroll', 'touchstart', 'wheel'];

    for (const event of events)
      window.addEventListener(event, stopAutoAdvancing, { once: true, passive: true });

    return () => {
      for (const event of events)
        window.removeEventListener(event, stopAutoAdvancing);
    };
  }, [autoAdvancing, stopAutoAdvancing]);

  useEffect(() => {
    if (!autoAdvancing || items.length < 2)
      return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAutoAdvancing(false);
      return;
    }

    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % items.length),
      intervalMs,
    );

    return () => window.clearInterval(timer);
  }, [autoAdvancing, intervalMs, items.length]);

  // Roving focus, as a vertical tablist is expected to behave.
  function handleTabKeyDown(event: React.KeyboardEvent, index: number) {
    const lastIndex = items.length - 1;

    const nextIndex =
      event.key === 'ArrowDown' || event.key === 'ArrowRight' ? (index + 1) % items.length
      : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? (index + lastIndex) % items.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? lastIndex
      : null;

    if (nextIndex === null)
      return;

    event.preventDefault();
    setActiveIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  }

  const active = items[activeIndex];


  return (
    <div className='flex flex-col lg:flex-row min-h-[calc(100vh-4rem-1px)]'>

      {/* Sidebar: selected work */}
      <aside className='w-full lg:w-72 xl:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-border-light'>
        <div className='lg:sticky lg:top-0 flex flex-col gap-4 py-6'>
          <span
            className='px-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground'
            id='reel-label'
          >
            {`Selected work`}
          </span>

          {/*
            The rail is a single neutral hairline down the whole list; only the
            selected tab paints over it. Carrying it on the container rather than
            per-tab keeps it unbroken between tabs, and means the accent bar can
            inset itself vertically without the rail insetting with it.

            The page shell already draws a border down this edge, so the rail is
            widened a pixel and pulled a pixel left to land on top of it rather
            than beside it — one line, whose colour the selected tab takes over.
          */}
          <div
            aria-labelledby='reel-label'
            aria-orientation='vertical'
            className='flex flex-col w-[calc(100%+1px)] -translate-x-px border-l border-border-light'
            role='tablist'
          >
            {items.map((item, index) => {
              const selected = index === activeIndex;

              return (
                <button
                  key={item.id}
                  aria-controls={`reel-panel-${item.id}`}
                  aria-selected={selected}
                  className={cn(
                    // The rail sits outside the sidebar now, so a plain pl-6 puts
                    // the label on the 'Selected work' heading's left edge.
                    'group relative flex w-full flex-col gap-0.5 py-2.5 pl-6 pr-6 text-left transition-colors cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    !selected && 'hover:bg-muted/20',
                  )}
                  id={`reel-tab-${item.id}`}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  ref={(node) => { tabRefs.current[index] = node; }}
                  role='tab'
                  style={{
                    '--reel-accent': item.accent,
                    // A glow bleeding in from the rail, anchored just off the left
                    // edge so the tab reads as lit by the bar rather than filled.
                    background: selected
                      ? 'radial-gradient(ellipse 20% 48% at -2% 50%, color-mix(in oklch, var(--reel-accent) 8%, transparent) 8%, transparent 100%)'
                      : undefined,
                  } as React.CSSProperties}
                  tabIndex={selected ? 0 : -1}
                  type='button'
                >
                  {/* Inset a little at each end so the bar reads as a mark on the
                      rail, not as a segment of it. */}
                  {selected && (
                    <span
                      aria-hidden='true'
                      className='absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px -translate-x-px bg-[var(--reel-accent)]'
                    />
                  )}
                  <span className={cn(
                    'text-sm font-medium leading-snug transition-colors',
                    selected ? 'text-[var(--reel-accent)]' : 'text-foreground/80 group-hover:text-foreground',
                  )}>
                    {item.name}
                  </span>
                  <span className='text-xs text-muted-foreground leading-snug'>
                    {item.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Photoset for the selected project */}
      <div className='flex-1 min-w-0 p-2 pb-12'>
        {/*
          Keyed so React remounts the panel when the selection changes, which
          replays the fade-in. Deliberately not wrapped in AnimatePresence: an
          exit animation there has to finish before the next panel mounts, and
          when it does not, the panel stays stuck on the first project while the
          tabs keep moving.
        */}
        <motion.div
          key={active.id}
          animate={{ opacity: 1 }}
          aria-labelledby={`reel-tab-${active.id}`}
          className='flex flex-col gap-4'
          id={`reel-panel-${active.id}`}
          initial={{ opacity: 0 }}
          role='tabpanel'
          tabIndex={0}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
            {active.shots.length > 0
              ? active.shots.map((shot) => (
                  shot.kind === 'video'
                    ? (
                        <MockupVideo
                          key={shot.src}
                          alt={shot.alt}
                          src={shot.src}
                        />
                      )
                    : (
                        <img
                          key={shot.src}
                          alt={shot.alt}
                          className='w-full border border-border-light'
                          loading='lazy'
                          src={shot.src}
                        />
                      )
                ))
              : Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    aria-hidden='true'
                    className='flex aspect-16/10 w-full items-center justify-center border border-dashed border-border bg-muted/20'
                  >
                    <span className='text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60'>
                      {`${active.name} — mockup ${i + 1} pending`}
                    </span>
                  </div>
                ))
            }
        </motion.div>
      </div>

    </div>
  );
}
