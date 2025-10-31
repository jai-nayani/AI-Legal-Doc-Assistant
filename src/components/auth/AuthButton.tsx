'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { LogOut, User } from 'lucide-react'

export default function AuthButton() {
  const { user, profile, signOut, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {profile?.full_name || user.email?.split('@')[0]}
          </p>
          {profile?.firm_name && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {profile.firm_name}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={signOut}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}

