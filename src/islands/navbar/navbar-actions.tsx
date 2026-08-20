import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ThemePreference } from '@/islands/navbar/types';

import { useState, useEffect, useRef } from 'react';
import { faLoader } from '@fortawesome/sharp-regular-svg-icons';
import { Menu } from '@base-ui/react/menu';
import { CommandPalette } from '@/islands/navbar/command-palette';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { THEMES } from '@/islands/navbar/constants';
import { applyTheme, getStoredTheme } from '@/islands/navbar/theme';



function ThemeItem({ value, icon, label }: { value: string; icon: IconDefinition; label: string }) {
  return (
    <Menu.RadioItem
      value={value}
      aria-label={label}
      className={cn(
        'size-7 text-sm rounded-full',
        'flex items-center justify-center cursor-pointer outline-none transition-all',
        'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
        'data-highlighted:bg-primary/10 data-highlighted:text-foreground',
        'data-checked:text-foreground data-checked:ring-1 data-checked:ring-primary',
        'data-checked:ring-offset-1 data-checked:ring-offset-popover',
      )}
    >
      <Icon icon={icon} />
    </Menu.RadioItem>
  );
}


export function NavbarActions() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setTheme(getStoredTheme());
  }, []);

  useEffect(() => {
    if (!themeMenuOpen) return;
    // Run after base-ui's own focus-first-item logic so we can override it
    const id = requestAnimationFrame(() => {
      menuPopupRef.current?.querySelector<HTMLElement>('[data-checked]')?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [themeMenuOpen]);

  function handleThemeChange(value: string) {
    const pref = value as ThemePreference;
    setTheme(pref);
    applyTheme(pref);
    setThemeMenuOpen(false);
  }

  return (
    <div className='flex items-center gap-2'>
      <CommandPalette />

      {/* Theme toggle */}
      <Menu.Root open={themeMenuOpen} onOpenChange={setThemeMenuOpen}>
        <Menu.Trigger
          render={
            <button
              className={cn(
                'size-8 text-sm rounded-full',
                'flex items-center justify-center cursor-pointer outline-none',
                'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
                'focus-visible:ring-1 focus-visible:ring-ring',
                'aria-expanded:bg-muted aria-expanded:text-foreground',
              )}
              aria-label={mounted ? `Theme: ${THEMES[theme].label}` : 'Loading theme'}
            />
          }
        >
          {mounted ? (
            <Icon icon={THEMES[theme].icon} />
          ) : (
            <Icon icon={faLoader} className='animate-spin' />
          )}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side='bottom' align='center' sideOffset={-35} className='z-50'>
            <Menu.Popup
              ref={menuPopupRef}
              className={cn(
                'flex flex-col gap-1 outline-none',
                'origin-(--transform-origin)',
                'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
                'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
              )}
            >
              <Menu.RadioGroup
                value={theme}
                onValueChange={handleThemeChange}
                className='contents'
              >
                <div className='bg-popover border border-border rounded-full shadow-sm p-1 flex flex-col gap-1'>
                  <ThemeItem value='light' icon={THEMES['light'].icon} label={THEMES['light'].label} />
                  <ThemeItem value='dark' icon={THEMES['dark'].icon} label={THEMES['dark'].label} />
                </div>
                <div className='bg-popover border border-border rounded-full shadow-sm p-1'>
                  <ThemeItem value='system' icon={THEMES['system'].icon} label={THEMES['system'].label} />
                </div>
              </Menu.RadioGroup>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

    </div>
  );
}
