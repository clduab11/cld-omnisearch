# Msty Studio Setup Guide for CLD Omnisearch

This guide provides step-by-step instructions for setting up **CLD Omnisearch** MCP server in Msty Studio Desktop and Web.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup for Msty Studio Desktop](#detailed-setup-for-msty-studio-desktop)
- [Detailed Setup for Msty Studio Web with Sidecar](#detailed-setup-for-msty-studio-web-with-sidecar)
- [Environment Variables Configuration](#environment-variables-configuration)
- [Tool Configuration Examples](#tool-configuration-examples)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Node.js** (v18 or later)
   - Install via [Volta](https://volta.sh/) (recommended) or [Homebrew](https://brew.sh/) (Mac)
   - **Do NOT use NVM** - it may cause issues with Msty Studio
   
   To check if Node is installed:
   ```bash
   node --version
   ```

2. **NPX** (comes with Node.js)
   ```bash
   npx --version
   ```

3. **Msty Studio Desktop** or **Msty Studio Web + Sidecar**
   - Download Desktop from [msty.ai](https://msty.ai/)
   - For Web, see [Sidecar setup guide](https://docs.msty.studio/getting-started/sidecar)

### Optional: API Keys

CLD Omnisearch supports multiple search and AI providers. You only need API keys for the providers you want to use:

- **Tavily** - [Get API Key](https://tavily.com/)
- **Brave Search** - [Get API Key](https://brave.com/search/api/)
- **Kagi** - [Get API Key](https://kagi.com/settings?p=api)
- **Perplexity AI** - [Get API Key](https://www.perplexity.ai/settings/api)
- **Jina AI** - [Get API Key](https://jina.ai/)
- **Exa AI** - [Get API Key](https://dashboard.exa.ai/)
- **Firecrawl** - [Get API Key](https://firecrawl.dev/)
- **GitHub** - [Create Personal Access Token](https://github.com/settings/tokens) (no scopes needed)

## Quick Start

### For Msty Studio Desktop

1. **Open Toolbox Settings**
   - Click the ellipsis (⋮) menu on the left
   - Select **Toolbox** → **Tools**

2. **Add New Tool**
   - Click **Add New Tool**
   - Enter Tool ID: `cld-omnisearch`
   - Choose an icon

3. **Configure Tool**
   ```json
   {
     "command": "npx",
     "args": [
       "-y",
       "cld-omnisearch"
     ],
     "env": {
       "TAVILY_API_KEY": "{TAVILY_API_KEY:Tavily API Key:}",
       "BRAVE_API_KEY": "{BRAVE_API_KEY:Brave Search API Key:}",
       "KAGI_API_KEY": "{KAGI_API_KEY:Kagi API Key:}",
       "PERPLEXITY_API_KEY": "{PERPLEXITY_API_KEY:Perplexity AI API Key:}",
       "JINA_AI_API_KEY": "{JINA_AI_API_KEY:Jina AI API Key:}",
       "EXA_API_KEY": "{EXA_API_KEY:Exa AI API Key:}",
       "FIRECRAWL_API_KEY": "{FIRECRAWL_API_KEY:Firecrawl API Key:}",
       "GITHUB_API_KEY": "{GITHUB_API_KEY:GitHub Personal Access Token:}"
     }
   }
   ```

4. **Set Default Parameters**
   - Click the asterisk (*) icon next to the tool
   - Add your API keys as Environment Variables
   - Or set them in Msty Environments (see below)

5. **Save and Test**
   - Click **Add** to save the tool
   - Try using it in a conversation with a compatible model

## Detailed Setup for Msty Studio Desktop

### Step 1: Install Dependencies

Ensure Node.js and NPX are installed:

```bash
# Check Node version (should be 18+)
node --version

# Check NPX
npx --version
```

If not installed, use Volta:
```bash
# Install Volta
curl https://get.volta.sh | bash

# Install Node
volta install node@20
```

### Step 2: Create Environment for API Keys (Recommended)

1. Click ellipsis (⋮) → **Environments** → **Manage Environments**
2. Create a new environment (e.g., "Omnisearch")
3. Add variables with `MSTY_` prefix:
   ```
   MSTY_TAVILY_API_KEY = your-tavily-key-here
   MSTY_BRAVE_API_KEY = your-brave-key-here
   MSTY_KAGI_API_KEY = your-kagi-key-here
   MSTY_PERPLEXITY_API_KEY = your-perplexity-key-here
   MSTY_JINA_AI_API_KEY = your-jina-key-here
   MSTY_EXA_API_KEY = your-exa-key-here
   MSTY_FIRECRAWL_API_KEY = your-firecrawl-key-here
   MSTY_GITHUB_API_KEY = your-github-token-here
   ```
4. Make this environment active

### Step 3: Add CLD Omnisearch Tool

1. **Navigate to Toolbox**
   - Left menu → Ellipsis (⋮) → Toolbox → Tools

2. **Add New Tool**
   - Click **Add New Tool**
   - Tool ID: `cld-omnisearch`
   - Name: `CLD Omnisearch`
   - Icon: Choose your preference

3. **Tool Configuration**
   
   Use this configuration:
   ```json
   {
     "command": "npx",
     "args": [
       "-y",
       "cld-omnisearch"
     ],
     "env": {}
   }
   ```

   **Note**: The `env` object is empty because we're using Msty Environments.

4. **Optional Notes**
   ```
   CLD Omnisearch provides unified access to multiple search providers:
   - Web Search: Tavily, Brave, Kagi, Exa
   - AI Responses: Perplexity, Kagi FastGPT, Exa Answer
   - Content Processing: Jina Reader, Kagi Summarizer, Tavily Extract, Firecrawl
   - Enhancement: Kagi Enrichment, Jina Grounding
   - GitHub Search: Code, Repositories, Users
   
   Requires API keys for the providers you want to use.
   Set keys in Msty Environments with MSTY_ prefix.
   ```

5. **Save Tool**

### Step 4: Verify Installation

1. Start a new conversation with an SOTA model (e.g., Claude 3.5 Sonnet, GPT-4, etc.)
2. Check that tools are loaded in Sidecar:
   - Click **Sidecar** icon
   - Look for `cld-omnisearch` in the tools list
3. Test a simple search:
   ```
   Use web search to find the latest TypeScript features
   ```

## Detailed Setup for Msty Studio Web with Sidecar

Msty Studio Web requires **Sidecar** running to access tools.

### Step 1: Install and Run Sidecar

Follow the [official Sidecar guide](https://docs.msty.studio/getting-started/sidecar)

1. Download Sidecar for your OS
2. Run Sidecar application
3. In Msty Studio Web, ensure connection is active (green indicator)

### Step 2: Configure Tool in Sidecar

The configuration process is similar to Desktop:

1. In Msty Studio Web, access **Toolbox** via left menu
2. Add the tool with the same configuration as Desktop
3. Set environment variables either:
   - In Msty Environments (recommended)
   - In tool's default parameters

### Step 3: Remote Sidecar (Optional)

You can run Sidecar on a different machine:

1. On the remote machine, install and run Sidecar
2. In Msty Studio Web, go to Settings → Remote Connections
3. Add your Sidecar connection URL
4. Configure tools on the remote Sidecar

## Environment Variables Configuration

### Using Msty Environments (Recommended)

**Advantages:**
- Centralized API key management
- Easy switching between different configurations
- Secure storage in browser (Web) or local storage (Desktop)
- Shared across all tools that need the same keys

**Setup:**

1. **Create Base Environment**
   - Left menu → Ellipsis → Environments → Manage Environments
   - Edit "Base Environment"
   - Add all your API keys with `MSTY_` prefix

2. **Variable Names**
   ```
   MSTY_TAVILY_API_KEY
   MSTY_BRAVE_API_KEY
   MSTY_KAGI_API_KEY
   MSTY_PERPLEXITY_API_KEY
   MSTY_JINA_AI_API_KEY
   MSTY_EXA_API_KEY
   MSTY_FIRECRAWL_API_KEY
   MSTY_GITHUB_API_KEY
   ```

3. **Tool Configuration**
   ```json
   {
     "command": "npx",
     "args": ["-y", "cld-omnisearch"],
     "env": {}
   }
   ```

### Using Tool Parameters (Alternative)

**Advantages:**
- Tool-specific configuration
- Override environment variables per tool

**Setup:**

1. **Tool Configuration**
   ```json
   {
     "command": "npx",
     "args": ["-y", "cld-omnisearch"],
     "env": {
       "TAVILY_API_KEY": "{TAVILY_API_KEY:Tavily Search API Key:}",
       "BRAVE_API_KEY": "{BRAVE_API_KEY:Brave Search API Key:}",
       "KAGI_API_KEY": "{KAGI_API_KEY:Kagi API Key:}",
       "PERPLEXITY_API_KEY": "{PERPLEXITY_API_KEY:Perplexity AI API Key:}",
       "JINA_AI_API_KEY": "{JINA_AI_API_KEY:Jina AI API Key:}",
       "EXA_API_KEY": "{EXA_API_KEY:Exa AI API Key:}",
       "FIRECRAWL_API_KEY": "{FIRECRAWL_API_KEY:Firecrawl API Key:}",
       "GITHUB_API_KEY": "{GITHUB_API_KEY:GitHub Token (no scopes):}"
     }
   }
   ```

2. **Set Default Parameters**
   - Click asterisk (*) icon next to tool
   - Enter values for each API key
   - These will be used when the tool runs

## Tool Configuration Examples

### Minimal Configuration (Using Environments)

Best when you have API keys in Msty Environments:

```json
{
  "command": "npx",
  "args": ["-y", "cld-omnisearch"],
  "env": {}
}
```

### Full Configuration (With Parameters)

Best for tool-specific keys or when not using Environments:

```json
{
  "command": "npx",
  "args": ["-y", "cld-omnisearch"],
  "env": {
    "TAVILY_API_KEY": "{TAVILY_API_KEY:Tavily API Key for factual search:}",
    "BRAVE_API_KEY": "{BRAVE_API_KEY:Brave Search API Key for privacy-focused search:}",
    "KAGI_API_KEY": "{KAGI_API_KEY:Kagi API Key for high-quality search and FastGPT:}",
    "PERPLEXITY_API_KEY": "{PERPLEXITY_API_KEY:Perplexity AI API Key for AI responses:}",
    "JINA_AI_API_KEY": "{JINA_AI_API_KEY:Jina AI API Key for content processing:}",
    "EXA_API_KEY": "{EXA_API_KEY:Exa AI API Key for neural search:}",
    "FIRECRAWL_API_KEY": "{FIRECRAWL_API_KEY:Firecrawl API Key for web scraping:}",
    "GITHUB_API_KEY": "{GITHUB_API_KEY:GitHub Personal Access Token (no scopes needed):}",
    "FIRECRAWL_BASE_URL": "{FIRECRAWL_BASE_URL:Self-hosted Firecrawl URL (optional):http://localhost:3002}"
  }
}
```

### Subset Configuration (Only Specific Providers)

If you only want to use certain providers:

```json
{
  "command": "npx",
  "args": ["-y", "cld-omnisearch"],
  "env": {
    "TAVILY_API_KEY": "{TAVILY_API_KEY:Tavily API Key:}",
    "PERPLEXITY_API_KEY": "{PERPLEXITY_API_KEY:Perplexity AI API Key:}",
    "GITHUB_API_KEY": "{GITHUB_API_KEY:GitHub Token:}"
  }
}
```

## Troubleshooting

### Tool Not Appearing in Sidecar

**Symptoms:** CLD Omnisearch doesn't show up in the tools list

**Solutions:**
1. Check Sidecar logs:
   - Click **Sidecar** icon
   - Select **View Logs**
   - Look for errors related to `cld-omnisearch`

2. Verify Node.js installation:
   ```bash
   which node
   ```
   - Should NOT be in `.nvm` directory
   - Use Volta or Homebrew instead

3. Test NPX directly:
   ```bash
   npx -y cld-omnisearch
   ```
   - Should start the MCP server

4. Restart Sidecar:
   - Close and reopen Sidecar application
   - Refresh Msty Studio

### API Keys Not Being Passed

**Symptoms:** Tools execute but return "API key not found" errors

**Solutions:**

1. **Check Environment Variables**
   - Verify keys are set in Msty Environments
   - Ensure `MSTY_` prefix is used (e.g., `MSTY_TAVILY_API_KEY`)
   - Make sure the environment is active

2. **Check Tool Parameters**
   - Click asterisk (*) icon next to tool
   - Verify default parameters are set
   - Values should not be empty

3. **Check Sidecar Logs**
   - Look for which API keys were detected
   - Should see: `✓ Found API keys for: ...`

4. **Test Environment Variable Loading**
   - In tool configuration, temporarily add:
     ```json
     "env": {
       "TEST_VAR": "{TEST_VAR:Test Variable:test-value}"
     }
     ```
   - Set default parameter for `TEST_VAR`
   - Check if it's passed through

### Tools Not Being Called by Model

**Symptoms:** Model doesn't use the search/processing tools

**Solutions:**

1. **Use Compatible Models**
   - Requires models with native tool calling support
   - Recommended: Claude 3.5 Sonnet, GPT-4, GPT-4 Turbo, Gemini Pro
   - Check model's capabilities in Msty Studio

2. **Enable Tool Use in Conversation**
   - Some models need explicit permission
   - Try: "You have access to search tools. Please use them to answer my question."

3. **Check Tool Descriptions**
   - Ensure tool is properly configured
   - Descriptions should be clear and descriptive

4. **Verify Tool is Loaded**
   - Check Sidecar → Tools list
   - Should see all CLD Omnisearch tools

### Specific Provider Not Working

**Symptoms:** Some searches work, others don't

**Solutions:**

1. **Check API Key for That Provider**
   - Verify the specific provider's API key is set
   - Example: If Brave Search fails, check `MSTY_BRAVE_API_KEY`

2. **Check Provider-Specific Requirements**
   - **Kagi**: Requires Business/Team plan for some features
   - **GitHub**: Token must have NO scopes (public access only)
   - **Firecrawl**: May need `FIRECRAWL_BASE_URL` for self-hosted

3. **Check Rate Limits**
   - Most providers have rate limits
   - Wait a few minutes and try again
   - Check provider dashboard for usage

### Installation Issues

**Symptoms:** NPX fails to install or run `cld-omnisearch`

**Solutions:**

1. **Clear NPX Cache**
   ```bash
   rm -rf ~/.npm/_npx
   npx -y cld-omnisearch
   ```

2. **Check NPM Registry**
   ```bash
   npm config get registry
   ```
   - Should be: `https://registry.npmjs.org/`

3. **Manual Installation**
   ```bash
   npm install -g cld-omnisearch
   cld-omnisearch
   ```

4. **Network Issues**
   - Check firewall settings
   - Try different network
   - Use VPN if npm registry is blocked

### Performance Issues

**Symptoms:** Tools are slow or time out

**Solutions:**

1. **Check Network Connection**
   - Search APIs require internet access
   - Test with: `curl https://api.tavily.com`

2. **Increase Timeouts**
   - Some operations (crawling, scraping) take time
   - This is expected behavior

3. **Use Faster Providers**
   - Kagi FastGPT: ~900ms response time
   - Brave Search: Very fast
   - Tavily: Optimized for speed

## Additional Resources

- [Msty Studio Documentation](https://docs.msty.studio/)
- [Msty Studio Toolbox Guide](https://docs.msty.studio/features/toolbox)
- [Msty Studio Environments Guide](https://docs.msty.studio/features/environment)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Getting Help

1. **Check Sidecar Logs**
   - Most issues show up in logs
   - Sidecar → View Logs

2. **Msty Studio Discord**
   - [Join Discord](https://msty.ai/discord)
   - Active community and support

3. **GitHub Issues**
   - Report bugs and feature requests
   - [CLD Omnisearch Repository](https://github.com/clduab11/cld-omnisearch)

## Example Usage

Once configured, you can use natural language to access all features:

```
User: Search for the latest developments in quantum computing using Tavily

User: Use Perplexity to explain the difference between REST and GraphQL APIs

User: Find TypeScript code examples on GitHub for remote function handling

User: Use Jina Reader to extract content from https://example.com/article

User: Search for similar academic papers to https://arxiv.org/abs/2106.09685 using Exa

User: Crawl https://docs.example.com and extract all documentation pages with Firecrawl
```

The model will automatically select and use the appropriate tools!
