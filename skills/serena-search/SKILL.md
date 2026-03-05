---
name: serena-search
description: Search file contents using Serena MCP server pattern search. Use when you need to find arbitrary regex patterns across the codebase, optionally filtered by file glob, directory, and with surrounding context lines.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: search
---

## What I do

Provide instructions for using `search_for_pattern`, the Serena MCP server tool for flexible full-text regex search across the codebase. Supports file glob filters, directory restriction, context lines, and code-only mode.

## Tool

| Tool | Purpose |
|------|---------|
| `search_for_pattern` | Search file contents using Python regex (DOTALL + MULTILINE flags enabled) |

## How to call with mcporter

### Basic search

```bash
# Find all files containing "TODO" comments
npx mcporter call serena.search_for_pattern \
  substring_pattern='TODO'

# Case-sensitive class name search
npx mcporter call serena.search_for_pattern \
  substring_pattern='class\s+MyClass'
```

### Search with context lines

```bash
# Show 2 lines before and after each match
npx mcporter call serena.search_for_pattern \
  substring_pattern='throw new Error' \
  context_lines_before=2 \
  context_lines_after=2
```

### Restrict to a directory

```bash
npx mcporter call serena.search_for_pattern \
  substring_pattern='fetchUser' \
  relative_path=src/api
```

### Filter by file glob

```bash
# Only search TypeScript files
npx mcporter call serena.search_for_pattern \
  substring_pattern='import.*from' \
  paths_include_glob='*.ts'

# Search test files only
npx mcporter call serena.search_for_pattern \
  substring_pattern='describe\(' \
  paths_include_glob='**/*.test.ts'

# Exclude generated files
npx mcporter call serena.search_for_pattern \
  substring_pattern='apiKey' \
  paths_exclude_glob='**/*.generated.ts'
```

### Search only code files (LSP-indexed)

```bash
# Restrict to files where symbols can be found and manipulated
npx mcporter call serena.search_for_pattern \
  substring_pattern='async function' \
  restrict_search_to_code_files=true
```

### Multi-line pattern (DOTALL is on)

```bash
# Find a function that calls console.log somewhere in its body
npx mcporter call serena.search_for_pattern \
  substring_pattern='function.*?\{.*?console\.log.*?\}' \
  paths_include_glob='*.ts'
```

## When to use me

- You need to search across all files (including YAML, HTML, JSON) not just code.
- You want grep-like functionality with glob-based file filtering.
- You need context lines around matches to understand usage.
- You're doing exploratory searches before using symbol-level tools.

## Notes

- **Requires an active project and the keep-alive daemon running.** mcporter spawns a fresh Serena process per call — without the daemon, activation state is lost between invocations. If the daemon is not running: verify `~/.mcporter/mcporter.json` has `"lifecycle": "keep-alive"` for the `serena` entry, then run `npx mcporter daemon start`. Use the `serena-project` skill to activate a project.
- The pattern uses Python `re` syntax with `DOTALL` and `MULTILINE` flags — `.` matches newlines.
- Avoid `.*` at the start or end of patterns; use it in the middle with non-greedy `.*?` for multi-line spans.
- For finding specific named symbols (classes, functions), prefer `find_symbol` (see `serena-code-intelligence` skill) — it's faster and structurally aware.
- Run `npx mcporter list serena` to verify your Serena MCP server is configured and reachable.
