import { z } from 'zod';

// Flight search input schema for MCP tool
export const FlightSearchInputSchema = z.object({
  departure: z.string().length(3).describe('3-letter IATA airport code for departure (e.g., LAX)'),
  arrival: z.string().length(3).describe('3-letter IATA airport code for arrival (e.g., JFK)'),
  departureDate: z.string().describe('Departure date in YYYY-MM-DD format'),
  returnDate: z.string().optional().describe('Return date in YYYY-MM-DD format (for round-trip)'),
  passengers: z.number().int().min(1).max(9).default(1).describe('Number of adult passengers'),
  cabinClass: z.enum(['economy', 'economyPremium', 'business', 'businessPremium', 'first', 'firstPremium'])
    .default('economy').describe('Preferred cabin class'),
  maxResults: z.number().int().min(1).max(50).default(10).describe('Maximum number of results to return'),
});

export type FlightSearchInput = z.infer<typeof FlightSearchInputSchema>;

// SMP Air API request schema
export const SmpItinerarySearchRequestSchema = z.object({
  itineraryLegs: z.array(z.object({
    departureLocation: z.string(),
    arrivalLocation: z.string(),
    dateTime: z.string(),
    dateTimeMode: z.literal('departureDateTime'),
    preferredCabinClasses: z.array(z.string()).optional(),
  })),
  passengers: z.array(z.object({
    passengerType: z.literal('adult'),
  })),
  preferences: z.object({
    maxNumberOfStops: z.number().default(3),
  }).optional(),
  companyId: z.string(),
  gdsCode: z.string(),
  officeId: z.string(),
  mode: z.enum(['fake', 'real']),
  fields: z.literal('none'),
  echoToken: z.string(),
});

export type SmpItinerarySearchRequest = z.infer<typeof SmpItinerarySearchRequestSchema>;

// Flight result schema for MCP tool output
export const FlightResultSchema = z.object({
  id: z.string(),
  departure: z.object({
    airport: z.string(),
    time: z.string(),
    date: z.string(),
  }),
  arrival: z.object({
    airport: z.string(),
    time: z.string(),
    date: z.string(),
  }),
  duration: z.string(),
  stops: z.number(),
  airline: z.string(),
  flightNumber: z.string(),
  aircraft: z.string().optional(),
  cabinClass: z.string(),
  price: z.object({
    total: z.number(),
    currency: z.string(),
    baseFare: z.number().optional(),
    taxes: z.number().optional(),
  }),
  bookingClass: z.string(),
  fareType: z.string(),
  baggage: z.object({
    pieces: z.number().optional(),
    weight: z.number().optional(),
    unit: z.string().optional(),
  }).optional(),
  refundable: z.boolean().optional(),
  exchangeable: z.boolean().optional(),
});

export type FlightResult = z.infer<typeof FlightResultSchema>;

// Flight search response schema
export const FlightSearchResponseSchema = z.object({
  flights: z.array(FlightResultSchema),
  searchCriteria: z.object({
    departure: z.string(),
    arrival: z.string(),
    departureDate: z.string(),
    returnDate: z.string().optional(),
    passengers: z.number(),
    cabinClass: z.string(),
  }),
  totalResults: z.number(),
  warnings: z.array(z.string()).optional(),
  errors: z.array(z.string()).optional(),
});

export type FlightSearchResponse = z.infer<typeof FlightSearchResponseSchema>; 