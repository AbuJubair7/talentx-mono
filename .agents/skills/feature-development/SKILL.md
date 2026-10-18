---
name: feature-development
description: >-
  Step-by-step workflow for implementing a new feature end-to-end in TalentX.
  Use this when starting work on a Jira ticket. Covers everything from branch
  creation, domain modeling, application layer, infrastructure, API endpoints,
  tests, and committing work.
---

# Feature Development Workflow

## Step 1 — Check Tools & Understand the Ticket
1. Check available MCP tools in your session first. If Jira MCP tools (e.g. `jira_issues`, `jira_search`) or Bitbucket/Composio MCP tools are available, use them to fetch ticket details, read acceptance criteria, and inspect repository/PR state.
2. Identify: entities affected, new endpoints needed, validation rules, external integrations.
3. Ask clarifying questions if acceptance criteria are ambiguous before writing any code.

## Step 2 — Branch (Already on correct branch)
The branch should already follow the pattern `TX26-XXX-short-description`.
Verify with `git branch --show-current`.

## Step 3 — Domain Layer First
1. Create/update entities in `TalentX.Domain/Entities/`.
2. Do NOT create value objects — there is no `ValueObject` base type and no `ValueObjects/` folder in this codebase. Use primitives with `HasMaxLength` in the EF configuration.
3. Define repository interfaces in `TalentX.Domain/Repositories/` or `TalentX.Application/Interfaces/`.
4. There are NO domain events and NO `AddDomainEvent` in this codebase.
5. **Build and verify** → `dotnet build src/TalentX.Domain/TalentX.Domain.csproj`

## Step 4 — Application Layer
1. Create feature folder: `TalentX.Application/Features/<Feature>/`.
2. Add Command/Query records + Handler classes (throw `AppException` subclasses on failure; no `Result<T>`).
3. Add FluentValidation validators (one per command/query).
4. Add response DTOs (one type per file).
5. Ensure parameter count <= 5; declare feature constants under `Features/<Feature>/Constants/`.
6. **Build and verify** → `dotnet build src/TalentX.Application/TalentX.Application.csproj`

## Step 5 — Infrastructure Layer
1. Add/update `IEntityTypeConfiguration<T>` for new entities.
2. Add/update `DbContext`.
3. Create EF Core migration: `dotnet ef migrations add <MigrationName> -p src/TalentX.Migrations -s src/TalentX.API`
4. Implement repository interfaces (thin CRUD wrappers only; no service injection or business rules).
5. **Build and verify** → `dotnet build src/TalentX.Infrastructure/TalentX.Infrastructure.csproj`

## Step 6 — API Layer
1. Create controller in `TalentX.API/Controllers/<Feature>/`, inheriting `BaseApiController` (there is no `ApiController` base class).
2. Map endpoints with single HTTP verb per action; REST semantics (`[HttpPatch]` for state changes).
3. Do not stack boilerplate `[ProducesResponseType]` error codes.
4. No business logic in controllers; resolve services inside MediatR handlers.
5. **Build full solution** → `dotnet build`

## Step 7 — Write Tests
1. Unit test domain entities and logic.
2. Unit test command handlers with Moq (mock all dependencies).
3. Unit test validators.
4. Integration test repositories/services.
5. Run tests → `dotnet test`

## Step 8 — Commit & PR Preparation
Follow Conventional Commits:
```
feat(employer): add employer registration domain entity and command
fix(auth): correct email validation for duplicate check
test(employer): add unit tests for RegisterEmployerCommandHandler
```

Format: `git commit -m "feat(<scope>): <description>"`

> **STRICT RULE**: For all commit messages, commit descriptions, and PR descriptions, strictly follow [`PR.md`](file:///Users/jubair/Developer/asthait/talentx/PR.md). Ensure all mandatory sections are completed accurately and write final description to `pr-description.md` with `[✔]` checkmarks. Never cite external platform or competitor brand names.

## Step 9 — Self Review & PR Checklist (from PR.md)
Before declaring done, verify:
- [ ] All acceptance criteria from the Jira ticket are met
- [ ] No hardcoded secrets or connection strings
- [ ] FluentValidation covers all input fields
- [ ] Appropriate HTTP status codes returned
- [ ] Clean code: No noise comments, no boilerplate XML docs, descriptive variable names (no `res`, `tokenRes`, `err`, `tmp`)
- [ ] Developer-friendly structured logging without emojis or ASCII box banners
- [ ] No magic numbers; max 5 parameters per method/constructor
- [ ] Strictly one class/record per file
- [ ] Frontend UI conforms to WCAG 2.1 AA (contrast >= 4.5:1, `bg-emerald-700` for white-text buttons, form controls use clean emerald border focus `focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0`)
- [ ] No brand mentions in commit messages, PR descriptions, or code
- [ ] Tests pass (`dotnet test` / `npm test`)
- [ ] Solution builds cleanly with no warnings (`dotnet build -warnaserror` / `npm run build`)
- [ ] PR description and AI usage declaration follow `PR.md` template exactly in `pr-description.md` with `[✔]`

