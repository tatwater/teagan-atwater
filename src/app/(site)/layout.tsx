import type { ReactNode } from 'react';

import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { inter, mono } from '@/fonts';
import '@/styles/globals.scss';
import Navbar from '@/components/Navbar/Navbar';
import Providers from './Providers';


type Props = {
  children: ReactNode,
}


fontAwesomeConfig.autoAddCss = false;


export const metadata = {
  title: 'Teagan Atwater',
  description: 'The personal website of Teagan Atwater',
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={` ${ inter.variable } ${ mono.variable } `}>
        <Providers>
          <Navbar />
          { children }
        </Providers>
      </body>
    </html>
  );
}
