"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/hooks/use-user-profile"
import { useUser } from "@clerk/nextjs"
import {
  BookOpen,
  ContactIcon,
  GraduationCap,
  Info,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Mail,
  MessageSquare,
  Newspaper,
  Settings,
  Users
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn, isLoaded } = useUser()
  const { isAdmin, loading } = useUserProfile()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !loading) {
      if (!isSignedIn || !isAdmin) {
        router.push("/")
      }
    }
  }, [isSignedIn, isAdmin, isLoaded, loading, router])

  if (!isLoaded || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isSignedIn || !isAdmin) {
    return null
  }

  const sidebarItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/contacts", label: "Contact Submissions", icon: Mail },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/faculty", label: "Faculty", icon: GraduationCap },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
    { href: "/admin/about", label: "About Us", icon: Info },
    { href: "/admin/admission", label: "Admission Process", icon: ListTodo },
    { href: "/admin/hero", label: "Hero Section", icon: Newspaper },
    { href: "/admin/contact-info", label: "Contact Info", icon: ContactIcon },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg overflow-y-auto fixed h-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-600">ALPHA Admin</h2>
        </div>

        <nav className="mt-6 pb-24">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <IconComponent className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-6 left-6">
          <Link href="/">
            <Button variant="ghost" className="flex items-center text-gray-700 hover:text-blue-600">
              <LogOut className="w-5 h-5 mr-3" />
              Back to Site
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 overflow-auto">
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
