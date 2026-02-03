// lib/audioManager.ts
export type SoundTheme = 'default' | 'soft' | 'loud'

const SOUND_SETS: Record<SoundTheme, {
  start: string
  end1: string
  end2: string
}> = {
  default: {
    start: '/sounds/default-start.mp3',
    end1: '/sounds/default-end1.mp3',
    end2: '/sounds/default-end2.mp3',
  },
  soft: {
    start: '/sounds/soft-start.mp3',
    end1: '/sounds/soft-end1.mp3',
    end2: '/sounds/soft-end2.mp3',
  },
  loud: {
    start: '/sounds/loud-start.mp3',
    end1: '/sounds/loud-end1.mp3',
    end2: '/sounds/loud-end2.mp3',
  },
}

class AudioManager {
  private audioContext: AudioContext | null = null
  private isUnlocked = false
  private volume = 0.7
  private isMuted = false
  private currentTheme: SoundTheme = 'default'
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }
  
  async unlock() {
    if (this.isUnlocked || !this.audioContext) return
    
    try {
      // Create silent sound to unlock audio
      const buffer = this.audioContext.createBuffer(1, 1, 22050)
      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.audioContext.destination)
      source.start(0)
      
      this.isUnlocked = true
      console.log('Audio unlocked')
    } catch (error) {
      console.error('Failed to unlock audio:', error)
    }
  }
  
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }
  
  setMuted(muted: boolean) {
    this.isMuted = muted
  }
  
  setTheme(theme: SoundTheme) {
    this.currentTheme = theme
  }
  
  private async playSound(url: string) {
    if (this.isMuted || !this.audioContext) return
    
    try {
      const audio = new Audio(url)
      audio.volume = this.volume
      await audio.play()
    } catch (error) {
      console.error('Failed to play sound:', error)
    }
  }
  
  async playStartSound() {
    await this.unlock()
    const sounds = SOUND_SETS[this.currentTheme]
    await this.playSound(sounds.start)
  }
  
  async playEndSounds() {
    await this.unlock()
    const sounds = SOUND_SETS[this.currentTheme]
    
    await this.playSound(sounds.end1)
    
    // Delay before second sound
    await new Promise(resolve => setTimeout(resolve, 400))
    await this.playSound(sounds.end2)
  }
}

export const audioManager = new AudioManager()
