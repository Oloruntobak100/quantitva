// lib/auth/user-service.ts
// Client-side service for user operations

import { supabase } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  role: 'admin' | 'user'
  last_login: string | null
  created_at: string
  updated_at: string
}

// Get current user's full profile including role
export async function getCurrentUserProfile(): Promise<{ data: UserProfile | null, error: any }> {
  try {
    // Get current auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { data: null, error: authError }
    }

    // Get user profile from users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data: data as UserProfile, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get all users (admin only)
export async function getAllUsers(): Promise<{ data: UserProfile[] | null, error: any }> {
  try {
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: new Error('Not authenticated') }
    }

    // Call API route
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return { data: null, error: error.error || 'Failed to fetch users' }
    }

    const { users } = await response.json()
    return { data: users, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Create new user (admin only)
export async function createUser(userData: {
  email: string
  password: string
  full_name?: string
  company_name?: string
  role?: 'admin' | 'user'
}): Promise<{ data: UserProfile | null, error: any }> {
  try {
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: new Error('Not authenticated') }
    }

    // Call API route
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      return { data: null, error: error.error || 'Failed to create user' }
    }

    const { user } = await response.json()
    return { data: user, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Update user (admin or own profile)
export async function updateUser(
  userId: string,
  userData: {
    email?: string
    full_name?: string
    company_name?: string
    role?: 'admin' | 'user'
  }
): Promise<{ data: UserProfile | null, error: any }> {
  try {
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: new Error('Not authenticated') }
    }

    // Call API route
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      return { data: null, error: error.error || 'Failed to update user' }
    }

    const { user } = await response.json()
    return { data: user, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Delete user (admin only)
export async function deleteUser(userId: string): Promise<{ error: any }> {
  try {
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { error: new Error('Not authenticated') }
    }

    // Call API route
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return { error: error.error || 'Failed to delete user' }
    }

    return { error: null }
  } catch (error) {
    return { error }
  }
}

