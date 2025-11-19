import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: { id: string; email: string | null } | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: { id: string; email: string | null } | null = null;

  console.log('[Auth] Creating context...');
  console.log('[Auth] SUPABASE_URL:', supabaseUrl);
  console.log('[Auth] SUPABASE_SERVICE_KEY exists:', !!supabaseServiceKey);
  console.log('[Auth] SUPABASE_SERVICE_KEY length:', supabaseServiceKey?.length);

  try {
    // Get JWT token from Authorization header
    const authHeader = opts.req.headers.authorization;
    console.log('[Auth] Authorization header exists:', !!authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('[Auth] Token extracted, length:', token.length);
      console.log('[Auth] Token first 50 chars:', token.substring(0, 50));
      
      // Verify JWT with Supabase
      console.log('[Auth] Calling supabase.auth.getUser...');
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
      
      console.log('[Auth] Supabase response error:', error);
      console.log('[Auth] Supabase user:', supabaseUser);
      
      if (!error && supabaseUser) {
        user = {
          id: supabaseUser.id, // Use UUID directly
          email: supabaseUser.email || null,
        };
        console.log('[Auth] ✅ User authenticated:', user.id);
      } else {
        console.log('[Auth] ❌ Authentication failed:', error?.message);
      }
    } else {
      console.log('[Auth] ❌ No Bearer token in header');
    }
  } catch (error) {
    console.error('[Auth] ❌ Exception during auth:', error);
    user = null;
  }

  console.log('[Auth] Final user:', user);
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
