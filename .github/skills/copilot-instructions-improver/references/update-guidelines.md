# Copilot Instructions Update Guidelines

## Core Principle

Only add information that will genuinely help GitHub Copilot understand your project. Every line must earn its place.

## What TO Add

### 1. Commands/Workflows Discovered

```markdown
## Build

`npm run build:prod` - Full production build with optimization
`npm run build:dev` - Fast dev build (no minification)
```

Why: Saves Copilot from suggesting wrong commands.

### 2. Gotchas and Non-Obvious Patterns

```markdown
## Gotchas

- Tests must run sequentially (`--runInBand`) due to shared DB state
- `yarn.lock` is authoritative; delete `node_modules` if deps mismatch
```

Why: Prevents Copilot from suggesting patterns that won't work in this codebase.

### 3. Package Relationships

```markdown
## Dependencies

The `auth` module depends on `crypto` being initialized first.
Import order matters in `src/bootstrap.ts`.
```

Why: Architecture knowledge that isn't obvious from code.

### 4. Testing Approaches That Work

```markdown
## Testing

For API endpoints: Use `supertest` with the test helper in `tests/setup.ts`
Mocking: Factory functions in `tests/factories/` (not inline mocks)
```

Why: Establishes patterns that work in this project.

### 5. Configuration Quirks

```markdown
## Config

- `NEXT_PUBLIC_*` vars must be set at build time, not runtime
- Redis connection requires `?family=0` suffix for IPv6
```

Why: Environment-specific knowledge.

## What NOT to Add

### 1. Obvious Code Info

Bad:
```markdown
The `UserService` class handles user operations.
```

The class name already tells us this.

### 2. Generic Best Practices

Bad:
```markdown
Always write tests for new features.
Use meaningful variable names.
```

This is universal advice, not project-specific.

### 3. One-Off Fixes

Bad:
```markdown
We fixed a bug in commit abc123 where the login button didn't work.
```

Won't recur; clutters the file.

### 4. Verbose Explanations

Bad:
```markdown
The authentication system uses JWT tokens. JWT (JSON Web Tokens) are
an open standard (RFC 7519) that defines a compact and self-contained
way for securely transmitting information between parties as a JSON
object. In our implementation, we use the HS256 algorithm which...
```

Good:
```markdown
Auth: JWT with HS256, tokens in `Authorization: Bearer <token>` header.
```

## Diff Format for Updates

For each suggested change:

### 1. Identify the File

```
File: ./.github/copilot-instructions.md
Section: Commands (new section after ## Architecture)
```

### 2. Show the Change

```diff
 ## Architecture
 ...

+## Commands
+
+| Command | Purpose |
+|---------|---------|
+| `npm run dev` | Dev server with HMR |
+| `npm run build` | Production build |
+| `npm test` | Run test suite |
```

### 3. Explain Why

> **Why this helps:** The build commands weren't documented, causing
> Copilot to suggest incorrect commands. This saves time and prevents
> errors.

## Validation Checklist

Before finalizing an update, verify:

- [ ] Each addition is project-specific
- [ ] No generic advice or obvious info
- [ ] Commands are tested and work
- [ ] File paths are accurate
- [ ] Would Copilot benefit from knowing this?
- [ ] Is this the most concise way to express the info?

## Example: Good vs Bad Updates

### Bad Update

```markdown
## Best Practices

- Write clean code
- Follow SOLID principles
- Use meaningful variable names
- Write comprehensive tests
```

**Why bad:** Generic advice that applies to any project.

### Good Update

```markdown
## Gotchas

- API rate limit: 100 req/min per IP (retry with exponential backoff)
- Database pool size capped at 10; connection leaks crash the server
- S3 uploads require `x-amz-server-side-encryption: AES256` header
```

**Why good:** Project-specific constraints Copilot needs to know.

## Maintaining Instructions Over Time

### When to Update

Update copilot-instructions.md when:
- Major architecture changes occur
- New build commands are added
- Testing patterns change
- New gotchas are discovered
- Dependencies or tech stack changes

### When NOT to Update

Don't update for:
- Minor bug fixes
- Routine feature additions that follow existing patterns
- Changes to individual components (unless they affect global patterns)
- Temporary workarounds
- Information that belongs in code comments

## File Locations

### Repository-Wide

**File:** `.github/copilot-instructions.md`

**Purpose:** Shared team instructions, checked into git

**Contains:**
- Project-wide architecture
- Build commands
- Testing strategy
- Shared conventions

### Path-Specific

**File:** `.github/instructions/NAME.instructions.md`

**Purpose:** Scoped to specific files/directories (requires frontmatter with `applyTo` glob pattern)

**Example:**
```markdown
---
applyTo: "**/*.test.ts"
---

# Test file instructions
```

**Contains:**
- File-type specific conventions
- Directory-specific patterns
- Targeted guidelines

### Local User-Wide

**File:** `~/.copilot/copilot-instructions.md`

**Purpose:** Personal preferences across all projects (not shared, stored in home directory)

**Contains:**
- Your preferred code style
- Personal tooling preferences
- Cross-project conventions
- Experimental patterns

### Agent Instructions

**Files:** `./AGENTS.md`, `./CLAUDE.md`, `./GEMINI.md` (at repository root)

**Purpose:** Agent-specific context (takes priority over other agent instructions)

**Contains:**
- Agent-specific guidelines
- Model-specific patterns
- Tool-specific conventions

### Custom Directories

**Environment Variable:** `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`

**Purpose:** Additional instruction directories

**Usage:**
```bash
export COPILOT_CUSTOM_INSTRUCTIONS_DIRS="/path/to/custom/instructions"
```

## Integration with GitHub Copilot

### How Copilot Uses Instructions

GitHub Copilot reads `.github/copilot-instructions.md` to:
1. Understand project structure
2. Follow project conventions
3. Suggest appropriate commands
4. Avoid known issues
5. Generate code matching your patterns

### Best Practices

- **Keep it current**: Outdated instructions are worse than none
- **Be specific**: "Use Redis for caching" vs "We use Redis v7 for session caching (see config/redis.js)"
- **Test commands**: All documented commands should work
- **Avoid conflicts**: Don't create contradictory instructions across files (Copilot's choice is non-deterministic)
- **Use path-specific wisely**: Scope instructions to relevant files using `applyTo` patterns
- **Link when needed**: Reference docs/PRs for complex patterns
- **Review regularly**: Schedule quarterly reviews
- **Natural language**: Write instructions in Markdown as natural language, not as code

### Testing Your Instructions

After updating, verify:
1. Ask Copilot CLI: `gh copilot suggest "How do I run tests?"`
2. Check if it references your instructions
3. Verify suggested commands match your docs
4. Iterate if Copilot misunderstands
