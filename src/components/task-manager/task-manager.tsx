'use client'

import {
  type CSSProperties,
  type FormEvent,
  useId,
  useState,
  useSyncExternalStore,
} from 'react'

import type { Task } from '@/types/task'

import styles from './task-manager.module.css'
import {
  createTask,
  getServerTaskSnapshot,
  getTaskSnapshot,
  saveTasks,
  subscribeToTaskStore,
} from './task-store'

type ThemePalette = {
  id: string
  family: string
  name: string
  description: string
  pantones: string[]
  colors: {
    glow: string
    surface: string
    surfaceStrong: string
    border: string
    shadow: string
    text: string
    muted: string
    accent: string
    accentStrong: string
    accentContrast: string
    input: string
    inputBorder: string
    inputFocus: string
    summary: string
    summaryBorder: string
    task: string
    taskBorder: string
    successBg: string
    successText: string
    dangerBg: string
    dangerText: string
    chipBg: string
    chipText: string
  }
}

type ThemeStyle = CSSProperties & Record<`--${string}`, string>

const MAX_VISIBLE_TASKS = 3

const FALLBACK_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    title: 'Audit the landing page hierarchy',
    completed: false,
    createdAt: '2026-03-11T09:00:00.000Z',
  },
  {
    id: 'demo-task-2',
    title: 'Pair Pantone colors with UI states',
    completed: true,
    createdAt: '2026-03-10T14:30:00.000Z',
  },
  {
    id: 'demo-task-3',
    title: 'Review the final theme choice',
    completed: false,
    createdAt: '2026-03-09T19:15:00.000Z',
  },
]

const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'cloud-dancer',
    family: 'Pantone Study 01',
    name: 'Cloud Dancer',
    description: '云雾感高级中性色，适合做默认推荐款。',
    pantones: [
      '11-4201 TCX Cloud Dancer',
      '15-4502 TCX Silver Cloud',
      '15-0318 TCX Sage Green',
      '19-4052 TCX Classic Blue',
    ],
    colors: {
      glow: 'rgba(142, 165, 162, 0.38)',
      surface: '#f1eee7',
      surfaceStrong: '#fcfbf8',
      border: 'rgba(121, 130, 138, 0.22)',
      shadow: 'rgba(43, 57, 69, 0.14)',
      text: '#263440',
      muted: '#667784',
      accent: '#3f6b73',
      accentStrong: '#2c4f73',
      accentContrast: '#f8fbfc',
      input: 'rgba(255, 255, 255, 0.84)',
      inputBorder: 'rgba(160, 172, 180, 0.88)',
      inputFocus: 'rgba(44, 79, 115, 0.22)',
      summary: 'rgba(247, 249, 248, 0.92)',
      summaryBorder: 'rgba(126, 150, 146, 0.28)',
      task: 'rgba(255, 255, 255, 0.86)',
      taskBorder: 'rgba(171, 181, 187, 0.24)',
      successBg: '#dbe8df',
      successText: '#315447',
      dangerBg: '#f2e0d9',
      dangerText: '#8a5445',
      chipBg: 'rgba(255, 255, 255, 0.72)',
      chipText: '#51606b',
    },
  },
  {
    id: 'mocha-mousse',
    family: 'Pantone Study 02',
    name: 'Mocha Mousse',
    description: '奶咖与蜂蜜金的编辑感，更有品牌海报气质。',
    pantones: [
      '17-1230 TCX Mocha Mousse',
      '12-0804 TCX Cloud Cream',
      '15-1142 TCX Honey Gold',
      '15-1317 TCX Brush',
    ],
    colors: {
      glow: 'rgba(201, 162, 116, 0.4)',
      surface: '#efe1d4',
      surfaceStrong: '#fbf4eb',
      border: 'rgba(125, 92, 68, 0.2)',
      shadow: 'rgba(98, 69, 50, 0.16)',
      text: '#3f2f25',
      muted: '#7b6658',
      accent: '#9d6d4e',
      accentStrong: '#d7aa5b',
      accentContrast: '#fffaf4',
      input: 'rgba(255, 250, 244, 0.88)',
      inputBorder: 'rgba(194, 157, 130, 0.72)',
      inputFocus: 'rgba(157, 109, 78, 0.2)',
      summary: 'rgba(249, 236, 223, 0.9)',
      summaryBorder: 'rgba(215, 170, 91, 0.32)',
      task: 'rgba(255, 250, 245, 0.88)',
      taskBorder: 'rgba(172, 132, 105, 0.22)',
      successBg: '#e1dec7',
      successText: '#5d6340',
      dangerBg: '#f1ddd5',
      dangerText: '#8a5042',
      chipBg: 'rgba(255, 250, 244, 0.78)',
      chipText: '#6b5244',
    },
  },
  {
    id: 'rose-dust',
    family: 'Pantone Study 03',
    name: 'Rose Dust',
    description: '柔粉编辑感配色，更柔和，也更偏生活方式品牌。',
    pantones: [
      '14-1307 TCX Rose Dust',
      '12-1206 TCX Rosewater',
      '13-1318 TCX Peach Bloom',
      '16-1511 TCX Mauvewood',
    ],
    colors: {
      glow: 'rgba(219, 178, 173, 0.36)',
      surface: '#f4e6e2',
      surfaceStrong: '#fcf4f1',
      border: 'rgba(175, 128, 125, 0.22)',
      shadow: 'rgba(118, 83, 85, 0.14)',
      text: '#52383e',
      muted: '#87676e',
      accent: '#b77273',
      accentStrong: '#cb9f96',
      accentContrast: '#fff8f6',
      input: 'rgba(255, 250, 248, 0.88)',
      inputBorder: 'rgba(205, 171, 167, 0.74)',
      inputFocus: 'rgba(183, 114, 115, 0.22)',
      summary: 'rgba(251, 240, 237, 0.92)',
      summaryBorder: 'rgba(203, 159, 150, 0.28)',
      task: 'rgba(255, 251, 250, 0.9)',
      taskBorder: 'rgba(192, 154, 149, 0.22)',
      successBg: '#e7e0d7',
      successText: '#616048',
      dangerBg: '#f2dddd',
      dangerText: '#8e5355',
      chipBg: 'rgba(255, 250, 248, 0.76)',
      chipText: '#7a5e63',
    },
  },
  {
    id: 'winter-green',
    family: 'Pantone Study 04',
    name: 'Winter Green',
    description: '青绿与板岩蓝组合，更冷静，也更像工作流产品。',
    pantones: [
      '16-5924 TCX Winter Green',
      '17-5117 TCX Green-Blue Slate',
      '13-5304 TCX Aqua Haze',
      '11-0606 TCX Bright White',
    ],
    colors: {
      glow: 'rgba(122, 174, 167, 0.34)',
      surface: '#e4efec',
      surfaceStrong: '#f4fbf9',
      border: 'rgba(88, 136, 129, 0.22)',
      shadow: 'rgba(44, 83, 79, 0.15)',
      text: '#224440',
      muted: '#5c7d78',
      accent: '#3e827b',
      accentStrong: '#5d7f89',
      accentContrast: '#f7fcfb',
      input: 'rgba(248, 253, 252, 0.9)',
      inputBorder: 'rgba(156, 186, 180, 0.74)',
      inputFocus: 'rgba(62, 130, 123, 0.2)',
      summary: 'rgba(235, 245, 242, 0.92)',
      summaryBorder: 'rgba(93, 127, 137, 0.28)',
      task: 'rgba(255, 255, 255, 0.88)',
      taskBorder: 'rgba(145, 177, 171, 0.24)',
      successBg: '#d9ece4',
      successText: '#2d6257',
      dangerBg: '#ece2db',
      dangerText: '#87614d',
      chipBg: 'rgba(255, 255, 255, 0.74)',
      chipText: '#4f6a67',
    },
  },
]

/**
 * Maps one Pantone theme into CSS custom properties used by a single preview card.
 */
function createThemeStyle(theme: ThemePalette): ThemeStyle {
  return {
    '--theme-glow': theme.colors.glow,
    '--theme-surface': theme.colors.surface,
    '--theme-surface-strong': theme.colors.surfaceStrong,
    '--theme-border': theme.colors.border,
    '--theme-shadow': theme.colors.shadow,
    '--theme-text': theme.colors.text,
    '--theme-muted': theme.colors.muted,
    '--theme-accent': theme.colors.accent,
    '--theme-accent-strong': theme.colors.accentStrong,
    '--theme-accent-contrast': theme.colors.accentContrast,
    '--theme-input': theme.colors.input,
    '--theme-input-border': theme.colors.inputBorder,
    '--theme-input-focus': theme.colors.inputFocus,
    '--theme-summary': theme.colors.summary,
    '--theme-summary-border': theme.colors.summaryBorder,
    '--theme-task': theme.colors.task,
    '--theme-task-border': theme.colors.taskBorder,
    '--theme-success-bg': theme.colors.successBg,
    '--theme-success-text': theme.colors.successText,
    '--theme-danger-bg': theme.colors.dangerBg,
    '--theme-danger-text': theme.colors.dangerText,
    '--theme-chip-bg': theme.colors.chipBg,
    '--theme-chip-text': theme.colors.chipText,
  }
}

/**
 * Returns either the real tasks or a fixed seed list so empty storage still shows the palette.
 */
function getPreviewTasks(tasks: Task[]) {
  if (tasks.length === 0) {
    return FALLBACK_TASKS
  }

  return tasks.slice(0, MAX_VISIBLE_TASKS)
}

/**
 * Formats a stored timestamp into a compact date label for task metadata.
 */
function formatTaskDate(createdAt: string) {
  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Renders a single Pantone theme card while sharing one task dataset across all previews.
 */
function ThemeCard({
  draftTitle,
  inputId,
  isSeedPreview,
  overflowCount,
  previewTasks,
  theme,
  totalTaskCount,
  remainingTaskCount,
  completedTaskCount,
  onDeleteTask,
  onDraftTitleChange,
  onSubmit,
  onToggleTask,
}: {
  draftTitle: string
  inputId: string
  isSeedPreview: boolean
  overflowCount: number
  previewTasks: Task[]
  theme: ThemePalette
  totalTaskCount: number
  remainingTaskCount: number
  completedTaskCount: number
  onDeleteTask: (taskId: string) => void
  onDraftTitleChange: (title: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onToggleTask: (taskId: string) => void
}) {
  return (
    <article className={styles.themeCard} style={createThemeStyle(theme)}>
      <div className={styles.cardHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.cardEyebrow}>{theme.family}</p>
          <h2 className={styles.cardTitle}>{theme.name}</h2>
        </div>
        <p className={styles.cardDescription}>{theme.description}</p>
        <div className={styles.swatchRow}>
          {theme.pantones.map((pantone) => (
            <span className={styles.swatchChip} key={pantone}>
              {pantone}
            </span>
          ))}
        </div>
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label} htmlFor={inputId}>
          New task
        </label>
        <div className={styles.inputRow}>
          <input
            id={inputId}
            className={styles.input}
            type='text'
            value={draftTitle}
            onChange={(event) => onDraftTitleChange(event.target.value)}
            placeholder='For example: Review the Pantone shortlist'
          />
          <button className={styles.addButton} type='submit'>
            Add task
          </button>
        </div>
      </form>

      <div className={styles.summary} aria-label={`${theme.name} task summary`}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{totalTaskCount}</span>
          <span className={styles.summaryLabel}>Total</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{remainingTaskCount}</span>
          <span className={styles.summaryLabel}>Remaining</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{completedTaskCount}</span>
          <span className={styles.summaryLabel}>Completed</span>
        </div>
      </div>

      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>Shared task preview</h3>
          <p className={styles.listHint}>
            {isSeedPreview
                ? 'Seed tasks appear until you add your own.'
              : overflowCount > 0
                ? `${overflowCount} more task${overflowCount > 1 ? 's' : ''} in storage`
                : 'All four cards stay in sync.'}
          </p>
        </div>

        <ul className={styles.taskList}>
          {previewTasks.map((task) => (
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
                <p className={styles.taskMeta}>Created {formatTaskDate(task.createdAt)}</p>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.toggleButton}
                  type='button'
                  disabled={isSeedPreview}
                  onClick={() => onToggleTask(task.id)}
                >
                  {task.completed ? 'Mark active' : 'Mark done'}
                </button>
                <button
                  className={styles.deleteButton}
                  type='button'
                  disabled={isSeedPreview}
                  onClick={() => onDeleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

/**
 * Renders a side-by-side Pantone comparison board while keeping task data synced to localStorage.
 */
export function TaskManager() {
  const [draftTitle, setDraftTitle] = useState('')
  const inputBaseId = useId()
  const tasks = useSyncExternalStore(
    subscribeToTaskStore,
    getTaskSnapshot,
    getServerTaskSnapshot,
  )

  /**
   * Adds a new task when the form is submitted with non-empty input.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedTitle = draftTitle.trim()

    if (!normalizedTitle) {
      return
    }

    saveTasks([createTask(normalizedTitle), ...tasks])
    setDraftTitle('')
  }

  /**
   * Flips the completion state for a single task item.
   */
  function handleToggleTask(taskId: string) {
    saveTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  /**
   * Removes a task from the current list.
   */
  function handleDeleteTask(taskId: string) {
    saveTasks(tasks.filter((task) => task.id !== taskId))
  }

  const previewTasks = getPreviewTasks(tasks)
  const isSeedPreview = tasks.length === 0
  const totalTaskCount = isSeedPreview ? previewTasks.length : tasks.length
  const completedTaskCount = previewTasks.filter((task) => task.completed).length
  const remainingTaskCount = totalTaskCount - completedTaskCount
  const overflowCount = isSeedPreview ? 0 : Math.max(tasks.length - previewTasks.length, 0)

  return (
    <section className={styles.shell}>
      <div className={styles.frame}>
        <header className={styles.heroPanel}>
          <p className={styles.eyebrow}>Pantone Comparison Demo</p>
          <h1 className={styles.title}>Choose the right color system before we restyle the app</h1>
          <p className={styles.description}>
            Each card uses the same task data so you can compare hierarchy, button states,
            readability, and overall mood without switching screens.
          </p>
          <p className={styles.note}>
            If your storage is empty, the preview uses three seed tasks so the palettes stay easy
            to evaluate.
          </p>
        </header>

        <div className={styles.comparisonGrid}>
          {THEME_PALETTES.map((theme) => (
            <ThemeCard
              key={theme.id}
              draftTitle={draftTitle}
              inputId={`${inputBaseId}-${theme.id}`}
              isSeedPreview={isSeedPreview}
              overflowCount={overflowCount}
              previewTasks={previewTasks}
              theme={theme}
              totalTaskCount={totalTaskCount}
              remainingTaskCount={remainingTaskCount}
              completedTaskCount={completedTaskCount}
              onDeleteTask={handleDeleteTask}
              onDraftTitleChange={setDraftTitle}
              onSubmit={handleSubmit}
              onToggleTask={handleToggleTask}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
