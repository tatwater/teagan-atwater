import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { Sport } from './SPORTS';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styled from './Outside.module.scss';


interface Props {
  icon:   IconDefinition;
  sports: Sport[];
  title:  string;
}


export default function OutsideSeason({
  icon,
  sports,
  title,
}: Props) {
  return (
    <div className={ styled.season }>
      <div className={ styled.title }>
        <FontAwesomeIcon
          className={ title.toLowerCase() }
          fixedWidth
          icon={ icon }
        />
        { title }
      </div>
      <div className={ styled.sportsList }>
        { sports.map((sport) => (
          <span className={ styled.sportLink } key={ sport.name }>
            <div className='icon-wrapper'>
              <FontAwesomeIcon icon={ sport.icon } />
            </div>
            <div className='text'>
              { sport.name }
              <span className='stat'>
                { `${ sport.numSeasons } seasons since ${ sport.startYear }` }
              </span>
            </div>
          </span>
        ))}
      </div>
    </div>
  );
}
