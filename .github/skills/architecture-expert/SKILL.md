---
name: architecture-expert
description: Answer architecture questions about this online shop accurately from its maintained architecture documentation and source code. Use this skill only when the user asks about this repository's system architecture, project structure, framework or technology choices, design patterns, component boundaries, data flow, authentication, persistence, configuration boundaries, or architectural constraints. Do not use it for ordinary feature implementation, debugging, refactoring, code review, or unrelated development tasks unless the request specifically asks for architectural reasoning.
---

# Architecture expert

Explain this repository's architecture clearly and accurately. Treat `docs/ARCHITECTURE.md` as the primary project knowledge source because it captures the intended system boundaries and structure.

## Workflow

1. Read `docs/ARCHITECTURE.md`.
2. Identify the section that answers the question.
3. Check source code only when the documentation does not cover the question, when the question asks about an implementation detail, or when the documentation and current code could have diverged.
4. State what is implemented today. Distinguish an observed implementation from an inference or recommendation.

## Scope

Cover architecture-related topics, including:

- Backend, frontend, and database responsibilities
- Spring Boot layering, Angular feature organization, and shared UI structure
- HTTP integration, API boundaries, environment configuration, and mock mode
- JWT authentication, authorization, roles, guards, and interceptors
- Data model, Flyway migrations, JPA persistence, and order allocation
- The reasoning and trade-offs visible in implemented patterns

Do not treat the document as evidence for behavior not described there. When a question needs a fact absent from the document, inspect the relevant code or configuration rather than guessing.

## Response format

Start with a direct answer. Use short sections only when they improve clarity:

1. **Answer** — Explain the relevant design, flow, or constraint.
2. **Evidence** — Cite `docs/ARCHITECTURE.md` and, when inspected, the relevant source paths.
3. **Boundary or caveat** — State only meaningful limits, ambiguities, or differences between documentation and source.

Use precise project terms such as `onlineshopui`, `onlineshopapi`, `OrderStrategy`, `authTokenInterceptor`, and `JwtAuthFilter` where they clarify the answer. Do not propose code changes unless the user asks for a recommendation.
