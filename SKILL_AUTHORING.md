# Skill Authoring Reference

A concise reference for writing and maintaining Skills, distilled from the [Claude Agent Skills documentation](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) and [best practices guide](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

---

## What is a Skill?

A Skill is a reusable, filesystem-based resource that provides an agent with domain-specific expertise — workflows, context, and best practices — loaded on demand. Unlike system prompts (always present) or conversation-level instructions (one-off), Skills are discovered automatically and loaded only when relevant.

### Three levels of loading

| Level | When loaded | Token cost | Content |
|-------|------------|------------|---------|
| **1. Metadata** | Always (at startup) | ~100 tokens per Skill | `name` and `description` from YAML frontmatter |
| **2. Instructions** | When Skill is triggered | Target < 5k tokens | SKILL.md body |
| **3. Resources** | As needed | Effectively unlimited | Bundled files (additional .md, scripts, data) accessed via bash |

Only metadata occupies the context window by default. The agent reads SKILL.md from the filesystem when it determines the Skill is relevant, and reads additional bundled files only when referenced.

---

## SKILL.md structure

Every Skill requires a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it.
---

# Your Skill Name

## Instructions
[Clear, step-by-step guidance]

## Examples
[Concrete examples]
```

### Required frontmatter fields

**`name`**:
- Maximum 64 characters
- Lowercase letters, numbers, and hyphens only
- No XML tags
- No reserved words: "anthropic", "claude"

**`description`**:
- Non-empty, maximum 1024 characters
- No XML tags
- Must describe both **what** the Skill does and **when** to use it
- Write in **third person** — the description is injected into the system prompt

Good: `"Extracts text and tables from PDF files, fills forms, merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction."`

Bad: `"I can help you process PDFs"` / `"Helps with documents"` / `"Does stuff with files"`

---

## Core principles

### Be concise

The context window is a shared resource. Only add context the agent doesn't already know.

- Challenge each piece of information: "Does the agent really need this explanation?"
- Assume the agent knows common concepts — don't explain what PDFs are or how libraries work
- Keep SKILL.md body **under 500 lines**; split into separate files if approaching this limit

### Set appropriate degrees of freedom

| Freedom level | When to use | Example |
|---------------|-------------|---------|
| **High** (text instructions) | Multiple valid approaches; decisions depend on context | Code review guidelines |
| **Medium** (pseudocode/templates) | A preferred pattern exists but some variation is acceptable | Report generation templates |
| **Low** (exact scripts) | Operations are fragile; consistency is critical | Database migrations |

### Use consistent terminology

Pick one term and use it throughout. Don't mix "API endpoint" / "URL" / "API route" / "path".

### Avoid time-sensitive information

Don't include dates or version-dependent conditionals. Use an "old patterns" section with `<details>` for deprecated approaches.

---

## Skill directory structure

### Simple Skill (most cases)

```
my-skill/
└── SKILL.md
```

### Skill with bundled resources

```
my-skill/
├── SKILL.md              # Main instructions (loaded when triggered)
├── REFERENCE.md          # Detailed API reference (loaded as needed)
├── EXAMPLES.md           # Usage examples (loaded as needed)
└── scripts/
    └── validate.py       # Utility script (executed, not loaded into context)
```

### Progressive disclosure in SKILL.md

Point to additional files from the main instructions:

```markdown
## Advanced features

**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
```

The agent loads these only when the task requires them.

**Keep references one level deep** — all referenced files should link directly from SKILL.md. Avoid chains like SKILL.md → advanced.md → details.md (the agent may only partially read deeply nested files).

For reference files over 100 lines, include a **table of contents** at the top.

---

## Common patterns

### Workflow pattern

Break complex operations into numbered steps with a checklist:

```markdown
## Deployment workflow

Copy this checklist and track progress:

- [ ] Step 1: Run tests
- [ ] Step 2: Build artifacts
- [ ] Step 3: Validate output
- [ ] Step 4: Deploy

**Step 1: Run tests**
...
```

### Feedback loop pattern

Run validator → fix errors → repeat:

```markdown
1. Make edits
2. **Validate immediately**: `python scripts/validate.py`
3. If validation fails: fix issues and re-validate
4. **Only proceed when validation passes**
```

### Template pattern

Provide output templates. Use "ALWAYS use this exact structure" for strict requirements, or "sensible default, use your best judgment" for flexible guidance.

### Examples pattern

Provide input/output pairs for tasks where quality depends on seeing examples (e.g. commit message formatting).

### Conditional workflow pattern

Guide through decision points:

```markdown
**Creating new content?** → Follow "Creation workflow" below
**Editing existing content?** → Follow "Editing workflow" below
```

---

## Utility scripts

Pre-made scripts are preferred over generated code:

- More reliable than agent-generated code
- Save tokens (no code in context — only script output)
- Ensure consistency across uses

Make clear whether the agent should **execute** the script ("Run `validate.py`") or **read** it as reference ("See `validate.py` for the algorithm").

Handle errors explicitly in scripts — don't punt to the agent.

Document any magic constants:

```python
# HTTP requests typically complete within 30 seconds
REQUEST_TIMEOUT = 30

# Three retries balances reliability vs speed
MAX_RETRIES = 3
```

---

## Where Skills are discovered

Skills live under a `skills/` subdirectory. Searched in order:

| Scope | Path |
|-------|------|
| Global (OpenCode) | `~/.config/opencode/skills/<name>/SKILL.md` |
| Project-local (OpenCode) | `.opencode/skills/<name>/SKILL.md` |
| Claude-compatible global | `~/.claude/skills/<name>/SKILL.md` |
| Claude-compatible project | `.claude/skills/<name>/SKILL.md` |
| Agents-compatible global | `~/.agents/skills/<name>/SKILL.md` |
| Agents-compatible project | `.agents/skills/<name>/SKILL.md` |

---

## Anti-patterns to avoid

- **Too many choices**: Provide a default tool/approach with an escape hatch, not a list of 5 alternatives
- **Windows-style paths**: Always use forward slashes (`scripts/helper.py`, not `scripts\helper.py`)
- **Vague descriptions**: `"Helps with documents"` — be specific about what and when
- **Over-explaining**: Don't explain concepts the agent already knows
- **Deeply nested references**: Keep all file references one level from SKILL.md
- **Voodoo constants**: All configuration values should be documented and justified
- **Assuming tools are installed**: Be explicit about dependencies

---

## Iterative development process

1. Complete a task without a Skill — note what context you repeatedly provide
2. Ask an agent to create a Skill capturing the reusable pattern
3. Review for conciseness — remove unnecessary explanations
4. Test with real tasks using a fresh agent instance
5. Observe agent behavior — note struggles, missed information, unexpected paths
6. Refine based on observations, not assumptions
7. Repeat the test-observe-refine cycle

---

## Checklist for effective Skills

### Core quality
- [ ] Description is specific, third-person, includes what + when
- [ ] SKILL.md body under 500 lines
- [ ] Additional details split into separate files (if needed)
- [ ] No time-sensitive information
- [ ] Consistent terminology throughout
- [ ] Concrete examples (not abstract)
- [ ] File references one level deep
- [ ] Workflows have clear steps

### Code and scripts
- [ ] Scripts handle errors explicitly
- [ ] No magic constants (all values justified)
- [ ] Required packages listed
- [ ] Validation/verification steps for critical operations
- [ ] No Windows-style paths

### Testing
- [ ] Tested with real usage scenarios
- [ ] Observed agent behavior and refined based on findings
