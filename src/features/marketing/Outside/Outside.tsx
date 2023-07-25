import Link from 'next/link';
import { faSnowflake, faSun } from '@fortawesome/sharp-regular-svg-icons';

import Header from './Header';
import Season from './Season';
import styled from './Outside.module.scss';
import SPORTS from './SPORTS';


export default function OutsideSection() {
  return (
    <section className={ styled.container }>
      <div className={ styled.content }>
        <Header />

        <div className={ styled.seasonal }>
          <h3 className={ styled.kicker }>
            { 'Seasonal' }
          </h3>
          <div className={ styled.seasons }>
            <Season
              icon={ faSun }
              sports={ SPORTS.warm }
              title='Warm'
            />
            <Season
              icon={ faSnowflake }
              sports={ SPORTS.cold }
              title='Cold'
            />
          </div>
        </div>

        <div className={ styled.other }>
          <div className={ styled.category }>
            <h3 className={ styled.title }>Food & Drink</h3>
            <span className={ styled.otherLink }>Cooking</span>
            <span className={ styled.otherLink }>Baking</span>
            <span className={ styled.otherLink }>Cocktails</span>
            <span className={ styled.otherLink }>Coffee</span>
          </div>

          <div className={ styled.category }>
            <h3 className={ styled.title }>Mindfulness</h3>
            <span className={ styled.otherLink }>Yoga</span>
            <span className={ styled.otherLink }>Meditation</span>
          </div>

          <div className={ styled.category }>
            <h3 className={ styled.title }>Hosting</h3>
            <span className={ styled.otherLink }>Dinner parties</span>
            <span className={ styled.otherLink }>Game nights</span>
          </div>

          <div className={ styled.category }>
            <h3 className={ styled.title }>Other</h3>
            <span className={ styled.otherLink }>Interior design</span>
            <span className={ styled.otherLink }>Music</span>
            <span className={ styled.otherLink }>Podcasts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
