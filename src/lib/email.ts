/**
 * Email Service Helper
 * 
 * Provides utilities for sending emails via Resend.
 * Used for contact form notifications and admin replies.
 */

import { Resend } from 'resend';
import { render } from 'react-email';
import AdminNotificationEmail from '../emails/AdminNotification';
import UserReplyEmail from '../emails/UserReply';
import ContactSubmissionEmail from '../emails/ContactSubmission';

/**
 * Initialize Resend client
 */
function getResendClient() {
  const apiKey = import.meta.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  return new Resend(apiKey);
}

/**
 * Get the from email address for sending emails (notifications)
 */
function getFromEmail(): string {
  const fromEmail = import.meta.env.RESEND_FROM_EMAIL;
  
  if (!fromEmail) {
    throw new Error('RESEND_FROM_EMAIL environment variable is not set');
  }

  return fromEmail;
}

/**
 * Get the reply email address for sending replies to users
 */
function getReplyEmail(): string {
  const replyEmail = import.meta.env.RESEND_REPLY_EMAIL;
  
  if (!replyEmail) {
    throw new Error('RESEND_REPLY_EMAIL environment variable is not set');
  }

  return replyEmail;
}

/**
 * Get the admin email address for notifications
 */
function getAdminEmail(): string {
  const adminEmail = import.meta.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL environment variable is not set');
  }

  return adminEmail;
}

/**
 * Get the site URL for generating links
 */
function getSiteUrl(): string {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL;
  
  if (!siteUrl) {
    throw new Error('PUBLIC_SITE_URL environment variable is not set');
  }

  return siteUrl;
}

/**
 * Send admin notification when a new contact message is submitted
 */
export async function sendAdminNotification(params: {
  userName?: string;
  userEmail: string;
  subject: string;
  message: string;
  messageId: string;
  threadId: string;
  submittedAt: Date;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient();
    const fromEmail = getFromEmail();
    const adminEmail = getAdminEmail();
    const siteUrl = getSiteUrl();

    const messageUrl = `${siteUrl}/admin/contact/${params.messageId}`;

    const emailHtml = await render(
      AdminNotificationEmail({
        userName: params.userName,
        userEmail: params.userEmail,
        subject: params.subject,
        message: params.message,
        messageUrl,
        submittedAt: params.submittedAt.toLocaleString('en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
        }),
      })
    );

    const result = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: params.userEmail,
      subject: `New Contact Message: ${params.subject}`,
      html: emailHtml,
      headers: {
        'X-Thread-ID': params.threadId,
      },
    });

    if (result.error) {
      console.error('Failed to send admin notification:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send contact form submission to desk@teaganatwater.com
 */
export async function sendContactSubmission(params: {
  userName: string;
  userEmail: string;
  userPhone?: string;
  userOrganization?: string;
  subjectLabel: string;
  groupLabel: string | null;
  formFields: Array<{ label: string; value: string }>;
  threadId: string;
  submittedAt: Date;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient();
    const emailSubject = `New website contact: ${params.subjectLabel} from ${params.userName}`;

    const emailHtml = await render(
      ContactSubmissionEmail({
        userName: params.userName,
        userEmail: params.userEmail,
        userPhone: params.userPhone,
        userOrganization: params.userOrganization,
        subjectLabel: params.subjectLabel,
        groupLabel: params.groupLabel,
        formFields: params.formFields,
        submittedAt: params.submittedAt.toLocaleString('en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
        }),
      })
    );

    const result = await resend.emails.send({
      from: 'notifications@teaganatwater.com',
      to: 'desk@teaganatwater.com',
      replyTo: params.userEmail,
      subject: emailSubject,
      html: emailHtml,
      headers: {
        'X-Thread-ID': params.threadId,
      },
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send reply to user when admin responds to their contact message
 */
export async function sendUserReply(params: {
  userName?: string;
  userEmail: string;
  originalSubject: string;
  originalMessage: string;
  replyMessage: string;
  threadId: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient();
    const replyEmail = getReplyEmail();

    const emailHtml = await render(
      UserReplyEmail({
        userName: params.userName,
        originalSubject: params.originalSubject,
        originalMessage: params.originalMessage,
        replyMessage: params.replyMessage,
        threadId: params.threadId,
      })
    );

    const result = await resend.emails.send({
      from: replyEmail,
      to: params.userEmail,
      replyTo: replyEmail,
      subject: `Re: ${params.originalSubject}`,
      html: emailHtml,
      headers: {
        'X-Thread-ID': params.threadId,
        'In-Reply-To': params.threadId,
        'References': params.threadId,
      },
    });

    if (result.error) {
      console.error('Failed to send user reply:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Error sending user reply:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}