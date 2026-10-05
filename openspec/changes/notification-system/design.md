## Context

See `proposal.md` for background and motivation. Currently, the platform has a complete PostgreSQL schema under `app`, a NestJS backend API, and a Next.js App Router frontend using React Query. `DashboardTopbar.tsx` has a bell button with a hardcoded red indicator, `NotificationsDropdown.tsx` uses dummy notification arrays, and `/dashboard/host/notifications` is a static placeholder.

## Goals / Non-Goals

**Goals:**
- Provide a robust, queryable in-app notification data layer in PostgreSQL (`app.notifications`).
- Expose REST endpoints under `/api/v1/notifications` for fetching user notifications, unread counts, and marking notifications as read (single and bulk).
- Provide a central `NotificationsService` with dedicated dispatch helpers (`notifyUser`, `notifyHost`, `notifyAdmins`) that are safe, non-blocking, and asynchronous.
- Wire triggers into existing services (`AuthService`, `TicketsService`, `RafflesService`) without interrupting or altering primary business logic.
- Replace dummy data in `DashboardTopbar` and `NotificationsDropdown` with real-time React Query state.
- Implement full-page notification views for both hosts (`/dashboard/host/notifications`) and regular users (`/dashboard/user/notifications`).

**Non-Goals:**
- External mobile push notifications (FCM, APNS) or native browser Web Push in this phase.
- Heavy WebSocket / Socket.io server infrastructure. React Query polling (30s interval + window focus) provides fresh updates without socket connection overhead.
- SMS alerts.

## Decisions

### 1. Database Model: PostgreSQL `app.notifications`
- **Choice**: Add `Notification` model to Prisma schema within `app` schema with fields: `id`, `userId`, `type` (e.g. `WIN`, `PURCHASE`, `RAFFLE`, `SYSTEM`), `title`, `message`, `link`, `metadata` (JSON), `isRead`, `readAt`, and `createdAt`.
- **Rationale**: Direct relational foreign key to `User` (with cascade delete), indexed on `[userId, isRead]` and `[userId, createdAt]` ensures millisecond query performance.
- **Alternatives Considered**: Storing in Redis or third-party notification SaaS. Rejected to avoid external operational dependencies and ensure historical durability.

### 2. Dispatch Pattern: Non-blocking Service Invocation
- **Choice**: Call `this.notificationsService.create(...)` in post-transaction steps wrapped in isolated try/catch blocks.
- **Rationale**: Prevents notification failures (e.g., transient DB hiccups) from aborting ticket purchases, payments, or draw winner selections.
- **Alternatives Considered**: Full message queue (BullMQ/RabbitMQ). Deemed unnecessary complexity at this stage; can be introduced behind the same service interface later if message volume demands it.

### 3. Client Synchronization: React Query Polling
- **Choice**: Fetch unread counts and recent notifications via `@tanstack/react-query` with a 30-second refetch interval and automatic refetch on window focus.
- **Rationale**: Highly reliable, zero connection drops, automatic caching, and seamless optimistic updates for "mark as read".
- **Alternatives Considered**: WebSockets or Server-Sent Events (SSE). Rejected for now due to additional stateful server complexity and connection management overhead.

### 4. Consolidated Basket Checkout Notifications
- **Choice**: When a basket checkout contains multiple tickets across one or more competitions, emit one consolidated purchase notification to the buyer, and one consolidated notification per distinct host whose raffle was purchased.
- **Rationale**: Prevents notification flooding (e.g. if a user buys 50 tickets, the host receives 1 clear summary alert instead of 50 separate notifications). Instant wins remain individually highlighted.

## Risks / Trade-offs

- **[Risk] High volume of notifications over time** &rarr; *Mitigation*: Default query limits (page size 15–20), indexed queries on `userId` + `createdAt`, and future automated pruning for notifications older than 90 days.
- **[Risk] Transaction rollback vs notification dispatch** &rarr; *Mitigation*: Trigger notification dispatches only after database transactions successfully commit.
- **[Risk] UI layout shifts or lag on topbar** &rarr; *Mitigation*: Keep topbar unread badge query lightweight (`GET /api/v1/notifications/unread-count`), prefetching the full dropdown only when hovered or opened.

## Migration Plan

1. Create and apply Prisma migration `add_notifications_table` using `npx prisma migrate deploy`.
2. Generate updated Prisma client in both `backend` and `frontend`.
3. Deploy backend `NotificationsModule` with zero breaking changes to existing endpoints.
4. Update frontend dashboard topbar, dropdown, and notification routes.
