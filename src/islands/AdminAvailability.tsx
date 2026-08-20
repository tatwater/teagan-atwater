import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CONTACT_GROUPS, subjectUrl } from '@/data/contact';

interface SubjectAvailability {
  group: string | null;
  subject: string;
  label: string;
  groupLabel: string;
  isAvailable: boolean;
}

interface AdminAvailabilityProps {
  initialAvailability: SubjectAvailability[];
}

export function AdminAvailability({ initialAvailability }: AdminAvailabilityProps) {
  const [availability, setAvailability] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    for (const a of initialAvailability) {
      const key = a.group ? `${a.group}/${a.subject}` : a.subject;
      m[key] = a.isAvailable;
    }
    return m;
  });
  const [toggling, setToggling] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleToggle(group: string | null, subject: string) {
    const key = group ? `${group}/${subject}` : subject;
    if (toggling === key) return;
    setToggling(key);
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

    const newValue = !availability[key];

    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: group ?? undefined, subject, isAvailable: newValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAvailability((prev) => ({ ...prev, [key]: newValue }));
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, [key]: err.message || 'Failed to update' }));
    } finally {
      setToggling(null);
    }
  }

  const allSubjects = CONTACT_GROUPS.flatMap((g) =>
    g.subjects
      .filter((s) => !s.alwaysAvailable)
      .map((s) => ({ group: g.slug, subject: s.slug, label: s.label, groupLabel: g.label, subtitle: s.subtitle }))
  );

  return (
    <div className="space-y-1">
      {allSubjects.map(({ group, subject, label, groupLabel, subtitle }) => {
        const key = group ? `${group}/${subject}` : subject;
        const isAvailable = availability[key] ?? true;
        const isBusy = toggling === key;
        const url = subjectUrl(group, subject);

        return (
          <div
            key={key}
            className="flex items-center justify-between px-4 py-3 border border-border hover:bg-muted/30 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{label}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {groupLabel}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
              {errors[key] && (
                <p className="text-[10px] text-destructive mt-0.5">{errors[key]}</p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-4">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-muted-foreground underline underline-offset-2"
              >
                View
              </a>
              <button
                type="button"
                onClick={() => handleToggle(group, subject)}
                disabled={isBusy}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
                  'transition-colors duration-200 ease-in-out focus-visible:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  isAvailable ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                )}
                role="switch"
                aria-checked={isAvailable}
                aria-label={`${label} availability`}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm ring-0',
                    'transition-transform duration-200 ease-in-out',
                    isAvailable ? 'translate-x-4' : 'translate-x-0',
                  )}
                />
              </button>
              <span
                className={cn(
                  'text-xs w-16',
                  isAvailable ? 'text-emerald-500' : 'text-muted-foreground',
                )}
              >
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
