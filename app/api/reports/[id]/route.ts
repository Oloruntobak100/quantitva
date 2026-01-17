// DELETE /api/reports/[id] - Delete a specific report

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id

    if (!executionId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      )
    }

    // Delete report from Supabase
    const { error } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('execution_id', executionId)

    if (error) {
      console.error('Error deleting report:', error)
      return NextResponse.json(
        { error: 'Failed to delete report', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/reports/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/reports/[id] - Get a specific report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id

    if (!executionId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      )
    }

    // Fetch report from Supabase
    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('execution_id', executionId)
      .single()

    if (error) {
      console.error('Error fetching report:', error)
      return NextResponse.json(
        { error: 'Failed to fetch report', details: error.message },
        { status: 500 }
      )
    }

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Transform report to match frontend interface
    const transformedReport = {
      id: report.execution_id,
      scheduleId: report.schedule_id,
      title: `${report.industry} - ${report.sub_niche}`,
      category: report.industry,
      subNiche: report.sub_niche,
      geography: 'Global',
      email: '',
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
    }

    return NextResponse.json({
      success: true,
      report: transformedReport
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/reports/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

