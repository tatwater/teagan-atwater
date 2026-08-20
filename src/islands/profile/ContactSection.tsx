import { useState, useRef } from 'react';
import { useAuth } from '@clerk/astro/react';
import { faCamera } from '@fortawesome/sharp-regular-svg-icons';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ContactSectionProps {
  clerkEmail: string;
  clerkImageUrl?: string;
  savedFirstName?: string;
  savedLastName?: string;
  savedPhone?: string;
  savedOrganization?: string;
}

export function ContactSection({
  clerkEmail,
  clerkImageUrl,
  savedFirstName,
  savedLastName,
  savedPhone,
  savedOrganization,
}: ContactSectionProps) {
  const { isLoaded } = useAuth();
  const [firstName, setFirstName] = useState(savedFirstName ?? '');
  const [lastName, setLastName] = useState(savedLastName ?? '');
  const [phone, setPhone] = useState(savedPhone ?? '');
  const [organization, setOrganization] = useState(savedOrganization ?? '');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(clerkImageUrl ?? '');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setPhotoError('');
    try {
      const clerk = (window as any).Clerk;
      await clerk.user.setProfileImage({ file });
      setPhotoUrl(URL.createObjectURL(file));
    } catch (err: any) {
      setPhotoError(err.errors?.[0]?.message || 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('idle');
    setSaveError('');
    try {
      const res = await fetch('/api/profile/setup', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined,
          organization: organization.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      const clerk = (window as any).Clerk;
      if (clerk?.user && (firstName.trim() !== savedFirstName || lastName.trim() !== savedLastName)) {
        try {
          await clerk.user.update({
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined,
          });
        } catch {
          // non-fatal
        }
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={photoUploading}
          className="relative size-14 rounded-full overflow-hidden bg-muted border border-border shrink-0 group/avatar cursor-pointer disabled:cursor-wait"
          aria-label="Change profile photo"
        >
          {photoUrl ? (
            <img src={photoUrl} alt={firstName || 'You'} className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center text-lg font-medium text-muted-foreground">
              {(firstName || clerkEmail).charAt(0).toUpperCase()}
            </div>
          )}
          <div className={cn(
            'absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity',
            photoUploading ? 'opacity-100' : 'opacity-0 group-hover/avatar:opacity-100',
          )}>
            {photoUploading
              ? <div className="size-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              : <Icon icon={faCamera} className="size-4 text-white" />
            }
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        <div>
          <p className="text-xs text-muted-foreground">Profile photo</p>
          <p className="text-xs text-foreground mt-0.5">Click to upload</p>
          {photoError && <p className="text-[10px] text-destructive mt-0.5">{photoError}</p>}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="ct-first-name">
              Given name <span className="text-destructive">*</span>
            </label>
            <Input
              id="ct-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Given name"
              disabled={saving}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="ct-last-name">
              Family name
            </label>
            <Input
              id="ct-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Family name"
              disabled={saving}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="ct-email">
            Email
          </label>
          <Input id="ct-email" value={clerkEmail} disabled className="opacity-60" />
          <p className="text-[10px] text-muted-foreground">
            Manage email addresses in{' '}
            <a href="/profile/account" className="underline underline-offset-2">Account settings</a>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="ct-org">
              Organization
            </label>
            <Input
              id="ct-org"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Company or project"
              disabled={saving}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="ct-phone">
              Phone
            </label>
            <Input
              id="ct-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={saving || !firstName.trim()}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          {saveStatus === 'saved' && <p className="text-xs text-emerald-500">Saved!</p>}
          {saveStatus === 'error' && <p className="text-xs text-destructive">{saveError}</p>}
        </div>
      </form>
    </div>
  );
}
