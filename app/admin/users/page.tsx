"use client"

import { useSupabase } from "@/components/supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Modal } from "@/components/ui/modal"
import {
  CheckCircle,
  ChevronDown,
  Shield,
  ShieldAlert,
  UserX
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface User {
  id: number
  clerk_user_id: string
  email: string
  name: string
  role: 'admin' | 'user'
  is_active: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [action, setAction] = useState<'delete' | 'toggle-status' | 'toggle-role'>('delete')

  const supabase = useSupabase()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const openConfirmModal = (user: User, actionType: 'delete' | 'toggle-status' | 'toggle-role') => {
    setSelectedUser(user)
    setAction(actionType)
    setConfirmModalOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedUser) return

    try {
      if (action === 'delete') {
        // Call API to delete user
        await supabase
          .from('user_profiles')
          .delete()
          .eq('clerk_user_id', selectedUser.clerk_user_id)

        toast.success('User deleted successfully')
      }
      else if (action === 'toggle-status') {
        // Toggle user active status
        const newStatus = !selectedUser.is_active

        await supabase
          .from('user_profiles')
          .update({ is_active: newStatus })
          .eq('clerk_user_id', selectedUser.clerk_user_id)

        toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)
      }
      else if (action === 'toggle-role') {
        // Toggle user role between admin and regular user
        const newRole = selectedUser.role === 'admin' ? 'user' : 'admin'

        await supabase
          .from('user_profiles')
          .update({ role: newRole })
          .eq('clerk_user_id', selectedUser.clerk_user_id)

        toast.success(`User role updated to ${newRole}`)
      }

      // Refresh user list
      await loadUsers()
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    } finally {
      setConfirmModalOpen(false)
      setSelectedUser(null)
    }
  }

  const columns = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }: { row: { original: User } }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.image_url || undefined} />
              <AvatarFallback>
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }: { row: { original: User } }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-2">
            {user.role === 'admin' ? (
              <ShieldAlert className="h-4 w-4 text-red-500" />
            ) : (
              <Shield className="h-4 w-4 text-blue-500" />
            )}
            <span className="capitalize">{user.role}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: { row: { original: User } }) => {
        const user = row.original
        return (
          <div className={`flex items-center gap-2 ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
            {user.is_active ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Active</span>
              </>
            ) : (
              <>
                <UserX className="h-4 w-4" />
                <span>Inactive</span>
              </>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }: { row: { original: User } }) => {
        return new Date(row.original.created_at).toLocaleDateString()
      }
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: User } }) => {
        const user = row.original

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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openConfirmModal(user, 'toggle-role')}>
                {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openConfirmModal(user, 'toggle-status')}>
                {user.is_active ? 'Deactivate User' : 'Activate User'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openConfirmModal(user, 'delete')}
                className="text-red-600"
              >
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  // Create confirm modal content based on action type
  const getModalContent = () => {
    if (!selectedUser) return null

    let title = ''
    let description = ''
    let buttonText = ''
    let buttonVariant: 'default' | 'destructive' | 'outline' = 'default'

    if (action === 'delete') {
      title = 'Delete User'
      description = `Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`
      buttonText = 'Delete'
      buttonVariant = 'destructive'
    } else if (action === 'toggle-status') {
      const willActivate = !selectedUser.is_active
      title = willActivate ? 'Activate User' : 'Deactivate User'
      description = willActivate
        ? `Are you sure you want to activate ${selectedUser.name}?`
        : `Are you sure you want to deactivate ${selectedUser.name}?`
      buttonText = willActivate ? 'Activate' : 'Deactivate'
      buttonVariant = willActivate ? 'default' : 'destructive'
    } else if (action === 'toggle-role') {
      const willBecomeAdmin = selectedUser.role !== 'admin'
      title = willBecomeAdmin ? 'Promote to Admin' : 'Remove Admin Role'
      description = willBecomeAdmin
        ? `Are you sure you want to give ${selectedUser.name} admin privileges?`
        : `Are you sure you want to remove admin privileges from ${selectedUser.name}?`
      buttonText = willBecomeAdmin ? 'Make Admin' : 'Remove Admin'
      buttonVariant = willBecomeAdmin ? 'default' : 'outline'
    }

    return (
      <div className="space-y-4 pt-2">
        <p>{description}</p>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setConfirmModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant={buttonVariant}
            onClick={handleConfirm}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600 mt-2">Manage user accounts, roles, and access</p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search by name..."
      />

      <Modal
        title={action === 'delete' ? 'Delete User' :
          action === 'toggle-status' ? (selectedUser?.is_active ? 'Deactivate User' : 'Activate User') :
            (selectedUser?.role === 'admin' ? 'Remove Admin Role' : 'Promote to Admin')}
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
      >
        {getModalContent()}
      </Modal>
    </div>
  )
}
