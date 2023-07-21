import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowLeft } from '@fortawesome/sharp-regular-svg-icons';

import SignInForm from '@/features/auth/SignInForm/SignInForm';
import styled from './SignInPage.module.scss';


export default async function SignInPage({
  searchParams,
}: {
  searchParams?: { redirectTo: string | undefined };
}) {
  const origin = searchParams?.redirectTo;

  return (
    <>
      <main className={ styled.centerCenter }>
        <Link
          className={ styled.backLink }
          href={ origin || '/' }
        >
          <FontAwesomeIcon icon={ faLongArrowLeft } />
          Back
        </Link>
        <h1 className='h2'>Sign in</h1>
        <SignInForm />
      </main>
      <aside className={ styled.featured }>
        Hi there
      </aside>
    </>
  );
}
