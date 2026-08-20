export function getInitials(org: string): string {
  return org
    .split(/[\s\-\(\)]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
