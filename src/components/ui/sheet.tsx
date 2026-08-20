import type { ComponentProps } from 'react';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import { faXmark } from '@fortawesome/sharp-regular-svg-icons';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


/**
 * Sheet — a right-side sliding panel built on Base UI's Drawer (not Dialog),
 * styled to match the shadcn Sheet API. Dismisses by swiping right.
 */

function Sheet({ ...props }: DrawerPrimitive.Root.Props) {
  return (
    <DrawerPrimitive.Root
      data-slot='sheet'
      swipeDirection='right'
      {...props}
    />
  );
}

function SheetTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot='sheet-trigger' {...props} />;
}

function SheetClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot='sheet-close' {...props} />;
}

function SheetPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot='sheet-portal' {...props} />;
}

function SheetOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot='sheet-overlay'
      className={cn(
        'fixed inset-0 z-50 bg-black/20',
        'data-open:animate-in data-closed:animate-out data-open:fade-in-0 data-closed:fade-out-0 duration-300',
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DrawerPrimitive.Popup.Props & { showCloseButton?: boolean }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DrawerPrimitive.Popup
        data-slot='sheet-content'
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex h-full w-3/4 max-w-sm flex-col bg-background ring-1 ring-foreground/10 outline-none',
          'data-open:animate-in data-closed:animate-out data-open:slide-in-from-right data-closed:slide-out-to-right duration-300',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DrawerPrimitive.Close
            data-slot='sheet-close-button'
            render={
              <Button
                className='absolute top-2 right-2'
                size='icon-sm'
                variant='ghost'
              />
            }
          >
            <Icon icon={faXmark} />
            <span className='sr-only'>Close</span>
          </DrawerPrimitive.Close>
        )}
      </DrawerPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-header'
      className={cn('flex flex-col gap-1 p-4 pr-10', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-footer'
      className={cn('flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot='sheet-title'
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot='sheet-description'
      className={cn('text-muted-foreground text-xs/relaxed', className)}
      {...props}
    />
  );
}


export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
