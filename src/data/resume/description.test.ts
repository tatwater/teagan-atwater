import { describe, it, expect } from 'vitest';
import { descriptionText, hasDescription, toBulletRuns } from '@/data/resume/description';


describe('descriptionText', () => {
  it('returns prose unchanged', () => {
    expect(descriptionText('A summary.')).toBe('A summary.');
  });

  it('joins plain bullets', () => {
    expect(descriptionText(['First bullet', 'Second bullet'])).toBe('First bullet Second bullet');
  });

  it('includes group labels so a search can find them', () => {
    const body = [{ label: 'Impact', bullets: ['Shipped it'] }];

    expect(descriptionText(body)).toBe('Impact Shipped it');
  });

  it('flattens plain bullets and labeled groups together', () => {
    const body = ['Lead-in', { label: 'Built', bullets: ['One', 'Two'] }];

    expect(descriptionText(body)).toBe('Lead-in Built One Two');
  });

  it('joins with a caller-supplied separator', () => {
    expect(descriptionText(['One', 'Two'], ' · ')).toBe('One · Two');
  });

  it('is empty for missing or empty bodies', () => {
    expect(descriptionText(undefined)).toBe('');
    expect(descriptionText('')).toBe('');
    expect(descriptionText([])).toBe('');
  });
});


describe('toBulletRuns', () => {
  it('gathers consecutive plain bullets into one list', () => {
    expect(toBulletRuns(['One', 'Two', 'Three'])).toEqual([
      { bullets: ['One', 'Two', 'Three'] },
    ]);
  });

  it('gives each labeled group its own list', () => {
    const runs = toBulletRuns([
      { label: 'Built', bullets: ['One'] },
      { label: 'Impact', bullets: ['Two'] },
    ]);

    expect(runs).toEqual([
      { bullets: ['One'], label: 'Built' },
      { bullets: ['Two'], label: 'Impact' },
    ]);
  });

  it('does not let a plain bullet join the group before it', () => {
    const runs = toBulletRuns([{ label: 'Built', bullets: ['One'] }, 'Loose']);

    expect(runs).toEqual([
      { bullets: ['One'], label: 'Built' },
      { bullets: ['Loose'] },
    ]);
  });

  it('leaves the source entry untouched', () => {
    const group = { label: 'Built', bullets: ['One'] };
    toBulletRuns([group, 'Loose']);

    expect(group.bullets).toEqual(['One']);
  });

  it('is empty for an empty body', () => {
    expect(toBulletRuns([])).toEqual([]);
  });
});


describe('hasDescription', () => {
  it('is true for prose and for bullets', () => {
    expect(hasDescription('A summary.')).toBe(true);
    expect(hasDescription(['A bullet'])).toBe(true);
  });

  it('is false for missing, empty, and bullet-less bodies', () => {
    expect(hasDescription(undefined)).toBe(false);
    expect(hasDescription('')).toBe(false);
    expect(hasDescription([])).toBe(false);
  });
});
