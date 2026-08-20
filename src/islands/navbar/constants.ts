import { faDisplay, faMoon, faSun } from '@fortawesome/sharp-regular-svg-icons';


export const THEMES = {
  dark: {
    icon: faMoon,
    label: 'Dark',
  },
  light: {
    icon: faSun,
    label: 'Light',
  },
  system: {
    icon: faDisplay,
    label: 'System',
  },
} as const;
