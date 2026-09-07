/**
 * Ordering and failure semantics for a contact submission, kept apart from the
 * API route so the rules can be exercised without standing up a request or
 * touching Convex and Resend.
 *
 * Convex and Resend cannot share a transaction: a Convex mutation is atomic only
 * inside Convex, and a Resend send is irreversible once accepted. The closest
 * available equivalent is to order the steps so the reversible one runs first,
 * and to leave a compensating record for the single case that is not atomic.
 *
 *   1. Record to Convex. Failure is logged but NOT fatal — the notification
 *      email is what actually reaches the owner, and telling a sender their
 *      message failed when it landed in the inbox only produces duplicates.
 *   2. Send the notification email. Failure IS fatal: this is real delivery, so
 *      the sender has to know. The Convex row is stamped `emailDelivered: false`
 *      so the message is still recoverable by hand.
 *   3. Send the receipt to the sender. Best-effort — it goes to an unverified
 *      address, so a bounce must not fail a submission that already succeeded.
 */

import type { SendResult } from '@/lib/email';


export const DELIVERY_FAILED_MESSAGE =
  'We could not deliver your message. Please email desk@teaganatwater.com directly.';


export interface DeliveryLogger {
  error: (message: string, detail?: unknown) => void;
  warn: (message: string, detail?: unknown) => void;
}

export interface DeliveryDeps {
  /** Persist the message. Resolves with a null contactId if it could not be stored. */
  record: () => Promise<{ contactId: string | null; threadId: string }>;
  sendNotification: (threadId: string) => Promise<SendResult>;
  sendReceipt: (threadId: string) => Promise<SendResult>;
  markDelivery: (contactId: string, delivered: boolean) => Promise<void>;
  /** Thread id to fall back on when the message could not be recorded. */
  fallbackThreadId: () => string;
  logger?: DeliveryLogger;
}

export interface DeliveryOutcome {
  ok: boolean;
  error?: string;
  threadId: string;
  recorded: boolean;
  receiptSent: boolean;
}


export async function deliverContactSubmission(deps: DeliveryDeps): Promise<DeliveryOutcome> {
  const log = deps.logger ?? console;

  let contactId: string | null = null;
  let threadId: string;

  try {
    const stored = await deps.record();
    contactId = stored.contactId;
    threadId = stored.threadId;
  } catch (error) {
    // Non-fatal by design: the notification email still gets the message through.
    log.error('Failed to record contact message in Convex:', error);
    threadId = deps.fallbackThreadId();
  }

  const recorded = contactId !== null;

  let notification: SendResult;

  try {
    notification = await deps.sendNotification(threadId);
  } catch (error) {
    log.error('Unexpected error sending the contact notification:', error);
    notification = { success: false, error: 'Unknown error' };
  }

  if (contactId !== null) {
    try {
      await deps.markDelivery(contactId, notification.success);
    } catch (error) {
      // The stamp is a recovery aid, not part of delivery — never fail on it.
      log.warn('Could not stamp delivery state on the contact record:', error);
    }
  }

  if (!notification.success) {
    return {
      ok: false,
      error: DELIVERY_FAILED_MESSAGE,
      threadId,
      recorded,
      receiptSent: false,
    };
  }

  let receiptSent = false;

  try {
    receiptSent = (await deps.sendReceipt(threadId)).success;
  } catch (error) {
    log.warn('Unexpected error sending the contact receipt:', error);
  }

  if (!receiptSent) {
    log.warn(`Contact receipt was not delivered for thread ${threadId}.`);
  }

  return { ok: true, threadId, recorded, receiptSent };
}
