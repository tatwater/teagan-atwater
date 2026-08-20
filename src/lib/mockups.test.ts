import { describe, it, expect } from 'vitest';
import { mockupsFor } from '@/lib/mockups';
import { highlights } from '@/data/highlights';

describe('mockupsFor', () => {
  // Photosets are dropped in per project over time, so the home page has to stay
  // intact for every highlight that has no directory yet.
  it('returns an empty list for a highlight with no mockup directory', () => {
    expect(mockupsFor('project-with-no-art-yet', 'Nothing Yet')).toEqual([]);
  });

  it('resolves without throwing for every highlight on the home page', () => {
    for (const highlight of highlights) {
      expect(() => mockupsFor(highlight.id, highlight.name)).not.toThrow();
    }
  });

  it('gives every shot a src and non-empty alt text', () => {
    for (const highlight of highlights) {
      for (const shot of mockupsFor(highlight.id, highlight.name)) {
        expect(shot.src).toBeTruthy();
        expect(shot.alt.trim()).not.toBe('');
      }
    }
  });
});


describe('home page highlights', () => {
  it('resolves each highlight to a résumé entry', () => {
    expect(highlights.length).toBeGreaterThan(0);

    for (const highlight of highlights) {
      expect(highlight.item.id).toBe(highlight.id);
      expect(highlight.name.trim()).not.toBe('');
      expect(highlight.tagline.trim()).not.toBe('');
    }
  });
});
