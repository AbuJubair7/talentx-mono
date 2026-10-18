> **Tool Priority (MANDATORY)**: Always check available MCP tools first. You MUST use Jira MCP tools (`jira_issues`, `jira_search`) to manage issues and retrieve board context.

Create a user-centric Jira Story ticket in the target project using the arguments:
$ARGUMENTS

### Instructions:
1. Parse the user request to extract:
   - Feature context and user behavior requirements.
   - Jira board or ticket URL (extract project key dynamically from `/projects/{PROJECT_KEY}/` or `{PROJECT_KEY}-123`, and assignee account ID from `assignee=` URL parameter if present).
   - If a reference ticket is linked in the URL (e.g. `selectedIssue={KEY}`), fetch it with `jira_issues` (`action: get`) to reference project conventions.
2. Formulate the story as a pure user story:
   - **Summary**: Concise, user-facing title (e.g., `View Applicant Pipeline Summary Modal from Job Card on My Jobs`).
   - **Narrative**:
     ```text
     As a [User Role],
     I want to [action / capability],
     So that [benefit / business value].
     ```
   - **Acceptance Criteria**: Group into clear functional sections (e.g. User Interaction, Content Display, Empty/Loading States, Accessibility).
   - **Out of Scope (STRICT)**: DO NOT include an "Out of Scope" section in the ticket description.
3. **Format as Atlassian Document Format (ADF)**:
   - Pass description as a native ADF object (`type: "doc"`, `version: 1`) so headings, bold text, and bullet lists render cleanly in Jira without raw `###` or `**` markdown characters.
4. Execute issue creation using Jira MCP `jira_issues` (`action: create`, `projectKey: "<PROJECT_KEY>"`, `issueType: "Story"`).
5. If assignee is specified, ensure ticket is assigned to that user.
6. Verify and output the created ticket URL and summary.
