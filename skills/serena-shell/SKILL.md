---
name: serena-shell
description: Execute shell commands in the project context using Serena MCP server. Use for running builds, tests, linters, git commands, or any shell operation within the active project directory.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: shell
---

## What I do

Provide instructions for using `serena_execute_shell_command`, the Serena MCP server tool that runs shell commands within the project. This is the right tool when you need to execute build tools, test runners, package managers, or any other CLI program.

## Tool

| Tool | Purpose |
|------|---------|
| `serena_execute_shell_command` | Execute a shell command in the project root (or a specified subdirectory) |

## How to call with mcporter

### Run a basic command

```bash
npx mcporter call serena.serena_execute_shell_command command='npm test'
npx mcporter call serena.serena_execute_shell_command command='pnpm build'
npx mcporter call serena.serena_execute_shell_command command='cargo check'
```

### Run in a specific directory

```bash
npx mcporter call serena.serena_execute_shell_command \
  command='npm install' \
  cwd=packages/frontend
```

### Suppress stderr capture

```bash
# Only capture stdout (useful when stderr is noisy but not relevant)
npx mcporter call serena.serena_execute_shell_command \
  command='git log --oneline -10' \
  capture_stderr=false
```

### Common use cases

```bash
# Run tests
npx mcporter call serena.serena_execute_shell_command command='pytest tests/ -v'

# Check types
npx mcporter call serena.serena_execute_shell_command command='tsc --noEmit'

# Lint
npx mcporter call serena.serena_execute_shell_command command='eslint src/'

# Git status
npx mcporter call serena.serena_execute_shell_command command='git status'

# Install dependencies
npx mcporter call serena.serena_execute_shell_command command='npm ci'

# Run a custom script
npx mcporter call serena.serena_execute_shell_command command='./scripts/generate.sh'
```

## When to use me

- You need to verify a build compiles after making code changes.
- You want to run the test suite and see results.
- You need to execute linters, formatters, or type checkers.
- You need to run git commands or other project utilities.
- You want to install or update dependencies.

## Notes

- **Never execute unsafe or destructive commands** (e.g., `rm -rf /`, `dd`, format commands).
- Do not use this tool to start long-running servers or processes that require interactive input.
- If Serena has a memory with suggested commands for the project, read that first (`serena-memory` skill).
- The command runs in the project root by default; use `cwd` to target a subdirectory.
- Run `npx mcporter list serena` to verify your Serena MCP server is configured and reachable.
