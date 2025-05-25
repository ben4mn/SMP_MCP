# Supply MarketPlace Air Swagger API Documentation

**Version:** 2025.7.5.0  
**Format:** OAS3  
**Base URL:** `https://api.amexgbt.com`

## Overview

The Supply MarketPlace is the middleware application layer developed by GBT which allows client applications (e.g. Online Booking Tools, Agent POS tools) to access all inventory available in the GBT ecosystem through a single set of APIs. The SMP APIs are divided into groupings applicable to each product line.

## SMP Air API

SMP allows searching for valid itineraries in the GBT ecosystem through a set of JSON based, REST-like API calls and is technically equivalent to an integration with an air direct link.

### API Function Groups

#### Diagnostics
- **GET** `/smp/air/v1/ping` - Health check endpoint

#### Itineraries
- **POST** `/smp/air/v1/itineraries/search` - Retrieves priced itineraries

#### Fare
- **POST** `/smp/air/v1/fare/retrieveRules` - Retrieves fare rules

#### Offers
- **POST** `/smp/air/v1/offers/price` - Prices an offer (experimental API)
- **GET** `/smp/air/v1/offers/price/{operationId}` - Gets the status of an ongoing price offer operation
- **POST** `/smp/air/v1/offers/getSeats` - Retrieves seat map
- **GET** `/smp/air/v1/offers/getSeats/{operationId}` - Gets the status of an ongoing seat map request operation
- **POST** `/smp/air/v1/offers/upsell` - Retrieves upsell offers for selected priced itinerary

#### Reservations
- **POST** `/smp/air/v1/reservations/book` - Books a travel itinerary
- **GET** `/smp/air/v1/reservations/book/{operationId}` - Gets the status of an ongoing booking operation
- **POST** `/smp/air/v1/reservations/pay` - Pay for a reservation
- **GET** `/smp/air/v1/reservations/pay/{operationId}` - Gets the status of an ongoing payment operation
- **POST** `/smp/air/v1/reservations/retrieve` - Retrieves a reservation
- **GET** `/smp/air/v1/reservations/retrieve/{operationId}` - Gets the status of an ongoing retrieve operation
- **POST** `/smp/air/v1/reservations/cancel` - Cancels a reservation
- **GET** `/smp/air/v1/reservations/cancel/{operationId}` - Gets the status of an ongoing cancel operation
- **POST** `/smp/air/v1/reservations/addOrders` - Adds itineraries to an existing reservation
- **GET** `/smp/air/v1/reservations/addOrders/{operationId}` - Gets the status of an ongoing booking operation
- **POST** `/smp/air/v1/reservations/cancelOrders` - Cancels orders from a PNR
- **GET** `/smp/air/v1/reservations/cancelOrders/{operationId}` - Gets the status of an ongoing cancel orders operation

#### Exchange Operations
- **POST** `/smp/air/v1/reservations/exchange/itineraries/search` - Retrieves priced itineraries usable to exchange all or part of a ticketed reservation
- **GET** `/smp/air/v1/reservations/exchange/itineraries/search/{operationId}` - Get details for a long running exchange shopping request
- **POST** `/smp/air/v1/reservations/exchange/book` - Exchanges an itinerary part of a ticketed reservation
- **GET** `/smp/air/v1/reservations/exchange/book/{operationId}` - Gets the status of an ongoing exchange booking operation

#### Utilities
- **GET** `/smp/air/v1/utilities/airlines` - Gets the list of supported airlines in SMP Air
- **GET** `/smp/air/v1/utilities/locations` - Gets the list of supported locations (airports and cities) in SMP Air
- **GET** `/smp/air/v1/utilities/experiments` - Gets the list of experiments for the current Interactive User
- **GET** `/smp/air/v1/utilities/gdsSettings` - Gets the GDS settings

## General Principles and Guidelines

### SMP Air Standard Workflow

A typical search-to-booking transaction using the SMP Air API normally involves the following workflow:

1. Search for itineraries between selected cities or airports
2. Display the fare rules for a selected itinerary
3. (optionally) Get upsell options for the selected offer
4. (optionally) Price an offer in order to get updated price information
5. (optionally) Display the seat maps for the selected itinerary
6. (if paying with a credit card) Tokenize the credit card for the reservation
7. Make a reservation
8. (if paying with a credit card) Tokenize the credit card for the payment
9. Pay for the reservation (the reservation is confirmed only after this step)
10. (optionally) Display the reservation
11. (optionally) Cancel the reservation

### PNR Amendment Workflow

It is also possible to amend an existing PNR, created outside of SMP Air API and:
- Add one or more orders to that PNR
- Cancel one or more orders from that PNR

### Exchange Workflow

When a reservation is paid, it can be exchanged via the following workflow:

1. Search for new itineraries for the given reservation or PNR
2. (optionally) Display the seat maps for the selected itinerary
3. Book the new itinerary
4. (if paying with a credit card) Tokenize the credit card for the payment
5. Pay for the exchanged reservation (the reservation is confirmed only after this step)

## Data Formats

- **Dates:** Full-date RFC 3339 format (e.g., `2017-04-06`)
- **Date-times:** Full-time RFC 3339 format (e.g., `2017-04-06T09:39:35Z`) and always returned in UTC unless explicitly specified
- **Country codes:** ISO 3166-1 alpha-2 codes (e.g., `FR`)
- **Currencies:** ISO 4217 codes (e.g., `EUR`)
- **Phone numbers:** E.164 format (e.g., `+33777010123`)

## Reference Data

### Airlines
The list of supported airlines is available through the endpoint `/utilities/airlines`. 

**Error Response:** If an unsupported airline is used, a HTTP 400 error will be returned:
```json
{
  "fault": {
    "faultstring": "Following airline(s) are not supported: IATA:99. Please use valid IATA airline codes."
  }
}
```

### Locations
The list of supported locations is available through the endpoint `/utilities/locations`.

**Error Response:** If an unsupported location is used, a HTTP 400 error is returned:
```json
{
  "fault": {
    "faultstring": "Following location(s) are not supported: LCZ. Please use valid location codes."
  }
}
```

## Forward Compatibility

The SMP Air API will evolve over time as new fields, parameters, or schemas are amended, added, or deprecated. New enumerated values may also be added. Client applications of SMP Air should implement connectivity in a forward compatible manner to account for these future modifications.

### Use of Code Generation Tools

Code generation tools may be used to automatically generate API clients from the Swagger documentation. While we guarantee not to break the API, code generated from the Swagger documentation is used at the client's risk, and we cannot provide guarantees about its backward compatibility or specific support for it.

### Not Present Values

Optional values are deliberately missing from the JSON object rather than set to `null`.

## Long-running Operations

Certain operations are asynchronous and should be queried again to retrieve results. These are referred to as "Long-running operations" and are initiated via an HTTP POST (e.g. `https://.../reservations/book`).

### Response Format

Long Running Operation responses will always contain an `id` and a `status`:

```json
{
  "operationId": "0ec735af-54cc-41c5-91b3-269bae34ed51",
  "status": "pending",
  ...
}
```

### Status Values

- **`pending`:** Indicates a follow-up HTTP GET with the operationId is required (e.g. `https://.../reservations/book/operationId`)
- **`done`:** The task is complete (does not guarantee success, only completion)

### Operation Lifecycle

- The long-running operationId resource is available for a limited time
- After expiration, SMP returns HTTP 410 Gone status
- Some endpoints may return a response directly in the initial POST request
- There is no mandatory pause period between GET requests
- A GET will usually return a response in 5 to 10 seconds

### Example Implementation

```javascript
try {
    var response = service.bookReservation();
    while (response.statusCode == 200 && response.status == "pending") {
        response = service.getBookReservationResult(response.operationId);
    }
} catch() {
    ...
}
```

### Important Notes

- HTTP 200 OK is returned as long as the operationId is correct and not expired
- Supplier issues are returned via `errors` and `warnings` fields
- Always check these fields before further processing

## Frequently Asked Questions

### When should client applications stop polling long-running operations?
Continue polling until SMP returns an operation status of `done`.

### What happens if polling stops while status is still pending?
The application will never get the operation result, potentially leading to orphaned bookings and duplicate bookings.

### Is there a mandatory pause between GET requests?
No, immediately send the next GET request when receiving a `pending` status.

### When does a long-running operation ID expire?
The lifetime varies from API to API and may change without notice. It is always less than 10 minutes. Once `done` is returned, the operationId expires and future GET requests result in HTTP 410 Gone.

## Transitioning to Non-long-running Operations

Some operations are transitioning to be non-long-running. For these operations, the `operationId` and `status` fields will become deprecated because the status will always be `done` and no follow-up GET requests will be needed.

## Errors & Warnings

Responses for certain operations have `errors` and/or `warnings` fields.

### Success Indication
- HTTP 200 OK status
- Empty or absent `errors` field

### Field Descriptions

- **`warnings`:** Information that doesn't prevent current operation but indicates it won't complete as requested (obsolete endpoint, non-applicable query parameters, etc.)
- **`errors`:** Prevent further processing and should be handled immediately

### Message Handling

- `warnings[].message` and `errors[].message` are intended for developers and support, not for end users
- Clients should map SMP error or warning codes to their own localized messages
- When error code is `crsError`, the supplier message is returned "as is" with no SMP processing

## Timeouts

### Request-level Timeouts
- Recommended: At least 60 seconds
- Prevents indefinite waiting during network issues
- Shorter timeouts risk interrupting operations, especially transactional ones

### Operation-level Timeouts
- Recommended: At least 350 seconds for long-running operations
- Allows for maximum SMP wait time plus network lag margin
- Should not be necessary if request-level timeout is set

## Deployments

SMP API is available through several deployments:

- **Production:** Stable and fully supported environment
- **Pre-Release:** Code base may change without notice. Used as staging for upcoming features and bug fixes
- **Development:** Features under ongoing development. Real mode is not available

**Warning:** Using real mode in Pre-Release will result in live reservations, same as production.

## Mode: Real or Fake

### Real Mode
- Interacts with production systems of all eligible supply systems
- Connected to production reservation systems
- Results in "live" bookings

### Fake Mode
- Interacts with test/certification systems of suppliers
- Safe environment for development and testing
- Never creates "live" bookings with real financial impact

### Important Notes
- Cannot switch between real and fake modes during a workflow
- Specific permission required for real mode access
- Contact GBT account manager for access details

## Troubleshooting IDs

### SMP-Request-Id
- Returned in every response header
- Automatically provided by SMP
- Should be provided in any support requests

### SMP-Duration
- Returned in every response header
- Indicates server-side processing time in milliseconds
- Large differences from total request time may indicate network issues

### EchoToken
- **Purpose:** Identifier for accessing all operations during one session
- **Usage:** Should remain the same across all requests in a workflow
- **Benefits:** Allows SMP teams to retrieve all related traces
- **Requirement:** Mandatory for certification

### AppRequestId
- Optional identifier sent by client
- Used when no response with SMP-Request-Id is received
- Should be unique for every request
- Helps SMP Support retrieve operations after network failures

## Company Identification

### Three Types of Company Identifiers

1. **SMP Test Companies**
   - Format: `SmpTestGuid[/DkNumber]`
   - Example: `CompanyId = 5281df97-5579-4ea5-a6ce-620f546b6d8b, DkNumber = 0000000000`

2. **CAPIDs with Optional DkNumber**
   - Format: `CapId[/DkNumber]`
   - Example: `CompanyId = TEST1A, DkNumber = 00ATPCONDC`

3. **NeoGuids**
   - Format: Company IDs from Neo
   - Example: `CompanyId = 415e0c8a-5f75-4ee7-b29b-4a82cf8e7c16`
   - Extended format: `CompanyId = TEST1S_415e0c8a-5f75-4ee7-b29b-4a82cf8e7c16, DkNumber = 000FULLNDC`

## GDS and Office ID

- Mandatory in all endpoints (except `/utilities`)
- Ensures returned fares are bookable by client application
- Mismatch results in HTTP 400 error:

```json
{
  "fault": {
    "faultstring": "OfficeId provided (LONAP21SD) doesn't correspond to the one configured"
  }
}
```

## Credit Card Handling

### Booking with Credit Card

When using `creditCard` as `formOfPayment`:

1. Call `PUT /v1/creditCards/tokenize` with:
   - Credit card information in `creditCard` field
   - `priceId` of first leg in `productId` field (for booking)
   - `reservationId` in `productId` field (for payment)

2. Use returned `creditCardTokenId` in `paymentSessionId` field for:
   - `/v1/reservation/book` endpoints
   - `/v1/reservations/pay` endpoints

### Important Notes
- SMP does not store credit card data
- Data kept in memory only during booking workflow
- `creditCards/tokenize` endpoint accessible on separate domain
- `paymentSessionId` has limited lifetime and scope

### 3DS Authentication

- Client application responsible for generating 3DS authentication data
- Pass data in `threeDSecureAuthentication` field of `creditCard` in `creditCards/tokenize`
- SMP forwards token directly to supplier without validation

## Supported CRSes

### Sabre
- **Real mode:** Production Sabre environment
- **Fake mode:** Certification Sabre environment

### Amadeus
- **Real mode:** Production Amadeus environment
- **Fake mode:** Test Amadeus environment

### Travelfusion
- **Real mode:** Production Travelfusion environment
- **Fake mode:** Production environment with fake reservations

### Dummy
- Internal to SMP, not connected to actual reservation system
- Purpose: Testing SMP system and booking tools
- Safe and predictable behaviors
- No difference between real and fake modes
- Dynamically generated data that may be inaccurate

## Dummy CRS Test Scenarios

### Itinerary Search Test Cases

| Departure | Arrival | Behavior |
|-----------|---------|----------|
| ZZZ | AAB | Returns 1500 itineraries (large response test) |
| ZZZ | AAC | Triggers long delay (long-running operation test) |
| ZZZ | AAD | Causes response timeout |
| ZZZ | AAE | CRS failure response |
| ZZZ | AAF | Returns no itineraries |
| LON | SFO | Quality data matching real CRS response |
| PAR | NCE | Quality data with half-return prices |

### Operation Success Conditions

- **Offer pricing:** Works only for NDC prices on LON-SFO and PAR-NCE routes
- **Booking:** Works only for NDC prices on LON-SFO and PAR-NCE routes
- **Payment:** Works only for NDC bookings on LON-SFO and PAR-NCE routes
- **Retrieval:** Works only for NDC bookings on LON-SFO and PAR-NCE routes
- **Cancellation:** Works only for NDC bookings on LON-SFO and PAR-NCE routes

### PNR Order Cancellation

| PNR | Result |
|-----|--------|
| SUCCESS | Cancellation works |
| CANCEL | Returns 'alreadyCancelled' warning |
| ERROR | Cancellation fails |

### Operation Delays

| Operation | Departure | Arrival | Delay Type |
|-----------|-----------|---------|------------|
| order create | LHR | BER | Long |
| order cancel | ATH | BER | Long |
| add orders | CDG | BER | Long |
| cancel orders | BRU | BER | Long |
| offer price | MUC | BER | Long |
| order pay | MAD | BER | Long |
| order retrieve | VIE | BER | Long |
| order create | LHR | DXB | CRS response timeout |
| order cancel | ATH | DXB | CRS response timeout |
| add orders | CDG | DXB | CRS response timeout |
| cancel orders | BRU | DXB | CRS response timeout |
| offer price | MUC | DXB | CRS response timeout |
| order pay | MAD | DXB | CRS response timeout |
| order retrieve | VIE | DXB | CRS response timeout |

## Testing

### General Testing
- Use Dummy CRS for testing purposes
- Request data included in response with optional fields and default values

### Performance Tests
- Allowed with appropriate governance
- Requires pre-requisites and advance information
- Contact SMP Product for assistance

## Built-in Company IDs

SMP supports several built-in `companyId` values with various CRS and search options. All `companyId` values are available on all SMP environments.

### SMP Test Companies

| CompanyId | GDS | GDS OfficeId | Direct Links | AffiliateId | Notes |
|-----------|-----|--------------|--------------|-------------|-------|
| 5281df97-5579-4ea5-a6ce-620f546b6d8b | - | - | Dummy | gbt | No connection to any supplier |
| 96ee755a-1ec1-46a7-b654-bedecd379aed | - | - | Dummy | gbt | Accepting at most 3 CorporateIds |
| d95ae8dd-c0b6-4970-9613-fe2a3a33cdf3 | - | - | Dummy | gbt | With Some Multiticket |
| 260a5334-93fe-43a0-9674-047818ca2243 | - | - | Dummy | gbt | With Max Multiticket |

### Amadeus Configurations

| CompanyId | GDS OfficeId | Notes |
|-----------|--------------|-------|
| 6c27846f-48f8-4588-9b09-c5bb93437138 | LONAP21SM | NDC |
| bb9a616d-ec08-4b9c-809a-304be967ad57 | LONAP21SM | NDC, with multiple brands |
| cdd8c9fe-6650-4d00-845c-8cc69fdb65bf | LONAP21SM | ATPCO, with multiple brands |
| c978263a-aba9-4613-970d-8c27d5399167 | LONAP21SM | With too many corporate ids |
| 77763ba4-a848-4b8c-bd04-5eb19d079774 | LONAP21SM | ATPCO & NDC, with multiticket |

### Sabre Configurations

| CompanyId | GDS OfficeId | Direct Links | Notes |
|-----------|--------------|--------------|-------|
| b544844d-26b2-48d0-aa35-dec7961fafe1 | 06VI | - | NDC |
| 890a859f-5e8f-4474-86cd-06969913b330 | 06VI | - | NDC, with multiple brands |
| 0e666f0d-9a42-417a-abbe-18f6eb5ade83 | 06VI | - | ATPCO, with multiple brands |
| 4f691e38-aa4f-4cf9-95da-4aa5698b2b01 | C5YJ | - | NDC |
| 9711e3dd-d57b-48b9-b396-ef326771dad0 | 06VI | - | ATPCO & NDC, with multiticket |
| f79aefbf-108f-4e01-bf75-92ef592f7663 | 06VI | - | With too many corporate ids |
| 3dc2dcf6-4e81-4dff-8aa8-d00b031caa00 | 06VI | Travelfusion | ATPCO |

### Neo GUID Configurations (GBT)

| CompanyId | GDS | Notes |
|-----------|-----|-------|
| 933162a0-046d-4e14-ba25-378e0a9e90db | Amadeus | NDC only |
| 1eb24115-3550-474b-522a-4eb8de7868c7 | Amadeus | NDC only |
| f380121c-029e-45b9-1fea-79ffca6eccb1 | Sabre | ATPCO and NDC |
| 415e0c8a-5f75-4ee7-b29b-4a82cf8e7c16 | Sabre | NDC only |
| 497e1de0-791d-4992-5f4c-9fcee811f178 | Sabre | NDC only |
| 01c94688-754d-4363-c070-111de7e735a1 | Amadeus | NDC only |
| e9af1139-b9c5-4531-4396-dcbe36653d1c | Amadeus | NDC only |
| 3a1dac44-b6be-45dc-2fc3-f3d24e2e49d4 | Sabre | ATPCO and NDC |
| 852a7afe-631e-4eee-5bcb-2d311b9700d2 | Sabre | NDC only |
| dc375fd8-28c4-4145-fc44-d76cd2b947e4 | Amadeus | NDC only |
| f41081d9-90f3-48f5-772d-1034c3215898 | Amadeus | No internal DkNumber |
| 2dfeae92-f2ce-4d9f-91be-7eb11bd87d0a | Sabre | ATPCO and NDC |
| 2caae77a-5fb4-46af-c8a8-5246e9e470ec | Sabre | NDC only |

### Neo GUID Configurations (NotGBT)

| CompanyId | GDS | GDS OfficeId | AffiliateId | Notes |
|-----------|-----|--------------|-------------|-------|
| 2bc0ca9e-4a12-4469-9ff4-0a0f9d589b2e | - | Dummy | notgbt | NDC only |
| 8dc36cdc-e576-4f72-8f9b-be8876f39cde | - | Dummy | notgbt | NDC and ATPCO |
| c87d618f-7e8c-4c20-a85c-fb71916718ca | Amadeus | LONAP21SM | notgbt | NDC only |
| cfc17b29-50c0-4a1e-9e55-ffbccabbf540 | Amadeus | LONAP21SM | notgbt | NDC and ATPCO |
| 641ed60b-a2a7-489f-8c68-930c1bc34168 | Sabre | 06VI | notgbt | NDC only |
| e458b077-836b-4e8d-8e8a-00cede03aaf2 | Sabre | 06VI | notgbt | NDC and ATPCO |
