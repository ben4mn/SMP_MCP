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

Once configured, you can ask Claude to search for flights using natural language:

### Example Queries:
- **Basic Search**: "Find flights from LAX to JFK on December 25th"
- **With Class**: "Search for business class flights from London to Paris next week"
- **Multiple Passengers**: "Show me flights for 2 passengers from NYC to Tokyo in January"
- **Round Trip**: "Find round-trip flights from San Francisco to New York, departing December 20th and returning December 27th"
- **Specific Requirements**: "Search for economy premium flights from Miami to Barcelona with maximum 1 stop"

### Supported Parameters:
- **Departure/Arrival**: 3-letter IATA airport codes (LAX, JFK, LHR, etc.)
- **Dates**: Any date format (Claude will convert to YYYY-MM-DD)
- **Passengers**: 1-9 adult passengers
- **Cabin Classes**: Economy, Economy Premium, Business, Business Premium, First, First Premium
- **Trip Types**: One-way and round-trip
- **Results**: Up to 50 flight options per search

### Sample Response:
```
✈️ Found 2 flights for LAX → JFK
📅 Departure: 2024-12-25
👥 Passengers: 1 | 🎫 Class: economy

🔸 Flight 1:
   Mock Airlines MK123 (Boeing 737)
   🛫 LAX 08:00 → 🛬 JFK 12:00
   ⏱️ Duration: 4h 0m | 🔄 Stops: 0
   💰 USD 299.99 | 🎫 economy (Y)
   🧳 Baggage: 1 pieces (23kg)
   📋 ❌ Non-refundable | ✅ Exchangeable
```

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

## Troubleshooting

### Common Issues:

1. **Server not connecting to Claude Desktop**
   - Verify the path in Claude Desktop config is correct
   - Check that the server builds successfully: `npm run build`
   - Restart Claude Desktop after configuration changes

2. **"Module not found" errors**
   - Ensure you've run `npm install` and `npm run build`
   - Check that the dist folder exists and contains compiled files

3. **API connection issues**
   - The server automatically falls back to mock data if SMP Air API is unavailable
   - Check environment variables are set correctly
   - For testing, use `SMP_MODE=fake` (default)

4. **No flight results**
   - Verify airport codes are valid 3-letter IATA codes
   - Check date format is YYYY-MM-DD
   - Try different routes or dates

### Testing the Server:
```bash
# Test the flight search functionality
node test-flight-search.js

# Test the MCP server directly
npm run dev
```

### Logs:
- MCP server logs appear in Claude Desktop's developer console
- Additional logs are written to stderr for debugging

## API Modes

- **Fake Mode** (`SMP_MODE=fake`): Returns mock flight data for testing
- **Real Mode** (`SMP_MODE=real`): Connects to actual SMP Air API (requires valid credentials)

## License

MIT 