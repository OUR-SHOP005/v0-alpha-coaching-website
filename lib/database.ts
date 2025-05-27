import { supabase } from "./supabase"
import type {
  AboutUs,
  AdmissionStep,
  ContactInfo,
  Course,
  Faculty,
  HeroSection,
  Testimonial
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

// These functions have been moved to the useUserProfile hook or specific components
// that use the client-side Supabase provider directly.
// The server-side admin functions remain in auth.ts.
