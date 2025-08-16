// Server-only Supabase client (service role). Do NOT import this in client components.
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Load environment variables
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
if (!serviceKey) throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");

// Singleton instance to avoid recreating client
let client: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (!client) {
    client = createClient(url!, serviceKey!, {
      auth: {
        persistSession: false, // no session persistence on server
        autoRefreshToken: false, // no auto refresh on server
      },
    });
  }
  return client;
}