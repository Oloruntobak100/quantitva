'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Calendar, MapPin, ChevronRight, TrendingUp, Clock, Trash2, RefreshCw, Search, Filter, X, User } from 'lucide-react'
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
  // Admin-only fields
  userId?: string
  userEmail?: string
  userName?: string
  userCompany?: string
}

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'category-asc'

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [geographyFilter, setGeographyFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all') // Admin-only: filter by user
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [showFilters, setShowFilters] = useState(false)

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
      setIsAdmin(data.isAdmin || false)
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

  // Get unique values for filters
  const uniqueCategories = useMemo(() => {
    const categories = new Set(reports.map(r => r.category))
    return Array.from(categories).sort()
  }, [reports])

  const uniqueGeographies = useMemo(() => {
    const geographies = new Set(reports.map(r => r.geography))
    return Array.from(geographies).sort()
  }, [reports])

  // Admin-only: Get unique users
  const uniqueUsers = useMemo(() => {
    if (!isAdmin) return []
    const users = new Set(reports.map(r => r.userName || 'Unknown').filter(Boolean))
    return Array.from(users).sort()
  }, [reports, isAdmin])

  // Filter and sort reports
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...reports]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query) ||
        r.subNiche.toLowerCase().includes(query) ||
        r.geography.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter)
    }

    // Apply geography filter
    if (geographyFilter !== 'all') {
      filtered = filtered.filter(r => r.geography === geographyFilter)
    }

    // Apply user filter (admin only)
    if (isAdmin && userFilter !== 'all') {
      filtered = filtered.filter(r => r.userName === userFilter)
    }

    // Apply sorting (always runs, even with default filters)
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          // Use runAt (ISO timestamp) for accurate date sorting, fallback to dateGenerated
          const dateA = a.runAt ? new Date(a.runAt).getTime() : new Date(a.dateGenerated).getTime()
          const dateB = b.runAt ? new Date(b.runAt).getTime() : new Date(b.dateGenerated).getTime()
          return dateB - dateA // Newest first (descending)
        case 'date-asc':
          const dateAsc1 = a.runAt ? new Date(a.runAt).getTime() : new Date(a.dateGenerated).getTime()
          const dateAsc2 = b.runAt ? new Date(b.runAt).getTime() : new Date(b.dateGenerated).getTime()
          return dateAsc1 - dateAsc2 // Oldest first (ascending)
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'category-asc':
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    return filtered
  }, [reports, searchQuery, categoryFilter, typeFilter, geographyFilter, sortBy])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setTypeFilter('all')
    setGeographyFilter('all')
    setUserFilter('all')
    setSortBy('date-desc')
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || 
                          typeFilter !== 'all' || geographyFilter !== 'all' || 
                          userFilter !== 'all' || sortBy !== 'date-desc'

  // Calculate stats (use original reports, not filtered)
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

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Search Bar and Filter Toggle */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search reports by title, category, or geography..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2 whitespace-nowrap"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && !showFilters && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      Active
                    </Badge>
                  )}
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="gap-2 whitespace-nowrap"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Options (collapsible) */}
            {showFilters && (
              <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 pt-4 border-t`}>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="On-demand">On-demand</SelectItem>
                      <SelectItem value="Recurring">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Geography
                  </label>
                  <Select value={geographyFilter} onValueChange={setGeographyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All geographies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Geographies</SelectItem>
                      {uniqueGeographies.map(geo => (
                        <SelectItem key={geo} value={geo}>{geo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin-only: User Filter */}
                {isAdmin && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      User
                    </label>
                    <Select value={userFilter} onValueChange={setUserFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {uniqueUsers.map(user => (
                          <SelectItem key={user} value={user}>{user}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                      <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                      <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                      <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredAndSortedReports.length} of {reports.length} reports
              {hasActiveFilters && (
                <span className="ml-2 text-blue-600 font-medium">
                  (filtered)
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredAndSortedReports.map((report, index) => {
            // Check if this is the most recent report (within last 24 hours)
            const isNew = index === 0 && (() => {
              const reportDate = new Date(report.runAt || report.dateGenerated)
              const hoursSinceReport = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60)
              return hoursSinceReport < 24
            })()
            
            return (
              <Card key={report.id} className="hover:border-blue-300 transition-colors relative overflow-hidden">
                {isNew && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-3 py-1 text-xs font-bold tracking-wider flex items-center gap-1 shadow-lg">
                      <span className="animate-pulse">●</span>
                      NEW
                    </div>
                  </div>
                )}
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
                    <p className="text-sm text-gray-600 ml-13 mb-2">
                      Focus: {report.subNiche}
                    </p>

                    {/* Admin-only: User Information */}
                    {isAdmin && report.userName && (
                      <div className="ml-13 mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <span className="font-medium">Generated by:</span>
                          </Badge>
                          <span className="font-medium text-gray-900">{report.userName}</span>
                          {report.userCompany && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600">{report.userCompany}</span>
                            </>
                          )}
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 text-xs">{report.userEmail}</span>
                        </div>
                      </div>
                    )}
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
            )
          })}
        </div>

        {/* Empty State */}
        {filteredAndSortedReports.length === 0 && reports.length > 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No reports match your filters
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Reports at All */}
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
