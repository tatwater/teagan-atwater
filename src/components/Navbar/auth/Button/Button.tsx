'use client';

import type { User } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import UserButton from '../UserButton';
import SignInButton from '../SignInButton';


export default function SignOutButton() {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);

  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }

    getUser();
  }, []);


  if (user) {
    return (
      <UserButton user={ user } />
    );
  } else {
    return (
      <SignInButton />
    )
  }
}
