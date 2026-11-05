---
name: bug-fixer
description: Investigate, diagnose, and safely fix bugs in this full-stack online shop's Angular frontend, Spring Boot backend, PostgreSQL integration, configuration, authentication, and API boundaries. Use this skill whenever a user reports unexpected behavior, an exception, stack trace, runtime failure, failing test or build, API communication issue, database problem, authentication or authorization failure, asks for a root-cause analysis, or asks to implement a bug fix. Use it even when the report only hints at a frontend/backend integration problem. Do not use it for new features, broad refactors, security audits, or standalone test-writing requests without a reported defect.
compatibility: Requires repository file access. Uses Maven for backend validation and npm/Angular CLI scripts for frontend validation.
---

# Bug Fixer

Resolve reported defects with an evidence-based, minimal change. A convincing symptom is not proof of its cause: trace the relevant path before editing so the repair preserves existing behavior and does not introduce a workaround in the wrong layer.

## Establish the problem

1. Restate the observed behavior, expected behavior, affected area, and available evidence such as an error message, stack trace, request/response, test output, or reproduction steps.
2. Ask a focused question only if an essential detail prevents a meaningful investigation. Otherwise, state any bounded assumption and begin examining the repository.
3. Check the current worktree before editing. Preserve unrelated user changes and do not revert, overwrite, or format files outside the repair.

## Investigate before changing code

1. Identify the likely boundary first:
   - **Angular UI:** feature component, route/guard, service, interceptor, shared component, state signal, environment, or MSW mock.
   - **Spring Boot API:** controller, DTO/mapper, service, repository, entity, exception handler, security filter/configuration, or Flyway migration.
   - **Cross-stack:** frontend request construction, API URL and context path, endpoint mapping, DTO contract, CORS, authentication token, authorization rule, or database state.
2. Read the reported code and its direct callers, dependencies, configuration, existing tests, and related routes or endpoint contracts. Follow the flow across the UI/API boundary when the symptom involves a request or response.
3. Use source, configuration, logs, tests, and reproducible behavior as evidence. Do not guess from a class or error message in isolation.
4. Form a root-cause conclusion only when the evidence explains both the symptom and the expected behavior. If evidence instead points to environment, unavailable infrastructure, missing input, or an external dependency, state that clearly rather than making an unsupported code change.

## Choose and implement the repair

1. Explain the confirmed root cause and cite the relevant files, behavior, or command output before modifying code.
2. Propose the smallest safe change at the layer that owns the defect. Keep controllers on DTO boundaries, business rules in services, persistence in repositories/entities/migrations, and Angular behavior inside the appropriate feature or shared layer.
3. Follow the repository's existing patterns:
   - Use standalone Angular components, signals, lazy feature boundaries, existing routes/guards/interceptors, and Prettier formatting.
   - Use Spring DTOs and mappers at REST boundaries, the service layer for business logic, JPA repositories for persistence, the project's exception handling, and Flyway for schema/data evolution.
4. Add or update a focused regression test when the defect has a testable behavior and an appropriate test location already exists. Do not add a test that merely repeats implementation details. If a test is impractical, explain why.
5. Do not modify unrelated files, weaken validation, authorization, CORS, authentication, or exception handling merely to hide a failure. Never expose or add credentials, tokens, or secrets. Do not commit or push unless the user explicitly requests it.

## Validate proportionally

Run the narrowest applicable checks after the repair, escalating only when needed:

| Affected area | First validation |
|---|---|
| Spring Boot test | `mvn test -Dtest=<TestClassName>` from `onlineshopapi` |
| Spring Boot production change without a targeted test | `mvn test` from `onlineshopapi` |
| Angular test | Run the focused existing test when supported; otherwise `npm test` from `onlineshopui` |
| Angular source, templates, or styling | `npm run lint` or `npm run build` from `onlineshopui`, choosing the smallest relevant configured check |
| API/UI integration, security, database, or configuration | Run the directly relevant backend and frontend checks; report any required service or environment that was unavailable |

Report command outcomes exactly. If validation cannot run or fails for an unrelated baseline/infrastructure reason, do not claim the fix is verified; describe the blocker and the validation still needed.

## Response format

Use this structure once the investigation is complete:

1. **Root cause** — evidence-backed explanation of why the defect occurred.
2. **Fix** — minimal repair and why it addresses the cause.
3. **Changed files** — each modified path with its purpose, including regression tests when added.
4. **Verification** — commands run, results, and remaining limitations or blockers.

For a report-only root-cause request, provide the same structure without code changes and explicitly state that no files were modified.
