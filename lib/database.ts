import { supabase, createClerkSupabaseClient } from "./supabase"
import type {
  Course,
  AdmissionStep,
  ContactInfo,
  AboutUs,
  Faculty,
  Testimonial,
  HeroSection,
  UserProfile,
} from "./types"

// Public data fetching functions (no auth required)
export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase.from("courses").select("*").eq("is_active", true).order("id")

  if (error) throw error
  return data || []
}

export async function getAdmissionProcess(): Promise<AdmissionStep[]> {
  const { data, error } = await supabase
    .from("admission_process")
    .select("*")
    .eq("is_active", true)
    .order("step_number")

  if (error) throw error
  return data || []
}

export async function getContactInfo(): Promise<ContactInfo | null> {
  const { data, error } = await supabase.from("contact_info").select("*").limit(1).single()

  if (error) return null
  return data
}

export async function getAboutUs(): Promise<AboutUs | null> {
  const { data, error } = await supabase.from("about_us").select("*").limit(1).single()

  if (error) return null
  return data
}

export async function getFaculty(): Promise<Faculty[]> {
  const { data, error } = await supabase.from("faculty").select("*").eq("is_active", true).order("id")

  if (error) throw error
  return data || []
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getHeroSection(): Promise<HeroSection | null> {
  const { data, error } = await supabase.from("hero_section").select("*").eq("is_active", true).limit(1).single()

  if (error) return null
  return data
}

// User profile functions
export async function createUserProfile(
  getToken: () => Promise<string | null>,
  profile: Omit<UserProfile, "id" | "created_at" | "updated_at">,
): Promise<UserProfile | null> {
  const client = createClerkSupabaseClient(getToken)
  const { data, error } = await client.from("user_profiles").insert(profile).select().single()

  if (error) {
    console.error("Error creating user profile:", error)
    return null
  }
  return data
}

export async function getUserProfile(
  getToken: () => Promise<string | null>,
  clerkUserId: string,
): Promise<UserProfile | null> {
  const client = createClerkSupabaseClient(getToken)
  const { data, error } = await client.from("user_profiles").select("*").eq("clerk_user_id", clerkUserId).single()

  if (error) return null
  return data
}

export async function updateUserProfile(
  getToken: () => Promise<string | null>,
  clerkUserId: string,
  updates: Partial<UserProfile>,
): Promise<void> {
  const client = createClerkSupabaseClient(getToken)
  const { error } = await client
    .from("user_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("clerk_user_id", clerkUserId)

  if (error) throw error
}

// Admin functions for content management
export async function createCourse(
  getToken: () => Promise<string | null>,
  course: Omit<Course, "id" | "created_by">,
): Promise<void> {
  const client = createClerkSupabaseClient(getToken)
  const { error } = await client.from("courses").insert(course)

  if (error) throw error
}

export async function updateCourse(
  getToken: () => Promise<string | null>,
  id: number,
  course: Partial<Course>,
): Promise<void> {
  const client = createClerkSupabaseClient(getToken)
  const { error } = await client
    .from("courses")
    .update({ ...course, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export async function deleteCourse(getToken: () => Promise<string | null>, id: number): Promise<void> {
  const client = createClerkSupabaseClient(getToken)
  const { error } = await client.from("courses").delete().eq("id", id)

  if (error) throw error
}

export async function createFaculty(
  getToken: () => Promise<string | null>,
  faculty: Omit<Faculty, "id" | "created_by">,
): Promise<void> {
  const client = createClerkSupabaseClient(getToken)
  const { error } = await client.from("faculty").insert(faculty)

  if (error) throw error
}

export async function updateFaculty(
  getToken: () => Promise<string | null>,
  id: number,
  faculty: Partial<Faculty>,
): Promise<void> {
  const client = createClerkSupabaseClient(getToken)
  const { error } = await client.from("faculty").update(faculty).eq("id", id)

  if (error) throw error
}

export async function deleteFaculty(getToken: () => Promise<string | null>, id: number): Promise<void> {
  const client = createClerkSupabaseClient(getToken)
  const { error } = await client.from("faculty").delete().eq("id", id)

  if (error) throw error
}

export async function createTestimonial(
  getToken: () => Promise<string | null>,
  testimonial: Omit<Testimonial, "id" | "created_by">,
): Promise<void> {
  const client = createClerkSupabaseClient(getToken)
  const { error } = await client.from("testimonials").insert(testimonial)

  if (error) throw error
}

export async function updateTestimonial(
  getToken: () => Promise<string | null>,
  id: number,
  testimonial: Partial<Testimonial>,
): Promise<void> {
  const client = createClerkSupabaseClient(getToken)
  const { error } = await client.from("testimonials").update(testimonial).eq("id", id)

  if (error) throw error
}

export async function deleteTestimonial(getToken: () => Promise<string | null>, id: number): Promise<void> {
  const client = createClerkSupabaseClient(getToken)
  const { error } = await client.from("testimonials").delete().eq("id", id)

  if (error) throw error
}
