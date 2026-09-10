import { faDisplay, faMoon, faSunBright } from '@fortawesome/sharp-regular-svg-icons';


export const THEMES = {
  dark: {
    icon: faMoon,
    label: 'Dark',
  },
  light: {
    icon: faSunBright,
    label: 'Light',
  },
  system: {
    icon: faDisplay,
    label: 'System',
  },
} as const;
