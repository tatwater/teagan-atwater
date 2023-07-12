'use client'

import type { ReactNode } from 'react';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommand } from '@fortawesome/sharp-regular-svg-icons';


export default function CmdkHint() {
  const [showHint, setShowHint] = useState(false);
  // Check whether windows / mac to choose ctrl / cmd
  // useEffect(() => {
  //   console.log(window.navigator.userAgentData?.platform);
  // });

  // console.log (navigator.userAgent.includes('Macintosh'));

  useEffect(() => {
    if (!!navigator.keyboard) {
      setShowHint(true);
    }
  });


  if (showHint) {
    return (
      <div className='flex gap-3 items-center
                      font-mono text-xs'>
        <span>Explore by keyboard</span>
        <div className='flex gap-1 items-center'>
          <KeyboardKey icon>
            <FontAwesomeIcon icon={ faCommand } />
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
