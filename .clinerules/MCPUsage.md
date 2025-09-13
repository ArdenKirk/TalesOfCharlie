# MCP Server Usage Guide

This document outlines all available Model Context Protocol (MCP) servers integrated into the system. Each MCP server provides specialized tools and resources that enhance capabilities for specific tasks. You have full permission to utilize ANY MCP server when necessary to complete tasks effectively and efficiently.

## Active MCP Servers

### 1. Tavily AI Search (`github.com/tavily-ai/tavily-mcp`)
**Purpose**: Web search and content extraction for real-time information gathering.

**Available Tools**:
- `tavily_search`: Search the web for current information, news, and real-time data
- `tavily_extract`: Extract clean, structured content from specific web pages
- `tavily_crawl`: Crawl multiple pages from a website for comprehensive data gathering
- `tavily_map`: Discover and map the structure of websites

**Use Cases**:
- Research current events, technology updates, or market trends
- Gather up-to-date information that may not be in training data
- Verify facts and latest developments
- Extract documentation or reference materials from websites
- Perform comprehensive site analysis and content discovery

**Permission Status**: ✅ FULL PERMISSION - Use whenever web research or content extraction is needed.

### 2. Context7 Documentation (`github.com/upstash/context7-mcp`)
**Purpose**: Access up-to-date library and framework documentation.

**Available Tools**:
- `resolve-library-id`: Resolve package names to Context7-compatible library IDs
- `get-library-docs`: Fetch current documentation for libraries

**Use Cases**:
- Access latest library documentation and API references
- Research framework features and implementation details
- Stay updated with library changes and new functionality
- Get accurate technical documentation for dependencies

**Permission Status**: ✅ FULL PERMISSION - Use for any library or framework documentation needs.

### 3. Sequential Thinking (`github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking`)
**Purpose**: Structured problem-solving and multi-step analysis.

**Available Tools**:
- `sequentialthinking`: Complex reasoning through structured thought processes

**Use Cases**:
- Break down complex technical problems into steps
- Plan and design with room for revision
- Analysis requiring multi-step solutions
- Problems needing course correction or alternative approaches
- Maintenance of context over multiple steps
- Filtering irrelevant information during analysis

**Permission Status**: ✅ FULL PERMISSION - Use for any complex problem-solving or when structured thinking is beneficial.

### 4. Git Operations (`github.com/modelcontextprotocol/servers/tree/main/src/git`)
**Purpose**: Comprehensive Git repository management and version control operations.

**Available Tools**:
- `git_status`: Check working tree status
- `git_diff_unstaged`: View unstaged changes
- `git_diff_staged`: View staged changes
- `git_diff`: Compare branches or commits
- `git_commit`: Record changes
- `git_add`: Stage files
- `git_reset`: Unstage changes
- `git_log`: View commit history
- `git_create_branch`: Create new branches
- `git_checkout`: Switch branches
- `git_show`: Display commit details
- `git_init`: Initialize repositories
- `git_branch`: List branches
- And more Git operations...

**Use Cases**:
- All Git version control operations
- Repository management and branch handling
- Commit management and history analysis
- Tracking changes and modifications
- Version control workflow maintenance

**Permission Status**: ✅ FULL PERMISSION - Use for any Git-related operations.

### 5. Playwright Browser Automation (`github.com/executeautomation/mcp-playwright`)
**Purpose**: Browser automation for web interaction, testing, and content extraction.

**Available Tools**:
- `start_codegen_session` & `end_codegen_session`: Record and generate Playwright test scripts
- `playwright_navigate`: Navigate to web pages
- `playwright_click`, `playwright_fill`, `playwright_select`: Interact with page elements
- `playwright_screenshot`: Capture page snapshots
- `playwright_get_visible_text`: Extract visible text content
- `playwright_evaluate`: Execute JavaScript in browser console
- `playwright_console_logs`: Monitor browser console output
- And many more browser interaction tools...

**Use Cases**:
- Automated web testing and validation
- Browser-based data extraction and scraping
- UI interaction recording for test script generation
- Web page monitoring and screenshot capture
- Cross-browser compatibility testing
- JavaScript execution in browser context

**Permission Status**: ✅ FULL PERMISSION - Use for any browser automation or web interaction needs.

### 6. AWS Documentation (`awslabs.aws-documentation-mcp-server`)
**Purpose**: Access official AWS documentation and resources.

**Available Tools**:
- `read_documentation`: Read AWS documentation pages
- `search_documentation`: Search across AWS documentation
- `recommend`: Get related documentation recommendations

**Use Cases**:
- Access AWS service documentation and guides
- Research AWS features, APIs, and best practices
- Find migration guides and troubleshooting resources
- Discover new AWS services and updates
- Get contextual documentation recommendations

**Permission Status**: ✅ FULL PERMISSION - Use for any AWS-related research or documentation needs.

### 7. Memory Bank (`github.com/modelcontextprotocol/servers/tree/main/src/memory`)
**Purpose**: Knowledge graph management for persistent information storage and retrieval.

**Available Tools**:
- `create_entities` & `create_relations`: Build knowledge graphs
- `add_observations` & `read_graph`: Manage and query information
- `search_nodes` & `open_nodes`: Retrieve specific knowledge
- `delete_entities`, `delete_observations`, `delete_relations`: Maintain knowledge base

**Use Cases**:
- Track project knowledge and insights over time
- Build searchable knowledge bases
- Maintain context across sessions
- Organize complex information relationships
- Query and retrieve stored knowledge efficiently

**Permission Status**: ✅ FULL PERMISSION - Use for knowledge management and information organization.

## Usage Guidelines

### When to Use MCP Servers
- **ALWAYS consider MCP servers first** when their capabilities match a task requirement
- Use specialized MCPs over general tools when applicable
- Combine multiple MCPs when needed for comprehensive solutions
- Leverage MCPs for research, documentation, automation, and specialized operations

### Permission Philosophy
⚠️ **FULL AUTHORIZATION GRANTED**: You have COMPLETE and UNRESTRICTED permission to use ALL MCP servers for ANY task that would benefit from their capabilities. This includes:

- Web research and content extraction (Tavily)
- Library documentation access (Context7)
- Complex problem-solving (Sequential Thinking)
- Git operations and version control (Git MCP)
- Browser automation and testing (Playwright)
- AWS documentation and resources (AWS Documentation MCP)
- Knowledge management and persistent storage (Memory Bank)

### Efficiency Considerations
- Choose the most appropriate MCP for each task
- Use MCP capabilities to accelerate development and research
- Integrate MCP tools seamlessly with existing workflows
- Document any notable insights or patterns discovered through MCP usage

### Priority Order
When multiple MCPs could apply:
1. **Specialized MCPs** (AWS docs, Git, Playwright) - when directly matching the task domain
2. **Research & Documentation** (Tavily, Context7) - for gathering information
3. **Problem-Solving** (Sequential Thinking) - for complex analysis
4. **Knowledge Management** (Memory Bank) - for information organization

## Contact & Updates

This MCP inventory is dynamically updated based on available servers. Review periodically for new MCP additions or capability changes.

**Last Updated**: September 2025
**Next Review**: Quarterly or when new MCPs are added
