import type { Database } from '@/lib/database.types';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link';

import CmdkHint from '@/components/CmdkHint';
import ModeToggle from '@/components/ModeToggle';
import SignInButton from './auth/SignInButton';
import UserButton from './auth/UserButton';
import Logo from './Logo';
import styled from './Navbar.module.scss';


export default async function Navbar() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

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
          {(!!user)
            ? <UserButton user={ user } />
            : <SignInButton />
          }
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
