---
name: Agent-Level Configuration Rules
description: Enforce that all agent configurations and customizations remain local to the project.
trigger: always_on
---
<!-- Last Updated: 2026-08-27 | Verified against code: migrations project, error handling, controller base, domain model, test framework, frontend versions. Corrected NSubstitute→Moq, Next.js 15→16.3.0, Result<T>/RFC 7807/ApiController/domain-event claims. -->

# Configuration Rule
- Do not make any changes at the system level (e.g., `~/.gemini/config/`).
- Always apply configuration changes, custom rules, skills, and MCP setups at the **project level** (e.g., inside `.agents/` of the current workspace).
- **Maintain All Project-Level Providers**: Ensure all configured MCP servers and tool providers (e.g., Jira, Bitbucket/Composio) under `.agents/plugins/` and `.agents/plugins.json` remain fully functional, isolated, and intact. Never remove or break existing working providers when adding or modifying integrations.
- **Mandatory MCP Tool Priority**: Agents MUST always check for available MCP tools first (e.g., Jira, Bitbucket/Composio). When available, agents MUST use these tools as the primary mechanism to perform tasks (fetching tickets, managing issues, reviewing PRs, checking VCS state) rather than relying on manual guesswork, ad-hoc shell scripts, or asking the user.

---

# TalentX — Gemini CLI Agent Context

## Project Overview
TalentX is an AI-assisted job marketplace connecting tech companies with AI and data experts.
**Phase 1** (current): Employer registration, job posting, talent search, public job discovery, resume AI extraction.
**Phase 2** (future): Automated vetting, AI-conducted interviews, skill tests.

## Tech Stack

### Backend (`talentx2026q3.backend/`)
- **Runtime**: C# 13 / .NET 10 (9 projects, solution is `TalentX.slnx` — there is no `.sln`)
- **Framework**: ASP.NET Core, EF Core (Code-First, Npgsql/PostgreSQL), MediatR (CQRS), FluentValidation, AutoMapper
- **Architecture**: Clean Architecture — Domain → Application → Infrastructure → API. **Migrations live in a separate `TalentX.Migrations` project**, not in Infrastructure: `dotnet ef migrations add <Name> -p src/TalentX.Migrations -s src/TalentX.API`
- **Repositories**: CRUD only, thin wrappers over `ApplicationDbContext`. Never inject services, check permissions, or contain business logic in repositories.
- **Dependency Injection**: Inject cross-cutting services (`ICurrentUserService`, storage, etc.) into MediatR handlers, never into API controllers. Controllers only receive request parameters and dispatch commands/queries via MediatR.
- **Error handling**: handlers **throw** `AppException` subclasses; `ExceptionMiddleware` maps them centrally to `{ Message }` (plus `Errors[]` on validation failures). **There is no `Result<T>` type and no RFC 7807 `ProblemDetails`** in this codebase.
- **Controllers**: inherit `BaseApiController` (extends `ControllerBase`, resolves MediatR `ISender` from `HttpContext`). There is no `ApiController` type.
- **Domain**: `BaseEntity` is only `Id` / `CreatedAt` / `UpdatedAt`. **No domain events, no `AddDomainEvent`, no value objects.** Role entities use Table-Per-Type inheritance off a hand-rolled `User` aggregate with a public constructor (see `Employer.cs`).
- **Auth**: ASP.NET Core Identity, JWT (15min access), Google OAuth (trusts Google email payload directly) [BRD §4.1]. Refresh token travels in two hops: the API returns it in the JSON response body (the backend writes no cookies), then the Next.js server action stores it in an HttpOnly cookie.
- **Testing**: xUnit + FluentAssertions + **Moq** (not NSubstitute). Test package versions drift between projects — match whatever the target project already references.

### Frontend (`talentx2026q3.frontend/`)
- **Design & UX Standard**: TalentX Design System (high-contrast, clean B2B/tech recruitment aesthetic, split-screen auth, card layouts)
- **Routing Standard**: reference-platform navigation flow (see `.agents/rules/frontend-design.md`)
- **Framework**: Next.js 16.3.0 (App Router), React 19.2.8, TypeScript. Route interception is **`proxy.ts`** at the repo root — there is no `middleware.ts`. No `src/` directory; `app/` sits at the root.
- **Styling**: Tailwind CSS v4, shadcn/ui configured with `"style": "base-nova"` → components come from `@base-ui/react`, **not** Radix
- **Data Fetching**: TanStack Query + Axios. `lib/axios.ts` has **no request interceptor** — no `Authorization` header anywhere; auth rides on cookies via `withCredentials` through the `/api/backend` rewrite. Consumers catch the custom `ApiError`, not `AxiosError`.
- **Architecture**: Domain-Driven Modular — `modules/[feature]/` pattern
- **Testing**: Jest 30 + React Testing Library. React Query tests must use `createQueryWrapper()` from `tests/test-utils/query-client-wrapper.tsx`.
- `talentx2026q3.frontend/AGENTS.md` is **auto-generated and re-added by `next dev`** — never hand-edit inside its `BEGIN/END:nextjs-agent-rules` block.
- **Accessibility (WCAG 2.1 AA — STRICT)**: Minimum 4.5:1 contrast for normal text (< 18.66px bold) and 3:1 for large text / UI elements. White-text buttons MUST use `bg-emerald-700` (`#047857`, 5.48:1 contrast); `bg-emerald-600` (3.77:1) and `bg-emerald-500` (2.47:1) are strictly prohibited for normal button text. Form controls and text boxes (`<Input>`, `<Textarea>`, `<select>`) MUST use the emerald focus standard `focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0` (border changes to emerald; no outer ring or ambient background glow effect on click or keyboard tab). Visible focus rings required (`focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2` on buttons/links on light surfaces, or white on dark, `focus-visible:ring-emerald-700` on emerald buttons). Respect `@media (prefers-reduced-motion: reduce)` with `motion-reduce:animate-none`. Auto-advancing carousels require accessible Pause/Play controls, hover/focus pausing, and proper ARIA (`role="region"`, `role="group"`).
- **Frontend File Organization (STRICT — One Concern Per File)**: Component files (`.tsx`) must contain **only** the component function and its directly-coupled Props interface. Everything else must live in a dedicated file inside the module's appropriate subdirectory:
  - **Interfaces / types** shared between components → `types/`
  - **Utility / pure functions** (formatters, parsers, URL builders) → `utils/`
  - **Config lookup objects, style maps, named constant objects** (e.g., `STATUS_CONFIG`, `BAND_CONFIG`, `SIZE_CLASSES`, `NOTIFICATION_TYPE_CONFIG`) → `constants/`
  - **API endpoint strings, hub paths, magic numbers** → `constants/`
  - **The only exception**: A single `XxxProps` interface for the component's own props **may** stay in the same component file. No other types, configs, or utility functions may be declared in a component file.

## Shared Rules
- **Accuracy rule**: technical claims in this file were verified against source on 2026-08-27. If code and this document disagree, **the code wins** — fix the document in the same PR.
- Branch pattern: `TX26-XXX-short-description`
- Branch flow: `main` ← `staging` ← `dev` ← feature. **`dev` is the integration branch — cut feature branches from `origin/dev`.**
- Commits: Conventional Commits — `feat(scope): description`
- Never commit directly to main/master
- Fetch Jira tickets with `assignee = currentUser()` — do not fetch all sprint tickets
- **Mandatory Tool & MCP Usage (STRICT)**: Always check whether relevant MCP tools are available in the active session before doing work. If Jira or Bitbucket/Composio MCP tools are available, you MUST use them as the primary mechanism for fetching tickets, reviewing pull requests, inspecting branches, or managing project state. Never ignore available MCP tools in favor of guesswork or manual workarounds.
- Cite JIRA ticket ID in commit scope for all sprint work
- **Strict PR & Commit Standard**: Strictly follow [`PR.md`](file:///Users/jubair/Developer/asthait/talentx/PR.md) for all commit descriptions, PR summaries, AI usage declarations, ownership descriptions, testing evidence, and pre-merge validation checklists. Never skip any required section of `PR.md`. Always write PR descriptions to [`pr-description.md`](file:///Users/jubair/Developer/asthait/talentx/pr-description.md) in the project root. For checkboxes, always put the checkmark `✔` directly inside the box: `[✔]` if done, and empty `[ ]` if not done (never use `[x]`).
- **NO BRAND / EXTERNAL PLATFORM MENTIONS (STRICT)**: NEVER mention external platforms or competitor brand names in any PR description, commit message, PR title, or PR summary. Always use neutral technical descriptions such as "modern B2B recruitment UI standard", "split-screen layout", or "card-based interface".
- **Bitbucket / VCS Protection**: NEVER delete Bitbucket repositories (`BITBUCKET_DELETE_REPOSITORY` is forbidden). When merging PRs, `close_source_branch` MUST always be `false`.
- **Clean Code & Developer-Friendly Logging (STRICT)**: Zero noise comments (no restating the code); full descriptive variable names (strictly ban lazy abbreviations like `tokenRes`, `res`, `err`, `tmp`); strictly ban emojis (`🔑`, `⚠️`, `✅`, `👉`) and ASCII banners in logs; never hardcode default values in method/function parameters (always reference centralized constants); maximum 5 parameters limit (methods with > 5 parameters must encapsulate into a dedicated parameter object/record/DTO); strictly one class/record per file (never declare inline DTOs or models inside controller/handler files); never litter controller actions with redundant boilerplate `[ProducesResponseType]` error annotations.
- **WCAG 2.1 AA Accessibility Standards (STRICT)**: All frontend UI components must strictly adhere to WCAG 2.1 AA standards. Normal text must maintain >= 4.5:1 contrast against backgrounds (`bg-emerald-700` `#047857` is mandatory for white-text buttons; `bg-emerald-500`/`bg-emerald-600` fail for normal text and are banned). Form controls and text boxes (`<Input>`, `<Textarea>`, `<select>`) MUST use the emerald focus standard `focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0` (border changes to emerald; no outer ring or ambient background glow effect on click or keyboard tab). Never use `outline-none` without an explicit focus indicator (`focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2` on buttons/links on light surfaces, or white on dark, `focus-visible:ring-emerald-700` on emerald buttons). All auto-advancing carousels must feature Pause/Play controls, hover/focus freeze, and respect `prefers-reduced-motion: reduce`.
- **Filename Sanitization**: Sanitize any user-supplied filename before it reaches storage keys or filesystem paths. For Talent media/resume storage keys, use `TalentMediaStorageKeyGuard.SanitizeFileNameSegment`/`BuildStorageKey` (strips both `/` and `\` deterministically across all OS environments); use `Path.GetFileName()` for non-Talent-storage-key paths.
- **Card & Component Border Radius Standard (STRICT)**: All content cards (Job Cards, Metric Count Cards, Overview Cards) MUST use **`rounded-md`** (6px) for a crisp, squarish modern B2B recruitment interface (`rounded-2xl` / `rounded-3xl` are strictly banned on cards). Tab bar containers MUST use **`rounded-md`**, and inner tab buttons/active indicator pills MUST use **`rounded-sm`** (2-4px). Buttons, CTAs, and input fields MUST use **`rounded-md`**.
- **Always stay at project level** — only create or modify files inside `talentx2026q3.backend/` or `talentx2026q3.frontend/`; never touch system/global directories (e.g., `~/.gemini/`, `~/.config/`)



## Reference Documents
- **BRD**: `TalentX Business Requirements Document (BRD).docx` (project root)
- **Auth & User Lifecycle Specification**: `auth-and-user-lifecycle.md` (project root)
- **Frontend Design Specification**: `DESIGN.md` (project root)
- **PR & Commit Standard**: `PR.md` (project root)
- **JIRA Project Key**: `TX26`
- **JIRA Board**: https://talentx.atlassian.net/
- **Graph Map**: `graphify-out/GRAPH_REPORT.md`
  - God-nodes: `AGENTS.md` (11 edges), `CLAUDE.md` (11 edges), `Feature Development Workflow` (10 edges)
  - Key communities: Clean Architecture Skill, Security Rules, Feature Development Workflow, Frontend Dependencies

## User & Authentication Flow Model
- **No Sign Up for Talent**: Candidates never register through a public `/signup` page.
- **Talent JIT Provisioning**: When a guest candidate applies to a job, backend automatically creates `User` (`Role: Talent`, `IsVerified: false`) and emails a generated temporary password. No extra DB columns are used (`IsVerified` field handles state).
- **Talent First Login**: Logging in with the temporary password forces redirection to `/change-password`. Setting a new password marks `IsVerified: true` and opens Talent Dashboard.
- **Returning Talent**: Applying with an existing email sends a 10-minute temporary password/OTP to confirm application.
- **Employer Registration**: Standard `/signup` flow with duplicate email check, OTP confirmation, and redirection to Employer Dashboard.

## Active Skills (use these before coding)
- `dotnet-clean-architecture` — enforces layer patterns, entity/value-object templates
- `feature-development` — step-by-step workflow from branch to commit
- `jira-ticket-planner` — fetch ticket → plan → get approval → then code
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


## Sprint & Jira Workflow (Team-Wide Developer Standard)
- **Mandatory Tool & MCP Verification**: Before interacting with tickets or repositories, always check available MCP tools first. Use Jira MCP tools (e.g. action: get/search) and Bitbucket/Composio MCP tools as the primary mechanism for fetching ticket details, managing transitions, or reviewing code changes.
- **Ticket Assignment**: Every developer on the team must fetch only their assigned tickets using Jira query `assignee = currentUser() AND project = TX26 AND sprint in openSprints()`. Never pull or modify tickets assigned to other developers.
- **Branch Isolation**: Cut feature branches directly from `origin/dev` using the standard pattern: `TX26-XXX-short-description`. Never commit directly to `dev`, `staging`, or `main`.
- **Pre-Implementation Requirement**: Always run the ticket planning workflow (e.g. `jira-ticket-planner` skill) to analyze acceptance criteria, map Domain/Application/Infrastructure/API layers, check accessibility (WCAG 2.1 AA) and security requirements, and get plan alignment before writing code.
- **Cross-Ticket Dependencies**: Reconstruct integration points directly from related ticket acceptance criteria or open tickets. Coordinate API contracts and schema migrations early across the team.
- **Sprint Overview**: Always check the Jira board (https://talentx.atlassian.net/) for the current active sprint goal, ticket states, and assignments.
- **Native ADF Formatting Standard (STRICT)**: Jira Cloud REST API v3 renders raw markdown strings (`###`, `**`, `*`) and wiki markup (`h3.`, `*`, `{{...}}`) as literal plain text. Whenever writing, creating, updating, or commenting on Jira issues via Jira MCP tools, you MUST ALWAYS provide a native Atlassian Document Format (ADF) object (`{ "type": "doc", "version": 1, "content": [...] }`). NEVER pass raw markdown or wiki markup strings.
