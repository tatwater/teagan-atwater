import type { Mockup, MockupEmbed } from '@/lib/mockups';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { overrideCoarsePointer } from '@/lib/mockuuups-pointer-override';


export interface ReelItem {
  accent: string;  // CSS colour, resolved per theme — see src/styles/global.css
  id: string;
  name: string;
  shots: Mockup[];
  tagline: string;
}

const PLACEHOLDER_COUNT = 3;

/**
 * Where the reel remembers which project is on screen.
 *
 * Session storage rather than the URL, so the home page keeps a bare address,
 * and rather than local storage, so a project chosen once is not still sitting
 * there weeks later when someone opens the site fresh.
 */
const STORAGE_KEY = 'home-reel:selected';

/** Breathing room above the photoset once a switch has scrolled to it. */
const PANEL_TOP_GAP = 8;

/** Close enough to the photoset's top that scrolling would read as a twitch. */
const SCROLL_DEADZONE = 12;


/**
 * Session storage, but never fatal.
 *
 * Reading it throws outright rather than returning null under some privacy
 * settings, and an exception here would take the whole island's hydration down
 * with it. A reader who cannot be remembered simply is not.
 */
function readSelection(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeSelection(id: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    // See above.
  }
}


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
function MockupVideo({ alt, aspectRatio, src }: { alt: string; aspectRatio: string; src: string }) {
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
      // Holds the slot at the clip's own shape from the first frame. Without
      // it the element is empty until the metadata lands, which is a hole in
      // the column exactly when a switch can least afford one.
      style={{ aspectRatio }}
    />
  );
}


const EMBED_SCRIPT_SRC = 'https://embed.mckp.live/embed.js';


/**
 * Register <mockup-player>, once per document.
 *
 * Mockuuups' own snippet appends the script on mount, which is wrong here: the
 * reel remounts its panel on every project switch, so clicking away and back
 * would stack a fresh <script> tag each time. Asking the document what it
 * already has is the guard — a module-level flag would not survive the island
 * being bundled into more than one entry point.
 */
function loadEmbedScript() {
  // Must be in place before their bundle runs: it reads the pointer once, when
  // it sizes the canvas. See src/lib/mockuuups-pointer-override.ts for why we
  // lie to it, and docs/THIRD-PARTY-SCRIPTS.md for what that costs.
  overrideCoarsePointer();

  if (document.querySelector(`script[src="${EMBED_SCRIPT_SRC}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = EMBED_SCRIPT_SRC;
  document.head.appendChild(script);
}


/**
 * A mockup Mockuuups animates for us.
 *
 * The reel's rule is that readers who prefer reduced motion never see it move.
 * A <video> can honour that by pausing on a frame, but this clip only exists
 * inside a third-party player with no documented way to hold it still, so the
 * only honest option is to leave it out for those readers — the highlight's
 * stills sit directly below and carry the slot on their own.
 *
 * The check runs in an effect rather than during render because the markup is
 * server-rendered, where the media query cannot be read; matching the first
 * client paint to the server's and then dropping the player keeps hydration
 * quiet. MockupVideo above flips the same way for the same reason.
 */
function MockupPlayer({ shot }: { shot: MockupEmbed }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      return;
    }

    loadEmbedScript();
  }, []);

  if (reducedMotion) return null;

  return (
    <mockup-player
      aria-label={shot.alt}
      aspect-ratio={shot.aspectRatio}
      background-color={shot.backgroundColor}
      camera-zoom={shot.cameraZoom}
      className='block w-full border border-border-light'
      click-range={shot.clickRange}
      cursor-affect-page={shot.cursorAffectPage}
      cursor-range={shot.cursorRange}
      mockup-id={shot.mockupId}
      role='img'
      // The same ratio the player is told to use, in CSS this time. Until their
      // script upgrades the element it is an unknown tag of no height, so the
      // box has to be reserved here or the column comes up short.
      style={{ aspectRatio: shot.aspectRatio }}
      trigger={shot.trigger}
      trigger-loop={shot.triggerLoop}
      trigger-threshold={shot.triggerThreshold}
      width='100%'
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
  const panelRef = useRef<HTMLDivElement>(null);

  const stopAutoAdvancing = useCallback(() => setAutoAdvancing(false), []);

  // Come back to the project the reader was last looking at.
  //
  // The page is prerendered, so the server cannot know which one that is and
  // always emits the first; the swap has to happen here, on the client. As a
  // layout effect it is applied before the hydrated page is painted — a passive
  // effect would show the default project for a frame and then move the column
  // sideways under a scroll position the browser had already restored into it.
  //
  // Restoring also ends the reel's autonomy, for the same reason: advancing
  // twelve seconds later would swap the column out from under a reader whose
  // place in it was just handed back to them.
  useLayoutEffect(() => {
    const stored = readSelection();
    if (stored === null) return;

    const index = items.findIndex((item) => item.id === stored);
    // A project that has since been renamed or dropped leaves the default up.
    if (index < 0) return;

    setActiveIndex(index);
    setAutoAdvancing(false);
  }, [items]);

  // Remember it for the next load. Whatever is on screen counts, including a
  // project the reel moved to on its own — a reader who scrolled down into that
  // column and stayed there is exactly the case a reload has to rebuild.
  //
  // The first run is skipped: it would only write back the value the effect
  // above has just read.
  const stored = useRef(false);

  useEffect(() => {
    if (!stored.current) {
      stored.current = true;
      return;
    }

    storeSelection(items[activeIndex].id);
  }, [activeIndex, items]);

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

  // A switch swaps the photoset in place, which leaves the reader parked
  // wherever the last project's column happened to run to. Come back up to the
  // top of the new photoset rather than the top of the page: the tab that was
  // just clicked is the thing you are leaving, and the mockups are the thing
  // you asked for.
  //
  // Upwards only, never down. From the top of the page the photoset is already
  // the thing in front of you — on `lg` it starts a navbar's height down, and
  // below `lg` the tabs themselves are what sits above it — so pinning it to
  // the viewport would cost the reader context they never asked to lose. Below
  // `lg` that makes this a no-op in practice, since the tabs are only in reach
  // from up there in the first place.
  //
  // Click only. Arrow keys move focus to the next tab and the browser scrolls
  // that tab back into view, so scrolling away from it here would only fight.
  const handleTabClick = useCallback((index: number) => {
    setActiveIndex(index);

    const panel = panelRef.current;
    if (!panel) return;

    const target = Math.max(
      0,
      window.scrollY + panel.getBoundingClientRect().top - PANEL_TOP_GAP,
    );

    // One test for both rules: a downward move is a negative distance, and a
    // short upward one reads as a twitch.
    if (window.scrollY - target <= SCROLL_DEADZONE) return;

    window.scrollTo({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      top: target,
    });
  }, []);

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
                  onClick={() => handleTabClick(index)}
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
      {/*
        `overflow-anchor: none` opts the photoset out of Chrome's scroll
        anchoring. Anchoring exists to hold the view still when something above
        it resizes, but a switch replaces the column wholesale, and compensating
        for the height difference between the outgoing shot and the incoming one
        drags the scroll position by that difference — enough to land a restored
        reader in the wrong part of their own column. Every shot reserves its
        box now, so nothing else up there moves for anchoring to correct.
      */}
      <div className='flex-1 min-w-0 p-2 page-runout [overflow-anchor:none]' ref={panelRef}>
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
              ? active.shots.map((shot) => {
                  if (shot.kind === 'embed') {
                    return <MockupPlayer key={shot.mockupId} shot={shot} />;
                  }

                  if (shot.kind === 'video') {
                    return (
                      <MockupVideo
                        key={shot.src}
                        alt={shot.alt}
                        aspectRatio={shot.aspectRatio}
                        src={shot.src}
                      />
                    );
                  }

                  return (
                    // `h-auto` because the height attribute would otherwise
                    // pin the element to the file's own pixel height; paired
                    // with the width it becomes an aspect ratio instead, and
                    // the box is reserved before the image decodes.
                    <img
                      key={shot.src}
                      alt={shot.alt}
                      className='w-full h-auto border border-border-light'
                      height={shot.height}
                      loading='lazy'
                      src={shot.src}
                      width={shot.width}
                    />
                  );
                })
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
