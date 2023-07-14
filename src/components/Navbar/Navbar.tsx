import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle as faUserCircleReg } from '@fortawesome/sharp-regular-svg-icons';
import { faUserCircle as faUserCircleSolid } from '@fortawesome/sharp-solid-svg-icons';

import CmdkHint from '@/components/CmdkHint';
import ModeToggle from '@/components/ModeToggle';
import Logo from './Logo';

import styled from './Navbar.module.scss';
import SignInButton from './SignInButton';


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
          <SignInButton />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
