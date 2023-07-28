import Link from 'next/link';

import styled from './Banner.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRight } from '@fortawesome/sharp-regular-svg-icons';


export default function Banner() {
  return (
    <aside className={ styled.container }>
      <div className={ styled.content }>
        <span>I'm building in the open</span>
        <i>—</i>
        <Link href=''>
          { 'View the codebase' }
          <FontAwesomeIcon icon={ faArrowUpRight } />  
        </Link>
      </div>
    </aside>
  )
}
