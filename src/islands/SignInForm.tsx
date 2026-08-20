import { useEffect, useState } from 'react';
import { navigate } from 'astro:transitions/client';
import { useAuth } from '@clerk/astro/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';


// ─── Brand icons ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" aria-hidden="true">
      <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" aria-hidden="true">
      <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
      <rect x="12.5" y="1" width="10.5" height="10.5" fill="#00A4EF" />
      <rect x="1" y="12.5" width="10.5" height="10.5" fill="#7FBA00" />
      <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
    </svg>
  );
}


// ─── Corner decoration (matches the navbar pattern) ───────────────────────────

function CornerSquare({ className }: { className: string }) {
  return (
    <div
      className={cn(
        'absolute size-2.5 bg-background border border-border-light rounded-[1px] z-10',
        className,
      )}
    />
  );
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

async function completeSignIn(clerk: any, result: any, afterUrl: string) {
  await clerk.setActive({ session: result.createdSessionId });
  navigate(afterUrl);
}


// ─── Main component ────────────────────────────────────────────────────────────

type Step = 'form' | 'mfa';

export function SignInForm() {
  const { isLoaded } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [mfaStrategy, setMfaStrategy] = useState<string>('totp');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [signUpHref, setSignUpHref] = useState('/sign-up');

  useEffect(() => {
    const redirectUrl = new URLSearchParams(window.location.search).get('redirect_url');
    if (redirectUrl) setSignUpHref(`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`);
  }, []);

  function getAfterUrl() {
    return new URLSearchParams(window.location.search).get('redirect_url') || '/';
  }

  async function handleNeedsSecondFactor(clerk: any) {
    const factors: any[] = clerk.client.signIn.supportedSecondFactors ?? [];
    const emailFactor = factors.find((f) => f.strategy === 'email_code');
    const phoneFactor = factors.find((f) => f.strategy === 'phone_code');

    if (emailFactor) {
      await clerk.client.signIn.prepareSecondFactor({
        strategy: 'email_code',
        emailAddressId: emailFactor.emailAddressId,
      });
      setMfaStrategy('email_code');
    } else if (phoneFactor) {
      await clerk.client.signIn.prepareSecondFactor({ strategy: 'phone_code' });
      setMfaStrategy('phone_code');
    } else {
      setMfaStrategy('totp');
    }
    setStep('mfa');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');

    try {
      const clerk = (window as any).Clerk;
      const afterUrl = getAfterUrl();

      if (step === 'mfa') {
        const result = await clerk.client.signIn.attemptSecondFactor({
          strategy: mfaStrategy,
          code,
        });
        if (result.status === 'complete') {
          await completeSignIn(clerk, result, afterUrl);
        } else {
          setError('Invalid code. Please try again.');
        }
        return;
      }

      // Step: form — try combined identifier+password first
      const result = await clerk.client.signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await completeSignIn(clerk, result, afterUrl);
      } else if (result.status === 'needs_first_factor') {
        // Identifier-first flow: Clerk staged the sign-in, now attempt the password factor
        const attempt = await clerk.client.signIn.attemptFirstFactor({
          strategy: 'password',
          password,
        });
        if (attempt.status === 'complete') {
          await completeSignIn(clerk, attempt, afterUrl);
        } else if (attempt.status === 'needs_second_factor') {
          await handleNeedsSecondFactor(clerk);
        } else {
          setError('Sign in failed. Please try again.');
        }
      } else if (result.status === 'needs_second_factor') {
        await handleNeedsSecondFactor(clerk);
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (err: any) {
      setError(
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        'Sign in failed. Please check your credentials.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(strategy: string, provider: string) {
    if (!isLoaded) return;
    setOauthLoading(provider);
    setError('');
    try {
      const clerk = (window as any).Clerk;
      await clerk.client.signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: getAfterUrl(),
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'OAuth sign in failed.');
      setOauthLoading(null);
    }
  }

  const busy = !isLoaded || loading || !!oauthLoading;

  // ── MFA step ─────────────────────────────────────────────────────────────────
  if (step === 'mfa') {
    const label =
      mfaStrategy === 'email_code' ? 'Enter the code sent to your email' :
      mfaStrategy === 'phone_code' ? 'Enter the code sent to your phone' :
      'Enter the code from your authenticator app';

    return (
      <div className="relative w-full max-w-xs border border-border bg-background">
        <CornerSquare className="-translate-x-1/2 -translate-y-1/2 top-0 left-0" />
        <CornerSquare className="translate-x-1/2 -translate-y-1/2 top-0 right-0" />
        <CornerSquare className="-translate-x-1/2 translate-y-1/2 bottom-0 left-0" />
        <CornerSquare className="translate-x-1/2 translate-y-1/2 bottom-0 right-0" />

        <div className="border-b border-border px-5 py-4">
          <h1 className="font-glyph text-2xl tracking-tight">Two-step verification</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="signin-code">
              Verification code
            </label>
            <Input
              id="signin-code"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoComplete="one-time-code"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading} size="sm">
            {loading ? 'Verifying…' : 'Verify'}
          </Button>
        </form>

        <div className="border-t border-border px-5 py-3 text-center">
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-2 hover:underline cursor-pointer"
            onClick={() => { setStep('form'); setError(''); setCode(''); }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Sign-in form ──────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full max-w-xs border border-border bg-background">
      <CornerSquare className="-translate-x-1/2 -translate-y-1/2 top-0 left-0" />
      <CornerSquare className="translate-x-1/2 -translate-y-1/2 top-0 right-0" />
      <CornerSquare className="-translate-x-1/2 translate-y-1/2 bottom-0 left-0" />
      <CornerSquare className="translate-x-1/2 translate-y-1/2 bottom-0 right-0" />

      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h1 className="font-glyph text-2xl tracking-tight">Sign in</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Access your account</p>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
        {/* OAuth */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { strategy: 'oauth_google', provider: 'google', icon: <GoogleIcon />, label: 'Google' },
            { strategy: 'oauth_linkedin_oidc', provider: 'linkedin', icon: <LinkedInIcon />, label: 'LinkedIn' },
            { strategy: 'oauth_microsoft', provider: 'microsoft', icon: <MicrosoftIcon />, label: 'Microsoft' },
          ].map(({ strategy, provider, icon, label }) => (
            <button
              key={provider}
              type="button"
              disabled={busy}
              onClick={() => handleOAuth(strategy, provider)}
              className={cn(
                'flex items-center justify-center gap-1.5 h-7 px-2 border border-border',
                'text-xs text-foreground bg-background',
                'hover:bg-muted transition-colors',
                'disabled:opacity-50 disabled:pointer-events-none',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                oauthLoading === provider && 'opacity-60',
              )}
              aria-label={`Sign in with ${label}`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="signin-email">
            Email
          </label>
          <Input
            id="signin-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={busy}
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="signin-password">
            Password
          </label>
          <Input
            id="signin-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={busy}
          />
        </div>

        {/* Error */}
        {error && <p className="text-xs text-destructive">{error}</p>}

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={busy} size="sm">
          {loading ? 'Signing in…' : 'Continue'}
        </Button>
      </form>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          No account?{' '}
          <a href={signUpHref} className="text-foreground underline-offset-2 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
