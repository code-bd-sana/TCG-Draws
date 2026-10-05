## Purpose

Enables hosts to configure minimum tickets per order and maximum cumulative tickets per person on competitions, and enforces these purchase restrictions across entrant selection, basket additions, and payment checkout.

## ADDED Requirements

### Requirement: Host Competition Ticket Limits Configuration
The system SHALL allow hosts to define an optional minimum tickets per order and an optional maximum cumulative tickets per person when creating or updating a competition.

#### Scenario: Host creates competition with min and max ticket limits
- **WHEN** a host specifies a minimum ticket count of 5 and a maximum ticket count of 25 during competition creation
- **THEN** system validates that minimum tickets is at least 1, maximum tickets is greater than or equal to minimum tickets, and maximum tickets does not exceed total tickets, persisting both values to the competition record

#### Scenario: Host creates competition without explicit limits
- **WHEN** a host creates a competition leaving minimum and maximum ticket limit inputs blank
- **THEN** system defaults minimum tickets to 1 and stores maximum tickets as null (unlimited)

#### Scenario: Host attempts invalid limit bounds
- **WHEN** a host specifies a maximum ticket limit lower than the minimum ticket limit or greater than total tickets
- **THEN** system rejects form submission with a clear validation error indicating invalid ticket bounds

### Requirement: Entrant Ticket Quantity Selection Boundaries
The system SHALL enforce competition minimum and maximum ticket boundaries in the entrant ticket quantity selector on competition detail pages.

#### Scenario: Decrement clamped to minimum tickets
- **WHEN** an entrant attempts to decrement ticket quantity below the competition's minimum ticket requirement
- **THEN** system prevents decrementing below the minimum ticket requirement and keeps the selector at or above the minimum value

#### Scenario: Increment clamped to maximum tickets per person
- **WHEN** an entrant attempts to increment ticket quantity beyond the competition's maximum tickets per person limit
- **THEN** system prevents incrementing above the maximum allowed tickets and displays an informational notice

#### Scenario: Quick pick buttons adhere to ticket limits
- **WHEN** an entrant clicks a quick pick button whose value is below the minimum or above the maximum allowed tickets
- **THEN** system clamps the selected quantity to the nearest legal bound

### Requirement: Cumulative Entrant Ticket Ownership Enforcement
The system SHALL enforce that the cumulative tickets owned by a user across all orders for a competition plus the requested quantity in a new purchase does not exceed the competition's maximum tickets per person.

#### Scenario: Entrant attempts purchase within allowed cumulative limit
- **WHEN** an authenticated user who already owns 10 tickets for a competition with a maximum of 25 tickets attempts to purchase 10 additional tickets
- **THEN** system allows the purchase because 10 + 10 = 20 which is less than or equal to 25

#### Scenario: Entrant attempts purchase exceeding allowed cumulative limit
- **WHEN** an authenticated user who already owns 20 tickets for a competition with a maximum of 25 tickets attempts to purchase 10 additional tickets
- **THEN** system rejects the purchase with a 400 Bad Request error indicating that only 5 additional tickets can be purchased before reaching the personal limit of 25

#### Scenario: Entrant who has reached maximum tickets is prevented from entering
- **WHEN** an authenticated user who has already reached the maximum allowed tickets views the competition page
- **THEN** system disables the entry CTA and displays a notification indicating the maximum personal ticket limit has been reached
