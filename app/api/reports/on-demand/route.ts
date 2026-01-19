// POST /api/reports/on-demand - Save on-demand report to database
// This endpoint is called when webhook returns with report data

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export interface OnDemandReportRequest {
  user_id: string  // CRITICAL: Required for multi-user isolation
  industry: string
  sub_niche: string
  geography: string
  email: string
  final_report: string
  email_report?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: OnDemandReportRequest
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Request body must be valid JSON' },
        { status: 400 }
      )
    }

    console.log('📥 Received on-demand report:', body)

    // Validate required fields
    const errors: string[] = []
    if (!body.user_id) errors.push('user_id is required')
    if (!body.industry) errors.push('industry is required')
    if (!body.sub_niche) errors.push('sub_niche is required')
    if (!body.email) errors.push('email is required')
    if (!body.final_report) errors.push('final_report is required')

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors.join(', ') },
        { status: 400 }
      )
    }

    // Generate unique execution ID
    const execution_id = `ondemand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Save to Supabase reports table with user_id
    const { data: report, error: insertError } = await supabaseAdmin
      .from('reports')
      .insert({
        execution_id,
        schedule_id: null, // On-demand reports don't have a schedule
        user_id: body.user_id, // CRITICAL: User isolation
        industry: body.industry,
        sub_niche: body.sub_niche,
        frequency: 'on-demand',
        run_at: new Date().toISOString(),
        is_first_run: true,
        final_report: body.final_report,
        email_report: body.email_report || body.final_report,
        geography: body.geography || 'Global',
        email: body.email,
        notes: body.notes || '',
        status: 'success',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error saving report to Supabase:', insertError)
      return NextResponse.json(
        { error: 'Failed to save report', details: insertError.message },
        { status: 500 }
      )
    }

    console.log('✅ Report saved successfully:', execution_id)

    return NextResponse.json({
      success: true,
      execution_id,
      report_id: execution_id,
      message: 'On-demand report saved successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Unexpected error in POST /api/reports/on-demand:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

