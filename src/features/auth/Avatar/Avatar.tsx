import * as RadixAvatar from '@radix-ui/react-avatar';

import getInitialsFromName from '@/utils/getInitialsFromName';

import styled from './Avatar.module.scss';


type Props = {
  image:   string;
  name:    string;
  sizeREM: string;
}


export default function Avatar({
  image,
  name,
  sizeREM,
}: Props) {
  const initials = getInitialsFromName(name);
  

  return (
    <RadixAvatar.Root
      className={ styled.root }
      style={{
        fontSize: `${ parseFloat(sizeREM) / 2 }rem`,
        width: `${ sizeREM }rem`,
      }}
    >
      <RadixAvatar.Image
        alt={ name }
        className={ styled.image }
        src={ image }
      />
      <RadixAvatar.Fallback className={ styled.fallback }>
        { initials }
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
