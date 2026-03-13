'use client'

import { useEffect, useLayoutEffect, useSyncExternalStore } from 'react'

import {
  applyManualModeSelection,
  applySyncPreference,
  applySystemModeChange,
  type ManualMode,
  type ThemePreference,
  getServerThemeSnapshot,
  getThemeSnapshot,
  saveThemePreference,
  subscribeToThemeStore,
} from './theme-store'

/**
 * Isomorphic layout effect: uses useLayoutEffect in the browser (where
 * window is defined) to avoid a flash of the wrong theme, and falls back
 * to useEffect in server-side rendering environments so React does not warn
 * about "useLayoutEffect does nothing on the server".
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Reads the current system light/dark mode from the browser media query.
 */
function getSystemMode(systemPrefersDark: boolean): ManualMode {
  return systemPrefersDark ? 'dark' : 'light'
}

/**
 * Applies the fixed Cloud Dancer theme and current color mode to the document.
 */
function applyThemeToDocument(mode: 'light' | 'dark') {
  const root = document.documentElement
  root.setAttribute('data-theme', 'cloud-dancer')
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

  useIsomorphicLayoutEffect(() => {
    applyThemeToDocument(preference.manualMode)
  }, [preference.manualMode])

  useEffect(() => {
    if (!preference.syncWithSystem) {
      return
    }

    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    function syncToSystem(systemPrefersDark: boolean) {
      const nextPreference = applySystemModeChange(
        getThemeSnapshot(),
        getSystemMode(systemPrefersDark),
      )

      if (nextPreference !== getThemeSnapshot()) {
        saveThemePreference(nextPreference)
      }
    }

    function handleChange(event: MediaQueryListEvent) {
      syncToSystem(event.matches)
    }

    syncToSystem(mql.matches)
    mql.addEventListener('change', handleChange)

    return () => {
      mql.removeEventListener('change', handleChange)
    }
  }, [preference.syncWithSystem])

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

  function setManualMode(manualMode: ManualMode) {
    saveThemePreference(applyManualModeSelection(getThemeSnapshot(), manualMode))
  }

  function setSyncWithSystem(syncWithSystem: boolean) {
    saveThemePreference(
      applySyncPreference(
        getThemeSnapshot(),
        syncWithSystem,
        getSystemMode(window.matchMedia('(prefers-color-scheme: dark)').matches),
      ),
    )
  }

  function setPreference(next: ThemePreference) {
    saveThemePreference(next)
  }

  return {
    manualMode: preference.manualMode,
    syncWithSystem: preference.syncWithSystem,
    setManualMode,
    setSyncWithSystem,
    setPreference,
  }
}
