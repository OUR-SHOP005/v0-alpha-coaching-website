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
import { Input } from "@/components/ui/input"
import { Modal, } from "@/components/ui/modal"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar, CheckCheck,
  ChevronDown,
  Clock,
  HelpCircle,
  Mail,
  MessageSquare, Phone
} from "lucide-react"
// import alert shadcn components
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface ContactSubmission {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
  reply?: string // For storing the reply temporarily in UI
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [replyModalOpen, setReplyModalOpen] = useState(false)
  const [reply, setReply] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "in_progress" | "resolved">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredContacts, setFilteredContacts] = useState<ContactSubmission[]>([])
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const supabase = useSupabase()

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setSubmissions(data || [])
    } catch (error) {
      console.error('Error loading submissions:', error)
      toast.error('Failed to load contact submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (submission: ContactSubmission, status: 'new' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', submission.id)

      if (error) throw error

      // Update local state
      setSubmissions(prev =>
        prev.map(sub => sub.id === submission.id ? { ...sub, status } : sub)
      )

      toast.success('Status updated')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleReply = async () => {
    if (!selectedSubmission || !reply.trim()) return

    try {
      setIsSending(true)

      // Call email API
      const emailRes = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedSubmission.email,
          subject: `Re: ${selectedSubmission.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <p>Dear ${selectedSubmission.first_name} ${selectedSubmission.last_name},</p>
              <p>${reply}</p>
              <p style="margin-top: 16px;">Best regards,<br>The Alpha Coaching Team</p>
              <hr style="margin-top: 24px;">
              <p style="color: #666; font-size: 12px;">
               ${reply}
              </p>
            </div>
          `,
          text: `Dear ${selectedSubmission.first_name} ${selectedSubmission.last_name},\n\n${reply}\n\nBest regards,\nThe Alpha Coaching Team\n\n---\nThis is in response to your inquiry: "${selectedSubmission.subject}"\nSubmitted on ${new Date(selectedSubmission.created_at).toLocaleDateString()}`,
        }),
      })

      if (!emailRes.ok) {
        throw new Error('Email sending failed')
      }

      // Update the status to resolved
      await handleStatusChange(selectedSubmission, 'resolved')

      toast.success('Reply sent successfully')
      setReplyModalOpen(false)
      setReply('')
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Failed to send reply')
    } finally {
      setIsSending(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <HelpCircle className="h-4 w-4 text-blue-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved':
        return <CheckCheck className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: { row: { original: ContactSubmission } }) => {
        const submission = row.original
        return (
          <div>
            <p className="font-medium">{`${submission.first_name} ${submission.last_name}`}</p>
            <p className="text-xs text-gray-500">{submission.email}</p>
          </div>
        )
      }
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }: { row: { original: ContactSubmission } }) => <div className="max-w-[250px] truncate" title={row.original.subject}>{row.original.subject}</div>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: ContactSubmission } }) => {
        const submission = row.original
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(submission.status)}
            {getStatusBadge(submission.status)}
          </div>
        )
      }
    },
    {
      accessorKey: "created_at",
      header: "Received",
      cell: ({ row }: { row: { original: ContactSubmission } }) => {
        const date = new Date(row.original.created_at)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: ContactSubmission } }) => {
        const submission = row.original

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
              <DropdownMenuItem onClick={() => {
                setSelectedSubmission(submission)
                setViewModalOpen(true)
              }}>
                <MessageSquare className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedSubmission(submission)
                setReplyModalOpen(true)
              }}>
                <Mail className="h-4 w-4 mr-2" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Set Status</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleStatusChange(submission, 'new')}
                disabled={submission.status === 'new'}
                className={submission.status === 'new' ? 'text-blue-500 font-medium' : ''}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                New
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(submission, 'in_progress')}
                disabled={submission.status === 'in_progress'}
                className={submission.status === 'in_progress' ? 'text-yellow-500 font-medium' : ''}
              >
                <Clock className="h-4 w-4 mr-2" />
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(submission, 'resolved')}
                disabled={submission.status === 'resolved'}
                className={submission.status === 'resolved' ? 'text-green-500 font-medium' : ''}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Resolved
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Contact Submissions</h2>
        <p className="text-gray-600 mt-2">Manage and respond to contact form submissions</p>
      </div>

      <DataTable
        columns={columns}
        data={submissions}
        searchKey="subject"
        searchPlaceholder="Search by subject..."
      />

      {/* View Modal */}
      <Modal
        title="Contact Details"
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500">Name</h4>
                <p>{selectedSubmission.first_name} {selectedSubmission.last_name}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Email</h4>
                <p className="break-all">{selectedSubmission.email}</p>
              </div>
              {selectedSubmission.phone && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Phone</h4>
                  <p>{selectedSubmission.phone}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-sm text-gray-500">Status</h4>
                <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
              </div>
              <div className="col-span-2">
                <h4 className="font-medium text-sm text-gray-500">Subject</h4>
                <p>{selectedSubmission.subject}</p>
              </div>
              <div className="col-span-2">
                <h4 className="font-medium text-sm text-gray-500">Message</h4>
                <p className="whitespace-pre-line bg-gray-50 p-4 rounded-md">{selectedSubmission.message}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewModalOpen(false)
                  setReplyModalOpen(true)
                }}
              >
                Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal
        title="Reply to Contact"
        isOpen={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500">To</h4>
                <p>
                  {selectedSubmission.first_name} {selectedSubmission.last_name} (
                  <span className="text-blue-600">{selectedSubmission.email}</span>)
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Subject</h4>
                <Input
                  value={`Re: ${selectedSubmission.subject}`}
                  disabled
                />
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Original Message</h4>
                <div className="text-sm bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                  {selectedSubmission.message}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Your Reply</h4>
                <Textarea
                  placeholder="Type your response here..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="min-h-32"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setReplyModalOpen(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReply}
                disabled={!reply.trim() || isSending}
              >
                {isSending ? (
                  <>Sending...</>
                ) : (
                  <>Send Reply</>
                )}
              </Button>
            </div>
          </div>
        )}
        {/* Alert */}
        {alert && (
          <Alert className={alert.type === "success" ? "border-green-500" : "border-red-500"}>
            <AlertDescription className={alert.type === "success" ? "text-green-700" : "text-red-700"}>
              {alert?.message}
            </AlertDescription>
          </Alert>
        )}
      </Modal>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <div className="h-3 w-3 bg-blue-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.filter((c) => c.status === "new").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-3 w-3 bg-yellow-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.filter((c) => c.status === "in_progress").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <div className="h-3 w-3 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.filter((c) => c.status === "resolved").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search contact submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value: "all" | "new" | "in_progress" | "resolved") => setStatusFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadSubmissions} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {submission.first_name} {submission.last_name}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {submission.email}
                    </span>
                    {submission.phone && (
                      <span className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {submission.phone}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(submission.created_at).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(submission.status)}
                    {getStatusBadge(submission.status)}
                  </div> <Select
                    value={submission.status}
                    onValueChange={(value: "new" | "in_progress" | "resolved") => handleStatusChange(submission, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Subject:</h4>
                  <p className="text-gray-700">{submission.subject}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Message:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{submission.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredContacts.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No contact submissions found matching your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>

  )
}
