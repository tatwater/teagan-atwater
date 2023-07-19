'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle as userReg } from '@fortawesome/sharp-regular-svg-icons';
import { faUserCircle as userSolid } from '@fortawesome/sharp-solid-svg-icons';

import styled from '../AuthButtons.module.scss';


export default function SignInButton() {
  const pathname = usePathname();
  const href     = `/signin?redirectTo=${ pathname }`;
  const signingIn   = pathname.startsWith('/signin');


  if (signingIn) {
    return (
      <div className={ `${ styled.button } active` }>
        <FontAwesomeIcon icon={ userSolid } />
      </div>
    );
  } else {
    return (
      <Link
        className={ styled.button }
        href={ href }
      >
        <FontAwesomeIcon icon={ userReg } />
      </Link>
    );
  }
}
