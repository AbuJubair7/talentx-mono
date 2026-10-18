---
name: jira-ticket-planner
description: >-
  Use this skill when starting work on a Jira ticket. Fetches the ticket
  details, analyses acceptance criteria, and produces a structured
  implementation plan covering Domain, Application, Infrastructure, API layers
  and a task breakdown before any code is written. Always activate this skill
  FIRST before beginning any feature implementation.
---

# Jira Ticket Planning Skill

## Purpose
Before writing a single line of code, always produce a clear, structured plan
derived directly from the Jira ticket. This prevents misaligned work, missed
acceptance criteria, and scope creep.

---

## Step 1 — Check Tools & Fetch the Ticket
**Tool Priority (MANDATORY)**: Always check available MCP tools first. If Jira MCP tools are available in the session, they MUST be used to retrieve full ticket details, acceptance criteria, and sprint context before planning. Do not rely on manual guesswork, hallucinated criteria, or asking the user for ticket details that tools can provide.

Use the `jira_issues` MCP tool (or active Jira MCP tool) to retrieve full ticket details:
```
action: get
issueKey: <TX26-XXX>
```
Extract:
- **Summary** (feature title)
- **Description** (context and user story)
- **Acceptance Criteria** (each bullet = a testable requirement)
- **Story Points** (effort signal)
- **Sprint** (deadline context)

---

## Step 2 — Analyse & Clarify
Before planning, answer these questions from the ticket content:

| Question | Why It Matters |
|----------|---------------|
| What entities are created or modified? | Drives Domain layer work |
| What are the new API endpoints? | Drives API layer work |
| What validation rules are required? | Drives FluentValidation work |
| Are there external integrations (email, OAuth, storage)? | Drives Infrastructure work |
| Are there security requirements (auth, roles, tokens)? | Flags `[Authorize]` and token needs |
| Are there any ambiguous or missing requirements? | Must be flagged before coding |

If anything is ambiguous, **stop and ask** before proceeding.

---

## Step 3 — Produce the Implementation Plan

Output the plan in this exact format:

---

### 🎫 Ticket: [TX26-XXX] — [Summary]

#### 📋 Acceptance Criteria Mapping
List every AC point and map it to the layer/component that implements it:

| # | Acceptance Criterion | Implemented In |
|---|----------------------|---------------|
| 1 | Employer can register using email and password | `RegisterEmployerCommand` + `EmployersController` |
| 2 | System validates email format | `RegisterEmployerCommandValidator` |
| ... | ... | ... |

---

#### 🏗️ Domain Layer
List new/modified files:
- `Entities/Employer.cs` — entity extending `User` aggregate (NO value objects, NO domain events)
- `Repositories/IEmployerRepository.cs` — repository interface

#### ⚙️ Application Layer
- `Features/Employers/Commands/RegisterEmployer/RegisterEmployerCommand.cs`
- `Features/Employers/Commands/RegisterEmployer/RegisterEmployerCommandHandler.cs` (throws `AppException` subclasses on error; NO `Result<T>`)
- `Features/Employers/Commands/RegisterEmployer/RegisterEmployerCommandValidator.cs`
- `Features/Employers/DTOs/RegisterEmployerResponse.cs`
- `Features/Employers/Commands/ConfirmEmail/ConfirmEmployerEmailCommand.cs`
- `Features/Employers/Commands/ConfirmEmail/ConfirmEmployerEmailCommandHandler.cs`

#### 🔧 Infrastructure Layer
- `Persistence/Configurations/EmployerConfiguration.cs` — EF Core config
- `Persistence/Repositories/EmployerRepository.cs` — implements `IEmployerRepository` (CRUD only, thin wrapper)
- Migrations: `TalentX.Migrations` project: `dotnet ef migrations add <Name> -p src/TalentX.Migrations -s src/TalentX.API`
- `Services/EmailService.cs` — sends confirmation email (if not already exists)
- `Services/TokenService.cs` — generates secure email confirmation tokens

#### 🌐 API Layer
- `Controllers/Employers/EmployersController.cs` — controller inheriting `BaseApiController`
  - `POST /api/v1/employers/register`
  - `POST /api/v1/employers/confirm-email`
- DI registration extension method

#### 🔐 Security Checklist
- [ ] Password hashed via `IPasswordHasher<T>` — never stored plain
- [ ] Email confirmation token via `IDataProtector` — never `Guid.NewGuid()`
- [ ] Registration endpoint is public (`[AllowAnonymous]`)
- [ ] All other employer endpoints require `[Authorize(Roles = "Employer")]`
- [ ] Duplicate email returns `409 Conflict` — not `400`
- [ ] No secrets hardcoded — use `dotnet user-secrets`

---

#### 📝 Task Breakdown (ordered)
Numbered list of atomic tasks to implement in order:

1. Update or create entity in Domain (`TalentX.Domain`)
2. Define repository interface in Application / Domain
3. Create MediatR command/query + DTOs in Application
4. Create FluentValidation validator for command/query
5. Create command/query handler in Application (inject services here, throw `AppException` on failure)
6. Add EF Core entity configuration in Infrastructure
7. Implement repository in Infrastructure (thin CRUD wrapper)
8. Add EF Core migration in `TalentX.Migrations` project
9. Implement external services (email, tokens, etc.)
10. Create API controller inheriting `BaseApiController` in `TalentX.API`
11. Register all services and repositories in DI
12. Build solution — zero warnings (`dotnet build -warnaserror`)
13. Run all tests (`dotnet test`)
16. Manual smoke test via `.http` file

---

#### ⚠️ Risks & Open Questions
List anything uncertain that needs clarification:
- e.g., "Is Google OAuth in scope for this sprint or a separate ticket?"
- e.g., "Which email provider is configured (SendGrid, SMTP, etc.)?"
- e.g., "Should the employer be auto-confirmed in dev environment?"

---

## Step 4 — Get Approval Before Coding
Present the plan to the user and **wait for confirmation** before writing any code.
Only proceed when the user says "looks good", "proceed", or similar.

This prevents wasted work on wrong assumptions.
