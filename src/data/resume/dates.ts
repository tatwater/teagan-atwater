/**
 * Date formatting shared by the résumé islands and the server-rendered résumé
 * pages. These live in the data layer rather than alongside the islands so the
 * `.astro` pages can reach them without importing across into client code.
 *
 * Detail pages spell the month out in full ("January 2024"); cards and the
 * printed résumé use the abbreviated form ("Jan 2024"), which is the default.
 */

type MonthStyle = 'long' | 'short';


/**
 * Parse a 'YYYY-MM' string into a local-time date. `new Date('2022-03')` would
 * parse as UTC, which lands in the previous month west of Greenwich and made
 * open-ended durations read a month long.
 */
function parseYearMonth(dateStr: string): Date {
  const [year, month] = dateStr.split('-').map(Number);

  return new Date(year, month - 1);
}


function formatDate(dateStr: string, month: MonthStyle): string {
  return parseYearMonth(dateStr).toLocaleDateString('en-US', {
    month,
    year: 'numeric',
  });
}


export function formatDateRange(
  dateStart: string,
  dateEnd: string | null,
  month: MonthStyle = 'short',
): string {
  return `${formatDate(dateStart, month)} – ${dateEnd ? formatDate(dateEnd, month) : 'Present'}`;
}


export function getDuration(dateStart: string, dateEnd: string | null): string {
  const start = parseYearMonth(dateStart);
  const end = dateEnd ? parseYearMonth(dateEnd) : new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts: string[] = [];

  if (years > 0)
    parts.push(`${years} yr${years !== 1 ? 's' : ''}`);
  if (rem > 0)
    parts.push(`${rem} mo${rem !== 1 ? 's' : ''}`);

  return parts.join(' ') || '< 1 mo';
}
