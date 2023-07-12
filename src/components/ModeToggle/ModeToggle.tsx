'use client';

import { useTheme } from 'next-themes'
import * as Select from '@radix-ui/react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faDisplay, faSunBright } from '@fortawesome/sharp-regular-svg-icons';
import { faMoon } from '@fortawesome/sharp-solid-svg-icons';

import styles from './ModeToggle.module.css';


export default function ModeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme();

  const resolvedIcon: { [key: string]: IconDefinition } = {
    light: faSunBright,
    dark:  faMoon,
  };


  return (
    <Select.Root
      onValueChange={(value: string) => setTheme(value) }
      value={ theme }
    >
      <Select.Trigger className={ styles.trigger }>
        <Select.Value>
          { resolvedTheme && <FontAwesomeIcon icon={ resolvedIcon[resolvedTheme] } fixedWidth /> }
        </Select.Value>
      </Select.Trigger>
      <Select.Portal className={ styles.portal }>
        <Select.Content align='center' position='popper' sideOffset={ -37 }>
          <Select.Viewport className={ styles.viewport }>
            <Select.Group className={ styles.group }>
              <Select.Item className={ styles.item } value='light'>
                <Select.ItemText>
                  <FontAwesomeIcon icon={ faSunBright } fixedWidth />
                </Select.ItemText>
              </Select.Item>
              <Select.Item className={ styles.item } value='dark'>
                <Select.ItemText>
                  <FontAwesomeIcon icon={ faMoon } fixedWidth />
                </Select.ItemText>
              </Select.Item>
            </Select.Group>
            <Select.Group className={ styles.group }>
              <Select.Item className={ `${ styles.item } text-sm` } value='system'>
                <Select.ItemText>
                  <FontAwesomeIcon icon={ faDisplay } fixedWidth />
                </Select.ItemText>
              </Select.Item>
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
