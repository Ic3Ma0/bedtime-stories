# ADR 002: Local Profile Switching Instead of Auth

## Status

Accepted

## Context

The app needs to support multiple people using the same device (the two co-developers / partners). Traditional solutions would introduce user authentication (OAuth, database accounts, sessions).

However, the product requirements explicitly state: "No user registration/login system." The app prioritizes privacy and simplicity.

## Decision

Implement **Local Profile Switching** — a lightweight, client-side identity system with no server-side authentication.

- Profiles are stored in `localStorage` with scoped keys (`bedtime-stories:profiles:<name>:*`)
- A dropdown selector in the UI switches the Active Profile
- Each Profile has isolated bookmarks, reading progress, and preferences
- No passwords, no server state, no external auth provider

## Consequences

### Positive

- Zero server complexity for user management
- Perfect privacy — no user data leaves the browser
- Supports the primary use case (two partners sharing a device) elegantly
- Aligns with the "no login" constraint

### Negative

- Data is tied to the browser/device — no cross-device sync
- Profile names are not secured — anyone with device access can switch profiles
- Data loss risk if browser storage is cleared

## Alternatives Considered

- **No profiles at all (pure single-user)**: Rejected. Would cause friction when co-developers test on the same device.
- **GitHub OAuth + database**: Rejected. Violates the "no login" constraint and adds server complexity prematurely.
- **Password-protected local profiles**: Rejected. Adds complexity without meaningful security benefit on a shared-trust device.
