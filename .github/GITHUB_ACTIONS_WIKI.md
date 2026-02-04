# GitHub Actions & Workflows Wiki

> **Wiki Page ID**: `8e92766d04964f54bc3bef5c30e1ad4b`  
> **Tags**: CI/CD, Templates, Best Practices

This document provides comprehensive documentation for GitHub Actions
workflows in the CLD Omnisearch repository, including the
Linear↔Notion automation workflow.

## Table of Contents

- [Overview](#overview)
- [Existing Workflows](#existing-workflows)
- [Linear↔Notion Automation](#linearnotion-automation)
  - [Workflow Architecture](#workflow-architecture)
  - [Setup Instructions](#setup-instructions)
  - [Webhook Configuration](#webhook-configuration)
  - [MCP Integration Notes](#mcp-integration-notes)
  - [Troubleshooting](#troubleshooting)
- [Setup Wizard Pattern](#setup-wizard-pattern)
- [Best Practices](#best-practices)

## Overview

CLD Omnisearch uses GitHub Actions for continuous integration and
deployment. This wiki documents all workflows, their configurations,
and integration patterns.

## Existing Workflows

### Docker Image Build and Push

**File**: `.github/workflows/docker-image.yml`

Automatically builds and pushes Docker images to GitHub Container
Registry (GHCR) on:

- Pushes to `main` branch
- Tag creation (v\*)
- Pull requests to `main` (build only, no push)

**Key Features**:

- Multi-platform builds (linux/amd64, linux/arm64)
- Automated tagging with semantic versioning
- Build caching for faster builds
- Automatic GHCR authentication

## Linear↔Notion Automation

The Linear↔Notion automation workflow synchronizes issue tracking
between Linear and Notion databases, enabling seamless project
management across both platforms.

### Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Linear↔Notion Sync Workflow                  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   Linear    │  │   GitHub    │  │   Notion    │
    │  Webhook    │  │   Actions   │  │     API     │
    └─────────────┘  └─────────────┘  └─────────────┘
              │               │               │
              │      POST     │               │
              └──────────────►│               │
                              │               │
                              │  Authenticate │
                              ├──────────────►│
                              │               │
                              │  Sync Issue   │
                              ├──────────────►│
                              │               │
                              │  Update Status│
                              │◄──────────────┤
                              │               │
                              ▼               ▼
                    ┌──────────────────────────┐
                    │  MCP Server Integration  │
                    │  (Model Context Protocol)│
                    └──────────────────────────┘
```

**Workflow Components**:

1. **Linear Webhook Trigger**: Listens for issue events from Linear
2. **GitHub Actions Runner**: Processes webhook payloads and
   orchestrates sync
3. **Notion API Integration**: Updates corresponding Notion database
   entries
4. **MCP Server**: Provides unified context for AI-powered automation

**Data Flow**:

```
Linear Issue Update → Webhook Payload → GitHub Actions Workflow
                                              ↓
                                    Parse & Transform Data
                                              ↓
                                    Notion API Update
                                              ↓
                                    MCP Context Sync
                                              ↓
                                    Completion Status
```

### Setup Instructions

#### Prerequisites

Before setting up the Linear↔Notion automation, ensure you have:

1. **Linear Account** with admin access to your workspace
2. **Notion Account** with API access enabled
3. **GitHub Repository** with Actions enabled
4. **API Keys**:
   - Linear API Key
   - Notion Integration Token
   - GitHub Token (automatically provided by Actions)

#### Step 1: Configure Repository Secrets

Add the following secrets to your GitHub repository:

**Navigate to**: Repository → Settings → Secrets and variables →
Actions → New repository secret

| Secret Name             | Description                     | How to Get                                                                                                       |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `LINEAR_API_KEY`        | Linear API authentication key   | [Linear Settings → API](https://linear.app/settings/api) → Create new API key                                    |
| `NOTION_TOKEN`          | Notion integration token        | [Notion Integrations](https://www.notion.so/my-integrations) → New integration → Copy Internal Integration Token |
| `NOTION_DATABASE_ID`    | Target Notion database ID       | Open Notion database → Share → Copy link → Extract ID from URL                                                   |
| `LINEAR_WEBHOOK_SECRET` | Secret for webhook verification | Generate using: `openssl rand -hex 32`                                                                           |

**Example**: Setting up `LINEAR_API_KEY`

```bash
# 1. Navigate to Linear Settings → API
# 2. Click "Create new API key"
# 3. Name it "GitHub Actions Sync"
# 4. Copy the generated key
# 5. Add to GitHub Secrets as LINEAR_API_KEY
```

#### Step 2: Create Notion Integration

1. **Create Integration**:

   ```
   Navigate to: https://www.notion.so/my-integrations
   Click: "New integration"
   Name: "Linear Sync"
   Associated workspace: [Your workspace]
   Capabilities: Read content, Update content, Insert content
   ```

2. **Connect to Database**:

   ```
   Open your Notion database
   Click "..." menu → Add connections
   Search for "Linear Sync"
   Click "Connect"
   ```

3. **Configure Database Properties**: Ensure your Notion database has
   these properties:
   - `Title` (title) - Issue title
   - `Status` (select) - Issue status
   - `Linear ID` (text) - Linear issue identifier
   - `Assignee` (person) - Assigned team member
   - `Priority` (select) - Priority level
   - `Labels` (multi-select) - Issue tags
   - `Created` (date) - Creation timestamp
   - `Updated` (date) - Last update timestamp

#### Step 3: Create Workflow File

Create `.github/workflows/linear-notion-sync.yml`:

```yaml
name: Linear to Notion Sync

on:
  repository_dispatch:
    types: [linear_webhook]
  workflow_dispatch:
    inputs:
      linear_issue_id:
        description: 'Linear Issue ID to sync'
        required: false

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Verify webhook signature
        if: github.event_name == 'repository_dispatch'
        env:
          WEBHOOK_SECRET: ${{ secrets.LINEAR_WEBHOOK_SECRET }}
        run: |
          # Webhook verification logic
          echo "Verifying webhook signature..."

      - name: Sync to Notion
        env:
          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
        run: |
          # Sync logic here
          echo "Syncing Linear issue to Notion..."
          npx -y cld-omnisearch # MCP server integration

      - name: Update MCP context
        run: |
          # Update Model Context Protocol with latest sync status
          echo "Updating MCP context..."
```

### Webhook Configuration

#### Setting up Linear Webhook

1. **Access Linear Webhook Settings**:

   ```
   Navigate to: Linear workspace → Settings → API → Webhooks
   URL: https://linear.app/[workspace]/settings/api/webhooks
   ```

2. **Create New Webhook**:
   - **Name**: `GitHub Actions Sync`
   - **URL**: `https://api.github.com/repos/[owner]/[repo]/dispatches`
   - **Secret**: Use value from `LINEAR_WEBHOOK_SECRET`
   - **Events to trigger**:
     - ☑️ Issue created
     - ☑️ Issue updated
     - ☑️ Issue deleted
     - ☑️ Issue status changed
     - ☑️ Issue assigned
     - ☑️ Comment created

3. **Webhook Payload Structure**:

   ```json
   {
     "action": "create" | "update" | "remove",
     "type": "Issue",
     "data": {
       "id": "issue-id",
       "title": "Issue Title",
       "description": "Issue description",
       "state": {
         "name": "In Progress",
         "type": "started"
       },
       "assignee": {
         "id": "user-id",
         "name": "User Name"
       },
       "labels": [
         {
           "id": "label-id",
           "name": "bug"
         }
       ],
       "priority": 1,
       "createdAt": "2026-02-04T14:42:18.193Z",
       "updatedAt": "2026-02-04T14:42:18.193Z"
     }
   }
   ```

4. **Test Webhook**:
   ```bash
   # Send test webhook from Linear
   # 1. In Linear webhook settings, click "Send test webhook"
   # 2. Check GitHub Actions runs for successful execution
   # 3. Verify Notion database updated correctly
   ```

#### GitHub Repository Dispatch Setup

To receive webhooks, you need to set up a webhook forwarding service
or use GitHub's repository dispatch API:

**Option 1: Using webhook-relay or similar service**

```bash
# Deploy a simple webhook forwarder
# This forwards Linear webhooks to GitHub repository dispatch
```

**Option 2: Direct API Integration**

```javascript
// In your webhook handler
const response = await fetch(
	`https://api.github.com/repos/${owner}/${repo}/dispatches`,
	{
		method: 'POST',
		headers: {
			Authorization: `token ${GITHUB_TOKEN}`,
			Accept: 'application/vnd.github.v3+json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			event_type: 'linear_webhook',
			client_payload: linearWebhookPayload,
		}),
	},
);
```

### MCP Integration Notes

The Model Context Protocol (MCP) integration provides AI-powered
context and automation for the Linear↔Notion sync workflow.

#### What is MCP?

Model Context Protocol is a standardized way for AI models to access
external context and tools. In this workflow, MCP:

- Provides semantic understanding of issue content
- Suggests optimal Notion database mappings
- Maintains sync state across platforms
- Enables natural language queries about sync status

#### MCP Server Integration

**Configuration**:

The CLD Omnisearch MCP server can be integrated into the workflow to:

1. **Parse and Enhance Issue Content**:

   ```javascript
   // Use MCP to enhance issue descriptions
   const enhancedDescription = await mcpServer.enhance({
   	content: linearIssue.description,
   	context: 'technical-documentation',
   });
   ```

2. **Smart Field Mapping**:

   ```javascript
   // Use MCP to intelligently map Linear fields to Notion
   const notionFields = await mcpServer.mapFields({
   	source: linearIssue,
   	targetSchema: notionDatabaseSchema,
   });
   ```

3. **Sync Conflict Resolution**:
   ```javascript
   // Use MCP to resolve conflicts when both systems updated
   const resolution = await mcpServer.resolveConflict({
   	linearVersion: linearIssue,
   	notionVersion: notionPage,
   	strategy: 'latest-wins',
   });
   ```

#### Environment Variables for MCP

Add to workflow or `.env`:

```bash
# MCP Server Configuration
MCP_SERVER_URL=http://localhost:3000
MCP_API_KEY=your-mcp-api-key

# Provider-specific keys (if using CLD Omnisearch features)
TAVILY_API_KEY=your-tavily-key
BRAVE_API_KEY=your-brave-key
```

#### Using CLD Omnisearch in Workflow

```yaml
- name: Setup MCP Server
  run: |
    npx -y cld-omnisearch &
    sleep 5 # Wait for server to start

- name: Sync with MCP Context
  env:
    LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
    NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
  run: |
    # Use MCP server for enhanced sync
    node scripts/sync-with-mcp.js
```

### Troubleshooting

#### Common Issues and Solutions

##### 1. Webhook Not Triggering Workflow

**Symptoms**:

- Linear webhook shows successful delivery
- GitHub Actions workflow doesn't run

**Solutions**:

- ✅ Verify webhook URL is correct:
  `https://api.github.com/repos/[owner]/[repo]/dispatches`
- ✅ Check GitHub token permissions (needs `repo` scope for private
  repos)
- ✅ Ensure event type matches: `linear_webhook` in both webhook and
  workflow
- ✅ Check Actions tab for any error messages

**Debug Steps**:

```bash
# Test webhook manually
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/[owner]/[repo]/dispatches \
  -d '{"event_type":"linear_webhook","client_payload":{"test":true}}'
```

##### 2. Notion API Authentication Fails

**Symptoms**:

- Error: "Unauthorized" or "Invalid token"
- Workflow fails at Notion sync step

**Solutions**:

- ✅ Regenerate Notion integration token
- ✅ Verify integration has access to target database
- ✅ Check database ID is correct (extract from database URL)
- ✅ Ensure token is properly set in GitHub Secrets

**Verification**:

```bash
# Test Notion API access
curl -X GET \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  https://api.notion.com/v1/databases/$NOTION_DATABASE_ID
```

##### 3. Field Mapping Issues

**Symptoms**:

- Sync completes but data missing in Notion
- Type mismatch errors

**Solutions**:

- ✅ Verify Notion database properties match expected types
- ✅ Check property names are exact matches (case-sensitive)
- ✅ Ensure multi-select options exist in Notion before syncing
- ✅ Validate date formats match Notion's requirements

**Database Schema Validation**:

```javascript
// Validate before sync
const requiredProperties = [
	'Title',
	'Status',
	'Linear ID',
	'Assignee',
	'Priority',
	'Labels',
	'Created',
	'Updated',
];

const databaseSchema = await notion.databases.retrieve({
	database_id: NOTION_DATABASE_ID,
});

const missingProperties = requiredProperties.filter(
	(prop) => !databaseSchema.properties[prop],
);

if (missingProperties.length > 0) {
	throw new Error(
		`Missing properties: ${missingProperties.join(', ')}`,
	);
}
```

##### 4. MCP Server Connection Issues

**Symptoms**:

- Workflow times out waiting for MCP
- MCP-enhanced features not working

**Solutions**:

- ✅ Increase server startup wait time
- ✅ Check MCP server logs for startup errors
- ✅ Verify API keys for search providers are valid
- ✅ Ensure Node.js version is compatible (v18+)

**Debug MCP**:

```bash
# Run MCP server with verbose logging
DEBUG=* npx -y cld-omnisearch

# Test MCP server health
curl http://localhost:3000/health
```

##### 5. Rate Limiting

**Symptoms**:

- 429 Too Many Requests errors
- Intermittent sync failures

**Solutions**:

- ✅ Implement exponential backoff
- ✅ Add rate limiting to webhook handler
- ✅ Use workflow concurrency limits
- ✅ Cache Notion database schema

**Workflow Configuration**:

```yaml
concurrency:
  group: linear-notion-sync
  cancel-in-progress: false # Queue webhooks instead of canceling
```

##### 6. Webhook Signature Verification Fails

**Symptoms**:

- Webhook rejected with "Invalid signature"
- Security errors in logs

**Solutions**:

- ✅ Verify webhook secret matches in Linear and GitHub
- ✅ Check signature computation algorithm
- ✅ Ensure timestamp is within acceptable window
- ✅ Validate payload hasn't been modified

**Verification Code**:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
	const hmac = crypto.createHmac('sha256', secret);
	const expectedSignature = hmac.update(payload).digest('hex');
	return crypto.timingSafeEqual(
		Buffer.from(signature),
		Buffer.from(expectedSignature),
	);
}
```

#### Debugging Checklist

- [ ] Check GitHub Actions logs for detailed error messages
- [ ] Verify all secrets are set correctly in repository settings
- [ ] Test API endpoints manually with curl or Postman
- [ ] Review Linear webhook delivery history
- [ ] Check Notion API status page for outages
- [ ] Validate JSON payload structure matches expected format
- [ ] Ensure workflow file has correct YAML syntax
- [ ] Verify Node.js and npm versions are compatible
- [ ] Check for any conflicting workflows
- [ ] Review recent changes to Linear or Notion schemas

## Setup Wizard Pattern

The CLD Omnisearch repository follows a setup wizard pattern for
configurations, making it easy to get started with complex
integrations.

### Pattern Overview

The setup wizard pattern consists of:

1. **Prerequisites Documentation**: Clear list of required tools and
   accounts
2. **Step-by-Step Instructions**: Sequential setup guide with
   verification steps
3. **Configuration Templates**: Pre-made JSON configs in
   `msty-configs/` directory
4. **Environment Variables**: Flexible configuration through
   environment variables
5. **Quick Start Guide**: Minimal steps to get running quickly
6. **Detailed Setup**: Comprehensive guide for advanced configurations

### Example: Msty Studio Setup

The repository's Msty Studio setup (see `MSTY_SETUP.md`) exemplifies
this pattern:

```markdown
## Prerequisites

- Node.js v18+
- NPX
- Msty Studio

## Quick Start

1. Run: npx -y cld-omnisearch
2. Configure in Msty Studio
3. Set API keys
4. Start using

## Detailed Setup

[Step-by-step instructions with screenshots]

## Troubleshooting

[Common issues and solutions]
```

### Applying to Linear↔Notion Workflow

The Linear↔Notion workflow documentation follows this same pattern:

1. **Prerequisites** → API keys, accounts, permissions
2. **Quick Setup** → Essential secrets and basic workflow
3. **Detailed Configuration** → Webhook setup, MCP integration
4. **Troubleshooting** → Common issues with solutions

This consistent pattern ensures:

- ✅ New users can get started quickly
- ✅ Advanced users have detailed documentation
- ✅ Troubleshooting is straightforward
- ✅ Documentation is maintainable

## Best Practices

### Workflow Security

1. **Never Commit Secrets**:
   - Always use GitHub Secrets for sensitive data
   - Use secret scanning to prevent accidental commits
   - Rotate secrets regularly

2. **Webhook Verification**:
   - Always verify webhook signatures
   - Use timing-safe comparison for signatures
   - Implement rate limiting

3. **Least Privilege**:
   - Grant minimum required permissions
   - Use fine-grained personal access tokens
   - Scope integration tokens appropriately

### Workflow Performance

1. **Caching**:
   - Cache dependencies between runs
   - Cache API responses when appropriate
   - Use build caching for Docker images

2. **Concurrency**:
   - Set appropriate concurrency limits
   - Use job dependencies for sequential tasks
   - Cancel redundant runs when safe

3. **Error Handling**:
   - Implement retry logic with exponential backoff
   - Log detailed error information
   - Send notifications for critical failures

### Documentation

1. **Keep Updated**:
   - Update docs when workflows change
   - Include version information
   - Document breaking changes

2. **Include Examples**:
   - Provide working code samples
   - Show expected inputs and outputs
   - Include troubleshooting examples

3. **Reference Official Docs**:
   - Link to Linear API documentation
   - Reference Notion API guides
   - Point to GitHub Actions documentation

### Monitoring

1. **Workflow Notifications**:

   ```yaml
   - name: Notify on Failure
     if: failure()
     uses: actions/github-script@v7
     with:
       script: |
         github.rest.issues.createComment({
           issue_number: context.issue.number,
           body: '❌ Linear↔Notion sync failed. Check workflow logs.'
         })
   ```

2. **Success Metrics**:
   - Track sync success rate
   - Monitor webhook delivery
   - Measure sync latency

3. **Alerting**:
   - Set up email notifications
   - Use Slack/Discord webhooks
   - Integrate with monitoring services

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Linear API Documentation](https://developers.linear.app/docs)
- [Notion API Documentation](https://developers.notion.com/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [CLD Omnisearch MCP Server](https://github.com/clduab11/cld-omnisearch)

## Contributing

Found an issue with this documentation? Please:

1. Open an issue in the repository
2. Reference this wiki page ID: `8e92766d04964f54bc3bef5c30e1ad4b`
3. Include suggested improvements
4. Tag with `CI/CD`, `Templates`, or `Best Practices`

## License

This documentation is part of the CLD Omnisearch project and follows
the same license.

---

_Last Updated: 2026-02-04_  
_Related Issue_:
[MCP-2: Document Linear Refactor workflow in GitHub Actions Wiki](https://linear.app/parallax-workspace/issue/MCP-2/)
