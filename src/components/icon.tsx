import type { ComponentProps } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


interface IconProps extends Omit<ComponentProps<typeof FontAwesomeIcon>, 'icon'> {
  icon: IconDefinition;
}


config.autoAddCss = false;


export function Icon({
  icon,
  ...props
}: IconProps) {
  return (
    <FontAwesomeIcon icon={icon} {...props} />
  );
}
