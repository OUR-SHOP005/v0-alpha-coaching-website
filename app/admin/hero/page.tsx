"use client"

import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HeroSection } from "@/lib/types"
import { CheckCircle, Loader2, Save } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function HeroSectionPage() {
    const [heroData, setHeroData] = useState<HeroSection | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    const supabase = useSupabase()

    useEffect(() => {
        loadHeroData()
    }, [])

    const loadHeroData = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('hero_section')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(1)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
                throw error
            }

            if (data) {
                setHeroData(data)
            } else {
                // Initialize with empty data if no record exists
                setHeroData({
                    id: 0, // Will be set by DB on insert
                    title: 'Welcome to ALPHA Coaching',
                    subtitle: 'Your path to success starts here',
                    description: 'Welcome to ALPHA Coaching, your path to success starts here. We offer a range of courses to help you achieve your goals.',
                    cta_text: 'Get Started',
                    cta_link: '/contact',
                    background_image_url: '',
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
            }
        } catch (error) {
            console.error('Error loading hero section data:', error)
            toast.error('Failed to load hero section data')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setHeroData(prev => {
            if (!prev) return null
            return { ...prev, [name]: value }
        })
    }

    const handleImageChange = (url: string) => {
        setHeroData(prev => {
            if (!prev) return null
            return { ...prev, background_image_url: url }
        })
    }

    const handleImageRemove = () => {
        setHeroData(prev => {
            if (!prev) return null
            return { ...prev, background_image_url: '' }
        })
    }


    const handleSubmit = async () => {
        if (!heroData) return

        try {
            setSaving(true)

            const updatedData = {
                ...heroData,
                updated_at: new Date().toISOString()
            }

            if (!heroData.id || heroData.id === 0) {
                // Create new record
                const { data, error } = await supabase
                    .from('hero_section')
                    .insert(updatedData)
                    .select()
                    .single()

                if (error) throw error
                setHeroData(data)
            } else {
                // Update existing record
                const { error } = await supabase
                    .from('hero_section')
                    .update(updatedData)
                    .eq('id', heroData.id)

                if (error) throw error
            }

            toast.success('Hero section saved successfully')
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            console.error('Error saving hero section data:', error)
            toast.error('Failed to save hero section data')
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
                <h2 className="text-3xl font-bold text-gray-900">Hero Section</h2>
                <p className="text-gray-600 mt-2">Manage the hero section of your website homepage</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Main Headline</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={heroData?.title || ''}
                                    onChange={handleInputChange}
                                    placeholder="Main Headline"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subtitle">Subtitle</Label>
                                <Textarea
                                    id="subtitle"
                                    name="subtitle"
                                    value={heroData?.subtitle || ''}
                                    onChange={handleInputChange}
                                    placeholder="Supporting subtitle text"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={heroData?.description || ''}
                                    onChange={handleInputChange}
                                    placeholder="Description"
                                    rows={3}
                                />
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cta_text">Call to Action Text</Label>
                                    <Input
                                        id="cta_text"
                                        name="cta_text"
                                        value={heroData?.cta_text || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Get Started"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cta_link">Call to Action Link</Label>
                                    <Input
                                        id="cta_link"
                                        name="cta_link"
                                        value={heroData?.cta_link || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g. /contact"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Use a relative path (e.g., /contact) or full URL
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Background Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <ImageUpload
                                    value={heroData?.background_image_url || ''}
                                    onChange={handleImageChange}
                                    onRemove={handleImageRemove}
                                />
                                <p className="text-xs text-gray-500">
                                    For best results, use an image at least 1920px wide with good contrast for text visibility.
                                </p>
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

                    {heroData && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="relative h-40 rounded-md overflow-hidden flex items-center justify-center"
                                    style={{
                                        backgroundImage: heroData.background_image_url
                                            ? `url(${heroData.background_image_url})`
                                            : 'linear-gradient(to right, #4f46e5, #3b82f6)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                                    <div className="relative text-center text-white p-4">
                                        <h3 className="text-xl font-bold mb-1">{heroData.title}</h3>
                                        <p className="text-sm mb-3">{heroData.subtitle}</p>
                                        <Button size="sm" variant="secondary">
                                            {heroData.cta_text || 'Get Started'}
                                        </Button>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-gray-500 text-center">
                                    This is a scaled-down preview. Actual appearance may differ.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
} 