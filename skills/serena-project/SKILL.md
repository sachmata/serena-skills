---
name: serena-project
description: Manage Serena MCP server project lifecycle and agent configuration. Use for activating projects, performing onboarding, switching agent modes (editing/planning/interactive/one-shot/no-memories/etc.), getting current config, and preparing for new conversations. Contexts (desktop-app, ide, claude-code, agent, codex) are set at startup and determine the available toolset.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: project
---

## What I do

Provide instructions for using Serena MCP server tools that manage project activation, onboarding, agent modes, and configuration. These are typically the first tools to call at the start of a work session on a new project.

## Tools in this category

| Tool | Purpose |
|------|---------|
| `activate_project` | Activate a project by name or path so all other Serena tools operate on it |
| `check_onboarding_performed` | Check whether project onboarding has been done |
| `onboarding` | Perform project onboarding (called at most once per conversation) |
| `get_current_config` | Print the current Serena configuration: active project, tools, modes, contexts |
| `switch_modes` | Switch agent modes (e.g. `editing`, `planning`, `interactive`, `one-shot`) |
| `initial_instructions` | Load the Serena Instructions Manual (call once at start if not yet read) |
| `prepare_for_new_conversation` | Reset/prepare state before starting a fresh conversation |

## How to call with mcporter

### Check current configuration

```bash
npx mcporter call serena.get_current_config
```

### Activate a project

```bash
# Activate by registered project name
npx mcporter call serena.activate_project project=my-app

# Activate by path
npx mcporter call serena.activate_project project=/home/user/projects/my-app
```

### Check and perform onboarding

```bash
# Always check first — onboarding should only be done once per conversation
npx mcporter call serena.check_onboarding_performed

# If onboarding has NOT been performed, run it
npx mcporter call serena.onboarding
```

### Switch agent modes

```bash
# Switch to editing mode (for making code changes)
npx mcporter call serena.switch_modes modes='["editing"]'

# Switch to planning mode (for analysis without edits)
npx mcporter call serena.switch_modes modes='["planning"]'

# Combine modes
npx mcporter call serena.switch_modes modes='["editing", "interactive"]'

# One-shot mode (complete task and stop)
npx mcporter call serena.switch_modes modes='["planning", "one-shot"]'
```

### Load Serena instructions manual

```bash
# Call once at the beginning of a session if you haven't read it
npx mcporter call serena.initial_instructions
```

### Prepare for a new conversation

```bash
# Reset Serena state for a fresh start (only call on explicit user request)
npx mcporter call serena.prepare_for_new_conversation
```

## mcporter process model — important

**Without the keep-alive daemon**, mcporter spawns a fresh Serena process for every call and no in-memory state (active project, modes, onboarding status) persists between separate `npx mcporter call` invocations.

Practical consequences (no-daemon mode only):

- **Always call `activate_project` first** in every call chain — the active project is reset each time.
- `onboarding` requires an active project; if you call it without activating first, it will fail.
- Projects must be registered in `~/.serena/serena_config.yml` before they can be activated by name. Activate by full path the first time to register, then by name thereafter.

**With the keep-alive daemon running (Option A, recommended)**, state persists across all calls in a session — you only need to `activate_project` once and subsequent calls retain the active project, modes, and onboarding status.

```bash
# First time (registers the project path):
npx mcporter call serena.activate_project project=/home/user/projects/my-app

# Subsequent calls (activate by registered name):
npx mcporter call serena.activate_project project=my-app
```

### Option A — keep-alive daemon (recommended)

mcporter supports a **keep-alive daemon** that holds the Serena process warm between calls. With this enabled, project activation and other state persist across separate `mcporter call` invocations.

Add `"lifecycle": "keep-alive"` to your Serena entry in `~/.mcporter/mcporter.json`:

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx --from git+https://github.com/oraios/serena serena start-mcp-server",
      "lifecycle": "keep-alive"
    }
  },
  "imports": []
}
```

> **Important:** The `command` must be the full command as a **single string** — do not split it into `command` + `args`. The `"imports": []` field is also required.

Then start the daemon (stop first if already running to pick up config changes):

```bash
npx mcporter daemon stop 2>/dev/null
npx mcporter daemon start

# Check status
npx mcporter daemon status

# Stop when done
npx mcporter daemon stop
```

With the daemon running, activate once and all subsequent calls reuse the same process:

```bash
npx mcporter call serena.activate_project project=my-project
# State persists — onboarding, modes, and active project are all retained
npx mcporter call serena.check_onboarding_performed
```

Alternatively, set the env var without editing config:

```bash
MCPORTER_KEEPALIVE=serena npx mcporter daemon start
```

### Option B — shell chaining (no daemon)

> **Warning:** `&&`-chaining `npx mcporter call` commands does **not** persist state. Each invocation spawns a completely fresh Serena process, so the project activated in call 1 is gone by call 2. The following example will fail at `check_onboarding_performed` because the new process has no active project:

```bash
# ❌ This does NOT work — each call is a fresh process
npx mcporter call serena.activate_project project=my-project && \
npx mcporter call serena.check_onboarding_performed
```

For any multi-step workflow that depends on activation state, use the **keep-alive daemon (Option A)**. Shell chaining is only useful for fire-and-forget single-tool calls where no prior state is needed.

## Recommended session startup sequence

With the keep-alive daemon running (Option A), activate once per session:

```bash
# 1. Activate the target project
npx mcporter call serena.activate_project project=my-project

# 2. Check if onboarding is needed (requires active project)
npx mcporter call serena.check_onboarding_performed

# 3. Run onboarding if needed (only once per conversation)
npx mcporter call serena.onboarding

# 4. Set the appropriate mode for your task
npx mcporter call serena.switch_modes modes='["editing"]'
```

Without the daemon, state-dependent sequences like the above cannot be done with separate `mcporter call` invocations — use the daemon.

To inspect current state after activation:

```bash
npx mcporter call serena.get_current_config
```

## Available modes

Multiple modes can be active simultaneously. Switch them during a session with `switch_modes`; they take effect immediately.

| Mode | When to use |
|------|------------|
| `editing` | Making code changes — enables write tools |
| `planning` | Analysis, exploration, planning without edits |
| `interactive` | Back-and-forth with the user, asks clarifying questions |
| `one-shot` | Complete a task autonomously then stop (often combined with `planning`) |
| `no-onboarding` | Skip onboarding but keep memory tools (use when memories were created externally) |
| `onboarding` | Focus on project onboarding process |
| `no-memories` | Disable all memory tools and onboarding tools |

> **Default:** Serena activates `interactive` + `editing` by default. When you pass `--mode` flags at startup, **only** the explicitly listed modes are active — include `interactive` and `editing` if you want them to stay on.
>
> **Base vs default modes:** Modes set as *base modes* in config always remain active regardless of CLI overrides. *Default modes* can be overridden from the command line or via `switch_modes`.

### Switch modes during a session

```bash
# Add no-memories to current defaults (must re-specify all desired modes)
npx mcporter call serena.switch_modes modes='["editing", "interactive", "no-memories"]'

# Switch entirely to planning + one-shot (e.g. for a report)
npx mcporter call serena.switch_modes modes='["planning", "one-shot"]'

# Return to standard interactive editing
npx mcporter call serena.switch_modes modes='["editing", "interactive"]'
```

## Contexts

A context defines the environment Serena is operating in. It is **set at startup** (CLI `--context <name>`) and **cannot be changed** during a session. It determines the initial system prompt and the available toolset.

| Context | Description |
|---------|-------------|
| `desktop-app` | **Default.** Full toolset for desktop apps like Claude Desktop. |
| `ide` | For IDE assistants (VS Code / Cursor / Cline). Assumes the IDE already handles basic file I/O and shell — single-project mode. |
| `claude-code` | For Claude Code. Disables tools duplicating Claude Code's built-in capabilities — single-project mode. |
| `codex` | Optimized for OpenAI Codex. |
| `agent` | For autonomous agents (e.g. Agno). |
| `oaicompat-agent` | Like `agent` but uses OpenAI-compatible tool descriptions (use with local servers like Llama.cpp). |

> **Single-project contexts (`ide`, `claude-code`):** If a project is provided at startup, the toolset is trimmed to only what that project needs. The `activate_project` tool is disabled because switching projects is irrelevant in this mode.

## When to use me

- Starting a new work session on a project.
- Switching between different projects within a session.
- Changing agent behavior (from planning to editing, or interactive to one-shot).
- Debugging why Serena tools are not working (check config first).
- First time working with a new project (onboarding).

## Notes

- **mcporter spawns a fresh process per call** — active project, modes, and onboarding state are lost between invocations unless the keep-alive daemon is running. If the daemon is not running: verify `~/.mcporter/mcporter.json` has `"lifecycle": "keep-alive"` for the `serena` entry (see Option A above for the correct config format), then run `npx mcporter daemon start`. `&&`-chaining separate `mcporter call` commands does NOT preserve state between them.
- Always activate a project before using file, symbol, or search tools — they need an active project context.
- `onboarding` requires an active project and should be called **at most once per conversation**.
- Activate by full path the first time to register a project in `~/.serena/serena_config.yml`; activate by name on all subsequent calls.
- Run `npx mcporter list serena` to verify your Serena MCP server is configured and reachable.
