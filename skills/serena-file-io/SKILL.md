---
name: serena-file-io
description: Reads, writes, lists, and finds files via Serena MCP server. Use when reading file content, creating or overwriting files, listing directory contents, or locating files by name pattern. Prefer symbolic tools (find_symbol, get_symbols_overview) when looking for specific code symbols.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: file-io
---

## Tools

| Tool               | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `read_file`        | Read file content — full file or a line range (0-based indices)         |
| `create_text_file` | Write a new file or **overwrite** an existing one                       |
| `list_dir`         | List files and directories (optionally recursive)                       |
| `find_file`        | Find non-gitignored files matching a filename mask (`*`, `?` wildcards) |

## Strategy: when to use file-level vs symbolic tools

Once a project is activated, always use Serena's file tools instead of the agent's built-in file read/write/list — they operate relative to the project root and respect `.gitignore`.

Prefer symbolic tools (`get_symbols_overview`, `find_symbol`) when you know which code symbols you need — they are faster and structurally aware. Use file I/O tools when:

- You need the full raw text of a file (config, prose, data files)
- You need to explore directory structure before diving into code
- You need to locate files by name pattern before using symbolic tools
- The file is not a code file (YAML, HTML, JSON, Markdown, etc.)

Avoid reading entire source files unless absolutely necessary. Instead, use `get_symbols_overview` → `find_symbol` with `include_body=true` for just the symbols you need (see `serena-code-intelligence` skill).

## Quick reference

```
sr(tool="read_file", args="relative_path=src/index.ts start_line=10 end_line=50")
sr(tool="create_text_file", args="relative_path=src/hello.ts content='export const hello = () => \"world\";'")
sr(tool="list_dir", args="relative_path=src recursive=true skip_ignored_files=true")
sr(tool="find_file", args="file_mask='*.ts' relative_path=src")
```

## Parameter reference

| Tool               | Parameter            | Required | Default     | Notes                      |
| ------------------ | -------------------- | -------- | ----------- | -------------------------- |
| `read_file`        | `relative_path`      | yes      | —           |                            |
|                    | `start_line`         | no       | `0`         | 0-based index              |
|                    | `end_line`           | no       | end of file | 0-based, inclusive         |
| `create_text_file` | `relative_path`      | yes      | —           | Overwrites if file exists  |
|                    | `content`            | yes      | —           | Full file content          |
| `list_dir`         | `relative_path`      | yes      | —           | Use `"."` for project root |
|                    | `recursive`          | yes      | —           |                            |
|                    | `skip_ignored_files` | no       | `false`     |                            |
| `find_file`        | `file_mask`          | yes      | —           | Wildcards: `*`, `?`        |
|                    | `relative_path`      | yes      | —           | Use `"."` for project root |

All tools accept an optional `max_answer_chars` parameter (default `-1` = server default). Only adjust when output is too large and there's no way to narrow the query.

## Notes

- `create_text_file` **overwrites** if the file exists — use with care.
- `create_text_file` requires **editing mode** — switch modes first if needed (see `serena-project` skill).
- Use `relative_path` to restrict `list_dir` and `find_file` to subdirectories for faster results.
