import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/astro/react';
import { faEye, faEyeSlash, faLaptop } from '@fortawesome/sharp-regular-svg-icons';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLastActive(lastActiveAt: any): string {
  if (!lastActiveAt) return 'Unknown';
  const date = new Date(lastActiveAt);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}


// ─── Password field ───────────────────────────────────────────────────────────

function PasswordInput({
  id,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="pr-8"
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 px-2.5 text-muted-foreground hover:text-foreground"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        <Icon icon={show ? faEyeSlash : faEye} className="size-3" />
      </button>
    </div>
  );
}


// ─── Component ────────────────────────────────────────────────────────────────

export function SecuritySection() {
  const { isLoaded } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signOutOtherSessions, setSignOutOtherSessions] = useState(true);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  // Sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    const clerk = (window as any).Clerk;
    if (!clerk) return;
    setCurrentSessionId(clerk.session?.id ?? null);
    clerk.user?.getSessions?.()
      .then((s: any[]) => {
        // Sort: current first, then by last active descending
        const sorted = [...s].sort((a, b) => {
          if (a.id === clerk.session?.id) return -1;
          if (b.id === clerk.session?.id) return 1;
          return (b.lastActiveAt ?? 0) - (a.lastActiveAt ?? 0);
        });
        setSessions(sorted);
        setSessionsLoaded(true);
      })
      .catch(() => setSessionsLoaded(true));
  }, [isLoaded]);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      setPasswordStatus('error');
      return;
    }
    setPasswordSaving(true);
    setPasswordStatus('idle');
    setPasswordError('');
    try {
      const clerk = (window as any).Clerk;
      await clerk.user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: signOutOtherSessions,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus('saved');
      setTimeout(() => setPasswordStatus('idle'), 3000);

      // If we signed out other sessions, refresh the session list
      if (signOutOtherSessions) {
        setSessions((prev) => prev.filter((s: any) => s.id === currentSessionId));
      }
    } catch (err: any) {
      setPasswordError(
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        'Failed to update password.',
      );
      setPasswordStatus('error');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleRevokeSession(sessionId: string) {
    setRevokingId(sessionId);
    try {
      const session = sessions.find((s: any) => s.id === sessionId);
      await session?.revoke();
      setSessions((prev) => prev.filter((s: any) => s.id !== sessionId));
    } catch {
      // non-fatal
    } finally {
      setRevokingId(null);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const clerk = (window as any).Clerk;
      await clerk.user.delete();
      window.location.href = '/';
    } catch (err: any) {
      setDeleteError(err.errors?.[0]?.message || 'Failed to delete account.');
      setDeleteLoading(false);
    }
  }

  const canChangePassword = currentPassword && newPassword && confirmPassword;

  return (
    <div className="max-w-lg space-y-10">

      {/* Password */}
      <section>
        <h2 className="font-glyph text-xl mb-1">Password</h2>
        <p className="text-xs text-muted-foreground mb-5">
          Update your account password.
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="sec-current-pw">
              Current password
            </label>
            <PasswordInput
              id="sec-current-pw"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              disabled={passwordSaving}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="sec-new-pw">
              New password
            </label>
            <PasswordInput
              id="sec-new-pw"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              disabled={passwordSaving}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="sec-confirm-pw">
              Confirm new password
            </label>
            <PasswordInput
              id="sec-confirm-pw"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              disabled={passwordSaving}
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={signOutOtherSessions}
              onChange={(e) => setSignOutOtherSessions(e.target.checked)}
              className="mt-0.5 size-3.5 accent-primary cursor-pointer"
              disabled={passwordSaving}
            />
            <div>
              <p className="text-xs text-foreground">Sign out of all other devices</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Recommended after changing your password.
              </p>
            </div>
          </label>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={passwordSaving || !canChangePassword}
            >
              {passwordSaving ? 'Updating…' : 'Update password'}
            </Button>
            {passwordStatus === 'saved' && (
              <p className="text-xs text-emerald-500">Password updated!</p>
            )}
            {passwordStatus === 'error' && (
              <p className="text-xs text-destructive">{passwordError}</p>
            )}
          </div>
        </form>
      </section>

      <Separator />

      {/* Active sessions */}
      <section>
        <h2 className="font-glyph text-xl mb-1">Active sessions</h2>
        <p className="text-xs text-muted-foreground mb-5">
          Devices currently signed in to your account.
        </p>

        <div className="space-y-0">
          {!sessionsLoaded && (
            <p className="text-xs text-muted-foreground">Loading…</p>
          )}
          {sessionsLoaded && sessions.length === 0 && (
            <p className="text-xs text-muted-foreground">No active sessions found.</p>
          )}
          {sessions.map((session: any) => {
            const isCurrent = session.id === currentSessionId;
            const activity = session.latestActivity;
            const deviceLabel = activity?.isMobile ? 'Mobile' : (activity?.browserName || 'Desktop');
            const location = [activity?.city, activity?.country].filter(Boolean).join(', ');
            return (
              <div
                key={session.id}
                className="flex items-start justify-between py-2.5 border-b border-border-light last:border-0"
              >
                <div className="flex items-start gap-2.5">
                  <Icon icon={faLaptop} className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium">{deviceLabel}</p>
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 font-medium">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {location && `${location} · `}{formatLastActive(session.lastActiveAt)}
                    </p>
                    {activity?.ipAddress && (
                      <p className="text-[10px] text-muted-foreground font-mono">{activity.ipAddress}</p>
                    )}
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={!!revokingId}
                    className="text-[10px] text-destructive hover:text-destructive/80 underline underline-offset-2 shrink-0 disabled:opacity-50"
                  >
                    {revokingId === session.id ? 'Revoking…' : 'Revoke'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* Danger zone */}
      <section>
        <h2 className="font-glyph text-xl mb-1 text-destructive">Danger zone</h2>
        <p className="text-xs text-muted-foreground mb-5">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            Delete account
          </Button>
        ) : (
          <div className="p-4 border border-destructive/30 space-y-3">
            <p className="text-xs font-medium text-destructive">Are you absolutely sure?</p>
            <p className="text-xs text-muted-foreground">
              Your account and all associated data will be permanently deleted.
            </p>
            {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting…' : 'Yes, delete my account'}
              </Button>
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
