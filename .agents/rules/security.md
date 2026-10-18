---
name: security-rules
description: >-
  Security best practices for TalentX backend. Enforces secure coding
  patterns around authentication, secrets, data handling, and API security.
trigger: always_on
---

# TalentX Security Rules

## Secrets & Configuration
- **NEVER hardcode** secrets, API keys, passwords, or connection strings in source code.
- Use `dotnet user-secrets` in development.
- Use environment variables or a secrets manager (Azure Key Vault) in production.
- If you see a hardcoded secret, flag it and move it immediately.

## Authentication & Authorization
- All endpoints that modify data or return user-specific data MUST have `[Authorize]`.
- Use JWT Bearer tokens with short expiry (max 15 minutes).
- Refresh tokens are returned in the JSON response body.
- Always validate `iss`, `aud`, `exp`, `nbf` claims.

## Password Handling
- NEVER store, log, or compare plain-text passwords.
- Always use ASP.NET Core Identity's `IPasswordHasher<T>` (PBKDF2 with 100k iterations).
- Enforce password strength via FluentValidation (min 8 chars, upper, lower, digit, special).

## Input Validation
- Validate ALL external inputs via FluentValidation before they reach the domain.
- Never trust user-supplied IDs — verify ownership server-side.
- Use parameterized queries / EF Core — never raw string-concatenated SQL.

## Email & Token Generation
- Use `IDataProtector` or ASP.NET Core Identity's token providers for email confirmation tokens.
- Never use `Guid.NewGuid()` as a security token.

## Logging
- Never log sensitive fields: passwords, tokens, PII (emails, names in certain contexts).
- Use structured logging (Serilog) with log levels appropriately set.

## Error Handling
- Never expose stack traces or internal error details in production. The central `ExceptionMiddleware` returns `{ Message }` for handled `AppException`s and `{ Message, Errors[] }` for validation failures. This is NOT RFC 7807 Problem Details — there is no `ProblemDetails` usage in the codebase; adopting it would be a deliberate refactor.
- Map domain exceptions to appropriate HTTP status codes (400, 404, 409, etc.).

## Bitbucket & VCS Safety Rules (STRICT)
- **NEVER delete repositories**: The AI must NEVER invoke `BITBUCKET_DELETE_REPOSITORY` or execute commands that delete/destroy remote or local repositories.
- **NEVER auto-delete branches on merge**: When invoking `BITBUCKET_MERGE_PULL_REQUEST` (only upon explicit user instruction), `close_source_branch` MUST ALWAYS be set to `false`.
- **Read-Only by default**: Treat Bitbucket tools primarily as read-only. Never merge pull requests or delete issues/comments unless specifically and explicitly requested by the user.

