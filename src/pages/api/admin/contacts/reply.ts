/**
 * Admin Reply to Contact Message API Route
 * 
 * Handles admin replies to contact messages.
 * Saves reply to Convex and sends email to user.
 * Admin-only endpoint.
 */

import type { APIRoute } from 'astro';
import { getConvexClient } from '../../../../lib/convex';
import { isAdmin } from '../../../../lib/auth';
import { sendUserReply } from '../../../../lib/email';
import { api } from '../../../../../convex/_generated/api';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get auth info from middleware
    const auth = (locals as any).auth?.();
    const userId = auth?.userId;

    // Check admin access
    if (!userId || !isAdmin(userId)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await request.json();
    const { messageId, replyMessage } = body;

    if (!messageId || !replyMessage) {
      return new Response(
        JSON.stringify({ error: 'Message ID and reply message are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the original message first
    const convex = getConvexClient();
    const originalMessage = await convex.query(api.contacts.getContactMessage, {
      messageId: messageId as any,
      isAdmin: true,
    });

    if (!originalMessage) {
      return new Response(
        JSON.stringify({ error: 'Original message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save reply to Convex
    const result = await convex.mutation(api.contacts.replyToContactMessage, {
      contactId: messageId as any,
      adminId: userId,
      replyMessage,
      isAdmin: true,
    });

    // Send reply email to user
    let emailStatus = { sent: false, error: null as string | null };
    try {
      console.log('Attempting to send reply email to user...');
      const emailResult = await sendUserReply({
        userEmail: originalMessage.userEmail,
        userName: originalMessage.userName,
        originalSubject: originalMessage.subject,
        originalMessage: originalMessage.message,
        replyMessage,
        threadId: originalMessage.threadId,
      });
      
      if (emailResult.success) {
        console.log('Reply email sent successfully:', emailResult.messageId);
        emailStatus.sent = true;
      } else {
        console.error('Failed to send reply email:', emailResult.error);
        emailStatus.error = emailResult.error || 'Unknown error';
      }
    } catch (emailError) {
      const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
      console.error('Exception while sending reply email:', errorMessage);
      emailStatus.error = errorMessage;
      // Don't fail the request if email fails - the reply is saved
    }

    return new Response(
      JSON.stringify({
        success: true,
        replyId: result.replyId,
        emailSent: emailStatus.sent,
        emailError: emailStatus.error,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Reply submission error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to send reply',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};