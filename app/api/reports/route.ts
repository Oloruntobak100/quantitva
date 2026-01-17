// GET /api/reports - Fetch all reports from Supabase

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get optional limit from query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Fetch reports from Supabase
    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .order('run_at', { ascending: false })
      .limit(limit)

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
      geography: 'Global', // Not stored yet, default
      email: '', // Not stored yet
      dateGenerated: new Date(report.run_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      type: report.frequency === 'on-demand' ? 'On-demand' : 'Recurring',
      webReport: report.final_report || '',
      emailReport: report.final_report || '',
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

