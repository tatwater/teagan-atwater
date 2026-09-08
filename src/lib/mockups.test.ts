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

  it('gives every shot something to render and non-empty alt text', () => {
    for (const highlight of highlights) {
      for (const shot of mockupsFor(highlight.id, highlight.name)) {
        // An embed is rendered from its Mockuuups id rather than a URL, so what
        // counts as "renderable" depends on the kind.
        expect(shot.kind === 'embed' ? shot.mockupId : shot.src).toBeTruthy();
        expect(shot.alt.trim()).not.toBe('');
      }
    }
  });

  // The reel keys each shot on this, so a duplicate would drop a slot.
  it('gives every shot in a photoset a distinct identity', () => {
    for (const highlight of highlights) {
      const keys = mockupsFor(highlight.id, highlight.name)
        .map((shot) => (shot.kind === 'embed' ? shot.mockupId : shot.src));

      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  // A video or embed with no `position` leads its photoset.
  it('opens the NMC photoset on its video', () => {
    const shots = mockupsFor('nmc', 'The New Money Company');

    expect(shots[0]?.kind).toBe('video');
    expect(shots.slice(1).every((shot) => shot.kind === 'image')).toBe(true);
  });

  // One with a `position` is filed among the stills instead. The Sous embed is
  // keyed 02-, so it sits under the 01- laptop shot rather than above it.
  it('files the Sous embed second, below the laptop still', () => {
    const shots = mockupsFor('project-sous', 'Sous');

    expect(shots[0]?.kind).toBe('image');
    expect(shots[1]?.kind).toBe('embed');
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
