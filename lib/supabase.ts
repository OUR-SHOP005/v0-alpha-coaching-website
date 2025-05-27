import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client for public access (no auth required)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a Supabase client with Clerk session token
export function createClerkSupabaseClient(getToken: () => Promise<string | null>) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      // Get the custom Supabase token from Clerk
      fetch: async (url, options = {}) => {
        const clerkToken = await getToken()

        // Insert the Clerk Supabase token into the headers
        const headers = new Headers(options?.headers)
        if (clerkToken) {
          headers.set("Authorization", `Bearer ${clerkToken}`)
        }

        // Now call the default fetch
        return fetch(url, {
          ...options,
          headers,
        })
      },
    },
  })
}
