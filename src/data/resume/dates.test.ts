import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatDateRange, getDuration } from '@/data/resume/dates';


afterEach(() => {
  vi.useRealTimers();
});


describe('formatDateRange', () => {
  it('abbreviates the month by default', () => {
    expect(formatDateRange('2024-01', '2024-05')).toBe('Jan 2024 – May 2024');
  });

  it('spells the month out when asked, for detail pages', () => {
    expect(formatDateRange('2024-01', '2024-05', 'long')).toBe('January 2024 – May 2024');
  });

  it('renders a null end date as Present', () => {
    expect(formatDateRange('2024-01', null)).toBe('Jan 2024 – Present');
    expect(formatDateRange('2024-01', null, 'long')).toBe('January 2024 – Present');
  });

  it('reads the month as a calendar month, not a zero-based index', () => {
    expect(formatDateRange('2024-12', '2024-12')).toBe('Dec 2024 – Dec 2024');
  });
});


describe('getDuration', () => {
  it('reports whole years', () => {
    expect(getDuration('2020-01', '2022-01')).toBe('2 yrs');
  });

  it('reports whole months', () => {
    expect(getDuration('2020-01', '2020-04')).toBe('3 mos');
  });

  it('combines years and months', () => {
    expect(getDuration('2020-01', '2022-04')).toBe('2 yrs 3 mos');
  });

  it('singularizes a lone year or month', () => {
    expect(getDuration('2020-01', '2021-01')).toBe('1 yr');
    expect(getDuration('2020-01', '2020-02')).toBe('1 mo');
  });

  it('falls back to "< 1 mo" rather than an empty string', () => {
    expect(getDuration('2020-01', '2020-01')).toBe('< 1 mo');
  });

  it('measures an open-ended range against today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T00:00:00Z'));

    expect(getDuration('2022-03', null)).toBe('2 yrs');
  });
});
