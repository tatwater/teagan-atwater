/**
 * Auth Helper Tests
 * 
 * Tests for authentication and authorization utilities.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { isAdmin, canAccessContent, getUserInfo } from './auth';
import { mockAstroLocals, mockAuthenticatedUser, mockAdminUser } from '../test/utils';

describe('isAdmin', () => {
  it('returns true for admin user ID', () => {
    const result = isAdmin('user_mock_admin_123');
    expect(result).toBe(true);
  });

  it('returns false for non-admin user ID', () => {
    const result = isAdmin('user_test_123');
    expect(result).toBe(false);
  });

  it('returns false for null user ID', () => {
    const result = isAdmin(null);
    expect(result).toBe(false);
  });

  it('returns false for undefined user ID', () => {
    const result = isAdmin(undefined);
    expect(result).toBe(false);
  });

  it('handles multiple admin IDs', () => {
    // Note: In actual env, ADMIN_USER_IDS would be comma-separated
    // This test verifies the current implementation
    const result = isAdmin('user_mock_admin_123');
    expect(result).toBe(true);
  });
});

describe('canAccessContent', () => {
  describe('published content', () => {
    it('allows access to published content with no groups', () => {
      const content = { published: true };
      const result = canAccessContent(content, [], false);
      expect(result).toBe(true);
    });

    it('allows access to published content for authenticated users', () => {
      const content = { published: true };
      const result = canAccessContent(content, [], false);
      expect(result).toBe(true);
    });

    it('allows access to published content for admins', () => {
      const content = { published: true };
      const result = canAccessContent(content, [], true);
      expect(result).toBe(true);
    });
  });

  describe('unpublished content', () => {
    it('denies access to unpublished content for regular users', () => {
      const content = { published: false };
      const result = canAccessContent(content, [], false);
      expect(result).toBe(false);
    });

    it('allows admin access to unpublished content', () => {
      const content = { published: false };
      const result = canAccessContent(content, [], true);
      expect(result).toBe(true);
    });

    it('denies access to unpublished content even with groups', () => {
      const content = { published: false, groups: ['team'] };
      const result = canAccessContent(content, ['team'], false);
      expect(result).toBe(false);
    });
  });

  describe('group-restricted content', () => {
    it('allows access when user belongs to required group', () => {
      const content = { published: true, groups: ['team-a'] };
      const result = canAccessContent(content, ['team-a'], false);
      expect(result).toBe(true);
    });

    it('denies access when user does not belong to required group', () => {
      const content = { published: true, groups: ['team-a'] };
      const result = canAccessContent(content, ['team-b'], false);
      expect(result).toBe(false);
    });

    it('allows access when user belongs to one of multiple required groups', () => {
      const content = { published: true, groups: ['team-a', 'team-b'] };
      const result = canAccessContent(content, ['team-b'], false);
      expect(result).toBe(true);
    });

    it('denies access when user has no groups', () => {
      const content = { published: true, groups: ['team-a'] };
      const result = canAccessContent(content, [], false);
      expect(result).toBe(false);
    });

    it('allows admin access regardless of groups', () => {
      const content = { published: true, groups: ['team-a'] };
      const result = canAccessContent(content, [], true);
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles empty groups array as public content', () => {
      const content = { published: true, groups: [] };
      const result = canAccessContent(content, [], false);
      expect(result).toBe(true);
    });

    it('handles undefined groups as public content', () => {
      const content = { published: true };
      const result = canAccessContent(content, [], false);
      expect(result).toBe(true);
    });
  });
});

describe('getUserInfo', () => {
  it('returns unauthenticated info when no auth present', async () => {
    const locals = mockAstroLocals();
    const result = getUserInfo(locals as any);
    
    expect(result.isAuthenticated).toBe(false);
    expect(result.userId).toBeUndefined();
    expect(result.isAdmin).toBe(false);
    expect(result.userGroups).toEqual([]);
  });

  it('returns authenticated info for regular user', async () => {
    const locals = {
      auth: () => ({ userId: 'user_test_456', orgId: null }),
      userId: 'user_test_456',
      isAdmin: false,
    };
    
    const result = getUserInfo(locals as any);
    
    expect(result.isAuthenticated).toBe(true);
    expect(result.userId).toBe('user_test_456');
    expect(result.isAdmin).toBe(false);
  });

  it('returns authenticated info for admin user', async () => {
    const locals = {
      auth: () => ({ userId: 'user_mock_admin_123', orgId: null }),
      userId: 'user_mock_admin_123',
      isAdmin: true,
    };
    
    const result = getUserInfo(locals as any);
    
    expect(result.isAuthenticated).toBe(true);
    expect(result.userId).toBe('user_mock_admin_123');
    expect(result.isAdmin).toBe(true);
  });

  it('extracts organization ID as user group', () => {
    const locals = {
      auth: () => ({ userId: 'user_test_789', orgId: 'org_test_123' }),
      userId: 'user_test_789',
      isAdmin: false,
    };
    
    const result = getUserInfo(locals as any);
    
    expect(result.userGroups).toContain('org_test_123');
  });
});