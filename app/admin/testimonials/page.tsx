"use client"

import { useSupabase } from "@/components/supabase-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Testimonial } from "@/lib/types"
import {
    ChevronDown,
    Edit,
    Plus,
    Star,
    Trash,
    User
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

    // Form state
    const [formData, setFormData] = useState<Partial<Testimonial>>({
        student_name: '',
        course: '',
        rating: 5,
        message: '',
        image_url: '',
        is_featured: false
    })

    const supabase = useSupabase()

    useEffect(() => {
        loadTestimonials()
    }, [])

    const loadTestimonials = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                throw error
            }

            setTestimonials(data || [])
        } catch (error) {
            console.error('Error loading testimonials:', error)
            toast.error('Failed to load testimonials')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setFormData({
            student_name: '',
            course: '',
            rating: 5,
            message: '',
            image_url: '',
            is_featured: false
        })
        setModalMode('create')
        setIsModalOpen(true)
    }

    const openEditModal = (testimonial: Testimonial) => {
        setSelectedTestimonial(testimonial)
        setFormData({
            student_name: testimonial.student_name,
            course: testimonial.course || '',
            rating: testimonial.rating || 5,
            message: testimonial.message,
            image_url: testimonial.image_url || '',
            is_featured: testimonial.is_featured || false
        })
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const openDeleteModal = (testimonial: Testimonial) => {
        setSelectedTestimonial(testimonial)
        setIsDeleteModalOpen(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, is_featured: checked }))
    }

    const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        const rating = parseInt(value)
        if (rating >= 1 && rating <= 5) {
            setFormData(prev => ({ ...prev, rating }))
        }
    }

    const handleImageChange = (url: string) => {
        setFormData(prev => ({ ...prev, image_url: url }))
    }

    const handleImageRemove = () => {
        setFormData(prev => ({ ...prev, image_url: '' }))
    }

    const handleSubmit = async () => {
        try {
            if (!formData.student_name) {
                toast.error('Student name is required')
                return
            }

            if (!formData.message) {
                toast.error('Testimonial message is required')
                return
            }

            if (modalMode === 'create') {
                const { data, error } = await supabase
                    .from('testimonials')
                    .insert({
                        ...formData,
                        created_at: new Date().toISOString()
                    })
                    .select()

                if (error) throw error

                toast.success('Testimonial added successfully')
            } else {
                if (!selectedTestimonial) return

                const { error } = await supabase
                    .from('testimonials')
                    .update(formData)
                    .eq('id', selectedTestimonial.id)

                if (error) throw error

                toast.success('Testimonial updated successfully')
            }

            setIsModalOpen(false)
            await loadTestimonials()
        } catch (error) {
            console.error('Error saving testimonial:', error)
            toast.error('Failed to save testimonial')
        }
    }

    const handleDelete = async () => {
        if (!selectedTestimonial) return

        try {
            const { error } = await supabase
                .from('testimonials')
                .delete()
                .eq('id', selectedTestimonial.id)

            if (error) throw error

            toast.success('Testimonial deleted successfully')
            setIsDeleteModalOpen(false)
            await loadTestimonials()
        } catch (error) {
            console.error('Error deleting testimonial:', error)
            toast.error('Failed to delete testimonial')
        }
    }

    const toggleFeatured = async (testimonial: Testimonial) => {
        try {
            const updatedValue = !testimonial.is_featured

            const { error } = await supabase
                .from('testimonials')
                .update({ is_featured: updatedValue })
                .eq('id', testimonial.id)

            if (error) throw error

            toast.success(`Testimonial ${updatedValue ? 'featured' : 'unfeatured'} successfully`)
            await loadTestimonials()
        } catch (error) {
            console.error('Error updating testimonial:', error)
            toast.error('Failed to update testimonial')
        }
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                ))}
            </div>
        )
    }

    const columns = [
        {
            accessorKey: "student_name",
            header: "Student",
            cell: ({ row }: { row: { original: Testimonial } }) => {
                const testimonial = row.original
                return (
                    <div className="flex items-center gap-3">
                        {testimonial.image_url ? (
                            <img
                                src={testimonial.image_url}
                                alt={testimonial.student_name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <User className="h-5 w-5" />
                            </div>
                        )}
                        <div>
                            <p className="font-medium">{testimonial.student_name}</p>
                            {testimonial.course && (
                                <p className="text-xs text-gray-500">{testimonial.course}</p>
                            )}
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "rating",
            header: "Rating",
            cell: ({ row }: { row: { original: Testimonial } }) => renderStars(row.original.rating)
        },
        {
            accessorKey: "message",
            header: "Testimonial",
            cell: ({ row }: { row: { original: Testimonial } }) => (
                <div className="max-w-[400px] truncate" title={row.original.message}>
                    {row.original.message}
                </div>
            )
        },
        {
            accessorKey: "is_featured",
            header: "Featured",
            cell: ({ row }: { row: { original: Testimonial } }) => (
                row.original.is_featured ? (
                    <Badge className="bg-yellow-500">Featured</Badge>
                ) : (
                    <Badge variant="outline">Not Featured</Badge>
                )
            )
        },
        {
            id: "actions",
            cell: ({ row }: { row: { original: Testimonial } }) => {
                const testimonial = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditModal(testimonial)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleFeatured(testimonial)}>
                                <Star className="h-4 w-4 mr-2" />
                                {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => openDeleteModal(testimonial)}
                                className="text-red-600"
                            >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Testimonials</h2>
                    <p className="text-gray-600 mt-2">Manage student testimonials and reviews</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Testimonial
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={testimonials}
                searchKey="student_name"
                searchPlaceholder="Search testimonials..."
            />

            {/* Create/Edit Modal */}
            <Modal
                title={modalMode === 'create' ? 'Add Testimonial' : 'Edit Testimonial'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="student_name">Student Name</Label>
                        <Input
                            id="student_name"
                            name="student_name"
                            value={formData.student_name}
                            onChange={handleInputChange}
                            placeholder="Enter student name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="course">Course</Label>
                        <Input
                            id="course"
                            name="course"
                            value={formData.course}
                            onChange={handleInputChange}
                            placeholder="e.g. Advanced Mathematics"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Student Image</Label>
                        <ImageUpload
                            value={formData.image_url || ''}
                            onChange={handleImageChange}
                            onRemove={handleImageRemove}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rating">Rating (1-5)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="rating"
                                name="rating"
                                type="number"
                                min={1}
                                max={5}
                                value={formData.rating}
                                onChange={handleRatingChange}
                                className="w-20"
                            />
                            <div className="flex">
                                {renderStars(formData.rating || 5)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Testimonial Message</Label>
                        <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Enter testimonial message"
                            rows={4}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={formData.is_featured || false}
                            onCheckedChange={handleSwitchChange}
                            id="is_featured"
                        />
                        <Label htmlFor="is_featured">Feature this testimonial</Label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            {modalMode === 'create' ? 'Add Testimonial' : 'Update Testimonial'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Delete Testimonial"
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <div className="space-y-4 py-2">
                    <p>
                        Are you sure you want to delete this testimonial from "{selectedTestimonial?.student_name}"? This action cannot be undone.
                    </p>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Delete Testimonial
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
} 