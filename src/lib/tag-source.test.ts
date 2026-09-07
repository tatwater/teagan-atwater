import type { TaxonomyRecord } from '@/lib/tag-source';

import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import {
  entryIdsIn,
  renderTaxonomy,
  replaceAllEntryTags,
  replaceEntryTags,
  replaceTaxonomy,
} from '@/lib/tag-source';
import { skillCategories } from '@/data/resume/skills';
import { educationItems } from '@/data/resume/education';
import { experienceItems } from '@/data/resume/experiences';
import { projectItems } from '@/data/resume/projects';


const SKILLS_PATH = 'src/data/resume/skills.ts';
const DATA_FILES = [
  { path: 'src/data/resume/experiences.ts', items: experienceItems },
  { path: 'src/data/resume/projects.ts', items: projectItems },
  { path: 'src/data/resume/education.ts', items: educationItems },
];


describe('renderTaxonomy', () => {
  it('aligns values within a category and separates categories', () => {
    const taxonomy: TaxonomyRecord = {
      'A Category': { 'Short': 'print', 'A Much Longer Tag': 'entry' },
      'B Category': { 'One': 'hidden' },
    };

    expect(renderTaxonomy(taxonomy)).toBe(
      [
        `  'A Category': {`,
        `    'Short':             'print',`,
        `    'A Much Longer Tag': 'entry',`,
        `  },`,
        ``,
        `  'B Category': {`,
        `    'One': 'hidden',`,
        `  },`,
      ].join('\n'),
    );
  });

  it('handles an empty category without crashing on the width calculation', () => {
    expect(renderTaxonomy({ 'Empty': {} })).toBe([`  'Empty': {`, `  },`].join('\n'));
  });
});


describe('replaceTaxonomy', () => {
  // The strongest guarantee available: re-rendering the live taxonomy over the
  // live file has to be a no-op. If the renderer's formatting ever drifts from
  // the file's, a save would reformat every line and bury the real change.
  it('round-trips the real skills.ts byte for byte', () => {
    const source = readFileSync(SKILLS_PATH, 'utf8');

    expect(replaceTaxonomy(source, skillCategories as TaxonomyRecord)).toBe(source);
  });

  it('rewrites only the literal, leaving the comments and exports alone', () => {
    const source = readFileSync(SKILLS_PATH, 'utf8');
    const next = replaceTaxonomy(source, { 'Only': { 'One': 'print' } });

    expect(next).toContain(`  'Only': {\n    'One': 'print',\n  },`);
    expect(next).toContain('export function printSkillCategories');
    expect(next).toContain('export type SkillVisibility');
    expect(next).not.toContain(`'Figma'`);
  });

  it('throws rather than guessing when the anchor is missing', () => {
    expect(() => replaceTaxonomy('const x = 1;\n', {})).toThrow(/skillCategories/);
  });
});


describe('replaceEntryTags', () => {
  const source = [
    `export const items = [`,
    `  {`,
    `    id: 'alpha',`,
    `    title: 'Alpha',`,
    `    tags: ['React', 'TypeScript'],`,
    `  },`,
    `  {`,
    `    id: 'beta',`,
    `    tags: [],`,
    `  },`,
    `];`,
    ``,
  ].join('\n');

  it('rewrites the addressed entry and nothing else', () => {
    const next = replaceEntryTags(source, 'alpha', ['Postgres']);

    expect(next).toContain(`    tags: ['Postgres'],`);
    expect(next).toContain(`    id: 'beta',\n    tags: [],`);
  });

  it('fills an empty array and empties a full one', () => {
    expect(replaceEntryTags(source, 'beta', ['SQL'])).toContain(`    tags: ['SQL'],`);
    expect(replaceEntryTags(source, 'alpha', [])).toContain(`    tags: [],`);
  });

  it('preserves indentation', () => {
    const deep = `      id: 'gamma',\n      tags: [],\n`;

    expect(replaceEntryTags(deep, 'gamma', ['Git'])).toBe(`      id: 'gamma',\n      tags: ['Git'],\n`);
  });

  it('escapes quotes rather than producing broken source', () => {
    expect(replaceEntryTags(source, 'beta', ["it's"])).toContain(`tags: ['it\\'s'],`);
  });

  it('throws on an unknown id', () => {
    expect(() => replaceEntryTags(source, 'nope', [])).toThrow(/id 'nope'/);
  });

  // The guard that keeps a malformed entry from silently stealing the next
  // entry's tags line.
  it('refuses to write past the start of the next entry', () => {
    const missing = [
      `    id: 'alpha',`,
      `    title: 'Alpha',`,
      `    id: 'beta',`,
      `    tags: [],`,
    ].join('\n');

    expect(() => replaceEntryTags(missing, 'alpha', ['React'])).toThrow(/before the next entry/);
  });

  it('applies a batch across one file', () => {
    const next = replaceAllEntryTags(source, { alpha: ['A'], beta: ['B'] });

    expect(next).toContain(`tags: ['A'],`);
    expect(next).toContain(`tags: ['B'],`);
  });
});


describe('against the real data files', () => {
  // Writing back exactly what an entry already has must be a no-op. That proves
  // the id lookup finds the right object and the rendering matches the file's
  // formatting — so a real save shows only the tags the user actually changed.
  it('round-trips every entry in every data file', () => {
    for (const { path, items } of DATA_FILES) {
      const source = readFileSync(path, 'utf8');
      const current = Object.fromEntries(items.map((item) => [item.id, item.tags]));

      expect(replaceAllEntryTags(source, current)).toBe(source);
    }
  });

  it('lists exactly the entries the module exports, ignoring nested id references', () => {
    for (const { path, items } of DATA_FILES) {
      const source = readFileSync(path, 'utf8');

      // `pandemic` references other entries by id in its subCards, on lines
      // like `{ id: 'project-sous', primary: true },`. Those are not entries
      // and must never be treated as one.
      expect(entryIdsIn(source)).toEqual(items.map((item) => item.id));
    }
  });
});
