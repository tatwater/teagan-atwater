'use client';

import type { User } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

import { useCallback, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import UserButton from '../UserButton';
import SignInButton from '../SignInButton';


export default function SignOutButton() {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);


  const getUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, [supabase]);


  useEffect(() => {
    getUser();
  }, [getUser]);


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
