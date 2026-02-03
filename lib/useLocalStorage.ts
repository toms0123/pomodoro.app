import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }
  
  return [storedValue, setValue] as const
}

export interface LocalSession {
  id: string
  type: 'short' | 'long'
  duration_seconds: number
  started_at: string
  ended_at: string
  created_at: string
}

export interface LocalPreferences {
  auto_start_sessions: boolean
  auto_start_breaks: boolean
  volume: number
  sound_theme: 'default' | 'soft' | 'loud'
  monthly_email_opt_in: boolean
}

export const DEFAULT_PREFERENCES: LocalPreferences = {
  auto_start_sessions: false,
  auto_start_breaks: false,
  volume: 0.7,
  sound_theme: 'default',
  monthly_email_opt_in: false,
}
