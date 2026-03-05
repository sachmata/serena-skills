# serena-skills

OpenCode agent skills for [Serena MCP server](https://github.com/oraios/serena) — covering every tool category with on-demand instructions and ready-to-run examples.

## Skills

| Skill | Tools | Description |
|-------|-------|-------------|
| [`serena-project`](skills/serena-project/SKILL.md) | 7 tools | Project activation, onboarding, modes, config |
| [`serena-file-io`](skills/serena-file-io/SKILL.md) | 4 tools | Read, write, list, find files |
| [`serena-code-intelligence`](skills/serena-code-intelligence/SKILL.md) | 3 tools | LSP symbol navigation and reference lookup |
| [`serena-code-editing`](skills/serena-code-editing/SKILL.md) | 5 tools | Symbol-aware and regex-based code edits |
| [`serena-search`](skills/serena-search/SKILL.md) | 1 tool | Full-text regex search with glob filtering |
| [`serena-shell`](skills/serena-shell/SKILL.md) | 1 tool | Execute shell commands in project context |
| [`serena-memory`](skills/serena-memory/SKILL.md) | 6 tools | Persistent cross-session memory management |

---

## 1. Install and register Serena MCP server

### Install Serena

Serena requires Python 3.10+ and [uv](https://docs.astral.sh/uv/).

```bash
# Install uv if you don't have it
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Serena is run directly via `uvx` — no cloning required:

```bash
uvx --from git+https://github.com/oraios/serena serena start-mcp-server
```

### Register Serena with mcporter

[mcporter](https://github.com/steipete/mcporter) is a CLI toolkit for calling MCP servers. It auto-discovers servers configured in Cursor, Claude Desktop, OpenCode, and VS Code, but you can also register Serena explicitly.

Edit `~/.mcporter/mcporter.json` directly (create the file if it doesn't exist):

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

> **Important:** The `command` must be the full command as a single string. The `"imports": []` field is required. Do not split the command into `command` + `args`.

**Start the keep-alive daemon:**

```bash
npx mcporter daemon start

# Confirm it is running
npx mcporter daemon status
```

The daemon keeps the Serena process alive between calls so that project activation and other state persists across separate `npx mcporter call` invocations. Stop it when you're done for the day:

```bash
npx mcporter daemon stop
```

**Verify connectivity:**

```bash
npx mcporter list serena
```

You should see all ~25 Serena tools listed. If it hangs, check that `uv` / `uvx` is on your `$PATH`.

### Register Serena with OpenCode directly

If you use OpenCode and want Serena available as a native MCP server (without routing through mcporter), add it to your OpenCode config at `~/.config/opencode/config.json`:

```jsonc
{
  "mcp": {
    "serena": {
      "type": "local",
      "command": ["uvx", "--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"],
      "enabled": true
    }
  }
}
```

---

## 2. Install the skills

Skills are Markdown files that OpenCode loads on-demand to give the agent reusable instructions. They live under a `skills/` subdirectory inside any of these locations (searched in order):

| Scope | Path |
|-------|------|
| Global (all projects) | `~/.config/opencode/skills/<name>/SKILL.md` |
| Project-local | `.opencode/skills/<name>/SKILL.md` |
| Claude-compatible global | `~/.claude/skills/<name>/SKILL.md` |
| Claude-compatible project | `.claude/skills/<name>/SKILL.md` |
| Agents-compatible global | `~/.agents/skills/<name>/SKILL.md` |
| Agents-compatible project | `.agents/skills/<name>/SKILL.md` |

### Install all skills globally (recommended)

Clone the repo to your preferred location, then run the following from inside it:

```bash
git clone https://github.com/sachmata/serena-skills
cd serena-skills

# Copy all skills to the global OpenCode skills directory
for skill_dir in skills/*/; do
  skill_name=$(basename "$skill_dir")
  mkdir -p ~/.config/opencode/skills/"$skill_name"
  cp "$skill_dir/SKILL.md" ~/.config/opencode/skills/"$skill_name"/SKILL.md
done
```

**Fish shell:**

```fish
git clone https://github.com/sachmata/serena-skills
cd serena-skills

# Copy all skills to the global OpenCode skills directory
for skill_dir in skills/*/
  set skill_name (basename $skill_dir)
  mkdir -p ~/.config/opencode/skills/$skill_name
  cp $skill_dir/SKILL.md ~/.config/opencode/skills/$skill_name/SKILL.md
end
```

Or, if you prefer symlinks so `git pull` keeps them up-to-date automatically:

```bash
for skill_dir in skills/*/; do
  skill_name=$(basename "$skill_dir")
  mkdir -p ~/.config/opencode/skills/"$skill_name"
  ln -sf "$(realpath "$skill_dir/SKILL.md")" \
         ~/.config/opencode/skills/"$skill_name"/SKILL.md
done
```

**Fish shell:**

```fish
for skill_dir in skills/*/
  set skill_name (basename $skill_dir)
  mkdir -p ~/.config/opencode/skills/$skill_name
  ln -sf (realpath $skill_dir/SKILL.md) ~/.config/opencode/skills/$skill_name/SKILL.md
end
```

### Install a single skill

```bash
skill=serena-code-editing
mkdir -p ~/.config/opencode/skills/"$skill"
cp skills/"$skill"/SKILL.md ~/.config/opencode/skills/"$skill"/SKILL.md
```

**Fish shell:**

```fish
set skill serena-code-editing
mkdir -p ~/.config/opencode/skills/$skill
cp skills/$skill/SKILL.md ~/.config/opencode/skills/$skill/SKILL.md
```

### Install for project-local use

```bash
# From the serena-skills repo root
for skill_dir in skills/*/; do
  skill_name=$(basename "$skill_dir")
  mkdir -p /path/to/your-project/.opencode/skills/"$skill_name"
  cp "$skill_dir/SKILL.md" /path/to/your-project/.opencode/skills/"$skill_name"/SKILL.md
done
```

**Fish shell:**

```fish
# From the serena-skills repo root
for skill_dir in skills/*/
  set skill_name (basename $skill_dir)
  mkdir -p /path/to/your-project/.opencode/skills/$skill_name
  cp $skill_dir/SKILL.md /path/to/your-project/.opencode/skills/$skill_name/SKILL.md
end
```

### Verify skills are discoverable

Start OpenCode in your project and run:

```
/skills
```

Or ask the agent: `list all available skills`. You should see all seven `serena-*` skills listed.

---

## 3. Use the skills

Skills are loaded on-demand: OpenCode exposes each skill's name and description to the agent, and the agent fetches the full `SKILL.md` automatically when it determines a skill is relevant to the current task. No user intervention is needed.

### Typical session workflow

**Step 1 — Activate the project (`serena-project`)**

Start every session by activating your project. On first use, Serena creates a `.serena/project.yml` configuration file in the project root.

```
Load the serena-project skill, then activate the project /path/to/my-project
```

**Step 2 — Onboarding and memories (`serena-memory`)**

On first activation, if no memories exist yet, Serena automatically runs an onboarding pass: it reads key files (structure, build system, tests) and stores the findings as Markdown files in `.serena/memories/`. On subsequent activations it skips onboarding and reads the existing memories instead.

After onboarding completes, start a **new conversation** — the context window is likely full after the initial read. Then prime the agent with project knowledge:

```
Load the serena-memory skill. Summarize what you know about this project from memory.
```

Ask the agent to keep memories current as the project evolves:

```
Update the memory "modules/backend" to reflect the new database schema.
```

**Step 3 — Coding tasks**

Just describe what you want — the agent reads the skill descriptions, decides which skills are relevant, and loads them automatically:

```
Rename the UserService class to AccountService and update all call sites.
```

The remaining skills cover the agent's full toolkit and are loaded autonomously as needed:

| Skill | When the agent uses it |
|-------|------------------------|
| `serena-file-io` | Reading, writing, or listing files |
| `serena-code-intelligence` | Looking up symbol definitions, references, or class hierarchies |
| `serena-code-editing` | Editing code by symbol name or regex pattern |
| `serena-search` | Full-text or regex search across the codebase |
| `serena-shell` | Running build, test, or lint commands |

### Quick-start install prompt

See [`INSTALL_PROMPT.md`](INSTALL_PROMPT.md) for a copy-pasteable prompt that you can give to any agent with shell access to clone this repo and install all skills automatically.

---

## Repository structure

```
serena-skills/
├── README.md                          ← you are here
├── INSTALL_PROMPT.md                  ← paste into an agent to auto-install skills
├── SKILL_AUTHORING.md                 ← reference for writing and maintaining skills
├── LICENSE
└── skills/
    ├── serena-project/
    │   └── SKILL.md                   ← project lifecycle & modes
    ├── serena-file-io/
    │   └── SKILL.md                   ← read / write / list / find
    ├── serena-code-intelligence/
    │   └── SKILL.md                   ← LSP symbols & references
    ├── serena-code-editing/
    │   └── SKILL.md                   ← replace / insert / rename
    ├── serena-search/
    │   └── SKILL.md                   ← regex search across codebase
    ├── serena-shell/
    │   └── SKILL.md                   ← shell command execution
    └── serena-memory/
        └── SKILL.md                   ← persistent cross-session memory
```

---

## Compatibility

- **OpenCode** — native `skill` tool, all paths above
- **Claude Code / Claude Desktop** — place under `.claude/skills/` or `~/.claude/skills/`
- **Agents-compatible hosts** — place under `.agents/skills/` or `~/.agents/skills/`

Skills use YAML frontmatter with `name` and `description` (required by the skill format) plus optional `license`, `compatibility`, and `metadata` fields, and plain Markdown bodies. They are compatible with any agent host that supports the OpenCode skill format.

---

## Inspiration

This project was directly inspired by Armin Ronacher's post **[Skills vs Dynamic MCP Loadouts](https://lucumr.pocoo.org/2025/12/13/skills-vs-mcp/)** (December 2025).

The core argument from that post: MCP servers are great, but eagerly loading their full tool definitions burns tokens, and routing calls through a CLI proxy like mcporter leaves the agent with no idea what tools exist. The sweet spot is a **skill file** — a compact, human-maintained summary that teaches the agent what a tool can do and how to invoke it, without injecting heavy tool schemas into the context.

Key quote:

> *"Skills are really just short summaries of which skills exist and in which file the agent can learn more about them. […] Crucially, skills do not actually load a tool definition into the context. The tools remain the same: bash and the other tools the agent already has. All it learns from the skill are tips and tricks for how to use these tools more effectively."*

That is exactly what this repo does for Serena: each skill is a lightweight manual that the agent loads on demand via OpenCode's native `skill` tool, while Serena's actual MCP tools are called through mcporter as ordinary CLI invocations.

The known limitation Armin identifies — that MCP servers change their APIs freely, which can silently invalidate skill files — applies here too. If Serena's tool signatures change, the skills in this repo will need updating. PRs welcome.

---

## Skill authoring

See [`SKILL_AUTHORING.md`](SKILL_AUTHORING.md) for a concise reference on writing and maintaining skills — structure, frontmatter fields, common patterns, and anti-patterns.

---

## Generating a tool reference for skill development

When writing or updating skills, it helps to have Serena's current tool definitions as a reference. There are two ways to get them.

### Option A: mcporter (quick look)

If you already have mcporter configured (see above), list all tool definitions directly:

```bash
npx mcporter list serena
```

This prints every tool's name, description, and parameters to the terminal — useful for a quick check while editing a skill.

### Option B: OpenAPI spec via mcpo (full machine-readable reference)

For a complete, structured reference you can generate a `serena_openapi.json` file by exposing the MCP server as a REST endpoint with [mcpo](https://github.com/nicholasgasior/mcpo) and fetching its OpenAPI spec.

**1. Start Serena behind mcpo:**

```bash
uvx mcpo --port 8088 -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server
```

This wraps the Serena MCP server in an HTTP server on port 8088.

**2. Fetch the OpenAPI spec:**

```bash
curl http://0.0.0.0:8088/openapi.json -o serena_openapi.json
```

The resulting `serena_openapi.json` contains every tool's name, description, and parameter schema. Use it as the source of truth when authoring new skills or updating existing ones after Serena changes its API.

> **Note:** `serena_openapi.json` is a development aid — it is not checked into this repo. Regenerate it whenever you need to verify tool signatures against the latest Serena version.

---

## License

MIT
