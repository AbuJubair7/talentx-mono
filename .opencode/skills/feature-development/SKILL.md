---
name: feature-development
description: >-
  Step-by-step workflow for implementing a new feature end-to-end in TalentX.
  Use this when starting work on a Jira ticket. Covers everything from branch
  creation, domain modeling, application layer, infrastructure, API endpoints,
  tests, and committing work.
---

# Feature Development Workflow

## Step 1 — Understand the Ticket
1. Read the Jira ticket acceptance criteria carefully.
2. Identify: entities affected, new endpoints needed, validation rules, external integrations.
3. Ask clarifying questions if acceptance criteria are ambiguous before writing any code.

## Step 2 — Branch (Already on correct branch)
The branch should already follow the pattern `TX26-XXX-short-description`.
Verify with `git branch --show-current`.

## Step 3 — Domain Layer First
1. Create/update entities in `TalentX.Domain/Entities/`.
2. Do NOT create value objects — there is no `ValueObject` base type and no `ValueObjects/` folder in this codebase. Use primitives with `HasMaxLength` in the EF configuration.
3. Define repository interfaces in `TalentX.Domain/Repositories/` or `TalentX.Application/Interfaces/`.
4. Define domain events in `TalentX.Domain/Events/`.
5. **Build and verify** → `dotnet build src/TalentX.Domain/TalentX.Domain.csproj`

## Step 4 — Application Layer
1. Create feature folder: `TalentX.Application/Features/<Feature>/`.
2. Add Command/Query records + Handler classes.
3. Add FluentValidation validators.
4. Add response DTOs.
5. Register MediatR pipeline behaviors if new patterns are needed.
6. **Build and verify** → `dotnet build src/TalentX.Application/TalentX.Application.csproj`

## Step 5 — Infrastructure Layer
1. Add/update `IEntityTypeConfiguration<T>` for new entities.
2. Add/update `DbContext`.
3. Create EF Core migration: `dotnet ef migrations add <MigrationName> -p src/TalentX.Migrations -s src/TalentX.API`
4. Implement repository/service interfaces.
5. **Build and verify** → `dotnet build src/TalentX.Infrastructure/TalentX.Infrastructure.csproj`

## Step 6 — API Layer
1. Create controller in `TalentX.API/Controllers/<Feature>/`, inheriting `BaseApiController` (there is no `ApiController` base class).
2. Map endpoints, apply `[Authorize]` where required.
3. Register new services in DI (`Program.cs` or extension methods).
4. **Build full solution** → `dotnet build`

## Step 7 — Write Tests
1. Unit test domain entities and value objects.
2. Unit test command handlers (mock all dependencies).
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

> **STRICT RULE**: For all commit messages, commit descriptions, and PR descriptions, strictly follow [`PR.md`](file:///Users/jubair/Developer/asthait/talentx/PR.md). Ensure all mandatory sections (Summary, Commit Messages, AI Usage Declaration, Understanding & Ownership, Validation Performed, Testing Evidence, Risks & Considerations, and Checklist) are completed accurately.

## Step 9 — Self Review & PR Checklist (from PR.md)
Before declaring done, verify:
- [ ] All acceptance criteria from the Jira ticket are met
- [ ] No hardcoded secrets or connection strings
- [ ] FluentValidation covers all input fields
- [ ] Appropriate HTTP status codes returned
- [ ] Domain events raised where needed
- [ ] All new public code has XML doc comments
- [ ] Tests pass (`dotnet test` / `npm test`)
- [ ] Solution builds cleanly with no warnings (`dotnet build -warnaserror` / `npm run build`)
- [ ] PR description and AI usage declaration follow `PR.md` template exactly

