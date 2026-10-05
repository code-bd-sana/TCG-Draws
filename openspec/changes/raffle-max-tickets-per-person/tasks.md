## 1. Database Schema & Models

- [x] 1.1 Add `minTickets Int? @default(1) @map("min_tickets")` and `maxTickets Int? @map("max_tickets")` to the `Raffle` model in `backend/prisma/schema.prisma` and synchronize with `frontend/prisma/schema.prisma`.
- [x] 1.2 Create and apply Prisma migration for `min_tickets` and `max_tickets`, and run `prisma generate` in both backend and frontend to verify compiled client types.

## 2. Backend DTOs & Services

- [x] 2.1 Update `CreateRaffleDto` and `UpdateRaffleDto` in `backend/src/raffles/dto/` to include `@IsOptional() @IsInt() @Min(1)` validation for `minTickets` and `maxTickets`.
- [x] 2.2 Update `RafflesService.create` and `RafflesService.update` in `backend/src/raffles/raffles.service.ts` to persist, update, and return `minTickets` and `maxTickets`.
- [x] 2.3 Update `TicketsService.purchaseTickets`, `TicketsService.allocateTicketsInDatabase`, `TicketsService.checkout`, and `TicketsService.allocateBasketTicketsInDatabase` in `backend/src/tickets/tickets.service.ts` to reject quantities below `raffle.minTickets` or exceeding cumulative `raffle.maxTickets` per user.

## 3. Frontend Host Dashboard

- [x] 3.1 Update `RaffleFormData` in `frontend/components/dashboard/host/create/CreateRaffleWizard.tsx` to track `maxTickets` and include both `minTickets` and `maxTickets` in the `createRaffle.mutateAsync` payload.
- [x] 3.2 Add the "Maximum Tickets Per Person (Optional)" input alongside "Minimum Tickets Per Person" in `frontend/components/dashboard/host/create/CreateRaffleStep2.tsx` with responsive layout and input validation.
- [x] 3.3 Update `frontend/components/dashboard/host/edit/EditRaffleForm.tsx` to display and allow editing of `minTickets` and `maxTickets` under the Ticket Allocation section.

## 4. Frontend Entrant Experience & Basket Validation

- [x] 4.1 Update `RaffleDetail` interface in `frontend/types/raffle-details.types.ts` and `Raffle` interface in `frontend/services/raffle.service.ts` to include `minTickets?: number` and `maxTickets?: number`.
- [x] 4.2 Update `frontend/app/live-raffles/[slug]/page.tsx` to dynamically pass `minTickets` and `maxTickets` from the API response to `RaffleDetail`.
- [x] 4.3 Update `frontend/components/website/raffle-details/RaffleEntryCard.tsx` so stepper controls, quick-pick buttons, and submit actions enforce `minTickets` and remaining allowed tickets, displaying a limit-reached badge when max is reached.
- [x] 4.4 Update `frontend/features/basket/BasketContext.tsx` to validate competition minimum and maximum ticket limits during `addItem` and `updateQuantity`.

## 5. Verification & Testing

- [x] 5.1 Verify host competition creation and editing with min/max ticket parameters via host dashboard.
- [x] 5.2 Verify entrant ticket selection boundaries, basket adjustments, and backend checkout rejection when cumulative ticket limits are exceeded.
