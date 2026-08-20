/**
 * Test Utilities
 * 
 * Helper functions and mocks for testing.
 */

import { vi } from 'vitest';

/**
 * Mock Clerk auth function
 */
export function mockClerkAuth(overrides: {
  userId?: string | null;
  orgId?: string | null;
  isSignedIn?: boolean;
} = {}) {
  return vi.fn().mockResolvedValue({
    userId: overrides.userId ?? null,
    orgId: overrides.orgId ?? null,
    redirectToSignIn: vi.fn(() => new Response('Redirect to sign in', { status: 302 })),
  });
}

/**
 * Mock authenticated user
 */
export function mockAuthenticatedUser(userId = 'user_test_123') {
  return mockClerkAuth({
    userId,
    isSignedIn: true,
  });
}

/**
 * Mock admin user
 */
export function mockAdminUser(userId = 'user_mock_admin_123') {
  return mockClerkAuth({
    userId,
    isSignedIn: true,
  });
}

/**
 * Mock unauthenticated user
 */
export function mockUnauthenticatedUser() {
  return mockClerkAuth({
    userId: null,
    isSignedIn: false,
  });
}

/**
 * Mock Astro locals for testing
 */
export function mockAstroLocals(overrides: {
  userId?: string | null;
  isAdmin?: boolean;
  auth?: any;
} = {}) {
  return {
    auth: overrides.auth ?? mockUnauthenticatedUser(),
    userId: overrides.userId ?? null,
    isAdmin: overrides.isAdmin ?? false,
  };
}

/**
 * Mock Convex client
 */
export function mockConvexClient() {
  return {
    query: vi.fn(),
    mutation: vi.fn(),
    action: vi.fn(),
  };
}

/**
 * Mock fetch response
 */
export function mockFetchResponse(data: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  } as Response);
}

/**
 * Mock successful API response
 */
export function mockSuccessResponse(data: any = {}) {
  return mockFetchResponse({ success: true, ...data }, 200);
}

/**
 * Mock error API response
 */
export function mockErrorResponse(error: string, status = 500) {
  return mockFetchResponse({ error }, status);
}

/**
 * Create mock contact message
 */
export function createMockContact(overrides: Partial<{
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  threadId: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  submittedAt: number;
}> = {}) {
  return {
    _id: overrides._id ?? 'contact_123',
    userId: overrides.userId ?? 'user_test_123',
    userEmail: overrides.userEmail ?? 'test@example.com',
    userName: overrides.userName ?? 'Test User',
    subject: overrides.subject ?? 'Test Subject',
    message: overrides.message ?? 'Test message content',
    threadId: overrides.threadId ?? 'thread_123',
    status: overrides.status ?? 'new',
    submittedAt: overrides.submittedAt ?? Date.now(),
  };
}

/**
 * Create mock user
 */
export function createMockUser(overrides: Partial<{
  _id: string;
  clerkId: string;
  email: string;
  canContact: boolean;
  lastContactAt: number;
  contactCount: number;
  createdAt: number;
  updatedAt: number;
}> = {}) {
  const now = Date.now();
  return {
    _id: overrides._id ?? 'user_db_123',
    clerkId: overrides.clerkId ?? 'user_test_123',
    email: overrides.email ?? 'test@example.com',
    canContact: overrides.canContact ?? true,
    lastContactAt: overrides.lastContactAt,
    contactCount: overrides.contactCount ?? 0,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

/**
 * Wait for async updates
 */
export function waitFor(ms: number = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}