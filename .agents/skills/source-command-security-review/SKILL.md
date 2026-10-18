---
name: "source-command-security-review"
description: "Migrated source command `security-review`"
---

# source-command-security-review

Use this skill when the user asks to run the migrated source command `security-review`.

## Command Template

<!-- Last Updated: 2026-08-14 | Added: logging check, SQL check, GDPR check, rate-limiting check, job visibility check, resume validation check -->
Perform a security review of the current codebase changes:

1. Check for hardcoded secrets, API keys, or connection strings
2. Verify all passwords use IPasswordHasher<T> — never plain text
3. Confirm email tokens use IDataProtector — never Guid.NewGuid()
4. Verify JWT tokens have max 15min expiry
5. Check refresh tokens are in HttpOnly, Secure, SameSite=Strict cookies
6. Confirm all external inputs go through FluentValidation
7. Verify no sensitive data in logs (passwords, tokens, PII) [EXISTING — unverified]
8. Check that duplicate email returns 409, not 400
9. Verify all error responses flow through the central `ExceptionMiddleware` contract — `{ Message }`, plus `Errors[]` on validation failures — and leak no stack traces. This codebase does NOT use RFC 7807 Problem Details; do not flag its absence as a defect.
10. Ensure [Authorize] on all protected endpoints, [AllowAnonymous] only on public ones
11. Confirm parameterized queries / EF Core — no raw SQL string concatenation [EXISTING — unverified]
12. Check GDPR compliance: PII encrypted at rest, no unencrypted personal data stored [BRD §7]
13. Verify rate limiting is applied on all auth endpoints (login, register, password reset) [BRD §7]
14. Confirm only `Published` jobs are returned in public-facing job listing queries [TX26-192]
15. Verify resume upload validates file type and size before passing to AI extraction [TX26-194]

Report findings with severity (Critical/Warning/Info) and remediation steps.
