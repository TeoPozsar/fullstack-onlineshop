---
name: feature-implementer
description: Plan and implement new features in this full-stack online shop across its Angular frontend, Spring Boot backend, PostgreSQL schema, authentication, authorization, and API boundaries. Use this skill whenever a user asks to add a page, component, form, user flow, API endpoint, service, business rule, entity, relationship, migration, admin capability, authentication or authorization behavior, frontend-to-backend integration, or a feature spanning multiple application layers. Use it for extending existing behavior with new requirements even when the user does not explicitly call it a "feature." Do not use it for diagnosing an existing bug, broad refactors, security audits, or standalone test-writing requests.
compatibility: Requires repository file access. Uses Maven for backend validation and npm/Angular CLI scripts for frontend validation.
---

# Feature Implementer

Deliver features as a coherent extension of the existing application. Understand the user-visible outcome and the data/API flow before editing so that every layer owns its appropriate responsibility and the change remains small enough to review safely.

## Understand and plan

1. Restate the requested user behavior, users or roles, acceptance criteria, affected data, and expected UI/API outcome.
2. Ask focused questions only for requirements that would materially change the design: authorization, validation rules, persistence, API compatibility, failure behavior, or ambiguous user interactions. State bounded assumptions when the user has supplied enough information to proceed.
3. Inspect the nearest existing feature before designing:
   - Angular route, standalone component, form, service, types, shared UI component, and relevant tests.
   - Spring controller, DTO, mapper, service, repository, entity, exception handler, security rule, migration, and relevant tests.
   - Existing API contracts and frontend environment/mock behavior when the feature crosses the UI/API boundary.
4. Present a concise implementation plan before editing. Include the layers and files likely to change, data/API contract changes, authorization/validation behavior, tests, and validation commands. This makes the scope reviewable and catches missing layers before implementation begins.

## Implement by responsibility

1. Build the smallest vertical slice that satisfies the feature, then complete dependent layers in a deliberate order. Reuse an existing component, service, DTO, mapper, route, guard, or test pattern when it already fits.
2. Keep boundaries clear:
   - **Angular:** use standalone components, feature-based lazy routes, signals for local reactive state, existing shared components/services, typed DTOs, and configured guards/interceptors.
   - **Spring Boot:** keep controllers at REST/DTO boundaries, map with existing mappers, keep business rules in services, and use repositories for persistence.
   - **Database:** make schema or seed-data changes with a new Flyway migration; do not modify an applied migration.
   - **Cross-stack:** change frontend types, requests, responses, mock handlers, backend DTOs/mappers/endpoints, and API documentation together when the contract changes.
3. Apply validation and authorization where the business rule belongs. Preserve JWT handling, role checks, CORS boundaries, and server-owned security decisions; never trust a client-supplied role or use a permissive shortcut merely to unblock a feature.
4. Make incremental, cohesive edits. Do not refactor unrelated code, rename unrelated files, alter formatting outside touched code, expose secrets, or commit or push unless the user explicitly requests it.

## Test and verify

1. Add or update focused tests for introduced behavior, important validation failures, role restrictions, and API contract changes. Use existing test conventions rather than adding dependencies or a broader test level without need.
2. Run the narrowest checks that cover the change:

| Affected area | First validation |
|---|---|
| Spring service/controller/repository | `mvn test -Dtest=<TestClassName>` from `onlineshopapi`, then broaden only if needed |
| Angular component/service/guard | Run the focused existing test when supported; otherwise `npm test` from `onlineshopui` |
| Angular templates, source, or styling | `npm run lint` or `npm run build` from `onlineshopui`, choosing the smallest relevant configured check |
| Migration, API contract, auth, or full-stack feature | Run directly relevant backend and frontend checks; report any unavailable database, API, or environment |

3. Report command results exactly. If validation is blocked or fails because of an unrelated pre-existing issue, explain the blocker and the remaining verification rather than claiming success.

## Response format

Use this structure after implementation:

1. **Approach** — feature behavior, key assumptions, and the chosen design.
2. **Plan** — concise implementation steps, provided before code changes.
3. **Changes** — modified files and what each contributes.
4. **Important decisions** — only meaningful contract, validation, authorization, migration, or reuse choices.
5. **Verification** — tests/builds run, outcomes, and remaining limitations or blockers.
