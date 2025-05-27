import { getAdmissionProcess } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, FileText, Users, CreditCard, BookOpen, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

const iconMap = {
  UserPlus,
  FileText,
  Users,
  CreditCard,
  BookOpen,
}

export default async function AdmissionPage() {
  const admissionSteps = await getAdmissionProcess()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Admission Process</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Join ALPHA and take the first step towards your IIT success. Follow our simple admission process.
            </p>
          </div>
        </div>
      </section>

      {/* Admission Steps */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How to Apply</h2>
            <p className="text-lg text-gray-600">Follow these simple steps to secure your admission at ALPHA</p>
          </div>

          <div className="space-y-8">
            {admissionSteps.map((step, index) => {
              const IconComponent = iconMap[step.icon as keyof typeof iconMap] || UserPlus

              return (
                <div key={step.id} className="relative">
                  {/* Connector Line */}
                  {index < admissionSteps.length - 1 && (
                    <div className="absolute left-8 top-20 w-0.5 h-16 bg-blue-200 hidden md:block"></div>
                  )}

                  <Card className="bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <div className="flex items-center mb-4 md:mb-0 md:mr-8">
                          <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mr-4">
                            <IconComponent className="w-8 h-8" />
                          </div>
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            Step {step.step_number}
                          </Badge>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                          <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Admission Requirements</h2>
            <p className="text-lg text-gray-600">Make sure you meet these requirements before applying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600" />
                  Academic Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Class 10th Mark Sheet</li>
                  <li>• Class 12th Mark Sheet (if applicable)</li>
                  <li>• Transfer Certificate</li>
                  <li>• Character Certificate</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-6 h-6 mr-2 text-blue-600" />
                  Personal Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Passport Size Photographs</li>
                  <li>• Aadhar Card Copy</li>
                  <li>• Parent's ID Proof</li>
                  <li>• Address Proof</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                  Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Minimum 75% in Class 10th</li>
                  <li>• PCM subjects in Class 11th/12th</li>
                  <li>• Age limit: 16-19 years</li>
                  <li>• Clear entrance test</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact for Admission */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Apply?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Contact our admission team for guidance and support throughout the process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <Phone className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p>+91-9876543210</p>
            </div>

            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p>admissions@alphajee.com</p>
            </div>

            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p>Education Hub, Kota</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 mr-4">
                Contact Admission Team
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
