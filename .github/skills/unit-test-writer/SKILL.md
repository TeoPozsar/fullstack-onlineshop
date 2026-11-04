---
name: unit-test-writer
description: Generate or improve focused unit tests for the Spring Boot backend in this online shop. Use this skill whenever a user asks to write, create, generate, add, or improve JUnit, Mockito, or service-level unit tests for `onlineshopapi`, including requests to test success paths, edge cases, or exceptions. Do not use it for production bug fixes, feature implementation, general debugging, or integration-test requests unless the user explicitly asks for unit tests as part of that work.
compatibility: Requires repository file access and Maven. Run tests with `mvn test` from `onlineshopapi`; this repository currently has no Maven wrapper.
---

# Unit Test Writer

Create maintainable, independent unit tests for the Spring Boot backend without changing production code unless the user explicitly asks for it. Match the repository's existing conventions so new tests read like the tests already present.

## Establish context

1. Accept a Java class, source snippet, or repository-relative path, plus any behavior the user wants covered.
2. Read the class under test and inspect its constructor dependencies, public methods, relevant models, DTOs, repositories, exceptions, and existing tests before drafting code.
3. If an essential business rule, expected exception, or externally observable outcome is unclear, ask a focused clarification question before writing the test.
4. Determine the appropriate test level:
   - For isolated service or strategy behavior, write a unit test under `src/test/java/msg/onlineshopapi/unit/...` using Mockito.
   - Do not turn a unit-test request into a Spring context or Testcontainers test. Those are integration-test patterns in this project and require explicit user intent.

## Follow project conventions

- Use JUnit 5 with `@ExtendWith(MockitoExtension.class)`, `@Mock`, and `@InjectMocks` for isolated classes with collaborators.
- Use AssertJ static imports such as `assertThat` and `assertThatThrownBy`.
- Name test methods as `methodName_expectedOutcome_whenCondition`, as in the existing strategy tests.
- Keep each test focused on one scenario. Use Arrange-Act-Assert ordering, with blank lines separating the phases instead of explanatory comments.
- Create concise private fixture helpers only when they remove repeated model construction and keep test intent clear.
- Stub only calls required to reach the behavior under test. Verify collaborator interactions only when those interactions are part of the observable contract or protect an important side effect.
- Test public behavior and resulting state; do not test private methods directly.
- Keep test data local to each test unless a small helper improves clarity. Do not share mutable state across tests.
- Use the Maven dependencies already provided by the project. Do not add test libraries or modify the POM unless explicitly requested.

## Plan before coding

Before creating or presenting a test class, briefly provide:

1. **Class behavior and dependencies** — identify the public behavior being tested and collaborators to mock.
2. **Proposed scenarios** — include successful execution, meaningful boundary or edge cases, and expected exceptions that are supported by the implementation or stated requirements.
3. **Assumptions** — identify any behavior inferred from the source rather than specified by the user.

Do not invent validation behavior or error cases absent from the source and user requirements.

## Implement and validate

1. Create or update the focused test class in the matching `unit` package.
2. Provide complete, compilable Java test code rather than fragments.
3. Run the narrowest applicable Maven test command from `onlineshopapi`:
   ```bash
   mvn test -Dtest=<TestClassName>
   ```
   If the target test cannot be selected reliably, run:
   ```bash
   mvn test
   ```
4. Report whether the command passed. If it failed, state the failure and its likely cause without masking it or changing production code.

## Response format

Use this structure after analysis:

1. **Analysis** — class behavior and mocked dependencies.
2. **Test scenarios** — concise list of planned cases.
3. **Test code** — created file path and complete code, or a note that the file was updated.
4. **Test results** — exact Maven command and pass/fail outcome.
5. **Assumptions or uncovered cases** — only meaningful gaps.

