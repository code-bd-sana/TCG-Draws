## Why

Currently, Fairway Draws lacks an in-app notification infrastructure. Users, competition hosts, and administrators have no unified channel to receive alerts when critical actions occur—such as ticket purchases, instant wins, raffle draw conclusions, new competition submissions, or user registrations. The dashboard topbar bell icon displays hardcoded dummy entries, and the host notification view is an empty placeholder. Implementing an event-driven in-app notification system provides immediate transparency and engagement across all roles without risking existing transactions.

## What Changes

- **Database Model**: Add `Notification` model to Prisma schema (`app.notifications` table) with recipient reference, notification type (`WIN`, `INSTANT_WIN`, `PURCHASE`, `RAFFLE`, `SYSTEM`), title, rich message, actionable URL link, structured JSON metadata, read state tracking, and indexed queries.
- **Backend Notification Engine**: Build `NotificationsModule` providing `NotificationsService` and `NotificationsController` under `/api/v1/notifications` with endpoints to list paginated/filtered notifications, get unread counts, mark single notification as read, and mark all notifications as read.
- **Action Triggers & Dispatching**: Wire non-blocking, fail-safe notification triggers into:
  - User Registration: Welcome notification to new user, registration alert to admins.
  - Raffle Creation: Submission confirmation to host, review alert to admins.
  - Ticket Checkout / Purchase: Ticket sale and revenue notification to competition host, purchase receipt to user, order notification to admins.
  - Instant Win Detection: Win notification to ticket holder, instant win alert to host, instant win report to admins.
  - Main Draw Winner: Congratulations alert to winner, completion notification to host and admins.
- **Frontend Dashboard Integration**:
  - Replace static red dot on `DashboardTopbar` with real-time unread notification count badge.
  - Connect `NotificationsDropdown` to live API using React Query, supporting tab filters (`All`, `Unread`, `Wins`, `Purchases`, `Draws`), mark as read on click with deep-link navigation, and "Mark all as read".
  - Implement full-page notification feed at `/dashboard/host/notifications` and `/dashboard/user/notifications` with pagination, mark-read actions, and date groupings.
- **Non-Blocking Fault Tolerance**: Wrap all notification dispatches in non-blocking try-catch blocks to guarantee that payment processing, ticket allocation, and raffle draws are never interrupted or rolled back by notification failures.

## Capabilities

### New Capabilities
- `notifications`: In-app notification generation, persistence, role-based targeting, unread status tracking, API endpoints, and dashboard notification center UI.

### Modified Capabilities
<!-- None -->

## Impact

- **Database**: New table `app.notifications` created via Prisma migration. No existing tables modified or dropped.
- **Backend**:
  - New module `backend/src/notifications/` (controller, service, DTOs).
  - Integration points in `AuthService`, `TicketsService`, and `RafflesService`.
- **Frontend**:
  - New service `frontend/services/notification.service.ts` and React Query hooks `frontend/hooks/useNotificationHooks.ts`.
  - Updated `DashboardTopbar.tsx` and `NotificationsDropdown.tsx`.
  - Updated `/dashboard/host/notifications/page.tsx` and new `/dashboard/user/notifications/page.tsx`.
