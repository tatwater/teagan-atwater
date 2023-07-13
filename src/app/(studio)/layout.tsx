import type { ReactNode } from 'react';

import '@/styles/globals.css';


type Props = {
  children: ReactNode,
}


export default function RootLayout({ children }: Props) {
  return (
    <html lang='en'>
      <body>
        { children }
      </body>
    </html>
  )
}
