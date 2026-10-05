## MODIFIED Requirements

### Requirement: Basket State Management
The system SHALL provide client-side basket management persisting across browser sessions that enables users to add competition entries, adjust ticket quantities within remaining inventory and competition-specific minimum and maximum ticket limits, remove items, and calculate the overall order total in GBP.

#### Scenario: Adding item to basket
- **WHEN** user selects a ticket quantity on a competition page and clicks "Add to Basket"
- **THEN** system validates that quantity meets the competition minimum and does not exceed personal maximum limits, adds or increments the item in the basket state, and persists it to browser local storage

#### Scenario: Updating quantity within stock limits
- **WHEN** user increases or decreases the ticket quantity of a basket item on the basket page
- **THEN** system validates that quantity meets the competition's minimum ticket count, does not exceed remaining tickets, and does not exceed the competition's maximum tickets per person, updating the item subtotal and grand total

#### Scenario: Removing item from basket
- **WHEN** user clicks the remove button on a basket item
- **THEN** system removes the item from the basket and updates the total item count and order total

### Requirement: Multi-Competition Ticket Checkout API
The backend system SHALL expose an endpoint to atomically process multi-competition ticket orders, allocate ticket numbers, calculate totals, check instant wins, credit host balances, and generate a transaction record while enforcing minimum and maximum ticket limits per entrant.

#### Scenario: Successful multi-competition purchase
- **WHEN** an authenticated user posts a valid basket containing multiple competitions and quantities to `/api/v1/tickets/checkout` where each item satisfies minimum ticket requirements and cumulative maximum per-person limits
- **THEN** system executes an atomic transaction allocating random tickets for each competition, credits host balances, creates a single transaction record, and returns allocated tickets and instant wins

#### Scenario: Rejecting purchase when requested tickets exceed remaining inventory
- **WHEN** any competition in the checkout payload has fewer available tickets than requested
- **THEN** system aborts the transaction without allocating any tickets and returns a 400 Bad Request error indicating insufficient tickets

#### Scenario: Rejecting purchase when item violates minimum ticket requirement
- **WHEN** any competition in the checkout payload has a requested quantity lower than the competition's configured minimum tickets
- **THEN** system aborts the transaction without allocating tickets and returns a 400 Bad Request error specifying the minimum ticket requirement for that competition

#### Scenario: Rejecting purchase when item exceeds maximum tickets per person
- **WHEN** any competition in the checkout payload has a requested quantity that, combined with the user's previously purchased tickets for that competition, exceeds the competition's maximum tickets per person
- **THEN** system aborts the transaction without allocating tickets and returns a 400 Bad Request error specifying the maximum allowed tickets and current user ticket count
