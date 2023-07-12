import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/sharp-regular-svg-icons';

import CmdkHint from '@/components/CmdkHint';
import ModeToggle from '@/components/ModeToggle';
import Logo from './Logo';
import Link from 'next/link';


const styles = {
  navbar: `sticky inset-x-0 top-0
           backdrop-blur-md
           mt-4 px-6 py-5
           flex items-center justify-between gap-4
           select-none`,
}


export default function Navbar() {
  return (
    <nav className={ styles.navbar } style={{ zIndex: '1000' }}>
      <div className='ml-4'>
        {/* <img src='Logo.svg' alt='TA Logo' /> */}
        <Link href='/'>
          <Logo />
        </Link>
      </div>
      <div className='flex gap-4 items-center'>
        <CmdkHint />
        <div className='flex gap-2 items-center'>
          <button className='h-10 w-10 grid place-items-center order-2 rounded-3xl'>
            <FontAwesomeIcon icon={ faUserCircle } />
          </button>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
