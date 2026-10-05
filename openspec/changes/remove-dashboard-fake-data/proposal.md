## Why

Multiple pages and dashboards across the application (Admin overview and draws manager, Host sales and payouts, User dashboard, and public host profiles) display static mock arrays, hardcoded SVG bezier waves, or dummy fallback data instead of real database records. To ensure platform integrity, financial accuracy, and trust for administrators, hosts, and entrants, all mock data must be eliminated and replaced with real live queries, database aggregations, and genuine empty states.

## What Changes

- **Admin Dashboard Overview (`/dashboard/admin`)**:
  - Replace static `REVENUE_DATA` with live aggregate monthly revenue from completed ticket purchase transactions.
  - Replace static `GROWTH_DATA` with live user and host registration time series from the database.
  - Replace hardcoded "Top Hosts This Month" list with live query of host profiles sorted by gross ticket revenue.
  - Enable interactive timeframe filtering (`7D`, `1M`, `6M`, `1Y`) for charts.
  - Remove backend dummy fallbacks in `admin-dashboard.service.ts` (`popularCompetitions`, `hostPerformance`, `geographicDistribution`) so empty states show clean empty messages instead of fake data.

- **Admin Competition Draws (`/dashboard/admin/draws`)**:
  - In `DrawEntriesTab.tsx`, replace the hardcoded `mockEntries` array with real ticket purchases and user details fetched from the database for the selected draw.

- **Host Dashboard & Analytics (`/dashboard/host`)**:
  - Replace the static SVG bezier curve in `HostRevenueChart.tsx` with dynamic Recharts line/area visualization powered by `/hosts/sales` chart points.
  - In `frontend/app/dashboard/host/payouts/page.tsx`, remove fallback imports to `mockPayoutMetrics` and `mockPayoutHistory`. Show live wallet balances and withdrawal requests or an empty state.
  - In `backend/src/hosts/hosts.service.ts`, remove fake category breakdown fallback (`Drivers 40%`, etc.) and return empty arrays when no sales have occurred.

- **User / Entrant Dashboard (`/dashboard/user`)**:
  - Replace the hardcoded SVG path in the "Ticket Spend Overview" card with a dynamic monthly spend chart calculated from the user's real completed ticket transactions.

- **Public Host Profile (`/hosts/[slug]`)**:
  - In `HostProfileTabs.tsx`, replace hardcoded "About Fairway Pro Shop" copy with the host's actual profile bio, business name, and location.
  - In `backend/src/hosts/hosts.service.ts`, remove `rating: 5.0, // Mocked`.

## Capabilities

### New Capabilities
- `real-dashboard-data`: Enforces that Admin, Host, and User dashboards, charts, and public profile views display strictly verified, database-derived metrics, transaction aggregations, and authentic empty states without hardcoded or mock data fallbacks.

### Modified Capabilities
<!-- None -->

## Impact

- **Backend**:
  - `backend/src/admin/dashboard/admin-dashboard.service.ts`
  - `backend/src/hosts/hosts.service.ts`
  - `backend/src/raffles/raffles.service.ts` / `raffles.controller.ts` (ensuring raffle ticket buyers endpoint is accessible for admin draws manager)
- **Frontend**:
  - `frontend/app/dashboard/admin/page.tsx`
  - `frontend/components/dashboard/admin/draws/DrawEntriesTab.tsx`
  - `frontend/components/dashboard/host/HostRevenueChart.tsx`
  - `frontend/app/dashboard/host/payouts/page.tsx`
  - `frontend/app/dashboard/user/page.tsx`
  - `frontend/components/website/host-profile/HostProfileTabs.tsx`
