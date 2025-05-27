import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { Webhook } from "svix"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occured", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data)
        break
      case "user.updated":
        await handleUserUpdated(evt.data)
        break
      case "user.deleted":
        await handleUserDeleted(evt.data)
        break
      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ message: "Webhook processed successfully" })
  } catch (error) {
    console.error(`Error processing webhook ${eventType}:`, error)
    return new Response("Error processing webhook", { status: 500 })
  }
}

async function handleUserCreated(userData: any) {
  const { id, email_addresses, first_name, last_name, image_url } = userData

  const primaryEmail = email_addresses.find((email: any) => email.id === userData.primary_email_address_id)

  if (!primaryEmail) {
    console.error("No primary email found for user:", id)
    return
  }
  const email=primaryEmail.email_address
 const AdminEmails = ["ourshop005@gmail.com", "utkarshchaudhary426@gmail.com"];

const userProfile = {
  clerk_user_id: id,
  email: email,
  name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
  role: AdminEmails.includes(email) ? "admin" as const : "user" as const,
  is_active: true,
  image_url: image_url || null,
};

  const { error } = await supabase.from("user_profiles").insert(userProfile)

  if (error) {
    console.error("Error creating user profile:", error)
    throw error
  }

  console.log("User profile created successfully:", id)
}

async function handleUserUpdated(userData: any) {
  const { id, email_addresses, first_name, last_name, image_url } = userData

  const primaryEmail = email_addresses.find((email: any) => email.id === userData.primary_email_address_id)

  if (!primaryEmail) {
    console.error("No primary email found for user:", id)
    return
  }

  const updates = {
    email: primaryEmail.email_address,
    name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
    image_url: image_url || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("user_profiles").update(updates).eq("clerk_user_id", id)

  if (error) {
    console.error("Error updating user profile:", error)
    throw error
  }

  console.log("User profile updated successfully:", id)
}

async function handleUserDeleted(userData: any) {
  const { id } = userData

  // Delete user profile
  const { error: profileError } = await supabase.from("user_profiles").delete().eq("clerk_user_id", id)

  if (profileError) {
    console.error("Error deleting user profile:", profileError)
    throw profileError
  }

  // You might also want to delete or anonymize other user data
  // For example, update created_by fields to null or a placeholder
  const { error: coursesError } = await supabase.from("courses").update({ created_by: null }).eq("created_by", id)

  const { error: facultyError } = await supabase.from("faculty").update({ created_by: null }).eq("created_by", id)

  const { error: testimonialsError } = await supabase
    .from("testimonials")
    .update({ created_by: null })
    .eq("created_by", id)

  const { error: admissionError } = await supabase
    .from("admission_process")
    .update({ created_by: null })
    .eq("created_by", id)

  if (coursesError || facultyError || testimonialsError || admissionError) {
    console.error("Error cleaning up user data:", {
      coursesError,
      facultyError,
      testimonialsError,
      admissionError,
    })
  }

  console.log("User data deleted/cleaned successfully:", id)
}
