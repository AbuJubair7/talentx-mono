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

## Step 1 — Fetch the Ticket
Use the `jira_issues` MCP tool to retrieve full ticket details:
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
| 2 | System validates email format | `RegisterEmployerCommandValidator` + `Email` value object |
| ... | ... | ... |

---

#### 🏗️ Domain Layer
List new/modified files:
- `Entities/Employer.cs` — new entity with `Name`, `Email`, `OrganizationName`, `Role`
- `ValueObjects/Email.cs` — validated email value object
- `Events/EmployerRegisteredEvent.cs` — domain event for side effects
- `Repositories/IEmployerRepository.cs` — repository interface

#### ⚙️ Application Layer
- `Features/Employers/Register/RegisterEmployerCommand.cs`
- `Features/Employers/Register/RegisterEmployerCommandHandler.cs`
- `Features/Employers/Register/RegisterEmployerCommandValidator.cs`
- `Features/Employers/Register/RegisterEmployerResponse.cs`
- `Features/Employers/ConfirmEmail/ConfirmEmployerEmailCommand.cs`
- `Features/Employers/ConfirmEmail/ConfirmEmployerEmailCommandHandler.cs`

#### 🔧 Infrastructure Layer
- `Persistence/Configurations/EmployerConfiguration.cs` — EF Core config
- `Persistence/Repositories/EmployerRepository.cs` — implements `IEmployerRepository`
- `Migrations/` — EF Core migration for new tables
- `Services/EmailService.cs` — sends confirmation email (if not already exists)
- `Services/TokenService.cs` — generates secure email confirmation tokens

#### 🌐 API Layer
- `Controllers/EmployersController.cs` — new controller
  - `POST /api/v1/employers/register`
  - `POST /api/v1/employers/confirm-email`
- DI registration extension method

#### 🔐 Security Checklist
- [ ] Password hashed via `IPasswordHasher<Employer>` — never stored plain
- [ ] Email confirmation token via `IDataProtector` — never `Guid.NewGuid()`
- [ ] Registration endpoint is public (`[AllowAnonymous]`)
- [ ] All other employer endpoints require `[Authorize(Roles = "Employer")]`
- [ ] Duplicate email returns `409 Conflict` — not `400`
- [ ] No secrets hardcoded — use `dotnet user-secrets`

---

#### 📝 Task Breakdown (ordered)
Numbered list of atomic tasks to implement in order:

1. Create `BaseEntity`, `ValueObject`, `DomainException` base classes in Domain
2. Create `Email` value object with validation
3. Create `Employer` entity with factory method and domain event
4. Define `IEmployerRepository` interface in Application
5. Create `RegisterEmployerCommand` + validator
6. Create `RegisterEmployerCommandHandler` with Result pattern
7. Create `ConfirmEmployerEmailCommand` + handler
8. Add `EmployerConfiguration` for EF Core
9. Implement `EmployerRepository`
10. Add EF Core migration
11. Implement `EmailService` for confirmation mail
12. Implement `TokenService` for secure tokens
13. Create `EmployersController` with register + confirm endpoints
14. Register all services in DI
15. Build solution — zero warnings
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
