---
name: commit-pr-writer
description: Writes Conventional Commits-compliant commit messages and structured pull request descriptions (Summary, Architectural Impact, Breaking Changes, Testing Steps). Use this skill whenever the user asks for a "commit message", wants to "commit" their changes, asks for a "PR description", "pull request" description/body, or a "changelog" entry — even if they just say something like "write a commit for this", "describe this PR", "what should the changelog say", or ask you to open/prepare a pull request. Always use it before generating any commit message or PR body text, not just when those exact words appear.
license: MIT
---

# Commit & PR Writer

## Overview

Commit messages and PR descriptions are read far more often than they're written — by reviewers, by `git log`/`git blame` months later, and by changelog tooling. This skill makes that output predictable: every commit message follows Conventional Commits so tooling (and humans scanning history) can parse it at a glance, and every PR description covers the same four questions a reviewer actually needs answered — what changed, what it touches structurally, what might break, and how to verify it.

Inspect the actual change before writing anything — run `git diff`/`git diff --staged` (or read the specific files/diff the user points at) rather than guessing from the user's description alone. The commit type, scope, and breaking-change status all come from what the diff actually does, not just how the user phrased the request.

## Part 1: Commit messages (Conventional Commits)

### Format

```
<type>(<scope>): <subject>
```

- **Subject line max 72 characters total**, including `type(scope): ` — count it before finalizing. If the real change needs more explanation, keep the subject short and put the rest in a commit body (a blank line, then wrapped prose or bullet points), rather than cramming detail into the subject.
- **type** — pick the one that matches the dominant change in the diff:
  - `feat` — a new capability or behavior visible to a user or consumer of the code.
  - `fix` — corrects a bug or incorrect behavior.
  - `refactor` — restructures code without changing external behavior (no new feature, no bug fix).
  - `chore` — everything that isn't user-facing code behavior: build config, dependency bumps, tooling, formatting-only changes, CI.
  - If a change doesn't cleanly fit these four (e.g. it's purely docs, or purely tests), use the closest fit and say so — don't invent a type outside this set, since the whole point is a small, consistent vocabulary.
- **scope** — the module/feature the change is concentrated in, derived from the changed files' location rather than a fixed list (this repo's natural scopes read off the directory structure, e.g. `auth`, `cart`, `orders`, `products`, `clib`, or a backend layer like `controller`/`service`/`repository` when the change is localized there). If changes genuinely span multiple unrelated areas, pick the scope of the most significant one, or omit the scope rather than inventing a vague catch-all like `misc`.
- **subject** — imperative mood ("add", not "added"/"adds"), lowercase after the colon, no trailing period.

### Determining breaking changes

A commit is breaking if it changes a public contract in a way that breaks existing callers: a removed/renamed API endpoint or parameter, a changed response shape, a changed function signature callers rely on, a required new environment variable, a migration that isn't backward-compatible. Mark it with `!` after the scope (`feat(auth)!: require MFA on login`) and include a `BREAKING CHANGE:` footer describing what breaks and what the caller needs to do about it. Don't apply `!` reflexively to every large diff — a big refactor with an unchanged public contract isn't breaking.

### Examples

```
feat(cart): add quantity stepper to cart line items
fix(orders): prevent duplicate order submission on double-click
refactor(product-service): extract stock reservation into strategy
chore(deps): bump spring-boot to 4.0.3
feat(auth)!: require MFA on login

BREAKING CHANGE: clients must handle the new MFA challenge step
before a login completes; the token endpoint no longer returns a
session token directly.
```

### Multiple distinct changes

If the diff genuinely bundles several unrelated changes, say so and suggest splitting them into separate commits rather than writing one commit message that tries to describe all of them — a commit message covering three unrelated things is a sign the commit itself is too broad, not a formatting problem to paper over.

## Part 2: PR descriptions

Always use this exact template, with all four headers present even when a section is brief — a reviewer scanning PRs expects the same shape every time, and an omitted section reads as "forgotten" rather than "not applicable":

```markdown
## Summary
<2-5 sentences or bullets: what changed and why, from the user/consumer's perspective>

## Architectural Impact
<What layers/modules/patterns this touches — new dependencies, new layers,
changed data flow, changed strategy/pattern usage. If the change is
self-contained and doesn't affect the broader architecture, say so explicitly
rather than leaving the section thin and unexplained.>

## Breaking Changes
<Concrete list of breaking changes with migration guidance, using the same
test as the commit-message BREAKING CHANGE criteria above. If none, write
"None." — don't leave the section empty.>

## Testing Steps
<Numbered, reproducible steps a reviewer can follow to verify the change
manually (commands to run, URLs to hit, UI actions to take, expected
result at each step). Prefer concrete commands/clicks over "tested locally".>
```

- **Summary** answers "what and why" for someone who hasn't read the diff — lead with the user-facing or functional change, not implementation mechanics.
- **Architectural Impact** is about structure, not behavior: does this introduce a new layer, change which module owns a responsibility, add a dependency between modules that didn't talk before, or follow/break an existing pattern (e.g. the strategy pattern for order processing, or the DTO/mapper boundary)? A small bugfix contained to one function can legitimately say "None — isolated fix in `X`."
- **Breaking Changes** must list every item flagged as breaking across the included commits, each with what breaks and how a consumer adapts. "None." is a complete, valid answer when nothing breaks.
- **Testing Steps** should be steps a reviewer who didn't write the code could actually follow — reference real commands from this repo (e.g. `mvn test`, `npm test`, `ng serve`) and real endpoints/routes/UI paths touched by the change, not generic placeholders like "test the feature."

## Part 3: Changelog entries

When asked for a changelog entry, use Keep a Changelog style: group entries under the relevant category header(s) — `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security` — picking categories based on the same judgment as commit `type` (a `feat` commit is usually `Added` or `Changed`; a `fix` commit is `Fixed`). Each entry is one concise, user-facing bullet, written in plain language rather than implementation detail — a changelog reader cares what changed for them, not which class or file changed:

```markdown
### Added
- Quantity stepper on cart line items for faster quantity changes.

### Fixed
- Orders no longer get submitted twice when the checkout button is double-clicked.
```

If several commits are being summarized into one changelog, don't just concatenate commit subjects — merge related ones into a single bullet where they describe the same user-facing outcome.
