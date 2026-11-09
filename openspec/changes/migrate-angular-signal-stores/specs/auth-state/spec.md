# Spec Delta

## Purpose

Provides one consistent authentication state for token persistence, profile hydration, role-based access, and all application auth boundaries without changing existing JWT or navigation behavior.

## ADDED Requirements

### Requirement: Authentication state is shared across the application

All authentication consumers SHALL observe one consistent feature state for the current token, user profile, authentication status, and roles, including the HTTP interceptor, guards, directives, app initializer, navbar, and auth pages.

#### Scenario: Consumers observe the same authenticated state

- **WHEN** a successful login stores a token and loads a profile
- **THEN** the interceptor, guards, directive, navbar, and auth pages observe the same token, user, authentication status, and roles without a second independent auth state

### Requirement: Token hydration preserves the existing browser contract

The authentication state SHALL read and write the token using the `access_token` localStorage key, tolerate a non-browser runtime by using no token, and expose token access synchronously for outgoing HTTP requests.

#### Scenario: Existing token is hydrated on application startup

- **GIVEN** localStorage contains a value under `access_token`
- **WHEN** the authentication state is created
- **THEN** synchronous token access returns that value and authentication is considered active before an HTTP request is sent

#### Scenario: Browser storage is unavailable

- **GIVEN** the application is running without a browser `window`
- **WHEN** authentication state is initialized
- **THEN** it starts without a token and does not throw while reading storage

### Requirement: Login hydrates the authenticated profile

The login flow SHALL send the existing credentials payload, persist the returned `access_token`, request the current profile, expose the user and role, and preserve HTTP errors for the caller.

#### Scenario: Login succeeds

- **WHEN** `POST /auth/login` returns an access token and `GET /auth/profile` returns a user
- **THEN** the token is persisted, the user is available, authentication is true, the role is available, and the login operation completes with the profile

#### Scenario: Login is rejected

- **WHEN** `POST /auth/login` returns an HTTP error
- **THEN** the error propagates to the caller and the authentication state is not reported as successfully logged in

### Requirement: Profile hydration is idempotent

The profile-loading flow SHALL return no user when no token exists, fetch the profile when a token exists without a loaded profile, and return the cached profile without another request after successful hydration.

#### Scenario: Profile is loaded for a hydrated token

- **GIVEN** a token exists and the profile has not been loaded
- **WHEN** profile hydration runs
- **THEN** exactly one `GET /auth/profile` request populates the cached user and marks the profile loaded

#### Scenario: Loaded profile is reused

- **GIVEN** the profile has already been loaded
- **WHEN** another auth boundary requests profile hydration
- **THEN** the cached profile is returned without another profile request

### Requirement: Logout clears authentication state

Logout SHALL remove `access_token`, clear the current user and profile-loaded state, make authentication and roles inactive, and preserve navigation to the existing login route.

#### Scenario: Authenticated user logs out

- **WHEN** logout is invoked
- **THEN** the token is removed from storage, the user is cleared, roles become empty, authentication becomes false, and navigation targets the login page

### Requirement: Role checks preserve route and view authorization behavior

Role checks SHALL continue to support a single required role or an array of required roles, use the hydrated profile when needed, and preserve existing guard/directive outcomes for authenticated and unauthenticated users.

#### Scenario: User has the required role

- **GIVEN** the hydrated user has every required role
- **WHEN** a role guard or role directive evaluates access
- **THEN** the route is allowed or the protected view is rendered

#### Scenario: User lacks the required role

- **GIVEN** the hydrated user lacks a required role
- **WHEN** a role guard or role directive evaluates access
- **THEN** the route redirects to the products overview or the protected view is not rendered

