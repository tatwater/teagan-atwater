import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { SearchIndexItem as SearchItem } from '@/lib/search-index';
import type { ThemePreference } from '@/islands/navbar/types';
import type MiniSearch from 'minisearch';

import {
  faDisplay,
  faEnvelope,
  faFile,
  faFileUser,
  faFolder,
  faHouse,
  faMoon,
  faPrint,
  faRightFromBracket,
  faRightToBracket,
  faSun,
  faUser,
} from '@fortawesome/sharp-regular-svg-icons';


export type { SearchItem };


export const defaultItems: SearchItem[] = [
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
  // Shelved until after launch, alongside the résumé toolbar's print button —
  // see SHOW_PRINT_BUTTON in src/islands/resume/toolbar.tsx.
  // {
  //   id: 'resume-print',
  //   title: 'Résumé (Print / PDF)',
  //   description: 'Printer-friendly one-page résumé',
  //   url: '/resume/print',
  //   type: 'page',
  //   icon: 'print',
  //   tags: ['resume', 'cv', 'print', 'pdf'],
  // },
  // {
  //   id: 'contact',
  //   title: 'Contact',
  //   description: 'Get in touch',
  //   url: '/contact',
  //   type: 'page',
  //   icon: 'mail',
  // },
];


export const themeActions: SearchItem[] = [
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


/** Which theme each action item selects, keyed by item id. */
export const THEME_BY_ACTION_ID: Record<string, ThemePreference> = {
  'theme-light': 'light',
  'theme-dark': 'dark',
  'theme-system': 'system',
};


const ICON_BY_NAME: Record<string, IconDefinition> = {
  home: faHouse,
  resume: faFileUser,
  print: faPrint,
  mail: faEnvelope,
  user: faUser,
  folder: faFolder,
  login: faRightToBracket,
  logout: faRightFromBracket,
  sun: faSun,
  moon: faMoon,
  system: faDisplay,
};


export function iconFor(iconName?: string): IconDefinition {
  return (iconName ? ICON_BY_NAME[iconName] : undefined) ?? faFile;
}


/**
 * Narrow the palette's items to those matching `search`. MiniSearch handles it
 * once the index has loaded; until then a plain substring match over title,
 * description, and tags keeps the palette usable on first open.
 */
export function filterSearchItems(
  allItems: SearchItem[],
  search: string,
  miniSearch: MiniSearch | null,
): SearchItem[] {
  if (!search) return allItems;

  if (!miniSearch) {
    const query = search.toLowerCase();

    return allItems.filter((item) =>
      item.title.toLowerCase().includes(query)
      || Boolean(item.description?.toLowerCase().includes(query))
      || Boolean(item.tags?.some((tag) => tag.toLowerCase().includes(query))));
  }

  return miniSearch
    .search(search)
    .map((result) => allItems.find((item) => item.id === result.id))
    .filter((item): item is SearchItem => item !== undefined);
}
