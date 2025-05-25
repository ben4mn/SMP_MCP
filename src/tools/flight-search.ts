import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { FlightSearchInputSchema, FlightSearchInput, FlightSearchResponse } from '../schemas/flight-search.js';

// Define the flight search tool schema for MCP
export const flightSearchTool: Tool = {
  name: 'search_flights',
  description: 'Search for flights using SMP Air API. Supports one-way and round-trip searches with various cabin classes and passenger counts.',
  inputSchema: {
    type: 'object',
    properties: {
      departure: {
        type: 'string',
        description: '3-letter IATA airport code for departure (e.g., LAX, JFK, LHR)',
        pattern: '^[A-Z]{3}$',
      },
      arrival: {
        type: 'string',
        description: '3-letter IATA airport code for arrival (e.g., LAX, JFK, LHR)',
        pattern: '^[A-Z]{3}$',
      },
      departureDate: {
        type: 'string',
        description: 'Departure date in YYYY-MM-DD format',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
      returnDate: {
        type: 'string',
        description: 'Return date in YYYY-MM-DD format (optional, for round-trip flights)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
      passengers: {
        type: 'number',
        description: 'Number of adult passengers (1-9)',
        minimum: 1,
        maximum: 9,
        default: 1,
      },
      cabinClass: {
        type: 'string',
        description: 'Preferred cabin class',
        enum: ['economy', 'economyPremium', 'business', 'businessPremium', 'first', 'firstPremium'],
        default: 'economy',
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of flight results to return (1-50)',
        minimum: 1,
        maximum: 50,
        default: 10,
      },
    },
    required: ['departure', 'arrival', 'departureDate'],
  },
};

// Flight search tool handler function
export async function handleFlightSearch(args: unknown): Promise<FlightSearchResponse> {
  // Validate input arguments
  const input = FlightSearchInputSchema.parse(args);
  
  // Import the search function here to avoid circular dependencies
  const { searchFlights } = await import('../api/client.js');
  
  try {
    // Perform the flight search
    const result = await searchFlights(input);
    return result;
  } catch (error) {
    console.error('Flight search failed:', error);
    
    // Return error response in expected format
    return {
      flights: [],
      searchCriteria: {
        departure: input.departure,
        arrival: input.arrival,
        departureDate: input.departureDate,
        returnDate: input.returnDate,
        passengers: input.passengers,
        cabinClass: input.cabinClass,
      },
      totalResults: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
    };
  }
}

// Helper function to format flight search results for display
export function formatFlightResults(response: FlightSearchResponse): string {
  if (response.errors && response.errors.length > 0) {
    return `❌ Flight search failed:\n${response.errors.join('\n')}`;
  }

  if (response.flights.length === 0) {
    return `No flights found for ${response.searchCriteria.departure} → ${response.searchCriteria.arrival} on ${response.searchCriteria.departureDate}`;
  }

  let output = `✈️ Found ${response.totalResults} flights for ${response.searchCriteria.departure} → ${response.searchCriteria.arrival}\n`;
  output += `📅 Departure: ${response.searchCriteria.departureDate}`;
  if (response.searchCriteria.returnDate) {
    output += ` | Return: ${response.searchCriteria.returnDate}`;
  }
  output += `\n👥 Passengers: ${response.searchCriteria.passengers} | 🎫 Class: ${response.searchCriteria.cabinClass}\n\n`;

  response.flights.forEach((flight, index) => {
    output += `🔸 Flight ${index + 1}:\n`;
    output += `   ${flight.airline} ${flight.flightNumber} (${flight.aircraft || 'N/A'})\n`;
    output += `   🛫 ${flight.departure.airport} ${flight.departure.time} → 🛬 ${flight.arrival.airport} ${flight.arrival.time}\n`;
    output += `   ⏱️ Duration: ${flight.duration} | 🔄 Stops: ${flight.stops}\n`;
    output += `   💰 ${flight.price.currency} ${flight.price.total.toFixed(2)} | 🎫 ${flight.cabinClass} (${flight.bookingClass})\n`;
    
    if (flight.baggage) {
      output += `   🧳 Baggage: ${flight.baggage.pieces || 0} pieces`;
      if (flight.baggage.weight) {
        output += ` (${flight.baggage.weight}${flight.baggage.unit || 'kg'})`;
      }
      output += '\n';
    }
    
    const policies = [];
    if (flight.refundable !== undefined) {
      policies.push(flight.refundable ? '✅ Refundable' : '❌ Non-refundable');
    }
    if (flight.exchangeable !== undefined) {
      policies.push(flight.exchangeable ? '✅ Exchangeable' : '❌ Non-exchangeable');
    }
    if (policies.length > 0) {
      output += `   📋 ${policies.join(' | ')}\n`;
    }
    
    output += '\n';
  });

  if (response.warnings && response.warnings.length > 0) {
    output += `⚠️ Warnings:\n${response.warnings.join('\n')}\n`;
  }

  return output.trim();
} 