'use client'

import type { ReactNode } from 'react';

import { ThemeProvider, useTheme } from 'next-themes';
import { KBarProvider as KBar } from 'kbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSunBright } from '@fortawesome/sharp-regular-svg-icons';
import { faMoon } from '@fortawesome/sharp-solid-svg-icons';

// import actions from '@/lib/kbarActions';
import Cmdk from '@/components/Cmdk';
import { useRouter } from 'next/navigation';


export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme='dark'>
      <KBarProvider>
        { children }
      </KBarProvider>
    </ThemeProvider>
  );
}


function KBarProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const themeActions = [
    {
      id:       'lightMode',
      icon:     <FontAwesomeIcon icon={ faSunBright } />,
      name:     'Theme: Light',
      shortcut: ['l'],
      keywords: 'color mode theme',
      perform:  () => (setTheme('light')),
    },
    {
      id:       'darkMode',
      icon:     <FontAwesomeIcon icon={ faMoon } />,
      name:     'Theme: Dark',
      shortcut: ['d'],
      keywords: 'color mode theme',
      perform:  () => (setTheme('dark')),
    },
    {
      id: "home",
      name: "Home",
      shortcut: ["h"],
      keywords: "",
      perform: () => (router.push('/')),
    },
    {
      id: "signin",
      name: "Sign In",
      shortcut: ["s"],
      keywords: "",
      perform: () => (router.push('/signin')),
    },
    // {
    //   id: "resume",
    //   name: "Resume",
    //   shortcut: ["r"],
    //   keywords: "",
    //   perform: () => (router.push('/resume')),
    // },
    // {
    //   id: "projects",
    //   name: "Sanity Projects List",
    //   shortcut: ["p"],
    //   keywords: "",
    //   perform: () => (router.push('/projects')),
    // },
    // {
    //   id: "github-site",
    //   name: "This site on Github",
    //   shortcut: ["g"],
    //   keywords: "",
    //   perform: () => (router.push('https://github.com')),
    // },
  ];


  return (
    <KBar actions={ themeActions }>
      <Cmdk />
      { children }
    </KBar>
  )
}
