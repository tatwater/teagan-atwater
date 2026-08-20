import { Avatar as AvatarRoot, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


export function Avatar(props: {
  alt: string;
  fallback: string;
  src: string | undefined;
  shape?: 'circle' | 'square' | 'squircle';
  size?: 'default' | 'sm' | 'lg' | 'xl';
}) {
  const shapeClass = cn(
    props.shape === 'circle'
      ? 'rounded-full after:rounded-full'
      : props.shape === 'squircle'
        ? 'corner-squircle after:corner-squircle'
        : 'rounded-none after:rounded-none',
  );

  return (
    <AvatarRoot
      className={shapeClass}
      size={props.size}
    >
      <AvatarImage
        alt={props.alt}
        className={shapeClass}
        src={props.src}
      />
      <AvatarFallback
        className={shapeClass}
      >
        {props.fallback}
      </AvatarFallback>
    </AvatarRoot>
  );
}
