# SMP Air API Schemas

## Core Search Schemas

### ItinerarySearchRequest

The main request schema for searching flight itineraries.

```json
{
  "itineraryLegs": [
    {
      "departureLocation": "string", // Required, 3-letter airport code (e.g., "LAX")
      "arrivalLocation": "string",   // Required, 3-letter airport code (e.g., "JFK")
      "viaLocation": "string",       // Optional, 3-letter airport code
      "avoidViaLocations": ["string"], // Optional, array of 3-letter airport codes
      "dateTime": "string",          // Required, ISO 8601 date-time (e.g., "2019-12-25T12:00:00")
      "dateTimeMode": "string",      // Required, enum: ["departureDateTime", "arrivalDateTime"]
      "timeWindow": "string",        // Optional, time span format "hh:mm[:ss]" within 24 hours
      "preferredCabinClasses": ["string"] // Optional, enum: ["economy", "economyPremium", "business", "businessPremium", "first", "firstPremium"]
    }
  ],
  "passengers": [
    {
      "passengerType": "adult",      // Required, currently only "adult" supported
      "subscriptionCard": {          // Optional, for Air France discount cards
        "airline": {
          "code": "string",          // Required if subscriptionCard present
          "type": "iata"             // Required, currently only "iata"
        },
        "number": "string",          // Required, 1-30 alphanumeric characters
        "type": "string"             // Required, enum: ["airFranceFranceEuropeNorthAfrica", "airFranceWestIndiesFrenchGuianaReunion", "airFranceCombined"]
      }
    }
  ],
  "preferences": {                   // Optional search preferences
    "airlines": [                    // Optional, max 3 preferred airlines
      {
        "code": "string",            // Required, 2-character airline code (e.g., "AF")
        "type": "iata"               // Required, currently only "iata"
      }
    ],
    "exchangeableBeforeDeparture": "string", // Optional, enum: ["yesPossiblyWithPenalties", "yesWithoutPenalties"]
    "refundableBeforeDeparture": "string",   // Optional, enum: ["yesPossiblyWithPenalties", "yesWithoutPenalties"]
    "maxNumberOfStops": 3            // Optional, integer 0-3, default 3
  },
  "travelerCategoryId": "string"     // Optional, UUID for Neo traveler category
}
```

#### Key Field Details:

- **itineraryLegs**: Array of 1-5 flight legs (for multi-city trips)
- **departureLocation/arrivalLocation**: 3-letter IATA airport codes
- **dateTime**: Local airport time in ISO 8601 format
- **timeWindow**: Search window in HH:MM format (e.g., "02:30" for ±2.5 hours)
- **passengers**: Currently only supports adult passengers
- **preferences**: Optional filters for airlines, refundability, etc.

### ItinerarySearchResponse

The response containing search results and metadata.

```json
{
  "operationId": "string",           // Deprecated, operation identifier for long-running ops
  "status": "string",                // Deprecated, enum: ["pending", "done"]
  "mode": "string",                  // Required, enum: ["fake", "real"]
  "companyId": "string",             // Required, company identifier
  "dkNumber": "string",              // Optional, account granularity identifier
  "gdsCode": "string",               // Required, internal GDS identifier
  "officeId": "string",              // Required, office ID for PNR creation
  "fields": "string",                // Required, enum: ["none", "internalDetails", "policy"]
  "itineraryLegs": [...],            // Echo of request legs
  "passengers": [...],               // Echo of request passengers
  "preferences": {...},              // Echo of request preferences
  "appRequestId": "string",          // Optional, UUID for client tracking
  "echoToken": "string",             // Optional, UUID for session linking
  "travelerCategoryId": "string",    // Optional, UUID for price policies
  "referenceLists": {
    "brandDescriptions": [           // Optional, brand information
      {
        "id": 123,                   // Integer ID
        "text": "string"            // Multi-line description (lines separated by \n)
      }
    ]
  },
  "pricedItineraries": [
    {
      "legIndices": [0],             // Array of leg indices this price applies to
      "legs": [...],                 // Array of Leg objects (flight details)
      "prices": [
        {
          "priceId": "string",       // Required, unique price identifier (max 4000 chars)
          "groupId": "string",       // Optional, for multi-leg journeys
          "baseFare": {
            "amount": 299.99,        // Required, numeric amount
            "currency": "USD"        // Required, 3-letter currency code
          },
          "convertedBaseFare": {     // Optional, supplier-converted base fare
            "amount": 299.99,
            "currency": "USD"
          },
          "totalFare": {             // Required, total fare including taxes
            "amount": 349.99,
            "currency": "USD"
          },
          "totalTaxes": {            // Optional, total taxes amount
            "amount": 50.00,
            "currency": "USD"
          },
          "taxes": [                 // Required, breakdown of taxes
            {
              "amount": 25.00,
              "currency": "USD",
              "code": "US",          // Optional, 2-3 character tax code
              "label": "Security Fee" // Optional, human-readable label
            }
          ],
          "paymentFees": [...],      // Required, payment-related fees
          "bookingFees": [...],      // Required, booking-related fees
          "crsCode": "string",       // Required, CRS identifier
          "source": "string",        // Required, enum: ["atpco", "ndc", "api", "ticketless", "directConnect"]
          "lastTicketingLocalDate": "2019-09-13T23:59:00", // Optional, ticketing deadline
          "offerExpirationDate": "2019-09-12T13:03:12+00:00", // Optional, offer expiration
          "subscriptionCardType": "string", // Optional, required card type
          "validatingCarriers": [    // Required, airlines that can validate ticket
            {
              "code": "AF",
              "type": "iata"
            }
          ],
          "ancillaries": [           // Required, available ancillary services
            {
              "type": "bag",         // enum: ["bag", "inFlightService", "meal", "seat", "insurance", "checkIn", "other", "assistance"]
              "description": "Extra bag",
              "cost": {
                "amount": 35.00,
                "currency": "USD"
              },
              "segmentIndices": [0]  // Which segments this applies to
            }
          ],
          "legs": [                  // Required, pricing details by leg
            {
              "segments": [          // Required, pricing details by segment
                {
                  "bookingClass": "Y", // Required, 1-2 character booking class
                  "fareBasis": "YCA14", // Optional, 1-32 character fare basis
                  "fareType": "public", // Required, enum: ["public", "private"]
                  "farePassengerType": "ADT", // Required, 3-character passenger type
                  "privateFareType": "corporate", // Optional, enum: ["agency", "corporate", "unknown"]
                  "fareLabel": "Economy Saver", // Optional, human-readable fare name
                  "accountCode": "CORP123", // Optional, 1-32 character account code
                  "cabinClass": "economy", // Required, enum: ["economy", "economyPremium", "business", "businessPremium", "first", "firstPremium"]
                  "checkedBags": {     // Optional, baggage allowance
                    "pieces": 1,       // Deprecated, use numberOfPieces
                    "numberOfPieces": 1, // Optional, number of pieces allowed
                    "weight": 23.0,    // Optional, weight limit
                    "unit": "kg"       // Optional, enum: ["kg", "lbs"]
                  },
                  "brandedFareId": "BASIC", // Optional, 1-32 character branded fare ID
                  "brandedFareName": "Basic Economy", // Optional, 1-64 character name
                  "brandedFareDescriptionId": 123, // Optional, reference to brandDescriptions
                  "meals": ["lunch"]  // Required, enum: ["breakfast", "alcoholicBeverage", "continentalBreakfast", "dinner", "foodForPurchase", "foodAndBeverageForPurchase", "hotMeal", "lunch", "meal", "noMealService", "coldMeal", "alcoholicBeverageForPurchase", "refreshment", "snack", "refreshmentForPurchase"]
                }
              ]
            }
          ],
          "exchangeableBeforeDeparture": { // Optional, exchange policies
            "exchangeable": true,
            "penalty": {
              "amount": 50.00,
              "currency": "USD"
            }
          },
          "exchangeableAfterDeparture": { // Optional, post-departure exchange
            "exchangeable": false,
            "penalty": null
          },
          "refundableBeforeDeparture": { // Optional, refund policies
            "refundable": true,
            "penalty": {
              "amount": 25.00,
              "currency": "USD"
            }
          },
          "refundableAfterDeparture": { // Optional, post-departure refund
            "refundable": false,
            "penalty": null
          },
          "allowedFormOfPayments": [  // Required, enum: ["companyAccount", "agencyAccount", "creditCard"]
            "creditCard",
            "companyAccount"
          ],
          "policies": [              // Required, travel policy compliance
            {
              "status": "inPolicy",  // Required, enum: ["inPolicy", "outOfPolicy", "hidden"]
              "reason": {
                "bookingRule": "Applies for a flight PAR => NYC",
                "cappingRule": "Applies if the price is at most 100$ above the lowest fare"
              },
              "relatedPriceIds": []  // Required, related multi-ticket price IDs
            }
          ],
          "internalDetails": {       // Optional, internal pricing details
            "virtualPrice": {
              "amount": 325.00,
              "currency": "USD"
            },
            "aggregatedVirtualPrice": {
              "amount": 325.00,
              "currency": "USD"
            },
            "virtualPriceDetails": {
              "agencyTierPenalty": 0.0,
              "corporateTierPenalty": 0.0,
              "farePenalty": 10.0,
              "sourcePenalty": 5.0,
              "stopsPenalty": 0.0,
              "durationPenalty": 0.0,
              "totalPenalty": 15.0
            }
          },
          "allowedActions": [        // Required, available actions for this price
            "retrieveRules",         // enum: ["retrieveRules", "price", "book", "addOrders", "seatMap", "upsell", "preModify", "preCancel", "postModify", "postCancelFull", "postCancelPartial"]
            "book",
            "seatMap"
          ]
        }
      ],
      "promoted": false              // Required, whether this itinerary is promoted
    }
  ],
  "warnings": [                      // Required, array of warning messages
    {
      "code": "timeWindowTruncated", // Required, warning code
      "message": "Search limited to requested day" // Optional, developer message
    }
  ],
  "errors": [                       // Required, array of error messages
    {
      "code": "crsError",           // Required, error code
      "message": "Supplier error details" // Optional, developer message
    }
  ]
}
```

#### Key Response Fields:

- **pricedItineraries**: Array of flight options with pricing
- **priceId**: Unique identifier needed for booking and fare rules
- **totalFare**: Final price including all taxes and fees
- **source**: Price source (ATPCO, NDC, API, etc.)
- **allowedActions**: What operations are available for this price
- **policies**: Travel policy compliance status
- **warnings/errors**: Non-blocking warnings and blocking errors

#### Warning Codes:
- `timeWindowTruncated`: Search limited to requested day
- `crsWarning`: Supplier-specific warning
- `crsLimitation`: Unsupported search parameters
- `timeZoneNotFound`: Time zone determination failed
- `itinerariesNotSorted`: Unable to sort results
- `sanctionedItineraryRemoved`: Sanctioned content removed
- `unsupportedItineraryRemoved`: Unknown content removed
- `sanctionedPreferenceRemoved`: Sanctioned airline preference ignored
- `smpLimitation`: SMP limitation encountered
- `crsDeactivated`: CRS deactivated
- `policyDisabledForCompany`: Policy disabled for company
- `policyUnavailableForCompany`: Company not supported by policy engine
- `policyUnavailable`: Policy service error
- `policyUnavailableForMultiLegAndMultiTicket`: Policy disabled for complex searches
- `crsTimeout`: Supplier timeout

#### Error Codes:
- `smpError`: Internal SMP error
- `crsError`: Supplier error or unexpected response
- `crsLimitation`: CRS limitation prevents processing
- `itineraryRequestContainsSanctionedLocation`: Sanctioned location in request
- `itineraryRequestContainsSanctionedRoute`: Sanctioned route in request
- `invalidConfiguration`: Invalid company configuration
- `crsInvalidConfiguration`: Invalid supplier configuration
- `crsTimeout`: Supplier timeout

## Usage Notes

### Required Authentication Fields:
Every request must include:
- `companyId`: Company identifier
- `gdsCode`: GDS identifier  
- `officeId`: Office ID for PNR creation
- `echoToken`: Session tracking UUID

### Price Identification:
- Use `priceId` from search results for fare rules and booking
- `groupId` links related prices for multi-leg journeys
- Check `allowedActions` array to verify available operations

### Time Handling:
- All `dateTime` fields use local airport time
- `timeWindow` creates search flexibility around specified time
- `lastTicketingLocalDate` is in agency timezone
- `offerExpirationDate` is typically in UTC

### Cabin Classes:
Standard hierarchy: `economy` < `economyPremium` < `business` < `businessPremium` < `first` < `firstPremium`

### Payment Methods:
- `companyAccount`: Corporate billing
- `agencyAccount`: Agency billing  
- `creditCard`: Credit card payment
