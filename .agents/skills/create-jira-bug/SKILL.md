---
name: create-jira-bug
description: >-
  Creates structured Jira Bug tickets in any project using Jira MCP.
  Formats the description using Atlassian Document Format (ADF) so headings,
  ordered steps, and lists render cleanly in Jira without raw markdown artifacts
  (no ###, no **). Structures standard bug sections: Description, Steps to
  Reproduce, Actual Results, and Expected Results. Automatically uploads pasted
  or attached images using Jira MCP attachments.
---

# Create Jira Bug Skill

## Purpose

Create a well-structured, professional Jira Bug ticket on any Jira project board using Jira MCP tools.
The bug report must follow standard QA/engineering structure (Description, Steps to Reproduce, Actual Results, Expected Results), format with native Atlassian Document Format (ADF) to avoid raw markdown characters (`###`, `**`), dynamically resolve project key and assignee, and upload any pasted/attached images as issue attachments.

---

## When to Activate

Activate when the user:
- Calls `/create-jira-bug` with bug details and an optional Jira link.
- Asks to create a Jira bug, defect, or issue ticket with reproduction steps or screenshots.

---

## Step 1 — Parse Input & Detect Context

From the user's prompt and link, extract:
1. **Bug Details**:
   - What went wrong (problem description).
   - Steps to trigger or reproduce the bug.
   - Actual observed result/behavior.
   - Expected result/behavior.
2. **Images / Screenshots**:
   - Check if an image is pasted or attached in the conversation (check message media paths, temporary image paths, or local file references).
   - Keep note of local file paths for attachment upload.
3. **Jira URL / Project Context**:
   - **Project Key**: Extract dynamically from the URL (e.g. `/projects/{PROJECT_KEY}/` or `{PROJECT_KEY}-123`). If absent, ask or check current Jira context.
   - **Assignee**: Extract assignee account ID from `assignee=` URL parameter if present. Otherwise, resolve current user via Jira MCP.
   - **Priority**: Detect severity/priority (High, Medium, Low; default to `Medium`).

---

## Step 2 — Formulate Bug Structure

### 1. Summary (Title)
- Concise, descriptive bug title indicating component and failure.
- Format: `[Component/Page]: [Defect description]` or `[Defect description] on [Component/Page]`
- Example: `Notification bell icon only displays dot indicator without unread counter`

### 2. Required Bug Sections
The bug must contain these exact sections:
1. **Description**: Concise summary of what is broken and where it occurs.
2. **Steps to Reproduce**: Numbered, step-by-step instructions to recreate the bug.
3. **Actual Results**: What actually happens (the faulty behavior or error message).
4. **Expected Results**: What should happen under correct behavior.

---

## Step 3 — Format as Atlassian Document Format (ADF)

Jira Cloud API v3 renders raw markdown strings (`###`, `**`) literally as plain text.
To display headings, numbered lists, and bold text correctly in Jira, pass the description as an ADF object (`type: "doc"`, `version: 1`).

### ADF Template Structure:

```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 3 },
      "content": [{ "type": "text", "text": "Description" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "<Bug overview summary>" }]
    },
    {
      "type": "heading",
      "attrs": { "level": 3 },
      "content": [{ "type": "text", "text": "Steps to Reproduce" }]
    },
    {
      "type": "orderedList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Navigate to <Page/Screen>." }]
            }
          ]
        },
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Click or trigger <Action>." }]
            }
          ]
        }
      ]
    },
    {
      "type": "heading",
      "attrs": { "level": 3 },
      "content": [{ "type": "text", "text": "Actual Results" }]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "<Observed faulty behavior>" }]
            }
          ]
        }
      ]
    },
    {
      "type": "heading",
      "attrs": { "level": 3 },
      "content": [{ "type": "text", "text": "Expected Results" }]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "<Expected correct behavior>" }]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Step 4 — Create Bug Ticket via Jira MCP

Call `call_mcp_tool` with ServerName `jira-mcp_jira` and ToolName `jira_issues`:

```json
{
  "action": "create",
  "projectKey": "<DETECTED_PROJECT_KEY>",
  "issueType": "Bug",
  "summary": "<Bug Summary>",
  "description": <ADF doc object>,
  "priority": "<Priority: High | Medium | Low>",
  "assignee": "<assignee account ID if provided>"
}
```

If assignee was not set during creation, call `action: assign` with `issueKey` and `assignee`.

---

## Step 5 — Upload Image Attachments (If Present)

If the user pasted or attached screenshots/images in the prompt:
1. Locate the image file on local disk (from media URI or prompt path).
2. Call `call_mcp_tool` with ServerName `jira-mcp_jira` and ToolName `jira_attachments`:

```json
{
  "action": "upload",
  "issueKey": "<CREATED_ISSUE_KEY>",
  "filePath": "<ABSOLUTE_LOCAL_IMAGE_PATH>"
}
```

Verify that the attachment was successfully attached.

---

## Step 6 — Verify and Report

1. Fetch created ticket with `action: get` to confirm fields, description, and attachments.
2. Report the result to user:
   - Issue Key (with clickable link)
   - Issue Summary
   - Type: Bug
   - Priority
   - Assignee
   - Attachments uploaded (if any)
   - Direct Jira URL
