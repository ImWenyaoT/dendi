# Dark Theme Rebalance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebalance the `cloud-dancer` and `winter-green` dark themes so they stay visually paired with their light variants while feeling softer and less fatiguing at night.

**Architecture:** Keep the existing token model intact and limit the change to dark-mode values inside the shared theme token stylesheet. Rework surface, text, accent, focus, and page-background tokens together so each theme reads as one coherent material system rather than a dark shell plus bright highlights.

**Tech Stack:** Next.js, CSS custom properties, CSS Modules

---

### Task 1: Document the approved color direction

**Files:**
- Create: `docs/plans/2026-03-12-dark-theme-rebalance.md`

**Step 1: Capture the constraints**

Record the approved direction:
- preserve the light/dark relationship inside each theme
- keep Pantone-inspired color thinking
- bias toward soft, low-stimulus contrast in dark mode

**Step 2: Limit implementation scope**

Constrain the work to token updates only so component structure and theme wiring remain untouched.

### Task 2: Rebalance the Cloud Dancer dark tokens

**Files:**
- Modify: `src/components/theme-provider/theme-tokens.css`

**Step 1: Soften the base surfaces**

Replace the current near-black blue surfaces with foggier blue-gray surfaces that still feel related to the warm paper-like light theme.

**Step 2: Reduce highlight intensity**

Mute `--theme-accent`, `--theme-accent-strong`, and `--theme-input-focus` so buttons and focus rings remain visible without glowing.

**Step 3: Re-tune support colors**

Adjust border, summary, task, success, danger, and page background tokens so all supporting elements share the same restrained night palette.

### Task 3: Rebalance the Winter Green dark tokens

**Files:**
- Modify: `src/components/theme-provider/theme-tokens.css`

**Step 1: Shift the base toward evergreen mist**

Move the dark surfaces away from bright teal-black into softer fir-green and misted sage tones that map back to the light theme.

**Step 2: Keep interactive states readable**

Retune accent and focus tokens so interactive affordances are legible but still low-stimulation.

**Step 3: Align feedback colors**

Bring success and danger states into the same muted material system to avoid isolated bright spots.

### Task 4: Verify the palette change

**Files:**
- Verify only

**Step 1: Run the automated test suite**

Run: `npm test`
Expected: existing tests pass, confirming the token-only change did not regress theme state logic

**Step 2: Manually review for visual edge cases**

Check that text, buttons, input focus rings, summary panels, and task cards remain distinct in both dark themes without sharp contrast spikes.
