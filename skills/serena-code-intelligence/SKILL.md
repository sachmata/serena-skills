---
name: serena-code-intelligence
description: Navigates and understands code symbols via Serena MCP server LSP-backed tools. Use for getting file symbol overviews, finding class/function/method definitions by name path, and discovering all references to a symbol across the codebase. Prefer over raw file reads for code exploration.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: code-intelligence
---

## Tools

| Tool                       | Purpose                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `get_symbols_overview`     | High-level overview of all symbols in a file, grouped by kind           |
| `find_symbol`              | Find symbols by name path pattern; optionally include body or info      |
| `find_referencing_symbols` | Find all references to a symbol across the codebase, with code snippets |

## Recommended reading strategy

Use a progressive, resource-efficient approach — avoid reading entire files:

1. **Explore structure**: `get_symbols_overview` on a file to see all top-level symbols
2. **Drill into a class**: `find_symbol` with `depth=1` and `include_body=false` to list its methods
3. **Read specific symbols**: `find_symbol` with `include_body=true` only for the methods you need
4. **Trace references**: `find_referencing_symbols` to find all call sites before refactoring

Once you have read a full file with `read_file`, there is no need to analyze it again with symbolic tools — you already have the information.

## Name path syntax

Symbols are identified by a **name path** — a `/`-separated path in the symbol tree _within a source file_:

| Pattern               | Matches                                                  |
| --------------------- | -------------------------------------------------------- |
| `myFunction`          | Any symbol named `myFunction`                            |
| `MyClass/myMethod`    | `myMethod` inside `MyClass` (relative path suffix)       |
| `/MyClass/myMethod`   | Exact full name path within the file (absolute)          |
| `MyClass/myMethod[1]` | Second overload (0-based index, for languages like Java) |

With `substring_matching=true`, `Foo/get` matches `Foo/getValue`, `Foo/getData`, etc.

## How to call with mcporter

### Get symbols overview

```bash
# Top-level symbols only (default depth=0)
npx mcporter call serena.get_symbols_overview relative_path=src/server.ts

# Include immediate children (e.g. class methods)
npx mcporter call serena.get_symbols_overview relative_path=src/server.ts depth=1
```

### Find a symbol

```bash
# Find by name anywhere in the codebase
npx mcporter call serena.find_symbol name_path_pattern=connect

# Find method inside a class, restricted to one file
npx mcporter call serena.find_symbol \
  name_path_pattern=MyClass/connect \
  relative_path=src/server.ts

# Read the full body of a known symbol
npx mcporter call serena.find_symbol \
  name_path_pattern=Foo/__init__ \
  relative_path=src/foo.py \
  include_body=true

# List all methods of a class without bodies
npx mcporter call serena.find_symbol \
  name_path_pattern=MyClass \
  relative_path=src/server.ts \
  depth=1 \
  include_body=false

# Substring match (finds "connect", "connectToServer", "connectDB", etc.)
npx mcporter call serena.find_symbol \
  name_path_pattern=connect \
  substring_matching=true

# Include hover/docstring info (without full body; slower for C/C++)
npx mcporter call serena.find_symbol \
  name_path_pattern=MyClass \
  relative_path=src/server.ts \
  include_info=true
```

### Find all references to a symbol

```bash
# Find everything that references "connect" in server.ts
npx mcporter call serena.find_referencing_symbols \
  name_path=connect \
  relative_path=src/server.ts
```

Returns metadata about each referencing symbol plus a short code snippet around the reference.

## Parameter reference

| Tool                       | Parameter                         | Required | Default               | Notes                                                 |
| -------------------------- | --------------------------------- | -------- | --------------------- | ----------------------------------------------------- |
| `get_symbols_overview`     | `relative_path`                   | yes      | —                     | Must be a **file**, not a directory                   |
|                            | `depth`                           | no       | `0`                   | 1 = include immediate children                        |
| `find_symbol`              | `name_path_pattern`               | yes      | —                     | See name path syntax above                            |
|                            | `relative_path`                   | no       | `""` (whole codebase) | Restrict to file or directory for speed               |
|                            | `depth`                           | no       | `0`                   | Retrieve descendants                                  |
|                            | `include_body`                    | no       | `false`               | Include source code — use judiciously                 |
|                            | `include_info`                    | no       | `false`               | Hover/docstring info (ignored if `include_body=true`) |
|                            | `substring_matching`              | no       | `false`               | Match last path element as substring                  |
|                            | `include_kinds` / `exclude_kinds` | no       | `[]`                  | Filter by LSP SymbolKind integers                     |
| `find_referencing_symbols` | `name_path`                       | yes      | —                     | Same logic as `find_symbol`                           |
|                            | `relative_path`                   | yes      | —                     | Must be a **file** (not directory)                    |
|                            | `include_kinds` / `exclude_kinds` | no       | `[]`                  | Filter referencing symbol kinds                       |

## Notes

- Requires an active project (`serena-project` skill) and the mcporter keep-alive daemon.
- Always prefer symbolic tools over raw grep or `read_file` when looking for specific code symbols.
- Use `relative_path` to restrict searches to a file or directory — significantly speeds up lookup and reduces output.
- `include_info` can be slow for C/C++. Info is never included for child symbols.
