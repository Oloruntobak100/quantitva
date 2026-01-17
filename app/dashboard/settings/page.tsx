'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Repeat
} from 'lucide-react'
import { WebhookConfig, WebhookType, getWebhooks, saveWebhooks } from '@/lib/webhooks'
import { toast } from 'sonner'
import { withAuth } from '@/lib/auth/protected-route'

function SettingsPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null)
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'on-demand' as WebhookType,
    description: '',
  })

  // Load webhooks from localStorage on mount
  useEffect(() => {
    setWebhooks(getWebhooks())
    setIsLoaded(true)
  }, [])

  // Save webhooks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveWebhooks(webhooks)
    }
  }, [webhooks, isLoaded])

  const handleOpenDialog = (webhook?: WebhookConfig) => {
    if (webhook) {
      setEditingWebhook(webhook)
      setFormData({
        name: webhook.name,
        url: webhook.url,
        type: webhook.type,
        description: webhook.description || '',
      })
    } else {
      setEditingWebhook(null)
      setFormData({ name: '', url: '', type: 'on-demand', description: '' })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingWebhook(null)
    setFormData({ name: '', url: '', type: 'on-demand', description: '' })
  }

  const handleSaveWebhook = () => {
    if (editingWebhook) {
      // Update existing webhook
      setWebhooks(webhooks.map(w => 
        w.id === editingWebhook.id 
          ? { ...w, ...formData }
          : w
      ))
    } else {
      // Add new webhook
      const newWebhook: WebhookConfig = {
        id: Date.now().toString(),
        ...formData,
        active: true,
        createdAt: new Date().toISOString(),
      }
      setWebhooks([...webhooks, newWebhook])
    }
    handleCloseDialog()
  }

  const handleDeleteWebhook = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      setWebhooks(webhooks.filter(w => w.id !== id))
    }
  }

  const handleToggleActive = (id: string) => {
    setWebhooks(webhooks.map(w => 
      w.id === id ? { ...w, active: !w.active } : w
    ))
  }

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    setTestingWebhookId(webhook.id)

    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Test webhook from Market Intelligence Platform',
      webhookName: webhook.name,
    }

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })

      if (response.ok) {
        toast.success('Webhook test successful', {
          description: `${webhook.name} responded with status ${response.status}`,
        })
      } else {
        toast.error('Webhook test failed', {
          description: `${webhook.name} returned status ${response.status}`,
        })
      }
    } catch (error) {
      toast.error('Connection failed', {
        description: error instanceof Error ? error.message : 'Failed to reach webhook endpoint',
      })
    } finally {
      setTestingWebhookId(null)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-gray-600">
            Manage webhooks and application configuration
          </p>
        </div>

        {/* Webhook Management Section */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Webhook className="w-5 h-5 text-blue-600" />
                  <CardTitle>Webhook Configuration</CardTitle>
                </div>
                <CardDescription>
                  Manage webhook endpoints for your research requests and notifications
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Webhook
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingWebhook ? 'Edit Webhook' : 'Add New Webhook'}
                    </DialogTitle>
                    <DialogDescription>
                      Configure a webhook endpoint to receive data from your research requests
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Webhook Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Research Request Handler"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Webhook Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: WebhookType) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on-demand">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-blue-600" />
                              <span>On-Demand Research</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="recurring">
                            <div className="flex items-center gap-2">
                              <Repeat className="w-4 h-4 text-purple-600" />
                              <span>Recurring Research</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {formData.type === 'on-demand' 
                          ? 'Handles immediate research requests' 
                          : 'Handles scheduled recurring research'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">Webhook URL *</Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://your-webhook-url.com/endpoint"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="What does this webhook do?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveWebhook}
                      disabled={!formData.name || !formData.url}
                    >
                      {editingWebhook ? 'Save Changes' : 'Add Webhook'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <div className="text-center py-12">
                <Webhook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No webhooks configured
                </h3>
                <p className="text-gray-600 mb-6">
                  Add your first webhook to start receiving research request data
                </p>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Webhook
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Webhooks Table */}
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhooks.map((webhook) => (
                        <TableRow key={webhook.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {webhook.name}
                              </div>
                              {webhook.description && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {webhook.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={webhook.type === 'on-demand' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : 'bg-purple-50 text-purple-700 border-purple-200'}
                            >
                              {webhook.type === 'on-demand' ? (
                                <>
                                  <Zap className="w-3 h-3 mr-1" />
                                  On-Demand
                                </>
                              ) : (
                                <>
                                  <Repeat className="w-3 h-3 mr-1" />
                                  Recurring
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {webhook.url.length > 40
                                ? webhook.url.substring(0, 40) + '...'
                                : webhook.url}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={webhook.active ? 'default' : 'secondary'}
                              className="cursor-pointer"
                              onClick={() => handleToggleActive(webhook.id)}
                            >
                              {webhook.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleTestWebhook(webhook)}
                                disabled={testingWebhookId === webhook.id}
                              >
                                {testingWebhookId === webhook.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Testing...
                                  </>
                                ) : (
                                  <>
                                    <TestTube2 className="w-4 h-4" />
                                    Test
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(webhook)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteWebhook(webhook.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Info Card */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">
                          How Webhooks Work
                        </h4>
                        <p className="text-sm text-blue-800">
                          When a research request is submitted, the data will be sent to all active 
                          webhooks via POST request with JSON payload. Use the Test button to verify 
                          your endpoint is working correctly.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuth(SettingsPage)
