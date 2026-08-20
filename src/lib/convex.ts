/**
 * Convex Client Helper
 * 
 * Provides utilities for integrating Convex with Astro.
 * Supports both server-side and client-side usage.
 */

import { ConvexHttpClient } from "convex/browser";

/**
 * Server-side Convex client
 * Use this in Astro components and API routes
 */
export function getConvexClient() {
  const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    throw new Error("PUBLIC_CONVEX_URL environment variable is not set");
  }

  return new ConvexHttpClient(convexUrl);
}
