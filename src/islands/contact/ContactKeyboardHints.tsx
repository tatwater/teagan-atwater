import { useHotkey, detectPlatform, MAC_MODIFIER_SYMBOLS } from '@tanstack/react-hotkeys';
import { navigate } from 'astro:transitions/client';
import { CONTACT_GROUPS, subjectUrl } from '@/data/contact';
import { Kbd, KbdGroup } from '@/components/ui/kbd';

const SUBJECTS = CONTACT_GROUPS.flatMap((group) =>
  group.subjects.map((subject) => subjectUrl(group.slug, subject.slug))
);

const GROUP_FIRST_SUBJECTS = CONTACT_GROUPS.map((group) =>
  subjectUrl(group.slug, group.subjects[0].slug)
);

interface Props {
  activeGroup: string | null;
  activeSubject: string;
}

export function ContactKeyboardHints({ activeGroup, activeSubject }: Props) {
  const currentUrl = subjectUrl(activeGroup, activeSubject);
  const currentIndex = SUBJECTS.indexOf(currentUrl);
  const currentGroupIndex = CONTACT_GROUPS.findIndex((group) =>
    group.subjects.some((subject) => subjectUrl(group.slug, subject.slug) === currentUrl)
  );

  useHotkey('ArrowUp', () => {
    if (currentIndex > 0) navigate(SUBJECTS[currentIndex - 1]);
  }, { ignoreInputs: true });

  useHotkey('ArrowDown', () => {
    if (currentIndex < SUBJECTS.length - 1) navigate(SUBJECTS[currentIndex + 1]);
  }, { ignoreInputs: true });

  useHotkey('Alt+ArrowUp', () => {
    if (currentGroupIndex > 0) navigate(GROUP_FIRST_SUBJECTS[currentGroupIndex - 1]);
  }, { ignoreInputs: true });

  useHotkey('Alt+ArrowDown', () => {
    if (currentGroupIndex < CONTACT_GROUPS.length - 1) navigate(GROUP_FIRST_SUBJECTS[currentGroupIndex + 1]);
  }, { ignoreInputs: true });

  useHotkey('Escape', () => {
    const el = document.activeElement as HTMLElement | null;
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el?.getAttribute('role') === 'combobox'
    ) {
      el.blur();
    }
  });

  const isMac = detectPlatform() === 'mac';
  const altKey = isMac ? MAC_MODIFIER_SYMBOLS['Alt'] : 'Alt';

  return (
    <div className="mt-auto -mx-4 p-2 pb-3 bg-secondary-foreground/1 border border-border-light flex flex-col gap-1.5">
      <div className="flex items-center justify-between px-1">
        <KbdGroup>
          <Kbd>↑</Kbd>
          <span className="text-sm text-muted-foreground">/</span>
          <Kbd>↓</Kbd>
        </KbdGroup>
        <span className="text-[10px] font-mono text-muted-foreground">Browse subjects</span>
      </div>
      <div className="flex items-center justify-between px-1">
        <KbdGroup>
          <Kbd>{altKey}</Kbd>
          <Kbd>↑</Kbd>
          <span className="text-sm text-muted-foreground">/</span>
          <Kbd>{altKey}</Kbd>
          <Kbd>↓</Kbd>
        </KbdGroup>
        <span className="text-[10px] font-mono text-muted-foreground">Jump group</span>
      </div>
      <div className="flex items-center justify-between px-1">
        <KbdGroup>
          <Kbd>Esc</Kbd>
        </KbdGroup>
        <span className="text-[10px] font-mono text-muted-foreground">Exit form</span>
      </div>
    </div>
  );
}
