import { describe, it, expect } from 'vitest';
import {
  RATE_LIMIT_FALLBACK,
  parseRetryAfter,
  rateLimitMessage,
} from '@/lib/rate-limit-message';


const now = new Date('2026-09-07T12:00:00Z');


describe('parseRetryAfter', () => {
  it('reads a delay given in seconds', () => {
    expect(parseRetryAfter('120', now)).toBe(120);
  });

  it('reads an HTTP date and returns the remaining seconds', () => {
    expect(parseRetryAfter('Mon, 07 Sep 2026 12:05:00 GMT', now)).toBe(300);
  });

  it('rounds a partial second up so the advice is never early', () => {
    expect(parseRetryAfter('Mon, 07 Sep 2026 12:00:30 GMT', new Date('2026-09-07T11:59:59.500Z')))
      .toBe(31);
  });

  it('rejects absent, malformed, elapsed, and implausible values', () => {
    expect(parseRetryAfter(null, now)).toBeNull();
    expect(parseRetryAfter('', now)).toBeNull();
    expect(parseRetryAfter('soon', now)).toBeNull();
    expect(parseRetryAfter('0', now)).toBeNull();
    expect(parseRetryAfter('-30', now)).toBeNull();
    expect(parseRetryAfter('Mon, 07 Sep 2026 11:55:00 GMT', now)).toBeNull();
    expect(parseRetryAfter('999999', now)).toBeNull();
  });
});


describe('rateLimitMessage', () => {
  it('falls back to vague wording without a usable header', () => {
    expect(rateLimitMessage(null, now)).toBe(RATE_LIMIT_FALLBACK);
    expect(rateLimitMessage('nonsense', now)).toBe(RATE_LIMIT_FALLBACK);
  });

  it('reports a wait in minutes, rounded up', () => {
    expect(rateLimitMessage('600', now)).toContain('10 minutes');
    expect(rateLimitMessage('61', now)).toContain('2 minutes');
  });

  it('reports a short wait in seconds', () => {
    expect(rateLimitMessage('30', now)).toContain('30 seconds');
  });

  it('uses singular units where appropriate', () => {
    expect(rateLimitMessage('60', now)).toContain('1 minute');
    expect(rateLimitMessage('1', now)).toContain('1 second');
  });
});
