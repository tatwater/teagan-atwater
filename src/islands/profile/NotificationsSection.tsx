import { useState } from 'react';
import { faBell } from '@fortawesome/sharp-regular-svg-icons';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { CONTACT_GROUPS, subjectUrl } from '@/data/contact';

interface NotificationSub {
  subject: string;
  group?: string;
  isActive: boolean;
}

interface NotificationsSectionProps {
  notifications: NotificationSub[];
}

export function NotificationsSection({ notifications }: NotificationsSectionProps) {
  const [notifMap, setNotifMap] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    for (const n of notifications) {
      const key = n.group ? `${n.group}/${n.subject}` : n.subject;
      m[key] = n.isActive;
    }
    return m;
  });
  const [togglingNotif, setTogglingNotif] = useState<string | null>(null);

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

  const notifiableSubjects = CONTACT_GROUPS.flatMap((g) =>
    g.subjects
      .filter((s) => !s.alwaysAvailable)
      .map((s) => ({
        group: g.slug ?? undefined,
        subject: s.slug,
        label: s.label,
        groupLabel: g.label,
      }))
  );

  return (
    <div className="max-w-lg">
      <p className="text-xs text-muted-foreground mb-5">
        Get notified when availability opens up for subjects you care about.
      </p>

      {notifiableSubjects.length === 0 ? (
        <p className="text-xs text-muted-foreground">No notification preferences available.</p>
      ) : (
        <div className="space-y-0">
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
                  <a
                    href={url}
                    className="text-[10px] text-muted-foreground underline underline-offset-2"
                  >
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
      )}
    </div>
  );
}
