/**
 * Cloudflare Turnstile verification.
 *
 * Verification is skipped when TURNSTILE_SECRET_KEY is unset *in development*,
 * so the form works locally and before the keys are provisioned. In production a
 * missing secret fails the submission instead: the contact route emails a
 * receipt to an unverified, user-supplied address, so an unprotected form is a
 * spam relay that would burn the sending domain's reputation.
 *
 * The secret is read via `astro:env/server` rather than `import.meta.env` so it
 * resolves at runtime — inlining it at build time is what let a runtime-only
 * variable silently disable this check.
 */

import { TURNSTILE_SECRET_KEY } from 'astro:env/server';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';


export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string | null,
): Promise<{ success: boolean; error?: string }> {
  const secret = TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (import.meta.env.PROD) {
      console.error(
        'TURNSTILE_SECRET_KEY is not set. Refusing the submission rather than '
        + 'accepting unverified traffic. Set the key in the deployment environment.',
      );

      return { success: false, error: 'The contact form is temporarily unavailable.' };
    }

    console.warn('TURNSTILE_SECRET_KEY is not set — skipping captcha verification in development.');

    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Captcha verification is required.' };
  }

  try {
    const body = new URLSearchParams({ secret, response: token });

    if (remoteIp) {
      body.set('remoteip', remoteIp);
    }

    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const result = await response.json() as {
      success: boolean;
      'error-codes'?: string[];
    };

    if (!result.success) {
      console.warn('Turnstile rejected a submission:', result['error-codes']);
      return { success: false, error: 'Captcha verification failed. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'Could not verify captcha. Please try again.' };
  }
}
