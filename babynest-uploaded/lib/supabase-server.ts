import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client that reads auth from cookies.
 * Use this in API routes to verify the user is authenticated.
 */
export const getServerSupabase = () => {
  return createRouteHandlerClient({ cookies });
};

/**
 * Admin client with service role key — bypasses RLS.
 * NEVER expose this to the client. Only use for admin operations
 * AFTER verifying user identity via getServerSupabase().
 */
export const getAdminSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin credentials');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

/**
 * Get the authenticated user from the request.
 * Returns null if not authenticated.
 */
export const getAuthUser = async () => {
  const supabase = getServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
};

/**
 * Require authentication — returns user or throws.
 * Use in API routes.
 */
export const requireAuth = async () => {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
};
