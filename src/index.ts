#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { flightSearchTool, handleFlightSearch, formatFlightResults } from './tools/flight-search.js';
import { config } from './config/index.js';

// Create MCP server instance
const server = new Server(
  {
    name: 'smp-air-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [flightSearchTool],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'search_flights': {
      try {
        console.error(`[MCP] Searching flights with args:`, JSON.stringify(args, null, 2));
        
        const result = await handleFlightSearch(args);
        const formattedOutput = formatFlightResults(result);
        
        console.error(`[MCP] Flight search completed. Found ${result.flights.length} flights.`);
        
        return {
          content: [
            {
              type: 'text',
              text: formattedOutput,
            },
          ],
        };
      } catch (error) {
        console.error(`[MCP] Flight search error:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `❌ Flight search failed: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Error handling
server.onerror = (error) => {
  console.error('[MCP Server Error]:', error);
};

process.on('SIGINT', async () => {
  console.error('[MCP] Received SIGINT, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('[MCP] Received SIGTERM, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

// Start the server
async function main() {
  console.error('[MCP] Starting SMP Air MCP Server...');
  console.error(`[MCP] Configuration: ${config.smpMode} mode, Company: ${config.smpCompanyId}`);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('[MCP] SMP Air MCP Server started successfully!');
  console.error('[MCP] Ready to handle flight search requests from Claude Desktop.');
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[MCP] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[MCP] Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  console.error('[MCP] Failed to start server:', error);
  process.exit(1);
}); 