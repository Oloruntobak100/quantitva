'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, MapPin, ChevronRight, TrendingUp, Clock, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Report {
  id: string
  scheduleId?: string
  title: string
  category: string
  subNiche: string
  geography: string
  email: string
  dateGenerated: string
  type: 'On-demand' | 'Recurring'
  webReport: string
  emailReport: string
  frequency?: string
  isFirstRun?: boolean
  runAt?: string
  createdAt?: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/reports')
      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }
      const data = await response.json()
      setReports(data.reports || [])
    } catch (error) {
      console.error('Error loading reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const response = await fetch(`/api/reports/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete report')
        }
        await loadReports()
        toast.success('Report deleted successfully')
      } catch (error) {
        console.error('Error deleting report:', error)
        toast.error('Failed to delete report')
      }
    }
  }

  // Calculate stats
  const thisMonth = reports.filter(r => {
    const reportDate = new Date(r.dateGenerated)
    const now = new Date()
    return reportDate.getMonth() === now.getMonth() && 
           reportDate.getFullYear() === now.getFullYear()
  }).length

  const latestReport = reports[0]?.dateGenerated || 'N/A'

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading reports...</div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Research Reports</h2>
            <p className="text-gray-600">
              View and analyze your generated market intelligence reports
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadReports}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{thisMonth}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Latest Report</p>
                  <p className="text-lg font-bold text-gray-900">{latestReport.split(',')[0] || 'None'}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title and Type */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {report.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-normal">
                            {report.category}
                          </Badge>
                          <Badge 
                            variant={report.type === 'Recurring' ? 'default' : 'outline'}
                            className="font-normal"
                          >
                            {report.type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3 ml-13">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{report.dateGenerated}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{report.geography}</span>
                      </div>
                    </div>

                    {/* Sub-niche */}
                    <p className="text-sm text-gray-600 ml-13">
                      Focus: {report.subNiche}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex gap-2">
                    <Link href={`/dashboard/reports/${report.id}`}>
                      <Button variant="outline" className="gap-2">
                        View Report
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(report.id, report.title)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (hidden when reports exist) */}
        {reports.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No reports yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first market research request to get started
              </p>
              <Link href="/dashboard/new-research">
                <Button>Create New Research</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
