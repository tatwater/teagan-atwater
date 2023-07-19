'use client';

import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faLongArrowRight } from '@fortawesome/sharp-regular-svg-icons';

import Avatar from '@/features/auth/Avatar/Avatar';
import styled from './ProfileModal.module.scss';


type Props = {
  avatarUrl: string;
  email:     string;
  fullName:  string;
}


export default function ProfileModal({
  avatarUrl,
  email,
  fullName,
}: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={ styled.button }>
        <Avatar
          avatarUrl={ avatarUrl }
          fullName={ fullName }
          sizeREM='2'
        />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={ styled.overlay } />
        <Dialog.Content className={ styled.content }>
          <header className={ styled.header }>
            <div className={ styled.profile }>
              <Avatar
                avatarUrl={ avatarUrl }
                fullName={ fullName }
                sizeREM='5'
              />
              <div className='content'>
                <span className='name'>{ fullName }</span>
                <span className='email'>{ email }</span>
              </div>
            </div>
            <Link
              autoFocus
              className='button gradient height-md'
              href='/dashboard'
            >
              {/* <span className='text'> */}
                <span>Your Dashboard</span>
                <FontAwesomeIcon icon={ faLongArrowRight } id='icon' />
              {/* </span> */}
            </Link>
          </header>
          {(false)
            ? (
              <ul className={ styled.notifications }>
                <li>Hi</li>
              </ul>
            )
            : (
              <div className={ styled.notifications }>
                <span className='empty'>No notifications at this time</span>
              </div>
            )
          }
          <footer className={ styled.footer }>
            <form
              action='/auth/signout'
              autoFocus={ false }
              method='post'
            >
              <button
                autoFocus={ false }
                className='signout'
                type='submit'
              >
                <span>Sign out</span>
                <FontAwesomeIcon icon={ faArrowRightFromBracket } />
              </button>
            </form>
            <span className='policies'><Link href=''>Terms of Service</Link> • <Link href=''>Privacy Policy</Link></span>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
