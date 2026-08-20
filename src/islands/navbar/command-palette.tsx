import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { navigate } from 'astro:transitions/client';
import { detectPlatform, MAC_MODIFIER_SYMBOLS } from '@tanstack/react-hotkeys';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { faFile, faHouse, faEnvelope, faUser, faFolder, faRightToBracket, faRightFromBracket, faSun, faMoon, faDisplay, faFileUser, faPrint } from '@fortawesome/sharp-regular-svg-icons';
import { Icon } from '@/components/icon';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import MiniSearch from 'minisearch';

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'page' | 'project' | 'action';
  tags?: string[];
  icon?: string;
}

const defaultItems: SearchItem[] = [
  // {
  //   id: 'home',
  //   title: 'Home',
  //   description: 'Go to homepage',
  //   url: '/',
  //   type: 'page',
  //   icon: 'home',
  // },
  {
    id: 'resume',
    title: 'Résumé',
    description: 'View my résumé',
    url: '/resume',
    type: 'page',
    icon: 'resume',
  },
  {
    id: 'resume-print',
    title: 'Résumé (Print / PDF)',
    description: 'Printer-friendly one-page résumé',
    url: '/resume/print',
    type: 'page',
    icon: 'print',
    tags: ['resume', 'cv', 'print', 'pdf'],
  },
  // {
  //   id: 'contact',
  //   title: 'Contact',
  //   description: 'Get in touch',
  //   url: '/contact',
  //   type: 'page',
  //   icon: 'mail',
  // },
];

const themeActions: SearchItem[] = [
  {
    id: 'theme-light',
    title: 'Light Mode',
    description: 'Switch to light theme',
    url: '#',
    type: 'action',
    icon: 'sun',
    tags: ['light', 'theme', 'mode'],
  },
  {
    id: 'theme-dark',
    title: 'Dark Mode',
    description: 'Switch to dark theme',
    url: '#',
    type: 'action',
    icon: 'moon',
    tags: ['dark', 'theme', 'mode'],
  },
  {
    id: 'theme-system',
    title: 'System Theme',
    description: 'Follow system color scheme',
    url: '#',
    type: 'action',
    icon: 'system',
    tags: ['system', 'theme', 'mode', 'auto'],
  },
];

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
    if (stored) {
      setCurrentTheme(stored);
    } else {
      setCurrentTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    }
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
    if (!search) {
      setFilteredItems(allItems);
      return;
    }

    if (!miniSearch) {
      const searchLower = search.toLowerCase();
      const filtered = allItems.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(searchLower);
        const descMatch = item.description?.toLowerCase().includes(searchLower);
        const tagMatch = item.tags?.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
        return titleMatch || descMatch || tagMatch;
      });
      setFilteredItems(filtered);
      return;
    }

    const results = miniSearch.search(search);
    const filtered = results
      .map((result) => {
        const item = allItems.find((i) => i.id === result.id);
        return item;
      })
      .filter((item): item is SearchItem => item !== undefined);

    setFilteredItems(filtered);
  }, [search, allItems, miniSearch]);

  const handleSelect = async (url: string, itemId?: string) => {
    setOpen(false);
    setSearch('');

    if (itemId === 'theme-light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setCurrentTheme('light');
      return;
    }
    if (itemId === 'theme-dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setCurrentTheme('dark');
      return;
    }
    if (itemId === 'theme-system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('theme', 'system');
      setCurrentTheme('system');
      return;
    }

    navigate(url);
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'home':
        return <Icon icon={faHouse} />;
      case 'resume':
        return <Icon icon={faFileUser} />;
      case 'print':
        return <Icon icon={faPrint} />;
      case 'mail':
        return <Icon icon={faEnvelope} />;
      case 'user':
        return <Icon icon={faUser} />;
      case 'folder':
        return <Icon icon={faFolder} />;
      case 'login':
        return <Icon icon={faRightToBracket} />;
      case 'logout':
        return <Icon icon={faRightFromBracket} />;
      case 'sun':
        return <Icon icon={faSun} />;
      case 'moon':
        return <Icon icon={faMoon} />;
      case 'system':
        return <Icon icon={faDisplay} />;
      default:
        return <Icon icon={faFile} />;
    }
  };

  const pageItems = filteredItems.filter((item) => item.type === 'page');
  const projectItems = filteredItems.filter((item) => item.type === 'project');
  const actionItems = filteredItems.filter((item) => item.type === 'action');

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
            ) : search && pageItems.length === 0 && projectItems.length === 0 && actionItems.length === 0 ? (
              <div className="py-6 text-center text-sm">No results found.</div>
            ) : null}

            {pageItems.length > 0 && (
              <>
                <CommandGroup heading="Pages">
                  {pageItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.title}
                      onSelect={() => handleSelect(item.url, item.id)}
                    >
                      {getIcon(item.icon)}
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.description && (
                          <span className="text-muted-foreground text-xs">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {(projectItems.length > 0 || actionItems.length > 0) && (
                  <CommandSeparator />
                )}
              </>
            )}

            {projectItems.length > 0 && (
              <>
                <CommandGroup heading="Projects">
                  {projectItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.title}
                      onSelect={() => handleSelect(item.url, item.id)}
                    >
                      {getIcon(item.icon)}
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.description && (
                          <span className="text-muted-foreground text-xs">
                            {item.description}
                          </span>
                        )}
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <CommandShortcut>
                          {item.tags.slice(0, 2).join(', ')}
                        </CommandShortcut>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {actionItems.length > 0 && <CommandSeparator />}
              </>
            )}

            {actionItems.length > 0 && (
              <CommandGroup heading="Actions">
                {actionItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.title}
                    onSelect={() => handleSelect(item.url, item.id)}
                  >
                    {getIcon(item.icon)}
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
