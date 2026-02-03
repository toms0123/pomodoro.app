'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimer, TimerMode } from '@/lib/useTimer'
import { supabase } from '@/lib/supabase'
import { audioManager } from '@/lib/audioManager'
import { useLocalStorage, LocalSession, LocalPreferences, DEFAULT_PREFERENCES } from '@/lib/useLocalStorage'

const MODE_LABELS: Record<TimerMode, string> = {
  'short': 'Short Pomodoro',
  'long': 'Long Pomodoro',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
}

const MODE_DURATIONS: Record<TimerMode, string> = {
  'short': '25 min',
  'long': '50 min',
  'short-break': '5 min',
  'long-break': '10 min',
}

export default function TimerPage() {
  const timer = useTimer()
  const [user, setUser] = useState<any>(null)
  const [preferences, setPreferences] = useState<LocalPreferences>(DEFAULT_PREFERENCES)
  const [todayCount, setTodayCount] = useState(0)
  const [localSessions, setLocalSessions] = useLocalStorage<LocalSession[]>('pomodoro_sessions', [])
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          if (timer.state === 'running') {
            timer.pause()
          } else if (timer.state === 'idle' || timer.state === 'paused') {
            timer.start()
          }
          break
        case 'r':
          e.preventDefault()
          timer.reset()
          break
        case '1':
          e.preventDefault()
          timer.changeMode('short')
          break
        case '2':
          e.preventDefault()
          timer.changeMode('long')
          break
        case '3':
          e.preventDefault()
          timer.changeMode('short-break')
          break
        case '4':
          e.preventDefault()
          timer.changeMode('long-break')
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [timer])
  
  // Load user and preferences
  useEffect(() => {
    async function loadUser() {
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
          
          audioManager.setVolume(prefs.volume)
          audioManager.setTheme(prefs.sound_theme)
        }
        
        // Get today's count
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const { data: sessions } = await supabase
          .from('sessions')
          .select('id')
          .eq('user_id', user.id)
          .gte('started_at', today.toISOString())
        
        setTodayCount(sessions?.length || 0)
      } else {
        // Load local preferences
        const localPrefs = localStorage.getItem('pomodoro_preferences')
        if (localPrefs) {
          const parsed = JSON.parse(localPrefs)
          setPreferences(parsed)
          audioManager.setVolume(parsed.volume)
          audioManager.setTheme(parsed.sound_theme)
        }
        
        // Count today's local sessions
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todaySessions = localSessions.filter(s => 
          new Date(s.started_at) >= today
        )
        setTodayCount(todaySessions.length)
      }
    }
    
    loadUser()
  }, [localSessions])
  
  // Handle session completion
  useEffect(() => {
    if (timer.state !== 'finished') return
    
    const saveSession = async () => {
      if (!timer.sessionStart) return
      if (timer.mode === 'short-break' || timer.mode === 'long-break') return
      
      const sessionType = timer.mode === 'short' ? 'short' : 'long'
      const duration = timer.mode === 'short' ? 25 * 60 : 50 * 60
      const endTime = new Date()
      
      if (user) {
        // Save to database
        const { error } = await supabase
          .from('sessions')
          .insert({
            user_id: user.id,
            type: sessionType,
            duration_seconds: duration,
            started_at: timer.sessionStart.toISOString(),
            ended_at: endTime.toISOString(),
          })
        
        if (!error) {
          setTodayCount(prev => prev + 1)
        }
      } else {
        // Save locally
        const newSession: LocalSession = {
          id: crypto.randomUUID(),
          type: sessionType,
          duration_seconds: duration,
          started_at: timer.sessionStart.toISOString(),
          ended_at: endTime.toISOString(),
          created_at: new Date().toISOString(),
        }
        
        setLocalSessions(prev => [...prev, newSession])
        setTodayCount(prev => prev + 1)
        setShowLoginPrompt(true)
      }
    }
    
    saveSession()
  }, [timer.state, timer.sessionStart, timer.mode, user, localSessions, setLocalSessions])
  
  // Auto-start logic
  useEffect(() => {
    if (timer.state !== 'finished') return
    
    const handleAutoStart = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const isPomodoro = timer.mode === 'short' || timer.mode === 'long'
      const isBreak = timer.mode === 'short-break' || timer.mode === 'long-break'
      
      if (isPomodoro && preferences.auto_start_breaks) {
        timer.changeMode('short-break')
        timer.start()
      } else if (isBreak && preferences.auto_start_sessions) {
        timer.changeMode('short')
        timer.start()
      }
    }
    
    if (preferences.auto_start_breaks || preferences.auto_start_sessions) {
      handleAutoStart()
    }
  }, [timer.state, timer.mode, preferences])
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const startNextSession = () => {
    const isPomodoro = timer.mode === 'short' || timer.mode === 'long'
    timer.changeMode(isPomodoro ? 'short-break' : 'short')
    timer.start()
  }
  
  const progress = ((timer.duration - timer.timeRemaining) / timer.duration) * 100
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 -mt-16">
      <div className="w-full max-w-2xl">
        {/* Mode selector */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {(['short', 'long', 'short-break', 'long-break'] as TimerMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => timer.changeMode(mode)}
                disabled={timer.state === 'running'}
                className={`px-6 py-3 text-sm font-medium rounded-lg border transition-all ${
                  timer.mode === mode
                    ? 'bg-mono-900 text-white border-mono-900'
                    : 'bg-white text-mono-700 border-mono-200 hover:border-mono-400 disabled:opacity-50'
                }`}
              >
                <div>{MODE_LABELS[mode]}</div>
                <div className="text-xs opacity-70 mt-0.5">{MODE_DURATIONS[mode]}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Timer display */}
        <AnimatePresence mode="wait">
          {timer.state === 'finished' ? (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-8">
                <h1 className="text-6xl font-bold mb-4">Completed!</h1>
                <p className="text-xl text-mono-600">
                  {timer.mode === 'short' || timer.mode === 'long'
                    ? `That's ${todayCount} session${todayCount !== 1 ? 's' : ''} today`
                    : 'Ready to get back to work?'}
                </p>
              </div>
              
              <button
                onClick={startNextSession}
                className="px-8 py-4 text-lg font-semibold bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors"
              >
                Start next
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {/* Progress circle */}
              <div className="relative w-80 h-80 mx-auto mb-12">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="160"
                    cy="160"
                    r="150"
                    stroke="#e5e5e5"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="150"
                    stroke="#171717"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 150}`}
                    strokeDashoffset={`${2 * Math.PI * 150 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-7xl font-bold font-mono tracking-tight">
                    {formatTime(timer.timeRemaining)}
                  </div>
                  <div className="text-sm text-mono-500 mt-2 uppercase tracking-wider">
                    {MODE_LABELS[timer.mode]}
                  </div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {timer.state === 'idle' && (
                  <button
                    onClick={timer.start}
                    className="px-12 py-4 text-lg font-semibold bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors"
                  >
                    Start
                  </button>
                )}
                
                {timer.state === 'running' && (
                  <button
                    onClick={timer.pause}
                    className="px-12 py-4 text-lg font-semibold bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors"
                  >
                    Pause
                  </button>
                )}
                
                {timer.state === 'paused' && (
                  <>
                    <button
                      onClick={timer.start}
                      className="px-12 py-4 text-lg font-semibold bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors"
                    >
                      Resume
                    </button>
                    <button
                      onClick={timer.reset}
                      className="px-8 py-4 text-lg font-medium text-mono-700 border border-mono-300 rounded-lg hover:bg-mono-100 transition-colors"
                    >
                      Reset
                    </button>
                  </>
                )}
                
                {timer.state !== 'idle' && timer.state !== 'paused' && (
                  <button
                    onClick={timer.reset}
                    className="px-8 py-4 text-lg font-medium text-mono-700 border border-mono-300 rounded-lg hover:bg-mono-100 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              
              {/* Keyboard shortcuts hint */}
              <div className="mt-12 text-xs text-mono-500 space-y-1">
                <div>Keyboard: Space (start/pause) • R (reset) • 1-4 (modes)</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Login prompt for local users */}
        {!user && showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-mono-100 border border-mono-200 rounded-lg text-center"
          >
            <p className="text-sm text-mono-700 mb-2">
              Sign in to sync your sessions across devices
            </p>
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              className="text-sm font-medium text-mono-900 hover:underline"
            >
              Sign in with Google
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
