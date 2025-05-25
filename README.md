# SMP Air MCP Server

An MCP (Model Context Protocol) server that integrates with SMP Air API to provide flight search capabilities to Claude Desktop.

## Overview

This server allows Claude Desktop to search for flights using the Supply MarketPlace (SMP) Air API by GBT. Users can ask Claude to find flights, and the server will query the SMP Air API and return formatted flight results.

## Features

- Flight search integration with SMP Air API
- Support for one-way and round-trip searches
- Multiple passenger and cabin class options
- Real-time pricing and availability
- Integration with Claude Desktop via MCP protocol

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

Set up environment variables for SMP Air API access:

```bash
SMP_API_BASE_URL=https://api.amexgbt.com
SMP_COMPANY_ID=5281df97-5579-4ea5-a6ce-620f546b6d8b
SMP_GDS_CODE=DUMMY
SMP_OFFICE_ID=TEST
SMP_MODE=fake
```

## Claude Desktop Integration

Add to your Claude Desktop configuration:

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

## Usage

Once configured, you can ask Claude to search for flights:

- "Find flights from LAX to JFK on December 25th"
- "Search for business class flights from London to Paris next week"
- "Show me the cheapest flights from NYC to Tokyo in January"

## Development

- `npm run build` - Build the TypeScript project
- `npm run dev` - Build and run the server
- `npm start` - Run the built server

## Project Structure

```
src/
├── index.ts              # Main MCP server entry point
├── tools/                # MCP tool implementations
│   └── flight-search.ts  # Flight search tool
├── api/                  # SMP Air API integration
│   ├── client.ts         # API client wrapper
│   └── types.ts          # TypeScript types for API
├── schemas/              # Zod validation schemas
│   └── flight-search.ts  # Flight search request/response schemas
└── config/               # Configuration management
    └── index.ts          # Environment variables and settings
```

## License

MIT 