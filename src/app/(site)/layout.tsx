import type { ReactNode } from 'react';

import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { inter, mono } from '@/fonts';
import '@/styles/globals.scss';
import Navbar from '@/components/Navbar/Navbar';
import Providers from './Providers';


type Props = {
  children: ReactNode,
  modal:    ReactNode,
}


fontAwesomeConfig.autoAddCss = false;


export const metadata = {
  title: 'Teagan Atwater',
  description: 'The personal website of Teagan Atwater',
}

export default function RootLayout({ children, modal }: Props) {
  return (
    <html lang='en'>
      <body className={` ${ inter.variable } ${ mono.variable } `}>
        <Providers>
          <Navbar />
          { modal }
          { children }
        </Providers>
      </body>
    </html>
  );
}
