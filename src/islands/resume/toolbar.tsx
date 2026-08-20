import type { Verbosity, ViewMode } from '@/islands/resume/types';

import { useRef } from 'react';
import { navigate } from 'astro:transitions/client';
import { detectPlatform, MAC_MODIFIER_SYMBOLS, useHotkey } from '@tanstack/react-hotkeys';
import { faLayerGroup, faMagnifyingGlass, faPrint, faTableList, faXmark } from '@fortawesome/sharp-regular-svg-icons';
import { VERBOSITY_OPTIONS } from '@/islands/resume/constants';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';


export function ResumeToolbar(props: {
  search: string;
  onSearchChange: (value: string) => void;
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

  useHotkey('Mod+P', (e) => {
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
            placeholder='Search experience, skills, companies…'
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

        {/* Controls */}
        <TooltipProvider>
          <div className='flex items-center justify-between gap-2 order-2 w-full md:w-auto'>
            <div className='flex items-center gap-2'>
            {/* View mode toggle */}
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

            {/* Verbosity toggle: text labels on sm+ */}
            <ButtonGroup className='shrink-0 hidden sm:flex'>
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

            {/* Verbosity toggle: icon-only with tooltips on mobile */}
            <ButtonGroup className='shrink-0 sm:hidden'>
              {VERBOSITY_OPTIONS.map(({ value, label, icon }, i) => (
                <Tooltip key={value}>
                  <TooltipTrigger
                    render={
                      <Button
                        className={cn(
                          'font-sans',
                          i < VERBOSITY_OPTIONS.length - 1 && 'border-r border-border',
                          props.verbosity === value
                            ? 'bg-primary hover:bg-primary text-primary-foreground hover:text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                        )}
                        onClick={() => props.onVerbosityChange(value)}
                        size='icon'
                        type='button'
                        variant='outline'
                      />
                    }
                  >
                    <Icon className='text-xs' icon={icon} />
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              ))}
            </ButtonGroup>
            </div>{/* end left button groups */}

            {/* Print button — tooltip only shown below sm where the text label is hidden */}
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
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
