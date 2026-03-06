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

3. Clone the serena-skills repo (skip if already present):
   git clone https://github.com/sachmata/serena-skills ~/serena-skills

4. Add the sr wrapper to PATH (add to your shell rc file for persistence):
   export PATH="$PATH:$HOME/serena-skills"

5. Copy every skill into the global OpenCode skills directory:
   for skill_dir in ~/serena-skills/skills/*/; do
     skill_name=$(basename "$skill_dir")
     mkdir -p ~/.config/opencode/skills/"$skill_name"
     cp "$skill_dir/SKILL.md" ~/.config/opencode/skills/"$skill_name"/SKILL.md
   done

6. Verify skills are installed:
   ls ~/.config/opencode/skills/

   The expected output is eight directories:
     serena-code-editing
     serena-code-intelligence
     serena-file-io
     serena-memory
     serena-project
     serena-search
     serena-setup
     serena-shell

7. Verify Serena is reachable (sr auto-registers Serena with mcporter
   and starts the keep-alive daemon on first use):
   sr initial_instructions

   This should print Serena's initial instructions text. If it hangs,
   check that uv/uvx and node/npx are on your PATH.

Please run these commands now and confirm each step succeeded.
```
