/**
 * Vitest Test Setup
 * 
 * Global test configuration and utilities.
 * Runs before all test files.
 */

import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
vi.stubEnv('PUBLIC_CONVEX_URL', 'https://test.convex.cloud');
vi.stubEnv('PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_mock');
vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_mock');
vi.stubEnv('RESEND_API_KEY', 're_mock');
vi.stubEnv('RESEND_FROM_EMAIL', 'test@example.com');
vi.stubEnv('ADMIN_EMAIL', 'admin@example.com');
vi.stubEnv('ADMIN_USER_IDS', 'user_mock_admin_123');
vi.stubEnv('PUBLIC_SITE_URL', 'http://localhost:4321');

// Mock fetch globally for tests
global.fetch = vi.fn();

// Add custom matchers
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid email`
          : `Expected ${received} to be a valid email`,
    };
  },
});

// Extend Vitest's expect types
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidEmail(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeValidEmail(): any;
  }
}