import { useState } from 'react';
import { navigate } from 'astro:transitions/client';
import { useAuth } from '@clerk/astro/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProfileSetupProps {
  redirectTo?: string;
  // Pre-filled from Clerk for social sign-ups
  clerkFirstName?: string;
  clerkLastName?: string;
  clerkImageUrl?: string;
}

export function ProfileSetup({
  redirectTo = '/contact/hire',
  clerkFirstName,
  clerkLastName,
  clerkImageUrl,
}: ProfileSetupProps) {
  const { isLoaded } = useAuth();
  const [firstName, setFirstName] = useState(clerkFirstName ?? '');
  const [lastName, setLastName] = useState(clerkLastName ?? '');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined,
          organization: organization.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');

      // Keep Clerk's name fields in sync
      const clerk = (window as any).Clerk;
      if (clerk?.user) {
        try {
          await clerk.user.update({
            firstName: firstName.trim(),
            lastName: lastName.trim() || undefined,
          });
        } catch {
          // non-fatal — name saved in Convex
        }
      }

      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  const hasSocialName = !!(clerkFirstName || clerkLastName);

  return (
    <div className="relative w-full max-w-sm border border-border bg-background">
      <div className="absolute size-2.5 bg-background border border-border-light rounded-[1px] z-10 -translate-x-1/2 -translate-y-1/2 top-0 left-0" />
      <div className="absolute size-2.5 bg-background border border-border-light rounded-[1px] z-10 translate-x-1/2 -translate-y-1/2 top-0 right-0" />
      <div className="absolute size-2.5 bg-background border border-border-light rounded-[1px] z-10 -translate-x-1/2 translate-y-1/2 bottom-0 left-0" />
      <div className="absolute size-2.5 bg-background border border-border-light rounded-[1px] z-10 translate-x-1/2 translate-y-1/2 bottom-0 right-0" />

      <div className="border-b border-border px-5 py-4">
        <h1 className="font-glyph text-2xl tracking-tight">Complete your profile</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {hasSocialName
            ? "We got your name from your social account. Add anything else you'd like to share."
            : 'This info will appear in your contact card when reaching out.'}
        </p>
      </div>

      {clerkImageUrl && (
        <div className="px-5 pt-4 flex items-center gap-3">
          <img
            src={clerkImageUrl}
            alt={[clerkFirstName, clerkLastName].filter(Boolean).join(' ')}
            className="size-10 rounded-full object-cover border border-border"
          />
          <p className="text-xs text-muted-foreground">Profile photo from your social account</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="setup-first-name">
              First name <span className="text-destructive">*</span>
            </label>
            <Input
              id="setup-first-name"
              type="text"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
              autoFocus={!hasSocialName}
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="setup-last-name">
              Last name
            </label>
            <Input
              id="setup-last-name"
              type="text"
              placeholder="Smith"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="setup-org">
            Organization
            <span className="text-muted-foreground/60 ml-1">(optional)</span>
          </label>
          <Input
            id="setup-org"
            type="text"
            placeholder="Company or project"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="setup-phone">
            Phone
            <span className="text-muted-foreground/60 ml-1">(optional)</span>
          </label>
          <Input
            id="setup-phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading || !firstName.trim()} size="sm">
          {loading ? 'Saving…' : 'Continue'}
        </Button>
      </form>
    </div>
  );
}
