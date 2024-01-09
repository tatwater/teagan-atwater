import CmdkHint from '@/components/CmdkHint';
import ModeToggle from '@/components/ModeToggle';
import NavLinks from './NavLinks';
import Button from './auth/Button';

import styled from './Navbar.module.scss';


export default async function Navbar() {
  return (
    <nav className={ styled.navbar }>
      <div className='ml-4 flex align-center'>
        <NavLinks />
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
