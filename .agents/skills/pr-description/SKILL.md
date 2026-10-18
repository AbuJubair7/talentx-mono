---
name: pr-description
description: >-
  Generates standardized Pull Request descriptions for both Frontend and Backend
  repositories. Strictly follows the mandatory format and sections defined in
  PR.md. Triggers whenever the user or workflow asks to generate, write, format,
  or prepare a PR description, pull request summary, or PR template.
---

# Pull Request Description Generation Skill

## Purpose
This skill ensures that all Pull Request descriptions generated for **TalentX** (across both `talentx2026q3.backend` and `talentx2026q3.frontend`) strictly adhere to the mandatory project template in [`PR.md`](file:///Users/jubair/Developer/asthait/talentx/PR.md), placing the generated output directly into [`pr-description.md`](file:///Users/jubair/Developer/asthait/talentx/pr-description.md) in the project workspace root.

---

## Trigger Conditions
Activate this skill automatically whenever:
- The user asks for a PR description, PR template, or pull request summary.
- Preparing a PR description for Backend (`talentx2026q3.backend`) or Frontend (`talentx2026q3.frontend`).
- Writing release or pull request documentation before submission.

---

## Output Target File (MANDATORY)
* **Always write the final PR description directly to [`pr-description.md`](file:///Users/jubair/Developer/asthait/talentx/pr-description.md) in the project root** (do NOT place it inside `talentx2026q3.backend/` or `talentx2026q3.frontend/`).

---

## Checkbox Formatting Rule (STRICT)
* **Completed / Checked Items**: Use a checkmark directly inside the box: **`- [✔]`**.
* **Unchecked / Pending Items**: Use an empty box: **`- [ ]`**.
* **Never use cross signs**: Do NOT use `[x]` as it looks like a cross. Only use `[✔]` for done and `[ ]` for not done.

---

## Workflow Steps

### Step 1 — Inspect Changes & Context
Before drafting the PR description:
1. **Identify the Repository & Branch**:
   - Determine if the change belongs to Backend (`talentx2026q3.backend`), Frontend (`talentx2026q3.frontend`), or both.
   - Check current git branch and recent commits (`git log origin/dev..HEAD --oneline`).
2. **Fetch JIRA Ticket Context**:
   - Identify the JIRA ticket key from the branch name (e.g., `TX26-191`).
   - Ensure all commit messages and descriptions cite the JIRA ticket ID.
3. **Verify Build & Test Status**:
   - Backend: Ensure `dotnet build` has 0 warnings/errors and `dotnet test` passes.
   - Frontend: Ensure `npm test` and `npm run build` pass.

---

### Step 2 — Generate PR Description (Mandatory Template)
The generated PR description **MUST** follow this exact format from [`PR.md`](file:///Users/jubair/Developer/asthait/talentx/PR.md) without omitting any section:

```markdown
**Summary**

[Clear, concise description of what this PR does, the problem it solves, and key features introduced]

**Commit messages**

-   [TX26-XXX]: [type]([scope]): [imperative description of commit 1]
-   [TX26-XXX]: [type]([scope]): [imperative description of commit 2]

**AI Usage Declaration**

Was AI used in this PR?

- [✔] Yes
- [ ] No

If yes:

**AI Tools Used**

[e.g., Antigravity / Gemini CLI, Claude Code, ChatGPT, Copilot]

**AI-Assisted Sections**

[Clearly describe which components, handlers, endpoints, or tests were generated or heavily assisted]

**Understanding & Ownership**

Explain the AI-generated logic in your own words:

[Thorough 2-4 sentence explanation demonstrating complete technical ownership of how the code works]

Key design decisions:

[Bullet points outlining architectural choices, layer separation, performance, or security decisions]

**Validation Performed**

- [✔] Code reviewed manually
- [✔] Unit tests added/updated
- [✔] Integration tests validated
- [✔] Edge cases considered
- [✔] Performance impact checked (if applicable)
- [✔] Security implications reviewed

**Testing Evidence**

-   Test cases added: [List key test classes/methods added, e.g., RegisterEmployerCommandHandlerTests, SignupFormTests]
-   Screenshots / logs (if applicable): [dotnet test / npm test results output, e.g., "Passed! 25/25 tests passed"]
-   Test coverage impact: [Coverage summary or impacted modules]

**Risks & Considerations**

-   Potential risks: [Any backward compatibility, migration, or environment dependencies]
-   Assumptions made: [e.g., Assumptions about environment variables or downstream services]
-   Areas needing extra review: [Specific files or complex logic requiring careful peer review]

**AI Impact (Optional but Recommended)**

-   Estimated time saved: [e.g., ~2-3 hours]
-   What would have taken longer without AI: [e.g., Boilerplate CQRS commands, Zod schema mappings, test mock setups]

**Checklist (Must Pass Before Merge)**

- [✔] I fully understand all code in this PR
- [✔] AI-generated code has been validated
- [✔] Code follows project architecture & standards
- [✔] No sensitive data was exposed to AI tools
- [✔] Reviewer can easily understand changes
```

---

## Guidelines for Specific Stacks

### Backend PRs (`talentx2026q3.backend`)
- Emphasize Clean Architecture compliance (Domain → Application → Infrastructure → API).
- Mention MediatR CQRS commands/queries, EF Core migrations, FluentValidation validators, and the central `ExceptionMiddleware` error contract (`{ Message }`, plus `Errors[]` on validation failures). This codebase does NOT use RFC 7807 Problem Details — never describe it as such.
- Include `dotnet test` execution output under **Testing Evidence**.

### Frontend PRs (`talentx2026q3.frontend`)
- Emphasize modern B2B recruitment UI design alignment, modular architecture (`modules/[feature]/`), and React Query hooks.
- Mention Tailwind CSS v4 / shadcn/ui components, Zod schemas, and responsive layouts.
- Include `npm test` and `next build` test/build validation under **Testing Evidence**.

---

## Strict Rules
1. **Never skip any section** of [`PR.md`](file:///Users/jubair/Developer/asthait/talentx/PR.md).
2. **Never leave placeholders (`//`)** — replace all comments with actual project and code details.
3. **Always write to `pr-description.md` in the project root**.
4. **Always put tick mark `[✔]` inside the box for completed items**, and `[ ]` for unchecked items.
5. **Always cite JIRA ticket keys** (e.g., `TX26-191`) in commit summaries.
6. **NEVER mention external competitor or third-party platform brand names** in any PR description, commit message, PR title, or summary. Always use neutral technical descriptions such as "modern B2B recruitment UI design", "split-screen auth layouts", or "card-based job interface".
