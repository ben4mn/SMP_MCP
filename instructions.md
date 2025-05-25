# MCP Server for SMP Air - Implementation Plan

## Project Overview
Build an MCP (Model Context Protocol) server that integrates with SMP Air API to provide flight search capabilities to Claude Desktop.

## Implementation Instruction Set

### Phase 1: Project Setup & Structure
1. **Initialize Node.js/TypeScript project**
   - Create `package.json` with MCP SDK dependencies
   - Set up TypeScript configuration
   - Create basic project structure

2. **Install Dependencies**
   - `@modelcontextprotocol/sdk` - MCP SDK for TypeScript
   - `axios` - HTTP client for SMP Air API calls
   - `zod` - Schema validation for API requests/responses
   - Development dependencies (TypeScript, etc.)

3. **Project Structure**
   ```
   smp-air-mcp-server/
   ├── src/
   │   ├── index.ts              # Main MCP server entry point
   │   ├── tools/                # MCP tool implementations
   │   │   └── flight-search.ts  # Flight search tool
   │   ├── api/                  # SMP Air API integration
   │   │   ├── client.ts         # API client wrapper
   │   │   └── types.ts          # TypeScript types for API
   │   ├── schemas/              # Zod validation schemas
   │   │   └── flight-search.ts  # Flight search request/response schemas
   │   └── config/               # Configuration management
   │       └── index.ts          # Environment variables and settings
   ├── package.json
   ├── tsconfig.json
   └── README.md
   ```

### Phase 2: Core MCP Server Implementation
1. **Create MCP Server Foundation**
   - Set up stdio transport for Claude Desktop integration
   - Implement server initialization and capability negotiation
   - Configure server to expose "tools" capability

2. **Define Tool Schema**
   - Create flight search tool with proper JSON schema
   - Define input parameters (departure, arrival, date, passengers, etc.)
   - Define output format for flight results

### Phase 3: SMP Air API Integration
1. **API Client Implementation**
   - Create authenticated HTTP client for SMP Air API
   - Implement request/response handling
   - Add error handling and retry logic

2. **Configuration Management**
   - Environment variables for API credentials
   - Company ID, GDS code, Office ID configuration
   - API base URL and endpoints

3. **Data Transformation**
   - Convert MCP tool inputs to SMP Air API format
   - Transform SMP Air responses to user-friendly format
   - Handle complex nested data structures (pricing, schedules, etc.)

### Phase 4: Flight Search Tool Implementation
1. **Core Search Functionality**
   - Implement `search_flights` tool
   - Handle one-way and round-trip searches
   - Support multiple passengers and cabin classes

2. **Input Validation**
   - Validate airport codes (3-letter IATA)
   - Validate dates and passenger counts
   - Provide helpful error messages

3. **Response Formatting**
   - Format flight results for readability
   - Include key information: price, duration, stops, airlines
   - Handle multiple pricing options per itinerary

### Phase 5: Error Handling & Robustness
1. **API Error Handling**
   - Handle SMP Air API errors gracefully
   - Implement timeout and retry logic
   - Provide meaningful error messages to users

2. **Validation & Security**
   - Input sanitization and validation
   - Rate limiting considerations
   - Secure credential handling

### Phase 6: Testing & Documentation
1. **Testing Setup**
   - Use SMP Air "fake mode" for testing
   - Test with dummy company IDs provided in documentation
   - Validate MCP protocol compliance

2. **Documentation**
   - README with setup instructions
   - Configuration guide for Claude Desktop
   - Usage examples and troubleshooting

## Build Order

### Step 1: Foundation (30 minutes)
- [ ] Initialize Node.js project with TypeScript
- [ ] Install MCP SDK and dependencies
- [ ] Create basic project structure
- [ ] Set up TypeScript configuration

### Step 2: MCP Server Core (45 minutes)
- [ ] Implement basic MCP server with stdio transport
- [ ] Add server initialization and capability negotiation
- [ ] Create flight search tool schema definition
- [ ] Test MCP server connection with Claude Desktop

### Step 3: SMP Air Integration (60 minutes)
- [ ] Create SMP Air API client
- [ ] Implement authentication and configuration
- [ ] Add TypeScript types for API requests/responses
- [ ] Test API connectivity with dummy credentials

### Step 4: Flight Search Implementation (90 minutes)
- [ ] Implement flight search tool logic
- [ ] Add input validation and transformation
- [ ] Implement response formatting
- [ ] Handle error cases and edge conditions

### Step 5: Testing & Polish (45 minutes)
- [ ] Test with various search scenarios
- [ ] Refine error handling and user messages
- [ ] Add logging and debugging capabilities
- [ ] Create documentation and setup guide

## Key Configuration Requirements

### Environment Variables Needed:
```bash
SMP_API_BASE_URL=https://api.amexgbt.com
SMP_COMPANY_ID=5281df97-5579-4ea5-a6ce-620f546b6d8b  # Test company
SMP_GDS_CODE=DUMMY
SMP_OFFICE_ID=TEST
SMP_MODE=fake  # Use fake mode for testing
```

### Claude Desktop Configuration:
```json
{
  "mcpServers": {
    "smp-air": {
      "command": "node",
      "args": ["path/to/smp-air-mcp-server/dist/index.js"],
      "env": {
        "SMP_API_BASE_URL": "https://api.amexgbt.com",
        "SMP_COMPANY_ID": "5281df97-5579-4ea5-a6ce-620f546b6d8b",
        "SMP_GDS_CODE": "DUMMY",
        "SMP_OFFICE_ID": "TEST",
        "SMP_MODE": "fake"
      }
    }
  }
}
```

## Expected Deliverables

1. **Working MCP Server** that integrates with Claude Desktop
2. **Flight Search Tool** that queries SMP Air API
3. **Configuration Guide** for setting up with Claude Desktop
4. **Documentation** with usage examples
5. **Error Handling** for common failure scenarios

## Questions for Confirmation

1. **Authentication**: Should I use the test company IDs from the documentation, or do you have specific credentials?

2. **Scope**: Should I focus only on flight search, or also include other SMP Air features (fare rules, seat maps, etc.)?

3. **Output Format**: Do you prefer detailed technical flight data or user-friendly summaries?

4. **Error Handling**: How verbose should error messages be for debugging vs. user experience?

5. **Testing**: Should I include automated tests or focus on manual testing with Claude Desktop?

**Please confirm this plan and answer any questions before I begin implementation.** 