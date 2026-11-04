# Copilot Instructions Templates

## Key Principles

- **Concise**: Dense, human-readable content; one line per concept when possible
- **Actionable**: Commands should be copy-paste ready
- **Project-specific**: Document patterns unique to this project, not generic advice
- **Current**: All info should reflect actual codebase state

---

## Recommended Sections

Use only the sections relevant to the project. Not all sections are needed.

### Commands

Document the essential commands for working with the project.

```markdown
## Commands

| Command | Description |
|---------|-------------|
| `<install command>` | Install dependencies |
| `<dev command>` | Start development server |
| `<build command>` | Production build |
| `<test command>` | Run tests |
| `<lint command>` | Lint/format code |
```

### Architecture

Describe the project structure so Copilot understands where things live.

```markdown
## Architecture

```
<root>/
  <dir>/    # <purpose>
  <dir>/    # <purpose>
  <dir>/    # <purpose>
```
```

### Key Files

List important files that Copilot should know about.

```markdown
## Key Files

- `<path>` - <purpose>
- `<path>` - <purpose>
```

### Code Style

Document project-specific coding conventions.

```markdown
## Code Style

- <convention>
- <convention>
- <preference over alternative>
```

### Environment

Document required environment variables and setup.

```markdown
## Environment

Required:
- `<VAR_NAME>` - <purpose>
- `<VAR_NAME>` - <purpose>

Setup:
- <setup step>
```

### Testing

Document testing approach and commands.

```markdown
## Testing

- `<test command>` - <what it tests>
- <testing convention or pattern>
```

### Gotchas

Document non-obvious patterns, quirks, and warnings.

```markdown
## Gotchas

- <non-obvious thing that causes issues>
- <ordering dependency or prerequisite>
- <common mistake to avoid>
```

### Workflow

Document development workflow patterns.

```markdown
## Workflow

- <when to do X>
- <preferred approach for Y>
```

---

## Path-Specific Instructions

Create `.github/instructions/NAME.instructions.md` files for file-type or directory-specific guidelines.

### Example: TypeScript Instructions

```markdown
---
applyTo: "**/*.ts,**/*.tsx"
excludeAgent: "code-review"
---

# TypeScript Guidelines

- Use named exports instead of default exports
- Prefer interfaces over type aliases for object shapes
- Use strict null checks
```

### Example: Test File Instructions

```markdown
---
applyTo: "**/*.test.ts,**/*.spec.ts"
---

# Test Guidelines

- Use descriptive test names: `it('should return error when user not found')`
- Mock external dependencies
- Follow AAA pattern: Arrange, Act, Assert
```

### Example: API Route Instructions

```markdown
---
applyTo: "src/api/**/*.ts"
---

# API Route Guidelines

- All endpoints must have error handling
- Use Zod for request validation
- Return typed responses with status codes
```

---

## Template: Project Root (Minimal)

```markdown
# <Project Name>

<One-line description>

## Commands

| Command | Description |
|---------|-------------|
| `<command>` | <description> |

## Architecture

```
<structure>
```

## Gotchas

- <gotcha>
```

---

## Template: Project Root (Comprehensive)

```markdown
# <Project Name>

<One-line description>

## Commands

| Command | Description |
|---------|-------------|
| `<command>` | <description> |

## Architecture

```
<structure with descriptions>
```

## Key Files

- `<path>` - <purpose>

## Code Style

- <convention>

## Environment

- `<VAR>` - <purpose>

## Testing

- `<command>` - <scope>

## Gotchas

- <gotcha>
```

---

## Template: Package/Module

For packages within a monorepo or distinct modules.

```markdown
# <Package Name>

<Purpose of this package>

## Usage

```
<import/usage example>
```

## Key Exports

- `<export>` - <purpose>

## Dependencies

- `<dependency>` - <why needed>

## Notes

- <important note>
```

---

## Template: Monorepo Root

```markdown
# <Monorepo Name>

<Description>

## Packages

| Package | Description | Path |
|---------|-------------|------|
| `<name>` | <purpose> | `<path>` |

## Commands

| Command | Description |
|---------|-------------|
| `<command>` | <description> |

## Cross-Package Patterns

- <shared pattern>
- <generation/sync pattern>
```

---

## Template: API/Backend Project

```markdown
# <Project Name>

<Description>

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm test` | Run test suite |
| `npm run db:migrate` | Run database migrations |

## Architecture

```
src/
  api/          # REST API endpoints
  services/     # Business logic
  models/       # Database models
  middleware/   # Express middleware
  config/       # Configuration files
  utils/        # Shared utilities
```

## Environment

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for token signing
- `PORT` - Server port (default: 3000)

## Testing

- Use `supertest` for API endpoint tests
- Factories in `tests/factories/` for test data
- Run with `--runInBand` for sequential execution

## Gotchas

- Migrations must be created before models are updated
- JWT tokens expire in 24h (set in `config/auth.js`)
```

---

## Template: Frontend/React Project

```markdown
# <Project Name>

<Description>

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run Vitest |

## Architecture

```
src/
  components/   # React components
  hooks/        # Custom hooks
  pages/        # Page components (routing)
  services/     # API clients
  stores/       # State management
  utils/        # Helper functions
```

## Code Style

- Use functional components with hooks
- Prefer named exports over default
- CSS modules for component styles (`.module.css`)

## Environment

- `VITE_API_URL` - Backend API URL
- `VITE_*` prefix required for all env vars

## Gotchas

- Environment vars must be set at build time
- HMR may fail if component name changes
```

---

## Update Principles

When updating any copilot-instructions.md:

1. **Be specific**: Use actual file paths, real commands from this project
2. **Be current**: Verify info against the actual codebase
3. **Be brief**: One line per concept when possible
4. **Be useful**: Would this help Copilot understand the project better?
