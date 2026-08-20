export function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number);

  return new Date(year, month - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}


export function formatDateRange(dateStart: string, dateEnd: string | null): string {
  return `${formatDate(dateStart)} – ${dateEnd ? formatDate(dateEnd) : 'Present'}`;
}


export function getDuration(dateStart: string, dateEnd: string | null): string {
  const start = new Date(dateStart);
  const end = dateEnd ? new Date(dateEnd) : new Date();
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


export function getInitials(org: string): string {
  return org
    .split(/[\s\-\(\)]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
