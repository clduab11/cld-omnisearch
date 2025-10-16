# Msty Studio Tool Configuration Guide

## Quick Copy-Paste Configuration

When you click **"New Tool"** in Msty Studio, paste this JSON configuration:

```json
{
  "command": "npx",
  "args": [
    "-y",
    "cld-omnisearch"
  ],
  "env": {
    "MSTY_TAVILY_API_KEY": "{TAVILY_API_KEY:Tavily API key for web search:}",
    "MSTY_BRAVE_API_KEY": "{BRAVE_API_KEY:Brave Search API key for web search:}",
    "MSTY_KAGI_API_KEY": "{KAGI_API_KEY:Kagi API key for web search and summarization:}",
    "MSTY_PERPLEXITY_API_KEY": "{PERPLEXITY_API_KEY:Perplexity API key for AI-powered search:}",
    "MSTY_JINA_API_KEY": "{JINA_API_KEY:Jina AI API key for URL reading and grounding:}",
    "MSTY_EXA_API_KEY": "{EXA_API_KEY:Exa AI API key for semantic search:}",
    "MSTY_FIRECRAWL_API_KEY": "{FIRECRAWL_API_KEY:Firecrawl API key for web scraping:}",
    "MSTY_GITHUB_TOKEN": "{GITHUB_TOKEN:GitHub personal access token for code search:}"
  }
}
```

## Step-by-Step Setup in Msty Studio

### 1. Open Toolbox Settings
- Click the ellipsis (⋮) menu on the left sidebar
- Select **Toolbox** → **Tools**

### 2. Add New Tool
- Click **"Add New Tool"** button
- Enter Tool ID: `cld-omnisearch`
- Choose an icon (🔍 search icon recommended)

### 3. Paste Configuration
- In the configuration field, paste the JSON above
- Click **"Add"** to save

### 4. Set API Keys
After adding the tool, you have two options for providing API keys:

#### Option A: Set Default Parameters (Recommended)
1. Click the asterisk (*) icon next to `cld-omnisearch` in your tool list
2. In the "Environment Variables" section, fill in your API keys
3. Click Save

#### Option B: Use Environment Variables
1. Go to Msty Studio Settings → **Environments**
2. Create a new environment or edit the default one
3. Add your API keys with the `MSTY_` prefix:
   - `MSTY_TAVILY_API_KEY`
   - `MSTY_BRAVE_API_KEY`
   - etc.

### 5. Create a Toolset (Optional but Recommended)
1. Go to **Toolbox** → **Toolsets**
2. Click **"Add New Toolset"**
3. Name it: `Omnisearch Full`
4. Enable the `cld-omnisearch` tool
5. Add notes: "Complete web search, AI search, and content processing toolkit"
6. Click **"Add"**

### 6. Enable Auto-Approval (Safe for All Tools)
Since all cld-omnisearch tools are **read-only** (they only search and retrieve data, never modify anything), you can safely enable auto-approval:

1. In your conversation, click the Toolset icon
2. Select your `Omnisearch Full` toolset
3. Msty Studio will show which tools are enabled
4. All 13 tools will be available for the AI to use automatically

**Note:** Msty Studio handles approval settings through the UI rather than JSON configuration. The `alwaysAllow` property is not used in the JSON schema.

## All 13 Available Tools

Once configured, your AI models can use these tools:

### 🔍 Search Tools (2)
1. **`web_search`** - Search the web using Tavily, Brave, Kagi, or Exa
   - Supports domain filtering, result limits
   - Choose provider based on needs

2. **`github_search`** - Search GitHub repositories, code, and users
   - Search types: code, repositories, users
   - Sort options for repositories

### 🤖 AI Response Tools (1)
3. **`ai_search`** - AI-powered search with reasoning
   - Providers: Perplexity, Kagi FastGPT, Exa Answer
   - Returns synthesized answers with sources

### 📄 Processing Tools (5)
4. **`firecrawl_process`** - Process URLs with Firecrawl
   - Modes: scrape, crawl, map, extract, actions
   - Best for: web scraping, site mapping

5. **`exa_process`** - Process URLs with Exa AI
   - Modes: contents, similar
   - Best for: semantic content extraction

6. **`jina_reader_process`** - Convert URLs to LLM-friendly markdown
   - Best for: clean text extraction from web pages

7. **`kagi_summarizer_process`** - Summarize web content
   - Best for: quick summaries of long articles

8. **`tavily_extract_process`** - Extract structured data from URLs
   - Best for: data extraction from web pages

### ✨ Enhancement Tools (2)
9. **`jina_grounding_enhance`** - Add factual grounding to content
   - Verifies and enhances content with facts

10. **`kagi_enrichment_enhance`** - Enrich content with context
    - Adds additional relevant context

## Minimal Configuration (Just Web Search)

If you only want basic web search to start, use this minimal config:

```json
{
  "command": "npx",
  "args": ["-y", "cld-omnisearch"],
  "env": {
    "MSTY_TAVILY_API_KEY": "{TAVILY_API_KEY:Tavily API key:}"
  }
}
```

This will only enable the `web_search` tool with Tavily provider.

## API Key Sources

### Free Tiers Available
- **Tavily**: Free tier available at https://tavily.com/
- **GitHub**: Free personal access tokens at https://github.com/settings/tokens
- **Jina AI**: Free tier at https://jina.ai/

### Paid Services
- **Brave Search**: https://brave.com/search/api/
- **Kagi**: https://kagi.com/settings?p=api
- **Perplexity AI**: https://www.perplexity.ai/settings/api
- **Exa AI**: https://dashboard.exa.ai/
- **Firecrawl**: https://firecrawl.dev/

## Testing Your Setup

After configuration:

1. **Start a new conversation** in Msty Studio
2. **Select a tool-capable model** (Claude, GPT-4, etc.)
3. **Enable your toolset** using the toolset icon
4. **Test with a query**:
   ```
   Search the web for the latest news about AI developments
   ```

The AI should automatically use the `web_search` tool and return results.

## Troubleshooting

### Tool Not Appearing
- Ensure Node.js and NPX are installed (`node --version`, `npx --version`)
- Check Sidecar is running and connected
- View Sidecar logs for errors

### API Key Errors
- Verify API keys are correct (no extra spaces)
- Check the key has the `MSTY_` prefix in environment variables
- Test keys individually by starting with just one provider

### Model Not Using Tools
- Ensure model has "Tools" enabled as a purpose:
  - Select model dropdown → Edit icon → Enable "Tools" purpose
- Some models don't support tool calling well - try Claude 3.5 Sonnet or GPT-4

### NPX Command Fails
- Ensure you're using Volta or Homebrew for Node installation
- **Do NOT use NVM** - it causes path issues with Msty Studio
- Reinstall Node with Volta if currently using NVM:
  ```bash
  curl https://get.volta.sh | bash
  volta install node
  ```

## Advanced: Using with Sidecar on Different Machine

If running Sidecar on a remote machine:

1. Install Node.js on the Sidecar machine
2. Test that `npx -y cld-omnisearch` works on that machine
3. Configure the tool in Msty Studio Web as normal
4. Connect to your remote Sidecar

The tool will execute on the Sidecar machine, not your local browser.

## Related Files

- **Full setup guide**: `MSTY_SETUP.md`
- **Configuration examples**: `msty-configs/` directory
- **Technical enhancements**: `ENHANCEMENTS.md`
- **Changelog**: `CHANGELOG-CLD.md`

## Support

- **Package Issues**: https://github.com/clduab11/cld-omnisearch/issues
- **Msty Studio Help**: https://msty.ai/discord
- **MCP Protocol**: https://modelcontextprotocol.io/

---

**Published Package**: https://www.npmjs.com/package/cld-omnisearch
**Version**: 0.1.0
**License**: MIT
