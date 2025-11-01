import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function createClient() {
  const cookieStore = await cookies()

  // 🔥 HARDCODED FOR DEMO/REVIEW - Remove after job application review period
  const supabaseUrl = 'https://aniuponeoyobbpqcdwpt.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuaXVwb25lb3lvYmJwcWNkd3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzY1OTYsImV4cCI6MjA3NzUxMjU5Nn0.hi8CHLurx5XcyffOx6QoxsonCw1T_1RYeavUbypEWSM'

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle error for Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle error for Server Components
          }
        },
      },
    }
  )
}

