import localFont from 'next/font/local';
import { Inter } from 'next/font/google';


export const inter = Inter({
  display:  'swap',
  subsets: ['latin'],
  variable: '--font-inter',
});

export const mono = localFont({
  display:  'swap',
  src:      '../fonts/JetBrainsMono[wght].ttf',
  variable: '--font-mono',
});
