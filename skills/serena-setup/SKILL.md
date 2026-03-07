---
name: serena-setup
description: Zero-config session setup for Serena MCP tools. The `sr` OpenCode custom tool lazily registers Serena with mcporter and starts the keep-alive daemon — just install the tool and start calling it.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: setup
---

## Session bootstrap

The `sr` custom tool handles all setup automatically. On first call it:

1. Registers Serena in `~/.mcporter/mcporter.json` (creates or merges).
2. Starts the mcporter keep-alive daemon if not already running.
3. Forwards the tool call.

No manual configuration or PATH setup is needed — just have the `sr` custom tool installed in `~/.config/opencode/tools/sr.ts` (or `.opencode/tools/sr.ts` for project-local).

## The `sr` custom tool

`sr` is an [OpenCode custom tool](https://opencode.ai/docs/custom-tools/) with two parameters:

| Parameter | Type   | Description                                                             |
| --------- | ------ | ----------------------------------------------------------------------- |
| `tool`    | string | Serena tool name (e.g. `activate_project`, `find_symbol`, `read_file`) |
| `args`    | string | JSON object of arguments for the tool (e.g. `{"relative_path": "src/index.ts", "include_body": false}`). Booleans and integers must not be quoted. Omit or pass `{}` when the tool takes no arguments. |

All Serena skills use `sr` to call Serena tools. Example:

```
sr(tool="activate_project", args='{"project": "/path/to/my-project"}')
sr(tool="find_symbol", args='{"name_path_pattern": "MyClass", "relative_path": "src/server.ts", "include_body": true}')
sr(tool="get_current_config")
```

### What it does under the hood

- **No config?** Creates `~/.mcporter/mcporter.json` with the Serena entry.
- **Config exists but missing Serena?** Merges it in.
- **No daemon socket?** Starts `npx mcporter daemon start`.
- **Everything ready?** Two lightweight filesystem checks, zero extra processes.

## mcporter keep-alive daemon

The daemon is started automatically by `sr`. To manage it manually:

```bash
npx mcporter daemon status       # check if running
npx mcporter daemon start        # start (idempotent)
npx mcporter daemon stop         # stop when done for the day
```

Without the daemon each call spawns a fresh Serena process — activation state is lost between calls and multi-step workflows will fail.

## Active-project prerequisite

All Serena file, symbol, search, editing, memory (project-scoped), and shell tools require an **active project**. Activate one with:

```
sr(tool="activate_project", args='{"project": "/path/to/my-project"}')
sr(tool="activate_project", args='{"project": "my-project"}')
```

See the `serena-project` skill for the full session startup sequence.

## Verify Serena is reachable

```bash
npx mcporter list serena 2>&1 | grep -c 'function'   # should print ~25
```
