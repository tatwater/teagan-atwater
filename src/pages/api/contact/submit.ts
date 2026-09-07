import type { APIRoute } from 'astro';

import { getConvexClient } from '@/lib/convex';
import { sendContactReceipt, sendContactSubmission } from '@/lib/email';
import { parseContactSubmission } from '@/lib/contact-submission';
import { deliverContactSubmission } from '@/lib/contact-delivery';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';


export const prerender = false;


function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
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
    const email = {
      name: submission.name,
      email: submission.email,
      subject: submission.subject,
      message: submission.message,
      submittedAt,
    };

    const outcome = await deliverContactSubmission({
      record: async () => {
        const convex = getConvexClient();
        const result = await convex.mutation(api.contacts.submitContactMessage, {
          name: submission.name,
          email: submission.email,
          subject: submission.subject,
          message: submission.message,
        });

        return { contactId: result.contactId, threadId: result.threadId };
      },

      markDelivery: async (contactId, delivered) => {
        const convex = getConvexClient();
        await convex.mutation(api.contacts.markContactDelivery, {
          contactId: contactId as Id<'contacts'>,
          emailDelivered: delivered,
        });
      },

      sendNotification: (threadId) => sendContactSubmission({ ...email, threadId }),
      sendReceipt: (threadId) => sendContactReceipt({ ...email, threadId }),
      fallbackThreadId: () => `thread_${submittedAt.getTime()}`,
    });

    if (!outcome.ok) {
      return json({ error: outcome.error }, 502);
    }

    return json({ success: true, receiptSent: outcome.receiptSent }, 200);
  } catch (error) {
    console.error('Contact submission error:', error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
};
