# 🎯 Final JSON Schema for Msty Studio

## ✅ Ready to Copy & Paste

When you click **"Add New Tool"** in Msty Studio, use this **verified and tested** configuration:

---

## Complete Configuration (All 8 Providers)

```json
{
  "command": "npx",
  "args": ["-y", "cld-omnisearch"],
  "env": {
    "MSTY_TAVILY_API_KEY": "{TAVILY_API_KEY:Tavily API key for web search and extraction:}",
    "MSTY_BRAVE_API_KEY": "{BRAVE_API_KEY:Brave Search API key for web search:}",
    "MSTY_KAGI_API_KEY": "{KAGI_API_KEY:Kagi API key (multi-use: search, AI, summarization):}",
    "MSTY_EXA_API_KEY": "{EXA_API_KEY:Exa AI API key (multi-use: search, AI, processing):}",
    "MSTY_GITHUB_API_KEY": "{GITHUB_API_KEY:GitHub API key for code and repository search:}",
    "MSTY_PERPLEXITY_API_KEY": "{PERPLEXITY_API_KEY:Perplexity API key for AI-powered search:}",
    "MSTY_JINA_AI_API_KEY": "{JINA_AI_API_KEY:Jina AI API key for URL reading and grounding:}",
    "MSTY_FIRECRAWL_API_KEY": "{FIRECRAWL_API_KEY:Firecrawl API key for web scraping:}"
  }
}
```

---

## Minimal Configuration (Just Web Search)

If you only want to start with basic web search:

```json
{
  "command": "npx",
  "args": ["-y", "cld-omnisearch"],
  "env": {
    "MSTY_TAVILY_API_KEY": "{TAVILY_API_KEY:Tavily API key:}"
  }
}
```

---

## Developer Configuration (GitHub + AI Search)

For developers who primarily need code search and AI assistance:

```json
{
  "command": "npx",
  "args": ["-y", "cld-omnisearch"],
  "env": {
    "MSTY_GITHUB_API_KEY": "{GITHUB_API_KEY:GitHub API key:}",
    "MSTY_PERPLEXITY_API_KEY": "{PERPLEXITY_API_KEY:Perplexity API key:}",
    "MSTY_TAVILY_API_KEY": "{TAVILY_API_KEY:Tavily API key:}"
  }
}
```

---

## Setup Instructions

### 1. Add Tool in Msty Studio
- Open Msty Studio
- Navigate to: **Ellipsis (⋮) menu** → **Toolbox** → **Tools**
- Click **"Add New Tool"**
- Tool ID: `cld-omnisearch`
- Choose an icon (🔍 recommended)
- Paste the JSON configuration above
- Click **"Add"**

### 2. Set API Keys
**Option A: Tool Parameters** (Recommended)
- Click the asterisk (*) icon next to `cld-omnisearch`
- Fill in your API keys in the Environment Variables section
- Click Save

**Option B: Msty Environments**
- Go to Settings → Environments
- Add keys with `MSTY_` prefix
- They'll be automatically available to the tool

### 3. Create Toolset (Optional)
- Go to **Toolbox** → **Toolsets**
- Click **"Add New Toolset"**
- Name it: `Omnisearch`
- Enable the `cld-omnisearch` tool
- Click **"Add"**

### 4. Use in Conversation
- Start a new chat
- Select a tool-capable model (Claude, GPT-4, etc.)
- Click the Toolset icon and enable your `Omnisearch` toolset
- Test with: *"Search the web for the latest AI news"*

---

## 📋 What You Get (10 Tools)

### Search Tools (2)
1. **`web_search`** - Multi-provider web search
   - Providers: Tavily, Brave, Kagi, Exa
   - Domain filtering, result limits
   
2. **`github_search`** - GitHub code, repositories, users
   - Search types: code, repositories, users
   - Sort options for repositories

### AI Response Tool (1)
3. **`ai_search`** - AI-powered search with reasoning
   - Providers: Perplexity, Kagi FastGPT, Exa Answer
   - Returns synthesized answers with sources

### Processing Tools (5)
4. **`firecrawl_process`** - Web scraping with 5 modes
   - Modes: scrape, crawl, map, extract, actions
   
5. **`exa_process`** - Content extraction & similarity
   - Modes: contents, similar
   
6. **`jina_reader_process`** - URL to LLM-friendly markdown
   
7. **`kagi_summarizer_process`** - Content summarization
   
8. **`tavily_extract_process`** - Structured data extraction

### Enhancement Tools (2)
9. **`jina_grounding_enhance`** - Fact checking & grounding
   
10. **`kagi_enrichment_enhance`** - Context enrichment

---

## ✅ Verification

This JSON schema has been:
- ✅ **Verified against source code** in `TOOL_VERIFICATION.md`
- ✅ **Tested with npm package** v0.1.1
- ✅ **Published to npm registry**: https://www.npmjs.com/package/cld-omnisearch
- ✅ **Pushed to GitHub**: https://github.com/clduab11/cld-omnisearch
- ✅ **Documented comprehensively** in `MSTY_SETUP.md`

---

## 🔗 Quick Links

- **NPM Package**: https://www.npmjs.com/package/cld-omnisearch
- **GitHub Repo**: https://github.com/clduab11/cld-omnisearch
- **Full Setup Guide**: [MSTY_SETUP.md](./MSTY_SETUP.md)
- **Verification Report**: [TOOL_VERIFICATION.md](./TOOL_VERIFICATION.md)
- **Changelog**: [CHANGELOG-CLD.md](./CHANGELOG-CLD.md)

---

## 🎉 You're Ready!

Copy the complete configuration above and paste it into Msty Studio's "Add New Tool" dialog. The tool will automatically fetch v0.1.1 from npm and be ready to use!

**Version**: 0.1.1  
**Last Updated**: October 16, 2025  
**Status**: ✅ Production Ready
