/**
 * Validation for the public contact form, kept apart from the API route so the
 * rules can be exercised directly without standing up a request.
 */

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken?: string;
}

export type ParsedSubmission =
  | { ok: true; data: ContactSubmission }
  | { ok: false; error: string };


const LIMITS = {
  email: 320,
  message: 5000,
  name: 200,
  subject: 200,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_SUBJECT = 'Website enquiry';


export function parseContactSubmission(body: unknown): ParsedSubmission {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body.' };
  }

  const raw = body as Record<string, unknown>;
  const name = String(raw.name ?? '').trim();
  const email = String(raw.email ?? '').trim();
  const subject = String(raw.subject ?? '').trim() || DEFAULT_SUBJECT;
  const message = String(raw.message ?? '').trim();

  if (!name) return { ok: false, error: 'Please enter your name.' };
  if (!email) return { ok: false, error: 'Please enter your email address.' };
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: 'Please enter a valid email address.' };
  if (!message) return { ok: false, error: 'Please enter a message.' };

  const tooLong =
    name.length > LIMITS.name
    || email.length > LIMITS.email
    || subject.length > LIMITS.subject
    || message.length > LIMITS.message;

  if (tooLong) {
    return { ok: false, error: 'One or more fields exceed the maximum length.' };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      subject,
      message,
      turnstileToken: typeof raw.turnstileToken === 'string' ? raw.turnstileToken : undefined,
    },
  };
}
