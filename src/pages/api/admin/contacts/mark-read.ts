/**
 * Admin Mark Contact as Read API Route
 * 
 * Marks a contact message as read.
 * Admin-only endpoint.
 */

import type { APIRoute } from 'astro';
import { getConvexClient } from '../../../../lib/convex';
import { isAdmin } from '../../../../lib/auth';
import { api } from '../../../../../convex/_generated/api';

export const POST: APIRoute = async ({ request, locals }) => {
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

    // Parse request body
    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return new Response(
        JSON.stringify({ error: 'Message ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update in Convex
    const convex = getConvexClient();
    
    await convex.mutation(api.contacts.markContactAsRead, {
      contactId: messageId as any,
      isAdmin: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Mark as read error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to mark as read',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};