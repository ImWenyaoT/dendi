import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyManualModeSelection,
  applySyncPreference,
  applySystemModeChange,
  getThemeSnapshot,
  subscribeToThemeStore,
} from './theme-store.ts'

/**
 * Installs a configurable window/localStorage/storage-event test double.
 */
function installWindowWithStorage(initialValue: string | null = null) {
  const storage = new Map<string, string>()
  let storageListener: ((event: StorageEvent) => void) | undefined

  if (initialValue !== null) {
    storage.set('dendi.theme-preference', initialValue)
  }

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      addEventListener(type: string, listener: (event: StorageEvent) => void) {
        if (type === 'storage') {
          storageListener = listener
        }
      },
      removeEventListener(type: string, listener: (event: StorageEvent) => void) {
        if (type === 'storage' && storageListener === listener) {
          storageListener = undefined
        }
      },
      localStorage: {
        getItem(key: string) {
          return storage.get(key) ?? null
        },
      },
    },
  })

  return {
    dispatchStorage(event: StorageEvent) {
      storageListener?.(event)
    },
    setStorageValue(value: string | null) {
      if (value === null) {
        storage.delete('dendi.theme-preference')
      } else {
        storage.set('dendi.theme-preference', value)
      }
    },
  }
}

/**
 * Verifies invalid JSON gracefully falls back to the default theme preference.
 */
test('getThemeSnapshot falls back to default for invalid JSON', () => {
  installWindowWithStorage('{invalid-json')

  assert.deepEqual(getThemeSnapshot(), {
    manualMode: 'light',
    syncWithSystem: true,
  })
})

/**
 * Verifies unchanged storage content reuses cached snapshot references.
 */
test('getThemeSnapshot reuses snapshot when storage value is unchanged', () => {
  installWindowWithStorage(
    JSON.stringify({
      manualMode: 'dark',
      syncWithSystem: false,
    }),
  )

  assert.equal(getThemeSnapshot(), getThemeSnapshot())
})

/**
 * Verifies manual mode selection always updates the displayed mode immediately.
 */
test('applyManualModeSelection updates the displayed mode without disabling sync', () => {
  assert.deepEqual(
    applyManualModeSelection(
      {
        manualMode: 'light',
        syncWithSystem: true,
      },
      'dark',
    ),
    {
      manualMode: 'dark',
      syncWithSystem: true,
    },
  )
})

/**
 * Verifies enabling sync immediately aligns the displayed mode to the current system mode.
 */
test('applySyncPreference aligns the current mode to the system when sync is enabled', () => {
  assert.deepEqual(
    applySyncPreference(
      {
        manualMode: 'light',
        syncWithSystem: false,
      },
      true,
      'dark',
    ),
    {
      manualMode: 'dark',
      syncWithSystem: true,
    },
  )
})

/**
 * Verifies system changes override the current mode while sync remains enabled.
 */
test('applySystemModeChange updates the mode when the system changes under sync', () => {
  assert.deepEqual(
    applySystemModeChange(
      {
        manualMode: 'light',
        syncWithSystem: true,
      },
      'dark',
    ),
    {
      manualMode: 'dark',
      syncWithSystem: true,
    },
  )
})

/**
 * Verifies legacy dual-theme preferences migrate into the single-theme schema.
 */
test('getThemeSnapshot migrates legacy theme preferences', () => {
  installWindowWithStorage(
    JSON.stringify({
      themeId: 'winter-green',
      colorScheme: 'dark',
    }),
  )

  assert.deepEqual(getThemeSnapshot(), {
    manualMode: 'dark',
    syncWithSystem: false,
  })
})

/**
 * Verifies cross-tab updates for the theme key publish the new parsed preference.
 */
test('subscribeToThemeStore updates snapshot on storage key changes', () => {
  const { dispatchStorage, setStorageValue } = installWindowWithStorage(
    JSON.stringify({
      manualMode: 'light',
      syncWithSystem: true,
    }),
  )

  let callCount = 0
  const unsubscribe = subscribeToThemeStore(() => { callCount++ })

  const updatedRaw = JSON.stringify({
    manualMode: 'dark',
    syncWithSystem: false,
  })
  setStorageValue(updatedRaw)
  dispatchStorage({
    key: 'dendi.theme-preference',
    newValue: updatedRaw,
  } as StorageEvent)

  assert.equal(callCount, 1, 'subscriber callback should be called once after key update')
  assert.deepEqual(getThemeSnapshot(), {
    manualMode: 'dark',
    syncWithSystem: false,
  })

  unsubscribe()
})

/**
 * Verifies cross-tab localStorage.clear() resets snapshot to defaults.
 */
test('subscribeToThemeStore resets snapshot after localStorage.clear()', () => {
  const { dispatchStorage, setStorageValue } = installWindowWithStorage(
    JSON.stringify({
      manualMode: 'dark',
      syncWithSystem: false,
    }),
  )

  let callCount = 0
  const unsubscribe = subscribeToThemeStore(() => { callCount++ })

  getThemeSnapshot()
  setStorageValue(null)
  dispatchStorage({
    key: null,
    newValue: null,
  } as StorageEvent)

  assert.equal(callCount, 1, 'subscriber callback should be called once after localStorage.clear()')
  assert.deepEqual(getThemeSnapshot(), {
    manualMode: 'light',
    syncWithSystem: true,
  })

  unsubscribe()
})
