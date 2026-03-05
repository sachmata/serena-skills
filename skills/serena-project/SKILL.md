---
name: serena-project
description: Activates Serena MCP server projects, runs onboarding, switches agent modes, and prints configuration. Use at the start of every session or when changing between editing/planning/interactive/one-shot modes.
license: MIT
compatibility: opencode
metadata:
  mcp_server: serena
  category: project
---

## Tools

| Tool                           | Purpose                                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `activate_project`             | Activate a project by name or path so all other Serena tools operate on it                                             |
| `check_onboarding_performed`   | Check whether project onboarding has been done — always call after activation                                          |
| `onboarding`                   | Perform first-time project onboarding (reads key files and stores findings as memories); at most once per conversation |
| `get_current_config`           | Print active/available projects, tools, contexts, and modes                                                            |
| `switch_modes`                 | Change agent modes (e.g. `["editing", "interactive"]`) — takes effect immediately                                      |
| `initial_instructions`         | Load the Serena Instructions Manual — call once at session start if not yet read                                       |
| `prepare_for_new_conversation` | Prepare state for a fresh conversation — only call on explicit user request                                            |

## Session startup sequence

```bash
# 1. Activate the target project (by path or registered name)
npx mcporter call serena.activate_project project=/path/to/my-project

# 2. Check onboarding status (always call after activation)
npx mcporter call serena.check_onboarding_performed

# 3. Run onboarding if not yet performed (once per conversation)
npx mcporter call serena.onboarding

# 4. Read relevant memories (see serena-memory skill)
npx mcporter call serena.list_memories
npx mcporter call serena.read_memory memory_name=architecture

# 5. Set modes for the task at hand
npx mcporter call serena.switch_modes modes='["editing", "interactive"]'
```

After onboarding completes the first time, start a **new conversation** — the context window is likely full after the initial read. Then prime with project knowledge from memories.

## How to call with mcporter

```bash
# Activate by registered name (after first activation by path)
npx mcporter call serena.activate_project project=my-app

# Check config at any time
npx mcporter call serena.get_current_config

# Switch to planning mode (read-only analysis)
npx mcporter call serena.switch_modes modes='["planning"]'

# Combine modes
npx mcporter call serena.switch_modes modes='["editing", "interactive"]'

# One-shot mode (complete task autonomously, then stop)
npx mcporter call serena.switch_modes modes='["planning", "one-shot"]'

# Prepare for new conversation (only on explicit user request)
npx mcporter call serena.prepare_for_new_conversation
```

## Available modes

Multiple modes can be active simultaneously. Switch during a session with `switch_modes`.

| Mode            | Effect                                                                            |
| --------------- | --------------------------------------------------------------------------------- |
| `editing`       | Enables write/edit tools — required for making code changes                       |
| `planning`      | Analysis, exploration, and planning without edits                                 |
| `interactive`   | Engage the user throughout; ask clarifying questions; break tasks into steps      |
| `one-shot`      | Complete a task autonomously then stop (often combined with `planning`)           |
| `no-onboarding` | Skip onboarding but keep memory tools (use when memories were created externally) |
| `no-memories`   | Disable all memory tools                                                          |

### Mode behavior notes

- **Editing mode**: Use symbolic editing tools whenever possible for precise modifications. Adhere to the project's code style and patterns. When writing new code, think about where it belongs — don't generate files you won't properly integrate.
- **Interactive mode**: Engage with the user throughout, asking for clarification when anything is unclear. Break complex tasks into smaller steps and explain thinking at each stage.
- **Planning mode**: Read-only analysis. No edit tools are available.

## mcporter state persistence

All Serena tools require an **active project**. Without the mcporter keep-alive daemon, each `npx mcporter call` spawns a fresh process and state is lost.

**With the daemon (recommended)**: activate once and state persists across all calls.

```bash
# Start daemon (config must have "lifecycle": "keep-alive" for serena)
npx mcporter daemon start

# Activate once — persists for entire session
npx mcporter call serena.activate_project project=my-project
```

**Without the daemon**: each call is isolated. Multi-step workflows that depend on activation state will fail. Use the daemon for any real work.

First-time project activation by path auto-registers the project in `~/.serena/serena_config.yml`; subsequent activations can use the registered name.

> **Default:** Serena activates `interactive` + `editing` by default. When you pass `--mode` flags at startup, **only** the explicitly listed modes are active — include `interactive` and `editing` if you want them to stay on.
>
> **Base vs default modes:** Modes set as _base modes_ in config always remain active regardless of CLI overrides. _Default modes_ can be overridden from the command line or via `switch_modes`.

## Contexts

A context defines the environment Serena is operating in. It is **set at startup** (CLI `--context <name>`) and **cannot be changed** during a session. It determines the initial system prompt and the available toolset.

| Context           | Description                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `desktop-app`     | **Default.** Full toolset for desktop apps like Claude Desktop.                                                                |
| `ide`             | For IDE assistants (VS Code / Cursor / Cline). Assumes the IDE already handles basic file I/O and shell — single-project mode. |
| `claude-code`     | For Claude Code. Disables tools duplicating Claude Code's built-in capabilities — single-project mode.                         |
| `codex`           | Optimized for OpenAI Codex.                                                                                                    |
| `agent`           | For autonomous agents (e.g. Agno).                                                                                             |
| `oaicompat-agent` | Like `agent` but uses OpenAI-compatible tool descriptions (use with local servers like Llama.cpp).                             |

> **Single-project contexts (`ide`, `claude-code`):** If a project is provided at startup, the toolset is trimmed to only what that project needs. The `activate_project` tool is disabled because switching projects is irrelevant in this mode.

## When to use

- Starting a new work session on a project.
- Switching between different projects within a session.
- Changing agent behavior (from planning to editing, or interactive to one-shot).
- Debugging why Serena tools are not working (check config first).
- First time working with a new project (onboarding).

## Notes

- Always activate a project before using file, symbol, or search tools — they need an active project context.
- `onboarding` requires an active project and should be called **at most once per conversation**.
- Run `npx mcporter list serena` to verify your Serena MCP server is configured and reachable.
