import { useState, useRef } from 'react';
import { useAuth } from '@clerk/astro/react';
import { faEnvelope, faPhone, faBuilding, faBell, faCamera } from '@fortawesome/sharp-regular-svg-icons';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CONTACT_GROUPS, subjectUrl } from '@/data/contact';

interface NotificationSub {
  subject: string;
  group?: string;
  isActive: boolean;
}

interface ProfileSettingsProps {
  clerkEmail: string;
  clerkImageUrl?: string;
  savedFirstName?: string;
  savedLastName?: string;
  savedPhone?: string;
  savedOrganization?: string;
  notifications: NotificationSub[];
}

export function ProfileSettings({
  clerkEmail,
  clerkImageUrl,
  savedFirstName,
  savedLastName,
  savedPhone,
  savedOrganization,
  notifications,
}: ProfileSettingsProps) {
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

  const [notifMap, setNotifMap] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    for (const n of notifications) {
      const key = n.group ? `${n.group}/${n.subject}` : n.subject;
      m[key] = n.isActive;
    }
    return m;
  });
  const [togglingNotif, setTogglingNotif] = useState<string | null>(null);

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

      // Sync name to Clerk if changed
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

  async function handleToggleNotif(group: string | undefined, subject: string) {
    const key = group ? `${group}/${subject}` : subject;
    if (togglingNotif === key) return;
    setTogglingNotif(key);
    try {
      const res = await fetch('/api/notifications/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group, subject }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotifMap((prev) => ({ ...prev, [key]: data.isActive }));
      }
    } finally {
      setTogglingNotif(null);
    }
  }

  // Collect all subjects that have availability (non-alwaysAvailable)
  const notifiableSubjects = CONTACT_GROUPS.flatMap((g) =>
    g.subjects
      .filter((s) => !s.alwaysAvailable)
      .map((s) => ({ group: g.slug ?? undefined, subject: s.slug, label: s.label, groupLabel: g.label }))
  );

  return (
    <div className="max-w-lg space-y-10">
      {/* Contact info section */}
      <section>
        <h2 className="font-glyph text-xl mb-1">Contact info</h2>
        <p className="text-xs text-muted-foreground mb-5">
          This appears in your contact card when reaching out.
        </p>

        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6">
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
              <label className="text-xs text-muted-foreground" htmlFor="pf-first-name">
                Given name <span className="text-destructive">*</span>
              </label>
              <Input
                id="pf-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Given name"
                disabled={saving}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="pf-last-name">
                Family name
              </label>
              <Input
                id="pf-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Family name"
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="pf-email">
              Email
            </label>
            <Input id="pf-email" value={clerkEmail} disabled className="opacity-60" />
            <p className="text-[10px] text-muted-foreground">
              Email is managed through your account settings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="pf-org">
                Organization
              </label>
              <Input
                id="pf-org"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Company or project"
                disabled={saving}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="pf-phone">
                Phone
              </label>
              <Input
                id="pf-phone"
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
            {saveStatus === 'saved' && (
              <p className="text-xs text-emerald-500">Saved!</p>
            )}
            {saveStatus === 'error' && (
              <p className="text-xs text-destructive">{saveError}</p>
            )}
          </div>
        </form>
      </section>

      <Separator />

      {/* Notification preferences */}
      <section>
        <h2 className="font-glyph text-xl mb-1">Notifications</h2>
        <p className="text-xs text-muted-foreground mb-5">
          Get notified when availability opens up for subjects you care about.
        </p>

        <div className="space-y-2">
          {notifiableSubjects.map(({ group, subject, label, groupLabel }) => {
            const key = group ? `${group}/${subject}` : subject;
            const isActive = notifMap[key] ?? false;
            const url = subjectUrl(group ?? null, subject);
            return (
              <div
                key={key}
                className="flex items-center justify-between py-2.5 border-b border-border-light last:border-0"
              >
                <div>
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{groupLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={url} className="text-[10px] text-muted-foreground underline underline-offset-2">
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => handleToggleNotif(group, subject)}
                    disabled={togglingNotif === key}
                    className={cn(
                      'flex items-center gap-1.5 text-xs px-2.5 py-1 border transition-colors',
                      isActive
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon icon={faBell} className="size-3" />
                    {isActive ? 'Subscribed' : 'Get notified'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
