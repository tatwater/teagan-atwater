import type { APIRoute } from 'astro';

import { getConvexClient } from '@/lib/convex';
import { sendContactSubmission } from '@/lib/email';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { api } from '../../../../convex/_generated/api';


export const prerender = false;

const LIMITS = {
  email: 320,
  message: 5000,
  name: 200,
  subject: 200,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}


export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return json({ error: 'Invalid request body.' }, 400);
    }

    const name = String((body as any).name ?? '').trim();
    const email = String((body as any).email ?? '').trim();
    const subject = String((body as any).subject ?? '').trim() || 'Website enquiry';
    const message = String((body as any).message ?? '').trim();
    const turnstileToken = (body as any).turnstileToken as string | undefined;

    if (!name) return json({ error: 'Please enter your name.' }, 400);
    if (!email) return json({ error: 'Please enter your email address.' }, 400);
    if (!EMAIL_PATTERN.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);
    if (!message) return json({ error: 'Please enter a message.' }, 400);

    if (
      name.length > LIMITS.name
      || email.length > LIMITS.email
      || subject.length > LIMITS.subject
      || message.length > LIMITS.message
    ) {
      return json({ error: 'One or more fields exceed the maximum length.' }, 400);
    }

    const captcha = await verifyTurnstileToken(turnstileToken, clientAddress);

    if (!captcha.success) {
      return json({ error: captcha.error ?? 'Captcha verification failed.' }, 400);
    }

    const submittedAt = new Date();

    // Record and notify independently — the message survives if either path works.
    let threadId = `thread_${submittedAt.getTime()}`;
    let recorded = false;

    try {
      const convex = getConvexClient();
      const result = await convex.mutation(api.contacts.submitContactMessage, {
        name,
        email,
        subject,
        message,
      });
      threadId = result.threadId;
      recorded = true;
    } catch (error) {
      console.error('Failed to record contact message in Convex:', error);
    }

    const emailResult = await sendContactSubmission({
      name,
      email,
      subject,
      message,
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
