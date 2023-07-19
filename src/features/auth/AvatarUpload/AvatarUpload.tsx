'use client';

import type { ChangeEventHandler } from 'react';
import type { Database } from '@/lib/database.types';
type Profiles = Database['public']['Tables']['profiles']['Row'];


import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import * as Form from '@radix-ui/react-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImagePolaroidUser, faRefresh, faSpinner } from '@fortawesome/sharp-regular-svg-icons';

import Avatar from '@/features/auth/Avatar/Avatar';
import downloadAvatar from '@/utils/downloadAvatar';
import styled from './AvatarUpload.module.scss';


type Props = {
  onUpload: (url: string) => void;
  image:     Profiles['avatar_url'];
  userId:    string;
}


export default function AvatarUpload({
  onUpload,
  image,
  userId,
}: Props) {
  const supabase = createClientComponentClient<Database>();
  const [avatarPath, setAvatarPath] = useState<Profiles['avatar_url']>(image);
  const [uploading, setUploading]   = useState(false);

  const handleChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    setUploading(true);

    if (!event.target.files || event.target.files.length === 0) {
      throw new Error('You must select an image to upload.');
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${ userId }-${ new Date().getTime() / 1000 }.${ fileExt }`;

    if (!!file && !!filePath) {
      try {
        const { error } = await supabase.storage.from('avatars').upload(filePath, file);
    
        if (error) {
          throw error;
        }
      } catch (error) {
        console.log(error);
      } finally {
        setAvatarPath(filePath);
        onUpload(filePath);
        setUploading(false);
      }
    }
  }


  return (
    <div>
      <Form.Control asChild>
        <input
          accept='image/png,image/jpeg'
          disabled={ uploading }
          onChange={ handleChange }
          style={{ display: 'none' }}
          type='file'
        />
      </Form.Control>
      {(!!avatarPath)
        ? (
          <Form.Label className={ styled.imageWrapper }>
            <Avatar
              avatarUrl={ avatarPath }
              fullName=''
              sizeREM='7'
            />
            <span className={ styled.swapIcon }>
              <FontAwesomeIcon icon={ faRefresh } />
            </span>
          </Form.Label>
        )
        : (
          <Form.Label className={ styled.uploadLabel }>
            <FontAwesomeIcon
              icon={ uploading ? faSpinner : faImagePolaroidUser }
              size='lg'
            />
            {(uploading)
              ? (
                <span>
                  { 'Uploading...' }
                </span>
              )
              : (
                <span>
                  { "Upload a photo" }
                </span>
              )
            }
          </Form.Label>
        )
      }
    </div>
  );
}
