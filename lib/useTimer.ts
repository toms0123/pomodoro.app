import { useState, useEffect, useRef, useCallback } from 'react'
import { audioManager } from './audioManager'

export type TimerMode = 'short' | 'long' | 'short-break' | 'long-break'
export type TimerState = 'idle' | 'running' | 'paused' | 'finished'

const DURATIONS: Record<TimerMode, number> = {
  'short': 25 * 60,
  'long': 50 * 60,
  'short-break': 5 * 60,
  'long-break': 10 * 60,
}

export function useTimer() {
  const [mode, setMode] = useState<TimerMode>('short')
  const [state, setState] = useState<TimerState>('idle')
  const [timeRemaining, setTimeRemaining] = useState(DURATIONS['short'])
  
  const startTimeRef = useRef<number | null>(null)
  const pausedTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)
  const sessionStartRef = useRef<Date | null>(null)
  
  const duration = DURATIONS[mode]
  
  // Accurate timer using timestamps and requestAnimationFrame
  const tick = useCallback(() => {
    if (!startTimeRef.current) return
    
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    const remaining = Math.max(0, duration - elapsed)
    
    setTimeRemaining(Math.ceil(remaining))
    
    if (remaining <= 0) {
      setState('finished')
      audioManager.playEndSounds()
      startTimeRef.current = null
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }
    
    animationFrameRef.current = requestAnimationFrame(tick)
  }, [duration])
  
  const start = useCallback(() => {
    if (state === 'idle') {
      sessionStartRef.current = new Date()
      audioManager.playStartSound()
    }
    
    startTimeRef.current = Date.now() - pausedTimeRef.current * 1000
    setState('running')
    tick()
  }, [state, tick])
  
  const pause = useCallback(() => {
    if (state !== 'running') return
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    pausedTimeRef.current = duration - timeRemaining
    setState('paused')
  }, [state, duration, timeRemaining])
  
  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    startTimeRef.current = null
    pausedTimeRef.current = 0
    sessionStartRef.current = null
    setTimeRemaining(duration)
    setState('idle')
  }, [duration])
  
  const changeMode = useCallback((newMode: TimerMode) => {
    reset()
    setMode(newMode)
    setTimeRemaining(DURATIONS[newMode])
  }, [reset])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
  
  return {
    mode,
    state,
    timeRemaining,
    duration,
    sessionStart: sessionStartRef.current,
    start,
    pause,
    reset,
    changeMode,
  }
}
