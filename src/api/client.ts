import axios, { AxiosInstance, AxiosError } from 'axios';
import { FlightSearchInput, FlightSearchResponse, FlightResult } from '../schemas/flight-search.js';
import { config, getEchoToken } from '../config/index.js';
import {
  SmpItinerarySearchRequest,
  SmpItinerarySearchResponse,
  SmpApiResponse,
  SmpItinerary,
  CABIN_CLASS_MAPPING,
  parseDuration,
  formatDateTime,
} from './types.js';

// SMP Air API Client
class SmpAirClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.smpApiBaseUrl,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SMP-Air-MCP-Server/1.0.0',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.error(`[SMP API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[SMP API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.error(`[SMP API] Response ${response.status} from ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        console.error('[SMP API] Response error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }

  async searchItineraries(request: SmpItinerarySearchRequest): Promise<SmpItinerarySearchResponse> {
    try {
      console.error('[SMP API] Searching itineraries with request:', JSON.stringify(request, null, 2));
      
      const response = await this.client.post<SmpApiResponse<SmpItinerarySearchResponse>>(
        '/air/itinerary/search',
        request
      );

      if (response.data.errors && response.data.errors.length > 0) {
        throw new Error(`SMP API Error: ${response.data.errors.map(e => e.message).join(', ')}`);
      }

      if (!response.data.data) {
        throw new Error('No data returned from SMP API');
      }

      console.error(`[SMP API] Found ${response.data.data.itineraries?.length || 0} itineraries`);
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
        throw new Error(`SMP API request failed: ${errorMessage}`);
      }
      throw error;
    }
  }
}

// Create singleton client instance
const smpClient = new SmpAirClient();

// Transform MCP input to SMP API request
function transformToSmpRequest(input: FlightSearchInput): SmpItinerarySearchRequest {
  const legs = [
    {
      departureLocation: input.departure,
      arrivalLocation: input.arrival,
      dateTime: `${input.departureDate}T00:00:00Z`,
      dateTimeMode: 'departureDateTime' as const,
      preferredCabinClasses: CABIN_CLASS_MAPPING[input.cabinClass],
    },
  ];

  // Add return leg for round-trip
  if (input.returnDate) {
    legs.push({
      departureLocation: input.arrival,
      arrivalLocation: input.departure,
      dateTime: `${input.returnDate}T00:00:00Z`,
      dateTimeMode: 'departureDateTime' as const,
      preferredCabinClasses: CABIN_CLASS_MAPPING[input.cabinClass],
    });
  }

  return {
    itineraryLegs: legs,
    passengers: Array(input.passengers).fill({ passengerType: 'adult' }),
    preferences: {
      maxNumberOfStops: 3,
    },
    companyId: config.smpCompanyId,
    gdsCode: config.smpGdsCode,
    officeId: config.smpOfficeId,
    mode: config.smpMode,
    fields: 'none',
    echoToken: getEchoToken(),
  };
}

// Transform SMP API response to MCP format
function transformToMcpResponse(
  smpResponse: SmpItinerarySearchResponse,
  input: FlightSearchInput
): FlightSearchResponse {
  const flights: FlightResult[] = [];

  for (const itinerary of smpResponse.itineraries.slice(0, input.maxResults)) {
    try {
      const flight = transformItineraryToFlight(itinerary);
      flights.push(flight);
    } catch (error) {
      console.error('[Transform] Failed to transform itinerary:', error);
      // Continue with other itineraries
    }
  }

  return {
    flights,
    searchCriteria: {
      departure: input.departure,
      arrival: input.arrival,
      departureDate: input.departureDate,
      returnDate: input.returnDate,
      passengers: input.passengers,
      cabinClass: input.cabinClass,
    },
    totalResults: flights.length,
    warnings: smpResponse.meta ? [] : ['Limited flight data available'],
  };
}

// Transform single itinerary to flight result
function transformItineraryToFlight(itinerary: SmpItinerary): FlightResult {
  const firstLeg = itinerary.legs[0];
  const firstSegment = firstLeg.segments[0];
  const lastSegment = firstLeg.segments[firstLeg.segments.length - 1];
  
  const pricing = itinerary.pricing[0]; // Use first pricing option
  
  const departureTime = formatDateTime(firstSegment.departureDateTime);
  const arrivalTime = formatDateTime(lastSegment.arrivalDateTime);
  
  return {
    id: itinerary.id,
    departure: {
      airport: firstSegment.departureLocation.code,
      time: departureTime.time,
      date: departureTime.date,
    },
    arrival: {
      airport: lastSegment.arrivalLocation.code,
      time: arrivalTime.time,
      date: arrivalTime.date,
    },
    duration: parseDuration(firstLeg.duration),
    stops: firstLeg.stops,
    airline: firstSegment.airline.name,
    flightNumber: firstSegment.flightNumber,
    aircraft: firstSegment.aircraft.name,
    cabinClass: firstSegment.cabinClass,
    price: {
      total: pricing.totalPrice,
      currency: pricing.currency,
      baseFare: pricing.basePrice,
      taxes: pricing.taxes,
    },
    bookingClass: firstSegment.bookingClass,
    fareType: itinerary.fareType,
    baggage: itinerary.baggage ? {
      pieces: itinerary.baggage.pieces,
      weight: itinerary.baggage.weight,
      unit: itinerary.baggage.unit,
    } : undefined,
    refundable: itinerary.refundable,
    exchangeable: itinerary.exchangeable,
  };
}

// Fallback mock data for when API is unavailable
function createMockResponse(input: FlightSearchInput): FlightSearchResponse {
  const mockFlights: FlightResult[] = [
    {
      id: 'mock-flight-1',
      departure: {
        airport: input.departure,
        time: '08:00',
        date: input.departureDate,
      },
      arrival: {
        airport: input.arrival,
        time: '12:00',
        date: input.departureDate,
      },
      duration: '4h 0m',
      stops: 0,
      airline: 'Mock Airlines',
      flightNumber: 'MK123',
      aircraft: 'Boeing 737',
      cabinClass: input.cabinClass,
      price: {
        total: 299.99,
        currency: 'USD',
        baseFare: 250.00,
        taxes: 49.99,
      },
      bookingClass: 'Y',
      fareType: 'Economy Basic',
      baggage: {
        pieces: 1,
        weight: 23,
        unit: 'kg',
      },
      refundable: false,
      exchangeable: true,
    },
    {
      id: 'mock-flight-2',
      departure: {
        airport: input.departure,
        time: '14:30',
        date: input.departureDate,
      },
      arrival: {
        airport: input.arrival,
        time: '19:15',
        date: input.departureDate,
      },
      duration: '4h 45m',
      stops: 1,
      airline: 'Demo Airways',
      flightNumber: 'DA456',
      aircraft: 'Airbus A320',
      cabinClass: input.cabinClass,
      price: {
        total: 399.99,
        currency: 'USD',
        baseFare: 350.00,
        taxes: 49.99,
      },
      bookingClass: 'Y',
      fareType: 'Economy Flex',
      baggage: {
        pieces: 2,
        weight: 23,
        unit: 'kg',
      },
      refundable: true,
      exchangeable: true,
    },
  ];

  return {
    flights: mockFlights.slice(0, input.maxResults),
    searchCriteria: {
      departure: input.departure,
      arrival: input.arrival,
      departureDate: input.departureDate,
      returnDate: input.returnDate,
      passengers: input.passengers,
      cabinClass: input.cabinClass,
    },
    totalResults: mockFlights.length,
    warnings: ['⚠️ Using mock data - SMP Air API unavailable or in fake mode'],
  };
}

// Main search function
export async function searchFlights(input: FlightSearchInput): Promise<FlightSearchResponse> {
  try {
    console.error('[Flight Search] Starting search with input:', input);
    
    // If in fake mode, return mock data immediately
    if (config.smpMode === 'fake') {
      console.error('[Flight Search] Using fake mode - returning mock data');
      return createMockResponse(input);
    }
    
    // Transform input to SMP API format
    const smpRequest = transformToSmpRequest(input);
    
    // Call SMP API
    const smpResponse = await smpClient.searchItineraries(smpRequest);
    
    // Transform response to MCP format
    const mcpResponse = transformToMcpResponse(smpResponse, input);
    
    console.error(`[Flight Search] Completed. Found ${mcpResponse.flights.length} flights.`);
    return mcpResponse;
    
  } catch (error) {
    console.error('[Flight Search] Error:', error);
    
    // Determine if we should fall back to mock data
    const shouldFallback = error instanceof Error && (
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('timeout') ||
      error.message.includes('Network Error')
    );
    
    if (shouldFallback) {
      console.error('[Flight Search] API unavailable, falling back to mock data');
      const mockResponse = createMockResponse(input);
      mockResponse.warnings = [
        '⚠️ SMP Air API is currently unavailable. Showing mock flight data for demonstration.',
        `Original error: ${error.message}`,
      ];
      return mockResponse;
    }
    
    // Return error response for other types of errors
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