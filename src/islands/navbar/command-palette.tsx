import type { SearchItem } from '@/islands/navbar/search';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { navigate } from 'astro:transitions/client';
import { detectPlatform, MAC_MODIFIER_SYMBOLS } from '@tanstack/react-hotkeys';
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
import { applyTheme } from '@/islands/navbar/theme';
import {
  defaultItems,
  filterSearchItems,
  iconFor,
  themeActions,
  THEME_BY_ACTION_ID,
} from '@/islands/navbar/search';
import MiniSearch from 'minisearch';


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
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);

  useEffect(() => {
    const isMac = detectPlatform() === 'mac';
    setMetaKey(isMac ? MAC_MODIFIER_SYMBOLS['Meta'] : 'Ctrl');
  }, []);

  useEffect(() => {
    if (!open) return;
    const stored = localStorage.getItem('theme');
    setCurrentTheme(stored ?? (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
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

      const ms = new MiniSearch({
        fields: ['title', 'description', 'tags'],
        storeFields: ['id', 'title', 'description', 'url', 'type', 'tags', 'icon'],
        searchOptions: {
          boost: { title: 2 },
          fuzzy: 0.2,
          prefix: true,
        },
      });

      ms.addAll(
        [...defaultItems, ...data, ...themeActions].map((item) => ({
          ...item,
          tags: item.tags?.join(' ') || '',
        }))
      );

      setMiniSearch(ms);
    } catch (error) {
      console.error('Failed to load search index:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const availableThemeActions = useMemo(() => {
    return themeActions.filter((a) => a.id !== `theme-${currentTheme}`);
  }, [currentTheme]);

  const allItems = useMemo(() => {
    return [...items, ...availableThemeActions];
  }, [items, availableThemeActions]);

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
      {/* Explore by keyboard hint — visual only, not interactive */}
      {metaKey && (
        <span
          className="hidden lg:flex items-center gap-1.5 mr-2 text-xs text-muted-foreground font-mono select-none pointer-events-none"
          aria-hidden="true"
          tabIndex={-1}
        >
          Explore by keyboard
          <KbdGroup>
            <Kbd>{metaKey}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </span>
      )}

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
                {actionItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.title}
                    onSelect={() => handleSelect(item.url, item.id)}
                  >
                    <Icon icon={iconFor(item.icon)} />
                    <span>{item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
