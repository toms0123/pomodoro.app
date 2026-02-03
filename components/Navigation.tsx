'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }
  
  const isActive = (path: string) => pathname === path
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-mono-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Pomodoro
            </Link>
            
            <div className="hidden md:flex space-x-1">
              <Link
                href="/"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/') 
                    ? 'bg-mono-100 text-mono-900' 
                    : 'text-mono-600 hover:text-mono-900 hover:bg-mono-50'
                }`}
              >
                Timer
              </Link>
              <Link
                href="/sessions"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/sessions') 
                    ? 'bg-mono-100 text-mono-900' 
                    : 'text-mono-600 hover:text-mono-900 hover:bg-mono-50'
                }`}
              >
                Sessions
              </Link>
              <Link
                href="/settings"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/settings') 
                    ? 'bg-mono-100 text-mono-900' 
                    : 'text-mono-600 hover:text-mono-900 hover:bg-mono-50'
                }`}
              >
                Settings
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-mono-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-mono-600 hover:text-mono-900 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 text-sm font-medium bg-mono-900 text-white rounded-md hover:bg-mono-800 transition-colors"
              >
                Sign in with Google
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-mono-600 hover:text-mono-900"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-mono-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/') ? 'bg-mono-100 text-mono-900' : 'text-mono-600'
              }`}
            >
              Timer
            </Link>
            <Link
              href="/sessions"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/sessions') ? 'bg-mono-100 text-mono-900' : 'text-mono-600'
              }`}
            >
              Sessions
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/settings') ? 'bg-mono-100 text-mono-900' : 'text-mono-600'
              }`}
            >
              Settings
            </Link>
            
            <div className="pt-4 border-t border-mono-200">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-mono-600">{user.email}</div>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-mono-600"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleSignIn()
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 text-sm font-medium bg-mono-900 text-white rounded-md"
                >
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
