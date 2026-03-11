# Task Manager Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a beginner-friendly task manager web app with Next.js and TypeScript that can add, delete, and complete tasks with local persistence, and add VS Code Copilot workspace customization files.

**Architecture:** Use a Next.js App Router application with a single client-side task manager component rendered on the home page. Persist tasks in `localStorage`, keep styling lightweight with CSS Modules and global CSS, and add workspace-level Copilot instructions plus role-specific custom agents under `.github/agents`.

**Tech Stack:** Next.js, React, TypeScript, CSS Modules, browser localStorage, VS Code Copilot customization files

---

### Task 1: Scaffold the Next.js workspace

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

**Step 1: Create the project scaffold**

Run: `pnpm dlx create-next-app@latest . --ts --eslint --app --src-dir --use-pnpm --import-alias "@/*" --no-tailwind --no-turbopack --yes`
Expected: a new Next.js App Router project is generated in the current workspace

**Step 2: Verify the scaffold files exist**

Run: `find src/app -maxdepth 1 -type f | sort`
Expected: layout, page, global styles, and supporting files are present

**Step 3: Check dependency scripts**

Run: `node -p "Object.keys(require('./package.json').scripts).join(', ')"`
Expected: scripts include `dev`, `build`, `start`, and `lint`

### Task 2: Build the task manager feature with persistence

**Files:**
- Create: `src/types/task.ts`
- Create: `src/components/task-manager/task-manager.tsx`
- Create: `src/components/task-manager/task-manager.module.css`
- Modify: `src/app/page.tsx`

**Step 1: Write the task type and component structure**

Add a `Task` type with `id`, `title`, `completed`, and `createdAt`. Build a client component with typed props/state and documented helper functions.

**Step 2: Add localStorage persistence**

Use `useEffect` to load tasks on mount and save tasks after changes. Guard browser-only APIs so the page remains safe during server rendering.

**Step 3: Implement user actions**

Support:
- add a task from the form
- reject empty input
- toggle completion state
- delete a task
- show empty state and summary counts

**Step 4: Wire the component into the home page**

Replace the starter page content with the task manager component and concise app copy.

### Task 3: Polish the UI for a clean beginner-friendly experience

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/task-manager/task-manager.module.css`
- Optionally modify: `src/app/layout.tsx`

**Step 1: Define simple visual structure**

Use a centered card layout, clear spacing, readable typography, visible button states, and good contrast.

**Step 2: Add accessibility touches**

Ensure labels are present, buttons have clear text, and completed tasks are visually distinct without hiding content.

### Task 4: Add VS Code Copilot workspace customization

**Files:**
- Create: `.github/copilot-instructions.md`
- Create: `.github/agents/planner.agent.md`
- Create: `.github/agents/builder.agent.md`
- Create: `.github/agents/reviewer.agent.md`

**Step 1: Add workspace-wide instructions**

Document the project stack, coding style, beginner-friendly expectations, preference for simple React patterns, and testing/verification expectations in `.github/copilot-instructions.md`.

**Step 2: Add custom planning agent**

Create a planning-focused agent with read-oriented tools and a handoff to the builder agent.

**Step 3: Add custom builder agent**

Create an implementation-focused agent for making small, safe code changes in this workspace.

**Step 4: Add custom reviewer agent**

Create a review-focused agent that checks behavior, simplicity, accessibility, and regression risk.

### Task 5: Verify the workspace

**Files:**
- Verify only

**Step 1: Run lint**

Run: `pnpm lint`
Expected: lint passes

**Step 2: Run tests if a test script exists**

Run: `npm test`
Expected: tests pass, or document that the generated starter does not include a configured test suite yet

**Step 3: Run a production build**

Run: `pnpm build`
Expected: Next.js production build succeeds

**Step 4: Summarize edge cases**

Document behavior for empty input, duplicate titles, first load without saved tasks, and corrupted local storage data.
