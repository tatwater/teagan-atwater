import type { APIRoute } from 'astro';
import { getConvexClient } from '../../../lib/convex';
import { sendContactSubmission } from '../../../lib/email';
import { api } from '../../../../convex/_generated/api';
import { findSubject } from '../../../data/contact';

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
    const { subjectSlug, group, formValues } = body;

    if (!subjectSlug) {
      return new Response(
        JSON.stringify({ error: 'Subject is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user info from Clerk
    let userEmail = '';
    let userName = '';
    try {
      const currentUser = await (locals as any).currentUser?.();
      if (currentUser) {
        userEmail =
          currentUser.emailAddresses?.find(
            (e: any) => e.id === currentUser.primaryEmailAddressId
          )?.emailAddress ?? '';
        userName = currentUser.fullName || currentUser.firstName || '';
      }
    } catch {
      // handled below
    }

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'Could not retrieve user email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Look up subject config for email formatting
    const found = findSubject(group ?? null, subjectSlug);
    const subjectLabel = found?.subject.label ?? subjectSlug;
    const groupLabel = found?.group.label ?? null;

    // Build a human-readable subject line for the contacts record
    const subjectLine = groupLabel
      ? `${groupLabel} · ${subjectLabel} inquiry`
      : `${subjectLabel} inquiry`;

    // Extract the message field (present in all forms)
    const message = (formValues?.message as string) ?? '';

    // Build flat form fields for email (label → value pairs)
    const emailFields: Array<{ label: string; value: string }> = [];
    if (found?.subject.formFields) {
      for (const field of found.subject.formFields) {
        const val = formValues?.[field.name];
        if (val) emailFields.push({ label: field.label, value: String(val) });
      }
    }

    // Submit to Convex
    const convex = getConvexClient();
    const result = await convex.mutation(api.contacts.submitContactMessage, {
      userId,
      userEmail,
      userName: userName || undefined,
      subject: subjectLine,
      message,
      subjectSlug,
      group: group ?? undefined,
      formData: formValues ?? {},
    });

    // Get user profile for email enrichment
    let userPhone: string | undefined;
    let userOrganization: string | undefined;
    try {
      const profile = await convex.query(api.userProfile.getUserProfile, { clerkId: userId });
      userPhone = profile?.phone ?? undefined;
      userOrganization = profile?.organization ?? undefined;
      if (!userName && profile?.displayName) userName = profile.displayName;
    } catch {
      // non-fatal
    }

    // Send submission email
    const emailResult = await sendContactSubmission({
      userName: userName || userEmail,
      userEmail,
      userPhone,
      userOrganization,
      subjectLabel,
      groupLabel: groupLabel ?? null,
      formFields: emailFields,
      threadId: result.threadId,
      submittedAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        contactId: result.contactId,
        threadId: result.threadId,
        emailSent: emailResult.success,
        emailError: emailResult.error,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contact submission error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to submit message',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
