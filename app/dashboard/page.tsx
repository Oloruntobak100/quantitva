'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Calendar, Clock, Plus, TrendingUp, BarChart3, ArrowUpRight, Repeat, Zap } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { withAuth } from '@/lib/auth/protected-route'

interface DashboardStats {
  totalReports: number
  onDemandReports: number
  recurringReports: number
  activeSchedules: number
  nextSchedule: {
    title: string
    nextRun: string
    frequency: string
  } | null
  lastReport: {
    title: string
    date: string
    time: string
    type: string
  } | null
}

function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    onDemandReports: 0,
    recurringReports: 0,
    activeSchedules: 0,
    nextSchedule: null,
    lastReport: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Fetch reports
      const reportsResponse = await fetch('/api/reports')
      const reportsData = await reportsResponse.json()
      const reports = reportsData.reports || []
      
      // Fetch schedules
      const schedulesResponse = await fetch('/api/schedules/active')
      const schedulesData = await schedulesResponse.json()
      const schedules = schedulesData.schedules || []
      
      // Calculate report stats
      const onDemandReports = reports.filter((r: any) => r.type === 'On-demand').length
      const recurringReports = reports.filter((r: any) => r.type === 'Recurring').length
      
      // Get next upcoming schedule
      let nextSchedule = null
      if (schedules.length > 0) {
        const upcomingSchedules = schedules
          .filter((s: any) => s.active && s.next_run)
          .sort((a: any, b: any) => new Date(a.next_run).getTime() - new Date(b.next_run).getTime())
        
        if (upcomingSchedules.length > 0) {
          const next = upcomingSchedules[0]
          const nextRunDate = new Date(next.next_run)
          nextSchedule = {
            title: `${next.industry} - ${next.sub_niche}`,
            nextRun: nextRunDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            }),
            frequency: next.frequency
          }
        }
      }
      
      // Get last report
      let lastReport = null
      if (reports.length > 0) {
        const latest = reports[0]
        const date = new Date(latest.runAt || latest.dateGenerated)
        lastReport = {
          title: latest.title,
          date: date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          time: date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          type: latest.type
        }
      }
      
      setStats({
        totalReports: reports.length,
        onDemandReports,
        recurringReports,
        activeSchedules: schedules.filter((s: any) => s.active).length,
        nextSchedule,
        lastReport
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get user's name from metadata or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          Welcome back, {userName}! 👋
        </h2>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg">
          Here's an overview of your market intelligence activity
        </p>
      </div>

      {/* Create New Research Button */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <Link href="/dashboard/new-research" className="block sm:inline-block">
          <Button size="lg" className="gap-2 h-12 md:h-12 px-4 sm:px-5 md:px-6 text-sm md:text-base w-full sm:w-auto">
            <Plus className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="truncate">Create New Market Research</span>
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {/* Total Reports Card - Clickable */}
        <Card 
          className="border-2 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => router.push('/dashboard/reports')}
        >
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                <span>Total Reports</span>
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl sm:text-2xl font-bold text-gray-400 animate-pulse">
                Loading...
              </div>
            ) : (
              <>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {stats.totalReports}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      <span>On-demand</span>
                    </span>
                    <span className="font-semibold text-gray-900">{stats.onDemandReports}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Repeat className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <span>Recurring</span>
                    </span>
                    <span className="font-semibold text-gray-900">{stats.recurringReports}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Schedules Card - Clickable */}
        <Card 
          className="border-2 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => router.push('/dashboard/schedules')}
        >
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                <span>Active Schedules</span>
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl sm:text-2xl font-bold text-gray-400 animate-pulse">
                Loading...
              </div>
            ) : (
              <>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {stats.activeSchedules}
                </div>
                {stats.nextSchedule ? (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600 truncate">
                      Next: {stats.nextSchedule.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {stats.nextSchedule.nextRun}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium capitalize">
                      {stats.nextSchedule.frequency}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500">
                    No upcoming schedules
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Last Research Run Card */}
        <Card 
          className="border-2 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => stats.lastReport && router.push('/dashboard/reports')}
        >
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                <span>Last Research Run</span>
                {stats.lastReport && (
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl sm:text-2xl font-bold text-gray-400 animate-pulse">
                Loading...
              </div>
            ) : stats.lastReport ? (
              <>
                <div className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {stats.lastReport.title}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                  {stats.lastReport.date}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-500 truncate">
                    at {stats.lastReport.time}
                  </p>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${
                    stats.lastReport.type === 'On-demand' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {stats.lastReport.type}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-lg sm:text-xl font-bold text-gray-400 mb-1">
                  No reports yet
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Create your first research
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg md:text-xl">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <Link href="/dashboard/new-research">
              <Button variant="outline" className="w-full justify-start gap-2 sm:gap-3 h-11 sm:h-12 min-h-[48px]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <span className="font-medium text-sm md:text-base truncate">Create New Research</span>
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button variant="outline" className="w-full justify-start gap-2 sm:gap-3 h-11 sm:h-12 min-h-[48px]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <span className="font-medium text-sm md:text-base truncate">View All Reports</span>
              </Button>
            </Link>
            <Link href="/dashboard/schedules">
              <Button variant="outline" className="w-full justify-start gap-2 sm:gap-3 h-11 sm:h-12 min-h-[48px]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                </div>
                <span className="font-medium text-sm md:text-base truncate">Manage Schedules</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span>Getting Started</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Tips to maximize your market intelligence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 md:space-y-4">
            <div className="flex gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                1
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm md:text-base text-gray-900">Set up your first research</p>
                <p className="text-xs md:text-sm text-gray-600">Define your market category and parameters</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                2
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm md:text-base text-gray-900">Schedule recurring reports</p>
                <p className="text-xs md:text-sm text-gray-600">Automate your market monitoring</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                3
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm md:text-base text-gray-900">Review insights</p>
                <p className="text-xs md:text-sm text-gray-600">Make data-driven decisions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuth(DashboardPage)
