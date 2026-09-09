/**
 * Email Service Helper
 *
 * Sends contact form submissions via Resend: a notification to the site owner,
 * and a receipt back to the sender.
 */

import { Resend } from 'resend';
import { render } from 'react-email';
import { ADMIN_EMAIL, RESEND_API_KEY, RESEND_FROM_EMAIL } from 'astro:env/server';
import ContactSubmissionEmail from '../emails/ContactSubmission';
import ContactReceiptEmail from '../emails/ContactReceipt';


export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface ContactEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
  threadId: string;
  submittedAt: Date;
}


function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }

  return value;
}


/**
 * Every variable a send needs, reported together.
 *
 * `requireEnv` throws on the first miss and `send` flattens that into the same
 * generic failure any Resend error produces, so an unconfigured deployment used
 * to look identical to a bounced domain — the variable's name was only legible
 * by reading the exception inside an "Error sending …" line, and a deployment
 * missing two variables surfaced the second one only after redeploying for the
 * first. Naming the whole set up front makes the log line the diagnosis.
 */
function missingEmailConfig(): string[] {
  const required: Record<string, string | undefined> = {
    RESEND_API_KEY,
    RESEND_FROM_EMAIL,
    ADMIN_EMAIL,
  };

  return Object.entries(required)
    .filter(([, value]) => !value)
    .map(([name]) => name);
}


function formatTimestamp(submittedAt: Date): string {
  return submittedAt.toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}


/**
 * Wraps a Resend send so a transport failure and an API-level error surface the
 * same way, and neither escapes as an exception into the request handler.
 *
 * The returned `error` names configuration when that is the cause. It stays out
 * of the response: `deliverContactSubmission` answers a failed notification with
 * its own fixed message, and a receipt's result is read only as a boolean.
 */
async function send(
  label: string,
  build: (resend: Resend) => Promise<{ data: { id: string } | null; error: { message: string } | null }>,
): Promise<SendResult> {
  const missing = missingEmailConfig();

  if (missing.length > 0) {
    console.error(
      `Cannot send ${label}: ${missing.join(', ')} `
      + `${missing.length === 1 ? 'is' : 'are'} not set in this environment. `
      + 'Set them on the deployment and redeploy — these are read at runtime, so '
      + 'a build that shipped before they existed will not pick them up.',
    );

    return { success: false, error: `Missing email configuration: ${missing.join(', ')}` };
  }

  try {
    const resend = new Resend(requireEnv('RESEND_API_KEY', RESEND_API_KEY));
    const result = await build(resend);

    if (result.error) {
      console.error(`Failed to send ${label}:`, result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error(`Error sending ${label}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


/**
 * Notify the site owner. This is the send that actually delivers the message,
 * so the contact route treats its failure as fatal.
 * `replyTo` is the sender, so a reply from the inbox reaches them directly.
 */
export async function sendContactSubmission(params: ContactEmailParams): Promise<SendResult> {
  return send('contact submission', async (resend) => {
    const html = await render(
      ContactSubmissionEmail({
        name: params.name,
        email: params.email,
        subject: params.subject,
        message: params.message,
        submittedAt: formatTimestamp(params.submittedAt),
      })
    );

    return resend.emails.send({
      from: requireEnv('RESEND_FROM_EMAIL', RESEND_FROM_EMAIL),
      to: requireEnv('ADMIN_EMAIL', ADMIN_EMAIL),
      replyTo: params.email,
      subject: `New website contact from ${params.name}: ${params.subject}`,
      html,
      headers: {
        'X-Thread-ID': params.threadId,
      },
    });
  });
}


/**
 * Confirm receipt to the sender. Best-effort: this goes to an address we have
 * not verified, so a bounce or a typo must not fail the submission.
 * `replyTo` is the site owner, so replies to the receipt still reach a person.
 */
export async function sendContactReceipt(params: ContactEmailParams): Promise<SendResult> {
  return send('contact receipt', async (resend) => {
    const html = await render(
      ContactReceiptEmail({
        name: params.name,
        subject: params.subject,
        message: params.message,
        submittedAt: formatTimestamp(params.submittedAt),
      })
    );

    return resend.emails.send({
      from: requireEnv('RESEND_FROM_EMAIL', RESEND_FROM_EMAIL),
      to: params.email,
      replyTo: requireEnv('ADMIN_EMAIL', ADMIN_EMAIL),
      subject: `Thanks for getting in touch — I received your message`,
      html,
      headers: {
        'X-Thread-ID': params.threadId,
      },
    });
  });
}
