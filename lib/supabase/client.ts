// lib/supabase/client.ts
// Client-side Supabase client for browser usage

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Client-side Supabase client (for browser)
// This respects Row Level Security (RLS) policies and properly handles cookies
// Note: Placeholder values are used during build time, actual values loaded at runtime
export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

