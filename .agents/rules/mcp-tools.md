---
name: mcp-tool-usage
description: >-
  Enforces checking and prioritizing Model Context Protocol (MCP) tools
  (e.g., Jira, Bitbucket/Composio) before performing tasks, fetching tickets,
  planning features, or inspecting repositories.
trigger: always_on
---

# Mandatory Tool & MCP Usage Rules

## Core Rule: Check Available Tools First (MANDATORY)
Before performing any task, planning features, inspecting code, or fetching project state, all AI agents and providers MUST first check what tools are available in the active session:
1. **Tool Discovery**: Inspect available MCP tools (e.g. Jira MCP, Bitbucket/Composio MCP).
2. **Prioritize MCP Tools**: If a relevant MCP tool exists for the task, you MUST use that tool directly rather than relying on manual guesswork, hallucinated criteria, ad-hoc shell scripts (`curl`, raw HTTP requests), or asking the user for details that available tools can retrieve.
3. **No Unnecessary Prompts**: Do not ask the user for ticket details, pull request statuses, or acceptance criteria when the appropriate MCP tool is configured and available to fetch them.

## Jira MCP Tool Usage
- When working on any feature, ticket, bug, or sprint task, always use available Jira MCP tools (e.g. `jira_issues`, `jira_search`, `@nexus2520/jira-mcp-server`) to fetch the full ticket details, acceptance criteria, story points, and sprint context.
- Query assigned tickets using `assignee = currentUser() AND project = TX26 AND sprint in openSprints()`.
- Use Jira MCP tools to update issue statuses or add progress comments when instructed.
- **Native ADF Formatting Standard (STRICT — NEVER Use Raw Markdown or Wiki Syntax in Jira)**: Jira Cloud REST API v3 renders raw markdown strings (`###`, `**`, `*`) and wiki markup (`h3.`, `*`, `{{...}}`) as literal plain text. Whenever writing, creating, updating, or commenting on Jira issues via Jira MCP tools, you MUST ALWAYS provide a native Atlassian Document Format (ADF) object (`{ "type": "doc", "version": 1, "content": [...] }`). Never pass raw markdown or wiki markup strings.

## Bitbucket / Composio MCP Tool Usage
- When reviewing pull requests, inspecting branches, or checking remote repository state, always check for and use available Bitbucket or Composio MCP tools.
- Strictly adhere to VCS safety rules:
  - **NEVER** delete repositories (`BITBUCKET_DELETE_REPOSITORY` is strictly forbidden).
  - **NEVER** auto-delete branches on merge (`close_source_branch` MUST always be `false`).
  - Merges and write actions require explicit user instructions.

## Fallback Policy
- Only fall back to standard local CLI commands (e.g. local git commands) or asking the user if the specific MCP tool is confirmed absent, disabled, or encounters an unrecoverable failure.
