import type { ReactNode } from 'react';

import Footer from '@/components/Footer/Footer';


type Props = {
  children: ReactNode;
}


export default async function DashboardLayout({ children }: Props) {
  return (
    <>
      { children }
      <Footer />
    </>
  );
}
