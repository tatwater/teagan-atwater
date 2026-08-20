/**
 * Admin Single Contact Message API Route
 * 
 * Returns a specific contact message with full details and replies.
 * Admin-only endpoint.
 */

import type { APIRoute } from 'astro';
import { getConvexClient } from '../../../../lib/convex';
import { isAdmin } from '../../../../lib/auth';
import { api } from '../../../../../convex/_generated/api';

export const GET: APIRoute = async ({ params, locals }) => {
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

    const { messageId } = params;

    if (!messageId) {
      return new Response(
        JSON.stringify({ error: 'Message ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from Convex
    const convex = getConvexClient();
    
    const message = await convex.query(api.contacts.getContactMessage, {
      messageId: messageId as any,
      isAdmin: true,
    });

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin contact fetch error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to fetch contact message',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};