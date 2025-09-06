import { useState, useEffect, createContext, useContext } from 'react'
import type { ReactNode } from 'react'

export type MoodPalette = {
  name: string
  label: string
  emoji: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    muted: string
    mutedForeground: string
    border: string
    input: string
    ring: string
    gigsterPrimary: string
    gigsterSecondary: string
    gigsterAccent: string
  }
  gradients: {
    primary: string
    hero: string
    card: string
  }
}

export const MOOD_PALETTES: Record<string, MoodPalette> = {
  professional: {
    name: 'professional',
    label: 'Professional',
    emoji: '💼',
    description: 'Classic Gigster Garage brand colors for focused productivity',
    colors: {
      primary: '#004C6D',
      secondary: '#0B1D3A',
      accent: '#FFB200',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(0 0% 0%)',
      card: 'hsl(248 10% 97%)',
      cardForeground: 'hsl(0 0% 0%)',
      muted: 'hsl(220 14.3% 95.9%)',
      mutedForeground: 'hsl(220 8.9% 46.1%)',
      border: 'hsl(220 13% 91%)',
      input: 'hsl(220 13% 91%)',
      ring: '#004C6D',
      gigsterPrimary: '#004C6D',
      gigsterSecondary: '#0B1D3A',
      gigsterAccent: '#FFB200',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #004C6D 0%, #0B1D3A 100%)',
      hero: 'linear-gradient(135deg, #004C6D 0%, #003d5a 100%)',
      card: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
    },
  },
  energetic: {
    name: 'energetic',
    label: 'Energetic',
    emoji: '⚡',
    description: 'Vibrant orange and red tones for high-energy work sessions',
    colors: {
      primary: '#EA4C89',
      secondary: '#FF6B35',
      accent: '#F7931E',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(0 0% 0%)',
      card: 'hsl(14 30% 98%)',
      cardForeground: 'hsl(0 0% 0%)',
      muted: 'hsl(14 25% 94%)',
      mutedForeground: 'hsl(14 8% 46%)',
      border: 'hsl(14 20% 88%)',
      input: 'hsl(14 20% 88%)',
      ring: '#EA4C89',
      gigsterPrimary: '#EA4C89',
      gigsterSecondary: '#FF6B35',
      gigsterAccent: '#F7931E',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #EA4C89 0%, #FF6B35 100%)',
      hero: 'linear-gradient(135deg, #EA4C89 0%, #d63384 100%)',
      card: 'linear-gradient(180deg, #fff9f8 0%, #fef3f2 100%)',
    },
  },
  calm: {
    name: 'calm',
    label: 'Calm',
    emoji: '🌿',
    description: 'Soothing green and blue tones for peaceful focused work',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(0 0% 0%)',
      card: 'hsl(151 30% 98%)',
      cardForeground: 'hsl(0 0% 0%)',
      muted: 'hsl(151 25% 94%)',
      mutedForeground: 'hsl(151 8% 46%)',
      border: 'hsl(151 20% 88%)',
      input: 'hsl(151 20% 88%)',
      ring: '#10B981',
      gigsterPrimary: '#10B981',
      gigsterSecondary: '#059669',
      gigsterAccent: '#34D399',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      hero: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      card: 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%)',
    },
  },
  creative: {
    name: 'creative',
    label: 'Creative',
    emoji: '🎨',
    description: 'Purple and magenta palette to inspire creativity',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A855F7',
      accent: '#C084FC',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(0 0% 0%)',
      card: 'hsl(269 30% 98%)',
      cardForeground: 'hsl(0 0% 0%)',
      muted: 'hsl(269 25% 94%)',
      mutedForeground: 'hsl(269 8% 46%)',
      border: 'hsl(269 20% 88%)',
      input: 'hsl(269 20% 88%)',
      ring: '#8B5CF6',
      gigsterPrimary: '#8B5CF6',
      gigsterSecondary: '#A855F7',
      gigsterAccent: '#C084FC',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
      hero: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      card: 'linear-gradient(180deg, #faf5ff 0%, #f3e8ff 100%)',
    },
  },
  focus: {
    name: 'focus',
    label: 'Focus',
    emoji: '🎯',
    description: 'Deep blue tones for maximum concentration',
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#60A5FA',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(0 0% 0%)',
      card: 'hsl(221 30% 98%)',
      cardForeground: 'hsl(0 0% 0%)',
      muted: 'hsl(221 25% 94%)',
      mutedForeground: 'hsl(221 8% 46%)',
      border: 'hsl(221 20% 88%)',
      input: 'hsl(221 20% 88%)',
      ring: '#1E40AF',
      gigsterPrimary: '#1E40AF',
      gigsterSecondary: '#3B82F6',
      gigsterAccent: '#60A5FA',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
      hero: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
      card: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
    },
  },
  warm: {
    name: 'warm',
    label: 'Warm',
    emoji: '☀️',
    description: 'Golden amber tones for a cozy productive atmosphere',
    colors: {
      primary: '#D97706',
      secondary: '#F59E0B',
      accent: '#FCD34D',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(0 0% 0%)',
      card: 'hsl(45 30% 98%)',
      cardForeground: 'hsl(0 0% 0%)',
      muted: 'hsl(45 25% 94%)',
      mutedForeground: 'hsl(45 8% 46%)',
      border: 'hsl(45 20% 88%)',
      input: 'hsl(45 20% 88%)',
      ring: '#D97706',
      gigsterPrimary: '#D97706',
      gigsterSecondary: '#F59E0B',
      gigsterAccent: '#FCD34D',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
      hero: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
      card: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
    },
  },
}

type MoodPaletteContextType = {
  currentMood: string
  palette: MoodPalette
  changeMood: (mood: string) => void
  availableMoods: MoodPalette[]
}

const MoodPaletteContext = createContext<MoodPaletteContextType | undefined>(undefined)

const STORAGE_KEY = 'gigster-garage-mood-palette'

export function MoodPaletteProvider({ children }: { children: ReactNode }) {
  const [currentMood, setCurrentMood] = useState<string>('professional')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && MOOD_PALETTES[saved]) {
      setCurrentMood(saved)
    }
  }, [])

  useEffect(() => {
    const palette = MOOD_PALETTES[currentMood]
    if (!palette) return

    const root = document.documentElement
    
    root.style.setProperty('--primary', palette.colors.primary)
    root.style.setProperty('--secondary', palette.colors.secondary)
    root.style.setProperty('--accent', palette.colors.accent)
    root.style.setProperty('--background', palette.colors.background)
    root.style.setProperty('--foreground', palette.colors.foreground)
    root.style.setProperty('--card', palette.colors.card)
    root.style.setProperty('--card-foreground', palette.colors.cardForeground)
    root.style.setProperty('--muted', palette.colors.muted)
    root.style.setProperty('--muted-foreground', palette.colors.mutedForeground)
    root.style.setProperty('--border', palette.colors.border)
    root.style.setProperty('--input', palette.colors.input)
    root.style.setProperty('--ring', palette.colors.ring)
    
    root.style.setProperty('--garage-navy', palette.colors.gigsterPrimary)
    root.style.setProperty('--ignition-teal', palette.colors.gigsterSecondary)
    root.style.setProperty('--workshop-amber', palette.colors.gigsterAccent)
    
    root.style.setProperty('--gigster-gradient', palette.gradients.primary)
    root.style.setProperty('--gigster-gradient-navy', palette.gradients.hero)
    root.style.setProperty('--mood-card-gradient', palette.gradients.card)
    
    localStorage.setItem(STORAGE_KEY, currentMood)
  }, [currentMood])

  const changeMood = (mood: string) => {
    if (MOOD_PALETTES[mood]) {
      setCurrentMood(mood)
    }
  }

  const value = {
    currentMood,
    palette: MOOD_PALETTES[currentMood],
    changeMood,
    availableMoods: Object.values(MOOD_PALETTES),
  }

  return (
    <MoodPaletteContext.Provider value={value}>
      {children}
    </MoodPaletteContext.Provider>
  )
}

export function useMoodPalette() {
  const context = useContext(MoodPaletteContext)
  if (!context) {
    throw new Error('useMoodPalette must be used within a MoodPaletteProvider')
  }
  return context
}