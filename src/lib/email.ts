/**
 * Email Service Helper
 *
 * Sends contact form submissions via Resend.
 */

import { Resend } from 'resend';
import { render } from 'react-email';
import ContactSubmissionEmail from '../emails/ContactSubmission';


/**
 * Vite statically replaces `import.meta.env.X` at build time, so each variable
 * must be referenced by literal property access — a dynamic lookup would be
 * undefined at runtime.
 */
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }

  return value;
}


/**
 * Send a contact form submission to the site owner.
 * `replyTo` is set to the sender so a reply from the inbox reaches them directly.
 */
export async function sendContactSubmission(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
  threadId: string;
  submittedAt: Date;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = new Resend(requireEnv('RESEND_API_KEY', import.meta.env.RESEND_API_KEY));

    const emailHtml = await render(
      ContactSubmissionEmail({
        name: params.name,
        email: params.email,
        subject: params.subject,
        message: params.message,
        submittedAt: params.submittedAt.toLocaleString('en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
        }),
      })
    );

    const result = await resend.emails.send({
      from: requireEnv('RESEND_FROM_EMAIL', import.meta.env.RESEND_FROM_EMAIL),
      to: requireEnv('ADMIN_EMAIL', import.meta.env.ADMIN_EMAIL),
      replyTo: params.email,
      subject: `New website contact from ${params.name}: ${params.subject}`,
      html: emailHtml,
      headers: {
        'X-Thread-ID': params.threadId,
      },
    });

    if (result.error) {
      console.error('Failed to send contact submission:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending contact submission:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
