'use client';

import type { Database } from '@/lib/database.types';

import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/sharp-regular-svg-icons';


export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  }


  return (
    <button
      autoFocus={ false }
      className='signout-button'
      onClick={ handleSignOut }
    >
      <span>Sign out</span>
      <FontAwesomeIcon icon={ faArrowRightFromBracket } />
    </button>
  )
}
