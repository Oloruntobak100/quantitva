'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Settings, 
  Plus, 
  Webhook, 
  Edit, 
  Trash2, 
  TestTube2,
  Loader2,
  Zap,
  Repeat,
  Users,
  ShieldCheck,
  User,
  AlertCircle
} from 'lucide-react'
import { WebhookConfig, WebhookType, getWebhooks } from '@/lib/webhooks'
import { toast } from 'sonner'
import { withAuth } from '@/lib/auth/protected-route'
import { getCurrentUserProfile, getAllUsers, createUser, updateUser, deleteUser, UserProfile } from '@/lib/auth/user-service'

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  
  // User management state
  const [users, setUsers] = useState<UserProfile[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    role: 'user' as 'admin' | 'user',
  })

  // Load current user profile
  useEffect(() => {
    async function loadProfile() {
      const { data } = await getCurrentUserProfile()
      if (data) {
        setCurrentUser(data)
      }
    }
    loadProfile()
  }, [])

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setUsersLoading(true)
    const { data, error } = await getAllUsers()
    
    if (error) {
      toast.error('Failed to load users', {
        description: error
      })
    } else if (data) {
      setUsers(data)
    }
    
    setUsersLoading(false)
  }


  // User management handlers
  const handleOpenUserDialog = (user?: UserProfile) => {
    if (user) {
      setEditingUser(user)
      setUserFormData({
        email: user.email,
        password: '',
        full_name: user.full_name || '',
        company_name: user.company_name || '',
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setUserFormData({
        email: '',
        password: '',
        full_name: '',
        company_name: '',
        role: 'user',
      })
    }
    setIsUserDialogOpen(true)
  }

  const handleCloseUserDialog = () => {
    setIsUserDialogOpen(false)
    setEditingUser(null)
    setUserFormData({
      email: '',
      password: '',
      full_name: '',
      company_name: '',
      role: 'user',
    })
  }

  const handleSaveUser = async () => {
    // Validate
    if (!userFormData.email) {
      toast.error('Email is required')
      return
    }

    if (!editingUser && !userFormData.password) {
      toast.error('Password is required for new users')
      return
    }

    setFormLoading(true)

    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          full_name: userFormData.full_name,
          company_name: userFormData.company_name,
        }

        // Only include role if changed and not editing self
        if (userFormData.role !== editingUser.role && editingUser.id !== currentUser?.id) {
          updateData.role = userFormData.role
        }

        // Only include email if changed
        if (userFormData.email !== editingUser.email) {
          updateData.email = userFormData.email
        }

        const { error } = await updateUser(editingUser.id, updateData)

        if (error) {
          toast.error('Failed to update user', {
            description: typeof error === 'string' ? error : error.message
          })
        } else {
          toast.success('User updated successfully')
          handleCloseUserDialog()
          await loadUsers()
        }
      } else {
        // Create new user
        const { error } = await createUser({
          email: userFormData.email,
          password: userFormData.password,
          full_name: userFormData.full_name,
          company_name: userFormData.company_name,
          role: userFormData.role,
        })

        if (error) {
          toast.error('Failed to create user', {
            description: typeof error === 'string' ? error : error.message
          })
        } else {
          toast.success('User created successfully')
          handleCloseUserDialog()
          await loadUsers()
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Cannot delete your own account')
      return
    }

    setFormLoading(true)

    const { error } = await deleteUser(userId)

    if (error) {
      toast.error('Failed to delete user', {
        description: typeof error === 'string' ? error : error.message
      })
    } else {
      toast.success('User deleted successfully')
      setDeleteConfirmId(null)
      await loadUsers()
    }

    setFormLoading(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-sm md:text-base text-gray-600">
            Manage webhooks, users, and application configuration
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="w-full grid grid-cols-1 h-auto">
            <TabsTrigger value="users" className="gap-2 min-h-[44px] text-sm sm:text-base">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>User Management</span>
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <div className="space-y-4 md:space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                          Total Users
                        </CardTitle>
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {users.length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                          Administrators
                        </CardTitle>
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {users.filter(u => u.role === 'admin').length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                          Regular Users
                        </CardTitle>
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {users.filter(u => u.role === 'user').length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Users Table */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg md:text-xl">All Users</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          View and manage all user accounts
                        </CardDescription>
                      </div>
                      <Button onClick={() => handleOpenUserDialog()} className="gap-2 w-full sm:w-auto min-h-[44px] text-sm sm:text-base">
                        <Plus className="w-4 h-4 flex-shrink-0" />
                        <span>Add User</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {usersLoading ? (
                      <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                      </div>
                    ) : (
                      <div className="rounded-lg border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[180px] sm:min-w-[200px]">User</TableHead>
                              <TableHead className="min-w-[120px] sm:min-w-[150px] hidden md:table-cell">Company</TableHead>
                              <TableHead className="min-w-[80px] sm:min-w-[100px]">Role</TableHead>
                              <TableHead className="min-w-[100px] sm:min-w-[120px] hidden lg:table-cell">Joined</TableHead>
                              <TableHead className="min-w-[100px] sm:min-w-[120px] hidden xl:table-cell">Last Login</TableHead>
                              <TableHead className="text-right min-w-[100px] sm:min-w-[120px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500 text-sm">
                                  No users found
                                </TableCell>
                              </TableRow>
                            ) : (
                              users.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium text-gray-900 flex items-center gap-1.5 sm:gap-2 flex-wrap text-sm sm:text-base">
                                        <span className="truncate">{user.full_name || 'No name'}</span>
                                        {user.id === currentUser?.id && (
                                          <Badge variant="outline" className="text-xs flex-shrink-0">You</Badge>
                                        )}
                                      </div>
                                      <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <span className="text-xs sm:text-sm text-gray-600 truncate block">
                                      {user.company_name || '-'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                                      className={`${user.role === 'admin' 
                                        ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                        : ''} text-xs`}
                                    >
                                      {user.role === 'admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
                                      {user.role === 'user' && <User className="w-3 h-3 mr-1" />}
                                      <span className="hidden sm:inline">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell">
                                    <span className="text-xs sm:text-sm text-gray-600">
                                      {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                  </TableCell>
                                  <TableCell className="hidden xl:table-cell">
                                    <span className="text-xs sm:text-sm text-gray-600">
                                      {user.last_login 
                                        ? new Date(user.last_login).toLocaleDateString()
                                        : 'Never'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenUserDialog(user)}
                                        className="min-h-[36px] min-w-[36px] text-xs sm:text-sm"
                                      >
                                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      </Button>
                                      {user.id !== currentUser?.id && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setDeleteConfirmId(user.id)}
                                          className="text-red-600 hover:text-red-700 min-h-[36px] min-w-[36px] text-xs sm:text-sm"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {editingUser 
                  ? 'Update user information and role'
                  : 'Create a new user account'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user-email" className="text-sm sm:text-base">Email Address *</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  disabled={formLoading}
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="user-password" className="text-sm sm:text-base">Password *</Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    disabled={formLoading}
                    className="text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="user-full_name" className="text-sm sm:text-base">Full Name</Label>
                <Input
                  id="user-full_name"
                  type="text"
                  placeholder="John Doe"
                  value={userFormData.full_name}
                  onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  disabled={formLoading}
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-company_name" className="text-sm sm:text-base">Company Name (Optional)</Label>
                <Input
                  id="user-company_name"
                  type="text"
                  placeholder="Company Inc."
                  value={userFormData.company_name}
                  onChange={(e) => setUserFormData({ ...userFormData, company_name: e.target.value })}
                  disabled={formLoading}
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-role" className="text-sm sm:text-base">Role *</Label>
                <Select
                  value={userFormData.role}
                  onValueChange={(value: 'admin' | 'user') => setUserFormData({ ...userFormData, role: value })}
                  disabled={formLoading || (editingUser?.id === currentUser?.id)}
                >
                  <SelectTrigger id="user-role" className="text-sm sm:text-base h-10 sm:h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-sm sm:text-base">User</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-sm sm:text-base">Administrator</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {editingUser?.id === currentUser?.id && (
                  <p className="text-xs text-amber-600">Cannot change your own role</p>
                )}
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleCloseUserDialog} disabled={formLoading} className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base">
                Cancel
              </Button>
              <Button onClick={handleSaveUser} disabled={formLoading} className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base">
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  editingUser ? 'Save Changes' : 'Create User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600 text-base sm:text-lg">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Delete User</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} disabled={formLoading} className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base">
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteConfirmId && handleDeleteUser(deleteConfirmId)}
                disabled={formLoading}
                className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default withAuth(SettingsPage)
