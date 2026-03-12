import assert from 'node:assert/strict'
import test from 'node:test'

import {
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
    themeId: 'cloud-dancer',
    colorScheme: 'system',
  })
})

/**
 * Verifies unchanged storage content reuses cached snapshot references.
 */
test('getThemeSnapshot reuses snapshot when storage value is unchanged', () => {
  installWindowWithStorage(
    JSON.stringify({
      themeId: 'winter-green',
      colorScheme: 'dark',
    }),
  )

  assert.equal(getThemeSnapshot(), getThemeSnapshot())
})

/**
 * Verifies cross-tab updates for the theme key publish the new parsed preference.
 */
test('subscribeToThemeStore updates snapshot on storage key changes', () => {
  const { dispatchStorage, setStorageValue } = installWindowWithStorage(
    JSON.stringify({
      themeId: 'cloud-dancer',
      colorScheme: 'system',
    }),
  )

  const unsubscribe = subscribeToThemeStore(() => {})

  const updatedRaw = JSON.stringify({
    themeId: 'winter-green',
    colorScheme: 'dark',
  })
  setStorageValue(updatedRaw)
  dispatchStorage({
    key: 'dendi.theme-preference',
    newValue: updatedRaw,
  } as StorageEvent)

  assert.deepEqual(getThemeSnapshot(), {
    themeId: 'winter-green',
    colorScheme: 'dark',
  })

  unsubscribe()
})

/**
 * Verifies cross-tab localStorage.clear() resets snapshot to defaults.
 */
test('subscribeToThemeStore resets snapshot after localStorage.clear()', () => {
  const { dispatchStorage, setStorageValue } = installWindowWithStorage(
    JSON.stringify({
      themeId: 'winter-green',
      colorScheme: 'dark',
    }),
  )

  const unsubscribe = subscribeToThemeStore(() => {})

  getThemeSnapshot()
  setStorageValue(null)
  dispatchStorage({
    key: null,
    newValue: null,
  } as StorageEvent)

  assert.deepEqual(getThemeSnapshot(), {
    themeId: 'cloud-dancer',
    colorScheme: 'system',
  })

  unsubscribe()
})
