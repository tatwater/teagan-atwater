import type { ResumeItem } from '@/data/resume/types';

import { describe, it, expect } from 'vitest';
import {
  itemMatchesTerms,
  resolveVerbosity,
  textMatchesTerms,
  tokenizeSearch,
} from '@/islands/resume/highlight';


function makeItem(overrides: Partial<ResumeItem> = {}): ResumeItem {
  return {
    id: 'test-item',
    dateEnd: null,
    dateStart: '2020-01',
    descriptionFull: 'A long description mentioning fundraising and hiring.',
    descriptionHeadline: 'A headline',
    descriptionSummary: 'A summary mentioning architecture.',
    organizationName: 'Acme Corp',
    tags: ['React', 'TypeScript'],
    title: 'Software Engineer',
    type: 'experience',
    ...overrides,
  };
}


describe('tokenizeSearch', () => {
  it('lowercases and splits on whitespace', () => {
    expect(tokenizeSearch('React TypeScript')).toEqual(['react', 'typescript']);
  });

  it('drops single characters so a stray keystroke matches nothing', () => {
    expect(tokenizeSearch('a react')).toEqual(['react']);
  });

  it('returns an empty list for blank input', () => {
    expect(tokenizeSearch('   ')).toEqual([]);
  });
});


describe('textMatchesTerms', () => {
  it('matches case-insensitively', () => {
    expect(textMatchesTerms('Built with React', ['react'])).toBe(true);
  });

  it('is false for missing text or empty terms', () => {
    expect(textMatchesTerms(undefined, ['react'])).toBe(false);
    expect(textMatchesTerms('React', [])).toBe(false);
  });
});


describe('itemMatchesTerms', () => {
  it('matches every item when there is no search', () => {
    expect(itemMatchesTerms(makeItem(), [])).toBe(true);
  });

  it('requires all terms to be present (AND semantics)', () => {
    const item = makeItem();
    expect(itemMatchesTerms(item, ['react', 'acme'])).toBe(true);
    expect(itemMatchesTerms(item, ['react', 'nonexistent'])).toBe(false);
  });

  it('matches against tags, title, and organization', () => {
    const item = makeItem();
    expect(itemMatchesTerms(item, ['typescript'])).toBe(true);
    expect(itemMatchesTerms(item, ['engineer'])).toBe(true);
    expect(itemMatchesTerms(item, ['acme'])).toBe(true);
  });

  it('matches text that is only in the full description', () => {
    expect(itemMatchesTerms(makeItem(), ['fundraising'])).toBe(true);
  });

  it('matches inside a bulleted summary, labels included', () => {
    const item = makeItem({
      descriptionSummary: ['A loose bullet', { label: 'Impact', bullets: ['Shipped the wizard'] }],
    });

    expect(itemMatchesTerms(item, ['loose'])).toBe(true);
    expect(itemMatchesTerms(item, ['wizard'])).toBe(true);
    expect(itemMatchesTerms(item, ['impact'])).toBe(true);
  });
});


describe('resolveVerbosity', () => {
  it('leaves verbosity alone when there is no search', () => {
    expect(resolveVerbosity(makeItem(), 'headline', [])).toBe('headline');
  });

  it('leaves verbosity alone when the match is already visible', () => {
    // Title and tags render at every density, so no expansion is needed.
    expect(resolveVerbosity(makeItem(), 'headline', ['engineer'])).toBe('headline');
    expect(resolveVerbosity(makeItem(), 'headline', ['react'])).toBe('headline');
  });

  it('expands to summary when the match is only in the summary', () => {
    expect(resolveVerbosity(makeItem(), 'headline', ['architecture'])).toBe('summary');
  });

  it('expands to summary when the match is only in a bullet', () => {
    const item = makeItem({
      descriptionSummary: [{ label: 'Impact', bullets: ['Shipped the wizard'] }],
    });

    expect(resolveVerbosity(item, 'headline', ['wizard'])).toBe('summary');
  });

  it('expands to detail when the match is only in the full description', () => {
    expect(resolveVerbosity(makeItem(), 'headline', ['fundraising'])).toBe('detail');
    expect(resolveVerbosity(makeItem(), 'summary', ['fundraising'])).toBe('detail');
  });

  it('never reduces the density the reader chose', () => {
    expect(resolveVerbosity(makeItem(), 'detail', ['architecture'])).toBe('detail');
  });

  it('leaves verbosity alone when nothing matches', () => {
    expect(resolveVerbosity(makeItem(), 'headline', ['nonexistent'])).toBe('headline');
  });
});
