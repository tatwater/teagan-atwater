import Link from 'next/link';

import CmdkHint from '@/components/CmdkHint';
import ModeToggle from '@/components/ModeToggle';
import Button from './auth/Button';
import Logo from './Logo';
import styled from './Navbar.module.scss';


export default async function Navbar() {
  return (
    <nav className={ styled.navbar }>
      <div className='ml-4'>
        <Link href='/'>
          <Logo />
        </Link>
      </div>
      <div className='flex gap-4 items-center'>
        <CmdkHint />
        <div className='flex gap-2 items-center'>
          <Button />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
