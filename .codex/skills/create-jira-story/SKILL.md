---
name: create-jira-story
description: >-
  Creates user-centric Jira Story tickets in any project using Jira MCP.
  Formats the description using Atlassian Document Format (ADF) so headings, bold
  text, and lists render cleanly in Jira without raw markdown artifacts (no ###,
  no **). Formulates standard User Story phrasing (As a... I want... So that...),
  structures clear Acceptance Criteria, assigns to the specified user or board
  assignee, and excludes Out of Scope sections.
---

# Create Jira Story Skill

## Purpose

Create a well-structured, user-focused Jira Story on any Jira project board using Jira MCP tools.
The story must reflect end-user value (non-technical narrative), use native Atlassian Document Format (ADF) to prevent raw markdown characters (`###`, `**`), dynamically resolve project key and assignee, and omit "Out of Scope" sections.

---

## When to Activate

Activate when the user:
- Calls `/create-jira-story` with context and a Jira link.
- Asks to create a Jira story, user story, or backlog ticket with requirements and a Jira URL.

---

## Step 1 — Parse Input & Detect Project Context

From the user's prompt and link, extract:
1. **Requirements / Feature Context**: What user capability is requested.
2. **Jira URL / Board Context**:
   - **Project Key**: Extract dynamically from the URL (e.g. `/projects/{PROJECT_KEY}/` or from issue key in `selectedIssue={PROJECT_KEY}-123` or `{PROJECT_KEY}-123`).
   - **Assignee**: Extract assignee account ID from the URL if present (e.g. `assignee=...`). If not present, look up the current user or assignee via Jira MCP (`jira_search` with action `users`).
3. **Reference Tickets**: If an existing issue key is linked, fetch it via Jira MCP `jira_issues` (`action: get`) to reference the team's existing conventions.

---

## Step 2 — Formulate the Story Structure

A Jira Story must focus on user behavior and outcomes, not technical implementation details.

### 1. Summary (Title)
- Short, action-oriented, user-facing summary.
- Format: `View [Feature] on [Page/Component]` or `[Action] [Subject] from [Context]`
- Example: `View Applicant Pipeline Summary Modal from Job Card on My Jobs`

### 2. User Story Narrative
Always follow standard user story format:
```text
As a [User Role - e.g. Employer, Candidate, Admin],
I want to [action / capability],
So that [benefit / business value].
```

### 3. Acceptance Criteria
Organize into logical functional sections:
- **Core User Flow / Interaction**: What the user clicks, keys, or navigates.
- **Display & Content Details**: What data, charts, badges, or states appear.
- **Empty / Edge / Loading States**: How zero-data or loading states render.
- **Accessibility & Dismissal**: Keyboard navigation, closing behavior, responsive layout.

### 4. Out of Scope Rule (STRICT)
- **DO NOT include an "Out of Scope" section in the ticket.** Keep the story focused exclusively on deliverables.

---

## Step 3 — Format as Atlassian Document Format (ADF)

Jira Cloud API v3 renders raw markdown strings (`###`, `**`) literally as plain text.
To display headings, bold labels, and bullet lists correctly in Jira, the description **MUST** be passed as an ADF object (`type: "doc"`, `version: 1`).

### ADF Template Structure:

```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "As an [Role],\nI want to [Action],\nSo that [Benefit]."
        }
      ]
    },
    {
      "type": "heading",
      "attrs": { "level": 3 },
      "content": [
        { "type": "text", "text": "Acceptance Criteria" }
      ]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "Feature Group Name", "marks": [{ "type": "strong" }] },
                { "type": "text", "text": ":" }
              ]
            },
            {
              "type": "bulletList",
              "content": [
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        { "type": "text", "text": "Specific verifiable behavior requirement." }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Step 4 — Create the Ticket via Jira MCP

Call `call_mcp_tool` with ServerName `jira-mcp_jira` and ToolName `jira_issues`:

```json
{
  "action": "create",
  "projectKey": "<DETECTED_PROJECT_KEY>",
  "issueType": "Story",
  "summary": "<User Story Summary>",
  "description": <ADF doc object>,
  "priority": "Medium",
  "assignee": "<assignee account ID if provided>"
}
```

If assignee is not set during creation, call `action: assign` with `issueKey` and `assignee`.

---

## Step 5 — Verify and Report

1. Fetch created ticket with `action: get` to confirm fields and status.
2. Report the result to user:
   - Issue Key (with clickable link)
   - Issue Summary
   - Assignee
   - Status
   - Direct Jira URL
