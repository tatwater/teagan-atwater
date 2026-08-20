import { resumeItems } from '@/data/resume';

/**
 * Search Index Builder
 *
 * Builds the index the command palette searches. Résumé data lives in plain
 * TypeScript modules rather than a content collection: the entries are
 * structured and relational rather than prose, and two React islands import
 * them synchronously, which `getCollection` — being async and server-only —
 * cannot support.
 */

export interface SearchIndexItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'page' | 'project' | 'action';
  tags?: string[];
  icon?: string;
}

const SECTION_LABEL = {
  education: 'Education',
  experience: 'Experience',
  project: 'Project',
} as const;


export function buildSearchIndex(): SearchIndexItem[] {
  // Only entries that opt into a detail page with `detailLabel` have a URL to
  // point at — see getStaticPaths in src/pages/resume/[id].astro.
  return resumeItems
    .filter((item) => item.detailLabel)
    .map((item) => {
      const sectionLabel = SECTION_LABEL[item.type];

      return {
        id: `resume-${item.id}`,
        title: item.title,
        description: `${sectionLabel} · ${item.organizationName} — ${item.descriptionHeadline}`,
        url: `/resume/${item.id}`,
        type: 'project' as const,
        icon: item.type === 'education' ? 'file' : 'folder',
        tags: [...item.tags, item.organizationName, sectionLabel.toLowerCase()],
      };
    });
}


/**
 * Create a lightweight search index for MiniSearch
 * Returns the index in a format optimized for MiniSearch
 */
export function createMiniSearchIndex(items: SearchIndexItem[]) {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    tags: item.tags?.join(' ') || '',
    type: item.type,
    url: item.url,
  }));
}
