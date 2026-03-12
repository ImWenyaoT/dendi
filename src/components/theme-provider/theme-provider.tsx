'use client'

import { useLayoutEffect, useSyncExternalStore } from 'react'

import {
  type ColorScheme,
  type ThemeId,
  type ThemePreference,
  getServerThemeSnapshot,
  getThemeSnapshot,
  saveThemePreference,
  subscribeToThemeStore,
} from './theme-store'

/**
 * Resolves the effective mode ('light' | 'dark') from the preference
 * and the current system media query.
 */
function resolveEffectiveMode(
  colorScheme: ColorScheme,
  systemPrefersDark: boolean,
): 'light' | 'dark' {
  if (colorScheme === 'system') {
    return systemPrefersDark ? 'dark' : 'light'
  }
  return colorScheme
}

/**
 * Applies data attributes to the <html> element so CSS variables activate.
 */
function applyThemeToDocument(themeId: ThemeId, mode: 'light' | 'dark') {
  const root = document.documentElement
  root.setAttribute('data-theme', themeId)
  root.setAttribute('data-color-scheme', mode)
}

/**
 * Keeps the document theme in sync with stored preferences and the OS color scheme.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useSyncExternalStore(
    subscribeToThemeStore,
    getThemeSnapshot,
    getServerThemeSnapshot,
  )

  useLayoutEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    function sync() {
      const mode = resolveEffectiveMode(preference.colorScheme, mql.matches)
      applyThemeToDocument(preference.themeId, mode)
    }

    sync()
    mql.addEventListener('change', sync)

    return () => mql.removeEventListener('change', sync)
  }, [preference])

  return <>{children}</>
}

/**
 * React hook that returns the current preference and setter helpers.
 */
export function useTheme() {
  const preference = useSyncExternalStore(
    subscribeToThemeStore,
    getThemeSnapshot,
    getServerThemeSnapshot,
  )

  function setThemeId(themeId: ThemeId) {
    saveThemePreference({ ...getThemeSnapshot(), themeId })
  }

  function setColorScheme(colorScheme: ColorScheme) {
    saveThemePreference({ ...getThemeSnapshot(), colorScheme })
  }

  function setPreference(next: ThemePreference) {
    saveThemePreference(next)
  }

  return {
    themeId: preference.themeId,
    colorScheme: preference.colorScheme,
    setThemeId,
    setColorScheme,
    setPreference,
  }
}
