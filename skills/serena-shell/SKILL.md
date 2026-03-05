---
name: serena-shell
description: Executes shell commands in the project context via Serena MCP server. Use for running builds, tests, linters, git commands, or any CLI operation within the active project directory. Never use for long-running servers or interactive processes.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: shell
---

## Tool

| Tool                    | Purpose                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `execute_shell_command` | Execute a shell command in the project root (or a specified subdirectory) and return output |

## Before running commands

If the project has a memory with suggested commands (e.g. `build/commands`), **read it first** (see `serena-memory` skill) to use the correct project-specific invocations.

## How to call with mcporter

```bash
# Run tests
npx mcporter call serena.execute_shell_command command='npm test'

# Build
npx mcporter call serena.execute_shell_command command='cargo build'

# Run in a specific subdirectory
npx mcporter call serena.execute_shell_command command='npm install' cwd=packages/frontend

# Suppress stderr (useful when stderr is noisy but irrelevant)
npx mcporter call serena.execute_shell_command command='git log --oneline -10' capture_stderr=false

# Type-check
npx mcporter call serena.execute_shell_command command='tsc --noEmit'

# Lint
npx mcporter call serena.execute_shell_command command='eslint src/'

# Git status
npx mcporter call serena.execute_shell_command command='git status'

# Custom script
npx mcporter call serena.execute_shell_command command='./scripts/generate.sh'
```

## Parameter reference

| Parameter          | Required | Default      | Notes                                                     |
| ------------------ | -------- | ------------ | --------------------------------------------------------- |
| `command`          | yes      | —            | The shell command to execute                              |
| `cwd`              | no       | project root | Working directory (relative to project root)              |
| `capture_stderr`   | no       | `true`       | Set `false` to suppress stderr in output                  |
| `max_answer_chars` | no       | `-1`         | Only adjust if output is too large and cannot be narrowed |

## Safety rules

- **Never execute unsafe or destructive commands** (`rm -rf /`, `dd`, format commands, etc.)
- **Do not start long-running processes** (servers, watchers) that are not intended to terminate quickly
- **Do not start processes requiring user interaction** (interactive prompts, editors)

## Notes

- Requires an active project (`serena-project` skill) and the mcporter keep-alive daemon.
- The command runs in the project root by default; use `cwd` to target a subdirectory.
- Returns a JSON object with `stdout` and optionally `stderr`.
