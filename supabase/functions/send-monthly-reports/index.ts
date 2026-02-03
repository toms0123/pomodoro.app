// supabase/functions/send-monthly-reports/index.ts
// Deploy this as a Supabase Edge Function and schedule it to run on the last day of each month

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')! // You'll need to add Resend for emails

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Get current month in YYYY-MM format
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    // Get all users who opted in for monthly emails
    const { data: users, error: usersError } = await supabase
      .from('preferences')
      .select('user_id, timezone, profiles!inner(email, name)')
      .eq('monthly_email_opt_in', true)
    
    if (usersError) throw usersError
    
    const results = []
    
    for (const user of users || []) {
      try {
        // Check if report already sent for this month
        const { data: existingReport } = await supabase
          .from('email_reports')
          .select('id')
          .eq('user_id', user.user_id)
          .eq('month', currentMonth)
          .single()
        
        if (existingReport) {
          results.push({ user_id: user.user_id, status: 'already_sent' })
          continue
        }
        
        // Get sessions for the current month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.user_id)
          .gte('started_at', monthStart.toISOString())
          .lte('started_at', monthEnd.toISOString())
        
        if (sessionsError) throw sessionsError
        
        if (!sessions || sessions.length === 0) {
          results.push({ user_id: user.user_id, status: 'no_sessions' })
          continue
        }
        
        // Calculate statistics
        const totalSessions = sessions.length
        const shortSessions = sessions.filter(s => s.type === 'short').length
        const longSessions = sessions.filter(s => s.type === 'long').length
        
        // Get previous month for comparison
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        
        const { data: prevSessions } = await supabase
          .from('sessions')
          .select('id')
          .eq('user_id', user.user_id)
          .gte('started_at', prevMonthStart.toISOString())
          .lte('started_at', prevMonthEnd.toISOString())
        
        const prevTotal = prevSessions?.length || 0
        const percentChange = prevTotal > 0 
          ? Math.round(((totalSessions - prevTotal) / prevTotal) * 100)
          : totalSessions > 0 ? 100 : 0
        
        // Calculate best day and average
        const sessionsByDay = sessions.reduce((acc, session) => {
          const day = new Date(session.started_at).toISOString().split('T')[0]
          acc[day] = (acc[day] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        const bestDay = Object.entries(sessionsByDay)
          .sort((a, b) => b[1] - a[1])[0]
        
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const avgPerDay = (totalSessions / daysInMonth).toFixed(1)
        
        // Prepare report data
        const totalsJson = {
          total: totalSessions,
          short: shortSessions,
          long: longSessions,
          percent_change: percentChange,
          best_day: bestDay ? { date: bestDay[0], count: bestDay[1] } : null,
          avg_per_day: avgPerDay
        }
        
        // Send email using Resend
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #171717;">Your ${currentMonth} Pomodoro Report</h1>
            <p style="color: #737373; margin-bottom: 32px;">Here's how you did this month, ${user.profiles.name || 'there'}!</p>
            
            <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="font-size: 48px; font-weight: 700; margin: 0; color: #171717;">${totalSessions}</h2>
              <p style="color: #737373; margin: 4px 0 0 0;">Total sessions completed</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
              <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px;">
                <p style="font-size: 28px; font-weight: 600; margin: 0; color: #171717;">${shortSessions}</p>
                <p style="color: #737373; margin: 4px 0 0 0; font-size: 14px;">Short sessions</p>
              </div>
              <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px;">
                <p style="font-size: 28px; font-weight: 600; margin: 0; color: #171717;">${longSessions}</p>
                <p style="color: #737373; margin: 4px 0 0 0; font-size: 14px;">Long sessions</p>
              </div>
            </div>
            
            <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="color: #737373; margin: 0 0 8px 0; font-size: 14px;">Compared to last month</p>
              <p style="font-size: 24px; font-weight: 600; margin: 0; color: ${percentChange >= 0 ? '#16a34a' : '#dc2626'};">
                ${percentChange > 0 ? '+' : ''}${percentChange}%
              </p>
            </div>
            
            ${bestDay ? `
              <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="color: #737373; margin: 0 0 8px 0; font-size: 14px;">Best day</p>
                <p style="font-size: 18px; font-weight: 600; margin: 0; color: #171717;">
                  ${new Date(bestDay[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${bestDay[1]} sessions
                </p>
              </div>
            ` : ''}
            
            <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
              <p style="color: #737373; margin: 0 0 8px 0; font-size: 14px;">Average per day</p>
              <p style="font-size: 18px; font-weight: 600; margin: 0; color: #171717;">${avgPerDay} sessions</p>
            </div>
            
            <p style="color: #a3a3a3; font-size: 12px; margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
              You're receiving this because you opted in to monthly reports. You can disable this anytime in your settings.
            </p>
          </div>
        `
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Pomodoro <noreply@yourdomain.com>',
            to: user.profiles.email,
            subject: `Your ${currentMonth} Pomodoro Report - ${totalSessions} sessions completed`,
            html: emailHtml,
          }),
        })
        
        if (!emailResponse.ok) {
          throw new Error(`Email failed: ${await emailResponse.text()}`)
        }
        
        // Save email report record
        const { error: reportError } = await supabase
          .from('email_reports')
          .insert({
            user_id: user.user_id,
            month: currentMonth,
            sent_at: new Date().toISOString(),
            totals_json: totalsJson
          })
        
        if (reportError) throw reportError
        
        results.push({ user_id: user.user_id, status: 'sent' })
      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error)
        results.push({ 
          user_id: user.user_id, 
          status: 'error', 
          error: error.message 
        })
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
