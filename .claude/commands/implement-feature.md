<!-- Last Updated: 2026-08-14 | Added: frontend module layer, BRD/JIRA rules, sprint context note, project-level constraint -->
> **Tool Priority (MANDATORY)**: Always check available MCP tools first. If Jira or Bitbucket/Composio MCP tools are available in the session, use them to inspect ticket criteria, check repository state, and verify remote PRs before implementing.
> **Always stay at project level** — only create or modify files inside `talentx2026q3.backend/` or `talentx2026q3.frontend/`. Never touch global/system directories.

Implement the feature following the appropriate architecture order:

**Backend (Clean Architecture):**
1. Domain layer first (entities, value objects, events, repository interfaces)
2. Application layer (commands, queries, validators, handlers, DTOs)
3. Infrastructure layer (EF Core configs, repositories, services, migrations)
4. API layer (controllers, DI registration)

**Frontend (Modular Architecture):**
1. Types (`modules/[feature]/types/`)
2. Services — Axios calls (`modules/[feature]/services/`)
3. Hooks — TanStack Query (`modules/[feature]/hooks/`)
4. Components — UI (`modules/[feature]/components/`)
5. Page — wire up in `app/`, import from `modules/[feature]/index.ts`

For each layer:
- Follow the project's code standards (sealed classes, records for DTOs, CancellationToken on async, C# 13 features) [EXISTING — unverified]
- Apply security rules (no hardcoded secrets, IPasswordHasher, IDataProtector for tokens, no raw SQL, no PII in logs) [EXISTING — unverified]
- One class per file, file name matches type name
- Organize by feature (Features/EntityName/ for backend; modules/[feature]/ for frontend)
- Google OAuth supported alongside email/password [BRD §4.1, TX26-191]
- Only `Published` jobs visible in public-facing endpoints [TX26-192]
- Resume file type and size validated before AI extraction [TX26-194]
- GDPR: no unencrypted PII at rest [BRD §7]

After implementation:
- Backend: run `dotnet build` to verify zero warnings and `dotnet test` to ensure all tests pass
- Frontend: run `npm run build` to verify zero errors and `npm test`
- Commit using conventional commits: `feat(scope): description`
- **Strict PR & Commit Standard**: Strictly follow [`PR.md`](file:///Users/jubair/Developer/asthait/talentx/PR.md) for generating commit messages, commit descriptions, PR summaries, AI usage declarations, understanding & ownership descriptions, testing evidence, and pre-merge validation checklists.

> Current sprint: **TX26-191** (Employer Registration & Onboarding) is assigned to you.

