import { faArrowUpRightFromSquare } from '@fortawesome/sharp-regular-svg-icons';
import { getInitials } from '@/islands/resume/helpers';
import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';


export function OrgBadge({
  logoShape = 'circle',
  logoSrc,
  organization,
  organizationUrl,
  size = 'default',
}: {
  organization: string;
  organizationUrl?: string;
  logoShape?: 'circle' | 'square' | 'squircle';
  logoSrc?: string;
  size?: 'sm' | 'default';
}) {
  const resolvedSrc = logoSrc
    ? `/src/assets/logos/${logoSrc}`
    : undefined;

  if (organizationUrl) {
    return (
      <a
        className={cn(
          'inline-flex items-center px-2 py-1',
          'text-sm text-muted-foreground',
          'hover:text-foreground hover:bg-secondary/50',
          'group/orglink transition-all',
          size === 'sm' ? 'gap-1.5' : 'gap-2',
        )}
        href={organizationUrl}
        onClick={(e) => e.stopPropagation()}
        rel='noopener noreferrer'
        target='_blank'
        title={`Visit ${organization}`}
      >
        <Avatar
          alt={organization}
          fallback={getInitials(organization)}
          shape={logoShape}
          size={size === 'sm' ? 'sm' : 'default'}
          src={resolvedSrc}
        />
        <span className={cn(
          'leading-none',
          size === 'sm' ? 'font-normal' : 'font-medium',
        )}>
          {organization}
        </span>
        <Icon
          className='text-[10px] opacity-0 group-hover/orglink:opacity-100 transition-opacity'
          icon={faArrowUpRightFromSquare}
        />
      </a>
    );
  }

  return (
    <div className='inline-flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground'>
      <Avatar
        alt={organization}
        fallback={getInitials(organization)}
        shape={logoShape}
        size={size === 'sm' ? 'sm' : 'default'}
        src={resolvedSrc}
      />
      <span className='leading-none'>
        {organization}
      </span>
    </div>
  );
}
