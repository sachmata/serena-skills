---
name: serena-search
description: Searches file contents using Serena MCP server regex pattern search with glob filtering. Use for full-text regex search across the codebase (including non-code files like YAML, HTML, JSON), with directory restriction, file glob filters, and context lines. Prefer find_symbol for known code symbol names.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: search
---

## Tool

| Tool                 | Purpose                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| `search_for_pattern` | Regex search across project files (Python `re` with DOTALL — `.` matches newlines) |

## When to use vs symbolic tools

- **Use `search_for_pattern`** for exploratory searches, non-code files, or when you don't know exact symbol names
- **Use `find_symbol`** (see `serena-code-intelligence` skill) when you know the symbol name — it's faster and structurally aware
- **Use `search_for_pattern` → then `find_symbol`**: First find candidates by pattern, then use symbolic tools for precise navigation

## Pattern matching behavior

- Compiled with **DOTALL** flag: `.` matches all characters including newlines
- **MULTILINE is not enabled** by default — `^` and `$` anchor to start/end of entire file content. Add `(?m)` inline flag for line-level anchors (e.g., `(?m)^import`)
- Never put `.*` at the beginning or end of a pattern (it's redundant with DOTALL). Use it **in the middle** with non-greedy `.*?` for multi-line spans
- If a pattern matches multiple lines, all those lines are included in the match
- Use non-greedy quantifiers (`.*?`) to avoid matching too much content

## File selection logic

Combine these parameters to target searches precisely:

| Parameter                       | Effect                                                                |
| ------------------------------- | --------------------------------------------------------------------- |
| `relative_path`                 | Restrict to a file or directory subtree                               |
| `paths_include_glob`            | Only search files matching this glob (e.g. `"*.ts"`, `"src/**/*.py"`) |
| `paths_exclude_glob`            | Exclude files matching this glob; takes precedence over include       |
| `restrict_search_to_code_files` | Only search files with LSP-indexed symbols (skip HTML, YAML, etc.)    |

Globs match against relative file paths from the project root. Supports `*`, `?`, `[seq]`, `**`, and brace expansion `{a,b,c}`.

## How to call with mcporter

```bash
# Basic search
npx mcporter call serena.search_for_pattern substring_pattern='TODO'

# With context lines
npx mcporter call serena.search_for_pattern \
  substring_pattern='throw new Error' \
  context_lines_before=2 \
  context_lines_after=2

# Restrict to a directory
npx mcporter call serena.search_for_pattern \
  substring_pattern='fetchUser' \
  relative_path=src/api

# Filter by file glob
npx mcporter call serena.search_for_pattern \
  substring_pattern='import.*from' \
  paths_include_glob='*.ts'

# Exclude generated files
npx mcporter call serena.search_for_pattern \
  substring_pattern='apiKey' \
  paths_exclude_glob='**/*.generated.ts'

# Only code files (those with LSP symbols)
npx mcporter call serena.search_for_pattern \
  substring_pattern='async function' \
  restrict_search_to_code_files=true

# Multi-line pattern (DOTALL means . matches newlines)
npx mcporter call serena.search_for_pattern \
  substring_pattern='function.*?\{.*?console\.log.*?\}'

# Line-anchored search with inline (?m) flag
npx mcporter call serena.search_for_pattern \
  substring_pattern='(?m)^import.*lodash'
```

## Parameter reference

| Parameter                       | Required | Default | Notes                                                 |
| ------------------------------- | -------- | ------- | ----------------------------------------------------- |
| `substring_pattern`             | yes      | —       | Python regex pattern                                  |
| `context_lines_before`          | no       | `0`     | Lines of context before each match                    |
| `context_lines_after`           | no       | `0`     | Lines of context after each match                     |
| `relative_path`                 | no       | `""`    | Restrict to file or directory                         |
| `paths_include_glob`            | no       | `""`    | Include glob (matched against relative paths)         |
| `paths_exclude_glob`            | no       | `""`    | Exclude glob (takes precedence)                       |
| `restrict_search_to_code_files` | no       | `false` | `true` = only LSP-indexed files                       |
| `max_answer_chars`              | no       | `-1`    | Limit output size; prefer narrowing the query instead |

## Notes

- Requires an active project (`serena-project` skill) and the mcporter keep-alive daemon.
- Returns a mapping of file paths to lists of matched consecutive lines.
- If output is too large, narrow the search with `relative_path`, globs, or `restrict_search_to_code_files` rather than increasing `max_answer_chars`.
