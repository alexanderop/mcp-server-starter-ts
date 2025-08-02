---
allowed-tools: Bash(npm run build:*), Bash(npm run lint), Bash(npm run lint:fix)
description: Run both type checking and linting
---

Run comprehensive code checks:

## Type checking
!`npm run build`

## Linting
!`npm run lint`

Automatically fix all errors found:
- For type errors: Analyze and fix all TypeScript errors in the build output
- For linting issues: First run `npm run lint:fix` to auto-fix what's possible, then manually fix any remaining issues