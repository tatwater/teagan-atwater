/**
 * Cloudflare Turnstile verification.
 *
 * Verification is skipped entirely when TURNSTILE_SECRET_KEY is unset, so the
 * site works in local development and before the keys are provisioned. Once the
 * secret is present in the environment, a valid token becomes mandatory.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';


export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string | null,
): Promise<{ success: boolean; error?: string }> {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
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
