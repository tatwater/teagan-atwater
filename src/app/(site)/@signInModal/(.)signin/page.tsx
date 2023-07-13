'use client';

import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowRight } from '@fortawesome/sharp-regular-svg-icons';

import styled from './SigninModal.module.scss';


export default function SignInModal() {
  const router = useRouter();

  return (
    <Dialog.Root
      onOpenChange={(open: boolean) => !open && router.back() }
      open={ true }
    >
      <Dialog.Portal>
        <Dialog.Overlay className={ styled.overlay } />
        <Dialog.Content className={ styled.content }>
          <form className={ styled.form }>
            <div className='input-wrapper'>
              <label htmlFor='signin-email'>Email address</label>
              <input
                autoFocus
                id='signin-email'
                placeholder='email@example.com'
                type='email'
              />
            </div>
            <button>
              { 'Sign in' }
              <FontAwesomeIcon icon={ faLongArrowRight } />
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
