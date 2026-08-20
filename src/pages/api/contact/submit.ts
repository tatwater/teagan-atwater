import type { APIRoute } from 'astro';
import type { ContactSubmission } from '@/lib/contact-submission';

import { getConvexClient } from '@/lib/convex';
import { sendContactSubmission } from '@/lib/email';
import { parseContactSubmission } from '@/lib/contact-submission';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { api } from '../../../../convex/_generated/api';


export const prerender = false;


function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}


/**
 * Persist the message, falling back to a synthetic thread id so a Convex outage
 * still lets the notification email go out.
 */
async function record(
  submission: ContactSubmission,
  submittedAt: Date,
): Promise<{ threadId: string; recorded: boolean }> {
  try {
    const convex = getConvexClient();
    const result = await convex.mutation(api.contacts.submitContactMessage, {
      name: submission.name,
      email: submission.email,
      subject: submission.subject,
      message: submission.message,
    });

    return { threadId: result.threadId, recorded: true };
  } catch (error) {
    console.error('Failed to record contact message in Convex:', error);

    return { threadId: `thread_${submittedAt.getTime()}`, recorded: false };
  }
}


export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const parsed = parseContactSubmission(await request.json().catch(() => null));

    if (!parsed.ok) {
      return json({ error: parsed.error }, 400);
    }

    const submission = parsed.data;
    const captcha = await verifyTurnstileToken(submission.turnstileToken, clientAddress);

    if (!captcha.success) {
      return json({ error: captcha.error ?? 'Captcha verification failed.' }, 400);
    }

    const submittedAt = new Date();

    // Record and notify independently — the message survives if either path works.
    const { threadId, recorded } = await record(submission, submittedAt);
    const emailResult = await sendContactSubmission({
      name: submission.name,
      email: submission.email,
      subject: submission.subject,
      message: submission.message,
      threadId,
      submittedAt,
    });

    if (!recorded && !emailResult.success) {
      return json(
        { error: 'We could not deliver your message. Please email desk@teaganatwater.com directly.' },
        502,
      );
    }

    return json({ success: true }, 200);
  } catch (error) {
    console.error('Contact submission error:', error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
};
