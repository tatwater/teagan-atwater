import type { Database } from '@/lib/database.types';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/sharp-regular-svg-icons';

import WelcomeForm from '@/features/auth/WelcomeForm/WelcomeForm';
import styled from './WelcomePage.module.scss';
import Link from 'next/link';


export default async function WelcomePage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const email = user?.email as string;
  const userId = user?.id as string;

  
  return (
    <main className={ styled.centerCenter }>
      <h1 className='h2'>Complete your Profile</h1>
      <aside className={ styled.message }>
        <FontAwesomeIcon icon={ faCheckCircle } />
        <span>
          { 'Great! Your email address is confirmed:' }
          <strong>{ email }</strong>
        </span>
      </aside>
      <WelcomeForm
        email={ email }
        userId={ userId }
      />
      <span className={ styled.policyNotice } >By continuing, you agree to the <Link href=''>Terms of Service</Link> and <Link href=''>Privacy Policy</Link>.</span>
    </main>
  );
}
