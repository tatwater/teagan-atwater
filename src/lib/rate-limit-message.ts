/**
 * Turns a `Retry-After` header into something a person can act on.
 *
 * The Vercel WAF blocks rate-limited requests at the edge, so a 429 never
 * reaches the contact route and carries no JSON body — the form would otherwise
 * fall back to "Something went wrong. Please try again.", which invites the
 * immediate retry that is guaranteed to fail.
 */

export const RATE_LIMIT_FALLBACK =
  'You have sent several messages recently. Please wait a few minutes before sending another.';

/** Anything longer than this is treated as unusable and falls back to vague wording. */
const MAX_REASONABLE_SECONDS = 24 * 60 * 60;


/**
 * `Retry-After` is either a delay in seconds or an HTTP date (RFC 9110).
 * Returns whole seconds remaining, or null when the value is absent, malformed,
 * already elapsed, or implausibly far away.
 */
export function parseRetryAfter(value: string | null | undefined, now: Date = new Date()): number | null {
  if (!value) return null;

  const trimmed = value.trim();

  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);

    if (seconds <= 0 || seconds > MAX_REASONABLE_SECONDS) return null;

    return seconds;
  }

  const target = Date.parse(trimmed);

  if (Number.isNaN(target)) return null;

  const seconds = Math.ceil((target - now.getTime()) / 1000);

  if (seconds <= 0 || seconds > MAX_REASONABLE_SECONDS) return null;

  return seconds;
}


function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return seconds === 1 ? '1 second' : `${seconds} seconds`;
  }

  const minutes = Math.ceil(seconds / 60);

  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}


export function rateLimitMessage(retryAfter: string | null | undefined, now: Date = new Date()): string {
  const seconds = parseRetryAfter(retryAfter, now);

  if (seconds === null) return RATE_LIMIT_FALLBACK;

  return `You have sent several messages recently. Please try again in ${formatDuration(seconds)}.`;
}
