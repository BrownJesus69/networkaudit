import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useColorScheme } from 'react-native'
import { LightColors, DarkColors } from '../constants/Colors'
import type { ThemeColors } from '../constants/Colors'

const THEME_KEY = 'theme_preference'

interface ThemeContextValue {
  colors: ThemeColors
  isDark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: LightColors,
  isDark: false,
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [isDark, setIsDark] = useState(systemScheme === 'dark')

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then(val => {
        if (val === 'dark') setIsDark(true)
        else if (val === 'light') setIsDark(false)
      })
      .catch(() => {})
  }, [])

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light').catch(() => {})
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ colors: isDark ? DarkColors : LightColors, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
