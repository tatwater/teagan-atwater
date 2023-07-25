import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMountains } from '@fortawesome/sharp-regular-svg-icons';

import styled from './Outside.module.scss';


export default function OutsideHeader() {
  return (
    <header>
      <h2 className={ styled.sectionHeading }>
        <div className={ styled.sectionHeadingIconWrapper}>
          <FontAwesomeIcon icon={ faMountains } />
        </div>
        <span>
          <strong>
            { 'Outside' }
          </strong>
          {' (of work)' }
        </span>
      </h2>
      <p className={ styled.subheading }>
        <strong>
          { 'Work-life balance and maintaining a healthy body, mind, and home are top priorities for me.' }
        </strong>
        { ` When I'm not at my desk, catch me on my bike, or ice skates, or cheffing up something tasty!` }
      </p>
    </header>
  );
}
