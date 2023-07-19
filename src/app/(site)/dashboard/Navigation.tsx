'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import styled from './DashboardLayout.module.scss';


export default function DashboardNavigation() {
  const pathname = usePathname();

  return (
    <nav className={ styled.dashboardNav }>
      <Link
        className={ pathname.endsWith('/dashboard') ? 'active' : '' }
        href='/dashboard'
      >
        Dashboard
      </Link>
      <Link
        className={ pathname.endsWith('/edit-profile') ? 'active' : '' }
        href='/dashboard/edit-profile'
      >
        Edit Profile
      </Link>
      <Link
        className={ pathname.endsWith('/email-settings') ? 'active' : '' }
        href='/dashboard/email-settings'
      >
        Email Settings
      </Link>
      <hr />
      <Link
        className={ pathname.endsWith('/delete-account') ? 'active delete' : 'delete' }
        href='/dashboard/delete-account'
      >
        Delete Account
      </Link>
    </nav>
  );
}
