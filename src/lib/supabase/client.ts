import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 🔥 HARDCODED FOR DEMO/REVIEW - Remove after job application review period
  // These credentials are for a demo Supabase project with limited scope
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aniuponeoyobbpqcdwpt.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuaXVwb25lb3lvYmJwcWNkd3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzY1OTYsImV4cCI6MjA3NzUxMjU5Nn0.hi8CHLurx5XcyffOx6QoxsonCw1T_1RYeavUbypEWSM'

  return createBrowserClient(supabaseUrl, supabaseKey)
}

