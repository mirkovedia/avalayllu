import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

const nullClient = {
  from: () => ({ select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: null, error: null }) }), eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
  rpc: () => Promise.resolve({ data: null, error: null }),
} as unknown as SupabaseClient;

export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : nullClient;

export const supabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || !isConfigured) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada");
  }
  return createClient(supabaseUrl, serviceRoleKey);
};

export { isConfigured as isSupabaseConfigured };
