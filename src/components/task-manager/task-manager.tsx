'use client'

import { type FormEvent, useState, useSyncExternalStore } from 'react'

import styles from './task-manager.module.css'
import {
  createTask,
  getServerTaskSnapshot,
  getTaskSnapshot,
  saveTasks,
  subscribeToTaskStore,
} from './task-store'

/**
 * Renders the task manager UI and keeps tasks synced with localStorage.
 */
export function TaskManager() {
  const [draftTitle, setDraftTitle] = useState('')
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

  const completedTaskCount = tasks.filter((task) => task.completed).length
  const remainingTaskCount = tasks.length - completedTaskCount

  return (
    <section className={styles.shell}>
      <div className={styles.panel}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>Next.js + TypeScript</p>
          <h1 className={styles.title}>Task Manager</h1>
          <p className={styles.description}>
            Add tasks, mark them as done, and keep your list saved after refresh.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor='task-title'>
            New task
          </label>
          <div className={styles.inputRow}>
            <input
              id='task-title'
              className={styles.input}
              type='text'
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder='For example: Review the Next.js tutorial'
            />
            <button className={styles.addButton} type='submit'>
              Add task
            </button>
          </div>
        </form>

        <div className={styles.summary} aria-label='Task summary'>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{tasks.length}</span>
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
            <h2 className={styles.listTitle}>Your tasks</h2>
            <p className={styles.listHint}>Click complete to toggle progress.</p>
          </div>

          {tasks.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No tasks yet</h3>
              <p>Create your first task to see it appear here.</p>
            </div>
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
                      Created {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.toggleButton}
                      type='button'
                      onClick={() => handleToggleTask(task.id)}
                    >
                      {task.completed ? 'Mark active' : 'Mark done'}
                    </button>
                    <button
                      className={styles.deleteButton}
                      type='button'
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
      </div>
    </section>
  )
}
