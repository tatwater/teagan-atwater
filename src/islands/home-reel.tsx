import type { Mockup, MockupEmbed } from '@/lib/mockups';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useHotkeys } from '@tanstack/react-hotkeys';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
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
 * Marks one focusable shot in the photoset.
 *
 * Read back out of the DOM rather than tracked in a ref array because the panel
 * remounts wholesale on every switch, and the answer this needs — "the shots
 * that are on screen right now, in order" — is exactly what the DOM already
 * knows. A ref array would have to be invalidated by hand on each remount.
 */
const SHOT_ATTR = 'data-reel-shot';

/** How many works get a number key. Past nine there is no single digit left. */
const DIGIT_SHORTCUT_LIMIT = 9;


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
function MockupVideo(props: {
  alt: string;
  aspectRatio: string;
  reducedMotion: boolean;
  src: string;
}) {
  const { alt, aspectRatio, reducedMotion, src } = props;
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const video = ref.current;
    if (!video) return;

    video.muted = true;
    // Rejects when the browser blocks playback anyway; the poster frame stands
    // in and there is nothing useful to do about it.
    void video.play().catch(() => {});
  }, [reducedMotion]);

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
 * Dropping it is HomeReel's job rather than this component's, because the
 * photoset now numbers its shots out loud — "shot 2 of 4" — and a component
 * that returns null after being counted would leave a labelled, empty tab stop
 * where the player used to be. Filtering upstream means the count is taken
 * against what is actually there.
 */
function MockupPlayer({ shot }: { shot: MockupEmbed }) {
  useEffect(loadEmbedScript, []);

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
  const [reducedMotion, setReducedMotion] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  /** Set by a switch the reader asked for, and only by one. See below. */
  const focusOnSwitch = useRef(false);

  const stopAutoAdvancing = useCallback(() => setAutoAdvancing(false), []);

  // One reading of the media query for the whole reel, rather than one per
  // shot: the photoset now counts itself aloud, and the count has to be taken
  // against the same answer the embeds were filtered by.
  //
  // Read in an effect rather than during render because the page is
  // prerendered, where there is no query to ask. Subscribing as well as reading
  // means a reader who flips the system setting mid-visit is honoured without a
  // reload — the embeds appear or vanish and the numbering follows.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);

    sync();
    query.addEventListener('change', sync);

    return () => query.removeEventListener('change', sync);
  }, []);

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

    if (reducedMotion) {
      setAutoAdvancing(false);
      return;
    }

    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % items.length),
      intervalMs,
    );

    return () => window.clearInterval(timer);
  }, [autoAdvancing, intervalMs, items.length, reducedMotion]);

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
      behavior: reducedMotion ? 'auto' : 'smooth',
      top: target,
    });
  }, [reducedMotion]);

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

  // What the reader can actually reach in this photoset, which is what the
  // "shot n of m" labels have to be counted against — see MockupPlayer.
  const shots = useMemo(
    () => (reducedMotion ? active.shots.filter((shot) => shot.kind !== 'embed') : active.shots),
    [active.shots, reducedMotion],
  );

  /** The photoset's tab stops, in document order. */
  const shotStops = useCallback(
    () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>(`[${SHOT_ATTR}]`) ?? []),
    [],
  );

  /** Where a deliberate switch puts the reader: the top of what they asked for. */
  const focusFirstShot = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    // A highlight whose mockups do not exist yet has no shots to land on, so
    // the panel itself takes the focus and announces the project's name.
    const target = panel.querySelector<HTMLElement>(`[${SHOT_ATTR}]`)
      ?? panel.querySelector<HTMLElement>('[role="tabpanel"]');

    target?.focus();
  }, []);

  /**
   * Switch to a project and go and read it.
   *
   * Focus has to move, and not as a courtesy: the panel is keyed, so a switch
   * unmounts whatever shot the reader was standing on and focus would fall back
   * to the body — the next Tab restarting from the top of the document, which
   * is the worst possible answer to "show me the next one".
   *
   * The flag is what keeps the reel from doing this to anyone uninvited. It is
   * set only here, by a keystroke the reader typed, and never by the interval
   * that advances the reel on its own.
   */
  const selectWork = useCallback((index: number) => {
    setAutoAdvancing(false);

    // Already there — nothing will remount, so nothing will run the effect
    // below, and a flag left standing would be spent by the next switch.
    if (index === activeIndex) {
      focusFirstShot();
      return;
    }

    focusOnSwitch.current = true;
    setActiveIndex(index);
  }, [activeIndex, focusFirstShot]);

  const stepWork = useCallback(
    (delta: number) => selectWork((activeIndex + delta + items.length) % items.length),
    [activeIndex, items.length, selectWork],
  );

  useEffect(() => {
    if (!focusOnSwitch.current) return;

    focusOnSwitch.current = false;
    focusFirstShot();
  }, [activeIndex, focusFirstShot]);

  // Switching project from anywhere on the page, which is the whole point:
  // a reader four shots down a photoset can move on without climbing back up
  // to the rail to do it. Brackets step, digits jump straight to one.
  //
  // Single-key hotkeys ignore keystrokes aimed at inputs by default, so typing
  // a '2' into the command palette searches for a 2 rather than swapping the
  // reel out from behind the dialog.
  useHotkeys([
    { callback: () => stepWork(-1), hotkey: '[' },
    { callback: () => stepWork(1), hotkey: ']' },
    ...items.slice(0, DIGIT_SHORTCUT_LIMIT).map((_, index) => ({
      callback: () => selectWork(index),
      hotkey: { key: String(index + 1) },
    })),
  ]);

  /**
   * Arrow keys step between shots, so the photoset can be read without Tab
   * being the only way through it.
   *
   * Clamped rather than wrapped, unlike the tablist above: the tabs are a short
   * ring you can feel your way around, while the photoset is a long column
   * where wrapping off the last shot would throw the reader back to the top of
   * the page without asking.
   *
   * Bails when the keystroke started somewhere deeper — under reduced motion a
   * clip is rendered with its own controls, and those arrow keys are the
   * video's business, not the reel's.
   */
  function handleShotKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;

    const stops = shotStops();
    const index = stops.indexOf(event.currentTarget);
    if (index < 0) return;

    const lastIndex = stops.length - 1;

    const nextIndex =
      event.key === 'ArrowDown' || event.key === 'ArrowRight' ? Math.min(index + 1, lastIndex)
      : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? Math.max(index - 1, 0)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? lastIndex
      : null;

    if (nextIndex === null)
      return;

    event.preventDefault();
    stops[nextIndex]?.focus();
  }


  return (
    // Focus arriving anywhere in the reel ends its autonomy, as a click or a
    // keystroke would. Usually the Tab that brought it here has already done
    // that through the window listener, but a screen reader's virtual cursor
    // can land focus without ever sending a keydown, and a reel that swaps its
    // panel out from under the thing being read is the one failure this
    // component must never have.
    <div
      className='flex flex-col lg:flex-row min-h-[calc(100vh-4rem-1px)]'
      onFocus={stopAutoAdvancing}
    >

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
                  aria-keyshortcuts={index < DIGIT_SHORTCUT_LIMIT ? String(index + 1) : undefined}
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

          {/*
            The shortcuts are useless if nobody knows they are there, and this
            is the only place on the page they could be announced without
            shouting. Set below the list rather than between the heading and
            the tabs, so it reads as a footnote to the rail instead of
            interrupting it.

            `lg` and up only — it is the same judgement the navbar's ⌘K hint
            makes, that below this width there is unlikely to be a keyboard to
            press. Hidden from the accessibility tree too, because each tab
            carries its own `aria-keyshortcuts` and would otherwise say it twice.
          */}
          {items.length > 1 && (
            <div
              aria-hidden='true'
              className='hidden lg:flex flex-col gap-1.5 px-6 pt-1 text-xs font-mono text-muted-foreground/60 select-none pointer-events-none'
            >
              <div className='flex items-center gap-x-1'>
                <KbdGroup>
                  <Kbd>{`[`}</Kbd>
                  /
                  <Kbd>{`]`}</Kbd>
                </KbdGroup>
                ,
                <KbdGroup>
                  <Kbd>{`1`}</Kbd>
                  –
                  <Kbd>{Math.min(items.length, DIGIT_SHORTCUT_LIMIT)}</Kbd>
                </KbdGroup>
                <span className='ml-2'>{`switch work`}</span>
              </div>

              <div className='flex items-center gap-x-1'>
                <KbdGroup>
                  <Kbd>{`↑`}</Kbd>
                  /
                  <Kbd>{`↓`}</Kbd>
                </KbdGroup>
                <span className='ml-2'>{`browse shots`}</span>
              </div>
            </div>
          )}
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
          // A tabpanel only needs to be a tab stop of its own when it holds
          // nothing focusable, which since the shots became figures is true
          // only of a project whose mockups are still placeholders. It stays
          // reachable in code either way, for the switch handler to land on.
          tabIndex={shots.length > 0 ? -1 : 0}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
            {shots.length > 0
              ? shots.map((shot, index) => (
                  /*
                    Each shot is its own tab stop, which is what makes a
                    photoset something you can walk rather than one opaque
                    block you either land in or scroll past. The label is
                    positional on purpose: the alt text below it describes the
                    picture at length and beautifully, but says nothing about
                    where in the set you are.
                  */
                  <figure
                    key={shot.kind === 'embed' ? shot.mockupId : shot.src}
                    aria-label={`${active.name} — shot ${index + 1} of ${shots.length}`}
                    className={cn(
                      'relative scroll-mt-4 outline-none',
                      'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2',
                      'focus-visible:ring-offset-background',
                    )}
                    onKeyDown={handleShotKeyDown}
                    tabIndex={0}
                    {...{ [SHOT_ATTR]: '' }}
                  >
                    {shot.kind === 'embed' ? (
                      <MockupPlayer shot={shot} />
                    ) : shot.kind === 'video' ? (
                      <MockupVideo
                        alt={shot.alt}
                        aspectRatio={shot.aspectRatio}
                        reducedMotion={reducedMotion}
                        src={shot.src}
                      />
                    ) : (
                      // `h-auto` because the height attribute would otherwise
                      // pin the element to the file's own pixel height; paired
                      // with the width it becomes an aspect ratio instead, and
                      // the box is reserved before the image decodes.
                      <img
                        alt={shot.alt}
                        className='block w-full h-auto border border-border-light'
                        height={shot.height}
                        loading='lazy'
                        src={shot.src}
                        width={shot.width}
                      />
                    )}
                  </figure>
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
