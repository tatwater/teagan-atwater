import { useState, useCallback, useEffect, useRef } from 'react';
import { faEnvelope, faPhone, faBuilding, faBell, faBellSlash, faPaperPlaneTop, faGear, faCaretRight } from '@fortawesome/sharp-regular-svg-icons';
import { faBell as faBellSolid } from '@fortawesome/sharp-solid-svg-icons';
import googleLogoUrl from '@/assets/logos/google.svg?url';
import microsoftLogoUrl from '@/assets/logos/microsoft.svg?url';
import { useAuth } from '@clerk/astro/react';
import { Icon } from '@/components/icon';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ContactSubject, FormField } from '@/data/contact';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  organization?: string;
  profileComplete?: boolean;
}

interface ContactMainProps {
  subjectData: ContactSubject;
  groupLabel: string;
  group: string | null;
  isAuthenticated: boolean;
  userId?: string;
  userEmail?: string;
  userProfile: UserProfile | null;
  isAvailable: boolean;
  isNotificationSubscribed: boolean;
}

// ─── Contact card ─────────────────────────────────────────────────────────────

type OAuthProvider = 'google' | 'microsoft' | 'linkedin' | 'github' | 'apple';

const PROVIDER_LOGO: Partial<Record<OAuthProvider, string>> = {
  google: googleLogoUrl,
  microsoft: microsoftLogoUrl,
};

function ContactCard({
  name,
  email,
  phone,
  organization,
  imageUrl,
  oauthProvider,
  userId,
}: {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  imageUrl?: string;
  oauthProvider?: OAuthProvider;
  userId?: string;
}) {
  const idSuffix = userId ? ('#' + userId.replace(/^user_/, '').slice(-4)) : null;
  const logoUrl = oauthProvider ? PROVIDER_LOGO[oauthProvider] : undefined;

  return (
    <div className="relative w-full max-w-76 aspect-19/11 rounded-2xl overflow-hidden" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.82), inset 0 -1px 0 rgba(0,0,0,0.04), 0 1px 2px hsl(220deg 35% 50% / 0.07), 0 4px 8px hsl(220deg 35% 50% / 0.08), 0 10px 20px hsl(220deg 35% 50% / 0.09), 0 22px 40px hsl(220deg 35% 50% / 0.07)' }}>
      {/* Light mode base gradient — more contrast for physical depth */}
      <div
        className="absolute inset-0 dark:opacity-0"
        style={{ background: 'linear-gradient(145deg, oklch(0.975 0.004 253) 0%, oklch(0.855 0.058 253) 100%)' }}
      />
      {/* Dark mode base — same structure as light mode, lightness scaled way down */}
      <div
        className="absolute inset-0 opacity-0 dark:opacity-100"
        style={{ background: 'linear-gradient(145deg, oklch(0.24 0.004 253) 0%, oklch(0.13 0.025 253) 100%)' }}
      />
      {/* Right strip: ID + line + provider logo */}
      {(idSuffix || logoUrl) && (
        <div className="absolute right-0 inset-y-0 w-10 flex flex-col items-center py-4 pointer-events-none select-none">
          {idSuffix && (
            <div className="flex flex-col items-center mb-2 font-mono text-[10px] uppercase leading-[1.2] text-black/16 dark:text-white/16">
              {idSuffix.split('').map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
          <div className="w-px flex-1 mb-1 bg-black/8 dark:bg-white/8" />
          {logoUrl && (
            <img src={logoUrl} alt="" aria-hidden className="size-7 opacity-[0.15] mt-1 grayscale" />
          )}
        </div>
      )}
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full py-6 px-5">
        {/* Top: avatar + name/org + gear */}
        <div className="flex items-center gap-3">
          <Avatar
            alt={name}
            fallback={name.charAt(0).toUpperCase()}
            shape="circle"
            size="xl"
            src={imageUrl}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight truncate">
              {name}
            </p>
            <p className="text-xs text-black/40 dark:text-white/40 truncate mt-0.5">
              {organization ?? "No org provided"}
            </p>
          </div>
        </div>
        {/* Bottom: contact info */}
        <div className="flex flex-col gap-1 text-xs text-black/45 dark:text-white/45 min-w-0">
          <div className="flex items-center gap-1.5">
            <Icon icon={faEnvelope} className="shrink-0 size-3 opacity-50" />
            <span className="truncate">{email}</span>
          </div>
          {phone && (
            <div className="flex items-center gap-1.5">
              <Icon icon={faPhone} className="shrink-0 size-3 opacity-50" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      </div>
      {/* Gloss strip — above content so soft-light blends over avatar/text too */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 pointer-events-none dark:opacity-[0.18] [mix-blend-mode:soft-light]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0) 100%)' }}
      />
      {/* Specular highlight — above content, soft-light creates sheen over avatar/name */}
      <div
        className="absolute inset-0 pointer-events-none dark:opacity-[0.12] [mix-blend-mode:soft-light]"
        style={{ background: 'radial-gradient(ellipse 75% 55% at 18% -5%, rgba(255,255,255,0.88) 0%, transparent 52%)' }}
      />
      {/* Inset border overlay — renders above gradients, inside rounded corners */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.1] pointer-events-none z-20" />
    </div>
  );
}

// ─── Dynamic form fields ──────────────────────────────────────────────────────

function DynamicField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  if (field.type === 'select') {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full" disabled={disabled}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}…`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={5}
          className={cn(
            'w-full resize-y border border-input bg-transparent px-2.5 py-2 text-xs',
            'placeholder:text-muted-foreground outline-none transition-colors',
            'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
      </div>
    );
  }

  // input
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
      />
    </div>
  );
}

// ─── Ghost form overlays ──────────────────────────────────────────────────────

interface GhostUserData {
  givenName?: string;
  familyName?: string;
  email?: string;
  phone?: string;
  organization?: string;
}

const GHOST_FIELD_DEFS: { label: string; cols: number; key: keyof GhostUserData }[] = [
  { label: 'Given name', cols: 1, key: 'givenName' },
  { label: 'Family name', cols: 1, key: 'familyName' },
  { label: 'Email address', cols: 1, key: 'email' },
  { label: 'Phone number', cols: 1, key: 'phone' },
  { label: 'Organization', cols: 2, key: 'organization' },
];

function GhostContactFields({ userData }: { userData?: GhostUserData }) {
  return (
    <div className="grid grid-cols-2 gap-4 pointer-events-none select-none opacity-25">
      {GHOST_FIELD_DEFS.map(({ label, cols, key }) => (
        <div
          key={label}
          className={cn('flex flex-col gap-1', cols === 2 && 'col-span-2')}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <div className="h-8 border border-input flex items-center px-2.5">
            {userData?.[key] && (
              <span className="text-xs truncate">{userData[key]}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AuthOverlay({ children, userData }: { children: React.ReactNode; userData?: GhostUserData }) {
  return (
    <div className="relative">
      <GhostContactFields userData={userData} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-card border border-border shadow-lg p-5 flex flex-col gap-3 w-full max-w-xs">
          {children}
        </div>
      </div>
    </div>
  );
}

function CompleteProfileOverlay({ userData }: { userData?: GhostUserData }) {
  return (
    <AuthOverlay userData={userData}>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          Complete your profile
        </p>
        <p className="text-xs text-muted-foreground">
          You need a complete profile before reaching out.
        </p>
      </div>
      <Button
        nativeButton={false}
        render={(
          <a href="/profile/setup" />
        )}
        size="sm"
      >
        Set up profile
      </Button>
    </AuthOverlay>
  );
}

function SignInOverlay() {
  const redirectUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';

  return (
    <AuthOverlay>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          Sign in to reach out
        </p>
        <p className="text-xs text-muted-foreground">
          You'll need an account to send me a message.
        </p>
      </div>
      <Button
        className="w-full"
        nativeButton={false}
        render={(
          <a href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`} />
        )}
        size="sm"
      >
        Sign In
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        New here?
        {' '}
        <a
          className="underline underline-offset-2 text-foreground"
          href={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
        >
          Create an account
        </a>
      </p>
    </AuthOverlay>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ContactMain({
  subjectData,
  groupLabel,
  group,
  isAuthenticated: initialAuth,
  userId,
  userEmail,
  userProfile,
  isAvailable,
  isNotificationSubscribed: initialSubscribed,
}: ContactMainProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  const [clerkImageUrl, setClerkImageUrl] = useState<string | undefined>(undefined);
  const [oauthProvider, setOauthProvider] = useState<OAuthProvider | undefined>(undefined);
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const clerk = (window as any).Clerk;
      if (clerk?.user) {
        setClerkImageUrl(clerk.user.imageUrl ?? undefined);
        const firstAccount = clerk.user.externalAccounts?.[0];
        if (firstAccount?.provider) {
          const raw = (firstAccount.provider as string).replace('oauth_', '') as OAuthProvider;
          setOauthProvider(raw);
        }
      }
    }
  }, [isLoaded, isSignedIn]);

  // Don't trust SSR auth state — Clerk may return isLoaded:true server-side
  // with a stale/missing session. Wait until the client has both mounted and
  // Clerk has initialized before revealing the auth-dependent CTA.
  const isAuthSettled = hasMounted && isLoaded;
  const isAuthenticated = isAuthSettled ? !!isSignedIn : initialAuth;

  const profileComplete = !!userProfile?.profileComplete;
  const derivedName = userProfile
    ? [userProfile.firstName, userProfile.lastName].filter(Boolean).join(' ') || userProfile.displayName
    : undefined;
  const displayName = derivedName || userEmail || 'You';

  const ghostUserData: GhostUserData | undefined = isAuthenticated ? {
    givenName: userProfile?.firstName,
    familyName: userProfile?.lastName,
    email: userEmail,
    phone: userProfile?.phone,
    organization: userProfile?.organization,
  } : undefined;
  const effectivelyAvailable = subjectData.alwaysAvailable || isAvailable;

  const ctaAreaRef = useRef<HTMLDivElement>(null);
  const formAreaRef = useRef<HTMLDivElement>(null);
  const hasAutoFocused = useRef(false);

  useEffect(() => {
    if (!isAuthSettled || hasAutoFocused.current) return;
    hasAutoFocused.current = true;

    if (!isAuthenticated || !profileComplete) {
      const btn = ctaAreaRef.current?.querySelector<HTMLElement>('button:not([disabled]), a[href]');
      btn?.focus();
    } else if (effectivelyAvailable) {
      const field = formAreaRef.current?.querySelector<HTMLElement>(
        'input:not([disabled]), textarea:not([disabled]), button[role="combobox"]:not([disabled])',
      );
      field?.focus();
    }
  }, [isAuthSettled, isAuthenticated, profileComplete, effectivelyAvailable]);

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [isTogglingNotif, setIsTogglingNotif] = useState(false);

  const setField = useCallback((name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const isFormValid = subjectData.formFields.every((f) =>
    !f.required || !!formValues[f.name]?.trim()
  );

  async function handleSubmit() {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitError('');

    try {
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectSlug: subjectData.slug,
          group: group ?? undefined,
          formValues,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setSubmitStatus('success');
      setFormValues({});
    } catch (err) {
      setSubmitStatus('error');
      setSubmitError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleNotification() {
    if (isTogglingNotif) return;
    setIsTogglingNotif(true);
    try {
      const res = await fetch('/api/notifications/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: group ?? undefined, subject: subjectData.slug }),
      });
      const data = await res.json();
      if (res.ok) setIsSubscribed(data.isActive);
    } finally {
      setIsTogglingNotif(false);
    }
  }

  // ── Availability headline ────────────────────────────────────────────────────

  const availabilityColor = effectivelyAvailable ? 'text-emerald-500' : 'text-destructive';
  const defaultLabel = { available: 'currently available', unavailable: 'not currently available' };
  const availabilityLabel = subjectData.availabilityLabel ?? defaultLabel;
  const availabilityText = effectivelyAvailable ? availabilityLabel.available : availabilityLabel.unavailable;
  const availabilityPronoun = subjectData.availabilityPronoun ?? "I'm";

  return (
    <div className="p-10">
      {/* Headline */}
      {subjectData.alwaysAvailable ? (
        <h1 className="font-glyph text-4xl leading-tight mb-4">
          {subjectData.content.headline}
          <br />
          {subjectData.content.description}
        </h1>
      ) : (
        <h1 className="font-glyph text-4xl leading-tight mb-4">
          {availabilityPronoun}{' '}
          <span className={availabilityColor}>{availabilityText}</span>
          <br />
          {subjectData.content.headline}.
        </h1>
      )}

      {subjectData.content.description && !subjectData.alwaysAvailable && (
        <p className="text-sm text-muted-foreground mb-6 max-w-xl">
          {subjectData.content.description}
        </p>
      )}

      {subjectData.content.bullets && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mb-8">
          {subjectData.content.bullets.map((b) => (
            <div key={b} className="flex items-center gap-2 text-xs font-mono">
              <Icon icon={faCaretRight} className="size-3 text-primary shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      )}

      <Separator className="mb-8" />

      {/* Bottom area: card + form */}
      {submitStatus === 'success' ? (
        <div className="border border-border bg-card p-6 text-center space-y-2">
          <p className="text-sm font-medium">Message sent!</p>
          <p className="text-xs text-muted-foreground">
            I'll get back to you at {userEmail}.
          </p>
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => setSubmitStatus('idle')}
          >
            Send another
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* User card or CTA */}
          <div ref={ctaAreaRef} className={cn('flex flex-col gap-3', !isAuthSettled && 'invisible')}>
            {!isAuthenticated ? (
              <SignInOverlay />
            ) : !profileComplete ? (
              <CompleteProfileOverlay userData={ghostUserData} />
            ) : (
              <div className="flex gap-6 items-center">
                <ContactCard
                  name={displayName}
                  email={userEmail ?? ''}
                  phone={userProfile?.phone}
                  organization={userProfile?.organization}
                  imageUrl={clerkImageUrl}
                  oauthProvider={oauthProvider}
                  userId={userId}
                />
                <div className="flex flex-col gap-1 pt-1">
                  <span className="font-medium">You&apos;re signed in!</span>
                  {effectivelyAvailable
                    ? (
                        <p className="text-sm text-muted-foreground max-w-76 text-pretty">
                          Please review your contact information <span className="inline-block">before reaching out.</span>
                        </p>
                      )
                    : (
                        <>
                          <p className="text-sm text-muted-foreground max-w-76 text-pretty">
                            {`${availabilityPronoun} not currently taking ${subjectData.label.toLowerCase()} inquiries, but ${isSubscribed ? "you will get notified" : 'you can get notified'} when that changes.`}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              className="gap-1.5"
                              disabled={isTogglingNotif}
                              onClick={handleToggleNotification}
                              variant={isSubscribed ? 'outline' : 'default'}
                            >
                              <Icon icon={isSubscribed ? faBellSlash : faBell} className="size-3" />
                              {isSubscribed ? "No longer interested" : 'Get notified'}
                            </Button>
                          </div>
                        </>
                      )
                  }
                  <a
                    href="/profile"
                    className="flex items-center gap-1 mt-3 text-xs text-muted-foreground hover:text-primary transition-colors w-fit cursor-pointer"
                  >
                    <Icon icon={faGear} className="size-3" />
                    Update your info
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Form fields */}
          {effectivelyAvailable && (
            <div ref={formAreaRef} className="flex flex-col gap-4">
              {subjectData.formFields
                .filter((f) => f.name !== 'message')
                .reduce<FormField[][]>((rows, field, i) => {
                  if (i % 2 === 0) rows.push([field]);
                  else rows[rows.length - 1].push(field);
                  return rows;
                }, [])
                .map((row, ri) => (
                  <div
                    key={ri}
                    className={cn('grid gap-4', row.length === 2 ? 'grid-cols-2' : 'grid-cols-1')}
                  >
                    {row.map((field) => (
                      <DynamicField
                        key={field.name}
                        field={field}
                        value={formValues[field.name] ?? ''}
                        onChange={(v) => setField(field.name, v)}
                        disabled={!isAuthSettled || !isAuthenticated || !profileComplete || isSubmitting}
                      />
                    ))}
                  </div>
                ))}

              {subjectData.formFields
                .filter((f) => f.name === 'message')
                .map((field) => (
                  <DynamicField
                    key={field.name}
                    field={field}
                    value={formValues[field.name] ?? ''}
                    onChange={(v) => setField(field.name, v)}
                    disabled={!isAuthSettled || !isAuthenticated || !profileComplete || isSubmitting}
                  />
                ))}
            </div>
          )}

          {/* Submit row */}
          {effectivelyAvailable && (
            <div className="flex items-center justify-between">
              <div>
                {submitStatus === 'error' && (
                  <p className="text-xs text-destructive">{submitError}</p>
                )}
              </div>
              <Button
                className="gap-2"
                disabled={!isAuthSettled || !isAuthenticated || !profileComplete || !isFormValid || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Sending…' : 'Reach Out'}
                <Icon icon={faPaperPlaneTop} className="size-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
