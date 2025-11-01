import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 🔥 HARDCODED FOR DEMO/REVIEW - Remove after job application review period
  // These credentials are for a demo Supabase project with limited scope
  const supabaseUrl = 'https://aniuponeoyobbpqcdwpt.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuaXVwb25lb3lvYmJwcWNkd3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzY1OTYsImV4cCI6MjA3NzUxMjU5Nn0.hi8CHLurx5XcyffOx6QoxsonCw1T_1RYeavUbypEWSM'

  // Debug: Log to verify values (remove after testing)
  console.log('Creating Supabase client with:', {
    url: supabaseUrl,
    keyLength: supabaseKey.length,
    urlValid: !!supabaseUrl,
    keyValid: !!supabaseKey
  })

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Missing Supabase credentials: URL=${!!supabaseUrl}, Key=${!!supabaseKey}`)
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

