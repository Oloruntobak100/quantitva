// GET /api/schedules/active - Fetch active schedules for dashboard

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Create Supabase client with user authentication
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
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'You must be logged in' },
        { status: 401 }
      )
    }
    
    // Check if admin
    const isAdmin = user.user_metadata?.role === 'admin' || 
                    user.app_metadata?.role === 'admin' ||
                    user.email === 'admin@quantitva.com' ||
                    user.email === 'pat2echo@gmail.com' // Super Admin
    
    // Build query
    let query = supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('active', true)
      .order('next_run', { ascending: true })
    
    // Filter by user if not admin
    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }
    
    const { data: schedules, error } = await query
    
    if (error) {
      console.error('Error fetching active schedules:', error)
      return NextResponse.json(
        { error: 'Failed to fetch schedules', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      count: schedules?.length || 0,
      schedules: schedules || []
    })
    
  } catch (error) {
    console.error('Unexpected error in GET /api/schedules/active:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

