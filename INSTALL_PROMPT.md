# Serena Skills — Agent Install Prompt

Copy and paste the block below into any OpenCode (or compatible) agent session to prime it with all Serena skills and start a properly initialized work session.

---

## Prompt

```
You have access to a Serena MCP server. Before starting any work, load and follow all seven Serena skills in this order:

1. skill({ name: "serena-project" })
   — Read and follow it fully. Then:
     a. Call serena_get_current_config to see what is active.
     b. Call serena_check_onboarding_performed.
     c. If onboarding has NOT been performed, call serena_onboarding (at most once this conversation).
     d. Call serena_switch_modes with modes: ["editing", "interactive"] unless I specify otherwise.

2. skill({ name: "serena-file-io" })
   — Load so you know how to read, write, list, and find files via Serena.

3. skill({ name: "serena-code-intelligence" })
   — Load so you know how to navigate symbols, find definitions, and discover references.

4. skill({ name: "serena-code-editing" })
   — Load so you know how to replace, insert, and rename code at the symbol level.

5. skill({ name: "serena-search" })
   — Load so you know how to search the codebase with regex and glob filters.

6. skill({ name: "serena-shell" })
   — Load so you know how to execute shell commands (builds, tests, linters) through Serena.

7. skill({ name: "serena-memory" })
   — Load so you know how to read and write persistent memories. Then:
     a. Call serena_list_memories to surface any existing project context.
     b. Read any memories whose names suggest they are relevant to the current task.

Once all skills are loaded and the session is initialized, confirm which project is active and briefly summarize any relevant memories you found. Then wait for my first task.
```

---

## Minimal prompt (skills only, no auto-initialization)

If you just want the agent to have the skills available without running any Serena setup commands upfront:

```
Before we begin, load all Serena skills:
skill("serena-project")
skill("serena-file-io")
skill("serena-code-intelligence")
skill("serena-code-editing")
skill("serena-search")
skill("serena-shell")
skill("serena-memory")

Use these skills whenever you need to interact with the Serena MCP server tools during our session.
```

---

## Per-task prompts

Use these to load only the relevant skill for a specific task:

| Task | Prompt |
|------|--------|
| Start a new project session | `Load skill("serena-project") and initialize the session for project at <path>.` |
| Read or explore files | `Load skill("serena-file-io") and <your task>.` |
| Find a class or function | `Load skill("serena-code-intelligence") and find the definition of <symbol>.` |
| Edit or refactor code | `Load skill("serena-code-editing") and <your task>.` |
| Search the codebase | `Load skill("serena-search") and find all occurrences of <pattern>.` |
| Run build / tests | `Load skill("serena-shell") and run the test suite.` |
| Save or recall context | `Load skill("serena-memory") and save a note about <topic>.` |
