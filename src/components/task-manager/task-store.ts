import type { Task } from '@/types/task'

const STORAGE_KEY = 'dendi.task-manager.tasks'
const taskStoreListeners = new Set<() => void>()
const EMPTY_TASKS: Task[] = []

let cachedRawValue: string | null = null
let cachedSnapshot: Task[] = EMPTY_TASKS

/**
 * Checks whether a parsed value matches the task shape we expect to store.
 */
function isTaskRecord(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'string'
  )
}

/**
 * Safely converts raw localStorage content into a validated task list.
 */
function parseStoredTasks(rawValue: string | null): Task[] {
  if (!rawValue) {
    return EMPTY_TASKS
  }

  try {
    const parsedValue = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return EMPTY_TASKS
    }

    return parsedValue.filter(isTaskRecord)
  } catch {
    return EMPTY_TASKS
  }
}

/**
 * Builds a new task record from the current input text.
 */
export function createTask(title: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Reads the latest task list from localStorage for the active browser tab.
 */
export function getTaskSnapshot() {
  if (typeof window === 'undefined') {
    return EMPTY_TASKS
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)

  if (rawValue === cachedRawValue) {
    return cachedSnapshot
  }

  cachedRawValue = rawValue
  cachedSnapshot = parseStoredTasks(rawValue)

  return cachedSnapshot
}

/**
 * Returns the server snapshot used during the initial render pass.
 */
export function getServerTaskSnapshot() {
  return EMPTY_TASKS
}

/**
 * Saves the next task list and broadcasts the update to interested listeners.
 */
export function saveTasks(nextTasks: Task[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks))
  taskStoreListeners.forEach((listener) => listener())
}

/**
 * Subscribes React to both same-tab updates and cross-tab storage changes.
 */
export function subscribeToTaskStore(onStoreChange: () => void) {
  taskStoreListeners.add(onStoreChange)

  /**
   * Reacts to direct key updates and full localStorage clears from other tabs.
   */
  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) {
      onStoreChange()
    }
  }

  window.addEventListener('storage', handleStorage)

  return () => {
    taskStoreListeners.delete(onStoreChange)
    window.removeEventListener('storage', handleStorage)
  }
}
