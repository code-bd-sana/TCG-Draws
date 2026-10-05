## 1. Backend Analytics & Service Cleanup

- [x] 1.1 Update `backend/src/admin/dashboard/admin-dashboard.service.ts` to calculate real Top Hosts from `HostProfile` and remove hardcoded dummy fallback arrays from `getReports`, returning empty sets when data is zero.
- [x] 1.2 In `backend/src/hosts/hosts.service.ts`, remove fake category breakdown fallbacks in `getPerformanceAnalytics` and remove `rating: 5.0, // Mocked` in `findOnePublic`.
- [x] 1.3 In `backend/src/raffles/raffles.service.ts` and `raffles.controller.ts`, verify or expose an admin endpoint `GET /raffles/:id/tickets` that returns real ticket entries with entrant details.

## 2. Admin Dashboard Frontend Integration

- [x] 2.1 In `frontend/app/dashboard/admin/page.tsx`, connect the Platform Revenue and User/Host Growth charts to live data from `useQuery` (`adminService.getReports`), replacing static `REVENUE_DATA` and `GROWTH_DATA`.
- [x] 2.2 In `frontend/app/dashboard/admin/page.tsx`, replace the hardcoded "Top Hosts This Month" list with live host rankings and wire the `7D`, `1M`, `6M`, `1Y` timeframe filter buttons.
- [x] 2.3 In `frontend/components/dashboard/admin/draws/DrawEntriesTab.tsx`, replace the static `mockEntries` array with real ticket holders fetched for the selected competition draw.

## 3. Host Dashboard Frontend Integration

- [x] 3.1 In `frontend/components/dashboard/host/HostRevenueChart.tsx`, replace the static hardcoded SVG bezier curve with a dynamic Recharts `AreaChart` wired to real host sales points and functional timeframe buttons.
- [x] 3.2 In `frontend/app/dashboard/host/payouts/page.tsx`, remove `mockPayoutMetrics` and `mockPayoutHistory` fallback imports, displaying real wallet stats and withdrawal history or authentic empty states.

## 4. User Dashboard & Public Profiles

- [x] 4.1 In `frontend/app/dashboard/user/page.tsx`, replace the hardcoded SVG wave in "Ticket Spend Overview" with a dynamic monthly spend chart computed from the user's completed transactions.
- [x] 4.2 In `frontend/components/website/host-profile/HostProfileTabs.tsx`, replace the hardcoded "About Fairway Pro Shop" copy with the host's real profile bio, business name, and location.

## 5. End-to-End Verification

- [x] 5.1 Run TypeScript typechecks across both `backend` and `frontend` to verify clean compilation with zero type errors.
- [x] 5.2 Validate that the Admin, Host, User, and Public pages render authentic data with no remaining hardcoded mock arrays or fake SVG curves.
