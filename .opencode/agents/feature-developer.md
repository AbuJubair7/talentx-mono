---
name: feature-developer
description: Implements features following TalentX Clean Architecture patterns end-to-end.
mode: subagent
---
<!-- Last Updated: 2026-08-14 | Added: sprint context, BRD/JIRA rules, Google OAuth note, GDPR note, job status rule, frontend module layer note -->

# Feature Development Agent

> **Tool Priority (MANDATORY)**: Before starting work, always inspect available MCP tools in the active session. If relevant MCP tools (e.g. Jira MCP, Bitbucket/Composio MCP) are available, you MUST use them as the primary way to fetch ticket requirements, verify acceptance criteria, review remote repositories, or inspect pull requests. Do NOT resort to manual guesswork, hallucinated requirements, or asking the user for details that tools can provide.

Implement features following Clean Architecture order:

## Implementation Order (Backend)
1. **Domain Layer**: Entities, repository interfaces (NO value objects, NO domain events)
2. **Application Layer**: Commands/queries, validators, handlers, DTOs, service interfaces
3. **Infrastructure Layer**: EF Core configurations, repository implementations, external services
4. **Migrations**: `TalentX.Migrations` project (design-time only)
5. **API Layer**: Controllers inheriting `BaseApiController`, DI registration, middleware

## Implementation Order (Frontend)
1. **Types**: TypeScript interfaces in `modules/[feature]/types/`
2. **Services**: Axios API calls in `modules/[feature]/services/`
3. **Hooks**: TanStack Query hooks in `modules/[feature]/hooks/`
4. **Components**: UI in `modules/[feature]/components/`
5. **Page**: Wire up in `app/` route, import only from `modules/[feature]/index.ts`

## Code Standards (Backend)
- Use `sealed` on classes not designed for inheritance
- Use `record` for DTOs, `class` for entities/services
- Always include `CancellationToken` on async methods
- Use C# 13 / .NET 10 features where appropriate (primary constructors, collection expressions)
- Prefer expression bodies only for single-line members
- One class/interface/record per file, file name matches type name
- Organize by feature: `Features/EntityName/`
- Handlers return the DTO directly (or `Unit`) and **throw** `AppException` subclasses on failure. There is NO `Result<T>` type in this codebase.
- One FluentValidation validator per command/query
- Controllers inherit from `BaseApiController` (there is no `ApiController` base class); apply `[ApiController]`; no business logic in controllers
- No Magic Numbers: business constants belong in dedicated constant classes under `Features/{Feature}/Constants/`
- Max 5 Parameters Limit: encapsulate more than 5 arguments into dedicated typed parameter objects
- No hardcoded parameter defaults in method signatures
- Single HTTP verb per action; REST semantics for state transitions (`[HttpPatch]`)
- No boilerplate `[ProducesResponseType]` on actions
- Developer-friendly structured logging without emojis or ASCII banners

## Code Standards & Accessibility (Frontend)
- React Components: PascalCase; Hooks: camelCase prefixed `use`; Services: camelCase
- Do NOT use `useEffect` for data fetching — use TanStack Query hooks
- Use `'use client'` only for interactive components (state, effects, query hooks)
- Use shadcn/ui primitives (`base-nova` style built on `@base-ui/react` — **not** Radix); Tailwind CSS v4
- **WCAG 2.1 AA Standards (STRICT)**:
  - Text Contrast: Minimum 4.5:1 for normal text (< 18.66px bold) and 3:1 for large text / UI elements. White-text buttons MUST use `bg-emerald-700` (`#047857`, 5.48:1 contrast); `bg-emerald-500`/`bg-emerald-600` are forbidden for normal button text.
  - Visible Focus Rings: Form controls and text boxes (`<Input>`, `<Textarea>`, `<select>`) MUST use `focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0` (border changes to emerald; no outer ring or ambient background glow effect on click or keyboard tab). Action buttons, links, and navigation on light surfaces use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2` (or white on dark, `focus-visible:ring-emerald-700` on emerald buttons). Never use `outline-none` without an explicit focus indicator.
  - Motion Reduction: Honor `motion-reduce:animate-none` on all animations.
  - Accessible Carousels: Container `role="region"` + `aria-roledescription="carousel"`, slides `role="group"` + `aria-roledescription="slide"`, Pause/Play controls, hover/focus pausing, and live announcements.

## Security Rules
- Passwords: `IPasswordHasher<T>` only
- Tokens: `IDataProtector` only, never `Guid.NewGuid()`
- Validate ALL inputs via FluentValidation
- `[AllowAnonymous]` on public, `[Authorize]` on protected
- Duplicate email → 409 Conflict
- Errors flow through central `ExceptionMiddleware`: `{ Message }`, plus `Errors[]` on validation failures — NOT RFC 7807 Problem Details
- Never log passwords, tokens, or PII
- Parameterized queries / EF Core only — no raw SQL
- Filename Sanitization: Use `TalentMediaStorageKeyGuard.SanitizeFileNameSegment`/`BuildStorageKey` for Talent media storage keys (OS-neutral); `Path.GetFileName()` elsewhere
- Google OAuth supported alongside email/password [BRD §4.1, TX26-191]
- GDPR: encrypt PII at rest, no unencrypted personal data [BRD §7]
- `Job.Status` must be `Published` before public visibility [TX26-192]
- Resume file type and size validated before AI extraction [TX26-194]
- Bitbucket Protection: Never delete repositories, never auto-delete branches on merge (`close_source_branch = false`)
- Always stay at project level — never make changes outside the project directory or at the system/global level

## After Implementation
Run `dotnet build` & `dotnet test` (backend) or `npm run build` & `npm test` (frontend) to verify zero warnings/errors before committing.
Use conventional commits: `feat(scope): description`.
> **Strict PR & Commit Standard**: Strictly follow [`PR.md`](file:///Users/jubair/Developer/asthait/talentx/PR.md) for generating commit messages, commit descriptions, PR summaries, AI usage declarations, understanding & ownership descriptions, testing evidence, and pre-merge validation checklists. Write PR descriptions to `pr-description.md` with `[✔]` checkmarks. Never cite competitor brands.

## Sprint & Jira Workflow (Team-Wide Developer Standard)
- **Tool Verification First**: Always check available MCP tools first. Use Jira MCP tools (e.g. `jira_issues`, `jira_search`) and Bitbucket/Composio MCP tools to retrieve ticket specifications, update progress, and inspect PRs.
- Every developer fetches only their assigned tickets using `assignee = currentUser() AND project = TX26 AND sprint in openSprints()`.
- Cut feature branches from `origin/dev`: `TX26-XXX-short-description`. Never commit directly to `dev`, `staging`, or `main`.
- Plan thoroughly with `jira-ticket-planner` before writing code. Check acceptance criteria, Clean Architecture layer mapping, and WCAG 2.1 AA compliance.
