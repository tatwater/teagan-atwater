'use client';

import { usePathname } from 'next/navigation';


export default function CurrentPage() {
  const pathname = usePathname();
  const lastPath = pathname.split('/').pop();


  switch (lastPath) {
    case 'dashboard':
      return (
        <>Dashboard</>
      );
    case 'edit-profile':
      return (
        <>Edit Profile</>
      );
    case 'email-settings':
      return (
        <>Email Settings</>
      );
    case 'delete-account':
      return (
        <>Delete Account</>
      );
  }
}
