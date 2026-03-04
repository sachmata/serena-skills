# serena-skills

OpenCode agent skills for [Serena MCP server](https://github.com/oraios/serena) — covering every tool category with ready-to-run [mcporter](https://github.com/steipete/mcporter) CLI examples.

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

# Clone Serena
git clone https://github.com/oraios/serena ~/.serena
cd ~/.serena && uv sync
```

Alternatively, Serena can be run directly via `uvx` without cloning:

```bash
uvx --from serena serena
```

### Register Serena with mcporter

[mcporter](https://github.com/steipete/mcporter) is a CLI toolkit for calling MCP servers. It auto-discovers servers configured in Cursor, Claude Desktop, OpenCode, and VS Code, but you can also register Serena explicitly.

**Option A — add to your mcporter config (recommended):**

```bash
# Creates/updates config/mcporter.json in the current directory,
# or ~/.mcporter/mcporter.json if you want it globally
npx mcporter config add serena \
  --stdio "uv run --directory ~/.serena serena" \
  --scope home
```

**Option B — edit `~/.mcporter/mcporter.json` directly:**

```jsonc
{
  "mcpServers": {
    "serena": {
      "command": "uv",
      "args": ["run", "--directory", "/home/YOUR_USER/.serena", "serena"],
      "description": "Serena — LSP-backed coding assistant MCP server"
    }
  }
}
```

Replace `/home/YOUR_USER/.serena` with the actual path where you cloned Serena, or use `uvx`:

```jsonc
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["--from", "serena", "serena"],
      "description": "Serena — LSP-backed coding assistant MCP server"
    }
  }
}
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
      "command": ["uv", "run", "--directory", "/home/YOUR_USER/.serena", "serena"],
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

Run this one-liner from any directory — it clones the repo and symlinks (or copies) the skills into your global OpenCode skills directory:

```bash
git clone https://github.com/YOUR_USERNAME/serena-skills ~/Projects/serena-skills

# Copy all skills to the global OpenCode skills directory
for skill_dir in ~/Projects/serena-skills/skills/*/; do
  skill_name=$(basename "$skill_dir")
  mkdir -p ~/.config/opencode/skills/"$skill_name"
  cp "$skill_dir/SKILL.md" ~/.config/opencode/skills/"$skill_name"/SKILL.md
done
```

Or, if you prefer symlinks so `git pull` keeps them up-to-date automatically:

```bash
for skill_dir in ~/Projects/serena-skills/skills/*/; do
  skill_name=$(basename "$skill_dir")
  mkdir -p ~/.config/opencode/skills/"$skill_name"
  ln -sf "$(realpath "$skill_dir/SKILL.md")" \
         ~/.config/opencode/skills/"$skill_name"/SKILL.md
done
```

### Install a single skill

```bash
skill=serena-code-editing
mkdir -p ~/.config/opencode/skills/$skill
cp ~/Projects/serena-skills/skills/$skill/SKILL.md \
   ~/.config/opencode/skills/$skill/SKILL.md
```

### Install for project-local use

```bash
# From inside your project root
for skill_dir in ~/Projects/serena-skills/skills/*/; do
  skill_name=$(basename "$skill_dir")
  mkdir -p .opencode/skills/"$skill_name"
  cp "$skill_dir/SKILL.md" .opencode/skills/"$skill_name"/SKILL.md
done
```

### Verify skills are discoverable

Start OpenCode in your project and run:

```
/skills
```

Or ask the agent: `list all available skills`. You should see all seven `serena-*` skills listed.

---

## 3. Use the skills

Once installed, the agent loads skills on-demand. You can trigger a skill explicitly:

```
Use the serena-project skill to set up my session.
```

Or the agent will pick the right skill automatically based on context. To load a specific skill from within a session paste the install prompt from [`INSTALL_PROMPT.md`](INSTALL_PROMPT.md) to prime the agent with all skills at once.

### Quick-start session prompt

See [`INSTALL_PROMPT.md`](INSTALL_PROMPT.md) for a copy-pasteable prompt that instructs the agent to load all Serena skills and begin a properly initialized work session.

---

## Repository structure

```
serena-skills/
├── README.md                          ← you are here
├── INSTALL_PROMPT.md                  ← copy-paste agent primer
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

Skills use standard YAML frontmatter (`name`, `description`, `license`, `compatibility`, `metadata`) and plain Markdown bodies. They are compatible with any agent host that supports the OpenCode skill format.

---

## Inspiration

This project was directly inspired by Armin Ronacher's post **[Skills vs Dynamic MCP Loadouts](https://lucumr.pocoo.org/2025/12/13/skills-vs-mcp/)** (December 2025).

The core argument from that post: MCP servers are great, but eagerly loading their full tool definitions burns tokens, and routing calls through a CLI proxy like mcporter leaves the agent with no idea what tools exist. The sweet spot is a **skill file** — a compact, human-maintained summary that teaches the agent what a tool can do and how to invoke it, without injecting heavy tool schemas into the context.

Key quote:

> *"Skills are really just short summaries of which skills exist and in which file the agent can learn more about them. […] Crucially, skills do not actually load a tool definition into the context. The tools remain the same: bash and the other tools the agent already has. All it learns from the skill are tips and tricks for how to use these tools more effectively."*

That is exactly what this repo does for Serena: each skill is a lightweight manual that the agent loads on demand via OpenCode's native `skill` tool, while Serena's actual MCP tools are called through mcporter as ordinary CLI invocations.

The known limitation Armin identifies — that MCP servers change their APIs freely, which can silently invalidate skill files — applies here too. If Serena's tool signatures change, the skills in this repo will need updating. PRs welcome.

---

## License

MIT
