## Context

See `proposal.md` for background and motivations. Currently, Fairway Draws uses a multi-tier subscription model (`Free` at £0, `Premium` at £29/month, `Pro` at £79/month) backed by `SubscriptionPlan` and `HostSubscription` models in Prisma. Hosted payments for subscription upgrades are processed through Cashflows. Multiple dashboard pages and backend service endpoints previously hardcoded a 15% platform commission rate (85% net payout), hardcoded 5% in the competition creation wizard, omitted transaction logging upon subscription activation, and retained PayPal withdrawal options and dummy card containers.

## Goals / Non-Goals

**Goals:**
- Centralize host commission tier resolution in `HostsService` (`10%` platform fee / `90%` net for Premium & Pro; `15%` platform fee / `85%` net for Free).
- Pass dynamic fee rates and net earnings to the Host Dashboard Overview, Competition Sales page, and Competition Creation wizard (Step 6).
- Deduct the dynamic fee rate during payout requests and restrict withdrawal methods exclusively to Bank Transfer.
- Record completed `SUBSCRIPTION_FEE` transactions upon subscription return and webhook notification.
- Auto-reconcile active paid subscriptions that currently lack transaction records so historical £29 payments immediately appear in Billing History.
- Provide a branded, printable Invoice Receipt modal for each host charge row in the Billing History table.
- Remove the mock `PaymentMethodCard` component from `/dashboard/host/billing`.
- Update public pricing cards and FAQ copy to advertise 10% commission on Premium and Pro plans.

**Non-Goals:**
- Storing or tokenizing raw credit cards in the Fairway Draws database (Cashflows hosted checkout remains the payment authority).
- Introducing a heavyweight server-side headless browser PDF rendering pipeline (native browser print styling `@media print` satisfies all receipt download/print needs).
- Changing ticket purchase commission for buyer entries.

## Decisions

### Decision 1: Resolve Commission Rate Dynamically via Active Subscription Plan
- **Choice**: Implement `getHostCommissionRate(hostId: string): Promise<number>` in `HostsService` to query `HostSubscription` where `status = 'ACTIVE'`. If plan name is `'Premium'` or `'Pro'`, return `10.0`; otherwise return `15.0`.
- **Rationale**: Avoids schema migrations, leverages existing Prisma relationships, and ensures immediate consistency whenever a host upgrades or cancels their plan.
- **Alternatives Considered**: Adding a `commissionRate` column to `SubscriptionPlan` or `HostProfile`. This would require a database migration and backfill without architectural benefit since plan names and tiers are fixed.

### Decision 2: Idempotent Subscription Transaction Creation & Auto-Reconciliation
- **Choice**: In `confirmPaymentReturn` and `handleWebhookNotification`, check for an existing `Transaction` matching `relatedEntityId: sub.id` or `gatewayTransactionId: orderNumber`. If absent, create `Transaction` with `type: 'SUBSCRIPTION_FEE'`, `amount: plan.price`, `status: 'COMPLETED'`, and `paymentGateway: 'CASHFLOWS'`. In `getMyBillingHistory`, if an active paid subscription has no transaction, backfill it on the fly.
- **Rationale**: Immediate visibility of the user's £29 payment without manual database patches, and safe against duplicate webhook/returnUrl executions.

### Decision 3: Remove PayPal and Restrict Withdrawals Exclusively to Bank Transfer
- **Choice**: Eliminate the PayPal tab, PayPal email inputs, and PayPal validation from `RequestWithdrawalModal.tsx`. Enforce `payoutMethod: 'BANK_TRANSFER'` in both frontend and backend handlers.
- **Rationale**: Bank transfer is the single verified settlement method for UK host payouts and prevents payment gateway account mismatches.

### Decision 4: Interactive, Print-Ready Invoice Receipt Modal
- **Choice**: Implement `InvoiceReceiptModal.tsx` in `components/dashboard/host/billing/` triggered by a "View Receipt" button in `BillingHistoryTable.tsx`. Include company header, invoice reference, date, host details, item description (`Host ${planName} Subscription`), total paid, PAID badge, and a "Print / Download PDF" button that triggers `window.print()`.
- **Rationale**: Provides immediate, professional invoice receipts with zero external dependencies, accessible anytime from the host billing history.

## Architecture & Data Flow

```
+-----------------------------------------------------------------------------------------+
|                                TIER COMMISSION PIPELINE                                 |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  HostProfile (User)                                                                     |
|       │                                                                                 |
|       ▼                                                                                 |
|  HostSubscription (status: 'ACTIVE') ──> SubscriptionPlan (Free / Premium / Pro)        |
|       │                                                                                 |
|       ▼                                                                                 |
|  getHostCommissionRate(hostId)                                                          |
|       │                                                                                 |
|       ├── Premium / Pro: rate = 10%, multiplier = 0.90                                  |
|       └── Free:          rate = 15%, multiplier = 0.85                                  |
|                                                                                         |
|       ▼                                                                                 |
|  Consumer Endpoints:                                                                    |
|  1. /hosts/dashboard    -> kpiStats.totalNetRevenue & kpiStats.commissionRate           |
|  2. /hosts/sales        -> metrics.totalNetRevenue & metrics.commissionRate             |
|  3. /hosts/wallet       -> walletStats.commissionRate (10.0 or 15.0)                    |
|  4. /hosts/withdraw     -> feeAmount = amount * (rate / 100), netAmount = amount - fee  |
|  5. Raffle Step 6 Preview-> Est. Platform Fee (10% or 15%)                              |
+-----------------------------------------------------------------------------------------+
```

## Risks / Trade-offs

- **[Risk]**: Host views cached wallet stats after an immediate tier upgrade.
  - **Mitigation**: Invalidate React Query cache tags (`host-wallet`, `subscription`, `host-sales`) when returning from payment confirmation.
- **[Risk]**: Missing transaction data for hosts whose subscriptions were created before this fix.
  - **Mitigation**: Auto-reconciliation logic runs transparently in `getMyBillingHistory()`.
