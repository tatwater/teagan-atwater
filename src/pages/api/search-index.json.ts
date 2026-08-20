import type { APIRoute } from 'astro';
import { buildSearchIndex, filterIndexByPermissions } from '../../lib/search-index';
import { getUserInfo } from '../../lib/auth';

/**
 * Search Index API Endpoint
 * 
 * Returns the search index filtered by user permissions.
 * This endpoint is called by the CommandPalette to load searchable content.
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    // Build the full search index
    const fullIndex = await buildSearchIndex();

    // Get user info to filter by permissions
    const userInfo = getUserInfo(locals);
    const isAuthenticated = userInfo.isAuthenticated;
    const userGroups = userInfo.userGroups || [];

    // Filter index based on user permissions
    const filteredIndex = filterIndexByPermissions(
      fullIndex,
      userGroups,
      isAuthenticated
    );

    // Return as JSON
    return new Response(JSON.stringify(filteredIndex), {
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
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};