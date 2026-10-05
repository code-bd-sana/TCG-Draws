## Why

Hosts upgrading to Premium (£29/mo) or Pro (£79/mo) plans expect their platform fee to automatically reduce from 15% to 10% (net payout 90%), but multiple pages in the host dashboard currently hardcode 15% fee deductions (net 85%) or 5% creation estimates. Additionally, hosts paying £29 for their subscription see no transaction record in their Billing History due to missing payment confirmation hooks, have no downloadable or viewable invoice receipts for their account charges, see a misleading dummy card on their billing settings, and see PayPal as a withdrawal option despite the platform standardizing exclusively on Bank Transfers.

## What Changes

- **Tier-Based Commission Calculation**: Dynamically compute host commission based on active subscription tier: 10% platform fee (90% net earnings) for Premium and Pro hosts, and 15% platform fee (85% net earnings) for Free hosts.
- **Host Dashboard KPI Update**: Update the host dashboard Net Revenue metric and change indicator badge to reflect the dynamic commission rate (10% for Premium/Pro, 15% for Free).
- **Competition Sales Page Update**: Update the gross-to-net calculation and UI metrics cards/tables on the Competition Sales page to dynamically reflect 90% net earnings (10% platform fee) for Premium/Pro hosts.
- **Payout & Withdrawal System**:
  - Automatically apply 10% platform fee for Premium/Pro hosts and 15% for Free hosts when calculating fees and net amounts during withdrawal requests.
  - **BREAKING**: Remove PayPal from withdrawal methods across the UI, backend validation, and payout instructions; payouts are strictly Bank Transfer only.
- **Billing History Transaction Tracking**:
  - Fix subscription confirmation return and webhook handlers to record a completed `SUBSCRIPTION_FEE` transaction in the database when a host pays for a plan.
  - Add auto-reconciliation so hosts who previously paid £29 without an existing transaction record immediately see their payment in Billing History.
- **Automatic Invoice Receipt Generation**:
  - Automatically attach invoice references to host charges.
  - Add a "View Receipt / Invoice" action to the host Billing History table that opens a branded, print-ready receipt modal with print/PDF support.
- **Billing Page UI Cleanup**: Remove the dummy `PaymentMethodCard` (mockup card `4242`) from the host billing page.
- **Competition Submission Fee Preview**: Fix the competition wizard review step (Step 6) which hardcoded 5% fees to accurately display the host's actual platform fee (10% for Premium/Pro, 15% for Free).
- **Public Copy Alignment**: Update pricing cards and FAQ copy to accurately display 10% commission on Premium and Pro plans.

## Capabilities

### New Capabilities
- `host-commission`: Dynamic platform fee and net earnings calculation based on the host's active subscription tier (10% platform fee / 90% net for Premium & Pro; 15% platform fee / 85% net for Free), integrated across Host Dashboard, Competition Sales, Payout Requests, and Competition Creation wizard.
- `host-billing`: Comprehensive host billing lifecycle management including transaction recording for subscription charges, auto-reconciliation of missing paid transactions, invoice receipt generation and viewing, removal of mock payment method cards, and Bank-Transfer-only payout processing.

### Modified Capabilities
<!-- None -->

## Impact

- **Backend**:
  - `hosts.service.ts`: Introduce dynamic tier commission helper, update `getHostDashboardOverview`, `getSalesAnalytics`, `getWalletStats`, and `requestWithdrawal`.
  - `payment.service.ts`: Ensure `Transaction` record creation in `confirmPaymentReturn` and `handleWebhookNotification` for subscription orders.
  - `subscriptions.service.ts`: Auto-reconcile missing transaction records for active paid subscriptions.
- **Frontend**:
  - `HostDashboardOverview.tsx`: Dynamic net revenue calculation & fee badge.
  - `SalesMetricsCards.tsx` & `SalesBreakdownTable.tsx`: Dynamic net earnings (90% vs 85%) metrics and headers.
  - `RequestWithdrawalModal.tsx`: Dynamic fee deduction (10% vs 15%), remove PayPal options, enforce Bank Transfer fields.
  - `CreateRaffleStep6.tsx`: Dynamic fee calculation (10% vs 15%) instead of hardcoded 5%.
  - `frontend/app/dashboard/host/billing/page.tsx`: Remove dummy `PaymentMethodCard`.
  - `BillingHistoryTable.tsx`: Add "View Invoice / Receipt" modal with print/PDF export.
  - `frontend/data/pricing/`: Align plan cards and FAQs to 10% commission for Premium/Pro.
