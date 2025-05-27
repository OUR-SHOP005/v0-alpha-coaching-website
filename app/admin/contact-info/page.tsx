"use client"

import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ContactInfo, SocialMedia } from "@/lib/types"
import { CheckCircle, Facebook, Globe, Instagram, Linkedin, Loader2, Mail, MapPin, Phone, Plus, Save, Twitter, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"



export default function ContactInfoPage() {
    const [contactData, setContactData] = useState<ContactInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([])

    // Social media platform input
    const [newPlatform, setNewPlatform] = useState('')
    const [newUrl, setNewUrl] = useState('')

    const supabase = useSupabase()

    useEffect(() => {
        loadContactData()
    }, [])

    const loadContactData = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('contact_info')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(1)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
                throw error
            }

            if (data) {
                setContactData(data)
                setSocialMedia(data.social_media || [])
            } else {
                // Initialize with empty data if no record exists
                setContactData({
                    id: 0,
                    address: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    country: '',
                    phone: '',
                    email: '',
                    office_hours: '',
                    map_url: '',
                    hours: '',
                    social_media: [],
                    image_url: '',
                    updated_at: new Date().toISOString()
                })
                setSocialMedia([])
            }
        } catch (error) {
            console.error('Error loading contact info data:', error)
            toast.error('Failed to load contact information')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setContactData(prev => {
            if (!prev) return null
            return { ...prev, [name]: value }
        })
    }

    const handleImageChange = (url: string) => {
        setContactData(prev => {
            if (!prev) return null
            return { ...prev, image_url: url }
        })
    }

    const handleImageRemove = () => {
        setContactData(prev => {
            if (!prev) return null
            return { ...prev, image_url: '' }
        })
    }

    const addSocialMedia = () => {
        if (!newPlatform.trim() || !newUrl.trim()) {
            toast.error('Please enter both platform name and URL')
            return
        }

        const platformLower = newPlatform.trim().toLowerCase()
        let icon = ''

        // Determine icon based on common platform names
        if (platformLower.includes('facebook')) icon = 'facebook'
        else if (platformLower.includes('instagram')) icon = 'instagram'
        else if (platformLower.includes('twitter') || platformLower.includes('x.com')) icon = 'twitter'
        else if (platformLower.includes('linkedin')) icon = 'linkedin'
        else if (platformLower.includes('youtube')) icon = 'youtube'
        else icon = 'link'

        const newSocialMedia = {
            platform: newPlatform,
            url: newUrl,
            icon
        }

        setSocialMedia([...socialMedia, newSocialMedia])
        setNewPlatform('')
        setNewUrl('')
    }

    const removeSocialMedia = (index: number) => {
        const updatedSocial = [...socialMedia]
        updatedSocial.splice(index, 1)
        setSocialMedia(updatedSocial)
    }

    const getSocialIcon = (platform: string) => {
        const platformLower = platform.toLowerCase()
        if (platformLower.includes('instagram')) return <Instagram className="h-4 w-4" />
        if (platformLower.includes('facebook')) return <Facebook className="h-4 w-4" />
        if (platformLower.includes('twitter') || platformLower.includes('x.com')) return <Twitter className="h-4 w-4" />
        if (platformLower.includes('linkedin')) return <Linkedin className="h-4 w-4" />
        return <Globe className="h-4 w-4" />
    }

    const handleSubmit = async () => {
        if (!contactData) return

        try {
            setSaving(true)

            const updatedData = {
                ...contactData,
                social_media: socialMedia,
                updated_at: new Date().toISOString()
            }

            if (!contactData.id || contactData.id === 0) {
                // Create new record
                const { data, error } = await supabase
                    .from('contact_info')
                    .insert(updatedData)
                    .select()
                    .single()

                if (error) throw error
                setContactData(data)
            } else {
                // Update existing record
                const { error } = await supabase
                    .from('contact_info')
                    .update(updatedData)
                    .eq('id', contactData.id)

                if (error) throw error
            }

            toast.success('Contact information saved successfully')
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            console.error('Error saving contact info data:', error)
            toast.error('Failed to save contact information')
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
                <h2 className="text-3xl font-bold text-gray-900">Contact Information</h2>
                <p className="text-gray-600 mt-2">Update the contact details displayed on your website</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Address Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Street Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={contactData?.address || ''}
                                    onChange={handleInputChange}
                                    placeholder="123 Main Street"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={contactData?.city || ''}
                                        onChange={handleInputChange}
                                        placeholder="City"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">State/Province</Label>
                                    <Input
                                        id="state"
                                        name="state"
                                        value={contactData?.state || ''}
                                        onChange={handleInputChange}
                                        placeholder="State"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal/Zip Code</Label>
                                    <Input
                                        id="postal_code"
                                        name="postal_code"
                                        value={contactData?.postal_code || ''}
                                        onChange={handleInputChange}
                                        placeholder="Postal Code"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        name="country"
                                        value={contactData?.country || ''}
                                        onChange={handleInputChange}
                                        placeholder="Country"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="map_url">Google Maps URL (Optional)</Label>
                                <Input
                                    id="map_url"
                                    name="map_url"
                                    value={contactData?.map_url || ''}
                                    onChange={handleInputChange}
                                    placeholder="https://goo.gl/maps/..."
                                />
                                <p className="text-xs text-gray-500">
                                    Paste a Google Maps embed link to show an interactive map on your contact page.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={contactData?.phone || ''}
                                        onChange={handleInputChange}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        value={contactData?.email || ''}
                                        onChange={handleInputChange}
                                        placeholder="contact@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hours">Business Hours</Label>
                                <Textarea
                                    id="hours"
                                    name="hours"
                                    value={contactData?.hours || ''}
                                    onChange={handleInputChange}
                                    placeholder="Monday - Friday: 9AM - 5PM&#10;Saturday: 10AM - 2PM&#10;Sunday: Closed"
                                    rows={5}
                                />
                                <p className="text-xs text-gray-500">
                                    Enter each day on a new line for better formatting on the website.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Social Media</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                {socialMedia.length > 0 ? (
                                    <div className="space-y-2">
                                        {socialMedia.map((social, index) => (
                                            <div key={index} className="flex items-center justify-between border p-3 rounded-md">
                                                <div className="flex items-center gap-2">
                                                    {getSocialIcon(social.platform)}
                                                    <div>
                                                        <p className="font-medium">{social.platform}</p>
                                                        <p className="text-xs text-blue-600 truncate max-w-[200px]">{social.url}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSocialMedia(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">No social media links added yet.</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="grid grid-cols-5 gap-4">
                                    <div className="col-span-2">
                                        <Input
                                            value={newPlatform}
                                            onChange={(e) => setNewPlatform(e.target.value)}
                                            placeholder="Platform (e.g., Instagram)"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            value={newUrl}
                                            onChange={(e) => setNewUrl(e.target.value)}
                                            placeholder="URL"
                                        />
                                    </div>
                                    <Button onClick={addSocialMedia}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Add all social media platforms where customers can find you.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Location Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <ImageUpload
                                    value={contactData?.image_url || ''}
                                    onChange={handleImageChange}
                                    onRemove={handleImageRemove}
                                />
                                <p className="text-xs text-gray-500">
                                    Upload an image of your location or building. This will be displayed on the contact page.
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

                    {contactData && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Info Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    {(contactData.address || contactData.city) && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-1 text-blue-600 shrink-0" />
                                            <div>
                                                {contactData.address && <p>{contactData.address}</p>}
                                                {(contactData.city || contactData.state) && (
                                                    <p>
                                                        {[
                                                            contactData.city,
                                                            contactData.state,
                                                            contactData.postal_code
                                                        ].filter(Boolean).join(', ')}
                                                    </p>
                                                )}
                                                {contactData.country && <p>{contactData.country}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {contactData.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                                            <p>{contactData.phone}</p>
                                        </div>
                                    )}

                                    {contactData.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                                            <p>{contactData.email}</p>
                                        </div>
                                    )}

                                    {socialMedia.length > 0 && (
                                        <div className="flex items-center gap-2 pt-2">
                                            {socialMedia.slice(0, 4).map((social, index) => (
                                                <div key={index} className="bg-gray-100 rounded-full p-2">
                                                    {getSocialIcon(social.platform)}
                                                </div>
                                            ))}
                                            {socialMedia.length > 4 && (
                                                <div className="bg-gray-100 rounded-full p-2">
                                                    <p className="text-xs">+{socialMedia.length - 4}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
} 