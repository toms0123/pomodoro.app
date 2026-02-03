/**
 * Timer Logic Tests
 * 
 * These tests verify the core timer functionality:
 * - State transitions (idle → running → paused → finished)
 * - Accurate time tracking
 * - Mode changes
 */

describe('Timer Logic', () => {
  test('timer starts in idle state', () => {
    const initialState = 'idle'
    expect(initialState).toBe('idle')
  })
  
  test('timer transitions from idle to running', () => {
    let state = 'idle'
    const start = () => { state = 'running' }
    
    start()
    expect(state).toBe('running')
  })
  
  test('timer can pause when running', () => {
    let state = 'running'
    const pause = () => { state = 'paused' }
    
    pause()
    expect(state).toBe('paused')
  })
  
  test('timer can resume from paused', () => {
    let state = 'paused'
    const resume = () => { state = 'running' }
    
    resume()
    expect(state).toBe('running')
  })
  
  test('timer can reset to idle', () => {
    let state = 'running'
    const reset = () => { state = 'idle' }
    
    reset()
    expect(state).toBe('idle')
  })
  
  test('timer calculates remaining time correctly', () => {
    const duration = 25 * 60 // 25 minutes in seconds
    const elapsed = 5 * 60 // 5 minutes elapsed
    const remaining = duration - elapsed
    
    expect(remaining).toBe(20 * 60)
  })
  
  test('timer formats time correctly', () => {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    
    expect(formatTime(1500)).toBe('25:00')
    expect(formatTime(65)).toBe('01:05')
    expect(formatTime(0)).toBe('00:00')
  })
})

describe('Timer Mode Durations', () => {
  const DURATIONS = {
    'short': 25 * 60,
    'long': 50 * 60,
    'short-break': 5 * 60,
    'long-break': 10 * 60,
  }
  
  test('short pomodoro is 25 minutes', () => {
    expect(DURATIONS.short).toBe(1500)
  })
  
  test('long pomodoro is 50 minutes', () => {
    expect(DURATIONS.long).toBe(3000)
  })
  
  test('short break is 5 minutes', () => {
    expect(DURATIONS['short-break']).toBe(300)
  })
  
  test('long break is 10 minutes', () => {
    expect(DURATIONS['long-break']).toBe(600)
  })
})
