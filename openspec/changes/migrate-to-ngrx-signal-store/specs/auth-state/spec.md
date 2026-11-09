# Spec Delta

## Purpose

Provides application-wide authentication state for JWT persistence, profile hydration, authentication status, and role-based frontend integration while preserving the existing stateless backend contract.

## ADDED Requirements

### Requirement: Authentication state has one application-wide owner
The system SHALL expose one shared authentication state across app initialization, HTTP interception, guards, role directives, navigation, and authentication pages.

#### Scenario: Consumers share authentication state
- **WHEN** the interceptor, a guard, and a component read authentication state during one application session
- **THEN** they observe the same token, user, authentication status, and roles

#### Scenario: Lazy routes do not create a second auth state
- **WHEN** a protected lazy route is activated after authentication state has been initialized
- **THEN** the route consumer uses the existing application authentication state

### Requirement: Token storage remains compatible
The system SHALL persist and hydrate the JWT using the existing `access_token` browser-storage key and SHALL provide a synchronous token read for outgoing HTTP authorization.

#### Scenario: Existing token is hydrated
- **WHEN** the application starts with a non-empty `access_token`
- **THEN** authentication state exposes that token synchronously before authenticated requests are made

#### Scenario: Login stores a token
- **WHEN** login succeeds with a token
- **THEN** the token is stored under `access_token` and subsequent authenticated requests can read it

#### Scenario: Logout removes a token
- **WHEN** logout is requested
- **THEN** the token and persisted `access_token` are cleared

### Requirement: Profile hydration establishes user and roles
The system SHALL load the authenticated profile when a valid token exists, expose the user and role state, and preserve the existing profile error behavior.

#### Scenario: Profile loads after token hydration
- **WHEN** application initialization finds an access token and profile loading succeeds
- **THEN** the current user, authenticated status, and declared roles become available to consumers

#### Scenario: Profile loading fails
- **WHEN** profile loading fails after token hydration
- **THEN** authentication state records the error, completes loading, and does not expose a falsely authenticated user

#### Scenario: Cached profile is reused
- **WHEN** profile state is already loaded and another consumer requests initialization
- **THEN** the system does not issue an unnecessary duplicate profile request

### Requirement: Authentication operations preserve error propagation
The system SHALL expose login, registration, and logout operations with the existing success, navigation, and error contracts.

#### Scenario: Login succeeds
- **WHEN** valid credentials are submitted
- **THEN** the token is persisted, profile state is hydrated, and the existing post-login navigation behavior occurs

#### Scenario: Login fails
- **WHEN** the backend rejects credentials
- **THEN** the operation exposes the HTTP error to its caller and records the authentication error without creating authenticated state

#### Scenario: Registration succeeds
- **WHEN** valid registration data is submitted
- **THEN** the existing registration success and navigation behavior occurs without changing role semantics

### Requirement: Role checks remain equivalent
The system SHALL derive authentication and role checks from the shared user/token state using the application's existing role names and guard behavior.

#### Scenario: Authorized role is present
- **WHEN** a consumer checks for a role held by the current user
- **THEN** the role check returns true

#### Scenario: Unauthorized role is absent
- **WHEN** a guard or directive checks for a role not held by the current user
- **THEN** the role check returns false and the existing access behavior is preserved
