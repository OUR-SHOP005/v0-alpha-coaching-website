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
import { Course } from "@/lib/types"
import {
    ChevronDown,
    Edit,
    Plus,
    Trash,
    X
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

    // Form state
    const [formData, setFormData] = useState<Partial<Course>>({
        title: '',
        description: '',
        duration: '',
        fee: 0,
        features: [],
        image_url: '',
        is_active: true
    })

    const [featureInput, setFeatureInput] = useState("")

    const supabase = useSupabase()

    useEffect(() => {
        loadCourses()
    }, [])

    const loadCourses = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                throw error
            }

            setCourses(data || [])
        } catch (error) {
            console.error('Error loading courses:', error)
            toast.error('Failed to load courses')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setFormData({
            title: '',
            description: '',
            duration: '',
            fee: 0,
            features: [],
            image_url: '',
            is_active: true
        })
        setModalMode('create')
        setIsModalOpen(true)
    }

    const openEditModal = (course: Course) => {
        setSelectedCourse(course)
        setFormData({
            title: course.title,
            description: course.description || '',
            duration: course.duration || '',
            fee: course.fee || 0,
            features: course.features || [],
            image_url: course.image_url || '',
            is_active: course.is_active
        })
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const openDeleteModal = (course: Course) => {
        setSelectedCourse(course)
        setIsDeleteModalOpen(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, is_active: checked }))
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    }

    const addFeature = () => {
        if (featureInput.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), featureInput.trim()]
            }))
            setFeatureInput("")
        }
    }

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features?.filter((_, i) => i !== index)
        }))
    }

    const handleImageChange = (url: string) => {
        setFormData(prev => ({ ...prev, image_url: url }))
    }

    const handleImageRemove = () => {
        setFormData(prev => ({ ...prev, image_url: '' }))
    }

    const handleSubmit = async () => {
        try {
            if (!formData.title) {
                toast.error('Title is required')
                return
            }

            if (modalMode === 'create') {
                const { data, error } = await supabase
                    .from('courses')
                    .insert({
                        ...formData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()

                if (error) throw error

                toast.success('Course created successfully')
            } else {
                if (!selectedCourse) return

                const { error } = await supabase
                    .from('courses')
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedCourse.id)

                if (error) throw error

                toast.success('Course updated successfully')
            }

            setIsModalOpen(false)
            await loadCourses()
        } catch (error) {
            console.error('Error saving course:', error)
            toast.error('Failed to save course')
        }
    }

    const handleDelete = async () => {
        if (!selectedCourse) return

        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', selectedCourse.id)

            if (error) throw error

            toast.success('Course deleted successfully')
            setIsDeleteModalOpen(false)
            await loadCourses()
        } catch (error) {
            console.error('Error deleting course:', error)
            toast.error('Failed to delete course')
        }
    }

    const columns = [
        {
            accessorKey: "title",
            header: "Course",
            cell: ({ row }: { row: { original: Course } }) => {
                const course = row.original
                return (
                    <div className="flex items-center gap-3">
                        {course.image_url ? (
                            <img
                                src={course.image_url}
                                alt={course.title}
                                className="h-10 w-10 rounded object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                                No img
                            </div>
                        )}
                        <div>
                            <p className="font-medium">{course.title}</p>
                            {course.duration && (
                                <p className="text-xs text-gray-500">{course.duration}</p>
                            )}
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "fee",
            header: "Fee",
            cell: ({ row }: { row: { original: Course } }) => {
                const fee = row.original.fee
                const formatted = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'INR',
                }).format(fee)

                return <div>{formatted}</div>
            }
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }: { row: { original: Course } }) => {
                return row.original.is_active ? (
                    <Badge className="bg-green-500">Active</Badge>
                ) : (
                    <Badge variant="outline">Inactive</Badge>
                )
            }
        },
        {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }: { row: { original: Course } }) => {
                return new Date(row.original.created_at).toLocaleDateString()
            }
        },
        {
            id: "actions",
            cell: ({ row }: { row: { original: Course } }) => {
                const course = row.original

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
                            <DropdownMenuItem onClick={() => openEditModal(course)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Course
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => openDeleteModal(course)}
                                className="text-red-600"
                            >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Course
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
                    <h2 className="text-3xl font-bold text-gray-900">Course Management</h2>
                    <p className="text-gray-600 mt-2">Add, edit, and manage course offerings</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={courses}
                searchKey="title"
                searchPlaceholder="Search courses..."
            />

            {/* Create/Edit Modal */}
            <Modal
                title={modalMode === 'create' ? 'Add New Course' : 'Edit Course'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter course title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter course description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                placeholder="e.g. 6 weeks"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fee">Fee (₹)</Label>
                            <Input
                                id="fee"
                                name="fee"
                                type="number"
                                value={formData.fee?.toString()}
                                onChange={handleNumberChange}
                                placeholder="Enter course fee"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Course Image</Label>
                        <ImageUpload
                            value={formData.image_url || ''}
                            onChange={handleImageChange}
                            onRemove={handleImageRemove}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Features</Label>
                        <div className="flex space-x-2">
                            <Input
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                placeholder="Add course feature"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            />
                            <Button onClick={addFeature} type="button">Add</Button>
                        </div>

                        <div className="space-y-2 mt-2">
                            {formData.features && formData.features.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {formData.features.map((feature, index) => (
                                        <Badge key={index} className="flex items-center space-x-1 px-2 py-1">
                                            <span>{feature}</span>
                                            <button
                                                onClick={() => removeFeature(index)}
                                                className="ml-1 text-xs"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No features added yet</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={formData.is_active || false}
                            onCheckedChange={handleSwitchChange}
                            id="is_active"
                        />
                        <Label htmlFor="is_active">Active Course</Label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            {modalMode === 'create' ? 'Create Course' : 'Update Course'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Delete Course"
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <div className="space-y-4 py-2">
                    <p>
                        Are you sure you want to delete the course "{selectedCourse?.title}"? This action cannot be undone.
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
                            Delete Course
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
} 