"use client"

import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, MessageSquare, TrendingUp, Users } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalFaculty: 0,
    totalTestimonials: 0,
    totalUsers: 0,
  })
  const client = useSupabase()
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [coursesRes, facultyRes, testimonialsRes, usersRes] = await Promise.all([
        client.from("courses").select("id", { count: "exact" }),
        client.from("faculty").select("id", { count: "exact" }),
        client.from("testimonials").select("id", { count: "exact" }),
        client.from("user_profiles").select("id", { count: "exact" }),
      ])

      setStats({
        totalCourses: coursesRes.count || 0,
        totalFaculty: facultyRes.count || 0,
        totalTestimonials: testimonialsRes.count || 0,
        totalUsers: usersRes.count || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-2">Manage your ALPHA coaching website content and monitor key metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Active course offerings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFaculty}</div>
            <p className="text-xs text-muted-foreground">Expert instructors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTestimonials}</div>
            <p className="text-xs text-muted-foreground">Student reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Platform users</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
                <div className="font-medium">Add Course</div>
                <div className="text-sm text-gray-600">Create new course</div>
              </button>

              <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <div className="font-medium">Add Faculty</div>
                <div className="text-sm text-gray-600">Add new instructor</div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System updated with Clerk authentication</p>
                  <p className="text-xs text-gray-600">Just now</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">RLS policies configured</p>
                  <p className="text-xs text-gray-600">5 minutes ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Database schema updated</p>
                  <p className="text-xs text-gray-600">10 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
