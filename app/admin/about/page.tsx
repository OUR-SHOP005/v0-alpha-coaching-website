"use client"

import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AboutUs } from "@/lib/types"
import { CheckCircle, Loader2, Save } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function AboutUsPage() {
    const [aboutUsData, setAboutUsData] = useState<AboutUs | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    const supabase = useSupabase()

    useEffect(() => {
        loadAboutUsData()
    }, [])

    const loadAboutUsData = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('about_us')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(1)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
                throw error
            }

            if (data) {
                setAboutUsData(data)
            } else {
                // Initialize with empty data if no record exists
                setAboutUsData({
                    id: 0, // Will be set by DB on insert
                    mission: '',
                    vision: '',
                    history: '',
                    achievements: [],
                    faculty_count: 0,
                    students_placed: 0,
                    years_experience: 0
                })
            }
        } catch (error) {
            console.error('Error loading about us data:', error)
            toast.error('Failed to load about us data')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setAboutUsData(prev => {
            if (!prev) return null
            return { ...prev, [name]: value }
        })
    }

    const handleNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target
        const numValue = parseInt(value) || 0
        setAboutUsData(prev => {
            if (!prev) return null
            return { ...prev, [name]: numValue }
        })
    }

    const handleAchievementChange = (index: number, value: string) => {
        setAboutUsData(prev => {
            if (!prev) return null
            const newAchievements = [...(prev.achievements || [])]
            newAchievements[index] = value
            return { ...prev, achievements: newAchievements }
        })
    }

    const handleAddAchievement = () => {
        setAboutUsData(prev => {
            if (!prev) return null
            return { ...prev, achievements: [...(prev.achievements || []), ''] }
        })
    }

    const handleRemoveAchievement = (index: number) => {
        setAboutUsData(prev => {
            if (!prev) return null
            const newAchievements = [...(prev.achievements || [])]
            newAchievements.splice(index, 1)
            return { ...prev, achievements: newAchievements }
        })
    }

    const handleSubmit = async () => {
        if (!aboutUsData) return

        try {
            setSaving(true)

            const updatedData = {
                ...aboutUsData,
                updated_at: new Date().toISOString()
            }

            if (!aboutUsData.id || aboutUsData.id === 0) {
                // Create new record
                const { data, error } = await supabase
                    .from('about_us')
                    .insert(updatedData)
                    .select()
                    .single()

                if (error) throw error
                setAboutUsData(data)
            } else {
                // Update existing record
                const { error } = await supabase
                    .from('about_us')
                    .update(updatedData)
                    .eq('id', aboutUsData.id)

                if (error) throw error
            }

            toast.success('About Us content saved successfully')
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            console.error('Error saving about us data:', error)
            toast.error('Failed to save about us data')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">About Us</h2>
                <p className="text-gray-600 mt-2">Manage the About Us section of your website</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mission</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    id="mission"
                                    name="mission"
                                    value={aboutUsData?.mission || ''}
                                    onChange={handleInputChange}
                                    placeholder="Our mission statement..."
                                    className="min-h-[150px]"
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Vision</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    id="vision"
                                    name="vision"
                                    value={aboutUsData?.vision || ''}
                                    onChange={handleInputChange}
                                    placeholder="Our vision statement..."
                                    className="min-h-[150px]"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                id="history"
                                name="history"
                                value={aboutUsData?.history || ''}
                                onChange={handleInputChange}
                                placeholder="Our history..."
                                className="min-h-[200px]"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Achievements</CardTitle>
                            <Button onClick={handleAddAchievement} variant="outline" size="sm">Add Achievement</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {aboutUsData?.achievements && aboutUsData.achievements.length > 0 ? (
                                    aboutUsData.achievements.map((achievement, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={achievement}
                                                onChange={(e) => handleAchievementChange(index, e.target.value)}
                                                placeholder={`Achievement ${index + 1}`}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveAchievement(index)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No achievements added yet. Add some achievements to display.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Key Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="faculty_count">Faculty Count</Label>
                                <Input
                                    id="faculty_count"
                                    name="faculty_count"
                                    type="number"
                                    value={aboutUsData?.faculty_count || 0}
                                    onChange={handleNumberChange}
                                    placeholder="Number of faculty members"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="students_placed">Students Placed</Label>
                                <Input
                                    id="students_placed"
                                    name="students_placed"
                                    type="number"
                                    value={aboutUsData?.students_placed || 0}
                                    onChange={handleNumberChange}
                                    placeholder="Number of students placed"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="years_experience">Years of Experience</Label>
                                <Input
                                    id="years_experience"
                                    name="years_experience"
                                    type="number"
                                    value={aboutUsData?.years_experience || 0}
                                    onChange={handleNumberChange}
                                    placeholder="Years of experience"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                            <Button
                                onClick={handleSubmit}
                                className="w-full"
                                size="lg"
                                disabled={saving || success}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}