---
name: create-subtasks
description: >-
  Creates QA-testable sub-tasks for any Jira ticket in the TX26 project.
  Sub-tasks are written as practical user scenarios or actions — not technical
  implementation steps — so QA engineers can read each sub-task and know exactly
  what to click, verify, or test. Activate when asked to add sub-tasks, create
  test scenarios, or break a ticket into QA-checkable items.
---

# Create Sub-tasks Skill

## Purpose

Break a parent Jira ticket into QA-testable sub-tasks. Each sub-task describes
a real user action, scenario, screen state, or visible outcome — never an
internal implementation step. QA must be able to read the sub-task title alone
and know what to test.

---

## When to Activate

Activate when the user asks to:
- Add sub-tasks to a ticket
- Create QA scenarios or test cases for a ticket
- Break a ticket into testable items
- Move a ticket to Ready for QA and add sub-tasks

---

## Step 1 — Fetch the Ticket

Use the Jira MCP tool `jira_issues` with `action: get` to fetch the parent
ticket. Read the summary and description fully. Extract:

- What the feature or fix does
- What the user-visible behavior is before and after
- Any error messages or states mentioned
- Which pages, buttons, or flows are involved

---

## Step 2 — Identify Sub-task Scenarios

Identify 3–6 distinct QA-testable scenarios from the ticket. For each scenario
ask: "Can a QA engineer test this by clicking around the app without reading
source code?"

**Allowed sub-task types:**

| Type | Example title |
|---|---|
| Happy path action | "Publish a fully filled draft job from the 3-dot menu" |
| Error / validation state | "Try to publish an incomplete draft and verify the missing fields error message" |
| Post-action state check | "Verify the job status and success toast after publishing a draft" |
| Recovery / retry flow | "Fix a partially filled draft and successfully publish it after completing all required fields" |
| Permission / access check | "Verify an unverified employer cannot publish a job" |
| UI visibility check | "Verify the Publish option only appears on Draft jobs in the 3-dot menu" |

**Forbidden sub-task types (never create these):**

- "Add FluentValidation validator for publish command" — too technical
- "Implement PATCH /api/jobs/{id}/publish endpoint" — implementation, not test
- "Write unit tests for PublishJobCommandHandler" — not QA-testable in the app
- "Migrate database schema" — invisible to QA
- "Fix null reference in handler" — not a user scenario

---

## Step 3 — Write Each Sub-task

For each scenario, write:

**Summary (title):** Short, action-oriented sentence. Start with a verb.
Use plain language. No technical jargon (no "endpoint", "handler", "DTO",
"validator", "EF Core", "MediatR"). Max 10 words preferred.

Good: "Publish a fully filled draft job from the My Jobs 3-dot menu"
Bad: "Verify PublishJobCommandHandler returns 204 NoContent on valid request"

**Description:** Step-by-step instructions a QA engineer can follow.
Write as numbered steps. Include:
1. Where to navigate (page name, menu, button)
2. What action to take
3. What to verify (visible outcome, toast message, status badge, page redirect)

Example description:
```
Go to My Jobs page. Find a job saved as Draft. Click the 3-dot menu on that
job. Click "Publish Job". Verify the confirmation dialog appears. Confirm.
Verify the job status changes to Published on the list. Verify the success
toast appears. Verify the job is now visible on the public job listing page.
```

---

## Step 4 — Create Sub-tasks via Jira MCP

For each sub-task, call `jira_issues` with:

```json
{
  "action": "create",
  "projectKey": "TX26",
  "issueType": "Sub-task",
  "summary": "<QA-friendly title>",
  "description": "<step-by-step QA instructions>",
  "priority": "High or Medium",
  "assignee": "<same as parent ticket assignee if known>",
  "customFields": {
    "parent": { "key": "<parent ticket key e.g. TX26-383>" }
  }
}
```

Create sub-tasks one at a time (sequential calls). After each creation, note
the new sub-task key and URL returned.

---

## Step 5 — Report Back

After all sub-tasks are created, report:
- Parent ticket key and new status
- List of created sub-tasks with keys and titles

Format:
```
TX26-383 — Ready for QA

Sub-tasks created:
- TX26-384: Publish a fully filled draft job from the My Jobs 3-dot menu
- TX26-385: Try to publish an incomplete draft and verify the missing fields error
- TX26-386: Verify the job status and success toast after publishing
- TX26-387: Fix a partially filled draft and re-publish successfully
```

---

## Rules (STRICT)

1. **No technical sub-tasks.** Sub-task titles and descriptions must describe
   what a QA engineer sees and does in the browser, not what code does.

2. **Every sub-task must be independently testable.** QA should be able to test
   it without testing another sub-task first (except where the scenario is
   explicitly a sequential flow).

3. **Use the Jira MCP tool.** Never guess or hallucinate ticket IDs. Always
   fetch the parent ticket first to confirm it exists and read its content.

4. **Always set `parent` in `customFields`** when creating Sub-tasks. Without
   this the sub-task will not be linked to the parent ticket.

5. **3 sub-tasks minimum, 6 maximum.** Fewer is too few to cover the feature;
   more becomes redundant noise for QA.

6. **Priority:**
   - Happy path and main error state: High
   - Secondary flows and edge cases: Medium

7. **Never move the parent ticket to Ready for QA unless the user explicitly
   asks.** This skill only creates sub-tasks unless told otherwise.

---

## MCP Tools Used

- `jira_issues` — fetch parent ticket, create sub-tasks
- `jira_workflow` — transition parent ticket status (only when asked)
- `jira_search` — look up sprint or project context if needed

All Jira operations go through the configured Jira MCP server
(`jira-mcp_jira`). No direct API calls, no curl scripts.
