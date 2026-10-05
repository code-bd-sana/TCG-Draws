## Context

Multiple dashboards currently render static data structures:
1. `AdminDashboardPage` in `frontend/app/dashboard/admin/page.tsx` defines static constants `REVENUE_DATA` and `GROWTH_DATA`, and hardcodes 5 mock hosts in "Top Hosts This Month".
2. `DrawEntriesTab.tsx` defines static `mockEntries` ("James Thornton", "Sarah Mitchell", etc.) instead of querying real ticket holders.
3. `admin-dashboard.service.ts` injects dummy items (`Callaway Paradym Driver`, `Fairway Elite`, `England 55%`) into `getReports` when collections are empty.
4. `HostRevenueChart.tsx` and `user/page.tsx` render static hardcoded SVG paths (`<path d="M47.5 150.5C124.5..." />`) that never reflect real financial curves.
5. `dashboard/host/payouts/page.tsx` imports `mockPayoutMetrics` and `mockPayoutHistory`.

The database already holds the real models: `Transaction`, `Ticket`, `User`, `Raffle`, `HostProfile`, `Withdrawal`. The design will hook all views directly to these models.

## Goals / Non-Goals

**Goals:**
- Connect all admin dashboard cards, charts, and tables to live Prisma database aggregations.
- Ensure timeframe buttons (`7D`, `1M`, `6M`, `1Y`) dynamically query and refresh chart metrics.
- Hook `DrawEntriesTab` to actual ticket purchases for the selected raffle.
- Ensure host earnings overview chart renders real sales data points.
- Ensure user dashboard ticket spend overview chart computes real monthly expenditures from user transactions.
- Remove all static fallback data from backend services and frontend pages; present graceful empty states when records are zero.
- Display actual host profile business name, bio, and location on `/hosts/:slug`.

**Non-Goals:**
- Adding new payment gateways or changing payment processing logic.
- Altering existing raffle draw scheduling or RNG winner selection logic.
- Building a full user review submission system (only removing fake hardcoded reviews and fake ratings).

## Decisions

### 1. Admin Dashboard Real Aggregations via Reports & Overview
- **Decision**: In `backend/src/admin/dashboard/admin-dashboard.service.ts`, enhance `getOverviewStats` or leverage `getReports(timeFilter)` to include:
  - Dynamic `revenueTrend` array based on real `Transaction` records.
  - Dynamic `growthData` array combining user and host registration timestamps.
  - Dynamic `topHosts` list calculated from host raffles and ticket revenue.
- **Alternative Considered**: Adding a separate controller route for each widget. Kept unified under `admin/dashboard/stats` and `admin/dashboard/reports` to minimize round-trips and maximize performance.

### 2. Live Competition Ticket Entries in Admin Draws
- **Decision**: Ensure endpoint `GET /raffles/:id/tickets` or an admin ticket query endpoint provides real ticket entries (`ticketNumber`, `user: { firstName, lastName, email, avatarUrl }`, `createdAt`). Hook `DrawEntriesTab.tsx` via React Query (`useQuery`) with the active `draw.id`.
- **Alternative Considered**: Loading all tickets in the main draws table query. Rejected due to performance and payload size overhead for large raffles.

### 3. Recharts Dynamic Visualizations for Host & User Charts
- **Decision**: Replace the hardcoded SVG strings in `HostRevenueChart.tsx` and `user/page.tsx` with standard Recharts `<AreaChart>` and `<ResponsiveContainer>`.
  - For Host: Bind to `salesData.chartData` or `performanceData.revenueTrend`.
  - For User: Compute date-bucketed spending from `rawTransactions` (or `useMyTransactionsQuery`).

### 4. Authentic Empty States Over Fake Fallbacks
- **Decision**: Remove all `if (array.length === 0) array.push(mockData)` branches in `backend/src/admin/dashboard/admin-dashboard.service.ts` and `backend/src/hosts/hosts.service.ts`.
- **Rationale**: Real platforms must never invent fake product names, entrant names, or revenues. Empty states must inform the user honestly that no data is currently available.

## Risks / Trade-offs

- [Risk: Low transaction volume in development/staging produces empty charts] → Mitigation: Provide elegant, informative empty state illustrations and zero-baseline charts that make it clear no transactions exist yet.
- [Risk: Date parsing mismatch across different timezones] → Mitigation: Standardize UTC/ISO timestamp bucketing on the backend with client-side formatting using `date-fns`.
