'use client'

import type { ReactNode } from 'react';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommand } from '@fortawesome/sharp-regular-svg-icons';

import styled from './Cmdk.module.scss';


export default function CmdkHint() {
  const [isMac,    setIsMac]    = useState(false);
  const [showHint, setShowHint] = useState(false);


  useEffect(() => {
    if (navigator.userAgent.includes('Macintosh')) {
      setIsMac(true);
      setShowHint(true);
    } else if (
      navigator.userAgent.includes('CrOS')
      || (
        navigator.userAgent.includes('Windows')
        && !navigator.userAgent.includes('Phone')
        && !navigator.userAgent.includes('Xbox')
      )
      || (
        navigator.userAgent.includes('Linux')
        && !navigator.userAgent.includes('Android')
        && !navigator.userAgent.includes('Kindle')
      )
    ) {
      setShowHint(true);
    }
  });

  
  if (showHint) {
    return (
      <div className='flex gap-3 items-center
                      font-mono text-xs'>
        <span>Explore by keyboard</span>
        <div className='flex gap-1 items-center'>
          <KeyboardKey icon={ isMac }>
            { isMac
              ? <FontAwesomeIcon icon={ faCommand } />
              : 'Ctrl'
            }
          </KeyboardKey>
          <KeyboardKey>
            { 'K' }
          </KeyboardKey>
        </div>
      </div>
    );
  }

  return <></>;
}


const KeyboardKey = ({ children, icon }: { children: ReactNode, icon?: boolean }) => {
  return (
    <kbd className={ `${ icon ? 'text-xs' : 'text-sm' } ${ styled.key }` }>
      { children }
    </kbd>
  )
}
