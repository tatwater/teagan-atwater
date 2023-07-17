'use client';

import type { User } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/sharp-regular-svg-icons';

import Avatar from '@/features/auth/Avatar/Avatar';

import styled from '../AuthButtons.module.scss';


type Props = {
  user: User | null,
}


export default function UserButton({ user }: Props) {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const pathname = usePathname();
  const supabase = createClientComponentClient<Database>();
  const href     = `/auth/signout`;
  const viewingProfile = pathname.startsWith('/account');
  const activeClass    = viewingProfile ? 'active' : '';

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`
          avatar_url,
          full_name
        `)
        .eq('user_id', user?.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setFullName(data.full_name || '');
        setAvatarPath(data.avatar_url);
      }
    } catch (error) {
      alert('Error loading user data!');
    } finally {
      setLoading(false);
    }
  }, [user, supabase])


  useEffect(() => {
    getProfile()
  }, [user, getProfile]);

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage.from('avatars').download(path);

        if (error) {
          throw error;
        }

        const url = URL.createObjectURL(data);

        setAvatarUrl(url);
      } catch (error) {
        console.log('Error downloading image: ', error);
      }
    }

    if (avatarPath) {
      downloadImage(avatarPath);
    }
  }, [avatarPath, supabase]);


  return (
    <Link
      className={ `${ styled.button } ${ activeClass }` }
      href={ href }
    >
      {(!!loading || !user?.user_metadata.hasProfile)
        ? (
          <div className={ styled.welcomePlaceholder }>
            <FontAwesomeIcon icon={ faUserCircle } />
          </div>
        )
        : (
          <Avatar
            image={ avatarUrl || '' }
            name={ fullName || user?.email || '' }
            sizeREM='2'
          />
        )
      }
    </Link>
  );
}
