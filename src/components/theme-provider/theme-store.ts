/**
 * Persists and broadcasts the user's Cloud Dancer appearance preferences via localStorage.
 */

export type ManualMode = 'light' | 'dark'

export type ThemePreference = {
  manualMode: ManualMode
  syncWithSystem: boolean
}

const STORAGE_KEY = 'dendi.theme-preference'

const DEFAULT_PREFERENCE: ThemePreference = {
  manualMode: 'light',
  syncWithSystem: true,
}

const listeners = new Set<() => void>()

let cachedRawValue: string | null = null
let cachedSnapshot: ThemePreference = DEFAULT_PREFERENCE

/**
 * Applies an explicit light/dark selection without altering the sync flag.
 */
export function applyManualModeSelection(
  preference: ThemePreference,
  manualMode: ManualMode,
): ThemePreference {
  return {
    ...preference,
    manualMode,
  }
}

/**
 * Updates the sync flag without altering the stored manual mode selection.
 */
export function applySyncPreference(
  preference: ThemePreference,
  syncWithSystem: boolean,
): ThemePreference {
  return {
    ...preference,
    syncWithSystem,
  }
}

/**
 * Applies a system light/dark change only while sync remains enabled.
 */
export function applySystemModeChange(
  preference: ThemePreference,
  systemMode: ManualMode,
): ThemePreference {
  if (!preference.syncWithSystem || preference.manualMode === systemMode) {
    return preference
  }

  return {
    ...preference,
    manualMode: systemMode,
  }
}

/**
 * Validates manual light/dark mode values.
 */
function isManualMode(value: unknown): value is ManualMode {
  return value === 'light' || value === 'dark'
}

/**
 * Validates a parsed value against the current preference shape.
 */
function isThemePreference(value: unknown): value is ThemePreference {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return isManualMode(candidate.manualMode) && typeof candidate.syncWithSystem === 'boolean'
}

/**
 * Validates the legacy dual-theme preference shape so stored data upgrades cleanly.
 */
function isLegacyThemePreference(value: unknown): value is {
  themeId: 'cloud-dancer' | 'winter-green'
  colorScheme: 'light' | 'dark' | 'system'
} {
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
 * Normalizes current and legacy preference payloads to the current schema.
 */
function normalizePreference(value: unknown): ThemePreference {
  if (isThemePreference(value)) {
    return value
  }

  if (isLegacyThemePreference(value)) {
    return {
      manualMode: value.colorScheme === 'dark' ? 'dark' : 'light',
      syncWithSystem: value.colorScheme === 'system',
    }
  }

  return DEFAULT_PREFERENCE
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
    return normalizePreference(parsed)
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
  const serialized = JSON.stringify(next)
  window.localStorage.setItem(STORAGE_KEY, serialized)
  cachedRawValue = serialized
  cachedSnapshot = next
  listeners.forEach((fn) => fn())
}

/**
 * Subscribes React to preference changes, including cross-tab storage events.
 */
export function subscribeToThemeStore(onStoreChange: () => void) {
  listeners.add(onStoreChange)

  /**
   * Handles cross-tab storage updates for both key-specific changes and clear().
   */
  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      cachedRawValue = event.newValue
      cachedSnapshot = parsePreference(event.newValue)
      onStoreChange()
    } else if (event.key === null) {
      cachedRawValue = null
      cachedSnapshot = DEFAULT_PREFERENCE
      onStoreChange()
    }
  }

  window.addEventListener('storage', handleStorage)

  return () => {
    listeners.delete(onStoreChange)
    window.removeEventListener('storage', handleStorage)
  }
}
