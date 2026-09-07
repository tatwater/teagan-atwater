import type { Draft } from '@/islands/tag-editor/state';

import { describe, it, expect } from 'vitest';
import {
  addTag,
  categoryOf,
  changedEntryIds,
  coverage,
  entryHasTag,
  isDirty,
  moveEntryTagBy,
  moveEntryTagToFront,
  moveTag,
  moveTagWithinCategory,
  renameTag,
  reorderEntryTag,
  setVisibility,
  toTaxonomyRecord,
  toggleTag,
} from '@/islands/tag-editor/state';


function draft(): Draft {
  return {
    categories: [
      {
        name: 'Web',
        tags: [
          { name: 'React', visibility: 'print' },
          { name: 'Astro', visibility: 'entry' },
        ],
      },
      { name: 'Data', tags: [{ name: 'Postgres', visibility: 'print' }] },
    ],
    tagsById: {
      alpha: ['React', 'Postgres'],
      beta: ['React'],
      gamma: [],
    },
  };
}


describe('toTaxonomyRecord', () => {
  it('flattens the draft back into the record shape skills.ts uses', () => {
    expect(toTaxonomyRecord(draft())).toEqual({
      Web: { React: 'print', Astro: 'entry' },
      Data: { Postgres: 'print' },
    });
  });

  it('keeps category and tag order, which is render order on the site', () => {
    const record = toTaxonomyRecord(draft());

    expect(Object.keys(record)).toEqual(['Web', 'Data']);
    expect(Object.keys(record.Web)).toEqual(['React', 'Astro']);
  });
});


describe('toggleTag', () => {
  it('adds a missing tag and removes a present one', () => {
    const added = toggleTag(draft(), 'gamma', 'Astro');
    expect(added.tagsById.gamma).toEqual(['Astro']);

    expect(toggleTag(added, 'gamma', 'Astro').tagsById.gamma).toEqual([]);
  });

  it('appends rather than sorting, so authored order survives', () => {
    expect(toggleTag(draft(), 'alpha', 'Astro').tagsById.alpha)
      .toEqual(['React', 'Postgres', 'Astro']);
  });

  it('leaves other entries alone', () => {
    expect(toggleTag(draft(), 'gamma', 'React').tagsById.beta).toEqual(['React']);
  });
});


describe('per-entry tag order', () => {
  const many: Draft = {
    categories: [{
      name: 'Web',
      tags: ['A', 'B', 'C', 'D'].map((name) => ({ name, visibility: 'entry' as const })),
    }],
    tagsById: { alpha: ['A', 'B', 'C', 'D'] },
  };

  it('moves a tag to an arbitrary position', () => {
    expect(reorderEntryTag(many, 'alpha', 2, 0).tagsById.alpha).toEqual(['C', 'A', 'B', 'D']);
    expect(reorderEntryTag(many, 'alpha', 0, 3).tagsById.alpha).toEqual(['B', 'C', 'D', 'A']);
  });

  it('is a no-op for a same-position or out-of-range move', () => {
    expect(reorderEntryTag(many, 'alpha', 1, 1)).toBe(many);
    expect(reorderEntryTag(many, 'alpha', -1, 0)).toBe(many);
    expect(reorderEntryTag(many, 'alpha', 0, 4)).toBe(many);
  });

  it('nudges one place and clamps at both ends', () => {
    expect(moveEntryTagBy(many, 'alpha', 'C', -1).tagsById.alpha).toEqual(['A', 'C', 'B', 'D']);
    expect(moveEntryTagBy(many, 'alpha', 'A', -1)).toBe(many);
    expect(moveEntryTagBy(many, 'alpha', 'D', 1)).toBe(many);
  });

  it('promotes a tag to the front', () => {
    expect(moveEntryTagToFront(many, 'alpha', 'D').tagsById.alpha).toEqual(['D', 'A', 'B', 'C']);
    expect(moveEntryTagToFront(many, 'alpha', 'A')).toBe(many);
  });

  it('ignores a tag the entry does not carry', () => {
    expect(moveEntryTagBy(many, 'alpha', 'Z', -1)).toBe(many);
    expect(moveEntryTagToFront(many, 'alpha', 'Z')).toBe(many);
  });

  it('never adds or drops a tag, only reorders', () => {
    for (const [from, to] of [[0, 3], [3, 0], [1, 2], [2, 1]]) {
      expect([...reorderEntryTag(many, 'alpha', from, to).tagsById.alpha].sort())
        .toEqual(['A', 'B', 'C', 'D']);
    }
  });

  it('leaves other entries untouched', () => {
    const two = { ...many, tagsById: { ...many.tagsById, beta: ['A'] } };

    expect(reorderEntryTag(two, 'alpha', 0, 1).tagsById.beta).toEqual(['A']);
  });
});


describe('renameTag', () => {
  it('renames in the taxonomy and on every entry at once', () => {
    const next = renameTag(draft(), 'React', 'React 19');

    expect(categoryOf(next, 'React 19')).toBe('Web');
    expect(next.tagsById.alpha).toEqual(['React 19', 'Postgres']);
    expect(next.tagsById.beta).toEqual(['React 19']);
  });

  it('holds the tag in place within its category', () => {
    const next = renameTag(draft(), 'React', 'Preact');

    expect(next.categories[0].tags.map((t) => t.name)).toEqual(['Preact', 'Astro']);
  });

  it('keeps the visibility rung', () => {
    expect(renameTag(draft(), 'Astro', 'Astro 7').categories[0].tags[1].visibility).toBe('entry');
  });

  it('refuses a collision, an empty name, or an unknown tag', () => {
    expect(() => renameTag(draft(), 'React', 'Astro')).toThrow(/already exists/);
    expect(() => renameTag(draft(), 'React', '   ')).toThrow(/needs a name/);
    expect(() => renameTag(draft(), 'Nope', 'Fine')).toThrow(/not in the taxonomy/);
  });

  it('is a no-op when the name is unchanged', () => {
    const d = draft();
    expect(renameTag(d, 'React', 'React')).toBe(d);
  });
});


describe('moveTag', () => {
  it('moves a tag between categories, carrying its visibility', () => {
    const next = moveTag(draft(), 'React', 'Data');

    expect(categoryOf(next, 'React')).toBe('Data');
    expect(next.categories[0].tags.map((t) => t.name)).toEqual(['Astro']);
    expect(next.categories[1].tags).toContainEqual({ name: 'React', visibility: 'print' });
  });

  it('does not disturb which entries carry it', () => {
    expect(moveTag(draft(), 'React', 'Data').tagsById.alpha).toEqual(['React', 'Postgres']);
  });

  it('refuses an unknown tag or category', () => {
    expect(() => moveTag(draft(), 'Nope', 'Data')).toThrow(/not in the taxonomy/);
    expect(() => moveTag(draft(), 'React', 'Nope')).toThrow(/no "Nope" category/);
  });
});


describe('addTag', () => {
  it('appends to the named category at the entry rung by default', () => {
    const next = addTag(draft(), 'Data', 'SQL');

    expect(next.categories[1].tags).toEqual([
      { name: 'Postgres', visibility: 'print' },
      { name: 'SQL', visibility: 'entry' },
    ]);
  });

  it('trims and rejects duplicates and blanks', () => {
    expect(addTag(draft(), 'Data', '  SQL  ').categories[1].tags[1].name).toBe('SQL');
    expect(() => addTag(draft(), 'Data', 'React')).toThrow(/already exists/);
    expect(() => addTag(draft(), 'Data', ' ')).toThrow(/needs a name/);
  });
});


describe('setVisibility and moveTagWithinCategory', () => {
  it('changes one rung without touching the others', () => {
    const next = setVisibility(draft(), 'Astro', 'print');

    expect(next.categories[0].tags.map((t) => t.visibility)).toEqual(['print', 'print']);
  });

  it('swaps a tag with its neighbour and clamps at the ends', () => {
    const d = draft();

    expect(moveTagWithinCategory(d, 'Astro', -1).categories[0].tags.map((t) => t.name))
      .toEqual(['Astro', 'React']);
    expect(moveTagWithinCategory(d, 'React', -1)).toEqual(d);
    expect(moveTagWithinCategory(d, 'Astro', 1)).toEqual(d);
  });
});


describe('coverage and dirt tracking', () => {
  it('counts entries per tag', () => {
    expect(coverage(draft())).toEqual(new Map([['React', 2], ['Postgres', 1]]));
  });

  it('reports which entries a session actually changed', () => {
    const initial = draft();
    const next = toggleTag(initial, 'gamma', 'Astro');

    expect(isDirty(initial, initial)).toBe(false);
    expect(isDirty(initial, next)).toBe(true);
    expect(changedEntryIds(initial, next)).toEqual(['gamma']);
  });

  it('counts a rename as changing every entry that carried the tag', () => {
    const initial = draft();

    expect(changedEntryIds(initial, renameTag(initial, 'React', 'Preact')).sort())
      .toEqual(['alpha', 'beta']);
  });

  it('answers membership for a single entry', () => {
    expect(entryHasTag(draft(), 'alpha', 'React')).toBe(true);
    expect(entryHasTag(draft(), 'gamma', 'React')).toBe(false);
  });
});


describe('coverage scoping', () => {
  const withShelved: Draft = {
    categories: [{ name: 'Web', tags: [{ name: 'A', visibility: 'print' }] }],
    tagsById: { live: ['A'], shelved: ['A'] },
  };

  // A tag whose only carrier is shelved sorts nothing on the résumé, so the
  // editor must not report it as covered.
  it('counts only the entries it is given', () => {
    expect(coverage(withShelved)).toEqual(new Map([['A', 2]]));
    expect(coverage(withShelved, new Set(['live']))).toEqual(new Map([['A', 1]]));
    expect(coverage(withShelved, new Set(['shelved'])).get('A')).toBe(1);
    expect(coverage(withShelved, new Set()).get('A')).toBeUndefined();
  });
});
