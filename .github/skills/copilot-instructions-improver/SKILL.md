---
name: copilot-instructions-improver
description: Audit and improve GitHub Copilot instruction files in repositories. Use when user asks to check, audit, update, improve, or fix copilot-instructions.md files or Copilot custom instructions. Scans for all instruction files, evaluates quality against templates, outputs quality report, then makes targeted updates. Also use when the user mentions "Copilot instructions maintenance" or "Copilot context optimization".
tools: Read, Glob, Grep, Bash, Edit
---

# Copilot Instructions Improver

Audit, evaluate, and improve custom instruction files across a codebase to ensure GitHub Copilot has optimal project context.

**This skill can write to instruction files.** After presenting a quality report and getting user approval, it updates instruction files with targeted improvements.

## Workflow

### Phase 1: Discovery

Find all Copilot instruction files in the repository:

```bash
find . \( -name "copilot-instructions.md" -path "*/.github/*" \) -o \
       \( -name "*.instructions.md" -path "*/.github/instructions/*" \) -o \
       \( -maxdepth 1 -name "AGENTS.md" -o -name "CLAUDE.md" -o -name "GEMINI.md" \) \
       2>/dev/null | head -50
```

**File Types & Locations:**

| Type | Location | Purpose |
|------|----------|---------|
| Repository-wide | `./.github/copilot-instructions.md` | Primary project context (checked into git, shared with team) |
| Path-specific | `./.github/instructions/NAME.instructions.md` | Scoped to specific files/directories via glob patterns |
| Agent instructions | `./AGENTS.md`, `./CLAUDE.md`, `./GEMINI.md` | Agent-specific context (root level, takes priority) |
| Local (user-wide) | `~/.copilot/copilot-instructions.md` | Personal settings across all projects (not shared) |
| Custom directories | Paths in `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` env var | Additional instruction directories |

**Note:** GitHub Copilot auto-discovers instruction files in the `.github` directory. Path-specific files require frontmatter with `applyTo` glob patterns.

### Phase 2: Quality Assessment

For each instruction file, evaluate against quality criteria. See [references/quality-criteria.md](references/quality-criteria.md) for detailed rubrics.

**Quick Assessment Checklist:**

| Criterion | Weight | Check |
|-----------|--------|-------|
| Commands/workflows documented | High | Are build/test/deploy commands present? |
| Architecture clarity | High | Can Copilot understand the codebase structure? |
| Non-obvious patterns | Medium | Are gotchas and quirks documented? |
| Conciseness | Medium | No verbose explanations or obvious info? |
| Currency | High | Does it reflect current codebase state? |
| Actionability | High | Are instructions executable, not vague? |

**Quality Scores:**
- **A (90-100)**: Comprehensive, current, actionable
- **B (70-89)**: Good coverage, minor gaps
- **C (50-69)**: Basic info, missing key sections
- **D (30-49)**: Sparse or outdated
- **F (0-29)**: Missing or severely outdated

### Phase 3: Quality Report Output

**ALWAYS output the quality report BEFORE making any updates.**

Format:

```
## Copilot Instructions Quality Report

### Summary
- Files found: X
- Average score: X/100
- Files needing update: X

### File-by-File Assessment

#### 1. ./.github/copilot-instructions.md (Project Root)
**Score: XX/100 (Grade: X)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | X/20 | ... |
| Architecture clarity | X/20 | ... |
| Non-obvious patterns | X/15 | ... |
| Conciseness | X/15 | ... |
| Currency | X/15 | ... |
| Actionability | X/15 | ... |

**Issues:**
- [List specific problems]

**Recommended additions:**
- [List what should be added]

#### 2. ./.github/instructions/typescript.instructions.md (Path-specific)
...
```

### Phase 4: Targeted Updates

After outputting the quality report, ask user for confirmation before updating.

**Update Guidelines (Critical):**

1. **Propose targeted additions only** - Focus on genuinely useful info:
    - Commands or workflows discovered during analysis
    - Gotchas or non-obvious patterns found in code
    - Package relationships that weren't clear
    - Testing approaches that work
    - Configuration quirks

2. **Keep it minimal** - Avoid:
    - Restating what's obvious from the code
    - Generic best practices already covered
    - One-off fixes unlikely to recur
    - Verbose explanations when a one-liner suffices

3. **Show diffs** - For each change, show:
    - Which instruction file to update
    - The specific addition (as a diff or quoted block)
    - Brief explanation of why this helps future sessions

**Diff Format:**

```markdown
### Update: ./.github/copilot-instructions.md

**Why:** Build command was missing, causing confusion about how to run the project.

```diff
+ ## Quick Start
+
+ ```bash
+ npm install
+ npm run dev  # Start development server on port 3000
+ ```
```
```

### Phase 5: Apply Updates

After user approval, apply changes using your preferred editor. Preserve existing content structure.

## Templates

See [references/templates.md](references/templates.md) for copilot-instructions.md templates by project type.

## Common Issues to Flag

1. **Stale commands**: Build commands that no longer work
2. **Missing dependencies**: Required tools not mentioned
3. **Outdated architecture**: File structure that's changed
4. **Missing environment setup**: Required env vars or config
5. **Broken test commands**: Test scripts that have changed
6. **Undocumented gotchas**: Non-obvious patterns not captured

## User Tips to Share

When presenting recommendations, remind users:

- **Keep it concise**: Instruction files should be human-readable; dense is better than verbose
- **Actionable commands**: All documented commands should be copy-paste ready
- **Use `~/.copilot/copilot-instructions.md`**: For personal preferences not shared with team
- **Use `.github/instructions/*.instructions.md`**: For path-specific instructions with glob patterns
- **Avoid conflicts**: Copilot's choice between conflicting instructions is non-deterministic

## What Makes Great Copilot Instructions

**Key principles:**
- Concise and human-readable
- Actionable commands that can be copy-pasted
- Project-specific patterns, not generic advice
- Non-obvious gotchas and warnings

**Recommended sections** (use only what's relevant):
- Commands (build, test, dev, lint)
- Architecture (directory structure)
- Key Files (entry points, config)
- Code Style (project conventions)
- Environment (required vars, setup)
- Testing (commands, patterns)
- Gotchas (quirks, common mistakes)
- Workflow (when to do what)
