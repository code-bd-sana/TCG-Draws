## Context

Fairway Draws is built on Next.js 16 (React 19) in the frontend and NestJS 11 with Prisma ORM (PostgreSQL) in the backend. Currently:
- The Host competition wizard (`CreateRaffleStep2.tsx`) collects `minTickets` into React state, but omits it from the API mutation payload in `CreateRaffleWizard.tsx`.
- The database table `raffles` has neither `min_tickets` nor `max_tickets` columns.
- The ticket checkout service in NestJS checks only that `quantity >= 1` and remaining inventory is sufficient.
- The public competition view (`/live-raffles/[slug]/page.tsx` and `RaffleEntryCard.tsx`) uses hardcoded minimum (1) and maximum (50) values without synchronizing with database competition records or the user's prior purchases.

See `proposal.md` for motivation and background.

## Goals / Non-Goals

**Goals:**
- Add `min_tickets` and `max_tickets` to the database schema with zero downtime and full backward compatibility.
- Expose `minTickets` and `maxTickets` across DTOs, services, and public API responses.
- Provide clear input fields in both Host Create Step 2 and Host Edit forms with client-side validation.
- Enforce minimum ticket requirements and cumulative maximum tickets per person on both frontend (stepper, quick-picks, basket) and backend (`TicketsService` purchase & checkout endpoints).
- Prevent race conditions during ticket purchase transactions using database counts.

**Non-Goals:**
- Dynamic tier-based pricing (bulk volume discounts) — ticket pricing remains fixed per competition.
- Role-based purchase exemptions (e.g. VIP clients with higher limits) — limits apply equally to all entrants.
- Global per-platform purchase limits across unrelated competitions.

## Decisions

### Decision 1: Database Schema Representation
- **Decision**: Add `minTickets Int? @default(1) @map("min_tickets")` and `maxTickets Int? @map("max_tickets")` to the `Raffle` model in `backend/prisma/schema.prisma` and synchronize with `frontend/prisma/schema.prisma`.
- **Rationale**: Storing `minTickets` with default 1 ensures that every existing and new competition has a safe fallback. Leaving `maxTickets` as nullable represents unlimited entries per person when unset.
- **Alternatives Considered**: 
  - Making `maxTickets` default to `totalTickets`: Storing `NULL` for unlimited is cleaner and eliminates synchronization overhead when `totalTickets` is edited.

### Decision 2: Cumulative Enforcement vs Per-Order Enforcement
- **Decision**: Enforce `maxTickets` cumulatively per user across all transactions for a competition (`userOwnedTickets + requestedQuantity <= maxTickets`).
- **Rationale**: Enforcing only per-order allows bad actors to bypass a 10-ticket limit by submitting ten 1-ticket orders. Cumulative enforcement protects host draw integrity and ensures fair distribution.
- **Alternatives Considered**:
  - Per-order limit only: Trivial to bypass; defeats the purpose of limiting tickets "Per Person".

### Decision 3: Atomic Transactional Verification
- **Decision**: In `TicketsService.allocateBasketTicketsInDatabase` and `TicketsService.allocateTicketsInDatabase`, query existing user tickets inside the Prisma interactive transaction:
  ```typescript
  if (raffle.maxTickets) {
    const userOwnedCount = await tx.ticket.count({
      where: { raffleId: raffle.id, userId }
    });
    if (userOwnedCount + quantity > raffle.maxTickets) {
      const allowed = Math.max(0, raffle.maxTickets - userOwnedCount);
      throw new BadRequestException(
        `Limit exceeded for "${raffle.title}". Maximum allowed is ${raffle.maxTickets} per person. You already have ${userOwnedCount}. You may purchase up to ${allowed} more.`
      );
    }
  }
  ```
- **Rationale**: Executing the check within `tx` prevents concurrent double-spend or bypass through rapid concurrent requests.

### Decision 4: Frontend Stepper & Entrant Experience
- **Decision**:
  - Initial quantity defaults to `Math.max(raffle.minimumTickets || 1, 1)`.
  - Decrement button is disabled when `quantity <= minTickets`.
  - Increment button is disabled when `quantity >= maxAllowed` (where `maxAllowed = Math.min(remainingTickets, maxTickets - userOwned)`).
  - If `userOwned >= maxTickets`, replace entry buttons with a disabled "Ticket Limit Reached ({owned}/{maxTickets})" badge.
  - Basket context checks both `minTickets` and `maxTickets` on item addition and quantity update.

## Risks / Trade-offs

- **[Risk] Entrant not logged in during initial ticket selection** → **Mitigation**: The competition details page bounds selection by `maxTickets`. When the entrant proceeds to checkout and logs in, the checkout API verifies their historical ticket count and returns a descriptive error if cumulative ownership would be exceeded.
- **[Risk] Existing competitions without configured limits** → **Mitigation**: Database migration uses `DEFAULT 1` for `min_tickets` and nullable for `max_tickets`, which guarantees zero regression for ongoing and past competitions.
- **[Risk] Quick-pick buttons out of range** → **Mitigation**: In `RaffleEntryCard.tsx`, clamp any quick-pick selection into `[minTickets, maxAllowed]`.

## Migration Plan

1. Create Prisma migration: `ALTER TABLE "raffles" ADD COLUMN "min_tickets" INTEGER DEFAULT 1, ADD COLUMN "max_tickets" INTEGER;`.
2. Run `prisma migrate dev` / `prisma generate` on backend and frontend.
3. Deploy backend updates (`dto`, `raffles.service`, `tickets.service`).
4. Deploy frontend updates (`CreateRaffleStep2`, `CreateRaffleWizard`, `EditRaffleForm`, `RaffleEntryCard`, `BasketContext`).
5. Rollback strategy: Dropping columns `min_tickets` and `max_tickets` restores previous behavior without data loss on existing raffle properties.
