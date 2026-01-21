import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin' || 
                    user.app_metadata?.role === 'admin' ||
                    user.email === 'admin@quantitva.com'

    // Fetch all schedules
    let query = supabase
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: false })

    // If not admin, filter by user_id
    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data: schedules, error } = await query

    if (error) {
      console.error('Error fetching schedules:', error)
      return NextResponse.json(
        { error: 'Failed to fetch schedules', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      schedules: schedules || [],
      user_id: user.id,
      is_admin: isAdmin
    })
  } catch (error) {
    console.error('Unexpected error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

