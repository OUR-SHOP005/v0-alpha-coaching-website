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
import { Faculty } from "@/lib/types"
import {
    ChevronDown,
    Edit,
    Plus,
    Trash,
    User,
    X
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function FacultyPage() {
    const [faculty, setFaculty] = useState<Faculty[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

    // Form state
    const [formData, setFormData] = useState<Partial<Faculty>>({
        name: '',
        designation: '',
        qualification: '',
        experience_years: 0,
        subjects: [],
        image_url: '',
        bio: '',
        is_active: true
    })

    const [subjectInput, setSubjectInput] = useState("")

    const supabase = useSupabase()

    useEffect(() => {
        loadFaculty()
    }, [])

    const loadFaculty = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('faculty')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                throw error
            }

            setFaculty(data || [])
        } catch (error) {
            console.error('Error loading faculty:', error)
            toast.error('Failed to load faculty')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setFormData({
            name: '',
            designation: '',
            qualification: '',
            experience_years: 0,
            subjects: [],
            image_url: '',
            bio: '',
            is_active: true
        })
        setModalMode('create')
        setIsModalOpen(true)
    }

    const openEditModal = (faculty: Faculty) => {
        setSelectedFaculty(faculty)
        setFormData({
            name: faculty.name,
            designation: faculty.designation || '',
            qualification: faculty.qualification || '',
            experience_years: faculty.experience_years || 0,
            subjects: faculty.subjects || [],
            image_url: faculty.image_url || '',
            bio: faculty.bio || '',
            is_active: faculty.is_active
        })
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const openDeleteModal = (faculty: Faculty) => {
        setSelectedFaculty(faculty)
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
        setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    }

    const addSubject = () => {
        if (subjectInput.trim()) {
            setFormData(prev => ({
                ...prev,
                subjects: [...(prev.subjects || []), subjectInput.trim()]
            }))
            setSubjectInput("")
        }
    }

    const removeSubject = (index: number) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects?.filter((_, i) => i !== index)
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
            if (!formData.name) {
                toast.error('Name is required')
                return
            }

            if (modalMode === 'create') {
                const { data, error } = await supabase
                    .from('faculty')
                    .insert({
                        ...formData,
                        created_at: new Date().toISOString()
                    })
                    .select()

                if (error) throw error

                toast.success('Faculty member added successfully')
            } else {
                if (!selectedFaculty) return

                const { error } = await supabase
                    .from('faculty')
                    .update(formData)
                    .eq('id', selectedFaculty.id)

                if (error) throw error

                toast.success('Faculty member updated successfully')
            }

            setIsModalOpen(false)
            await loadFaculty()
        } catch (error) {
            console.error('Error saving faculty:', error)
            toast.error('Failed to save faculty member')
        }
    }

    const handleDelete = async () => {
        if (!selectedFaculty) return

        try {
            const { error } = await supabase
                .from('faculty')
                .delete()
                .eq('id', selectedFaculty.id)

            if (error) throw error

            toast.success('Faculty member deleted successfully')
            setIsDeleteModalOpen(false)
            await loadFaculty()
        } catch (error) {
            console.error('Error deleting faculty:', error)
            toast.error('Failed to delete faculty member')
        }
    }

    const columns = [
        {
            accessorKey: "name",
            header: "Faculty",
            cell: ({ row }: { row: { original: Faculty } }) => {
                const faculty = row.original
                return (
                    <div className="flex items-center gap-3">
                        {faculty.image_url ? (
                            <img
                                src={faculty.image_url}
                                alt={faculty.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <User className="h-5 w-5" />
                            </div>
                        )}
                        <div>
                            <p className="font-medium">{faculty.name}</p>
                            {faculty.designation && (
                                <p className="text-xs text-gray-500">{faculty.designation}</p>
                            )}
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "qualification",
            header: "Qualification",
            cell: ({ row }: { row: { original: Faculty } }) => row.original.qualification || 'N/A'
        },
        {
            accessorKey: "experience_years",
            header: "Experience",
            cell: ({ row }: { row: { original: Faculty } }) => {
                const years = row.original.experience_years
                return years ? `${years} year${years === 1 ? '' : 's'}` : 'N/A'
            }
        },
        {
            accessorKey: "subjects",
            header: "Subjects",
            cell: ({ row }: { row: { original: Faculty } }) => {
                const subjects = row.original.subjects
                if (!subjects || subjects.length === 0) return 'None specified'

                return (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {subjects.slice(0, 2).map((subject, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                                {subject}
                            </Badge>
                        ))}
                        {subjects.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{subjects.length - 2} more
                            </Badge>
                        )}
                    </div>
                )
            }
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }: { row: { original: Faculty } }) => {
                return row.original.is_active ? (
                    <Badge className="bg-green-500">Active</Badge>
                ) : (
                    <Badge variant="outline">Inactive</Badge>
                )
            }
        },
        {
            id: "actions",
            cell: ({ row }: { row: { original: Faculty } }) => {
                const faculty = row.original

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
                            <DropdownMenuItem onClick={() => openEditModal(faculty)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Faculty
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => openDeleteModal(faculty)}
                                className="text-red-600"
                            >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Faculty
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
                    <h2 className="text-3xl font-bold text-gray-900">Faculty Management</h2>
                    <p className="text-gray-600 mt-2">Add, edit, and manage faculty members</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Faculty
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={faculty}
                searchKey="name"
                searchPlaceholder="Search faculty..."
            />

            {/* Create/Edit Modal */}
            <Modal
                title={modalMode === 'create' ? 'Add Faculty Member' : 'Edit Faculty Member'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Faculty Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter faculty name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Input
                                id="designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleInputChange}
                                placeholder="e.g. Professor"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experience_years">Experience (years)</Label>
                            <Input
                                id="experience_years"
                                name="experience_years"
                                type="number"
                                value={formData.experience_years?.toString()}
                                onChange={handleNumberChange}
                                min="0"
                                placeholder="Years of experience"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="qualification">Qualification</Label>
                        <Input
                            id="qualification"
                            name="qualification"
                            value={formData.qualification}
                            onChange={handleInputChange}
                            placeholder="e.g. Ph.D. in Mathematics"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Faculty Image</Label>
                        <ImageUpload
                            value={formData.image_url || ''}
                            onChange={handleImageChange}
                            onRemove={handleImageRemove}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Enter faculty bio"
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Subjects</Label>
                        <div className="flex space-x-2">
                            <Input
                                value={subjectInput}
                                onChange={(e) => setSubjectInput(e.target.value)}
                                placeholder="Add subject"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                            />
                            <Button onClick={addSubject} type="button">Add</Button>
                        </div>

                        <div className="space-y-2 mt-2">
                            {formData.subjects && formData.subjects.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {formData.subjects.map((subject, index) => (
                                        <Badge key={index} className="flex items-center space-x-1 px-2 py-1">
                                            <span>{subject}</span>
                                            <button
                                                onClick={() => removeSubject(index)}
                                                className="ml-1 text-xs"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No subjects added yet</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={formData.is_active || false}
                            onCheckedChange={handleSwitchChange}
                            id="is_active"
                        />
                        <Label htmlFor="is_active">Active Faculty Member</Label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            {modalMode === 'create' ? 'Add Faculty' : 'Update Faculty'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Delete Faculty Member"
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <div className="space-y-4 py-2">
                    <p>
                        Are you sure you want to delete faculty member "{selectedFaculty?.name}"? This action cannot be undone.
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
                            Delete Faculty
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
} 