import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client for public access (no auth required)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a Supabase client with Clerk session token for server-side usage
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    async accessToken() {
      try {
        const clerkAuth = await auth();
        if (!clerkAuth || !clerkAuth.getToken) {
          // console.warn("Clerk auth object or getToken method not available.");
          return null;
        }
        const token = await clerkAuth.getToken({ template: "supabase" });
        return token ?? null;
      } catch (error) {
        // Handle cases where auth() might not be available or error during token retrieval
        // console.warn("Error fetching Clerk token for Supabase in server component. This might be expected during build.", error);
        return null;
      }
    },
  })
}
