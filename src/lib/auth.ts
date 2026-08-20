/**
 * Authentication Helpers
 * 
 * Provides utilities for Clerk authentication in Astro.
 * Supports role checking, user info extraction, and authorization.
 */

import type { AstroGlobal } from 'astro';

/**
 * Check if the current user is an admin
 * Checks against ADMIN_USER_IDS environment variable
 */
export function isAdmin(userId: string | null | undefined): boolean {
  if (!userId) return false;
  
  const adminIds = import.meta.env.ADMIN_USER_IDS?.split(',').map((id: string) => id.trim()) || [];
  return adminIds.includes(userId);
}

/**
 * Check if user has access to content based on visibility rules
 */
export function canAccessContent(
  content: {
    published: boolean;
    groups?: string[];
  },
  userGroups: string[] = [],
  isUserAdmin: boolean = false
): boolean {
  // Admin can see everything
  if (isUserAdmin) {
    return true;
  }

  // Unpublished content is admin-only
  if (!content.published) {
    return false;
  }

  // If no groups specified, content is public
  if (!content.groups || content.groups.length === 0) {
    return true;
  }

  // Check if user belongs to any required group
  return content.groups.some(group => userGroups.includes(group));
}

/**
 * Extract user info from Astro locals
 * Assumes Clerk middleware has run and populated locals.auth
 */
export function getUserInfo(locals: AstroGlobal['locals']) {
  const auth = (locals as any).auth?.();
  
  if (!auth) {
    return {
      isAuthenticated: false,
      userId: null,
      isAdmin: false,
      userGroups: [],
    };
  }

  const userId = auth.userId;
  const userIsAdmin = isAdmin(userId);
  
  // Get user's organization memberships / groups from Clerk
  // This will be populated by Clerk middleware
  const userGroups: string[] = auth.orgId ? [auth.orgId] : [];

  return {
    isAuthenticated: !!userId,
    userId,
    isAdmin: userIsAdmin,
    userGroups,
  };
}

/**
 * Require authentication - throws if not authenticated
 */
export function requireAuth(locals: AstroGlobal['locals']) {
  const userInfo = getUserInfo(locals);
  
  if (!userInfo.isAuthenticated) {
    throw new Error('Authentication required');
  }

  return userInfo;
}

/**
 * Require admin access - throws if not admin
 */
export function requireAdmin(locals: AstroGlobal['locals']) {
  const userInfo = requireAuth(locals);
  
  if (!userInfo.isAdmin) {
    throw new Error('Admin access required');
  }

  return userInfo;
}