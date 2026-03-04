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
| `serena_activate_project` | Activate a project by name or path so all other Serena tools operate on it |
| `serena_check_onboarding_performed` | Check whether project onboarding has been done |
| `serena_onboarding` | Perform project onboarding (called at most once per conversation) |
| `serena_get_current_config` | Print the current Serena configuration: active project, tools, modes, contexts |
| `serena_switch_modes` | Switch agent modes (e.g. `editing`, `planning`, `interactive`, `one-shot`) |
| `serena_initial_instructions` | Load the Serena Instructions Manual (call once at start if not yet read) |
| `serena_prepare_for_new_conversation` | Reset/prepare state before starting a fresh conversation |

## How to call with mcporter

### Check current configuration

```bash
npx mcporter call serena.serena_get_current_config
```

### Activate a project

```bash
# Activate by registered project name
npx mcporter call serena.serena_activate_project project=my-app

# Activate by path
npx mcporter call serena.serena_activate_project project=/home/user/projects/my-app
```

### Check and perform onboarding

```bash
# Always check first — onboarding should only be done once per conversation
npx mcporter call serena.serena_check_onboarding_performed

# If onboarding has NOT been performed, run it
npx mcporter call serena.serena_onboarding
```

### Switch agent modes

```bash
# Switch to editing mode (for making code changes)
npx mcporter call serena.serena_switch_modes modes='["editing"]'

# Switch to planning mode (for analysis without edits)
npx mcporter call serena.serena_switch_modes modes='["planning"]'

# Combine modes
npx mcporter call serena.serena_switch_modes modes='["editing", "interactive"]'

# One-shot mode (complete task and stop)
npx mcporter call serena.serena_switch_modes modes='["planning", "one-shot"]'
```

### Load Serena instructions manual

```bash
# Call once at the beginning of a session if you haven't read it
npx mcporter call serena.serena_initial_instructions
```

### Prepare for a new conversation

```bash
# Reset Serena state for a fresh start (only call on explicit user request)
npx mcporter call serena.serena_prepare_for_new_conversation
```

## Recommended session startup sequence

When starting a new work session on a project:

```bash
# 1. Check what's currently active
npx mcporter call serena.serena_get_current_config

# 2. Activate the target project (if not already active)
npx mcporter call serena.serena_activate_project project=my-project

# 3. Check if onboarding is needed
npx mcporter call serena.serena_check_onboarding_performed

# 4. Run onboarding if needed (only once per conversation)
#    (skip if onboarding already performed)
npx mcporter call serena.serena_onboarding

# 5. Set the appropriate mode for your task
npx mcporter call serena.serena_switch_modes modes='["editing"]'
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

- Always activate a project before using file, symbol, or search tools — they need an active project context.
- `serena_onboarding` should be called **at most once per conversation**.
- Run `npx mcporter list serena` to verify your Serena MCP server is configured and reachable.
