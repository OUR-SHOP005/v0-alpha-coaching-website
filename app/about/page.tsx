import { getAboutUs, getFaculty } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, BookOpen, Target, Eye, History } from "lucide-react"
import Image from "next/image"

export default async function AboutPage() {
  const [aboutData, faculty] = await Promise.all([getAboutUs(), getFaculty()])

  if (!aboutData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About ALPHA</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Empowering students to achieve their IIT dreams through excellence in education
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{aboutData.students_placed}+</h3>
              <p className="text-gray-600">Students Placed</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{aboutData.faculty_count}+</h3>
              <p className="text-gray-600">Expert Faculty</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{aboutData.years_experience}+</h3>
              <p className="text-gray-600">Years Experience</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">95%</h3>
              <p className="text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, History */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{aboutData.mission}</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{aboutData.vision}</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <History className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Our History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{aboutData.history}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Achievements</h2>
            <p className="text-lg text-gray-600">Celebrating milestones that reflect our commitment to excellence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutData.achievements.map((achievement, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">{achievement}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Faculty</h2>
            <p className="text-lg text-gray-600">Learn from the best minds in JEE preparation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {faculty.map((member) => (
              <Card key={member.id} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Image
                    src={member.image_url || "/placeholder.svg"}
                    alt={member.name}
                    width={120}
                    height={120}
                    className="rounded-full mx-auto mb-4"
                  />
                  <h4 className="font-semibold text-lg mb-2">{member.name}</h4>
                  <p className="text-blue-600 font-medium mb-2">{member.designation}</p>
                  <p className="text-sm text-gray-600 mb-3">{member.qualification}</p>
                  <p className="text-xs text-gray-500 mb-3">{member.experience_years} years experience</p>
                  <div className="flex flex-wrap gap-1 justify-center mb-3">
                    {member.subjects.map((subject, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
