# basket-checkout Specification

## Purpose

Provides cart state management, basket page, multi-draw checkout with contact/shipping address collection and profile pre-filling, and backend atomic multi-raffle ticket order processing.

## Requirements

### Requirement: Basket State Management
The system SHALL provide client-side basket management persisting across browser sessions that enables users to add competition entries, adjust ticket quantities within remaining limits, remove items, and calculate the overall order total in GBP.

#### Scenario: Adding item to basket
- **WHEN** user selects a ticket quantity on a competition page and clicks "Add to Basket"
- **THEN** system adds or increments the item in the basket state and persists it to browser local storage

#### Scenario: Updating quantity within stock limits
- **WHEN** user increases or decreases the ticket quantity of a basket item on the basket page
- **THEN** system validates that quantity is greater than zero and does not exceed remaining tickets, updating the item subtotal and grand total

#### Scenario: Removing item from basket
- **WHEN** user clicks the remove button on a basket item
- **THEN** system removes the item from the basket and updates the total item count and order total

### Requirement: Navigation Basket Indicator
The system SHALL display a basket indicator with a real-time badge count representing current items in the top navigation header on both desktop and mobile viewports.

#### Scenario: Badge reflects total items in basket
- **WHEN** items exist in the basket
- **THEN** navigation header displays a badge with the current total number of distinct competition entries

#### Scenario: Navigating to basket page from header
- **WHEN** user clicks the basket icon in the navigation header
- **THEN** system navigates the user to the dedicated `/basket` route

### Requirement: Dedicated Basket Page
The system SHALL provide a dedicated `/basket` page displaying all selected competition entries, their thumbnail images, ticket counts, price per ticket, subtotal calculations, and a checkout initiation action.

#### Scenario: Viewing non-empty basket
- **WHEN** user visits `/basket` with one or more items in their basket
- **THEN** system renders each competition with ticket quantity controls, subtotal per draw, grand total, and a "Proceed to Checkout" button

#### Scenario: Viewing empty basket
- **WHEN** user visits `/basket` with no items in their basket
- **THEN** system displays an empty basket message and a call-to-action button to explore live competitions

#### Scenario: Proceeding to checkout
- **WHEN** user clicks "Proceed to Checkout" on a non-empty basket
- **THEN** system navigates the user to the `/checkout` page

### Requirement: Checkout Contact and Shipping Address Collection
The system SHALL collect and validate contact and shipping address details from the entrant on the checkout page prior to payment processing.

#### Scenario: Validating mandatory shipping details
- **WHEN** user attempts to proceed to payment with missing required fields (First Name, Last Name, Email, Phone, Address Line 1, City, Postcode)
- **THEN** system prevents submission and displays field-level validation errors

#### Scenario: Submitting complete shipping information
- **WHEN** user provides valid contact and UK shipping details and confirms order
- **THEN** system submits the order items and shipping details to the checkout payment flow

### Requirement: Authenticated User Profile Pre-Filling
The system SHALL pre-fill the checkout contact and shipping form with existing profile data when the user is authenticated, and provide an option to update the profile with modified details.

#### Scenario: Pre-filling logged-in user details
- **WHEN** an authenticated user opens the `/checkout` page
- **THEN** system automatically populates First Name, Last Name, Email, Phone, and Address fields from their user profile data

#### Scenario: Saving modified shipping details back to user profile
- **WHEN** user edits pre-filled contact or address fields with the "Save to profile" option selected during checkout
- **THEN** system updates the user's profile with the new phone and address details upon checkout initiation

### Requirement: Multi-Competition Ticket Checkout API
The backend system SHALL expose an endpoint to atomically process multi-competition ticket orders, allocate ticket numbers, calculate totals, check instant wins, credit host balances, and generate a transaction record.

#### Scenario: Successful multi-competition purchase
- **WHEN** an authenticated user posts a valid basket containing multiple competitions and quantities to `/api/v1/tickets/checkout`
- **THEN** system executes an atomic transaction allocating random tickets for each competition, credits host balances, creates a single transaction record, and returns allocated tickets and instant wins

#### Scenario: Rejecting purchase when requested tickets exceed remaining inventory
- **WHEN** any competition in the checkout payload has fewer available tickets than requested
- **THEN** system aborts the transaction without allocating any tickets and returns a 400 Bad Request error indicating insufficient tickets

### Requirement: Payment Gateway Integration for Multi-Item Orders
The system SHALL support both test simulated checkout and gateway-hosted checkout using a distinct multi-item order identifier while preserving existing single-entry workflows.

#### Scenario: Test payment mode execution
- **WHEN** ticket checkout is submitted in test payment mode (`USE_TEST_PAYMENT=true`)
- **THEN** system immediately completes ticket allocation and returns success details without redirecting to a payment gateway

#### Scenario: Hosted payment gateway redirection and confirmation
- **WHEN** ticket checkout is submitted in gateway mode (`USE_TEST_PAYMENT=false`)
- **THEN** system generates a `BSK_` prefixed order reference, initiates a Cashflows checkout session, and returns the gateway redirect URL

### Requirement: Post-Purchase Confirmation and Instant Win Handling
The system SHALL display an order confirmation summary showing all allocated ticket numbers grouped by competition and trigger instant-win celebration modals for any winning tickets.

#### Scenario: Confirming purchase and displaying tickets
- **WHEN** a basket order is completed or returned successfully from the payment gateway
- **THEN** system renders the confirmation page with ticket numbers for each competition and clears the client basket

#### Scenario: Revealing instant win prize won during basket checkout
- **WHEN** any allocated ticket matches an unclaimed instant-win prize in the competition
- **THEN** system marks the prize as claimed for the user and triggers the instant win celebration modal with prize details
