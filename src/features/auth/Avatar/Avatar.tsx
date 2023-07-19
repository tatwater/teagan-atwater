'use client';

import type { Database } from '@/lib/database.types';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import * as RadixAvatar from '@radix-ui/react-avatar';

import downloadAvatar from '@/utils/downloadAvatar';
import getInitialsFromName from '@/utils/getInitialsFromName';
import styled from './Avatar.module.scss';


type Props = {
  avatarUrl: string;
  fullName:  string;
  sizeREM:   string;
}


export default function Avatar({
  avatarUrl,
  fullName,
  sizeREM,
}: Props) {
  const supabase = createClientComponentClient<Database>();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const initials = getInitialsFromName(fullName);
  

  useEffect(() => {
    async function download(path: string) {
      const url = await downloadAvatar(path, supabase);
      setImageSrc(url);
    }

    if (!!avatarUrl) download(avatarUrl);
  }, [avatarUrl, supabase]);


  return (
    <RadixAvatar.Root
      className={ styled.root }
      style={{
        fontSize: `${ parseFloat(sizeREM) / 2 }rem`,
        width: `${ sizeREM }rem`,
      }}
    >
      <RadixAvatar.Image
        alt={ fullName }
        className={ styled.image }
        src={ imageSrc || '' }
      />
      <RadixAvatar.Fallback className={ styled.fallback }>
        { initials }
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
