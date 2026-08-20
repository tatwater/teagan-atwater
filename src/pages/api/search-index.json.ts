import type { APIRoute } from 'astro';

import { buildSearchIndex } from '@/lib/search-index';

/**
 * Search Index API Endpoint
 *
 * Returns the search index consumed by the command palette. The site has no
 * authentication, so the whole index is public.
 */
export const GET: APIRoute = () => {
  try {
    const index = buildSearchIndex();

    return new Response(JSON.stringify(index), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache for 5 minutes in production, no cache in development
        'Cache-Control': import.meta.env.PROD
          ? 'public, max-age=300'
          : 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to build search index:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to build search index',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
