## 1. Database Schema & Migration

- [x] 1.1 Add `Notification` model to `backend/prisma/schema.prisma` and `frontend/prisma/schema.prisma` with fields: `id`, `userId`, `type`, `title`, `message`, `link`, `metadata`, `isRead`, `readAt`, and `createdAt` with indexes on `[userId, isRead]` and `[userId, createdAt]`.
- [x] 1.2 Create and deploy Prisma migration `add_notifications_table` to PostgreSQL via `npx prisma migrate deploy` and verify table exists in `app` schema.
- [x] 1.3 Run `npx prisma generate` in backend and frontend to update Prisma clients.

## 2. Backend Notifications Engine

- [x] 2.1 Create DTOs (`create-notification.dto.ts`, `query-notifications.dto.ts`) in `backend/src/notifications/dto/`.
- [x] 2.2 Implement `NotificationsService` in `backend/src/notifications/notifications.service.ts` with methods for creating notifications, querying paginated list by user with type/read filters, getting unread count, marking single notification read, and marking all read.
- [x] 2.3 Implement `NotificationsController` in `backend/src/notifications/notifications.controller.ts` exposing endpoints: `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, `PATCH /api/v1/notifications/:id/read`, and `PATCH /api/v1/notifications/read-all`.
- [x] 2.4 Register `NotificationsModule` in `backend/src/app.module.ts` and verify backend builds with `npm run build`.

## 3. Platform Event Dispatch Wiring

- [x] 3.1 Wire non-blocking notification dispatch into `AuthService.register` and `registerHost` (welcome notification to user, signup alert to admins).
- [x] 3.2 Wire non-blocking notification dispatch into `RafflesService.create` (submission alert to host, review alert to admins).
- [x] 3.3 Wire non-blocking notification dispatch into `TicketsService.checkout` and `basketCheckout` (ticket sale & revenue notification to host, order confirmation to buyer, order alert to admins).
- [x] 3.4 Wire non-blocking notification dispatch into instant win detection in `TicketsService` (celebration alert to winning user, instant win alert to host, instant win report to admins).
- [x] 3.5 Wire non-blocking notification dispatch into `RafflesService.drawWinner` (congratulations to winner, draw completion alert to host and admins).

## 4. Frontend Service & React Query Hooks

- [x] 4.1 Create `frontend/services/notification.service.ts` with API methods for listing notifications, fetching unread count, and marking notifications as read.
- [x] 4.2 Create `frontend/hooks/useNotificationHooks.ts` providing `useNotificationsQuery`, `useUnreadNotificationCountQuery`, `useMarkNotificationReadMutation`, and `useMarkAllNotificationsReadMutation`.

## 5. Dashboard UI Integration & Views

- [x] 5.1 Update `frontend/components/dashboard/DashboardTopbar.tsx` to fetch dynamic unread count and render numeric badge on bell icon.
- [x] 5.2 Update `frontend/components/dashboard/NotificationsDropdown.tsx` to render live notifications from query, support filter tabs (All, Unread, Wins, Purchases, Draws), mark-as-read on item click with route navigation, and functional "Mark all as read" button.
- [x] 5.3 Implement live notification feed in `frontend/app/dashboard/host/notifications/page.tsx` with filter tabs and pagination.
- [x] 5.4 Create `frontend/app/dashboard/user/notifications/page.tsx` providing user portal notification center view.

## 6. Verification & End-to-End Build

- [x] 6.1 Run `npm run build` in `backend/` and confirm 0 TypeScript or NestJS compilation errors.
- [x] 6.2 Run `npm run build` in `frontend/` and confirm 0 Next.js compilation or lint errors.
- [x] 6.3 Verify fail-safe error isolation ensuring core checkout and draw flows function even if notification creation encounters issues.
