/**
 * Content Utility Tests
 * 
 * Tests for content collection visibility and filtering logic.
 */

import { describe, it, expect } from 'vitest';
import { canAccessContent } from './auth';

describe('Content Visibility', () => {
  describe('public content', () => {
    it('allows access to published content without groups', () => {
      const content = { published: true };
      expect(canAccessContent(content, [], false)).toBe(true);
    });

    it('allows unauthenticated access to public content', () => {
      const content = { published: true };
      expect(canAccessContent(content, [], false)).toBe(true);
    });

    it('allows authenticated access to public content', () => {
      const content = { published: true };
      expect(canAccessContent(content, [], false)).toBe(true);
    });
  });

  describe('draft content', () => {
    it('hides drafts from unauthenticated users', () => {
      const content = { published: false };
      expect(canAccessContent(content, [], false)).toBe(false);
    });

    it('hides drafts from authenticated non-admin users', () => {
      const content = { published: false };
      expect(canAccessContent(content, ['some-group'], false)).toBe(false);
    });

    it('shows drafts to admin users', () => {
      const content = { published: false };
      expect(canAccessContent(content, [], true)).toBe(true);
    });

    it('shows drafts to admin users even with group restrictions', () => {
      const content = { published: false, groups: ['private'] };
      expect(canAccessContent(content, [], true)).toBe(true);
    });
  });

  describe('group-restricted content', () => {
    it('allows access for users in required group', () => {
      const content = { published: true, groups: ['team-alpha'] };
      expect(canAccessContent(content, ['team-alpha'], false)).toBe(true);
    });

    it('denies access for users not in required group', () => {
      const content = { published: true, groups: ['team-alpha'] };
      expect(canAccessContent(content, ['team-beta'], false)).toBe(false);
    });

    it('allows access if user belongs to any of multiple groups', () => {
      const content = { published: true, groups: ['team-alpha', 'team-beta', 'team-gamma'] };
      expect(canAccessContent(content, ['team-beta', 'team-delta'], false)).toBe(true);
    });

    it('denies access if user has no matching groups', () => {
      const content = { published: true, groups: ['team-alpha', 'team-beta'] };
      expect(canAccessContent(content, ['team-gamma'], false)).toBe(false);
    });

    it('denies access if user has no groups at all', () => {
      const content = { published: true, groups: ['team-alpha'] };
      expect(canAccessContent(content, [], false)).toBe(false);
    });

    it('allows admin access regardless of groups', () => {
      const content = { published: true, groups: ['team-alpha'] };
      expect(canAccessContent(content, ['team-beta'], true)).toBe(true);
    });

    it('allows admin access with no groups', () => {
      const content = { published: true, groups: ['team-alpha'] };
      expect(canAccessContent(content, [], true)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('treats empty groups array as public', () => {
      const content = { published: true, groups: [] };
      expect(canAccessContent(content, [], false)).toBe(true);
    });

    it('treats undefined groups as public', () => {
      const content = { published: true, groups: undefined };
      expect(canAccessContent(content, [], false)).toBe(true);
    });

    it('handles missing published field as false', () => {
      const content = {} as any;
      // This should fail safely - unpublished by default
      expect(canAccessContent(content, [], false)).toBe(false);
    });
  });

  describe('complex scenarios', () => {
    it('handles user in multiple groups with multi-group content', () => {
      const content = { published: true, groups: ['team-alpha', 'team-beta'] };
      const userGroups = ['team-alpha', 'team-gamma', 'team-delta'];
      expect(canAccessContent(content, userGroups, false)).toBe(true);
    });

    it('prioritizes admin status over all other rules', () => {
      const draftGroupContent = { published: false, groups: ['secret'] };
      expect(canAccessContent(draftGroupContent, [], true)).toBe(true);
    });

    it('requires both published AND group membership for restricted content', () => {
      const content = { published: true, groups: ['team-alpha'] };
      expect(canAccessContent(content, ['team-beta'], false)).toBe(false);
    });
  });
});

describe('Content Filtering Scenarios', () => {
  const mockProjects = [
    { title: 'Public Project', published: true },
    { title: 'Draft Project', published: false },
    { title: 'Team Alpha Project', published: true, groups: ['team-alpha'] },
    { title: 'Team Beta Project', published: true, groups: ['team-beta'] },
    { title: 'Multi Group Project', published: true, groups: ['team-alpha', 'team-gamma'] },
  ];

  it('filters correctly for unauthenticated users', () => {
    const visible = mockProjects.filter(project => 
      canAccessContent(project, [], false)
    );
    expect(visible).toHaveLength(1);
    expect(visible[0].title).toBe('Public Project');
  });

  it('filters correctly for authenticated user with no groups', () => {
    const visible = mockProjects.filter(project => 
      canAccessContent(project, [], false)
    );
    expect(visible).toHaveLength(1);
    expect(visible[0].title).toBe('Public Project');
  });

  it('filters correctly for team-alpha member', () => {
    const visible = mockProjects.filter(project => 
      canAccessContent(project, ['team-alpha'], false)
    );
    expect(visible).toHaveLength(3);
    expect(visible.map(p => p.title)).toContain('Public Project');
    expect(visible.map(p => p.title)).toContain('Team Alpha Project');
    expect(visible.map(p => p.title)).toContain('Multi Group Project');
  });

  it('filters correctly for team-beta member', () => {
    const visible = mockProjects.filter(project => 
      canAccessContent(project, ['team-beta'], false)
    );
    expect(visible).toHaveLength(2);
    expect(visible.map(p => p.title)).toContain('Public Project');
    expect(visible.map(p => p.title)).toContain('Team Beta Project');
  });

  it('admin sees everything', () => {
    const visible = mockProjects.filter(project => 
      canAccessContent(project, [], true)
    );
    expect(visible).toHaveLength(5);
  });
});