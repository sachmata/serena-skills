---
name: serena-file-io
description: Read, write, list, and find files using Serena MCP server file I/O tools. Use when you need to read file content, create or overwrite files, list directory contents, or locate files by name pattern.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: file-io
---

## What I do

Provide instructions for using Serena MCP server tools that handle file system operations: reading files, writing files, listing directories, and finding files by mask.

## Tools in this category

| Tool | Purpose |
|------|---------|
| `read_file` | Read file content (full or a line range) |
| `create_text_file` | Write a new file or overwrite an existing one |
| `list_dir` | List files and directories (optionally recursive) |
| `find_file` | Find files by filename mask (wildcards `*` and `?`) |

## How to call with mcporter

MCPorter lets you call Serena MCP tools directly from the CLI without writing TypeScript.

### Read a file

```bash
# Read entire file
npx mcporter call serena.read_file relative_path=src/index.ts

# Read a specific line range (0-based)
npx mcporter call serena.read_file relative_path=src/index.ts start_line=10 end_line=50
```

### Write / overwrite a file

```bash
# Create or overwrite a file (provide the full content)
npx mcporter call serena.create_text_file \
  relative_path=src/hello.ts \
  content='export const hello = () => "world";'
```

### List a directory

```bash
# Shallow listing
npx mcporter call serena.list_dir relative_path=src recursive=false

# Recursive listing (skips gitignored files)
npx mcporter call serena.list_dir relative_path=. recursive=true skip_ignored_files=true
```

### Find files by mask

```bash
# Find all TypeScript files under src/
npx mcporter call serena.find_file file_mask="*.ts" relative_path=src

# Find a specific config file anywhere in the project
npx mcporter call serena.find_file file_mask="tsconfig*.json" relative_path=.
```

## When to use me

- You need to read source files to understand implementation details.
- You want to write or scaffold new files programmatically.
- You want to explore a project's directory structure.
- You need to locate files by name pattern before reading or editing them.

## Notes

- **Requires an active project and the keep-alive daemon running.** mcporter spawns a fresh Serena process per call — without the daemon, activation state is lost between invocations. If the daemon is not running: verify `~/.mcporter/mcporter.json` has `"lifecycle": "keep-alive"` for the `serena` entry, then run `npx mcporter daemon start`. Use the `serena-project` skill to activate a project.
- `read_file` line indices are **0-based**.
- `create_text_file` **overwrites** the target file if it already exists — use with care.
- Prefer symbolic tools (`serena-code-intelligence`, `serena-code-editing` skills) when you already know the symbol name; they are faster and more precise than reading raw files.
- Set up mcporter config to point at your Serena MCP server before using these calls. Run `npx mcporter list serena` to verify connectivity.
