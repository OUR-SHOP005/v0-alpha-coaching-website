import { createClient } from "@supabase/supabase-js"
import type { UserProfile } from "./types"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  is_active: boolean
  image_url?: string
}

/**
 * Create a new user profile in Supabase
 * This is typically called from the Clerk webhook when a user signs up
 */
export async function signUp(
  clerkUserId: string,
  email: string,
  name: string,
  imageUrl?: string,
): Promise<UserProfile | null> {
  try {
    const userProfile = {
      clerk_user_id: clerkUserId,
      email,
      name,
      role: "user" as const,
      is_active: true,
      image_url: imageUrl || null,
    }

    const { data, error } = await supabase.from("user_profiles").insert(userProfile).select().single()

    if (error) {
      console.error("Error creating user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Sign up error:", error)
    return null
  }
}

/**
 * Update user profile information
 * This can be called from the Clerk webhook or from user profile management
 */
export async function updateProfile(
  clerkUserId: string,
  updates: {
    email?: string
    name?: string
    image_url?: string
    role?: "admin" | "user"
    is_active?: boolean
  },
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("clerk_user_id", clerkUserId)
      .select()
      .single()

    if (error) {
      console.error("Error updating user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Update profile error:", error)
    return null
  }
}

/**
 * Delete user and all associated data
 * This is typically called from the Clerk webhook when a user is deleted
 */
export async function deleteUser(clerkUserId: string): Promise<boolean> {
  try {
    // First, clean up any content created by the user
    await Promise.all([
      supabase.from("courses").update({ created_by: null }).eq("created_by", clerkUserId),
      supabase.from("faculty").update({ created_by: null }).eq("created_by", clerkUserId),
      supabase.from("testimonials").update({ created_by: null }).eq("created_by", clerkUserId),
      supabase.from("admission_process").update({ created_by: null }).eq("created_by", clerkUserId),
    ])

    // Then delete the user profile
    const { error } = await supabase.from("user_profiles").delete().eq("clerk_user_id", clerkUserId)

    if (error) {
      console.error("Error deleting user:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Delete user error:", error)
    return false
  }
}

/**
 * Get user profile by Clerk user ID
 */
export async function getUserProfile(clerkUserId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("clerk_user_id", clerkUserId).single()

    if (error) return null
    return data
  } catch (error) {
    console.error("Get user profile error:", error)
    return null
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Get all users error:", error)
    return []
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(clerkUserId: string, role: "admin" | "user"): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("clerk_user_id", clerkUserId)

    if (error) {
      console.error("Error updating user role:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Update user role error:", error)
    return false
  }
}

/**
 * Deactivate/activate user (admin only)
 */
export async function toggleUserStatus(clerkUserId: string, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("clerk_user_id", clerkUserId)

    if (error) {
      console.error("Error toggling user status:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Toggle user status error:", error)
    return false
  }
}
