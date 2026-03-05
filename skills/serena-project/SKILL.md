---
name: serena-project
description: Manage Serena MCP server project lifecycle and agent configuration. Use for activating projects, performing onboarding, switching agent modes, getting current config, and preparing for new conversations.
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

**mcporter spawns a fresh Serena process for every call.** No in-memory state (active project, modes, onboarding status) persists between separate `npx mcporter call` invocations.

Practical consequences:

- **Always call `activate_project` first** in every call chain — the active project is reset each time.
- `onboarding` requires an active project; if you call it without activating first, it will fail.
- Projects must be registered in `~/.serena/serena_config.yml` before they can be activated by name. Activate by full path the first time to register, then by name thereafter.

```bash
# First time (registers the project path):
npx mcporter call serena.activate_project project=/home/user/projects/my-app

# Subsequent calls (activate by registered name):
npx mcporter call serena.activate_project project=my-app
```

## Recommended session startup sequence

Because mcporter is stateless between calls, repeat this at the start of every call chain:

```bash
# 1. Activate the target project (required every time — state does not persist)
npx mcporter call serena.activate_project project=my-project

# 2. Check if onboarding is needed (requires active project)
npx mcporter call serena.check_onboarding_performed

# 3. Run onboarding if needed (only once per conversation)
#    (skip if onboarding already performed)
npx mcporter call serena.onboarding

# 4. Set the appropriate mode for your task
npx mcporter call serena.switch_modes modes='["editing"]'
```

To inspect current state after activation:

```bash
npx mcporter call serena.get_current_config
```

## Available modes

| Mode | When to use |
|------|------------|
| `editing` | Making code changes — enables write tools |
| `planning` | Analysis, exploration, planning without edits |
| `interactive` | Back-and-forth with the user, asks clarifying questions |
| `one-shot` | Complete a task autonomously then stop |

## When to use me

- Starting a new work session on a project.
- Switching between different projects within a session.
- Changing agent behavior (from planning to editing, or interactive to one-shot).
- Debugging why Serena tools are not working (check config first).
- First time working with a new project (onboarding).

## Notes

- **mcporter spawns a fresh process per call** — active project, modes, and onboarding state are lost between invocations. Always call `activate_project` at the start of each call chain.
- Always activate a project before using file, symbol, or search tools — they need an active project context.
- `onboarding` requires an active project and should be called **at most once per conversation**.
- Activate by full path the first time to register a project in `~/.serena/serena_config.yml`; activate by name on all subsequent calls.
- Run `npx mcporter list serena` to verify your Serena MCP server is configured and reachable.
