"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function submitContactForm(formData: FormData) {
  try {
    const contactData = {
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
      status: "new" as const,
    }

    // Validate required fields
    if (
      !contactData.first_name ||
      !contactData.last_name ||
      !contactData.email ||
      !contactData.subject ||
      !contactData.message
    ) {
      return {
        success: false,
        error: "Please fill in all required fields",
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactData.email)) {
      return {
        success: false,
        error: "Please enter a valid email address",
      }
    }

    const { error } = await supabase.from("contact_submissions").insert(contactData)

    if (error) {
      console.error("Error submitting contact form:", error)
      return {
        success: false,
        error: "Failed to submit form. Please try again.",
      }
    }

    revalidatePath("/admin/contacts")

    return {
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    }
  } catch (error) {
    console.error("Contact form submission error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function updateContactStatus(id: number, status: "new" | "in_progress" | "resolved") {
  try {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("Error updating contact status:", error)
      return {
        success: false,
        error: "Failed to update status",
      }
    }

    revalidatePath("/admin/contacts")

    return {
      success: true,
      message: "Status updated successfully",
    }
  } catch (error) {
    console.error("Update contact status error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}
