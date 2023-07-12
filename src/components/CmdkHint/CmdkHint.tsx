'use client'

import type { ReactNode } from 'react';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommand } from '@fortawesome/sharp-regular-svg-icons';


export default function CmdkHint() {
  const [isMac,    setIsMac]    = useState(false);
  const [showHint, setShowHint] = useState(false);


  useEffect(() => {
    if (navigator.platform.includes('Mac')) {
      setIsMac(true);
      setShowHint(true);
    } else if (navigator.platform.includes('Win') || navigator.platform.includes('Linux')) {
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
    <div className={ `bg-[color:var(--color-surface-secondary)] rounded
                      h-6 w-6
                      grid place-items-center
                      font-semibold ${ icon ? 'text-xs' : 'text-sm' }` }>
      { children }
    </div>
  )
}
