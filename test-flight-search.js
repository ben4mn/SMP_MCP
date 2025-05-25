#!/usr/bin/env node

// Simple test script for flight search functionality
import { searchFlights } from './dist/api/client.js';

async function testFlightSearch() {
  console.log('🧪 Testing Flight Search Functionality\n');

  const testInput = {
    departure: 'LAX',
    arrival: 'JFK',
    departureDate: '2024-12-25',
    passengers: 1,
    cabinClass: 'economy',
    maxResults: 5,
  };

  console.log('📋 Test Input:', JSON.stringify(testInput, null, 2));
  console.log('\n🔍 Searching for flights...\n');

  try {
    const result = await searchFlights(testInput);
    
    console.log('✅ Search completed successfully!');
    console.log(`📊 Found ${result.flights.length} flights`);
    
    if (result.warnings && result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      result.warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`   ${error}`));
    }
    
    if (result.flights.length > 0) {
      console.log('\n✈️ Sample Flight:');
      const flight = result.flights[0];
      console.log(`   ${flight.airline} ${flight.flightNumber}`);
      console.log(`   ${flight.departure.airport} ${flight.departure.time} → ${flight.arrival.airport} ${flight.arrival.time}`);
      console.log(`   Duration: ${flight.duration} | Stops: ${flight.stops}`);
      console.log(`   Price: ${flight.price.currency} ${flight.price.total}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFlightSearch().catch(console.error); 