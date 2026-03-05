---
name: serena-code-editing
description: Edit source code using Serena MCP server symbol-aware and regex-based editing tools. Use for replacing symbol bodies, inserting code before/after symbols, renaming symbols across the codebase, or doing targeted regex/literal replacements within files.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: code-editing
---

## What I do

Provide instructions for using Serena MCP server tools that modify source code: replacing content via regex or literal match, replacing full symbol bodies, inserting code around symbols, and renaming symbols codebase-wide via LSP.

## Tools in this category

| Tool | Purpose |
|------|---------|
| `replace_content` | Replace text in a file using literal string or regex (Python `re`, DOTALL+MULTILINE) |
| `replace_symbol_body` | Replace the entire definition of a symbol (function, class, method, etc.) |
| `insert_after_symbol` | Insert code immediately after the end of a symbol's definition |
| `insert_before_symbol` | Insert code immediately before the start of a symbol's definition |
| `rename_symbol` | Rename a symbol everywhere in the codebase via LSP |

## How to call with mcporter

### Replace content (literal)

```bash
npx mcporter call serena.replace_content \
  relative_path=src/config.ts \
  mode=literal \
  needle='const PORT = 3000' \
  repl='const PORT = 8080'
```

### Replace content (regex — preferred for multi-line or fuzzy matches)

```bash
# Replace a function body matched by regex (non-greedy wildcard)
npx mcporter call serena.replace_content \
  relative_path=src/server.ts \
  mode=regex \
  needle='function oldName\(.*?\)\s*\{.*?\}' \
  repl='function newName(args: string): void { console.log(args); }'

# Replace all occurrences
npx mcporter call serena.replace_content \
  relative_path=src/utils.ts \
  mode=regex \
  needle='console\.log' \
  repl='logger.info' \
  allow_multiple_occurrences=true

# Use backreferences in the replacement — syntax is $!1, $!2, etc. (NOT \1, \2)
npx mcporter call serena.replace_content \
  relative_path=src/config.ts \
  mode=regex \
  needle='(const \w+) = OLD' \
  repl='$!1 = NEW'
```

### Replace an entire symbol body

```bash
# First locate the symbol with find_symbol, then replace its body
npx mcporter call serena.replace_symbol_body \
  relative_path=src/server.ts \
  name_path=MyClass/connect \
  body='connect(host: string): Promise<void> {
  return this.pool.connect(host);
}'
```

### Insert code after a symbol

```bash
# Insert a new method after an existing one
npx mcporter call serena.insert_after_symbol \
  relative_path=src/server.ts \
  name_path=MyClass/connect \
  body='
disconnect(): void {
  this.pool.close();
}'
```

### Insert code before a symbol

```bash
# Insert an import before the first symbol in the file
npx mcporter call serena.insert_before_symbol \
  relative_path=src/server.ts \
  name_path=MyClass \
  body='import { Pool } from "pg";
'
```

### Rename a symbol across the entire codebase

```bash
npx mcporter call serena.rename_symbol \
  relative_path=src/server.ts \
  name_path=MyClass/connect \
  new_name=connectToDatabase
```

## When to use me

- You need to update a function or method body while preserving surrounding code.
- You want to rename a symbol safely without manual find-and-replace.
- You need to insert boilerplate (imports, new methods, new classes) adjacent to an existing symbol.
- You need to do a targeted regex replacement within a file without reading the whole file first.

## Notes

- **Requires an active project and the keep-alive daemon running.** mcporter spawns a fresh Serena process per call — without the daemon, activation state is lost between invocations. If the daemon is not running: verify `~/.mcporter/mcporter.json` has `"lifecycle": "keep-alive"` for the `serena` entry, then run `npx mcporter daemon start`. Use the `serena-project` skill to activate a project.
- Always use `find_symbol` (see `serena-code-intelligence` skill) to confirm a symbol's name path before editing.
- Prefer `mode=regex` with non-greedy wildcards (`.*?`) for multi-line replacements — it avoids quoting large blocks of code.
- `rename_symbol` uses LSP rename, so it is safe across all files that import the symbol.
- `replace_symbol_body` does NOT include preceding docstrings/comments — those are preserved automatically.
- `replace_symbol_body` appends a trailing newline after the replaced body. This is normal; verify with `read_file` if the exact output matters.
- Run `npx mcporter list serena` to verify your Serena MCP server is configured and reachable.
