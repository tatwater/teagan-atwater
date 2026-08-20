import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/astro/react';
import { faPlus } from '@fortawesome/sharp-regular-svg-icons';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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

const OAUTH_PROVIDERS = [
  { strategy: 'oauth_google', providerMatch: 'google', label: 'Google', Icon: GoogleIcon },
  { strategy: 'oauth_linkedin_oidc', providerMatch: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
  { strategy: 'oauth_microsoft', providerMatch: 'microsoft', label: 'Microsoft', Icon: MicrosoftIcon },
] as const;


// ─── Component ────────────────────────────────────────────────────────────────

export function AccountSection() {
  const { isLoaded } = useAuth();

  // Email state
  const [emails, setEmails] = useState<any[]>([]);
  const [primaryEmailId, setPrimaryEmailId] = useState<string | null>(null);
  const [addingEmail, setAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');

  // Connected accounts state
  const [externalAccounts, setExternalAccounts] = useState<any[]>([]);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    const clerk = (window as any).Clerk;
    if (!clerk?.user) return;
    setEmails(clerk.user.emailAddresses ?? []);
    setPrimaryEmailId(clerk.user.primaryEmailAddressId ?? null);
    setExternalAccounts(clerk.user.externalAccounts ?? []);
  }, [isLoaded]);

  function refreshUser() {
    const clerk = (window as any).Clerk;
    if (!clerk?.user) return;
    setEmails([...(clerk.user.emailAddresses ?? [])]);
    setPrimaryEmailId(clerk.user.primaryEmailAddressId ?? null);
    setExternalAccounts([...(clerk.user.externalAccounts ?? [])]);
  }

  // ── Email operations ──────────────────────────────────────────────────────

  async function handleAddEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setEmailLoading('add');
    setEmailError('');
    try {
      const clerk = (window as any).Clerk;
      const emailAddr = await clerk.user.createEmailAddress({ email: newEmail.trim() });
      await emailAddr.prepareVerification({ strategy: 'email_code' });
      setAddingEmail(false);
      setNewEmail('');
      setVerifyingId(emailAddr.id);
      refreshUser();
    } catch (err: any) {
      setEmailError(err.errors?.[0]?.message || 'Failed to add email');
    } finally {
      setEmailLoading(null);
    }
  }

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyingId || !verifyCode.trim()) return;
    setEmailLoading('verify');
    setEmailError('');
    try {
      const clerk = (window as any).Clerk;
      const emailAddr = clerk.user.emailAddresses.find((e: any) => e.id === verifyingId);
      await emailAddr.attemptVerification({ code: verifyCode.trim() });
      setVerifyingId(null);
      setVerifyCode('');
      refreshUser();
    } catch (err: any) {
      setEmailError(err.errors?.[0]?.message || 'Invalid code. Please try again.');
    } finally {
      setEmailLoading(null);
    }
  }

  async function handleMakePrimary(id: string) {
    setEmailLoading(`primary-${id}`);
    setEmailError('');
    try {
      const clerk = (window as any).Clerk;
      const emailAddr = clerk.user.emailAddresses.find((e: any) => e.id === id);
      await emailAddr.makeDefaultPrimary();
      refreshUser();
    } catch (err: any) {
      setEmailError(err.errors?.[0]?.message || 'Failed to set primary');
    } finally {
      setEmailLoading(null);
    }
  }

  async function handleRemoveEmail(id: string) {
    setEmailLoading(`remove-${id}`);
    setEmailError('');
    try {
      const clerk = (window as any).Clerk;
      const emailAddr = clerk.user.emailAddresses.find((e: any) => e.id === id);
      await emailAddr.destroy();
      refreshUser();
    } catch (err: any) {
      setEmailError(err.errors?.[0]?.message || 'Failed to remove email');
    } finally {
      setEmailLoading(null);
    }
  }

  // ── OAuth operations ──────────────────────────────────────────────────────

  async function handleConnect(strategy: string, providerMatch: string) {
    setConnectingProvider(providerMatch);
    setAccountError('');
    try {
      const clerk = (window as any).Clerk;
      const externalAccount = await clerk.user.createExternalAccount({
        strategy,
        redirectUrl: window.location.href,
      });
      const redirectUrl =
        externalAccount.verification?.externalVerificationRedirectURL ??
        externalAccount.verificationRedirectUrl;
      if (redirectUrl) window.location.href = redirectUrl;
    } catch (err: any) {
      setAccountError(err.errors?.[0]?.message || 'Failed to connect account');
      setConnectingProvider(null);
    }
  }

  async function handleDisconnect(id: string, providerMatch: string) {
    setConnectingProvider(providerMatch);
    setAccountError('');
    try {
      const clerk = (window as any).Clerk;
      const extAccount = clerk.user.externalAccounts.find((a: any) => a.id === id);
      await extAccount.destroy();
      refreshUser();
    } catch (err: any) {
      setAccountError(err.errors?.[0]?.message || 'Failed to disconnect');
    } finally {
      setConnectingProvider(null);
    }
  }

  return (
    <div className="max-w-lg space-y-10">

      {/* Email addresses */}
      <section>
        <h2 className="font-glyph text-xl mb-1">Email addresses</h2>
        <p className="text-xs text-muted-foreground mb-5">
          Manage email addresses associated with your account.
        </p>

        <div className="space-y-0">
          {emails.map((email: any) => {
            const isPrimary = email.id === primaryEmailId;
            const isVerified = email.verification?.status === 'verified';
            const isRemoveLoading = emailLoading === `remove-${email.id}`;
            const isPrimaryLoading = emailLoading === `primary-${email.id}`;
            return (
              <div
                key={email.id}
                className="flex items-center justify-between py-2.5 border-b border-border-light last:border-0"
              >
                <div>
                  <p className="text-xs font-medium">{email.emailAddress}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isPrimary && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 font-medium">
                        Primary
                      </span>
                    )}
                    {!isVerified && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 font-medium">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!isPrimary && isVerified && (
                    <button
                      type="button"
                      onClick={() => handleMakePrimary(email.id)}
                      disabled={!!emailLoading}
                      className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 disabled:opacity-50"
                    >
                      {isPrimaryLoading ? 'Saving…' : 'Make primary'}
                    </button>
                  )}
                  {!isVerified && verifyingId !== email.id && (
                    <button
                      type="button"
                      onClick={() => setVerifyingId(email.id)}
                      className="text-[10px] text-amber-600 hover:text-amber-700 underline underline-offset-2"
                    >
                      Verify
                    </button>
                  )}
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email.id)}
                      disabled={!!emailLoading}
                      className="text-[10px] text-destructive hover:text-destructive/80 underline underline-offset-2 disabled:opacity-50"
                    >
                      {isRemoveLoading ? 'Removing…' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Verify email inline form */}
        {verifyingId && (
          <form onSubmit={handleVerifyEmail} className="mt-4 p-3 border border-border space-y-3">
            <p className="text-xs text-muted-foreground">
              A verification code was sent to your email. Enter it below.
            </p>
            <Input
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="6-digit code"
              inputMode="numeric"
              autoFocus
              disabled={emailLoading === 'verify'}
            />
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="xs"
                disabled={emailLoading === 'verify' || !verifyCode.trim()}
              >
                {emailLoading === 'verify' ? 'Verifying…' : 'Verify'}
              </Button>
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => { setVerifyingId(null); setVerifyCode(''); setEmailError(''); }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Add email form */}
        {addingEmail ? (
          <form onSubmit={handleAddEmail} className="mt-4 space-y-3">
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              autoFocus
              disabled={emailLoading === 'add'}
            />
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="xs"
                disabled={emailLoading === 'add' || !newEmail.trim()}
              >
                {emailLoading === 'add' ? 'Adding…' : 'Add email'}
              </Button>
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => { setAddingEmail(false); setNewEmail(''); setEmailError(''); }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAddingEmail(true)}
            className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon icon={faPlus} className="size-3" />
            Add email address
          </button>
        )}

        {emailError && <p className="mt-2 text-xs text-destructive">{emailError}</p>}
      </section>

      <Separator />

      {/* Connected accounts */}
      <section>
        <h2 className="font-glyph text-xl mb-1">Connected accounts</h2>
        <p className="text-xs text-muted-foreground mb-5">
          Connect external accounts for faster sign-in.
        </p>

        <div className="space-y-0">
          {OAUTH_PROVIDERS.map(({ strategy, providerMatch, label, Icon: ProviderIcon }) => {
            const connected = externalAccounts.find((a: any) =>
              (a.provider ?? '').toLowerCase().includes(providerMatch)
            );
            const isBusy = connectingProvider === providerMatch;
            return (
              <div
                key={providerMatch}
                className="flex items-center justify-between py-2.5 border-b border-border-light last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <ProviderIcon />
                  <div>
                    <p className="text-xs font-medium">{label}</p>
                    {connected?.emailAddress && (
                      <p className="text-[10px] text-muted-foreground">{connected.emailAddress}</p>
                    )}
                  </div>
                </div>
                {connected ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(connected.id, providerMatch)}
                    disabled={!!connectingProvider}
                    className="text-[10px] text-destructive hover:text-destructive/80 underline underline-offset-2 disabled:opacity-50"
                  >
                    {isBusy ? 'Disconnecting…' : 'Disconnect'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnect(strategy, providerMatch)}
                    disabled={!!connectingProvider}
                    className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 disabled:opacity-50"
                  >
                    {isBusy ? 'Connecting…' : 'Connect'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {accountError && <p className="mt-2 text-xs text-destructive">{accountError}</p>}
      </section>
    </div>
  );
}
