'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, startOfDay, subDays, isToday, isThisWeek, isThisMonth, startOfWeek, startOfMonth, eachDayOfInterval } from 'date-fns'
import { useLocalStorage, LocalSession } from '@/lib/useLocalStorage'

interface Session {
  id: string
  type: 'short' | 'long'
  duration_seconds: number
  started_at: string
  ended_at: string
  created_at: string
}

export default function SessionsPage() {
  const [user, setUser] = useState<any>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [localSessions] = useLocalStorage<LocalSession[]>('pomodoro_sessions', [])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'short' | 'long'>('all')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all')
  
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
        
        if (!error && data) {
          setSessions(data)
        }
      } else {
        setSessions(localSessions as Session[])
      }
      
      setLoading(false)
    }
    
    loadData()
  }, [localSessions])
  
  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    // Type filter
    if (filterType !== 'all' && session.type !== filterType) return false
    
    // Date range filter
    const sessionDate = new Date(session.started_at)
    const now = new Date()
    
    switch(dateRange) {
      case 'today':
        return isToday(sessionDate)
      case 'week':
        return isThisWeek(sessionDate, { weekStartsOn: 1 })
      case 'month':
        return isThisMonth(sessionDate)
      default:
        return true
    }
  })
  
  // Calculate stats
  const todayCount = sessions.filter(s => isToday(new Date(s.started_at))).length
  const weekCount = sessions.filter(s => isThisWeek(new Date(s.started_at), { weekStartsOn: 1 })).length
  const monthCount = sessions.filter(s => isThisMonth(new Date(s.started_at))).length
  
  // Calculate streak
  const calculateStreak = () => {
    if (sessions.length === 0) return 0
    
    const sessionDates = sessions.map(s => startOfDay(new Date(s.started_at)).getTime())
    const uniqueDates = [...new Set(sessionDates)].sort((a, b) => b - a)
    
    let streak = 0
    let currentDate = startOfDay(new Date()).getTime()
    
    for (const date of uniqueDates) {
      if (date === currentDate || date === currentDate - 86400000) {
        streak++
        currentDate = date - 86400000
      } else {
        break
      }
    }
    
    return streak
  }
  
  const streak = calculateStreak()
  
  // Prepare chart data - last 30 days
  const chartData = () => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    })
    
    return days.map(day => {
      const dayStart = startOfDay(day).getTime()
      const count = sessions.filter(s => {
        const sessionDay = startOfDay(new Date(s.started_at)).getTime()
        return sessionDay === dayStart
      }).length
      
      return {
        date: format(day, 'MMM dd'),
        sessions: count
      }
    })
  }
  
  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Duration (min)', 'Started At', 'Ended At']
    const rows = filteredSessions.map(s => [
      format(new Date(s.started_at), 'yyyy-MM-dd'),
      s.type,
      Math.round(s.duration_seconds / 60),
      format(new Date(s.started_at), 'HH:mm:ss'),
      format(new Date(s.ended_at), 'HH:mm:ss'),
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pomodoro-sessions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-mono-500">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Sessions</h1>
        <p className="text-mono-600">Track your focus and productivity</p>
      </div>
      
      {!user && (
        <div className="mb-8 p-4 bg-mono-100 border border-mono-200 rounded-lg">
          <p className="text-sm text-mono-700">
            You're in local mode. Sign in to sync your sessions across devices.
          </p>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white border border-mono-200 rounded-lg p-6"
        >
          <div className="text-5xl font-bold mb-2">{todayCount}</div>
          <div className="text-sm text-mono-600">Today</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-mono-200 rounded-lg p-6"
        >
          <div className="text-5xl font-bold mb-2">{weekCount}</div>
          <div className="text-sm text-mono-600">This Week</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-mono-200 rounded-lg p-6"
        >
          <div className="text-5xl font-bold mb-2">{monthCount}</div>
          <div className="text-sm text-mono-600">This Month</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-mono-200 rounded-lg p-6"
        >
          <div className="text-5xl font-bold mb-2">{streak}</div>
          <div className="text-sm text-mono-600">Day Streak</div>
        </motion.div>
      </div>
      
      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-mono-200 rounded-lg p-6 mb-12"
      >
        <h2 className="text-xl font-semibold mb-6">Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis 
              dataKey="date" 
              stroke="#737373" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#737373" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fafafa',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="sessions" 
              stroke="#171717" 
              strokeWidth={2}
              dot={{ fill: '#171717', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
      
      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 text-sm border border-mono-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-mono-900"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 text-sm border border-mono-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-mono-900"
          >
            <option value="all">All types</option>
            <option value="short">Short (25 min)</option>
            <option value="long">Long (50 min)</option>
          </select>
        </div>
        
        <button
          onClick={exportToCSV}
          disabled={filteredSessions.length === 0}
          className="px-4 py-2 text-sm font-medium bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export CSV
        </button>
      </div>
      
      {/* Sessions List */}
      <div className="bg-white border border-mono-200 rounded-lg overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-mono-500">
            No sessions found. Start a Pomodoro to see your history here!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mono-50 border-b border-mono-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-600 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-mono-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                      {format(new Date(session.started_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        session.type === 'short' 
                          ? 'bg-mono-100 text-mono-800' 
                          : 'bg-mono-200 text-mono-900'
                      }`}>
                        {session.type === 'short' ? '25 min' : '50 min'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-600">
                      {Math.round(session.duration_seconds / 60)} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-600">
                      {format(new Date(session.started_at), 'HH:mm')} - {format(new Date(session.ended_at), 'HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
