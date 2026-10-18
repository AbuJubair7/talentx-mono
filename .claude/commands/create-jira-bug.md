> **Tool Priority (MANDATORY)**: Always check available MCP tools first. You MUST use Jira MCP tools (`jira_issues`, `jira_attachments`, `jira_search`) to create issues and upload screenshots.

Create a structured Jira Bug ticket in the target project using the arguments:
$ARGUMENTS

### Instructions:
1. Parse the user request to extract:
   - Defect details: Description, Steps to Reproduce, Actual Results, Expected Results.
   - Jira URL or board context: extract project key dynamically (`/projects/{KEY}/` or `{KEY}-123`) and assignee from `assignee=` URL parameter if present.
   - Screenshots/Images: check if any image was pasted or attached in the prompt (conversation media or image paths).
2. Formulate the bug ticket:
   - **Summary**: Clear component and issue description (e.g., `[Component]: [Bug description]`).
   - **Issue Type**: `Bug`.
   - **Priority**: High, Medium, or Low (default: Medium).
3. **Format as Atlassian Document Format (ADF)**:
   - Pass description as a native ADF object (`type: "doc"`, `version: 1`) containing:
     - Heading 3: `Description` + paragraph summary.
     - Heading 3: `Steps to Reproduce` + numbered ordered list.
     - Heading 3: `Actual Results` + bullet list of observed faulty behavior.
     - Heading 3: `Expected Results` + bullet list of expected correct behavior.
   - This ensures zero raw `###` or `**` markdown characters appear in Jira.
4. Call `jira_issues` (`action: "create"`, `projectKey`, `issueType: "Bug"`, `summary`, `description: <ADF>`, `priority`).
5. **Upload Screenshots / Attachments**:
   - If image(s) were attached or pasted, call `jira_attachments` (`action: "upload"`, `issueKey`, `filePath: "<local_image_path>"`).
6. Verify and output the created ticket URL, key, summary, and uploaded attachments.
