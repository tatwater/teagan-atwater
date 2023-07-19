'use client';

import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';

import styled from './SigninModal.module.scss';
import SignInForm from '@/features/auth/SignInForm/SignInForm';


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
          <SignInForm />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
