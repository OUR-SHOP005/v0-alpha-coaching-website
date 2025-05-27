"use client"

import { useSupabase } from "@/components/supabase-provider"
import type { UserProfile } from "@/lib/types"
import { useSession, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export function useUserProfile() {
  const { user, isLoaded: userLoaded } = useUser()
  const { session } = useSession()
  const supabase = useSupabase()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoaded || !user || !session) {
      setLoading(false)
      return
    }

    async function loadProfile() {
      try {
        setLoading(true)
        const userId = user?.id

        if (!userId) {
          setLoading(false)
          return
        }

        // Get existing profile (should exist due to webhook)
        const { data, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("clerk_user_id", userId)
          .single<UserProfile>()

        if (profileError || !data) {
          // If profile doesn't exist, it might be a timing issue with the webhook
          // In this case, we'll wait a bit and try again
          setTimeout(async () => {
            const { data: retryData } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("clerk_user_id", userId)
              .single<UserProfile>()

            if (retryData) {
              setProfile(retryData)
            }
            setLoading(false)
          }, 2000)
          return
        }

        setProfile(data)
      } catch (err) {
        console.error("Error loading user profile:", err)
        setError("Failed to load user profile")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, userLoaded, session, supabase])

  const isAdmin = profile?.role === "admin"

  const refreshProfile = async () => {
    if (!user) return
    const userId = user.id

    try {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("clerk_user_id", userId)
        .single<UserProfile>()

      if (data) {
        setProfile(data)
      }
    } catch (err) {
      console.error("Error refreshing profile:", err)
    }
  }

  return {
    profile,
    loading,
    error,
    isAdmin,
    refreshProfile,
    getToken: () => session?.getToken({ template: "supabase" }) || Promise.resolve(null),
  }
}
