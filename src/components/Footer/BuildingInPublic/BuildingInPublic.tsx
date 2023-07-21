import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/sharp-solid-svg-icons';
import { faLongArrowRight, faScrewdriverWrench } from '@fortawesome/sharp-regular-svg-icons';


import styled from './BuildingInPublic.module.scss';


export default function BuildingInPublic() {
  return (
    <aside className={ styled.buildInPublic }>
      <header>
        <Link
          className='github'
          href='https://github.com/tatwater/teagan-atwater'
          target='_blank'
        >
          <FontAwesomeIcon icon={ faStar } />
          { 'Star on GitHub' }
        </Link>
        <div className='heading'>
          <span className='icon-wrapper'>
            <FontAwesomeIcon icon={ faScrewdriverWrench } />
          </span>
          <span className='text'>I'm building in the open</span>
        </div>
        <p>Sign up to be the first to know when I drop new features & content!</p>
      </header>
      <form>
        <div className='input-wrapper'>
          <label>Email address</label>
          <input
            autoComplete='none'
            // onChange={ handleChange }
            placeholder='email@example.com'
            required
            type='email'
            // value={ email }
          />
        </div>
        <button type='submit'>
          <span>Sign up</span>
          <FontAwesomeIcon icon={ faLongArrowRight } />
        </button>
      </form>
    </aside>
  );
}
