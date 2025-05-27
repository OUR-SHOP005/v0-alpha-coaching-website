"use client"

import { useSession } from "@clerk/nextjs"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { createContext, useContext, useMemo } from "react"

interface SupabaseContextType {
    supabase: SupabaseClient<any, "public", any> // Using SupabaseClient type for better type safety
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const { session } = useSession()

    const supabase = useMemo(() => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

        return createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
            },
            async accessToken() {
                if (session) {
                    const token = await session.getToken()
                    return token ?? null
                }
                return null
            },
        })
    }, [session])

    return (
        <SupabaseContext.Provider value={{ supabase }}>
            {children}
        </SupabaseContext.Provider>
    )
}

export function useSupabase() {
    const context = useContext(SupabaseContext)
    if (context === undefined) {
        throw new Error("useSupabase must be used within a SupabaseProvider")
    }
    return context.supabase
} 