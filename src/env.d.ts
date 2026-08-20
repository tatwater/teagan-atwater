/// <reference path='../.astro/types.d.ts' />
/// <reference types='astro/client' />

declare namespace App {
  interface Locals {
    auth: import('@clerk/astro/server').AuthFn;
    isAdmin?: boolean;
    userId?: string | null;
  }
}
