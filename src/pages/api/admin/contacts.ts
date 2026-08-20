/**
 * Admin Contacts API Route
 * 
 * Returns all contact messages for admin dashboard.
 * Admin-only endpoint.
 */

import type { APIRoute } from 'astro';
import { getConvexClient } from '../../../lib/convex';
import { isAdmin } from '../../../lib/auth';
import { api } from '../../../../convex/_generated/api';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Get auth info from middleware
    const auth = (locals as any).auth?.();
    const userId = auth?.userId;

    // Check admin access
    if (!userId || !isAdmin(userId)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as 'new' | 'read' | 'replied' | 'archived' | null;

    // Fetch from Convex
    const convex = getConvexClient();
    
    const messages = await convex.query(api.contacts.getAllContactMessages, {
      isAdmin: true,
      status: status || undefined,
    });

    return new Response(
      JSON.stringify({
        success: true,
        messages,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin contacts fetch error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to fetch contacts',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};