import type { ThemePreference } from '@/islands/navbar/types';


export function getStoredTheme(): ThemePreference {
  if (typeof localStorage === 'undefined') return 'system';
  const v = localStorage.getItem('theme');
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}


export function applyTheme(pref: ThemePreference) {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  const isDark =
    pref === 'dark' ||
    (pref !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
  localStorage.setItem('theme', pref);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.classList.remove('theme-switching');
  }));
}
