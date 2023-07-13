import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/sharp-regular-svg-icons';

import CmdkHint from '@/components/CmdkHint';
import ModeToggle from '@/components/ModeToggle';
import Logo from './Logo';

import styled from './Navbar.module.scss';


export default function Navbar() {
  return (
    <nav className={ styled.navbar }>
      <div className='ml-4'>
        {/* <img src='Logo.svg' alt='TA Logo' /> */}
        <Link href='/'>
          <Logo />
        </Link>
      </div>
      <div className='flex gap-4 items-center'>
        <CmdkHint />
        <div className='flex gap-2 items-center'>
          <Link
            className='h-10 w-10 grid place-items-center order-2 rounded-3xl'
            href='/signin'
          >
            <FontAwesomeIcon icon={ faUserCircle } />
          </Link>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
