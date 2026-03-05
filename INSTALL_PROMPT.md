# Install Prompt

Paste the block below into an agent (OpenCode, Claude Code, or any agent with shell access) to install serena-skills automatically.

---

```
Please set up Serena and serena-skills by running the following steps in a shell:

1. Install uv (skip if `uv` is already on PATH):
   curl -LsSf https://astral.sh/uv/install.sh | sh
   Then restart your shell or run: source $HOME/.local/bin/env

2. Verify uvx works:
   uvx --version

3. Register Serena as a global mcporter MCP server:
   npx mcporter config add serena \
     --stdio "uvx --from git+https://github.com/oraios/serena serena start-mcp-server" \
     --scope home

4. Verify Serena is reachable (should list ~25 tools):
   npx mcporter list serena

5. Clone the serena-skills repo (skip if already present):
   git clone https://github.com/sachmata/serena-skills ~/serena-skills

6. Copy every skill into the global OpenCode skills directory:
   for skill_dir in ~/serena-skills/skills/*/; do
     skill_name=$(basename "$skill_dir")
     mkdir -p ~/.config/opencode/skills/"$skill_name"
     cp "$skill_dir/SKILL.md" ~/.config/opencode/skills/"$skill_name"/SKILL.md
   done

7. Verify installation by listing the installed skill directories:
   ls ~/.config/opencode/skills/

The expected output is seven directories:
  serena-code-editing
  serena-code-intelligence
  serena-file-io
  serena-memory
  serena-project
  serena-search
  serena-shell

Please run these commands now and confirm each step succeeded.
```
