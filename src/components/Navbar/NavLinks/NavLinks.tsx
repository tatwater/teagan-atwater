'use client';

import { ReactNode, forwardRef } from 'react';
import Link from 'next/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/sharp-solid-svg-icons';

import TA from '@/components/logos/TA';
import SousSquircle from '@/components/logos/SousSquircle';

import styled from './NavLinks.module.scss';


export default function NavLinks() {
  return (
    <NavigationMenu.Root className={ styled.root }>
      <Link className={ styled.logo } href='/'>
        <TA />
      </Link>
      <NavigationMenu.List className={ styled.list }>
        {/* <NavigationMenu.Item>
          <NavigationMenu.Link className={ styled.link } href='/resume'>
            <span className={ styled.index }>01.&nbsp;</span>
            Résumé
          </NavigationMenu.Link>
        </NavigationMenu.Item> */}
        {/* <NavigationMenu.Item>
          <NavigationMenu.Trigger className={ styled.trigger }>
            <span>02.&nbsp;</span>
            Projects
            <FontAwesomeIcon icon={ faAngleDown } />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={ styled.content }>
            <ul className={ styled.subList }>
              <li className={ styled.calloutPositioner }>
                <NavigationMenu.Link asChild>
                  <Link className={ styled.callout } href='/'>
                    <div className={ styled.iconWrapper }>
                      <SousSquircle />
                    </div>
                    <h6>Sous</h6>
                    <p>A social network for people who make food</p>
                  </Link>
                </NavigationMenu.Link>
              </li>
              <ListItem href='/' title='Granger'>
                Empowering the next generation of organized labor with ownership
              </ListItem>
              <ListItem href='/' title='Osler Health'>
                A portable, structured system for personal electronic medical data
              </ListItem>
              <ListItem href='/' title='Fiber'>
                Organization-wide analytics on the effects of implicit biases
              </ListItem>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item> */}
        {/* <NavigationMenu.Item>
          <NavigationMenu.Link className={ styled.link } href='/'>
            <span>03.&nbsp;</span>
            Connect
          </NavigationMenu.Link>
        </NavigationMenu.Item> */}
      </NavigationMenu.List>
      <div className={ styled.viewportPosition }>
        <NavigationMenu.Viewport className={ styled.viewport } />
      </div>
    </NavigationMenu.Root>
  );
}

// const ListItem = forwardRef(({ children, href, title }: { children: ReactNode; href: string; title: string; }, forwardedRef) => (
//   <li>
//     <NavigationMenu.Link asChild>
//       <a className={ styled.subLink } href={ href } ref={forwardedRef}>
//         <h6>{ title }</h6>
//         <p>{ children }</p>
//       </a>
//     </NavigationMenu.Link>
//   </li>
// ));
