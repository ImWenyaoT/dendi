# Task Manager Workspace Instructions

## Project context

- This workspace is a beginner-friendly task manager web application.
- The app uses Next.js App Router with TypeScript and React functional components.
- Tasks are stored in browser `localStorage`, so keep persistence logic client-side and browser-safe.

## Coding preferences

- Prefer simple, readable code over abstraction-heavy patterns.
- Keep components small and focused.
- Use TypeScript types for task data and component state.
- Add function-level comments for exported functions and non-trivial helpers.
- Use single quotes and omit semicolons.
- Prefer CSS Modules and `src/app/globals.css` for styling.
- Avoid adding new dependencies unless they are clearly necessary.

## UI expectations

- Keep the interface approachable for beginners.
- Use clear labels, obvious button text, and accessible form controls.
- Make completed tasks visually distinct without hiding their content.
- Preserve mobile usability when adjusting layout or spacing.

## Verification expectations

- Run `pnpm lint` after code changes.
- Run `pnpm build` before claiming the app is complete.
- Run `npm test` if a test script exists, and clearly say when no test suite is configured yet.

## Collaboration expectations

- Explain trade-offs briefly and avoid unnecessary complexity.
- When changing behavior, mention edge cases and suggest practical test cases.
