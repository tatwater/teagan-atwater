import { describe, it, expect, vi } from 'vitest';
import {
  DELIVERY_FAILED_MESSAGE,
  deliverContactSubmission,
  type DeliveryDeps,
} from '@/lib/contact-delivery';


const silentLogger = { error: vi.fn(), warn: vi.fn() };

function deps(overrides: Partial<DeliveryDeps> = {}): DeliveryDeps {
  return {
    record: async () => ({ contactId: 'contact_1', threadId: 'thread_stored' }),
    sendNotification: async () => ({ success: true, messageId: 'notify_1' }),
    sendReceipt: async () => ({ success: true, messageId: 'receipt_1' }),
    markDelivery: async () => {},
    fallbackThreadId: () => 'thread_fallback',
    logger: silentLogger,
    ...overrides,
  };
}


describe('deliverContactSubmission', () => {
  it('records, notifies, and sends a receipt on the happy path', async () => {
    const sendReceipt = vi.fn(async () => ({ success: true }));
    const markDelivery = vi.fn(async () => {});

    const outcome = await deliverContactSubmission(deps({ sendReceipt, markDelivery }));

    expect(outcome).toMatchObject({
      ok: true,
      recorded: true,
      receiptSent: true,
      threadId: 'thread_stored',
    });
    expect(sendReceipt).toHaveBeenCalledWith('thread_stored');
    expect(markDelivery).toHaveBeenCalledWith('contact_1', true);
  });

  it('fails the submission when the notification email fails', async () => {
    const sendReceipt = vi.fn(async () => ({ success: true }));

    const outcome = await deliverContactSubmission(deps({
      sendNotification: async () => ({ success: false, error: 'resend down' }),
      sendReceipt,
    }));

    expect(outcome.ok).toBe(false);
    expect(outcome.error).toBe(DELIVERY_FAILED_MESSAGE);
    expect(outcome.receiptSent).toBe(false);
  });

  it('does not send a receipt when the message was never delivered', async () => {
    const sendReceipt = vi.fn(async () => ({ success: true }));

    await deliverContactSubmission(deps({
      sendNotification: async () => ({ success: false }),
      sendReceipt,
    }));

    expect(sendReceipt).not.toHaveBeenCalled();
  });

  it('stamps the record as undelivered so a failed send stays recoverable', async () => {
    const markDelivery = vi.fn(async () => {});

    await deliverContactSubmission(deps({
      sendNotification: async () => ({ success: false }),
      markDelivery,
    }));

    expect(markDelivery).toHaveBeenCalledWith('contact_1', false);
  });

  it('still succeeds when Convex is down but the notification lands', async () => {
    const outcome = await deliverContactSubmission(deps({
      record: async () => {
        throw new Error('convex unreachable');
      },
    }));

    expect(outcome).toMatchObject({
      ok: true,
      recorded: false,
      threadId: 'thread_fallback',
    });
  });

  it('skips the delivery stamp when there is no record to stamp', async () => {
    const markDelivery = vi.fn(async () => {});

    await deliverContactSubmission(deps({
      record: async () => ({ contactId: null, threadId: 'thread_partial' }),
      markDelivery,
    }));

    expect(markDelivery).not.toHaveBeenCalled();
  });

  it('succeeds even when the receipt bounces', async () => {
    const outcome = await deliverContactSubmission(deps({
      sendReceipt: async () => ({ success: false, error: 'invalid recipient' }),
    }));

    expect(outcome.ok).toBe(true);
    expect(outcome.receiptSent).toBe(false);
  });

  it('survives a receipt sender that throws', async () => {
    const outcome = await deliverContactSubmission(deps({
      sendReceipt: async () => {
        throw new Error('boom');
      },
    }));

    expect(outcome.ok).toBe(true);
    expect(outcome.receiptSent).toBe(false);
  });

  it('survives a delivery stamp that throws', async () => {
    const outcome = await deliverContactSubmission(deps({
      markDelivery: async () => {
        throw new Error('patch failed');
      },
    }));

    expect(outcome.ok).toBe(true);
  });

  it('treats a throwing notification sender as a failed delivery', async () => {
    const outcome = await deliverContactSubmission(deps({
      sendNotification: async () => {
        throw new Error('network');
      },
    }));

    expect(outcome.ok).toBe(false);
    expect(outcome.error).toBe(DELIVERY_FAILED_MESSAGE);
  });
});
