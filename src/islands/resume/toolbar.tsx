import type { Verbosity, ViewMode } from '@/islands/resume/types';
import type { SkillTag } from '@/data/resume/types';

import { useRef } from 'react';
import { navigate } from 'astro:transitions/client';
import { detectPlatform, MAC_MODIFIER_SYMBOLS, useHotkey } from '@tanstack/react-hotkeys';
import { faArrowDownShortWide, faLayerGroup, faMagnifyingGlass, faPrint, faTableList, faXmark } from '@fortawesome/sharp-regular-svg-icons';
import { VERBOSITY_OPTIONS } from '@/islands/resume/constants';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';


/**
 * The print résumé is shelved until after launch. Flipping this back to true
 * restores both entry points that live in this file — the toolbar button and
 * its Mod+P shortcut. The page itself still renders at /resume/print; the
 * command palette's matching entry is commented out in
 * src/islands/navbar/search.ts and has to come back with it.
 */
const SHOW_PRINT_BUTTON: boolean = false;

/**
 * The grouped/chronological toggle is shelved while the page stays simple.
 * Chronological is the default the explorer holds, so hiding the toggle just
 * pins it there — grouped rendering still lives in
 * src/islands/resume/accordion.tsx and comes back with this flag.
 */
const SHOW_VIEW_MODE_TOGGLE: boolean = false;


/**
 * The active sort tag, shown as a chip so the state is legible from the top of
 * the page and clearable without hunting for the pill you clicked. Kept
 * separate from the search field on purpose: search highlights per keystroke
 * and matches substrings, while a tag is a discrete, exact choice — folding
 * them together would re-sort the whole page on every letter typed.
 */
function SortChip(props: {
  matchCount: number;
  onClear: () => void;
  tag: SkillTag;
}) {
  return (
    <div
      className={cn(
        'order-3 flex items-center gap-1.5 h-6.5 pl-2 pr-1 shrink-0',
        'border border-primary bg-primary/10 text-primary text-[10px] font-mono',
        'md:order-2',
      )}
    >
      <Icon className='text-[10px]' icon={faArrowDownShortWide} />
      <span>
        {`Sorted by ${props.tag}`}
      </span>
      <span className='text-primary/60'>
        {`${props.matchCount} ${props.matchCount === 1 ? 'entry' : 'entries'}`}
      </span>
      <button
        aria-label={`Clear sort by ${props.tag}`}
        className='grid place-items-center size-4.5 cursor-pointer hover:bg-primary/15'
        onClick={props.onClear}
        type='button'
      >
        <Icon className='text-[10px]' icon={faXmark} />
      </button>
    </div>
  );
}


export function ResumeToolbar(props: {
  activeTag: SkillTag | null;
  matchCount: number;
  onClearActiveTag: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  tagMatchCount: number;
  verbosity: Verbosity;
  onVerbosityChange: (value: Verbosity) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const isMac = detectPlatform() === 'mac';
  const metaKey = isMac
    ? MAC_MODIFIER_SYMBOLS['Meta']
    : 'Ctrl';

  useHotkey('/', (e) => {
    if (searchRef.current !== document.activeElement) {
      e.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    }
  });

  useHotkey('Escape', () => {
    if (props.activeTag) props.onClearActiveTag();
  });

  useHotkey('Mod+P', (e) => {
    if (!SHOW_PRINT_BUTTON) return;
    e.preventDefault();
    navigate('/resume/print');
  });


  return (
    <div className='relative md:sticky md:top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border-light'>
      <div className='flex items-center justify-between gap-2 px-4 py-2.5 flex-wrap md:flex-nowrap'>
        {/* Search */}
        <div className='relative w-full md:flex-1 md:max-w-sm order-1 group'>
          <Icon
            className='absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none'
            icon={faMagnifyingGlass}
          />
          <Input
            className={cn(
              'pl-7 pr-7 text-xs bg-muted/50 border border-border',
              'placeholder:text-muted-foreground/50',
              'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30',
              'transition-all',
            )}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder='Highlight experience, skills, companies…'
            ref={searchRef}
            type='text'
            value={props.search}
          />
          {props.search ? (
            <button
              className={cn(
                'absolute grid place-items-center right-1 top-1/2 -translate-y-1/2 size-6 bg-transparent text-muted-foreground cursor-pointer',
                'hover:bg-accent hover:text-foreground'
              )}
              onClick={() => props.onSearchChange('')}
              type='button'
            >
              <Icon
                className='text-xs'
                icon={faXmark}
              />
            </button>
          ) : (
              <Kbd className='absolute right-1.5 top-1/2 -translate-y-1/2 group-focus-within:hidden'>
                {`/`}
              </Kbd>
          )}
        </div>

        {/* Active sort tag — clicking a skill ranks entries, it never removes any */}
        {props.activeTag && (
          <SortChip
            matchCount={props.tagMatchCount}
            onClear={props.onClearActiveTag}
            tag={props.activeTag}
          />
        )}

        {/*
          Reordering is a silent change for a screen reader, so the sort is
          announced here. The region is always mounted — one that appears with
          its own content is announced unreliably.
        */}
        <span aria-live='polite' className='sr-only'>
          {props.activeTag
            ? `Sorted by ${props.activeTag}. ${props.tagMatchCount} ${props.tagMatchCount === 1 ? 'entry' : 'entries'} listed first. Nothing was removed.`
            : ''}
        </span>

        {/* Match count — search highlights in place, so this reports hits rather than a filtered total */}
        {props.search.trim() && (
          <span
            aria-live='polite'
            className={cn(
              'order-3 w-full text-[10px] font-mono md:order-2 md:w-auto md:shrink-0',
              props.matchCount === 0 ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {props.matchCount === 0
              ? 'No matches'
              : `${props.matchCount} ${props.matchCount === 1 ? 'match' : 'matches'} highlighted`
            }
          </span>
        )}

        {/* Controls */}
        <TooltipProvider>
          <div className='flex items-center justify-between gap-2 order-2 w-full md:order-3 md:w-auto'>
            <div className='flex items-center gap-2'>
            {/* View mode toggle */}
            {SHOW_VIEW_MODE_TOGGLE && (
            <ButtonGroup className='shrink-0'>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      className={cn(
                        'font-sans',
                        props.viewMode === 'grouped'
                          ? 'bg-primary hover:bg-primary text-primary-foreground hover:text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      )}
                      onClick={() => props.onViewModeChange('grouped')}
                      type='button'
                      variant='outline'
                    />
                  }
                >
                  <Icon
                    className='text-xs'
                    icon={faLayerGroup}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {`Grouped`}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      className={cn(
                        'font-sans',
                        props.viewMode === 'chronological'
                          ? 'bg-primary hover:bg-primary text-primary-foreground hover:text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      )}
                      onClick={() => props.onViewModeChange('chronological')}
                      type='button'
                      variant='outline'
                    />
                  }
                >
                  <Icon
                    className='text-xs'
                    icon={faTableList}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {`Chronological`}
                </TooltipContent>
              </Tooltip>
            </ButtonGroup>
            )}

            {/*
              Verbosity toggle — text labels at every width. The controls row
              gets a line of its own on mobile, so the labels fit and there's
              nothing for an icon-only variant to save.
            */}
            <ButtonGroup className='shrink-0'>
              {VERBOSITY_OPTIONS.map(({ value, label }, i) => (
                <Button
                  key={value}
                  className={cn(
                    'font-sans',
                    i < VERBOSITY_OPTIONS.length - 1 && 'border-r border-border',
                    props.verbosity === value
                      ? 'bg-primary hover:bg-primary text-primary-foreground hover:text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                  onClick={() => props.onVerbosityChange(value)}
                  type='button'
                  variant='outline'
                >
                  {label}
                </Button>
              ))}
            </ButtonGroup>
            </div>{/* end left button groups */}

            {/* Print button — tooltip only shown below sm where the text label is hidden */}
            {SHOW_PRINT_BUTTON && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    className={cn(
                      'shrink-0 font-sans',
                      'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                    render={<a href='/resume/print' title='Open print-friendly résumé' />}
                    variant='outline'
                  />
                }
              >
                <Icon
                  className='text-xs'
                  icon={faPrint}
                />
                <span className='hidden sm:inline'>
                  {`Print`}
                </span>
                <KbdGroup className='relative hidden lg:inline-flex -right-1'>
                  <Kbd>
                    {metaKey}
                  </Kbd>
                  <Kbd>
                    {`P`}
                  </Kbd>
                </KbdGroup>
              </TooltipTrigger>
              <TooltipContent className='sm:hidden'>
                {`Print`}
              </TooltipContent>
            </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
