import { faArrowLeft, faDeleteLeft } from '@fortawesome/sharp-regular-svg-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { navigate } from 'astro:transitions/client';

import { Icon } from '@/components/icon';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';


export function BackHomeButton() {
  useHotkey('Backspace', () => {
    navigate('/');
  }, { ignoreInputs: true });

  return (
    <a
      autoFocus
      className={cn(
        'group/detail shrink-0 flex items-center justify-center gap-2 -my-px h-8 pr-2 text-xs font-mono font-medium whitespace-nowrap border border-transparent',
        'text-muted-foreground transition-colors',
        'border-emerald-700 text-emerald-700 hover:bg-primary/10 focus-within:bg-primary/10 focus-within:text-emerald-700',
        'pl-6 sm:pl-2',
      )}
      href='/'
    >
      <Icon icon={faArrowLeft} />
      Back to résumé
      <KbdGroup>
        <Kbd className='w-5'>
          <Icon icon={faDeleteLeft} />
        </Kbd>
      </KbdGroup>
    </a>
  );
}
