import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  getServerTaskSnapshot,
  getTaskSnapshot,
  subscribeToTaskStore,
} from './task-store.ts'

/**
 * Verifies the server snapshot stays referentially stable across reads.
 */
test('getServerTaskSnapshot returns the same array reference', () => {
  assert.equal(getServerTaskSnapshot(), getServerTaskSnapshot())
})

/**
 * Verifies identical storage content reuses the same parsed snapshot reference.
 */
test('getTaskSnapshot reuses the same snapshot for unchanged storage content', () => {
  const storage = new Map<string, string>()

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem(key: string) {
          return storage.get(key) ?? null
        },
      },
    },
  })

  storage.set(
    'dendi.task-manager.tasks',
    JSON.stringify([
      {
        id: 'task-1',
        title: 'Learn useSyncExternalStore',
        completed: false,
        createdAt: '2026-03-11T00:00:00.000Z',
      },
    ]),
  )

  assert.equal(getTaskSnapshot(), getTaskSnapshot())
})

/**
 * Creates a minimal window stub so store subscriptions can observe storage events.
 */
function installWindowStub() {
  let storageListener: ((event: StorageEvent) => void) | undefined

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
        getItem() {
          return null
        },
      },
    },
  })

  return {
    dispatchStorage(event: StorageEvent) {
      storageListener?.(event)
    },
  }
}

/**
 * Verifies a cross-tab localStorage.clear() event still refreshes subscribers.
 */
test('subscribeToTaskStore reacts when another tab clears localStorage', () => {
  const { dispatchStorage } = installWindowStub()
  let changeCount = 0

  const unsubscribe = subscribeToTaskStore(() => {
    changeCount += 1
  })

  dispatchStorage({ key: null } as StorageEvent)

  assert.equal(changeCount, 1)

  unsubscribe()
})

/**
 * Verifies the task manager source defines four Pantone demo themes side by side.
 */
test('task manager includes four Pantone comparison themes', () => {
  const taskManagerSource = readFileSync(
    new URL('./task-manager.tsx', import.meta.url),
    'utf8',
  )
  const taskManagerStyles = readFileSync(
    new URL('./task-manager.module.css', import.meta.url),
    'utf8',
  )

  assert.match(taskManagerSource, /Cloud Dancer/)
  assert.match(taskManagerSource, /Mocha Mousse/)
  assert.match(taskManagerSource, /Rose Dust/)
  assert.match(taskManagerSource, /Winter Green/)
  assert.doesNotMatch(taskManagerSource, /id: 'classic-blue'/)
  assert.match(taskManagerSource, /comparisonGrid/)
  assert.match(taskManagerStyles, /\.comparisonGrid/)
  assert.match(taskManagerStyles, /\.themeCard/)
})
