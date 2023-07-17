'use client';

import type { ChangeEventHandler } from 'react';
import type { Database } from '@/lib/database.types';
type Profiles = Database['public']['Tables']['profiles']['Row']


import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import * as Form from '@radix-ui/react-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImagePolaroidUser, faRefresh, faSpinner } from '@fortawesome/sharp-regular-svg-icons';

import styled from './AvatarUpload.module.scss';


type Props = {
  onUpload: (url: string) => void;
  url:       Profiles['avatar_url'];
  userId:    string;
}


export default function AvatarUpload({
  onUpload,
  url,
  userId,
}: Props) {
  const supabase = createClientComponentClient<Database>();
  const [avatarPath, setAvatarPath] = useState<Profiles['avatar_url']>(url);
  const [avatarUrl, setAvatarUrl]   = useState('');
  const [uploading, setUploading]   = useState(false);

  const uploadAvatar: ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${ userId }-${ new Date().getTime() / 1000 }.${ fileExt }`;

      let { data: uploadData, error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      if (uploadData) {
        setAvatarPath(uploadData.path);
      }

      onUpload(filePath);
    } catch (error) {
      console.log(error);
      alert('Error uploading avatar!');
    } finally {
      setUploading(false);
    }
  }


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
    <div>
      <Form.Control asChild>
        <input
          accept='image/png,image/jpeg'
          disabled={ uploading }
          onChange={ uploadAvatar }
          style={{ display: 'none' }}
          type='file'
        />
      </Form.Control>
      {(!!avatarUrl)
        ? (
          <Form.Label className={ styled.imageWrapper }>
            <Image
              alt='Profile Photo'
              fill
              src={ avatarUrl }
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
