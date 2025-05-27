export interface Course {
  id: number
  title: string
  description: string
  duration: string
  fee: number
  features: string[]
  image_url: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface AdmissionStep {
  id: number
  step_number: number
  title: string
  description: string
  icon: string
  is_active: boolean
  created_by?: string
}

export interface SocialMedia {
  platform: string
  url: string
  icon: string
}

export interface ContactInfo {
  id: number
  address: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  email: string
  office_hours: string
  map_url: string
  updated_at: string
  hours: string
  social_media: SocialMedia[]
  image_url: string
}

export interface AboutUs {
  id: number
  mission: string
  vision: string
  history: string
  achievements: string[]
  faculty_count: number
  students_placed: number
  years_experience: number
}

export interface Faculty {
  id: number
  name: string
  designation: string
  qualification: string
  experience_years: number
  subjects: string[]
  image_url: string
  bio: string
  is_active: boolean
  created_by?: string
}

export interface Testimonial {
  id: number
  student_name: string
  course: string
  rating: number
  message: string
  image_url: string
  is_featured: boolean
  created_by?: string
}

export interface HeroSection {
  id: number
  title: string
  subtitle: string
  description: string
  cta_text: string
  cta_link: string
  background_image_url: string
  is_active: boolean
  updated_at: string
}

export interface UserProfile {
  id: number
  clerk_user_id: string
  email: string
  name: string
  role: "admin" | "user"
  is_active: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

export interface ContactSubmission {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  subject: string
  message: string
  status: "new" | "in_progress" | "resolved"
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: number
  user_id: string
  course_id: number
  status: "pending" | "active" | "completed" | "cancelled"
  enrolled_at: string
  completed_at?: string
  progress: number
  created_at: string
  updated_at: string
}
