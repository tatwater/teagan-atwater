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
    const { firstName, lastName, phone, organization } = body;

    if (!firstName?.trim()) {
      return new Response(
        JSON.stringify({ error: 'First name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get email from Clerk
    let userEmail = '';
    try {
      const currentUser = await (locals as any).currentUser?.();
      if (currentUser) {
        userEmail =
          currentUser.emailAddresses?.find(
            (e: any) => e.id === currentUser.primaryEmailAddressId
          )?.emailAddress ?? '';
      }
    } catch {
      // non-fatal
    }

    const convex = getConvexClient();
    await convex.mutation(api.userProfile.completeProfile, {
      clerkId: userId,
      email: userEmail,
      firstName: firstName.trim(),
      lastName: lastName?.trim() || undefined,
      phone: phone?.trim() || undefined,
      organization: organization?.trim() || undefined,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to save profile' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PATCH: APIRoute = async ({ request, locals }) => {
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
    const { firstName, lastName, phone, organization } = body;

    let userEmail = '';
    try {
      const currentUser = await (locals as any).currentUser?.();
      if (currentUser) {
        userEmail =
          currentUser.emailAddresses?.find(
            (e: any) => e.id === currentUser.primaryEmailAddressId
          )?.emailAddress ?? '';
      }
    } catch {
      // non-fatal
    }

    const convex = getConvexClient();
    await convex.mutation(api.userProfile.upsertUserProfile, {
      clerkId: userId,
      email: userEmail,
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
      phone: phone?.trim() || undefined,
      organization: organization?.trim() || undefined,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to update profile' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
