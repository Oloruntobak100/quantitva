// GET /api/reports - Fetch all reports from Supabase

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // ===== STEP 1: CREATE SUPABASE CLIENT WITH COOKIES =====
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options)
          },
        },
      }
    )
    
    // ===== STEP 2: GET AUTHENTICATED USER =====
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('❌ Auth error:', authError?.message || 'No user found')
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          details: 'You must be logged in to access reports',
          hint: 'Please login and try again'
        },
        { status: 401 }
      )
    }
    
    console.log('✅ Authenticated user for reports:', user.id, user.email)
    
    // ===== STEP 3: CHECK USER ROLE =====
    const isAdmin = user.user_metadata?.role === 'admin' || 
                    user.app_metadata?.role === 'admin' ||
                    user.email === 'admin@quantitva.com'
    
    console.log(`🔐 User role: ${isAdmin ? 'ADMIN' : 'USER'} for ${user.email}`)
    
    // ===== STEP 4: GET QUERY PARAMETERS =====
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const scheduleId = searchParams.get('schedule_id')

    // ===== STEP 5: BUILD QUERY WITH ROLE-BASED ACCESS =====
    let query = supabaseAdmin
      .from('reports')
      .select('*')
    
    // ADMINS: See all reports
    // USERS: See only their own reports (strict isolation)
    if (!isAdmin) {
      query = query.eq('user_id', user.id) // ← STRICT: Only user's reports
      console.log('👤 USER mode: Filtering by user_id =', user.id)
    } else {
      console.log('👑 ADMIN mode: Fetching ALL reports')
    }
    
    query = query.order('run_at', { ascending: false }).limit(limit)

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

    const response = NextResponse.json({
      success: true,
      total: transformedReports.length,
      reports: transformedReports
    })
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  } catch (error) {
    console.error('Unexpected error in GET /api/reports:', error)
    const errorResponse = NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    
    // Add CORS headers to error response too
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    
    return errorResponse
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

