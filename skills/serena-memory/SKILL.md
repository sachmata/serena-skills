---
name: serena-memory
description: Manages persistent project and global memories via Serena MCP server. Use to write, read, list, edit, rename, or delete cross-session memories (project conventions, suggested commands, architecture notes, style guides). Memories are Markdown files organized by topic with "/" separators. Use "global/" prefix for cross-project memories.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: memory
---

## Tools

| Tool            | Purpose                                                                      |
| --------------- | ---------------------------------------------------------------------------- |
| `write_memory`  | Create or overwrite a memory (Markdown format)                               |
| `read_memory`   | Read a memory's content — only read if likely relevant to the current task   |
| `list_memories` | List all memories, optionally filtered by topic                              |
| `edit_memory`   | Replace content in a memory via literal string or regex (DOTALL + MULTILINE) |
| `rename_memory` | Rename or move a memory (use `/` for topic organization)                     |
| `delete_memory` | Delete a memory — only when explicitly instructed by the user                |

## Memory naming conventions

- Use `/` to organize into topics: `auth/login/logic`, `build/commands`, `modules/backend`
- Prefix with `global/` for cross-project memories: `global/typescript/style-guide`, `global/java/style_guide`
- Names should be descriptive, lowercase with hyphens
- The `global/` prefix should only be used when explicitly instructed

## Session workflow

1. After project activation and onboarding, call `list_memories` to see what's available
2. Read relevant memories based on their names — infer relevance from the name
3. Keep memories current as the project evolves (use `edit_memory` for partial updates, `write_memory` for full rewrites)

Onboarding automatically creates initial memories on first project activation. On subsequent activations, existing memories are read instead of redoing onboarding.

## How to call with mcporter

### Write a memory

```bash
npx mcporter call serena.write_memory \
  memory_name=build/commands \
  content='## Build Commands
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
'

# Global memory (shared across all projects)
npx mcporter call serena.write_memory \
  memory_name=global/typescript/style-guide \
  content='## TypeScript Style
- Use strict mode
- Prefer interfaces over type aliases for object shapes
'
```

### Read a memory

```bash
npx mcporter call serena.read_memory memory_name=build/commands
```

### List memories

```bash
# List all
npx mcporter call serena.list_memories

# Filter by topic
npx mcporter call serena.list_memories topic=build
npx mcporter call serena.list_memories topic=global
```

### Edit a memory (partial update)

```bash
# Literal replacement
npx mcporter call serena.edit_memory \
  memory_name=build/commands \
  mode=literal \
  needle='npm test' \
  repl='npm run test:ci'

# Regex replacement (DOTALL + MULTILINE enabled)
npx mcporter call serena.edit_memory \
  memory_name=build/commands \
  mode=regex \
  needle='- Build:.*' \
  repl='- Build: `pnpm build`'

# Replace multiple occurrences
npx mcporter call serena.edit_memory \
  memory_name=build/commands \
  mode=literal \
  needle='npm' \
  repl='pnpm' \
  allow_multiple_occurrences=true
```

### Rename / move a memory

```bash
npx mcporter call serena.rename_memory old_name=commands new_name=build/commands
```

### Delete a memory

```bash
# Only delete when explicitly instructed by the user
npx mcporter call serena.delete_memory memory_name=build/commands
```

## Parameter reference

| Tool            | Parameter                    | Required | Default        | Notes                                                      |
| --------------- | ---------------------------- | -------- | -------------- | ---------------------------------------------------------- |
| `write_memory`  | `memory_name`                | yes      | —              | Use `/` for topics, `global/` for cross-project            |
|                 | `content`                    | yes      | —              | UTF-8 Markdown content                                     |
|                 | `max_chars`                  | no       | config default | Only change if instructed                                  |
| `read_memory`   | `memory_name`                | yes      | —              |                                                            |
| `list_memories` | `topic`                      | no       | `""`           | Filter by topic prefix                                     |
| `edit_memory`   | `memory_name`                | yes      | —              |                                                            |
|                 | `needle`                     | yes      | —              | Literal string or regex pattern                            |
|                 | `repl`                       | yes      | —              | Replacement string (verbatim)                              |
|                 | `mode`                       | yes      | —              | `"literal"` or `"regex"` (Python `re`, DOTALL + MULTILINE) |
|                 | `allow_multiple_occurrences` | no       | `false`        |                                                            |
| `rename_memory` | `old_name`                   | yes      | —              |                                                            |
|                 | `new_name`                   | yes      | —              |                                                            |
| `delete_memory` | `memory_name`                | yes      | —              | Only call if user explicitly requests                      |

## Notes

- Project-scoped memories require an active project (`serena-project` skill). Global memories (`global/` prefix) do not.
- Check `list_memories` before writing to avoid overwriting important existing memories.
- Memory tools are **disabled in `no-memories` mode**. If memory tools are missing from `get_current_config`, check whether Serena was started with `no-memories` mode active.
- `edit_memory` regex mode uses both DOTALL and MULTILINE flags — `.` matches newlines, `^`/`$` match line boundaries.
