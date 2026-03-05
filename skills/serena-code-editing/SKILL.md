---
name: serena-code-editing
description: Edits source code via Serena MCP server using symbol-aware and regex-based tools. Use for replacing symbol bodies, inserting code before/after symbols, renaming symbols across the codebase, or doing targeted regex/literal replacements within files.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: code-editing
---

## Tools

| Tool                   | Purpose                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `replace_content`      | Replace text in a file via literal string or regex (Python `re`, DOTALL + MULTILINE) |
| `replace_symbol_body`  | Replace the entire definition of a symbol                                            |
| `insert_after_symbol`  | Insert code immediately after a symbol's definition                                  |
| `insert_before_symbol` | Insert code immediately before a symbol's definition                                 |
| `rename_symbol`        | Rename a symbol everywhere in the codebase via LSP                                   |

## Choosing an editing approach

Serena provides two approaches. Choose based on the scope of the change:

### Symbolic editing — for replacing/adding whole symbols

Use when you need to replace an entire function, method, class, or other symbol, or insert new ones adjacent to existing symbols.

1. Use `find_symbol` (see `serena-code-intelligence` skill) to locate and confirm the symbol's `name_path`
2. Use `replace_symbol_body` to replace its definition, or `insert_after_symbol` / `insert_before_symbol` to add adjacent code
3. Use `find_referencing_symbols` to verify backward compatibility — if the change breaks callers, update all references
4. Use `rename_symbol` for safe codebase-wide renames via LSP

### File-based editing — for targeted line-level changes

Use when you need to change just a few lines within a larger symbol, or do search-and-replace across a file.

`replace_content` with `mode=regex` is the primary tool. **Use non-greedy wildcards** to avoid quoting large blocks of code:

```
needle: "beginning-text.*?end-of-text-to-be-replaced"
```

This matches everything between the delimiters without specifying the full original text. If the regex accidentally matches multiple occurrences and `allow_multiple_occurrences=false`, an error is returned — you can safely retry with a more specific pattern.

## How to call with mcporter

### Replace content (regex — preferred for most edits)

```bash
# Replace a few lines using wildcard to avoid quoting the full block
npx mcporter call serena.replace_content \
  relative_path=src/config.ts \
  mode=regex \
  needle='const PORT.*?;' \
  repl='const PORT = 8080;'

# Replace all occurrences
npx mcporter call serena.replace_content \
  relative_path=src/utils.ts \
  mode=regex \
  needle='console\.log' \
  repl='logger.info' \
  allow_multiple_occurrences=true

# Use backreferences — syntax is $!1, $!2 (NOT \1, \2)
npx mcporter call serena.replace_content \
  relative_path=src/config.ts \
  mode=regex \
  needle='(const \w+) = OLD' \
  repl='$!1 = NEW'
```

### Replace content (literal)

```bash
npx mcporter call serena.replace_content \
  relative_path=src/config.ts \
  mode=literal \
  needle='const PORT = 3000' \
  repl='const PORT = 8080'
```

### Replace a symbol body

```bash
# First locate the symbol, then replace its entire definition
npx mcporter call serena.replace_symbol_body \
  relative_path=src/server.ts \
  name_path=MyClass/connect \
  body='connect(host: string): Promise<void> {
  return this.pool.connect(host);
}'
```

### Insert code after / before a symbol

```bash
# Insert a new method after an existing one
npx mcporter call serena.insert_after_symbol \
  relative_path=src/server.ts \
  name_path=MyClass/connect \
  body='
disconnect(): void {
  this.pool.close();
}'

# Insert an import before the first symbol in the file
npx mcporter call serena.insert_before_symbol \
  relative_path=src/server.ts \
  name_path=MyClass \
  body='import { Pool } from "pg";
'
```

### Rename a symbol codebase-wide

```bash
npx mcporter call serena.rename_symbol \
  relative_path=src/server.ts \
  name_path=MyClass/connect \
  new_name=connectToDatabase
```

## Parameter reference

| Tool                   | Parameter                    | Required | Default | Notes                                                                                          |
| ---------------------- | ---------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------- |
| `replace_content`      | `relative_path`              | yes      | —       |                                                                                                |
|                        | `needle`                     | yes      | —       | Literal string or regex pattern                                                                |
|                        | `repl`                       | yes      | —       | Replacement; use `$!1`, `$!2` for regex backreferences                                         |
|                        | `mode`                       | yes      | —       | `"literal"` or `"regex"` (Python `re`, DOTALL + MULTILINE)                                     |
|                        | `allow_multiple_occurrences` | no       | `false` | Error if multiple matches and `false`                                                          |
| `replace_symbol_body`  | `name_path`                  | yes      | —       | Same matching as `find_symbol`                                                                 |
|                        | `relative_path`              | yes      | —       |                                                                                                |
|                        | `body`                       | yes      | —       | New definition including signature; does **not** include preceding docstrings/comments/imports |
| `insert_after_symbol`  | `name_path`                  | yes      | —       |                                                                                                |
|                        | `relative_path`              | yes      | —       |                                                                                                |
|                        | `body`                       | yes      | —       | Inserted starting on the next line after the symbol                                            |
| `insert_before_symbol` | `name_path`                  | yes      | —       |                                                                                                |
|                        | `relative_path`              | yes      | —       |                                                                                                |
|                        | `body`                       | yes      | —       | Inserted before the symbol's definition line                                                   |
| `rename_symbol`        | `name_path`                  | yes      | —       | For overloaded methods (Java), include the signature                                           |
|                        | `relative_path`              | yes      | —       |                                                                                                |
|                        | `new_name`                   | yes      | —       | New symbol name                                                                                |

## Key guidelines from Serena

- **Backward compatibility**: When editing a symbol, ensure the change is backward-compatible or find and update all references with `find_referencing_symbols`.
- **Regex wildcards**: Always try to use `.*?` wildcards to avoid specifying the full original text. For multi-line spans, DOTALL is enabled so `.` matches newlines.
- **No verification needed**: Symbol editing tools are reliable — you never need to verify the result if the tool returns without error. Similarly, regex replacements are safe because mismatches cause an error rather than a wrong edit.
- **`replace_symbol_body`**: The body is the symbol's definition including its signature line. It does **not** include preceding docstrings, comments, or imports — those are preserved automatically.
- **Inserting at file boundaries**: Use `insert_after_symbol` with the last top-level symbol to append at end of file; use `insert_before_symbol` with the first top-level symbol to prepend.
- **Indentation**: `insert_after_symbol` and `insert_before_symbol` insert the `body` text verbatim — they do **not** auto-indent to match the surrounding context. Include appropriate leading whitespace in the `body` string (e.g. `body='  newMethod() { ... }'` for two-space indented code). Check the file's existing indentation style first.
- **LSP indexing delay**: Newly created files (via `create_text_file`) may take 1–2 seconds to be indexed by the language server. If symbol-aware tools (`insert_after_symbol`, `rename_symbol`, etc.) fail on a just-created file, wait briefly and retry.

## Notes

- Requires an active project in editing mode (`serena-project` skill).
- Always use Serena's editing tools instead of the agent's built-in string replace or file rewrite — Serena validates edits and supports LSP-aware operations.
- Always use `find_symbol` to confirm a symbol's `name_path` and `relative_path` before editing.
- `rename_symbol` uses LSP rename — safe across all files that reference the symbol.
