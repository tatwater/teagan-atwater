import { getCollection } from 'astro:content';
import { resumeItems } from '@/data/resume';

/**
 * Search Index Builder
 *
 * Generates a static JSON index of all searchable content for the Command Palette.
 * This runs at build time and creates a lightweight index for client-side search.
 */

export interface SearchIndexItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'page' | 'project' | 'action';
  tags?: string[];
  icon?: string;
  published?: boolean;
  featured?: boolean;
  date?: string;
}

/**
 * Build search index from content collections
 * Call this during Astro build to generate search-index.json
 */
export async function buildSearchIndex(): Promise<SearchIndexItem[]> {
  const index: SearchIndexItem[] = [];

  // Add static pages
  const staticPages: SearchIndexItem[] = [
    // {
    //   id: 'admin',
    //   title: 'Admin Dashboard',
    //   description: 'Admin panel',
    //   url: '/admin/contact',
    //   type: 'page',
    //   icon: 'user',
    // },
  ];

  index.push(...staticPages);

  // Add resume detail pages — only for items that have a detail page (detailLabel opt-in)
  for (const item of resumeItems.filter((item) => item.detailLabel)) {
    const sectionLabel =
      item.type === 'experience'
        ? 'Experience'
        : item.type === 'education'
        ? 'Education'
        : 'Project';

    index.push({
      id: `resume-${item.id}`,
      title: item.title,
      description: `${sectionLabel} · ${item.organizationName} — ${item.descriptionHeadline}`,
      url: `/resume/${item.id}`,
      type: 'project',
      icon: item.type === 'experience' ? 'folder' : item.type === 'education' ? 'file' : 'folder',
      tags: [...item.tags, item.organizationName, sectionLabel.toLowerCase()],
    });
  }

  // Add projects from content collection
  try {
    const projects = await getCollection('projects');

    for (const project of projects) {
      // Only include published projects in the search index
      if (!project.data.published) {
        continue;
      }

      index.push({
        id: `project-${project.id}`,
        title: project.data.title,
        description: project.data.description,
        url: `/projects/${project.id}`,
        type: 'project',
        tags: project.data.tags,
        icon: 'folder',
        published: project.data.published,
        featured: project.data.featured,
        date: project.data.date.toISOString(),
      });
    }
  } catch (error) {
    console.warn('Failed to load projects collection:', error);
  }

  return index;
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
