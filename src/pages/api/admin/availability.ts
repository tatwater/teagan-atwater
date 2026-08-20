import type { APIRoute } from 'astro';
import { getConvexClient } from '../../../lib/convex';
import { api } from '../../../../convex/_generated/api';

export const POST: APIRoute = async ({ request, locals }) => {
  const isAdmin = (locals as any).isAdmin;
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
  }

  try {
    const body = await request.json();
    const { group, subject, isAvailable } = body;

    if (!subject || typeof isAvailable !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'subject and isAvailable are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const convex = getConvexClient();
    await convex.mutation(api.availability.setAvailability, {
      group: group ?? undefined,
      subject,
      isAvailable,
      isAdmin: true,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to update' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
