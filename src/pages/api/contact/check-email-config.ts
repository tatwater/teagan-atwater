/**
 * Email Configuration Check API Route
 * 
 * Diagnostic endpoint to verify email configuration.
 * Returns status of required environment variables (without exposing values).
 */

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Check if user is admin
    const auth = (locals as any).auth?.();
    const userId = auth?.userId;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin (using ADMIN_USER_IDS)
    const adminIds = import.meta.env.ADMIN_USER_IDS?.split(',').map((id: string) => id.trim()) || [];
    const isAdmin = adminIds.includes(userId);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check environment variables
    const resendApiKey = import.meta.env.RESEND_API_KEY;
    const resendFromEmail = import.meta.env.RESEND_FROM_EMAIL;
    const adminEmail = import.meta.env.ADMIN_EMAIL;
    const siteUrl = import.meta.env.PUBLIC_SITE_URL;

    const config = {
      resendApiKey: {
        exists: !!resendApiKey,
        length: resendApiKey?.length || 0,
        startsWithRe: resendApiKey?.startsWith('re_') || false,
      },
      resendFromEmail: {
        exists: !!resendFromEmail,
        value: resendFromEmail || null, // Safe to show email addresses
        isValid: resendFromEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resendFromEmail) : false,
      },
      adminEmail: {
        exists: !!adminEmail,
        value: adminEmail || null, // Safe to show email addresses
        isValid: adminEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) : false,
      },
      siteUrl: {
        exists: !!siteUrl,
        value: siteUrl || null,
      },
      allConfigured: !!(resendApiKey && resendFromEmail && adminEmail && siteUrl),
    };

    return new Response(
      JSON.stringify(config, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Email config check error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to check configuration',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};