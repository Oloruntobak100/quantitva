// GET /api/reports - Fetch all reports from Supabase

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // ===== STEP 1: GET USER FROM AUTHORIZATION HEADER OR COOKIES =====
    const cookieStore = await cookies()
    
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    let accessToken = authHeader?.replace('Bearer ', '')
    
    // If no header, try cookies with various possible names
    if (!accessToken) {
      // Get all cookies and log them for debugging
      const allCookies = cookieStore.getAll()
      console.log('🍪 Available cookies:', allCookies.map(c => c.name))
      
      // Try common Supabase cookie patterns
      const authCookie = allCookies.find(c => 
        c.name.includes('auth') || 
        c.name.includes('supabase') ||
        c.name.includes('sb-')
      )
      
      if (authCookie) {
        console.log('🍪 Found auth cookie:', authCookie.name)
        // If it's a JSON cookie, try to parse it
        try {
          const parsed = JSON.parse(authCookie.value)
          accessToken = parsed.access_token || parsed.accessToken
        } catch {
          accessToken = authCookie.value
        }
      }
    }
    
    if (!accessToken) {
      console.log('❌ No access token found - available cookies:', cookieStore.getAll().map(c => c.name).join(', '))
      
      // TEMPORARY: Return empty list instead of 401 to debug
      return NextResponse.json({
        success: true,
        total: 0,
        reports: [],
        debug: {
          message: 'No authentication - please login',
          cookies: cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
        }
      })
    }
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)
    
    if (authError || !user) {
      console.log('❌ Auth error:', authError?.message || 'No user found')
      
      // TEMPORARY: Return empty list to debug
      return NextResponse.json({
        success: true,
        total: 0,
        reports: [],
        debug: {
          message: 'Authentication failed',
          error: authError?.message
        }
      })
    }
    
    console.log('✅ Authenticated user for reports:', user.id)
    
    // ===== STEP 2: CHECK USER ROLE =====
    // Check if user is admin by querying user metadata or role
    const isAdmin = user.user_metadata?.role === 'admin' || 
                    user.app_metadata?.role === 'admin' ||
                    user.email === 'admin@quantitva.com' // Fallback admin email check
    
    console.log(`🔐 User role: ${isAdmin ? 'ADMIN' : 'USER'}`)
    
    // Get optional parameters from query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const scheduleId = searchParams.get('schedule_id') // Optional filter by schedule

    // ===== STEP 3: BUILD QUERY WITH ROLE-BASED ACCESS =====
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

