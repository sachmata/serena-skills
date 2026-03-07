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

## Quick reference

```
sr(tool="execute_shell_command", args='{"command": "npm test", "cwd": "packages/frontend", "capture_stderr": false}')
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

- The command runs in the project root by default; use `cwd` to target a subdirectory.
- Returns a JSON object with `stdout` and optionally `stderr`.
