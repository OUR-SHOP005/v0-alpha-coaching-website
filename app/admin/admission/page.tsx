"use client"

import { useSupabase } from "@/components/supabase-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AdmissionStep } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
    ArrowDown,
    ArrowUp,
    ChevronDown,
    Pencil,
    Plus,
    Trash
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function AdmissionProcessPage() {
    const [steps, setSteps] = useState<AdmissionStep[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedStep, setSelectedStep] = useState<AdmissionStep | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

    // Form state
    const [formData, setFormData] = useState<Partial<AdmissionStep>>({
        step_number: 1,
        title: '',
        description: '',
        icon: '',
        is_active: true
    })

    const supabase = useSupabase()

    useEffect(() => {
        loadSteps()
    }, [])

    const loadSteps = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('admission_process')
                .select('*')
                .order('step_number', { ascending: true })

            if (error) {
                throw error
            }

            setSteps(data || [])
        } catch (error) {
            console.error('Error loading admission steps:', error)
            toast.error('Failed to load admission process')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        // Calculate next step number
        const nextStepNumber = steps.length > 0
            ? Math.max(...steps.map(step => step.step_number)) + 1
            : 1

        setFormData({
            step_number: nextStepNumber,
            title: '',
            description: '',
            icon: '',
            is_active: true
        })
        setModalMode('create')
        setIsModalOpen(true)
    }

    const openEditModal = (step: AdmissionStep) => {
        setSelectedStep(step)
        setFormData({
            step_number: step.step_number,
            title: step.title,
            description: step.description,
            icon: step.icon || '',
            is_active: step.is_active
        })
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const openDeleteModal = (step: AdmissionStep) => {
        setSelectedStep(step)
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
        const { value } = e.target
        const stepNumber = parseInt(value)
        if (stepNumber > 0) {
            setFormData(prev => ({ ...prev, step_number: stepNumber }))
        }
    }

    const moveStep = async (step: AdmissionStep, direction: 'up' | 'down') => {
        try {
            // Find the adjacent step
            const currentIndex = steps.findIndex(s => s.id === step.id)

            if (direction === 'up' && currentIndex <= 0) return
            if (direction === 'down' && currentIndex >= steps.length - 1) return

            const adjacentIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
            const adjacentStep = steps[adjacentIndex]

            // Swap step numbers
            const updates = [
                { id: step.id, step_number: adjacentStep.step_number },
                { id: adjacentStep.id, step_number: step.step_number }
            ]

            // Update in database
            for (const update of updates) {
                const { error } = await supabase
                    .from('admission_process')
                    .update({ step_number: update.step_number })
                    .eq('id', update.id)

                if (error) throw error
            }

            toast.success('Step order updated')
            await loadSteps()

        } catch (error) {
            console.error('Error reordering steps:', error)
            toast.error('Failed to update step order')
        }
    }

    const handleSubmit = async () => {
        try {
            if (!formData.title) {
                toast.error('Step title is required')
                return
            }

            if (!formData.description) {
                toast.error('Step description is required')
                return
            }

            if (modalMode === 'create') {
                const { data, error } = await supabase
                    .from('admission_process')
                    .insert({
                        ...formData,
                        created_at: new Date().toISOString()
                    })
                    .select()

                if (error) throw error

                toast.success('Admission step added successfully')
            } else {
                if (!selectedStep) return

                const { error } = await supabase
                    .from('admission_process')
                    .update(formData)
                    .eq('id', selectedStep.id)

                if (error) throw error

                toast.success('Admission step updated successfully')
            }

            setIsModalOpen(false)
            await loadSteps()
        } catch (error) {
            console.error('Error saving admission step:', error)
            toast.error('Failed to save admission step')
        }
    }

    const handleDelete = async () => {
        if (!selectedStep) return

        try {
            const { error } = await supabase
                .from('admission_process')
                .delete()
                .eq('id', selectedStep.id)

            if (error) throw error

            // Reorder remaining steps
            const remainingSteps = steps.filter(s => s.id !== selectedStep.id)

            // Update step numbers to be sequential
            let stepNumber = 1
            for (const step of remainingSteps.sort((a, b) => a.step_number - b.step_number)) {
                if (step.step_number !== stepNumber) {
                    await supabase
                        .from('admission_process')
                        .update({ step_number: stepNumber })
                        .eq('id', step.id)
                }
                stepNumber++
            }

            toast.success('Admission step deleted successfully')
            setIsDeleteModalOpen(false)
            await loadSteps()
        } catch (error) {
            console.error('Error deleting admission step:', error)
            toast.error('Failed to delete admission step')
        }
    }

    // Common icon options for admission steps
    const iconOptions = [
        { value: 'clipboard-check', label: 'Clipboard Check' },
        { value: 'file-text', label: 'Document' },
        { value: 'user-check', label: 'User Check' },
        { value: 'clipboard-list', label: 'Checklist' },
        { value: 'book-open', label: 'Book' },
        { value: 'pen-tool', label: 'Pen' },
        { value: 'check-circle', label: 'Check Circle' },
        { value: 'calendar', label: 'Calendar' },
        { value: 'award', label: 'Award' },
        { value: 'graduation-cap', label: 'Graduation Cap' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Admission Process</h2>
                    <p className="text-gray-600 mt-2">Manage the admission steps shown to prospective students</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : steps.length === 0 ? (
                <Card className="text-center py-8">
                    <CardContent>
                        <p className="text-gray-500 mb-4">No admission steps created yet</p>
                        <Button onClick={openCreateModal}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Step
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {steps.sort((a, b) => a.step_number - b.step_number).map((step) => (
                        <Card
                            key={step.id}
                            className={cn(
                                "border-l-4",
                                step.is_active ? "border-l-blue-500" : "border-l-gray-300"
                            )}
                        >
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-sm">Step {step.step_number}</Badge>
                                        <CardTitle>{step.title}</CardTitle>
                                        {!step.is_active && (
                                            <Badge variant="outline" className="bg-gray-100">Inactive</Badge>
                                        )}
                                    </div>
                                    {step.icon && (
                                        <CardDescription className="mt-2">Icon: {step.icon}</CardDescription>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => moveStep(step, 'up')}
                                        disabled={step.step_number === 1}
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => moveStep(step, 'down')}
                                        disabled={step.step_number === steps.length}
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => openEditModal(step)}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit Step
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => openDeleteModal(step)}
                                                className="text-red-600"
                                            >
                                                <Trash className="h-4 w-4 mr-2" />
                                                Delete Step
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{step.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                title={modalMode === 'create' ? 'Add Admission Step' : 'Edit Admission Step'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="step_number">Step Number</Label>
                        <Input
                            id="step_number"
                            name="step_number"
                            type="number"
                            min={1}
                            value={formData.step_number}
                            onChange={handleNumberChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter step title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="icon">Icon (Optional)</Label>
                        <Input
                            id="icon"
                            name="icon"
                            value={formData.icon}
                            onChange={handleInputChange}
                            placeholder="e.g. clipboard-check"
                            list="icon-suggestions"
                        />
                        <datalist id="icon-suggestions">
                            {iconOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </datalist>
                        <p className="text-xs text-gray-500">Enter Lucide icon name (see lucide.dev for options)</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter step description"
                            rows={4}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={formData.is_active || false}
                            onCheckedChange={handleSwitchChange}
                            id="is_active"
                        />
                        <Label htmlFor="is_active">Active Step</Label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            {modalMode === 'create' ? 'Add Step' : 'Update Step'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Delete Admission Step"
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <div className="space-y-4 py-2">
                    <p>
                        Are you sure you want to delete step {selectedStep?.step_number}: "{selectedStep?.title}"? This action cannot be undone.
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
                            Delete Step
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
} 