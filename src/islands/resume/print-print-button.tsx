import { detectPlatform, MAC_MODIFIER_SYMBOLS, useHotkey } from '@tanstack/react-hotkeys';
import { Kbd, KbdGroup } from '@/components/ui/kbd';


export function PrintPrintButton() {
  const isMac = detectPlatform() === 'mac';
  const metaKey = isMac
    ? MAC_MODIFIER_SYMBOLS['Meta']
    : 'Ctrl';

  return (
    <button className="inline-flex items-center gap-[12px] bg-[oklch(0.60_0.13_163)] hover:bg-[oklch(0.52_0.13_163)] border-none text-white cursor-pointer font-mono text-[12px] font-medium h-[32px] px-[12px] transition-[background] duration-150" onClick={() => window.print()}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" style={{display: 'inline', width: '12px', height: '12px', verticalAlign: '-0.1em'}}>
        <path d="M332.1 48l51.9 51.9 0 44.1 48 0 0-64-80-80-272 0 0 144 48 0 0-96 204.1 0zM368 368l0 96-224 0 0-96 224 0zM144 320l-48 0 0 48-48 0 0-128 416 0 0 128-48 0 0-48-272 0zm272 96l96 0 0-224-512 0 0 224 96 0 0 96 320 0 0-96z"/>
      </svg>
      <span>
        Print / Save as PDF
      </span>
      <KbdGroup className='-mr-[4px]'>
        <Kbd className='size-[20px] text-[12px]'>
          {metaKey}
        </Kbd>
        <Kbd className='size-[20px] text-[12px]'>
          {`P`}
        </Kbd>
      </KbdGroup>
    </button>
  );
}
