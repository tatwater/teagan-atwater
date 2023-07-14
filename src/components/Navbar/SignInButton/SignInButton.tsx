'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle as faUserCircleReg } from '@fortawesome/sharp-regular-svg-icons';
import { faUserCircle as faUserCircleSolid } from '@fortawesome/sharp-solid-svg-icons';


export default function SignInButton() {
  const pathname = usePathname();
  const signingIn = pathname.startsWith('/signin');

  return (
    <Link
      className='h-10 w-10 grid place-items-center order-2 rounded-3xl'
      href='/signin'
      style={{ color: signingIn ? 'var(--green-9)' : 'inherit' }}
    >
      <FontAwesomeIcon icon={ signingIn ? faUserCircleSolid : faUserCircleReg } />
    </Link>
  );
}
