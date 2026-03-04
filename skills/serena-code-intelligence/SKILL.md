---
name: serena-code-intelligence
description: Navigate and understand code symbols using Serena MCP server LSP-backed tools. Use for getting symbol overviews, finding class/function definitions, and discovering all references to a symbol across the codebase.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: code-intelligence
---

## What I do

Provide instructions for using Serena MCP server tools that leverage LSP (Language Server Protocol) to understand code structure: symbol overviews, symbol lookup by name path, and finding all references to a symbol.

## Tools in this category

| Tool | Purpose |
|------|---------|
| `serena_get_symbols_overview` | High-level overview of all symbols in a file (classes, functions, variables, etc.) |
| `serena_find_symbol` | Find symbols by name path pattern; optionally include body or hover info |
| `serena_find_referencing_symbols` | Find all references to a given symbol across the codebase |

## Name path syntax

Serena uses a **name path** to identify symbols within a file:

- Simple name: `myFunction` — matches any symbol with that name
- Relative path: `MyClass/myMethod` — matches method inside class
- Absolute path: `/MyClass/myMethod` — exact match within file
- Overloaded: `MyClass/myMethod[1]` — second overload (0-based index)

## How to call with mcporter

### Get symbols overview of a file

```bash
# Flat overview (top-level symbols only)
npx mcporter call serena.serena_get_symbols_overview relative_path=src/index.ts

# Include immediate children (depth=1)
npx mcporter call serena.serena_get_symbols_overview relative_path=src/index.ts depth=1
```

### Find a symbol by name

```bash
# Find any symbol named "connect" anywhere in the codebase
npx mcporter call serena.serena_find_symbol name_path_pattern=connect

# Find a method inside a specific class
npx mcporter call serena.serena_find_symbol name_path_pattern=MyClass/connect

# Restrict search to a specific file, include its body
npx mcporter call serena.serena_find_symbol \
  name_path_pattern=connect \
  relative_path=src/server.ts \
  include_body=true

# Substring match (finds "connect", "connectToServer", "connectDB", etc.)
npx mcporter call serena.serena_find_symbol \
  name_path_pattern=connect \
  substring_matching=true

# Include children (e.g. methods of a class, depth=1)
npx mcporter call serena.serena_find_symbol \
  name_path_pattern=MyClass \
  relative_path=src/server.ts \
  depth=1
```

### Find all references to a symbol

```bash
# Find everything that references the "connect" function in server.ts
npx mcporter call serena.serena_find_referencing_symbols \
  name_path=connect \
  relative_path=src/server.ts
```

## When to use me

- You want to understand the structure of an unfamiliar file before editing it.
- You need to locate a class, function, or method definition quickly.
- You want to find all call sites before renaming or refactoring a symbol.
- You need to understand the inheritance or composition structure of a codebase.

## Notes

- Always prefer this over raw grep or file reads when looking for specific symbols — it is faster and structurally aware.
- Use `include_body=true` only when you need the full source; omit it to reduce output size.
- Run `npx mcporter list serena` to verify your Serena MCP server is configured and reachable.
