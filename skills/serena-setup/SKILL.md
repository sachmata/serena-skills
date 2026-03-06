````skill
---
name: serena-setup
description: Zero-config session setup for Serena MCP tools. The `sr` wrapper lazily registers Serena with mcporter and starts the keep-alive daemon — just add it to PATH.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: setup
---

## Session bootstrap

Add the repo to PATH once at the start of every session (or permanently in your shell rc):

```bash
export PATH="$PATH:$HOME/serena-skills"
```

That's it. The first `sr` call automatically:

1. Registers Serena in `~/.mcporter/mcporter.json` (creates or merges).
2. Starts the mcporter keep-alive daemon if not already running.
3. Forwards the tool call.

## The `sr` shorthand

All Serena skills use `sr <tool> [key=value …]` instead of `npx mcporter call serena.<tool>`. The script lives at the repo root and handles lazy init:

- **No config?** Creates `~/.mcporter/mcporter.json` with the Serena entry.
- **Config exists but missing Serena?** Merges it in (via `node`).
- **No daemon socket?** Runs `npx mcporter daemon start`.
- **Everything ready?** Two lightweight filesystem checks, zero extra processes.

If `sr` is not on PATH, use the full form: `npx mcporter call serena.<tool> [key=value …]`.

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

```bash
sr activate_project project=/path/to/my-project   # first time (registers in ~/.serena/serena_config.yml)
sr activate_project project=my-project             # subsequent times (by registered name)
```

See the `serena-project` skill for the full session startup sequence.

## Verify Serena is reachable

```bash
npx mcporter list serena 2>&1 | grep -c 'function'   # should print ~25
```

````
