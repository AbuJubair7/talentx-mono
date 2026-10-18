---
name: clean-code-standards
description: Enforces clean coding standards across TalentX backend and frontend. Eliminates unnecessary, restating, or redundant comments; enforces meaningful, full descriptive variable and identifier naming (strictly bans lazy abbreviations like 'tokenRes', 'res', 'temp', 'data1'); and standardizes clean, developer-friendly structured logging without ASCII art or emojis. Always activate when writing, refactoring, or reviewing code.
---

# Clean Code, Naming & Logging Standards

## Overview & Core Philosophy
Code must be self-documenting. If code requires a comment to explain **what** it is doing, the code itself is poorly named or structured. Focus effort on **crystal-clear, intention-revealing variable and function names** and **delete redundant comments**.

---

## 1. Comment Elimination Policy (STRICT)

### 🚫 Forbidden Comments (Never Write / Always Delete)
1. **Restating the Code (Noise Comments)**:
   ```csharp
   // ❌ BAD: Restates what the method call already says
   // Update profile with submitted details and mark verified
   existingEmployer.Update(request.Name);
   existingEmployer.UpdateCompany(request.CompanyName);
   existingEmployer.MarkAsVerified();

   // ❌ BAD: Obvious action
   // Mint JWT access and refresh tokens for immediate logged-in session
   var tokenResult = await _tokenService.CreateAsync(employer.UserId);

   // ❌ BAD: Boilerplate comment
   // Handler for CreateEmployerCommand to register user in Identity
   public sealed class CreateEmployerCommandHandler ...
   ```
   ```csharp
   // ✅ GOOD: Clean self-documenting code with NO comments
   existingEmployer.Update(request.Name);
   existingEmployer.UpdateCompany(request.CompanyName);
   existingEmployer.MarkAsVerified();
   _unitOfWork.Employers.Update(existingEmployer);
   await _unitOfWork.SaveChangesAsync(cancellationToken);

   var existingTokenResult = await _tokenService.CreateAsync(existingEmployer.UserId);
   ```

2. **Redundant XML Doc Comments on Internal Classes**:
   - Do NOT add boilerplate `/// <summary>` comments on internal/private handlers, validators, or obvious classes if they merely repeat the class name.
   - Public library interfaces and external API contracts may have concise XML docs, but internal CQRS handlers must remain clean and uncluttered.

3. **TODO / Fixme Comments in Committed Code**:
   - Never commit `// TODO` or `// FIXME` comments into main/dev branches. Track work via Jira tickets (`TX26-XXX`).

### ✅ Allowed Comments (Use Sparingly)
Only write an inline comment if:
- **Explaining the "Why" (Non-obvious business/domain rule)**:
  ```csharp
  // Table-Per-Type mapping: Employer table shares PK with DomainUsers to avoid data duplication
  builder.ToTable("Employers");
  ```
- **Explaining a Vendor Bug Workaround**:
  ```csharp
  // Workaround for Npgsql v10.0 lock contention during parallel migration startup
  await db.Database.ExecuteSqlRawAsync(...);
  ```

---

## 2. Descriptive Variable & Identifier Naming (STRICT)

Every variable, local, parameter, and function must clearly reveal its intention and type context.

### 🚫 The Ban List (Never Use These Abbreviations)
| Banned Lazy Name | Why It's Bad | Required Full Descriptive Name |
| :--- | :--- | :--- |
| `res` / `tokenRes` | Ambiguous abbreviation | `tokenResult`, `tokenResponse`, `identityResult`, `apiResponse` |
| `req` | Ambiguous abbreviation | `command`, `query`, `signupRequest`, `httpRequest` |
| `err` / `e` | Lazy error handling | `error`, `exception`, `validationError` |
| `temp` / `tmp` | Lazy scratch variable | `temporaryPassword`, `unverifiedEmployer`, `sanitizedEmail` |
| `data` / `val` | Meaningless container | `employerProfile`, `createdJobId`, `rawTokenPayload` |
| `cb` | Cryptic abbreviation | `callback`, `onSuccessCallback`, `predicate` |
| `d` / `u` / `x` | Single letter variables | `digit`, `currentUser`, `roleClaim` (allowed only in tiny lambda e.g. `x => x.Id`) |

### ✅ Good Naming Patterns (Backend & Frontend)

#### C# Backend
```csharp
// ❌ BAD
var existingEmployer = await _unitOfWork.Employers.GetByEmailAsync(request.Email, cancellationToken);
var tokenRes = await _tokenService.CreateAsync(existingEmployer.UserId);
var res = await _identityService.CreateApplicationUserAsync(request.Email, request.Password, UserRole.Employer);

// ✅ GOOD
var existingEmployer = await _unitOfWork.Employers.GetByEmailAsync(request.Email, cancellationToken);
var existingTokenResult = await _tokenService.CreateAsync(existingEmployer.UserId);
var identityCreationResult = await _identityService.CreateApplicationUserAsync(request.Email, request.Password, UserRole.Employer);
```

#### TypeScript / Next.js Frontend
```typescript
// ❌ BAD
const { mutate: fn, isPending: p, error: err } = useVerifyOtp()
const submit = (d: string) => { ... }
const [val, setVal] = useState<string[]>([])

// ✅ GOOD
const { mutate: verifyOtp, isPending: isVerifyingOtp, error: verifyOtpError } = useVerifyOtp()
const submitVerificationCode = (fullOtpCode: string) => { ... }
const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
```

---

## 3. Developer-Friendly Structured Logging (No Emojis)

Log messages must be professional, clean, structured, and developer-friendly. **Never use emojis in logs.**

### 🚫 Forbidden Logging Practices
- **STRICTLY NO EMOJIS**: Never use emojis like `🔑`, `⚠️`, `✅`, `👉`, `⏳`, `🚀` in any log messages.
- **NO ASCII art / box banners**: Never use multi-line ASCII boxes or lines (`====`) that pollute terminal output and break structured logging collectors (e.g. Datadog, Serilog, CloudWatch).

### ✅ Standard Structured Logging Formats
```csharp
// ✅ GOOD: Standard, clean, developer-friendly structured template
if (_environment.IsDevelopment())
{
    _logger.LogInformation("OTP generated for {Email}: {OtpCode} (expires in {ExpiryMinutes} minutes)", email, otpCode, expiryMinutes);
}
else
{
    _logger.LogInformation("OTP generated for {Email} (expires in {ExpiryMinutes} minutes)", email, expiryMinutes);
}

// Clean warnings and info without emojis
_logger.LogWarning("OTP verification failed for {Email}: code mismatch", email);
_logger.LogWarning("OTP verification failed for {Email}: no active OTP record found", email);
_logger.LogWarning("OTP verification failed for {Email}: code expired", email);
_logger.LogInformation("OTP verified for {Email}", email);
```

---

## 4. Pre-Commit / Pre-PR Self Check

Before marking code complete or opening a PR, perform this quick audit:

1. [ ] **Noise Comments**: Are there any comments describing what the next 2 lines of code do? **Delete them.**
2. [ ] **XML Docs**: Are there redundant XML comments on internal handlers/validators? **Delete them.**
3. [ ] **Abbreviated Names**: Did I write `tokenRes`, `res`, `err`, `req`, `tmp`, or `data`? **Rename to full descriptive nouns.**
4. [ ] **No Emojis in Logs**: Did I check that zero emojis exist in all `LogInformation`, `LogWarning`, and `LogError` strings? **Yes.**
5. [ ] **Clean Structured Logs**: Are logs clean, readable, and properly parameterized (e.g. `{Email}`)? **Yes.**
6. [ ] **Security in Logs**: Are passwords, tokens, or PII masked or restricted to dev environment only? **Yes.**
