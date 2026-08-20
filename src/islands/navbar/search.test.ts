import type { SearchItem } from '@/islands/navbar/search';

import { describe, it, expect } from 'vitest';
import MiniSearch from 'minisearch';
import { filterSearchItems, iconFor, themeActions, THEME_BY_ACTION_ID } from '@/islands/navbar/search';


const items: SearchItem[] = [
  { id: 'resume', title: 'Résumé', description: 'View my résumé', url: '/resume', type: 'page', icon: 'resume' },
  { id: 'print', title: 'Résumé (Print / PDF)', description: 'Printer-friendly', url: '/resume/print', type: 'page', tags: ['pdf'] },
  { id: 'proj', title: 'Widget Factory', description: 'A project', url: '/resume/proj', type: 'project' },
];


function indexOf(source: SearchItem[]): MiniSearch {
  const ms = new MiniSearch({
    fields: ['title', 'description', 'tags'],
    storeFields: ['id'],
  });
  ms.addAll(source.map((item) => ({ ...item, tags: item.tags?.join(' ') || '' })));

  return ms;
}


describe('filterSearchItems', () => {
  it('returns everything when the query is empty', () => {
    expect(filterSearchItems(items, '', null)).toBe(items);
  });

  it('falls back to substring matching before the index has loaded', () => {
    expect(filterSearchItems(items, 'widget', null).map((i) => i.id)).toEqual(['proj']);
  });

  it('matches the fallback against description and tags too', () => {
    expect(filterSearchItems(items, 'printer', null).map((i) => i.id)).toEqual(['print']);
    expect(filterSearchItems(items, 'pdf', null).map((i) => i.id)).toEqual(['print']);
  });

  it('matches the fallback case-insensitively', () => {
    expect(filterSearchItems(items, 'WIDGET', null).map((i) => i.id)).toEqual(['proj']);
  });

  it('returns nothing when the fallback finds no match', () => {
    expect(filterSearchItems(items, 'nonexistent', null)).toEqual([]);
  });

  it('uses the index once it is available', () => {
    const results = filterSearchItems(items, 'widget', indexOf(items));

    expect(results.map((i) => i.id)).toEqual(['proj']);
  });

  it('drops index hits that are no longer in the item list', () => {
    // The theme actions are indexed but filtered out of `allItems` when already active.
    const results = filterSearchItems(items, 'widget', indexOf([...items, ...themeActions]));

    expect(results.every((item) => items.includes(item))).toBe(true);
  });
});


describe('iconFor', () => {
  it('maps a known icon name', () => {
    expect(iconFor('house')).toBe(iconFor('house'));
    expect(iconFor('home').iconName).toBe('house');
  });

  it('falls back to a generic file icon for unknown or missing names', () => {
    expect(iconFor(undefined).iconName).toBe('file');
    expect(iconFor('not-a-real-icon').iconName).toBe('file');
  });

  it('resolves an icon for every name the palette items use', () => {
    const named = themeActions.map((item) => item.icon).filter(Boolean) as string[];
    const unresolved = named.filter((name) => iconFor(name).iconName === 'file');

    expect(unresolved).toEqual([]);
  });
});


describe('THEME_BY_ACTION_ID', () => {
  it('covers every theme action item', () => {
    const unmapped = themeActions.filter((item) => !THEME_BY_ACTION_ID[item.id]);

    expect(unmapped).toEqual([]);
  });
});
