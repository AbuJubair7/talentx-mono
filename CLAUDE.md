<!-- Last Updated: 2026-08-27 | Verified against code: project names, solution file, migrations project, error handling, controller base, test framework, entity pattern, frontend versions. Corrected 12 inaccuracies. -->

# TalentX Backend — Claude Code Instructions

> **Accuracy rule**: every technical claim below was verified against the actual source on 2026-08-27. If code and this document ever disagree, **the code wins** — fix this document in the same PR.

## Project Overview
- **Backend Stack**: C# 13 / .NET 10, ASP.NET Core, EF Core (Npgsql/PostgreSQL), MediatR, FluentValidation, AutoMapper (Clean Architecture)
- **Frontend Stack**: Next.js 16.3.0 (App Router), React 19.2.8, TypeScript, Tailwind CSS v4, shadcn/ui (`base-nova` style on `@base-ui/react` — **not** Radix), TanStack React Query
- **Frontend Design & Routing Standard**: TalentX Design System (see `DESIGN.md` and `.agents/rules/frontend-design.md`) — high-contrast B2B recruitment UI, split-screen auth, and card-based discovery
- **Test Framework**: xUnit + FluentAssertions + **Moq** (Backend) / Jest 30 + React Testing Library (Frontend)

## Project Structure
```
TalentX.slnx                  ← solution is .slnx (XML), there is NO .sln
src/
  TalentX.Domain/         → Entities (no value objects, no domain events)
  TalentX.Application/    → Features/, Commands, Queries, DTOs, Validators, Interfaces
  TalentX.Infrastructure/ → EF Core, Repositories, Identity, Middlewares, External Services
  TalentX.Migrations/     → EF Core migrations live HERE, not in Infrastructure
  TalentX.API/            → Controllers, DI, OpenAPI   (all-caps API)
test/
  TalentX.Api.Tests/          (note: mixed-case Api in test project names)
  TalentX.Application.Tests/
  TalentX.Domain.Tests/
  TalentX.Infrastructure.Tests/
```
9 projects total, all targeting `net10.0`.

## Dependency Rules (STRICT — never violate)
- Domain → depends on NOTHING
- Application → depends on Domain only
- Infrastructure → depends on Application + Domain
- API → depends on Application + Infrastructure (only for DI wiring)
- Migrations → depends on Infrastructure (design-time only)

## Build & Run Commands
```bash
dotnet build                              # Build full solution (TalentX.slnx)
dotnet run --project src/TalentX.API      # Run API
dotnet test                               # Run all tests

# Migrations live in TalentX.Migrations (see PersistenceStartup.cs:24 MigrationsAssembly)
dotnet ef migrations add <Name> -p src/TalentX.Migrations -s src/TalentX.API
dotnet ef database update -p src/TalentX.Migrations -s src/TalentX.API

# PendingModelChangesWarning is SUPPRESSED (PersistenceStartup.cs:25) — check drift manually:
dotnet ef migrations has-pending-model-changes -p src/TalentX.Migrations -s src/TalentX.API
```

> **Development database warning**: `DatabaseInitializer.cs:36-45` calls `EnsureDeletedAsync()` and **drops the entire database** when it hits PostgreSQL error `42P07` / `42P01` in Development. Always apply migrations explicitly before running the API; never rely on auto-create.

## Code Standards (Always Follow)

### Naming (STRICT)
- Classes/Methods/Records: `PascalCase`
- Private fields: `_camelCase`
- Parameters/locals: `camelCase` — MUST be full descriptive nouns (Strictly ban lazy abbreviations: `tokenRes`, `res`, `req`, `err`, `e`, `tmp`, `data`, `val`, `cb`)
- Interfaces: `IPascalCase`
- Test methods: `MethodName_State_ExpectedResult`

### Code Style
- Use `sealed` on classes not designed for inheritance
- Use `record` for DTOs, `class` for entities/services
- Always include `CancellationToken` on async methods
- Return `Task` not `void` for async (except event handlers)
- Nullable enabled — handle all warnings, never suppress
- Use C# 13 / .NET 10 features where appropriate (primary constructors, collection expressions)
- Prefer expression bodies only for single-line members
- **No Magic Numbers (STRICT)**: Never hardcode numeric business limits, counts, or thresholds inline in application handlers or tests. Declare them in dedicated constant classes organized by feature under `Features/{Feature}/Constants/` (e.g. `EmployerDashboardConstants.RecentJobsLimit = 5`).
- **Reuse Existing Shared Abstractions**: Never create duplicate constant files if a shared abstraction exists (e.g. reuse `PaginationRequest` in `TalentX.Application.Common.Models` for shared pagination parameters).
- **No Hardcoded Parameter Defaults (STRICT)**: Never hardcode raw literals or magic values directly in method, function, or constructor parameters (e.g. `int count = 5`, `int pageSize = 10`, `int page = 1`, `string role = "Talent"`). Always reference dedicated constants (e.g. `EmployerDashboardConstants.RecentJobsLimit`, `PaginationRequest.DefaultPageSize`, `PaginationRequest.DefaultPageNumber`).
- **Maximum 5 Parameters Limit (STRICT — Parameter Object Pattern)**: Methods, functions, queries, and constructors must **never exceed 5 parameters**. Whenever an operation requires more than 5 parameters, you MUST encapsulate them into a dedicated typed parameter object, record, or DTO (e.g. `EmployerJobsQueryParams`, `JobSearchCriteria`, `CreateJobParameters`).

### Comments & Documentation (STRICT)
- **NO Noise Comments**: Never write comments that merely restate what code does (`// Update profile`, `// Mint tokens`, `// Return response`)
- **NO Boilerplate XML Docs**: Do not write redundant `/// <summary>` comments on internal handlers/validators that repeat the class name
- Inline comments ONLY when the "why" is non-obvious (complex domain rule, vendor workaround)
- Remove TODO/FIXME comments before committing (use Jira tickets instead)

### Logging Standards (STRICT — Developer-Friendly, NO Emojis)
- **STRICTLY NO EMOJIS**: Never use emojis (`🔑`, `⚠️`, `✅`, `👉`, `⏳`) in any log messages
- **NO ASCII art or box banners**: No multi-line boxes (`====`) in log outputs
- **Clean Structured Logging**: Use readable, parameterized templates: `_logger.LogInformation("OTP generated for {Email} (expires in {ExpiryMinutes}m)", email, expiryMinutes);`
- Mask sensitive data in production logs — never log the OTP code, token, or password itself

### File Organization (STRICT)
- **One class/interface/record per file (STRICT)**: Never declare auxiliary classes, DTOs, request records, or payload shapes inside controller or handler files. Every type must live in its own dedicated file matching its name exactly.
- File name must match type name exactly
- Organize by feature: `Features/Employers/` not `Commands/` + `Handlers/`

## Security Rules (Never Violate)
- NEVER hardcode secrets, API keys, passwords, or connection strings
- Use `dotnet user-secrets` in dev; environment variables / Azure Key Vault in prod
- NEVER store or log plain-text passwords — use `IPasswordHasher<T>`
- JWT access tokens: max 15min expiry. **Transport reality**: the API returns the refresh token in the JSON response body (`AuthController.cs:31,47`); the Next.js server action then stores it in an HttpOnly cookie (`modules/auth/shared/cookie-config.ts`). Never expose either token to client-side JavaScript.
- FluentValidation is the gate — validate ALL external inputs before domain
- Never expose stack traces in production. **Error shape reality**: `ExceptionMiddleware` (`src/TalentX.Infrastructure/Middlewares/ExceptionMiddleware.cs:59-100`) returns `{ Message }` for handled `AppException`s and `{ Message, Errors[] }` for validation failures. This is **not** RFC 7807 Problem Details — do not claim or assume `ProblemDetails`; there is no `ProblemDetails` usage in the codebase. If the team wants RFC 7807, that is a deliberate refactor, not an assumption.
- Duplicate email → `409 Conflict` (`ConflictException`), not `400 Bad Request`
- Email confirmation tokens via `IDataProtector`, never `Guid.NewGuid()`
- Never log sensitive fields: passwords, tokens, PII
- Use parameterized queries / EF Core — never raw string-concatenated SQL
- Sanitize any user-supplied filename before it reaches a storage key or filesystem path. **For Talent media/resume storage keys, use `TalentMediaStorageKeyGuard.SanitizeFileNameSegment`/`BuildStorageKey`, not `Path.GetFileName()`** — `Path.GetFileName()` only treats `\` as a path separator on Windows, not Linux/macOS (where this API runs), so it produces different sanitized output depending on the runtime OS; `SanitizeFileNameSegment` strips both `/` and `\` deterministically on every OS (fixed in TX26-231 after this exact OS-dependent divergence was found). `Path.GetFileName()` remains correct for other, non-Talent-storage-key filename sanitization elsewhere in the codebase.
- Google OAuth supported alongside email/password auth [BRD §4.1, TX26-191]
- GDPR-compliant handling of personal data — encrypt PII at rest [BRD §7]
- Rate limiting on all auth endpoints to prevent brute force [BRD §7]
- `Job.Status` must be `Published` before job is visible to public [TX26-192]
- Resume file type and size validated before AI extraction pipeline [TX26-194]

## Clean Architecture Patterns

### Domain Entities
`BaseEntity` (`src/TalentX.Domain/Common/BaseEntity.cs`) has exactly three members: `Guid Id`, `DateTime CreatedAt`, `DateTime? UpdatedAt`. **There are no domain events, no `AddDomainEvent`, and no value objects anywhere in the solution.** Do not write code that calls them.

Users are modeled as **Table-Per-Type inheritance** off a hand-rolled `User` aggregate (which is separate from ASP.NET Identity's `ApplicationUser`). `User.UserId` is a `string` holding the Identity `AspNetUsers.Id`. Role subtypes use a public constructor, not a static factory, and set `UpdatedAt` manually:

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

Persistence config sets `ToTable("Employers")` and EF derives the TPT link on the shared `Id`. Collections of simple strings are mapped with a manual `HasConversion` + `ValueComparer` pair (see `JobConfiguration.cs:41-50`); `OwnsMany().ToJson()` is available on EF 10 but is **not** the convention here. New `IEntityTypeConfiguration<T>` files need no DI registration — `ApplicationDbContext` calls `ApplyConfigurationsFromAssembly`.

### Referencing a user — the custom FK convention (STRICT)
This schema uses **two different kinds of relationship**, and mixing them up produces a wrong migration:

- **Every reference to a user is a CUSTOM FK**: a `UserId` `string` property, `HasMaxLength(200)`, `IsRequired()`, plus `HasIndex(e => e.UserId)` — and **deliberately NO `HasOne(...).WithMany(...)`**, so no database constraint is emitted. The value is the Identity `AspNetUsers.Id` string, mirroring `DomainUsers.UserId`. The shipped precedent is `Jobs.EmployerId`.
- **Every other reference is a classic FK**: a `uuid` column with a real `HasOne(...).WithMany(...)` and an explicit delete behaviour.
- **Role tables (`Employers`, `Talents`) are the exception that proves the rule** — their TPT link on the shared `Id` *is* a real cascade FK. They carry no `UserId` of their own; they inherit it from `DomainUsers`.

Accepted trade-off: custom FKs are unenforced, so deleting a user leaves orphan rows. That is intentional; cleanup belongs to the GDPR account-deletion ticket. **Do not add constraints to user references** without a team decision. Full relationship inventory: `DB_Schema.md` §0.

After generating a migration for a user-owned table, read it and confirm the `IX_<Table>_UserId` index exists and **no** `FK_<Table>_DomainUsers_*` constraint was created.

### Repositories (STRICT — CRUD only, keep them light)
Repository implementations (`src/TalentX.Infrastructure/Persistence/Repositories/`) are thin wrappers over `ApplicationDbContext` — a query, `Add`, `Update`, or `Remove`, nothing else. They must **never**:
- Inject or call another service/provider (`ICurrentUserService`, external clients, storage services, etc.)
- Perform authorization/permission checks or throw `AppException`s
- Contain business rules, cross-entity validation, or branching that encodes a decision

Data-access shaping (filtering, `Where`, pagination via `Skip`/`Take`, sorting) is fine — that's still "how do I fetch the rows," not business logic. Anything that decides *whether* an operation is allowed, or that needs a second service to answer that question, belongs in the MediatR handler that calls the repository, never inside the repository method itself.

### Commands & Queries (CQRS via MediatR)
- **There is no `Result<T>` type in this codebase.** Do not return one and do not map one.
- Handlers **throw** on failure using the `AppException` hierarchy in `TalentX.Application/Common/Exceptions/`: `BadRequestException`, `ConflictException`, `ForbiddenException`, `NotFoundException`, `UnauthorizedException`, `UnprocessableEntityException`, `BadGatewayException`, `ValidationException`. `ExceptionMiddleware` maps each to its `StatusCode` centrally.
- Handlers return the DTO / value directly, or `Unit` where there is nothing to return.
- One FluentValidation validator per command/query — no exceptions.
- Repositories are surfaced through `IUnitOfWork`; note two coexisting styles — `JobRepository` extends `RepositoryBase<T>`, while `EmployerRepository` / `UserRepository` take `ApplicationDbContext` directly. Match whichever sibling you are extending.
- **Provider/service injection belongs in the handler, never in the controller (STRICT).** `ICurrentUserService` and every other cross-cutting provider (identity context, clock, storage, external clients, etc.) is a constructor dependency of the MediatR handler, not of the controller. If a command/query needs the current user's id, resolve it inside the handler from the injected `ICurrentUserService` and throw `UnauthorizedException` there — do not resolve it in the controller and pass it in as a constructor argument on the query/command. Reference pattern: `GetMyJobQueryHandler` / `CreateJobCommandHandler` resolve `ICurrentUserService.UserId` internally; `JobsController` never injects it. `TalentsController` previously violated this (`ICurrentUserService` injected into the controller to build `GetTalentProfileQuery`/`GetTalentApplicationPrefillQuery`) — treat that as the anti-pattern to avoid, not precedent.

### API Controllers
- Inherit from **`BaseApiController`** (`src/TalentX.API/Controllers/BaseApiController.cs:7`), which extends `ControllerBase` and resolves MediatR's `ISender` from `HttpContext`. There is no type named `ApiController`.
- Because `Sender` comes from `HttpContext`, controller unit tests must inject a mocked `ISender` into `DefaultHttpContext.RequestServices` (see `ResumesControllerTests.cs:34-69`).
- Return the handler's value; let `ExceptionMiddleware` produce error responses. Do not hand-map status codes from a result object.
- **No business logic in controllers, and no injected services beyond `IWebHostEnvironment`-style framework plumbing that is unavoidable at the ASP.NET Core layer.** A controller action's body is: build the command/query from `[FromRoute]`/`[FromQuery]`/`[FromBody]` parameters only, `await Sender.Send(...)`, map the result to an `IActionResult`. No conditionals that encode a business rule, no resolving a value from a provider/service to feed into the command — that resolution and any branching belongs in the handler.
- **Single HTTP Verb per Action (STRICT)**: Every controller endpoint action method must have **exactly one HTTP verb attribute** (`[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpPatch]`, or `[HttpDelete]`). Never decorate an action with multiple or conflicting HTTP verb attributes (e.g., never mix `[HttpPatch]` + `[HttpPut]`, or `[HttpPost]` + `[HttpPatch]`).
- **REST Verb Semantics for State Transitions (STRICT)**: Partial state and status transitions on existing resources (e.g. `CloseJob`, `ReopenJob`, `PublishJob`, `ArchiveJob`) must use **`[HttpPatch]`**, not `[HttpPost]`. Reserve `[HttpPost]` strictly for resource creation or operations that create subordinate entities.
- **No Boilerplate `[ProducesResponseType]` on Actions (STRICT — Clean Controllers)**: Do not litter controller actions with repetitive, boilerplate `[ProducesResponseType(StatusCodes.Status...)]` attributes (e.g. 204, 400, 401, 403, 404). All standard HTTP status codes and error responses (`400`, `401`, `403`, `404`, `409`, `500`) are handled globally and uniformly by `ExceptionMiddleware`. Stacking these attributes creates visual clutter and code bloat without providing runtime value.
- **No Inline Types in Controller Files (STRICT — One Type Per File)**: Never declare DTOs, request records, payloads, or auxiliary response types inside controller files (e.g. never declare `ApplyToJobRequestDto` or `CurrentEmployerResult` inside a controller). Every class, record, or interface MUST live in its own separate file matching the type name exactly under the corresponding feature/controller directory.
- Use `[AllowAnonymous]` on public endpoints, `[Authorize]` on protected. The `"Employer"` and `"Talent"` Identity roles are seeded from the `UserRole` enum (`IdentitySeeder.cs:25-37`), so `[Authorize(Roles = "Talent")]` already resolves.

## Testing Patterns
- **Moq**, not NSubstitute. Mocks as field initializers, SUT built in the constructor.
- Reference style: `test/TalentX.Application.Tests/Features/Jobs/Commands/CreateJob/CreateJobCommandHandlerTests.cs` — `private static ValidCommand(...)` builder mutated via record `with`, `Callback` to capture arguments, `await act.Should().ThrowAsync<T>()`, `Verify(..., Times.Once)`.
- Package versions drift across test projects (xUnit 2.4.2 and 2.9.3; FluentAssertions 6.12.0 and 8.10.0). **Match the versions already referenced by the project you are adding tests to** — do not introduce new test packages.

## Mandatory Tool & MCP Usage (STRICT — First Check & Prioritize Available MCP Tools)
- **First-Step Tool Discovery (MANDATORY)**: Before executing any task, planning, or fetching external resources, the agent/AI provider MUST first check whether relevant tools (specifically Model Context Protocol / MCP tools) are available in the active session/environment.
- **Prioritize MCP Tools over Manual / Shell Workarounds**: When relevant MCP tools are available (e.g., Jira, Bitbucket/Composio, etc.), you MUST use them as the primary and preferred mechanism to perform the work. Do NOT resort to manual guesswork, hallucinated requirements, ad-hoc `curl` scripts, or asking the user for information that available tools can fetch directly.
- **Jira Operations**: Always check for and use available Jira MCP tools (`jira_issues`, `jira_search`, `@nexus2520/jira-mcp-server`, etc.) to:
  - Fetch ticket details, summaries, and acceptance criteria (`assignee = currentUser() AND project = TX26 AND sprint in openSprints()`)
  - Transition or update issue status and post comments
- **Bitbucket / VCS Operations**: Always check for and use available Bitbucket / Composio MCP tools for repository operations, pull request reviews, and remote branch inspections, while strictly adhering to safety rules (NEVER delete repositories; always set `close_source_branch = false` on merge).
- **Fallback Policy**: Only fall back to standard CLI tools or asking the user if the specific MCP tool is verified to be absent, unsupported, or explicitly errors out.

## Workflow (Before Any Feature)
1. Check available MCP tools first; fetch the Jira ticket using Jira MCP tools and read ALL acceptance criteria
2. Map each AC to a layer/component
3. Identify security requirements, external integrations, open questions
4. Produce a written plan and get approval before writing code
5. Implement in order: Domain → Application → Infrastructure → API
6. Build clean (`dotnet build`) before committing

## Git Commit & PR Format (Conventional Commits & PR Standard)
```
feat(employer): add employer registration endpoint
fix(auth): correct duplicate email validation
refactor(domain): extract shared profile fields
test(employer): add handler unit tests
```
> **STRICT RULE**: Strictly follow [`PR.md`](file:///Users/jubair/Developer/asthait/talentx/PR.md) for generating PR descriptions, commit messages/summaries, AI usage declarations, understanding & ownership descriptions, testing evidence, and pre-merge checklists. Never skip any mandatory section of `PR.md`.
> **PR OUTPUT RULE**: Always write the final PR description directly into [`pr-description.md`](file:///Users/jubair/Developer/asthait/talentx/pr-description.md) in the project workspace root. For checkboxes, always put the checkmark `✔` directly inside the box: `[✔]` if done, and empty `[ ]` if not done. Never use cross marks (`[x]`).
> **NO BRAND / EXTERNAL PLATFORM MENTIONS (STRICT)**: NEVER mention external platforms or competitor brand names in any PR description, commit message, PR title, or PR summary. Always use neutral technical descriptions such as "modern B2B recruitment UI standard", "split-screen layout", or "card-based interface".

## Never Do
- Hardcode secrets or connection strings
- Ignore available MCP tools (e.g., Jira, Bitbucket/Composio) in favor of manual guesswork, ad-hoc curl scripts, or asking the user for data that tools can provide
- Modify files outside the project scope
- Skip FluentValidation for any command/query
- Use `Guid.NewGuid()` as a security token
- Add TODO comments — use Jira tickets instead
- Commit directly to main/master
- Reference `Result<T>`, `AddDomainEvent`, value objects, `ApiController`, `ProblemDetails`, or NSubstitute — **none of these exist in this codebase**
- Put migrations in `TalentX.Infrastructure` — they belong in `TalentX.Migrations`
- Make changes at the system/global level — always stay at project level (e.g., inside `talentx2026q3.backend/` or `talentx2026q3.frontend/`; never touch `~/.claude/` or any global config)
- NEVER delete Bitbucket repositories (`BITBUCKET_DELETE_REPOSITORY` is strictly forbidden)
- NEVER auto-delete branches on merge (`close_source_branch` MUST always be `false` when calling `BITBUCKET_MERGE_PULL_REQUEST`)
- Use low-contrast button colors like `bg-emerald-500` / `bg-emerald-600` with white text (< 18.66px bold) failing WCAG 2.1 AA 4.5:1 contrast (always use `bg-emerald-700`)
- Strip focus outlines (`outline-none`) without adding explicit `focus-visible:ring-2`
- Implement auto-advancing carousels without pause controls, hover/focus freezing, and reduced motion support

## Frontend Notes (verified 2026-08-27)
- **Next.js 16.3.0** — there is no `proxy.ts` or `middleware.ts` at the repo root. Route protection is enforced server-side via `requireAuth(...)` calls inside individual route/page files (see `lib/auth/require-auth.ts`), and `lib/protected-routes.ts` holds the guarded path list. The `/api/backend/:path*` → API rewrite is a plain Next.js `rewrites()` entry in `next.config.ts`, not a custom proxy file (corrected 2026-09-17 — this section previously and incorrectly claimed a `proxy.ts` file existed).
- No `src/` directory — `app/` sits at the repo root; path alias `@/*` → `./*`.
- Feature code lives in `modules/[feature]/` with `components/ hooks/ services/ types/ utils/ __tests__/ index.ts`. `modules/jobposting/` is the richest reference module.
- Axios (`lib/axios.ts`) has **no request interceptor** — no `Authorization` header is attached anywhere; auth rides on cookies with `withCredentials: true` through the `/api/backend` rewrite. Consumers catch the custom `ApiError`, never `AxiosError`.
- shadcn/ui is configured with `"style": "base-nova"` → components come from `@base-ui/react`, **not** Radix.
- React Query tests must wrap with `createQueryWrapper()` from `tests/test-utils/query-client-wrapper.tsx` or they throw "No QueryClient set".
- `talentx2026q3.frontend/AGENTS.md` is **auto-generated and re-added by `next dev`** — never hand-edit inside its `BEGIN/END:nextjs-agent-rules` block. `talentx2026q3.frontend/CLAUDE.md` is a one-line `@AGENTS.md` import.
- **Frontend File Organization (STRICT — One Concern Per File)**: Component files (`.tsx`) must contain **only** the component function and its directly-coupled Props interface. Everything else must live in a dedicated file inside the module's appropriate subdirectory:
  - **Interfaces / types** that are used by more than one component → `types/`
  - **Utility / pure functions** (formatters, parsers, URL builders) → `utils/`
  - **Config lookup objects, style maps, and named constant objects** (e.g., `STATUS_CONFIG`, `BAND_CONFIG`, `SIZE_CLASSES`, `NOTIFICATION_TYPE_CONFIG`) → `constants/`
  - **API endpoint strings, hub paths, magic numbers** → `constants/`
  - **The only exception**: A single `XxxProps` interface for the component's own props **may** stay in the same component file — this is standard React convention. No other types, configs, or utility functions may be declared in a component file.
- **WCAG 2.1 AA Accessibility Standards (Mandatory)**: All frontend UI components must comply with WCAG 2.1 AA:
  - Contrast: Minimum 4.5:1 for normal text (< 18.66px bold) and 3:1 for large text / UI boundaries. White-text buttons MUST use `bg-emerald-700` (`#047857`, 5.48:1 contrast). `bg-emerald-600` (3.77:1) and `bg-emerald-500` (2.47:1) strictly fail and are forbidden.
  - Visible Focus Rings: Form controls and text boxes (`<Input>`, `<Textarea>`, `<select>`) MUST use the clean emerald border focus standard `focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0` (border color changes to emerald; no outer ring or background glow effect on click or keyboard tab). Action buttons, links, and navigation on light surfaces use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2` (or white on dark, `focus-visible:ring-emerald-700` on emerald buttons). Never use `outline-none` without an explicit focus indicator.
  - Motion Reduction: Disable or pause non-essential motion when `@media (prefers-reduced-motion: reduce)` is active (`motion-reduce:animate-none`).
  - Accessible Carousels: Container `role="region"` + `aria-roledescription="carousel"`, slides `role="group"` + `aria-roledescription="slide"`, accessible Pause/Play toggle button, auto-pause on hover and keyboard focus, and live announcements.
- **Card & Component Border Radius Standard (STRICT)**:
  - All content cards (Job Cards, Metric Count Cards, Overview Cards) MUST use **`rounded-md`** (6px) for a crisp, squarish modern B2B recruitment design. Overly rounded `rounded-2xl` / `rounded-3xl` are strictly banned on cards.
  - Tab bar containers MUST use **`rounded-md`**, and inner tab buttons/active indicator pills MUST use **`rounded-sm`** (2-4px).
  - Buttons, CTAs, and input fields MUST use **`rounded-md`**.


## Reference Documents
- **BRD**: `TalentX Business Requirements Document (BRD).docx` (project root)
- **Auth & User Lifecycle Specification**: `auth-and-user-lifecycle.md` (project root)
- **Frontend Design Specification**: `DESIGN.md` (project root)
- **PR & Commit Standard**: `PR.md` (project root)
- **DB Schema**: `DB_Schema.md` (project root) — corrected 2026-08-27 against the actual migration. Section 1 is verified reality; Section 2 is planned-but-not-deployed. **Never code against Section 2 as though those tables exist.**
- **JIRA Project Key**: `TX26`
- **JIRA Board**: https://talentx.atlassian.net/
- **Branch Pattern**: `TX26-XXX-short-description`
- **Branch Flow**: `main` ← `staging` ← `dev` ← feature. **`dev` is the integration branch — cut feature branches from `origin/dev`.**
- **Graph Map**: `graphify-out/GRAPH_REPORT.md` (god-nodes: `AGENTS.md` 11 edges, `CLAUDE.md` 11 edges)

## Active Skills (use these before coding)
- `dotnet-clean-architecture` — enforces layer patterns and entity templates
- `feature-development` — step-by-step workflow from branch to commit
- `jira-ticket-planner` — fetch ticket → plan → get approval → then code
- `agent-orchestrator-planner` / `agent-orchestrator-executor` — phased plan authoring, then delegated execution with a code review per phase
- `to-tickets` — breaks specs/plans into tracer-bullet vertical slice tickets with blocking dependencies
- `frontend-design-system` — enforces the reference UI standard, strict responsiveness across all viewports, color tokens, and pre-implementation planning
- `react-performance` — optimizes Next.js / React performance, eliminating waterfalls, optimizing RSC/client boundaries, and Core Web Vitals
- `accessibility-a11y` — enforces WCAG 2.2 AA accessibility, keyboard navigation, focus trapping, and screen reader announcements
- `tanstack-query-patterns` — enterprise server state architecture, query key factories, and optimistic UI updates
- `daily-scrum-update` — prepares bilingual English and Bengali standup updates and spoken scripts
- `pr-description` — generates standardized PR descriptions for Backend & Frontend strictly following PR.md
- `create-jira-story` — creates user-centric Jira Story tickets in any Jira project using Jira MCP with ADF formatting (no ### or **)
- `create-jira-bug` — creates structured Jira Bug tickets with Description, Steps to Reproduce, Actual/Expected results, and screenshot attachments using Jira MCP
- `create-subtasks` — creates QA-testable user scenario sub-tasks for any Jira ticket in the TX26 project
- `clean-code-standards` — enforces zero noise comments, full descriptive variable names, and developer-friendly structured logging without emojis

## User & Authentication Flow Model
- **No Sign Up for Talent**: Candidates never register through a public `/signup` page.
- **Talent JIT Provisioning**: When a guest candidate applies to a job, backend automatically creates a Talent (`Role: Talent`, `IsVerified: false`) and emails a generated temporary password. No extra DB columns are used (`IsVerified` handles state).
- **Talent First Login**: Logging in with the temporary password forces redirection to `/change-password`. Setting a new password marks `IsVerified: true` and opens the Talent Dashboard.
- **Returning Talent**: Applying with an existing email sends a 10-minute temporary password/OTP to confirm application.
- **Employer Registration**: Standard `/signup` flow with duplicate email check, OTP confirmation, and redirection to the Employer Dashboard.

## Sprint & Jira Workflow (Team-Wide Developer Standard)
- **Mandatory Tool & MCP Verification**: Before interacting with tickets or repositories, always check available MCP tools first. Use Jira MCP tools (e.g. `jira_issues`, `jira_search`) and Bitbucket/Composio MCP tools as the primary mechanism for fetching ticket details, managing transitions, or reviewing code changes.
- **Ticket Assignment**: Every developer on the team must fetch only their assigned tickets using Jira query `assignee = currentUser() AND project = TX26 AND sprint in openSprints()`. Never pull or modify tickets assigned to other developers.
- **Branch Isolation**: Cut feature branches directly from `origin/dev` using the standard pattern: `TX26-XXX-short-description`. Never commit directly to `dev`, `staging`, or `main`.
- **Pre-Implementation Requirement**: Always run the ticket planning workflow (e.g. `jira-ticket-planner` skill) to analyze acceptance criteria, map Domain/Application/Infrastructure/API layers, check accessibility (WCAG 2.1 AA) and security requirements, and get plan alignment before writing code.
- **Cross-Ticket Dependencies**: Reconstruct integration points directly from related ticket acceptance criteria or open tickets. Coordinate API contracts and schema migrations early across the team.
- **Sprint Overview**: Always check the Jira board (https://talentx.atlassian.net/) for the current active sprint goal, ticket states, and assignments.
