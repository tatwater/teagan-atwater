import { CSSProperties } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRight, faLongArrowRight } from '@fortawesome/sharp-regular-svg-icons';

import FiberLogo from '@/components/logos/FiberLogo';
import OhoLogo from '@/components/logos/OhoLogo';
import OslerLogo from '@/components/logos/OslerLogo';
import styled from './Previously.module.scss';


interface PreviouslyCSS extends CSSProperties {
  '--fill-color':                  string;
  '--previous-brand-color':        string;
  '--previous-brand-color--hover': string;
}


const oslerVars = {
  '--fill-color':                  'rgb(203, 155, 81)',
  '--previous-brand-color':        'rgba(203, 155, 81, 0.3)',
  '--previous-brand-color--hover': 'rgba(203, 155, 81, 0.7)',
};
const fiberVars = {
  '--fill-color':                  'rgb(41, 98, 255)',
  '--previous-brand-color':        'rgba(41, 98, 255, 0.3)',
  '--previous-brand-color--hover': 'rgba(41, 98, 255, 0.7)',
};
const ohoVars = {
  '--fill-color':                  'rgb(230, 73, 0)',
  '--previous-brand-color':        'rgba(230, 73, 0, 0.3)',
  '--previous-brand-color--hover': 'rgba(230, 73, 0, 0.7)',
};


export default function PreviouslySection() {
  return (
    <section className={ styled.container }>
      <h2 className={ styled.heading }>
        <span>Previously</span>
      </h2>
      <div className={ styled.cardList }>
        <div
          className={ styled.card }
          style={ oslerVars as PreviouslyCSS }
        >
          <div className={ styled.logoWrapper }>
            <OslerLogo />
          </div>
          Osler Health
          <p>A portable, structured system for personal electronic medical data</p>
          <Link className='button' href=''>
            { 'Case Study' }
            <FontAwesomeIcon icon={ faLongArrowRight } />
          </Link>
        </div>

        <div
          className={ styled.card }
          style={ fiberVars as PreviouslyCSS }
        >
          <div className={ styled.logoWrapper }>
            <FiberLogo />
          </div>
          Fiber
          <p>Organization-wide, actionable insights on the effects of implicit biases</p>
          <Link className='button' href=''>
            { 'Case Study' }
            <FontAwesomeIcon icon={ faLongArrowRight } />
          </Link>
        </div>

        <div
          className={ styled.card }
          style={ ohoVars as PreviouslyCSS }
        >
          <div className={ styled.logoWrapper }>
            <OhoLogo />
          </div>
          OHO Interactive
          <p>An accessibilty-focused web developement agency</p>
          <Link className='button' href='https://oho.com' target='_blank'>
            { 'Visit' }
            <FontAwesomeIcon icon={ faArrowUpRight } />
          </Link>
        </div>
      </div>
    </section>
  );
}
