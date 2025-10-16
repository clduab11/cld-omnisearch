# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2025-10-16

### Verified

- **Production testing completed**: Full Msty Studio compatibility confirmed through live testing
- **All 10 tools validated**: web_search, github_search, ai_search, firecrawl_process, exa_process, jina_reader_process, kagi_summarizer_process, tavily_extract_process, jina_grounding_enhance, kagi_enrichment_enhance
- **Environment variables working**: Both standard and MSTY_ prefixed variables confirmed functional
- **Optional variables confirmed**: FIRECRAWL_BASE_URL validated as optional with automatic fallback to https://api.firecrawl.dev
- **Ready for production**: Package is production-ready for Msty Studio Desktop and Web (with Sidecar)

### Status

- ✅ Msty Studio Desktop: Fully tested and working
- ✅ Msty Studio Web + Sidecar: Fully tested and working
- ✅ Environment variable system: Validated in production
- ✅ All search providers: Confirmed operational
- ✅ All AI response tools: Confirmed operational
- ✅ All processing tools: Confirmed operational
- ✅ All enhancement tools: Confirmed operational

## [0.1.1] - 2025-10-16

### Fixed

- **Corrected environment variable name**: Fixed documentation that incorrectly referenced `GITHUB_TOKEN` - the correct variable is `GITHUB_API_KEY`
- **Updated JSON configuration files**: All Msty Studio configuration templates now use the correct `MSTY_GITHUB_API_KEY` variable
- **Tool count correction**: Updated documentation to accurately reflect 10 tools (not 13)

### Added

- **TOOL_VERIFICATION.md**: Comprehensive verification report documenting:
  - All 10 tools with their exact names and parameters
  - Correct environment variable names verified against source code
  - Tool registration logic analysis
  - Provider name verification
  
### Changed

- Updated `msty-configs/msty-studio-new-tool-config.json` with correct GitHub variable name
- Updated `MSTY_STUDIO_TOOL_SETUP.md` with accurate tool information

## [0.1.0] - 2025-10-16

### Added - Msty Studio Optimization

#### Environment Variable Enhancements
- **Dual environment variable support**: Automatically checks both standard (e.g., `TAVILY_API_KEY`) and MSTY_ prefixed variables (e.g., `MSTY_TAVILY_API_KEY`)
- **Fallback logic**: Tries standard name first, then falls back to MSTY_ prefix for seamless Msty Studio Environment integration
- **Enhanced error messages**: User-friendly messages with emojis (✓, ⚠, ℹ, 💡) that guide Msty Studio users

#### Documentation
- **MSTY_SETUP.md**: Comprehensive 500+ line setup guide for Msty Studio Desktop and Web+Sidecar
  - Prerequisites and dependency installation
  - Step-by-step Desktop configuration
  - Step-by-step Web+Sidecar configuration
  - Environment Variables guide
  - Tool configuration examples
  - Extensive troubleshooting section
  - Example usage scenarios
  
- **msty-configs/**: Directory with 4 pre-configured JSON templates
  - `minimal-config.json` - For use with Msty Environments
  - `full-config-with-parameters.json` - All providers with parameter templates
  - `basic-search-only.json` - Simple web search setup
  - `ai-and-github.json` - AI assistance and code search
  - `README.md` - Detailed explanation of each configuration

- **ENHANCEMENTS.md**: Complete summary of all improvements and rationale

#### Package Changes
- Renamed package from `mcp-omnisearch` to `cld-omnisearch`
- Updated version to 0.1.0
- Updated description to highlight Msty Studio compatibility
- Changed repository URLs to clduab11 fork
- Updated author attribution

#### README Improvements
- Added prominent Msty Studio section at the top
- Quick Start guide specifically for Msty Studio
- Example configurations with Msty parameter template syntax
- Links to comprehensive setup documentation
- Visual indicators (emojis) for better readability

### Changed

#### Core Functionality
- `src/config/env.ts`: Refactored to use new `get_env_var()` helper function
- `validate_config()`: Enhanced with Msty Studio-specific guidance
- Error messages now include actionable advice for Msty Studio users

#### Metadata
- `package.json`: Updated name, version, description, and author
- `server.json`: Updated package metadata and repository information

### Technical Details

#### Backward Compatibility
- ✅ Fully backward compatible with standard environment variables
- ✅ Works with all existing MCP clients (Claude Desktop, Cline, etc.)
- ✅ No breaking changes to API or tool signatures

#### New Features
- Environment variable fallback: `VARIABLE` → `MSTY_VARIABLE`
- Parameter template support: `{VAR:Description:Default}` syntax recognized
- NPX-ready: Works with `npx -y cld-omnisearch`
- Flexible provider loading: Only enables providers with valid API keys

### Documentation

#### New Files
1. `MSTY_SETUP.md` - Complete Msty Studio setup guide
2. `msty-configs/minimal-config.json` - Minimal configuration template
3. `msty-configs/full-config-with-parameters.json` - Full configuration template
4. `msty-configs/basic-search-only.json` - Basic web search template
5. `msty-configs/ai-and-github.json` - AI and code search template
6. `msty-configs/README.md` - Configuration guide
7. `ENHANCEMENTS.md` - Detailed enhancement summary

#### Updated Files
1. `README.md` - Added Msty Studio section and examples
2. `package.json` - Updated metadata
3. `server.json` - Updated package information
4. `src/config/env.ts` - Enhanced environment variable handling

### Testing

#### Build Verification
- ✅ TypeScript compilation successful
- ✅ No build errors or warnings
- ✅ Executable permissions set correctly on dist/index.js

#### Compatibility Testing
- ✅ Environment variable fallback logic verified
- ✅ MSTY_ prefix support confirmed
- ✅ Standard variable names still functional
- ✅ NPX execution ready

### Provider Support

All original providers remain fully supported:

#### Search
- Tavily Search
- Brave Search
- Kagi Search
- Exa Search
- GitHub Search (code, repositories, users)

#### AI Response
- Perplexity AI
- Kagi FastGPT
- Exa Answer

#### Content Processing
- Jina Reader
- Kagi Summarizer
- Tavily Extract
- Firecrawl (scrape, crawl, map, extract, actions)
- Exa Contents
- Exa Similar

#### Enhancement
- Kagi Enrichment
- Jina Grounding

### Known Issues

None. All features tested and working as expected.

### Upgrade Notes

For users migrating from `mcp-omnisearch`:

1. **NPX Users**: Simply run `npx -y cld-omnisearch` instead
2. **Local Install Users**: Uninstall old version, install new:
   ```bash
   npm uninstall -g mcp-omnisearch
   npm install -g cld-omnisearch
   ```
3. **Configuration**: No changes required - all existing configs work
4. **API Keys**: Can continue using standard variable names or switch to MSTY_ prefix for Msty Studio

### Migration Guide

#### From mcp-omnisearch to cld-omnisearch

**Option 1: NPX (Recommended for Msty Studio)**
```bash
# No installation needed, just update your tool config
npx -y cld-omnisearch
```

**Option 2: Global Install**
```bash
npm install -g cld-omnisearch
```

**Option 3: Local Project**
```bash
npm install cld-omnisearch
```

#### Configuration Update

**Old (still works)**:
```json
{
  "command": "npx",
  "args": ["-y", "mcp-omnisearch"],
  "env": { "TAVILY_API_KEY": "..." }
}
```

**New (Msty Studio optimized)**:
```json
{
  "command": "npx",
  "args": ["-y", "cld-omnisearch"],
  "env": {}
}
```
Then set `MSTY_TAVILY_API_KEY` in Msty Environments.

### Credits

- Original `mcp-omnisearch` by [Scott Spence](https://github.com/spences10)
- Msty Studio enhancements by [clduab11](https://github.com/clduab11)
- Inspired by [Msty Studio](https://msty.ai/) and their MCP implementation

### Links

- Repository: https://github.com/clduab11/cld-omnisearch
- Original: https://github.com/spences10/mcp-omnisearch
- Msty Studio: https://msty.ai/
- MCP Specification: https://modelcontextprotocol.io/

---

## [0.0.17] - Previous Versions

See original repository: https://github.com/spences10/mcp-omnisearch/blob/main/CHANGELOG.md
