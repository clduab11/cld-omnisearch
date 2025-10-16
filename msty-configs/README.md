# Msty Studio Configuration Examples

This directory contains pre-configured JSON templates for setting up CLD Omnisearch in Msty Studio.

## How to Use These Configurations

1. **Choose a configuration** that matches your needs
2. **Copy the JSON content** from the file
3. **In Msty Studio**, go to Toolbox → Tools → Add New Tool
4. **Paste the JSON** into the Tool Configuration field
5. **Set default parameters** by clicking the asterisk (*) icon
6. **Save** and start using the tool

## Available Configurations

### 1. minimal-config.json
**Best for:** Users who set API keys in Msty Environments

- Uses environment variables with `MSTY_` prefix
- Cleanest configuration
- No parameters in tool config
- Requires setting up Msty Environments first

**Setup Steps:**
1. Create Msty Environment with variables like `MSTY_TAVILY_API_KEY`
2. Use this minimal configuration
3. Activate your environment

### 2. full-config-with-parameters.json
**Best for:** Complete setup with all providers

- Includes all supported providers
- Uses Msty's parameter template syntax
- Descriptive parameter names
- Set default values via tool parameters

**Providers included:**
- Tavily Search
- Brave Search
- Kagi (Search, FastGPT, Summarizer, Enrichment)
- Perplexity AI
- Jina AI (Reader, Grounding)
- Exa AI (Search, Answer, Contents, Similar)
- Firecrawl (Scrape, Crawl, Map, Extract, Actions)
- GitHub Search

### 3. basic-search-only.json
**Best for:** Simple web search functionality

- Tavily, Brave, and Kagi search only
- Minimal provider setup
- Good for getting started

**Use this if you:**
- Only need web search capabilities
- Want to keep it simple
- Don't need AI responses or content processing

### 4. ai-and-github.json
**Best for:** AI assistance and code search

- Perplexity AI for intelligent responses
- Kagi FastGPT for quick AI answers
- GitHub search for code examples

**Use this if you:**
- Focus on development work
- Need code search and AI help
- Don't need general web search

## Configuration Format Explanation

Msty Studio tool configurations use this structure:

```json
{
  "command": "npx",           // The command to run
  "args": ["-y", "tool-name"], // Arguments for the command
  "env": {                     // Environment variables
    "VAR_NAME": "{VAR_NAME:Description:DefaultValue}"
  }
}
```

### Mustache Template Syntax

Msty Studio supports parameter templates in this format:
```
{VARIABLE_NAME:Description:Default Value}
```

**Examples:**
- `{API_KEY:Your API Key:}` - Required parameter, no default
- `{API_KEY:Your API Key:sk-1234}` - Optional with default value
- `{BASE_URL:Custom URL:http://localhost:3000}` - With default URL

When you set default parameters (asterisk icon), these templates get replaced with actual values.

## Recommended Setup Approach

### For Beginners

1. Start with **basic-search-only.json**
2. Get 2-3 API keys (Tavily, Brave recommended)
3. Set them as tool parameters
4. Test with simple searches
5. Add more providers as needed

### For Advanced Users

1. Use **minimal-config.json**
2. Set up Msty Environments with all API keys
3. Use `MSTY_` prefix for all variables
4. Switch between environments as needed
5. Share environments across multiple tools

### For Developers

1. Use **ai-and-github.json**
2. Focus on Perplexity, Kagi FastGPT, and GitHub
3. Add Firecrawl if you need web scraping
4. Great for documentation research and code examples

## Environment Variables Reference

CLD Omnisearch supports both standard and `MSTY_` prefixed variables:

| Standard Variable | Msty Environment Variable | Description |
|------------------|---------------------------|-------------|
| `TAVILY_API_KEY` | `MSTY_TAVILY_API_KEY` | Tavily Search API |
| `BRAVE_API_KEY` | `MSTY_BRAVE_API_KEY` | Brave Search API |
| `KAGI_API_KEY` | `MSTY_KAGI_API_KEY` | Kagi services |
| `PERPLEXITY_API_KEY` | `MSTY_PERPLEXITY_API_KEY` | Perplexity AI |
| `JINA_AI_API_KEY` | `MSTY_JINA_AI_API_KEY` | Jina AI services |
| `EXA_API_KEY` | `MSTY_EXA_API_KEY` | Exa AI services |
| `FIRECRAWL_API_KEY` | `MSTY_FIRECRAWL_API_KEY` | Firecrawl services |
| `GITHUB_API_KEY` | `MSTY_GITHUB_API_KEY` | GitHub token |
| `FIRECRAWL_BASE_URL` | `MSTY_FIRECRAWL_BASE_URL` | Self-hosted Firecrawl |

## Tips

1. **Start Small**: Don't configure all providers at once. Start with 1-2 and expand.

2. **Use Environments**: For managing multiple API keys, Msty Environments are cleaner than tool parameters.

3. **Security**: Never commit API keys to version control. Use tool parameters or environments.

4. **Testing**: After configuration, check Sidecar logs to verify which providers loaded successfully.

5. **Fallbacks**: If an environment variable isn't found, the server will only load providers with valid keys.

## Troubleshooting

### "No providers available"
- Check that at least one API key is set correctly
- Verify the environment is active (if using Environments)
- Check Sidecar logs for details

### "API key not found for X"
- That specific provider's key is missing or incorrect
- Add it to your Environment or tool parameters
- Check for typos in variable names

### Tool not appearing
- Ensure Sidecar is running (for Web)
- Check that NPX and Node.js are installed
- View Sidecar logs for errors
- Try `npx -y cld-omnisearch` in terminal to test

## Getting Help

- [Full Setup Guide](../MSTY_SETUP.md)
- [Msty Studio Documentation](https://docs.msty.studio/)
- [GitHub Issues](https://github.com/clduab11/cld-omnisearch/issues)
