import { useEffect, useState } from 'react';
import { useHotkey } from '@tanstack/react-hotkeys';
import { navigate } from 'astro:transitions/client';
import { Kbd, KbdGroup } from '@/components/ui/kbd';


export function PrintBackLink() {
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const onBeforePrint = () => setIsPrinting(true);
    const onAfterPrint = () => { setTimeout(() => setIsPrinting(false), 200); };
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  useHotkey('Escape', () => {
    navigate('/resume');
  }, { ignoreInputs: true, enabled: !isPrinting });


  return (
    <span className='inline-flex items-center gap-3'>
      <a href='/resume' className='back-link inline-flex items-center gap-3 text-[12px] hover:underline hover:underline-offset-2'>
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512' fill='currentColor' aria-hidden='true' style={{ display: 'inline', width: '1em', height: '0.9em', verticalAlign: '-0.1em' }}>
          <path d='M39.5 239l-17 17 17 17 136 136 17 17 33.9-33.9-17-17-95-95 494.1 0 0-48-494.1 0 95-95 17-17-33.9-33.9-17 17-136 136z' />
        </svg>
        <span>Back to interactive résumé</span>
      </a>
      <KbdGroup>
        <Kbd className='h-[20px] text-[12px]'>
          {`Esc`}
        </Kbd>
      </KbdGroup>
    </span>
  );
}
