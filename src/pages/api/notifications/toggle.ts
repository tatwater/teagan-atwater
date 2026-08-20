import type { APIRoute } from 'astro';
import { getConvexClient } from '../../../lib/convex';
import { api } from '../../../../convex/_generated/api';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const auth = (locals as any).auth?.();
    const userId = auth?.userId;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { group, subject } = body;

    if (!subject) {
      return new Response(
        JSON.stringify({ error: 'Subject is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const convex = getConvexClient();
    const result = await convex.mutation(api.notifications.toggleNotification, {
      userId,
      group: group ?? undefined,
      subject,
    });

    return new Response(JSON.stringify({ success: true, isActive: result.isActive }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to toggle notification' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
