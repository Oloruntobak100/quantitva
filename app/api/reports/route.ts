// GET /api/reports - Fetch all reports from Supabase

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // ===== STEP 1: AUTHENTICATE USER =====
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'You must be logged in to access reports' },
        { status: 401 }
      )
    }
    
    console.log('✅ Authenticated user for reports:', user.id)
    
    // Get optional parameters from query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const scheduleId = searchParams.get('schedule_id') // Optional filter by schedule

    // ===== STEP 2: BUILD QUERY WITH USER FILTER =====
    let query = supabaseAdmin
      .from('reports')
      .select('*')
      .eq('user_id', user.id) // CRITICAL: Only fetch user's own reports
      .order('run_at', { ascending: false })
      .limit(limit)

    // Apply schedule filter if provided
    if (scheduleId) {
      query = query.eq('schedule_id', scheduleId)
    }

    // Fetch reports from Supabase
    const { data: reports, error } = await query

    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports', details: error.message },
        { status: 500 }
      )
    }

    // Transform reports to match the frontend Report interface
    const transformedReports = (reports || []).map((report) => ({
      id: report.execution_id,
      scheduleId: report.schedule_id,
      title: `${report.industry} - ${report.sub_niche}`,
      category: report.industry,
      subNiche: report.sub_niche,
      geography: report.geography || 'Global',
      email: report.email || '',
      dateGenerated: new Date(report.run_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      type: report.frequency === 'on-demand' ? 'On-demand' : 'Recurring',
      webReport: report.final_report || '',
      emailReport: report.email_report || report.final_report || '',
      frequency: report.frequency,
      isFirstRun: report.is_first_run,
      runAt: report.run_at,
      createdAt: report.created_at,
    }))

    return NextResponse.json({
      success: true,
      total: transformedReports.length,
      reports: transformedReports
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

