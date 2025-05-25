// SMP Air API Types based on the documentation

// Base API response structure
export interface SmpApiResponse<T = any> {
  data?: T;
  errors?: SmpApiError[];
  warnings?: string[];
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

export interface SmpApiError {
  code: string;
  message: string;
  details?: any;
}

// Itinerary Search Request
export interface SmpItinerarySearchRequest {
  itineraryLegs: SmpItineraryLeg[];
  passengers: SmpPassenger[];
  preferences?: SmpSearchPreferences;
  companyId: string;
  gdsCode: string;
  officeId: string;
  mode: 'fake' | 'real';
  fields: 'none' | 'all';
  echoToken: string;
}

export interface SmpItineraryLeg {
  departureLocation: string;
  arrivalLocation: string;
  dateTime: string; // ISO 8601 format
  dateTimeMode: 'departureDateTime' | 'arrivalDateTime';
  preferredCabinClasses?: string[];
}

export interface SmpPassenger {
  passengerType: 'adult' | 'child' | 'infant';
  age?: number;
}

export interface SmpSearchPreferences {
  maxNumberOfStops?: number;
  preferredAirlines?: string[];
  excludedAirlines?: string[];
  maxPrice?: number;
  currency?: string;
}

// Itinerary Search Response
export interface SmpItinerarySearchResponse {
  itineraries: SmpItinerary[];
  searchCriteria: SmpSearchCriteria;
  meta?: {
    totalResults: number;
    searchTime: number;
    currency: string;
  };
}

export interface SmpItinerary {
  id: string;
  legs: SmpItineraryLegResult[];
  pricing: SmpPricing[];
  validatingCarrier: string;
  fareType: string;
  bookingClass: string;
  refundable: boolean;
  exchangeable: boolean;
  baggage?: SmpBaggage;
  fareRules?: SmpFareRule[];
}

export interface SmpItineraryLegResult {
  id: string;
  departureLocation: SmpLocation;
  arrivalLocation: SmpLocation;
  departureDateTime: string;
  arrivalDateTime: string;
  duration: string; // ISO 8601 duration format
  segments: SmpSegment[];
  stops: number;
}

export interface SmpLocation {
  code: string; // IATA airport code
  name: string;
  city: string;
  country: string;
  terminal?: string;
}

export interface SmpSegment {
  id: string;
  departureLocation: SmpLocation;
  arrivalLocation: SmpLocation;
  departureDateTime: string;
  arrivalDateTime: string;
  duration: string;
  flightNumber: string;
  airline: SmpAirline;
  aircraft: SmpAircraft;
  cabinClass: string;
  bookingClass: string;
  operatingCarrier?: SmpAirline;
  codeShare?: boolean;
}

export interface SmpAirline {
  code: string; // IATA airline code
  name: string;
}

export interface SmpAircraft {
  code: string;
  name: string;
  type?: string;
}

export interface SmpPricing {
  currency: string;
  totalPrice: number;
  basePrice: number;
  taxes: number;
  fees: number;
  breakdown: SmpPriceBreakdown[];
  passengerType: string;
  passengerCount: number;
}

export interface SmpPriceBreakdown {
  type: 'base' | 'tax' | 'fee' | 'surcharge';
  code: string;
  description: string;
  amount: number;
}

export interface SmpBaggage {
  pieces: number;
  weight: number;
  unit: 'kg' | 'lb';
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
}

export interface SmpFareRule {
  category: string;
  description: string;
  text: string;
}

export interface SmpSearchCriteria {
  legs: SmpItineraryLeg[];
  passengers: SmpPassenger[];
  preferences?: SmpSearchPreferences;
}

// Cabin class mapping
export const CABIN_CLASS_MAPPING: Record<string, string[]> = {
  economy: ['Y', 'M', 'L', 'V', 'S', 'N', 'Q', 'O', 'G', 'X'],
  economyPremium: ['W', 'E'],
  business: ['C', 'D', 'I', 'Z'],
  businessPremium: ['J'],
  first: ['F', 'A'],
  firstPremium: ['P'],
};

// Duration parsing helper
export function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return isoDuration;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  }
  return '0m';
}

// Date formatting helper
export function formatDateTime(isoDateTime: string): { date: string; time: string } {
  const date = new Date(isoDateTime);
  return {
    date: date.toISOString().split('T')[0],
    time: date.toTimeString().slice(0, 5),
  };
} 