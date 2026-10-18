---
name: code-quality-rules
description: >-
  Code quality, naming, and consistency standards for TalentX.
  Enforces zero unnecessary comments, fully descriptive variable names,
  and developer-friendly structured logging without emojis.
trigger: always_on
---

# TalentX Code Quality Rules

## General
- Use **C# 13 / .NET 10** features where appropriate (primary constructors, collection expressions, etc.).
- Enable `<Nullable>enable</Nullable>` — handle all nullability warnings, do not suppress them.
- Enable `<ImplicitUsings>enable</ImplicitUsings>` — no redundant `using` statements.
- Treat warnings as errors in production builds (`-warnaserror`).

## Naming Conventions (STRICT)
| Concept | Convention |
|---------|-----------|
| Classes / Interfaces / Records | `PascalCase` |
| Methods | `PascalCase` |
| Parameters / local vars | `camelCase` (Must be full descriptive nouns) |
| Private fields | `_camelCase` |
| Constants | `UPPER_SNAKE` or `PascalCase` |
| Test methods | `MethodName_State_ExpectedResult` |

### Banned Variable Names
- **NEVER use lazy abbreviations**: `tokenRes`, `res`, `req`, `err`, `e`, `tmp`, `temp`, `data`, `val`, `cb`.
- **Always use intention-revealing full names**: `existingTokenResult`, `tokenResponse`, `identityResult`, `validationError`, `signupRequest`.

## File Organization (STRICT)
- **One class/interface/record per file (STRICT)**: Never declare auxiliary classes, DTOs, request records, or payload shapes inside controller or handler files. Every type must live in its own dedicated file matching its name exactly.
- File name must match the type name exactly.
- Organize by feature, not by type (e.g., `Features/Employers/` not `Commands/` and `Handlers/`).

### Frontend Component File Organization (STRICT)
Component files (`.tsx`) must contain **only** the component function and its directly-coupled Props interface. All other code must live in a dedicated file in the module's appropriate subdirectory:

| Code type | Where it lives |
|---|---|
| Interfaces / types shared between components | `types/` |
| Pure utility functions (formatters, parsers, URL builders) | `utils/` |
| Config lookup objects, style maps, named constant objects (e.g., `STATUS_CONFIG`, `BAND_CONFIG`, `SIZE_CLASSES`) | `constants/` |
| API endpoint strings, hub paths, numeric magic values | `constants/` |

**The only exception**: A single `XxxProps` interface for the component's own props **may** stay in the same `.tsx` file — this is standard React convention and keeps the prop contract co-located with the component. No other type, config object, or utility function may be declared inline in a component file.

## Code Style & Clean Code
- Code must be self-documenting.
- Use `sealed` on classes that are not designed for inheritance.
- Prefer `record` for DTOs and value objects, `class` for entities and services.
- Prefer expression bodies only for single-line members.
- Always use `CancellationToken` on all async methods.
- Return `Task` not `void` for async methods (except event handlers).

## Controller & HTTP Endpoint Standards (STRICT)
- **Single HTTP Verb per Action**: Every API controller action method must be decorated with **exactly one HTTP verb attribute** (`[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpPatch]`, or `[HttpDelete]`). Never stack multiple or conflicting HTTP verb attributes (e.g. never mix `[HttpPatch]` + `[HttpPut]`, or `[HttpPost]` + `[HttpPatch]`) on a single action. Each endpoint must have unambiguous routing and REST semantics.
- **REST Verb Semantics for State Transitions**: Partial state and status transitions on existing resources (e.g. `CloseJob`, `ReopenJob`, `PublishJob`, `ArchiveJob`) must use **`[HttpPatch]`**, not `[HttpPost]`. Reserve `[HttpPost]` strictly for resource creation or operations that create subordinate entities.
- **No Boilerplate `[ProducesResponseType]` on Actions**: Do NOT litter controller action methods with repetitive, boilerplate `[ProducesResponseType(StatusCodes.Status...)]` attributes (e.g. 204, 400, 401, 403, 404). All standard HTTP status codes and error responses (`400`, `401`, `403`, `404`, `409`, `500`) are handled centrally and uniformly by `ExceptionMiddleware`. Stacking these attributes creates visual clutter and code bloat without providing runtime value.
- **No Inline Types in Controller Files**: Never declare DTOs, request records, payloads, or auxiliary response types inside controller files (e.g. never declare `ApplyToJobRequestDto` or `CurrentEmployerResult` inside a controller). Every class, record, or interface MUST live in its own separate file matching the type name exactly under the corresponding feature/controller directory.

## Constants & Configuration (STRICT - No Magic Numbers, Reuse Existing Abstractions)
- **No Inline Magic Numbers**: Never hardcode raw numeric literals or business thresholds in controllers, queries, commands, handlers, validators, or repositories (e.g. query limits, default counts, batch sizes).
- **Dedicated Feature Constants**: Business limits and feature defaults must be declared in dedicated constant classes organized by feature under `Features/{Feature}/Constants/{Feature}Constants.cs` (e.g. `EmployerDashboardConstants.RecentJobsLimit = 5`). Both implementation handlers and unit test mocks must reference the centralized constant.
- **Reuse Existing Shared Abstractions**: Do NOT create duplicate constant files for shared concerns if a shared abstraction already exists (e.g. reuse `PaginationRequest` in `TalentX.Application.Common.Models` for shared pagination limits instead of creating redundant files).

## Method Parameters & Parameter Object Pattern (STRICT)
- **No Hardcoded Parameter Defaults**: NEVER hardcode raw literals or magic values directly in method, function, or constructor parameters (e.g., `int count = 5`, `int pageSize = 10`, `int page = 1`, `string role = "Talent"`). Always reference dedicated constants (e.g., `EmployerDashboardConstants.RecentJobsLimit`, `PaginationRequest.DefaultPageSize`, `PaginationRequest.DefaultPageNumber`).
- **Maximum 5 Parameters Limit (Parameter Object Pattern)**: Methods, functions, queries, and constructors must **never exceed 5 parameters**. Whenever an operation requires more than 5 parameters, you MUST encapsulate them into a dedicated typed parameter object, record, or DTO (e.g., `EmployerJobsQueryParams`, `JobSearchCriteria`, `CreateJobParameters`). This prevents primitive obsession, eliminates parameter-ordering bugs, and ensures backward-compatible extensibility across both backend and frontend.

## Comments & Documentation (STRICT)
- **NO Noise Comments**: Never write comments that merely restate what the method or line does (e.g., `// Update profile`, `// Mint tokens`, `// Return response`).
- **NO Boilerplate XML Docs**: Do not add redundant `/// <summary>` comments on internal handlers/validators that merely repeat the class name.
- **Inline comments ONLY for non-obvious "why"**: Complex domain rules, mathematical formulas, or vendor workarounds.
- Remove all TODO / FIXME comments before committing (use Jira tickets instead).

## Logging Standards (STRICT — Developer-Friendly, NO Emojis)
- **STRICTLY NO EMOJIS**: Never use emojis (`🔑`, `⚠️`, `✅`, `👉`, `⏳`, `🚀`) in log messages.
- **NO ASCII art or box banners**: Never use multi-line ASCII boxes or lines (`====`) in log outputs.
- **Developer-Friendly Structured Templates**: Clean, readable English with standard placeholders:
  ```csharp
  _logger.LogInformation("OTP generated for {Email}: {OtpCode} (expires in {ExpiryMinutes}m)", email, otpCode, expiryMinutes);
  _logger.LogWarning("OTP verification failed for {Email}: code mismatch", email);
  ```
- **Masking**: Mask sensitive values (passwords, tokens, PII) in production logs.

## Frontend UI & Accessibility Quality Standards (WCAG 2.1 AA)
- **Contrast Minimums (STRICT)**:
  - Normal text (< 18.66px bold or < 24px regular) requires a minimum contrast ratio of **4.5:1** against the background.
  - Large text (>= 18.66px bold or >= 24px regular) and UI component boundaries require a minimum contrast ratio of **3:1**.
  - All solid emerald buttons with white text MUST use `bg-emerald-700` (`#047857`, 5.48:1 contrast). Never use `bg-emerald-500` (2.47:1) or `bg-emerald-600` (3.77:1) for white-text button labels.
- **Mandatory Focus Rings (STRICT)**:
  - Form controls and text boxes (`<Input>`, `<Textarea>`, `<select>`) MUST use the clean emerald border focus standard: `focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0` (border color changes to emerald; no outer ring or background glow effect on click or keyboard tab).
  - Never remove outlines (`outline-none`) without providing an explicit focus indicator: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2` on standard light surfaces (or `focus-visible:ring-white` on dark surfaces, `focus-visible:ring-emerald-700` on emerald buttons).
  - All interactive elements (buttons, inputs, links, tabs) must be operable via keyboard navigation.
- **Accessible Carousel & Animation Architecture (STRICT)**:
  - Any moving, rotating, or auto-advancing component must provide a visible, accessible Pause/Play button, pause on hover/focus, and disable auto-motion when `prefers-reduced-motion: reduce` is detected.
  - Carousels must implement WAI-ARIA carousel pattern: container `role="region"` + `aria-roledescription="carousel"` + `aria-label`, slides `role="group"` + `aria-roledescription="slide"` + `aria-label="X of Y"`.

## Git Commit & PR Style (Conventional Commits & PR Standard)
- Format: `type(scope): description`
- Types: `feat`, `fix`, `test`, `refactor`, `chore`, `docs`
- Scope: feature area, e.g., `employer`, `auth`, `job`
- Example: `feat(employer): add email confirmation on registration`
- **Strict PR & Commit Guideline**: Strictly follow [`PR.md`](file:///Users/jubair/Developer/asthait/talentx/PR.md) for generating commit messages, commit descriptions, PR summaries, AI usage declarations, understanding & ownership descriptions, testing evidence, and pre-merge checklists. Never omit required sections.
- **PR Output Location & Format**: Always write the final PR description to [`pr-description.md`](file:///Users/jubair/Developer/asthait/talentx/pr-description.md) in the project workspace root. For checkboxes, always put the checkmark `✔` directly inside the box: `[✔]` if done, and empty `[ ]` if not done (never use cross marks `[x]`).
- **NO BRAND / EXTERNAL PLATFORM MENTIONS (STRICT)**: NEVER mention external platforms or competitor brand names in any PR description, commit message, PR title, or PR summary. Always use neutral technical descriptions such as "modern B2B recruitment UI standard", "split-screen layout", or "card-based interface".
