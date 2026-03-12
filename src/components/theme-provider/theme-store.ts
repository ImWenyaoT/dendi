/**
 * Persists and broadcasts the user's theme and color-scheme preferences via localStorage.
 */

export type ThemeId = 'cloud-dancer' | 'winter-green'

export type ColorScheme = 'light' | 'dark' | 'system'

export type ThemePreference = {
  themeId: ThemeId
  colorScheme: ColorScheme
}

const STORAGE_KEY = 'dendi.theme-preference'

const DEFAULT_PREFERENCE: ThemePreference = {
  themeId: 'cloud-dancer',
  colorScheme: 'system',
}

const listeners = new Set<() => void>()

let cachedRawValue: string | null = null
let cachedSnapshot: ThemePreference = DEFAULT_PREFERENCE

/**
 * Validates a parsed value against the expected preference shape.
 */
function isThemePreference(value: unknown): value is ThemePreference {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    (candidate.themeId === 'cloud-dancer' || candidate.themeId === 'winter-green') &&
    (candidate.colorScheme === 'light' || candidate.colorScheme === 'dark' || candidate.colorScheme === 'system')
  )
}

/**
 * Safely parses the stored preference string.
 */
function parsePreference(rawValue: string | null): ThemePreference {
  if (!rawValue) {
    return DEFAULT_PREFERENCE
  }

  try {
    const parsed = JSON.parse(rawValue)
    return isThemePreference(parsed) ? parsed : DEFAULT_PREFERENCE
  } catch {
    return DEFAULT_PREFERENCE
  }
}

/**
 * Reads the current preference from localStorage.
 */
export function getThemeSnapshot(): ThemePreference {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCE
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)

  if (rawValue === cachedRawValue) {
    return cachedSnapshot
  }

  cachedRawValue = rawValue
  cachedSnapshot = parsePreference(rawValue)

  return cachedSnapshot
}

/**
 * Returns the server-side snapshot for initial render.
 */
export function getServerThemeSnapshot(): ThemePreference {
  return DEFAULT_PREFERENCE
}

/**
 * Persists new preference and notifies all subscribers.
 */
export function saveThemePreference(next: ThemePreference) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  cachedRawValue = JSON.stringify(next)
  cachedSnapshot = next
  listeners.forEach((fn) => fn())
}

/**
 * Subscribes React to preference changes, including cross-tab storage events.
 */
export function subscribeToThemeStore(onStoreChange: () => void) {
  listeners.add(onStoreChange)

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) {
      cachedRawValue = null
      onStoreChange()
    }
  }

  window.addEventListener('storage', handleStorage)

  return () => {
    listeners.delete(onStoreChange)
    window.removeEventListener('storage', handleStorage)
  }
}
