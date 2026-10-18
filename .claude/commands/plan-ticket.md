<!-- Last Updated: 2026-08-14 | Added: currentUser() fetch rule, frontend layer mapping, sprint context -->
> **Tool Priority (MANDATORY)**: Always check available MCP tools first. You MUST use the Jira MCP tool to retrieve full ticket details, acceptance criteria, and sprint context before planning.
> **Always use `assignee = currentUser()`** when fetching Jira tickets — do not pull all sprint tickets.

1. Check available tools and fetch Jira ticket $ARGUMENTS using the jira MCP tool (action: get, issueKey: $ARGUMENTS).

Then produce a structured implementation plan:
1. Extract summary, description, acceptance criteria, story points, sprint
2. Map each AC to a layer/component:
   - **Backend**: Domain, Application, Infrastructure, API
   - **Frontend**: Types, Services (Axios), Hooks (TanStack Query), Components, Page (`app/`)
3. Identify security requirements, external integrations, open questions
4. List all new/modified files per layer
5. Create a numbered task breakdown in implementation order
6. List risks and open questions

Present the plan and wait for approval before writing any code.

> Current sprint: **TX26-191** (Employer Registration & Onboarding) is assigned to you.
