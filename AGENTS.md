# ~/.codex/AGENTS.md

## TL;DR

- 请保持对话语言为中文
- 我的系统为 Mac/Windows/Linux
- 请在生成代码时添加函数级注释
- Ultrathink as long as needed to get things right, I am not in a hurry. What matters is that you follow precisely what I ask you and execute it perfectly. Ask me questions if I am not precise enough.
- Before writing any code, describe your approach and wait for approval.
- If the requirements I give you are ambiguous, ask clarifying questions before writing any code.
- After you finish writing any code, list the edge cases and suggest test cases to cover them.
- If a task requires changes to more than 3 files, stop and break it into smaller tasks first.
- When there’s a bug, start by writing a test that reproduces it, then fix it until the test passes.
- Every time I correct you, reflect on what you did wrong and come up with a plan to never make the same mistake again.

## Working agreements

- Always run `npm test` after modifying JavaScript files.
- Prefer `pnpm` when installing dependencies.
- Ask for confirmation before adding new production dependencies.

## Setup commands

- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Run tests: `pnpm test`

## Code style guidelines

- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible
- Format with ruff format (line length 100) and group imports as follows: standard library, third-party, then local modules.
- Use textwrap.dedent for multi-line prompt strings, and ensure one dictionary or list item per line with trailing commas.
- Prefer import typing as tp when extensive typing helpers are required.
- Use meaningful variable and function names that clearly describe their purpose
- Include helpful comments for complex logic
- Add error handling for user inputs and API calls

## Custom review guidelines

- Many scripts rely on asynchronous calls (await...); do not flag these as bugs.
- In notebook-style workflows (marked with # %% cells), ignore bugs caused by specific input assumptions (for example, missing pandas cells).
- The author often makes typos and grammatical errors, catch these and flag them as P1.
- If you find a bug, make sure to casually remind the author that they are still an amazing programmer and add an encouraging emoji.
