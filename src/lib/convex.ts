/**
 * Convex Client Helper
 * 
 * Provides utilities for integrating Convex with Astro.
 * Supports both server-side and client-side usage.
 */

import { ConvexHttpClient } from "convex/browser";
import { PUBLIC_CONVEX_URL } from "astro:env/client";

/**
 * Server-side Convex client
 * Use this in Astro components and API routes
 */
export function getConvexClient() {
  const convexUrl = PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("PUBLIC_CONVEX_URL environment variable is not set");
  }

  return new ConvexHttpClient(convexUrl);
}
