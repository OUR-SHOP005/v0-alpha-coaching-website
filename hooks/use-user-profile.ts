"use client"

import { useUser, useSession } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { getUserProfile } from "@/lib/database"
import type { UserProfile } from "@/lib/types"

export function useUserProfile() {
  const { user, isLoaded: userLoaded } = useUser()
  const { session } = useSession()
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
        const getToken = () => session.getToken({ template: "supabase" })

        // Get existing profile (should exist due to webhook)
        const userProfile = await getUserProfile(getToken, user.id)

        if (!userProfile) {
          // If profile doesn't exist, it might be a timing issue with the webhook
          // In this case, we'll wait a bit and try again
          setTimeout(async () => {
            const retryProfile = await getUserProfile(getToken, user.id)
            setProfile(retryProfile)
            setLoading(false)
          }, 2000)
          return
        }

        setProfile(userProfile)
      } catch (err) {
        console.error("Error loading user profile:", err)
        setError("Failed to load user profile")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, userLoaded, session])

  const isAdmin = profile?.role === "admin"

  const refreshProfile = async () => {
    if (!user || !session) return

    try {
      const getToken = () => session.getToken({ template: "supabase" })
      const userProfile = await getUserProfile(getToken, user.id)
      setProfile(userProfile)
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
