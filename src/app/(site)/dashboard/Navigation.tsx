'use client';

import type { ReactNode } from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Collapsible from '@radix-ui/react-collapsible';

import styled from './DashboardLayout.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/sharp-regular-svg-icons';
import { faCheck } from '@fortawesome/sharp-solid-svg-icons';


type Props = {
  currentPage: ReactNode;
}


export default function DashboardNavigation({ currentPage }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className={ styled.dashboardNav }>
      <Collapsible.Root className={ styled.root } open={ open } onOpenChange={ setOpen }>
        <Collapsible.Trigger
          className={ styled.trigger }
          style={{ display: `${ open ? 'none' : 'flex'}` }}
        >
          <span>{ currentPage }</span>
          <FontAwesomeIcon
            className={ styled.icon }
            fixedWidth
            icon={ faChevronDown }
          />
        </Collapsible.Trigger>
        <Collapsible.Content className={ styled.content }>
          <Links
            pathname={ pathname }
            setOpen={ setOpen }
          />
        </Collapsible.Content>
      </Collapsible.Root>

      <div className={ styled.navLinks }>
        <Links pathname={ pathname } />
      </div>
    </nav>
  );
}

function Links({ pathname, setOpen }: { pathname: string; setOpen?: (open: boolean) => void; }) {
  return (
    <>
      <Link
        className={ pathname.endsWith('/dashboard') ? 'active' : '' }
        href='/dashboard'
        onClick={() => setOpen && setOpen(false) }
      >
        <span>Dashboard</span>
        {(pathname.endsWith('/dashboard'))
          ? (
            <FontAwesomeIcon
              className={ styled.linkIcon }
              fixedWidth
              icon={ faCheck }
            />
          )
        : (
          <></>
        )}
      </Link>
      <Link
        className={ pathname.endsWith('/edit-profile') ? 'active' : '' }
        href='/dashboard/edit-profile'
        onClick={() => setOpen && setOpen(false) }
      >
        <span>Edit Profile</span>
        {(pathname.endsWith('/edit-profile'))
          ? (
            <FontAwesomeIcon
              className={ styled.linkIcon }
              fixedWidth
              icon={ faCheck }
            />
          )
        : (
          <></>
        )}
      </Link>
      <Link
        className={ pathname.endsWith('/email-settings') ? 'active' : '' }
        href='/dashboard/email-settings'
        onClick={() => setOpen && setOpen(false) }
      >
        <span>Email Settings</span>
        {(pathname.endsWith('/email-settings'))
          ? (
            <FontAwesomeIcon
              className={ styled.linkIcon }
              fixedWidth
              icon={ faCheck }
            />
          )
        : (
          <></>
        )}
      </Link>
      <hr />
      <Link
        className={ pathname.endsWith('/delete-account') ? 'active delete' : 'delete' }
        href='/dashboard/delete-account'
        onClick={() => setOpen && setOpen(false) }
      >
        <span>Delete Account</span>
        {(pathname.endsWith('/delete-account'))
          ? (
            <FontAwesomeIcon
              className={ styled.linkIcon }
              fixedWidth
              icon={ faCheck }
            />
          )
        : (
          <></>
        )}
      </Link>
    </>
  )
}
