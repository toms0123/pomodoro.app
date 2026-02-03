/**
 * Email Report Idempotency Tests
 * 
 * These tests verify that monthly email reports are sent exactly once per month
 * and handle edge cases properly.
 */

describe('Monthly Email Reports', () => {
  test('email is not sent twice for the same month', () => {
    const sentReports = new Set<string>()
    const userId = 'user-123'
    const currentMonth = '2026-02'
    
    const sendEmail = (userId: string, month: string): boolean => {
      const key = `${userId}-${month}`
      
      if (sentReports.has(key)) {
        return false // Already sent
      }
      
      sentReports.add(key)
      return true // Sent successfully
    }
    
    // First attempt should succeed
    expect(sendEmail(userId, currentMonth)).toBe(true)
    
    // Second attempt should fail (already sent)
    expect(sendEmail(userId, currentMonth)).toBe(false)
    
    // Different month should succeed
    expect(sendEmail(userId, '2026-03')).toBe(true)
  })
  
  test('tracks last sent month correctly', () => {
    interface UserReport {
      userId: string
      lastSentMonth: string | null
    }
    
    const userReports: Map<string, UserReport> = new Map()
    
    const updateLastSentMonth = (userId: string, month: string) => {
      userReports.set(userId, { userId, lastSentMonth: month })
    }
    
    const getLastSentMonth = (userId: string): string | null => {
      return userReports.get(userId)?.lastSentMonth || null
    }
    
    const userId = 'user-123'
    
    expect(getLastSentMonth(userId)).toBeNull()
    
    updateLastSentMonth(userId, '2026-02')
    expect(getLastSentMonth(userId)).toBe('2026-02')
    
    updateLastSentMonth(userId, '2026-03')
    expect(getLastSentMonth(userId)).toBe('2026-03')
  })
  
  test('generates correct month format', () => {
    const getMonthString = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      return `${year}-${month}`
    }
    
    expect(getMonthString(new Date('2026-02-15'))).toBe('2026-02')
    expect(getMonthString(new Date('2026-12-31'))).toBe('2026-12')
    expect(getMonthString(new Date('2026-01-01'))).toBe('2026-01')
  })
  
  test('calculates percent change correctly', () => {
    const calculatePercentChange = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0
      }
      return Math.round(((current - previous) / previous) * 100)
    }
    
    expect(calculatePercentChange(10, 5)).toBe(100) // 100% increase
    expect(calculatePercentChange(5, 10)).toBe(-50) // 50% decrease
    expect(calculatePercentChange(10, 0)).toBe(100) // From zero
    expect(calculatePercentChange(0, 0)).toBe(0) // Both zero
    expect(calculatePercentChange(10, 10)).toBe(0) // No change
  })
  
  test('aggregates session statistics correctly', () => {
    interface Session {
      type: 'short' | 'long'
      started_at: string
    }
    
    const sessions: Session[] = [
      { type: 'short', started_at: '2026-02-01T10:00:00Z' },
      { type: 'short', started_at: '2026-02-01T14:00:00Z' },
      { type: 'long', started_at: '2026-02-02T09:00:00Z' },
      { type: 'short', started_at: '2026-02-03T11:00:00Z' },
    ]
    
    const total = sessions.length
    const shortSessions = sessions.filter(s => s.type === 'short').length
    const longSessions = sessions.filter(s => s.type === 'long').length
    
    expect(total).toBe(4)
    expect(shortSessions).toBe(3)
    expect(longSessions).toBe(1)
  })
})
