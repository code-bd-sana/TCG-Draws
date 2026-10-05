## Why

Currently on Fairway Draws, hosts configuring a competition on `/dashboard/host/create` see an orphaned "Minimum Tickets Per Person (Optional)" field that is never persisted to the database or enforced. Furthermore, hosts have no option to set a "Maximum Tickets Per Person", allowing individual entrants or bots to buy unlimited tickets or monopolize draws. Introducing configurable minimum and maximum tickets per person gives hosts proper competition mechanics, ensures regulatory compliance and fairness for entrants, and prevents single-user ticket hoarding.

## What Changes

- **Host Creation & Editing Wizard**:
  - Add "Maximum Tickets Per Person (Optional)" input alongside the existing "Minimum Tickets Per Person (Optional)" input in Step 2 of competition creation (`CreateRaffleStep2.tsx`).
  - Wire both `minTickets` and `maxTickets` through `CreateRaffleWizard.tsx` state and API submission (`handlePublish`).
  - Add `minTickets` and `maxTickets` fields to `EditRaffleForm.tsx` so hosts can view and update ticket limits on draft/pending competitions.
  - Form validation: `minTickets >= 1`, `maxTickets >= minTickets`, and `maxTickets <= totalTickets`.
- **Database Schema & Models**:
  - Add `min_tickets` (integer, default 1, nullable) and `max_tickets` (integer, nullable) columns to the `raffles` table in Prisma schema and generate a migration.
- **Backend DTOs & Service Logic**:
  - Update `CreateRaffleDto` and `UpdateRaffleDto` with optional numeric `minTickets` and `maxTickets` fields.
  - Update `RafflesService` to persist and return `minTickets` and `maxTickets`.
- **Purchase & Checkout Enforcement**:
  - In `TicketsService` (`purchaseTickets`, `checkout`, `allocateBasketTicketsInDatabase`, and `createCashflowsBasketCheckout`), validate that order quantity meets or exceeds `raffle.minTickets`.
  - Validate cumulative tickets: calculate existing tickets owned by the user for the competition (`tx.ticket.count`), ensuring `userExistingTickets + newQuantity <= raffle.maxTickets`.
- **Entrant Experience & Basket Validation**:
  - In `/live-raffles/[slug]/page.tsx`, map dynamic `minTickets` and `maxTickets` instead of hardcoded values.
  - In `RaffleEntryCard.tsx`, bound quantity selector (`+`/`-` buttons and quick-picks) by `minTickets` and remaining allowed tickets per person (`maxTickets - userOwnedTickets`).
  - If a user reaches their maximum ticket limit, disable entry and display a clear limit reached notice.
  - In `BasketContext.tsx`, validate per-item `minTickets` and `maxTickets` on `addItem` and `updateQuantity`.

## Capabilities

### New Capabilities
- `raffle-purchase-limits`: Defines host configuration and enforcement of minimum tickets per order and maximum cumulative tickets per person on a competition.

### Modified Capabilities
- `basket-checkout`: Updates basket state manipulation, item updates, and checkout submission to respect competition-specific minimum and maximum ticket limits per entrant.

## Impact

- **Database**: Adds `min_tickets` and `max_tickets` columns to `raffles` table. Existing rows default to `min_tickets = 1` and `max_tickets = NULL` (unlimited), maintaining 100% backward compatibility.
- **Backend APIs**:
  - `POST /api/v1/raffles` & `PATCH /api/v1/raffles/host/:id` accept `minTickets` and `maxTickets`.
  - `POST /api/v1/tickets/purchase/:raffleId` & `POST /api/v1/tickets/checkout` reject requests violating minimum quantity or exceeding maximum tickets per person.
- **Frontend Components**:
  - `CreateRaffleStep2.tsx`, `CreateRaffleWizard.tsx`, `EditRaffleForm.tsx`
  - `RaffleEntryCard.tsx`, `TicketQuantitySelector.tsx`
  - `BasketContext.tsx`, `/checkout/page.tsx`
