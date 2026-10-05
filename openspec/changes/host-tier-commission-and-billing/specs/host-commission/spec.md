## Purpose

Defines the dynamic tier-based host commission and platform fee calculations across the Fairway Draws host dashboard, analytics, payout requests, and competition creation wizard.

## ADDED Requirements

### Requirement: Dynamic Host Commission Rate
The system SHALL determine the host's platform commission fee rate based on their active subscription plan. Hosts subscribed to Premium or Pro plans SHALL be assigned a 10.0% platform fee rate (90.0% net earnings). Hosts on the Free plan or without an active paid subscription SHALL be assigned a 15.0% platform fee rate (85.0% net earnings).

#### Scenario: Premium host commission evaluation
- **WHEN** a host with an active Premium subscription views dashboard revenue, sales analytics, or requests a payout
- **THEN** the platform applies a 10.0% platform commission fee deduction and grants 90.0% net earnings

#### Scenario: Pro host commission evaluation
- **WHEN** a host with an active Pro subscription views dashboard revenue, sales analytics, or requests a payout
- **THEN** the platform applies a 10.0% platform commission fee deduction and grants 90.0% net earnings

#### Scenario: Free host commission evaluation
- **WHEN** a host with an active Free subscription views dashboard revenue, sales analytics, or requests a payout
- **THEN** the platform applies a 15.0% platform commission fee deduction and grants 85.0% net earnings

### Requirement: Host Dashboard Net Revenue KPI
The host dashboard overview SHALL display the total net revenue calculated using the host's tier-specific commission rate, alongside a dynamic badge indicating the exact platform fee percentage applied.

#### Scenario: Dashboard KPI on Premium or Pro tier
- **WHEN** a Premium or Pro host loads the Host Dashboard overview
- **THEN** the Net Revenue card calculates net earnings as 90% of gross ticket sales and the badge displays "10% Platform Fee"

#### Scenario: Dashboard KPI on Free tier
- **WHEN** a Free host loads the Host Dashboard overview
- **THEN** the Net Revenue card calculates net earnings as 85% of gross ticket sales and the badge displays "15% Platform Fee"

### Requirement: Competition Sales Page Net Metrics
The Competition Sales analytics page SHALL calculate and present net earnings using the host's dynamic tier rate, updating both summary metric cards and the competition breakdown table.

#### Scenario: Sales metrics card presentation for Premium host
- **WHEN** a Premium host navigates to the Competition Sales page
- **THEN** the Net Earnings card displays "Net Earnings (90%)", the subtitle reads "After 10% platform fee", and amounts match a 90% net payout calculation

#### Scenario: Sales breakdown table header for Premium host
- **WHEN** a Premium host views the competition breakdown table
- **THEN** the table column header displays "Net Earnings (90%)" and individual competition rows display 90% net revenue

### Requirement: Competition Wizard Fee Preview Accuracy
The competition creation wizard review step (Step 6) SHALL calculate and display the estimated platform fee based on the host's actual subscription tier rather than a static default.

#### Scenario: Creating a competition on Premium or Pro tier
- **WHEN** a Premium or Pro host reaches Step 6 of the competition creation wizard
- **THEN** the review card displays "Est. Platform Fee (10%)" and deducts 10% from the projected gross ticket revenue

#### Scenario: Creating a competition on Free tier
- **WHEN** a Free host reaches Step 6 of the competition creation wizard
- **THEN** the review card displays "Est. Platform Fee (15%)" and deducts 15% from the projected gross ticket revenue
