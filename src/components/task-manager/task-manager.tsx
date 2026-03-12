'use client'

import {
  useCallback,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { useTheme } from '@/components/theme-provider/theme-provider'
import type { ColorScheme, ThemeId } from '@/components/theme-provider/theme-store'

import styles from './task-manager.module.css'
import {
  createTask,
  getServerTaskSnapshot,
  getTaskSnapshot,
  saveTasks,
  subscribeToTaskStore,
} from './task-store'

const THEME_OPTIONS: { id: ThemeId; label: string; description: string }[] = [
  { id: 'cloud-dancer', label: 'Cloud Dancer', description: '云雾中性色' },
  { id: 'winter-green', label: 'Winter Green', description: '冬绿工作流' },
]

const COLOR_SCHEME_OPTIONS: { id: ColorScheme; label: string }[] = [
  { id: 'system', label: 'Sync with system' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

/**
 * Formats a stored timestamp into a compact date label.
 */
function formatTaskDate(createdAt: string) {
  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Renders the settings panel for theme and color scheme selection.
 */
function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { themeId, colorScheme, setThemeId, setColorScheme } = useTheme()
  const panelRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement

    // Move focus into the panel
    panelRef.current?.focus()

    // Handle Escape key to close the panel
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (!focusableElements || focusableElements.length === 0) {
        event.preventDefault()
        panelRef.current?.focus()
        return
      }

      const focusTargets = Array.from(focusableElements)
      const firstTarget = focusTargets[0]
      const lastTarget = focusTargets[focusTargets.length - 1]
      const activeElement = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (
          !activeElement ||
          activeElement === firstTarget ||
          !panelRef.current?.contains(activeElement)
        ) {
          event.preventDefault()
          lastTarget.focus()
        }
        return
      }

      if (
        !activeElement ||
        activeElement === lastTarget ||
        !panelRef.current?.contains(activeElement)
      ) {
        event.preventDefault()
        firstTarget.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus to the previously focused element
      previousFocusRef.current?.focus()
    }
  }, [onClose])

  return (
    <div className={styles.settingsOverlay} onClick={onClose}>
      <aside
        ref={panelRef}
        className={styles.settingsPanel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        tabIndex={-1}
      >
        <div className={styles.settingsHeader}>
          <h2 className={styles.settingsTitle}>Settings</h2>
          <button
            className={styles.settingsClose}
            type="button"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <fieldset className={styles.settingsGroup}>
          <legend className={styles.settingsLabel}>Theme</legend>
          <div className={styles.optionList}>
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={
                  option.id === themeId
                    ? `${styles.optionButton} ${styles.optionButtonActive}`
                    : styles.optionButton
                }
                onClick={() => setThemeId(option.id)}
              >
                <span className={styles.optionName}>{option.label}</span>
                <span className={styles.optionDesc}>{option.description}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.settingsGroup}>
          <legend className={styles.settingsLabel}>Appearance</legend>
          <div className={styles.optionList}>
            {COLOR_SCHEME_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={
                  option.id === colorScheme
                    ? `${styles.optionButton} ${styles.optionButtonActive}`
                    : styles.optionButton
                }
                onClick={() => setColorScheme(option.id)}
              >
                <span className={styles.optionName}>{option.label}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </aside>
    </div>
  )
}

/**
 * Main task manager with theme settings.
 */
export function TaskManager() {
  const [draftTitle, setDraftTitle] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const inputId = useId()

  const tasks = useSyncExternalStore(
    subscribeToTaskStore,
    getTaskSnapshot,
    getServerTaskSnapshot,
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedTitle = draftTitle.trim()

    if (!normalizedTitle) {
      return
    }

    saveTasks([createTask(normalizedTitle), ...tasks])
    setDraftTitle('')
  }

  function handleToggleTask(taskId: string) {
    saveTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function handleDeleteTask(taskId: string) {
    saveTasks(tasks.filter((task) => task.id !== taskId))
  }

  const totalCount = tasks.length
  const completedCount = tasks.filter((t) => t.completed).length
  const remainingCount = totalCount - completedCount
  const handleCloseSettings = useCallback(() => setSettingsOpen(false), [])

  return (
    <section className={styles.shell}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Task Manager</h1>
            <p className={styles.subtitle}>Manage your tasks with ease.</p>
          </div>
          <button
            className={styles.settingsButton}
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
              <path
                d="M16.17 12.5a1.39 1.39 0 0 0 .28 1.53l.05.05a1.69 1.69 0 1 1-2.39 2.39l-.05-.05a1.39 1.39 0 0 0-1.53-.28 1.39 1.39 0 0 0-.84 1.27v.14a1.69 1.69 0 1 1-3.38 0v-.07a1.39 1.39 0 0 0-.91-1.27 1.39 1.39 0 0 0-1.53.28l-.05.05a1.69 1.69 0 1 1-2.39-2.39l.05-.05a1.39 1.39 0 0 0 .28-1.53 1.39 1.39 0 0 0-1.27-.84h-.14a1.69 1.69 0 0 1 0-3.38h.07a1.39 1.39 0 0 0 1.27-.91 1.39 1.39 0 0 0-.28-1.53l-.05-.05a1.69 1.69 0 1 1 2.39-2.39l.05.05a1.39 1.39 0 0 0 1.53.28h.07a1.39 1.39 0 0 0 .84-1.27v-.14a1.69 1.69 0 1 1 3.38 0v.07a1.39 1.39 0 0 0 .84 1.27 1.39 1.39 0 0 0 1.53-.28l.05-.05a1.69 1.69 0 1 1 2.39 2.39l-.05.05a1.39 1.39 0 0 0-.28 1.53v.07a1.39 1.39 0 0 0 1.27.84h.14a1.69 1.69 0 0 1 0 3.38h-.07a1.39 1.39 0 0 0-1.27.84Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor={inputId}>
            New task
          </label>
          <div className={styles.inputRow}>
            <input
              id={inputId}
              className={styles.input}
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
            <button className={styles.addButton} type="submit">
              Add task
            </button>
          </div>
        </form>

        {totalCount > 0 && (
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{totalCount}</span>
              <span className={styles.summaryLabel}>Total</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{remainingCount}</span>
              <span className={styles.summaryLabel}>Remaining</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{completedCount}</span>
              <span className={styles.summaryLabel}>Completed</span>
            </div>
          </div>
        )}

        {totalCount === 0 ? (
          <p className={styles.emptyHint}>No tasks yet — add one above to get started.</p>
        ) : (
          <ul className={styles.taskList}>
            {tasks.map((task) => (
              <li className={styles.taskItem} key={task.id}>
                <div>
                  <p
                    className={
                      task.completed
                        ? `${styles.taskTitle} ${styles.taskTitleCompleted}`
                        : styles.taskTitle
                    }
                  >
                    {task.title}
                  </p>
                  <p className={styles.taskMeta}>
                    Created {formatTaskDate(task.createdAt)}
                  </p>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.toggleButton}
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                  >
                    {task.completed ? 'Mark active' : 'Mark done'}
                  </button>
                  <button
                    className={styles.deleteButton}
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {settingsOpen && (
        <SettingsPanel onClose={handleCloseSettings} />
      )}
    </section>
  )
}
