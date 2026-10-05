## Purpose

Provides a persistent in-app notification infrastructure that records platform events, delivers role-targeted alerts to users, hosts, and administrators, and offers interactive dashboard views with read-state tracking.

## ADDED Requirements

### Requirement: In-App Notification Storage and Querying
The system SHALL persist in-app notifications for users in a dedicated database store and allow authenticated users to query their notifications with pagination, type filtering, and unread status.

#### Scenario: Querying notifications for current authenticated user
- **WHEN** an authenticated user requests their notifications via the notifications API
- **THEN** the system returns a paginated list of notifications belonging only to the requesting user ordered by newest first

#### Scenario: Filtering notifications by type or read status
- **WHEN** a user requests notifications with a filter parameter such as unread only or by event category (WIN, PURCHASE, RAFFLE, SYSTEM)
- **THEN** the system returns only notifications matching the specified criteria

#### Scenario: Retrieving total unread notification count
- **WHEN** a user or client application requests the current unread count
- **THEN** the system returns an exact integer count of unread notifications for that user

### Requirement: Marking Notifications as Read
The system SHALL allow users to update the read status of individual notifications or mark all their notifications as read simultaneously.

#### Scenario: Marking a single notification as read
- **WHEN** an authenticated user sends a request to mark a specific notification as read by its identifier
- **THEN** the system sets `isRead` to true, records `readAt` timestamp, and returns the updated notification record

#### Scenario: Marking all user notifications as read
- **WHEN** an authenticated user triggers the "Mark all as read" action
- **THEN** the system updates all currently unread notifications belonging to that user to read state and resets the unread count to zero

### Requirement: User Registration Notification Dispatch
The system SHALL dispatch welcome notifications to newly registered users and alert administrators when a new user or host registers on the platform.

#### Scenario: Welcome notification upon user registration
- **WHEN** a new user successfully completes registration
- **THEN** the system creates an in-app welcome notification for the user directing them to live competitions

#### Scenario: Administrator notification upon new user registration
- **WHEN** a new user or host registers on the platform
- **THEN** the system creates an in-app alert for administrator accounts containing the new user's name and registration details

### Requirement: Competition Lifecycle Notification Dispatch
The system SHALL notify competition hosts and administrators when new competitions are drafted, submitted for review, or launched.

#### Scenario: Host notification upon competition creation
- **WHEN** a host creates a new raffle competition
- **THEN** the system creates an in-app notification for the host confirming submission for approval

#### Scenario: Administrator notification upon competition submission
- **WHEN** a host submits a new competition
- **THEN** the system creates an in-app alert for administrators linking to the admin review and approval interface

### Requirement: Ticket Purchase Notification Dispatch
The system SHALL dispatch notifications to the competition host, purchasing entrant, and administrators when tickets are bought.

#### Scenario: Host notification upon ticket sale for their competition
- **WHEN** tickets are purchased for a competition
- **THEN** the system creates a notification for the host owning the competition detailing the number of tickets sold and revenue amount

#### Scenario: Buyer order confirmation notification upon purchase
- **WHEN** a user completes a ticket checkout (single draw or basket)
- **THEN** the system creates an order confirmation notification for the buyer linking to their ticket inventory

#### Scenario: Administrator order summary notification
- **WHEN** a ticket checkout completes successfully
- **THEN** the system generates an order event notification for administrators

### Requirement: Instant Win Notification Dispatch
The system SHALL dispatch immediate alerts to the winning entrant, competition host, and administrators when an instant win ticket is drawn.

#### Scenario: Winner notification upon instant win discovery
- **WHEN** a purchased ticket matches an unclaimed instant win prize number
- **THEN** the system creates a high-priority instant win celebration notification for the ticket owner directing them to claim their prize

#### Scenario: Host notification upon instant win on their competition
- **WHEN** an instant win prize is claimed on a host's competition
- **THEN** the system notifies the competition host with prize and ticket details

#### Scenario: Administrator notification upon instant win occurrence
- **WHEN** an instant win is claimed
- **THEN** the system alerts administrators with winner and prize metadata for audit logging

### Requirement: Main Draw Completion Notification Dispatch
The system SHALL dispatch notifications when a competition main draw completes and a winning ticket is selected.

#### Scenario: Winner notification upon main draw selection
- **WHEN** a winner is drawn for a competition
- **THEN** the system creates a winner notification for the winning user linking to their winner claiming interface

#### Scenario: Host and administrator notification upon main draw completion
- **WHEN** a main draw concludes
- **THEN** the system notifies the host and administrators with the winning ticket number, winner name, and raffle summary

### Requirement: Dashboard Topbar Indicator and Dropdown
The system SHALL provide a dynamic unread count badge in the dashboard topbar and an interactive dropdown menu with live notifications, category filtering, and direct navigation links.

#### Scenario: Unread count display in navigation topbar
- **WHEN** an authenticated user has unread notifications
- **THEN** the dashboard topbar bell icon displays a numeric badge showing the number of unread notifications

#### Scenario: Opening notifications dropdown and viewing items
- **WHEN** user clicks the notification bell in the topbar
- **THEN** the dropdown renders the latest notifications with category badges, relative timestamps, and visual unread indicators

#### Scenario: Clicking notification to mark read and navigate
- **WHEN** user clicks on an unread notification item in the dropdown
- **THEN** the system marks the notification as read, decrements the unread count, and navigates the user to the destination URL

### Requirement: Dedicated Notification Center Pages
The system SHALL provide dedicated full-page notification views in both host and user dashboard portals with pagination, filtering, and bulk read actions.

#### Scenario: Viewing host notification center page
- **WHEN** a host navigates to `/dashboard/host/notifications`
- **THEN** the system renders a paginated history of all host-related notifications with filtering by category

#### Scenario: Viewing user notification center page
- **WHEN** a user navigates to `/dashboard/user/notifications`
- **THEN** the system renders a paginated history of all user-related notifications with filtering by category

### Requirement: Non-Blocking Fault Tolerance
The system SHALL execute notification dispatches asynchronously and isolate notification failures from core business transactions.

#### Scenario: Core business operations succeed even if notification dispatch fails
- **WHEN** an error occurs during notification generation, database insertion, or dispatch
- **THEN** the system catches and logs the error without aborting or rolling back the primary transaction (ticket purchase, user registration, or draw execution)
