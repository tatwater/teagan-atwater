import type { SearchItem } from '@/islands/navbar/search';
import type { ThemePreference } from '@/islands/navbar/types';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { navigate } from 'astro:transitions/client';
import { detectPlatform, MAC_MODIFIER_SYMBOLS } from '@tanstack/react-hotkeys';
import { faMagnifyingGlass } from '@fortawesome/sharp-regular-svg-icons';
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Icon } from '@/components/icon';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';
import { applyTheme, getStoredTheme } from '@/islands/navbar/theme';
import {
  createSearchIndex,
  defaultItems,
  filterSearchItems,
  iconFor,
  themeActions,
  THEME_BY_ACTION_ID,
} from '@/islands/navbar/search';
import type MiniSearch from 'minisearch';


interface ResultItemProps {
  item: SearchItem;
  onSelect: (url: string, itemId?: string) => void;
  showTags?: boolean;
}


function ResultItem({ item, onSelect, showTags }: ResultItemProps) {
  return (
    <CommandItem
      value={item.title}
      onSelect={() => onSelect(item.url, item.id)}
    >
      <Icon icon={iconFor(item.icon)} />
      <div className="flex flex-col">
        <span>{item.title}</span>
        {item.description && (
          <span className="text-muted-foreground text-xs">
            {item.description}
          </span>
        )}
      </div>
      {showTags && item.tags && item.tags.length > 0 && (
        <CommandShortcut>
          {item.tags.slice(0, 2).join(', ')}
        </CommandShortcut>
      )}
    </CommandItem>
  );
}


interface ResultGroupProps extends Omit<ResultItemProps, 'item'> {
  heading: string;
  items: SearchItem[];
  separator: boolean;
}


function ResultGroup({ heading, items, separator, ...itemProps }: ResultGroupProps) {
  if (items.length === 0) return null;

  return (
    <>
      <CommandGroup heading={heading}>
        {items.map((item) => (
          <ResultItem key={item.id} item={item} {...itemProps} />
        ))}
      </CommandGroup>
      {separator && <CommandSeparator />}
    </>
  );
}


export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [metaKey, setMetaKey] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<SearchItem[]>(defaultItems);
  const [filteredItems, setFilteredItems] = useState<SearchItem[]>(defaultItems);
  const [miniSearch, setMiniSearch] = useState<MiniSearch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const [currentTheme, setCurrentTheme] = useState<ThemePreference>('system');

  useEffect(() => {
    const isMac = detectPlatform() === 'mac';
    setMetaKey(isMac ? MAC_MODIFIER_SYMBOLS['Meta'] : 'Ctrl');
  }, []);

  useEffect(() => {
    if (!open) return;
    // The stored *preference*, not the resolved theme: with nothing stored the
    // answer is 'system', and reading the dark class back would mislabel that
    // as Light or Dark. This is the same source the navbar's theme radio group
    // reads, so the two controls always agree on what's checked.
    setCurrentTheme(getStoredTheme());
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const loadSearchIndex = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    try {
      const response = await fetch('/api/search-index.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch search index: ${response.statusText}`);
      }

      const data: SearchItem[] = await response.json();
      setItems([...defaultItems, ...data]);

      setMiniSearch(createSearchIndex([...defaultItems, ...data, ...themeActions]));
    } catch (error) {
      console.error('Failed to load search index:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const allItems = useMemo(() => {
    return [...items, ...themeActions];
  }, [items]);

  useEffect(() => {
    if (open && !miniSearch) {
      loadSearchIndex();
    }
  }, [open, miniSearch, loadSearchIndex]);

  useEffect(() => {
    setFilteredItems(filterSearchItems(allItems, search, miniSearch));
  }, [search, allItems, miniSearch]);

  const handleSelect = (url: string, itemId?: string) => {
    setOpen(false);
    setSearch('');

    const theme = itemId ? THEME_BY_ACTION_ID[itemId] : undefined;
    if (theme) {
      applyTheme(theme);
      setCurrentTheme(theme);
      return;
    }

    navigate(url);
  };

  const pageItems = filteredItems.filter((item) => item.type === 'page');
  const projectItems = filteredItems.filter((item) => item.type === 'project');
  const actionItems = filteredItems.filter((item) => item.type === 'action');
  const hasNoResults =
    pageItems.length === 0 && projectItems.length === 0 && actionItems.length === 0;

  return (
    <>
      {/*
        Two ways in, one per width, so the palette is never ⌘K-only: a reader
        without a keyboard shortcut to hand — on a phone, or tabbing — still has
        something to press. Above `lg` it reads as the hint it always was, just
        one that answers a click now; below, a bare icon beside the theme
        toggle, since the hint's copy is about a key that is not there.

        The wide one waits for the platform, so the chip never shows the wrong
        modifier for a frame. The narrow one has nothing to wait for.
      */}
      {metaKey && (
        <button
          aria-keyshortcuts={`${metaKey === 'Ctrl' ? 'Control' : 'Meta'}+K`}
          className={cn(
            'hidden lg:flex items-center gap-1.5 mr-2 px-1.5 py-0.5 rounded-xs cursor-pointer',
            'text-xs text-muted-foreground font-mono select-none transition-colors',
            'hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          )}
          onClick={() => setOpen(true)}
          type='button'
        >
          Explore by keyboard
          <KbdGroup aria-hidden='true'>
            <Kbd>{metaKey}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </button>
      )}
      <button
        aria-label='Search'
        className={cn(
          'lg:hidden size-8 text-sm rounded-full',
          'flex items-center justify-center cursor-pointer outline-none',
          'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
          'focus-visible:ring-1 focus-visible:ring-ring',
        )}
        onClick={() => setOpen(true)}
        type='button'
      >
        <Icon icon={faMagnifyingGlass} />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search pages, projects, and more..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-xs">
                <span>Loading search index...</span>
              </div>
            ) : search && hasNoResults ? (
              <div className="py-6 text-center text-sm">No results found.</div>
            ) : null}

            <ResultGroup
              heading="Pages"
              items={pageItems}
              onSelect={handleSelect}
              separator={projectItems.length > 0 || actionItems.length > 0}
            />

            <ResultGroup
              heading="Projects"
              items={projectItems}
              onSelect={handleSelect}
              showTags
              separator={actionItems.length > 0}
            />

            {actionItems.length > 0 && (
              <CommandGroup heading="Actions">
                {actionItems.map((item) => {
                  /*
                    The theme you're already on stays listed — hiding it made
                    the palette the one theme control on the site that can't
                    answer "which theme am I on?", and searching for it landed
                    on "No results found". It isn't an action, though, so it's
                    disabled: cmdk skips disabled items in arrow navigation and
                    won't fire their onSelect. The inherited dimming comes back
                    off, because a greyed row reads as broken where a checked
                    one reads as already active.
                  */
                  const isCurrent = THEME_BY_ACTION_ID[item.id] === currentTheme;

                  return (
                    <CommandItem
                      key={item.id}
                      className={isCurrent ? 'data-[disabled=true]:opacity-100' : undefined}
                      data-checked={isCurrent ? 'true' : undefined}
                      disabled={isCurrent}
                      value={item.title}
                      onSelect={() => handleSelect(item.url, item.id)}
                    >
                      <Icon icon={iconFor(item.icon)} />
                      <span>{item.title}</span>
                      {isCurrent && (
                        <span className="ml-auto text-muted-foreground text-xs">
                          Current theme
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
