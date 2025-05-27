import { createClient } from "@supabase/supabase-js"
import type { ContactInfo, Course, Testimonial, UserProfile } from "./types"

// Create a service role client with admin privileges
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
)

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

    const { data, error } = await adminClient.from("user_profiles").insert(userProfile).select().single()

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
    const { data, error } = await adminClient
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
      adminClient.from("courses").update({ created_by: null }).eq("created_by", clerkUserId),
      adminClient.from("faculty").update({ created_by: null }).eq("created_by", clerkUserId),
      adminClient.from("testimonials").update({ created_by: null }).eq("created_by", clerkUserId),
      adminClient.from("admission_process").update({ created_by: null }).eq("created_by", clerkUserId),
    ])

    // Then delete the user profile
    const { error } = await adminClient.from("user_profiles").delete().eq("clerk_user_id", clerkUserId)

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
    const { data, error } = await adminClient.from("user_profiles").select("*").eq("clerk_user_id", clerkUserId).single()

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
    const { data, error } = await adminClient.from("user_profiles").select("*").order("created_at", { ascending: false })

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
    const { error } = await adminClient
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
    const { error } = await adminClient
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
// Admin CUD Operations for Courses
export async function createCourse(
  courseData: Omit<Course, "id" | "created_by">,
): Promise<Course | null> {
  try {
    const { data, error } = await adminClient
      .from("courses")
      .insert(courseData)
      .select()
      .single()
    if (error) {
      console.error("Error creating course:", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Create course error:", error)
    return null
  }
}

export async function updateCourse(
  courseId: number,
  updates: Partial<Omit<Course, "id" | "created_by">>,
): Promise<Course | null> {
  try {
    const { data, error } = await adminClient
      .from("courses")
      .update({ ...updates, updated_at: new Date().toISOString() }) // Assuming an updated_at field
      .eq("id", courseId)
      .select()
      .single()
    if (error) {
      console.error("Error updating course:", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Update course error:", error)
    return null
  }
}

export async function deleteCourse(courseId: number): Promise<boolean> {
  try {
    const { error } = await adminClient.from("courses").delete().eq("id", courseId)
    if (error) {
      console.error("Error deleting course:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("Delete course error:", error)
    return false
  }
}

// Admin CUD Operations for Courses
export async function createCourseAdmin(
  courseData: Omit<Course, "id" | "created_by" | "updated_at">, // Assuming created_by and updated_at are auto-managed
): Promise<Course | null> {
  try {
    const { data, error } = await adminClient
      .from("courses")
      .insert(courseData)
      .select()
      .single()
    if (error) {
      console.error("Error creating course (admin):", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Create course error (admin):", error)
    return null
  }
}

export async function updateCourseAdmin(
  courseId: number,
  updates: Partial<Omit<Course, "id" | "created_by" | "updated_at">>,
): Promise<Course | null> {
  try {
    const { data, error } = await adminClient
      .from("courses")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", courseId)
      .select()
      .single()
    if (error) {
      console.error("Error updating course (admin):", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Update course error (admin):", error)
    return null
  }
}

export async function deleteCourseAdmin(courseId: number): Promise<boolean> {
  try {
    const { error } = await adminClient.from("courses").delete().eq("id", courseId)
    if (error) {
      console.error("Error deleting course (admin):", error)
      return false
    }
    return true
  } catch (error) {
    console.error("Delete course error (admin):", error)
    return false
  }
}

// Admin CUD Operations for ContactInfo
// Assuming ContactInfo is a single row table, or we manage by ID if multiple are possible.
// For a single row, update is more common than create/delete unless re-initializing.

export async function updateContactInfoAdmin(
  // Assuming there's only one row of contact info, or we target by a known ID (e.g., 1 if it's fixed)
  contactInfoId: number,
  updates: Partial<Omit<ContactInfo, "id">>
): Promise<ContactInfo | null> {
  try {
    const { data, error } = await adminClient
      .from("contact_info")
      .update(updates)
      .eq("id", contactInfoId) // Or a fixed ID if it's a single-row config table
      .select()
      .single()
    if (error) {
      console.error("Error updating contact info (admin):", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Update contact info error (admin):", error)
    return null
  }
}

// If creation/deletion of contact info entries is needed:
export async function createContactInfoAdmin(
  contactInfoData: Omit<ContactInfo, "id">
): Promise<ContactInfo | null> {
  try {
    const { data, error } = await adminClient
      .from("contact_info")
      .insert(contactInfoData)
      .select()
      .single();
    if (error) {
      console.error("Error creating contact info (admin):", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Create contact info error (admin):", error);
    return null;
  }
}

export async function deleteContactInfoAdmin(contactInfoId: number): Promise<boolean> {
  try {
    const { error } = await adminClient.from("contact_info").delete().eq("id", contactInfoId);
    if (error) {
      console.error("Error deleting contact info (admin):", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Delete contact info error (admin):", error);
    return false;
  }
}


// Admin CUD Operations for Testimonials
export async function createTestimonialAdmin(
  testimonialData: Omit<Testimonial, "id" | "created_by" | "updated_at">,
): Promise<Testimonial | null> {
  try {
    const { data, error } = await adminClient
      .from("testimonials")
      .insert(testimonialData)
      .select()
      .single()
    if (error) {
      console.error("Error creating testimonial (admin):", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Create testimonial error (admin):", error)
    return null
  }
}

export async function updateTestimonialAdmin(
  testimonialId: number,
  updates: Partial<Omit<Testimonial, "id" | "created_by" | "updated_at">>,
): Promise<Testimonial | null> {
  try {
    const { data, error } = await adminClient
      .from("testimonials")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", testimonialId)
      .select()
      .single()
    if (error) {
      console.error("Error updating testimonial (admin):", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Update testimonial error (admin):", error)
    return null
  }
}

export async function deleteTestimonialAdmin(testimonialId: number): Promise<boolean> {
  try {
    const { error } = await adminClient.from("testimonials").delete().eq("id", testimonialId)
    if (error) {
      console.error("Error deleting testimonial (admin):", error)
      return false
    }
    return true
  } catch (error) {
    console.error("Delete testimonial error (admin):", error)
    return false
  }
} 