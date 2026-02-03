'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { audioManager } from '@/lib/audioManager'
import { motion } from 'framer-motion'
import { DEFAULT_PREFERENCES } from '@/lib/useLocalStorage'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES)
  
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: prefs } = await supabase
          .from('preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (prefs) {
          setPreferences({
            auto_start_sessions: prefs.auto_start_sessions,
            auto_start_breaks: prefs.auto_start_breaks,
            volume: prefs.volume,
            sound_theme: prefs.sound_theme,
            monthly_email_opt_in: prefs.monthly_email_opt_in,
          })
        }
      } else {
        // Load from localStorage
        const localPrefs = localStorage.getItem('pomodoro_preferences')
        if (localPrefs) {
          setPreferences(JSON.parse(localPrefs))
        }
      }
      
      setLoading(false)
    }
    
    loadData()
  }, [])
  
  // Update audio manager when preferences change
  useEffect(() => {
    audioManager.setVolume(preferences.volume)
    audioManager.setTheme(preferences.sound_theme)
  }, [preferences.volume, preferences.sound_theme])
  
  const savePreferences = async () => {
    setSaving(true)
    
    if (user) {
      const { error } = await supabase
        .from('preferences')
        .update({
          auto_start_sessions: preferences.auto_start_sessions,
          auto_start_breaks: preferences.auto_start_breaks,
          volume: preferences.volume,
          sound_theme: preferences.sound_theme,
          monthly_email_opt_in: preferences.monthly_email_opt_in,
        })
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Failed to save preferences:', error)
        alert('Failed to save preferences')
      } else {
        alert('Preferences saved!')
      }
    } else {
      localStorage.setItem('pomodoro_preferences', JSON.stringify(preferences))
      alert('Preferences saved locally!')
    }
    
    setSaving(false)
  }
  
  const testSound = () => {
    audioManager.playStartSound()
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-mono-500">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-mono-600">Customize your Pomodoro experience</p>
      </div>
      
      {!user && (
        <div className="mb-8 p-4 bg-mono-100 border border-mono-200 rounded-lg">
          <p className="text-sm text-mono-700">
            You're in local mode. Sign in to sync your settings across devices.
          </p>
        </div>
      )}
      
      <div className="space-y-8">
        {/* Auto-start Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white border border-mono-200 rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Auto-start</h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium">Auto-start breaks</div>
                <div className="text-sm text-mono-600">Automatically start break timer when a Pomodoro ends</div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={preferences.auto_start_breaks}
                  onChange={(e) => setPreferences({ ...preferences, auto_start_breaks: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-mono-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-mono-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-mono-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mono-900"></div>
              </div>
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium">Auto-start sessions</div>
                <div className="text-sm text-mono-600">Automatically start next Pomodoro when a break ends</div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={preferences.auto_start_sessions}
                  onChange={(e) => setPreferences({ ...preferences, auto_start_sessions: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-mono-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-mono-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-mono-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mono-900"></div>
              </div>
            </label>
          </div>
        </motion.section>
        
        {/* Audio Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-mono-200 rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Audio</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Sound Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {(['default', 'soft', 'loud'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setPreferences({ ...preferences, sound_theme: theme })}
                    className={`px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                      preferences.sound_theme === theme
                        ? 'bg-mono-900 text-white border-mono-900'
                        : 'bg-white text-mono-700 border-mono-300 hover:border-mono-400'
                    }`}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Volume</label>
                <span className="text-sm text-mono-600">{Math.round(preferences.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={preferences.volume}
                onChange={(e) => setPreferences({ ...preferences, volume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-mono-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <button
              onClick={testSound}
              className="px-4 py-2 text-sm font-medium bg-mono-100 text-mono-900 rounded-lg hover:bg-mono-200 transition-colors"
            >
              Test Sound
            </button>
          </div>
        </motion.section>
        
        {/* Email Settings */}
        {user && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-mono-200 rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Email Reports</h2>
            
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium">Monthly email report</div>
                <div className="text-sm text-mono-600">Receive a summary of your monthly progress via email</div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={preferences.monthly_email_opt_in}
                  onChange={(e) => setPreferences({ ...preferences, monthly_email_opt_in: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-mono-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-mono-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-mono-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mono-900"></div>
              </div>
            </label>
          </motion.section>
        )}
        
        {/* Account Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-mono-200 rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          
          {user ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-mono-600 mb-1">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-mono-600 mb-4">Sign in to sync your data across devices and receive email reports.</p>
              <button
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                className="px-4 py-2 text-sm font-medium bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors"
              >
                Sign in with Google
              </button>
            </div>
          )}
        </motion.section>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={savePreferences}
            disabled={saving}
            className="px-8 py-3 text-base font-semibold bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}
