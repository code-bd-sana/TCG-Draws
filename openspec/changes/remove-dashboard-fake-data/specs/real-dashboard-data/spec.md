## Purpose

Guarantees that all analytics dashboards, charts, administrative views, host metrics, and public host profiles display real, database-backed data without static placeholders, fake arrays, or mock fallback records.

## ADDED Requirements

### Requirement: Admin Dashboard Live Analytics
The system SHALL provide and display real database-derived analytics for platform revenue, user and host growth, and top-performing hosts across selectable timeframes (7D, 1M, 6M, 1Y).

#### Scenario: Admin views platform revenue chart
- **WHEN** the admin loads `/dashboard/admin` and selects a timeframe filter
- **THEN** the system displays the revenue curve aggregated from completed ticket purchase transactions matching the selected timeframe, or an empty state when no transactions exist

#### Scenario: Admin views user and host growth chart
- **WHEN** the admin views the growth chart on `/dashboard/admin`
- **THEN** the system displays monthly user and host account creation counts calculated from the database records

#### Scenario: Admin views top performing hosts
- **WHEN** the admin inspects the "Top Hosts This Month" list
- **THEN** the system displays real host profiles sorted by gross sales revenue, showing their actual business names and sales figures, or an empty state when no host sales exist

### Requirement: Admin Competition Draws Live Entry Audit
The system SHALL provide genuine ticket entry lists and buyer details for any selected competition draw in the admin draws manager.

#### Scenario: Admin inspects ticket entry pool for a draw
- **WHEN** the admin opens the "Ticket Entry Pool" tab on `/dashboard/admin/draws` for an active or ended competition
- **THEN** the system displays the actual purchased ticket numbers, entrant names, emails, and purchase dates from the `Ticket` table, and displays "No Tickets Sold Yet" if tickets sold is zero

### Requirement: Authentic Empty States in Analytics Reports
The backend analytics and reporting endpoints SHALL return empty sets instead of hardcoded mock records when database collections have zero entries.

#### Scenario: Empty analytics reporting
- **WHEN** the admin requests analytics reports for a period with no qualifying sales or hosts
- **THEN** the backend returns empty arrays for popular competitions, host performances, and category distributions without injecting dummy products or fake percentages

### Requirement: Host Dashboard Dynamic Revenue and Payout Data
The system SHALL render dynamic host revenue trends from actual ticket sales and strictly live withdrawal history without mock data fallbacks.

#### Scenario: Host views earnings overview chart
- **WHEN** a host accesses `/dashboard/host`
- **THEN** the system renders a dynamic chart driven by real ticket sale timestamps and ticket prices belonging to the host's competitions

#### Scenario: Host views payouts and earnings
- **WHEN** a host navigates to `/dashboard/host/payouts`
- **THEN** the system displays the host's real wallet balance and actual withdrawal records from the database, showing an authentic empty table if no withdrawals have been initiated

### Requirement: User Dashboard Real Spend Curve
The system SHALL calculate and visualize the player's real lifetime ticket spending curve based on completed purchase transactions.

#### Scenario: Entrant views ticket spend overview
- **WHEN** an entrant visits `/dashboard/user`
- **THEN** the system renders a spend curve reflecting the user's completed purchases grouped by date or month, with zero-spend indicators if no transactions exist

### Requirement: Public Host Profile Real Information
The public host profile SHALL display the host operator's actual bio, location, and verified draw counts without hardcoded placeholder text.

#### Scenario: Public user visits host profile
- **WHEN** a user navigates to `/hosts/:slug`
- **THEN** the system displays the host's real business name, bio, and location in the "About" section, and does not show hardcoded fake store descriptions
