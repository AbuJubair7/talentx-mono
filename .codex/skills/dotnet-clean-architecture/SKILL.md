---
name: dotnet-clean-architecture
description: >-
  Enforces Clean Architecture patterns for the TalentX .NET 10 backend.
  Use this skill when creating new features, domain entities, application
  commands/queries, infrastructure implementations, or API endpoints.
  Covers MediatR, FluentValidation, EF Core, and ASP.NET Core best practices.
---

<!-- Last Updated: 2026-08-27 | Rewritten against verified source. Removed Result<T>, ValueObject, DomainException, AddDomainEvent, ICommand/IQuery abstractions, ApiController base class, Bogus, and RFC 7807 — none of these exist in this codebase. -->

# TalentX Clean Architecture Skill

> **This describes the codebase as it actually is**, verified against source on 2026-08-27 — not an idealized Clean Architecture reference. If code and this skill disagree, the code wins; fix this file in the same PR.

## Project Structure
```
TalentX.slnx                  ← solution is .slnx (XML), there is NO .sln
src/
  TalentX.Domain/         → Entities, Enums, Common/BaseEntity
                            (NO value objects, NO domain events)
  TalentX.Application/    → Features/, DTOs, Validators, Interfaces, Mappings, Common/Exceptions
  TalentX.Infrastructure/ → EF Core, Repositories, Identity, Middlewares, FileStorage, Ai
  TalentX.Migrations/     → EF Core migrations live HERE
  TalentX.API/            → Controllers, DI Registration, OpenAPI   (all-caps API)
test/
  TalentX.Domain.Tests/
  TalentX.Application.Tests/
  TalentX.Infrastructure.Tests/
  TalentX.Api.Tests/          (mixed-case Api in test project names)
```
9 projects, all `net10.0`.

## Dependency Rules (STRICT)
- **Domain** → depends on NOTHING
- **Application** → depends on Domain only
- **Infrastructure** → depends on Application + Domain
- **API** → depends on Application + Infrastructure (only for DI wiring)
- **Migrations** → depends on Infrastructure (design-time only)

Migration command (note the project split):
```bash
dotnet ef migrations add <Name> -p src/TalentX.Migrations -s src/TalentX.API
```

---

## Domain Layer Rules

### Entities
- Inherit from `BaseEntity` (`Domain/Common/BaseEntity.cs`), which has **exactly three members**: `Guid Id`, `DateTime CreatedAt`, `DateTime? UpdatedAt` — note `DateTime`, not `DateTimeOffset`, and `UpdatedAt` is nullable.
- All properties use **private setters** — mutations only through intention-named methods.
- **Each mutator sets `UpdatedAt = DateTime.UtcNow` manually.** There is no interceptor doing it for you.
- **Do NOT use value objects** — there is no `ValueObject` base type, and no `Email` / `Money` / `PhoneNumber` type. Use primitives with `HasMaxLength` in the EF configuration.
- **Do NOT call `AddDomainEvent()`** — there are no domain events and no such method. Side effects belong in the Application handler.
- **Do NOT throw `DomainException`** — no such type. Validation lives in FluentValidation; failures in handlers throw an `AppException` subclass.
- Add a `private` parameterless constructor for EF Core.

Role entities use **Table-Per-Type inheritance** off the hand-rolled `User` aggregate (which is separate from Identity's `ApplicationUser`). `User.UserId` is a `string` holding the Identity `AspNetUsers.Id`. Use a **public constructor**, not a static factory:

```csharp
public sealed class Employer : User
{
    public string CompanyName { get; private set; } = string.Empty;

    private Employer() : base() { }   // EF Core

    public Employer(string userId, string name, string email, string companyName)
        : base(userId, name, email, UserRole.Employer)
    {
        CompanyName = companyName;
    }

    public void Update(string name, string companyName)
    {
        UpdateName(name);
        CompanyName = companyName;
        UpdatedAt = DateTime.UtcNow;
    }
}
```

---

## Application Layer Rules

### Commands & Queries (CQRS via MediatR)
- **There are no `ICommand` / `IQuery` / `ICommandHandler` / `IQueryHandler` abstractions.** Use raw MediatR: `IRequest<TResponse>` and `IRequestHandler<TRequest, TResponse>`.
- **There is no `Result<T>` type.** Handlers return the DTO directly (or `Unit`), and **throw** on failure.
- Failures throw from `Application/Common/Exceptions/`: `BadRequestException`, `ConflictException`, `ForbiddenException`, `NotFoundException`, `UnauthorizedException`, `UnprocessableEntityException`, `BadGatewayException`, `ValidationException`. Each carries its own `StatusCode`; `ExceptionMiddleware` maps it centrally.
- Organize by feature, one type per file: `Features/Employers/Commands/RegisterEmployer/`.
- Always take a `CancellationToken`.

```csharp
public sealed record RegisterEmployerCommand(
    string Name,
    string Email,
    string CompanyName,
    string Password
) : IRequest<RegisterEmployerResponse>;

public class RegisterEmployerCommandHandler
    : IRequestHandler<RegisterEmployerCommand, RegisterEmployerResponse>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public RegisterEmployerCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<RegisterEmployerResponse> Handle(
        RegisterEmployerCommand request,
        CancellationToken cancellationToken)
    {
        if (await _unitOfWork.Employers.EmailExistsAsync(request.Email, cancellationToken))
            throw new ConflictException("An account with this email already exists.");

        // ... build entity, persist, return the response DTO directly
    }
}
```

Reading the current principal — the established idiom:
```csharp
var employerId = _currentUserService.UserId
    ?? throw new UnauthorizedException("You must be signed in to post a job.");
```
`ICurrentUserService.UserId` returns `ClaimTypes.NameIdentifier`, i.e. the **Identity string id**, not the domain `Guid`.

### Validators
- One FluentValidation `AbstractValidator<TCommand>` per command **and** per query — no exceptions.
- Place next to the command file.
- Cover: required fields, format, max lengths, business rules.

```csharp
public sealed class RegisterEmployerCommandValidator
    : AbstractValidator<RegisterEmployerCommand>
{
    public RegisterEmployerCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
    }
}
```

### DTOs / Responses
- Suffix with `Response` or `Dto`.
- Use `sealed record` for immutability.

---

## Infrastructure Layer Rules

### EF Core
- Code-First migrations, generated into **`TalentX.Migrations`**.
- Configure entities via `IEntityTypeConfiguration<T>` — never data annotations. New configuration files need **no DI registration**: `ApplicationDbContext` calls `ApplyConfigurationsFromAssembly`.
- `ApplicationDbContext` extends `IdentityDbContext<ApplicationUser>` — Identity tables and domain tables share one context.
- Enum properties: `HasConversion<string>()` with an explicit `HasMaxLength`.
- Collections of simple strings: manual `HasConversion` to a serialized string plus a hand-rolled `ValueComparer` (see `JobConfiguration.cs:41-50`). `OwnsMany().ToJson()` is available on EF 10 but is **not** the convention here — do not introduce it without a team decision.
- `AsNoTracking()` for read-only queries.

### Referencing a user — the custom FK convention (STRICT)
Two different kinds of relationship exist, and mixing them produces a wrong migration:

- **Every reference to a user is a CUSTOM FK.** A `UserId` `string` property: `HasMaxLength(200)`, `IsRequired()`, `HasIndex(e => e.UserId)` — and **deliberately NO `HasOne(...).WithMany(...)`**, so no database constraint is emitted. The value is the Identity `AspNetUsers.Id` string, mirroring `DomainUsers.UserId`. Shipped precedent: `Jobs.EmployerId`.
- **Every other reference is a classic FK.** A `uuid` column with a real `HasOne(...).WithMany(...)` and an explicit delete behaviour.
- **Role tables (`Employers`, `Talents`)** are TPT on the shared `Id`, which *is* a real cascade FK. They carry no `UserId` of their own — they inherit it from `DomainUsers`.

```csharp
builder.ToTable("WorkExperiences");
builder.HasKey(workExperience => workExperience.Id);

builder.Property(workExperience => workExperience.UserId)
    .HasMaxLength(200)
    .IsRequired();

// Custom FK: index only. Deliberately NO HasOne/WithMany — see DB_Schema.md section 0.
builder.HasIndex(workExperience => workExperience.UserId);
```

Accepted trade-off: custom FKs are unenforced, so deleting a user leaves orphan rows. That is intentional — cleanup belongs to the GDPR account-deletion ticket. **Do not add constraints to user references** without a team decision.

After generating a migration for a user-owned table, read it and confirm the `IX_<Table>_UserId` index exists and **no** `FK_<Table>_DomainUsers_*` constraint was created. Full relationship inventory: `DB_Schema.md` section 0.

- Keep `DbContext` free of business logic.

> **Development database warning**: `DatabaseInitializer.cs:36-45` calls `EnsureDeletedAsync()` and **drops the entire database** on PostgreSQL error `42P07` / `42P01` in Development. `PendingModelChangesWarning` is suppressed (`PersistenceStartup.cs:25`), so check drift by hand with `dotnet ef migrations has-pending-model-changes`.

### Repositories
- Implement interfaces defined in the **Application** layer; register in `PersistenceStartup.cs` and surface through `IUnitOfWork`.
- **Two styles coexist**: `JobRepository` extends `RepositoryBase<T>`, while `EmployerRepository` / `UserRepository` take `ApplicationDbContext` directly. Match whichever sibling you are extending rather than converting one to the other.

### Services
- External APIs, email, storage, and token services implement Application interfaces.
- Never expose third-party types (AWS SDK, MailKit, Gemini payloads) in the Application layer.
- Sanitize any user-supplied filename with `Path.GetFileName()` before it reaches a storage key or filesystem path.

---

## API Layer Rules

### Controllers
- Inherit from **`BaseApiController`** (`src/TalentX.API/Controllers/BaseApiController.cs:7`), which extends `ControllerBase` and exposes MediatR's `Sender` resolved from `HttpContext`. **There is no type named `ApiController`** — the `[ApiController]` *attribute* is real and should still be applied; the base class is `BaseApiController`.
- Route literal is `api/v1/<resource>` (e.g. `[Route("api/v1/employers")]`). There is **no** API-versioning package and no `v{version:apiVersion}` token.
- Return the handler's value and let `ExceptionMiddleware` produce error responses. **Do not map a result object to status codes** — there is no result object.
- No business logic in controllers — only send commands/queries.
- `[AllowAnonymous]` on public endpoints, `[Authorize]` on protected. `"Employer"` and `"Talent"` Identity roles are seeded from the `UserRole` enum (`IdentitySeeder.cs:25-37`), so `[Authorize(Roles = "Talent")]` already resolves.

```csharp
[ApiController]
[Route("api/v1/employers")]
public sealed class EmployersController : BaseApiController
{
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(RegisterEmployerResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(
        RegisterEmployerCommand command,
        CancellationToken cancellationToken)
    {
        var response = await Sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }
}
```

### Error Handling
- A global `ExceptionMiddleware` (`src/TalentX.Infrastructure/Middlewares/ExceptionMiddleware.cs:59-100`) already handles everything. Do not add per-controller try/catch.
- **Response shape is `{ Message }`**, plus `{ Message, Errors[] }` for validation failures. This is **not** RFC 7807 Problem Details — there is no `ProblemDetails` usage anywhere. Do not assume or document otherwise; adopting RFC 7807 would be a deliberate refactor.
- Never expose stack traces in production — unhandled exceptions return a generic `"An unexpected error occurred."`.
- Status codes come from each `AppException` subclass, not from controller logic.

---

## Security Best Practices
- **Never log or store passwords in plain text** — use ASP.NET Core Identity's `IPasswordHasher<T>`.
- **JWT**: short-lived access tokens (15min); refresh tokens live 7 days (`JwtSettings.RefreshTokenExpiryDays`, default 7). The API returns the refresh token **in the JSON response body** — the backend writes no cookies; the Next.js server action stores it in an HttpOnly cookie.
- **Email confirmation**: generate the token via `IDataProtector` — never `Guid.NewGuid()`.
- **Rate limiting**: apply on auth endpoints to prevent brute force.
- **Input sanitization**: FluentValidation is the gate — reject before hitting domain.
- **File uploads**: validate extension, content type, **and magic bytes** (see `UploadResumeCommandValidator.cs:42-70`), then sanitize the filename with `Path.GetFileName()`.
- **Sensitive config**: `dotnet user-secrets` in development, environment variables / Azure Key Vault in production. NEVER hardcode.

---

## Testing Rules
- **xUnit** + **FluentAssertions** + **Moq**. There is **no NSubstitute** and **no Bogus** — do not add new test packages.
- Package versions drift across test projects (xUnit 2.4.2 and 2.9.3; FluentAssertions 6.12.0 and 8.10.0). **Match what the target project already references.**
- **Unit tests**: domain entity mutators, command/query handlers with mocked repositories.
- **Integration tests**: repositories against `Microsoft.EntityFrameworkCore.InMemory`.
- **API tests**: `Microsoft.AspNetCore.Mvc.Testing` is referenced. For plain controller unit tests, inject a mocked `ISender` into `DefaultHttpContext.RequestServices` — `BaseApiController` resolves `Sender` from `HttpContext` (see `ResumesControllerTests.cs:34-69`).
- Reference style: `test/TalentX.Application.Tests/Features/Jobs/Commands/CreateJob/CreateJobCommandHandlerTests.cs` — mocks as field initializers, SUT built in the constructor, a `private static ValidCommand(...)` builder mutated via record `with`, `Callback` to capture arguments, `await act.Should().ThrowAsync<T>()`, `Verify(..., Times.Once)`.
- Test naming: `MethodName_StateUnderTest_ExpectedBehavior`.
- Aim for **>80% coverage** on Application and Domain layers.

### Test Structure
```
test/TalentX.Application.Tests/
  Features/
    Employers/
      RegisterEmployerCommandHandlerTests.cs
      RegisterEmployerCommandValidatorTests.cs
```
