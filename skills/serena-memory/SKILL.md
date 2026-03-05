---
name: serena-memory
description: Manage persistent project and global memories using Serena MCP server. Use to write, read, list, edit, rename, or delete memories that persist context across conversations, such as project conventions, suggested commands, architecture notes, and style guides.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: memory
---

## What I do

Provide instructions for using Serena MCP server memory tools. Memories persist across conversations and can be scoped globally (prefix `global/`) or per-project. They are stored as Markdown files organized by topic.

## Tools in this category

| Tool | Purpose |
|------|---------|
| `write_memory` | Create or overwrite a memory |
| `read_memory` | Read a memory's content |
| `list_memories` | List all available memories, optionally filtered by topic |
| `edit_memory` | Replace content in a memory via literal or regex |
| `rename_memory` | Rename or move a memory (use `/` for topic organization) |
| `delete_memory` | Delete a memory (only when explicitly requested) |

## Memory naming conventions

- Use `/` as a separator to organize into topics: `auth/login/logic`, `build/commands`
- Prefix with `global/` for memories shared across all projects: `global/typescript/style-guide`
- Names should be descriptive and lowercase with hyphens

## How to call with mcporter

### Write a memory

```bash
# Save project build commands
npx mcporter call serena.write_memory \
  memory_name=build/commands \
  content='## Build Commands
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
'

# Save a global style guide
npx mcporter call serena.write_memory \
  memory_name=global/typescript/style-guide \
  content='## TypeScript Style
- Use strict mode
- Prefer interfaces over type aliases for object shapes
- Always type function return values explicitly
'
```

### Read a memory

> The parameter is `memory_name`, not `name`.

```bash
npx mcporter call serena.read_memory memory_name=build/commands
npx mcporter call serena.read_memory memory_name=global/typescript/style-guide
```

### List memories

```bash
# List all memories
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

# Regex replacement
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

### Rename or move a memory

```bash
# Move to a different topic
npx mcporter call serena.rename_memory \
  old_name=commands \
  new_name=build/commands

# Rename within same topic
npx mcporter call serena.rename_memory \
  old_name=build/commands \
  new_name=build/scripts
```

### Delete a memory

```bash
# Only delete when explicitly instructed
npx mcporter call serena.delete_memory memory_name=build/commands
```

## When to use me

- You want to persist project conventions, build commands, or architecture decisions across sessions.
- You need to read previously stored context before starting work on a project.
- You want to maintain a global style guide or coding standards across all projects.
- You need to update or reorganize existing memories as the project evolves.

## Notes

- **Project-scoped memories require an active project and the keep-alive daemon running.** mcporter spawns a fresh Serena process per call — without the daemon, activation state is lost between invocations. If the daemon is not running: verify `~/.mcporter/mcporter.json` has `"lifecycle": "keep-alive"` for the `serena` entry, then run `npx mcporter daemon start`. Use the `serena-project` skill to activate a project. Global memories (`global/` prefix) do not require an active project.
- Always check `list_memories` before writing to avoid overwriting important existing memories.
- Read relevant memories at the start of a work session to load project context.
- `global/` memories are shared across all projects — be careful about what you store there.
- Run `npx mcporter list serena` to verify your Serena MCP server is configured and reachable.
