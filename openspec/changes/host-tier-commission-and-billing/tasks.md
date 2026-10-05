## 1. Backend Dynamic Commission Rate & Calculations

- [x] 1.1 Implement `getHostCommissionRate(hostId: string)` in `backend/src/hosts/hosts.service.ts` to return 10.0 for Premium and Pro plans, and 15.0 for Free or inactive plans, and verify via service unit test or endpoint call
- [x] 1.2 Update `getHostDashboardOverview` in `backend/src/hosts/hosts.service.ts` to calculate `totalNetRevenue` using dynamic commission rate and include `commissionRate` in `kpiStats`, verifying via API response
- [x] 1.3 Update `getSalesAnalytics` in `backend/src/hosts/hosts.service.ts` to calculate individual raffle and aggregate net revenue using the host's dynamic commission rate and include `commissionRate` and `netPercentage` in the response
- [x] 1.4 Update `getWalletStats` and `requestWithdrawal` in `backend/src/hosts/hosts.service.ts` to apply the host's tier-specific fee rate and restrict `payoutMethod` strictly to `BANK_TRANSFER`

## 2. Backend Subscription Transactions & Auto-Reconciliation

- [x] 2.1 Update `confirmPaymentReturn` in `backend/src/payment/payment.service.ts` to create a `SUBSCRIPTION_FEE` `Transaction` record upon payment confirmation and verify record creation in database
- [x] 2.2 Update `handleWebhookNotification` in `backend/src/payment/payment.service.ts` to ensure a matching `SUBSCRIPTION_FEE` `Transaction` record is idempotently created for host subscription webhook events
- [x] 2.3 Implement auto-reconciliation in `getMyBillingHistory` in `backend/src/subscriptions/subscriptions.service.ts` so active paid subscriptions lacking a `Transaction` automatically generate one, verifying the £29 transaction appears in the history response

## 3. Host Dashboard & Competition Sales UI Updates

- [x] 3.1 Update `frontend/components/dashboard/host/HostDashboardOverview.tsx` to display dynamic platform fee badge (`${commissionRate}% Platform Fee`) and formatted net revenue from API
- [x] 3.2 Update `frontend/components/dashboard/host/sales/SalesMetricsCards.tsx` to dynamically display "Net Earnings (90%)" / "After 10% platform fee" for Premium/Pro hosts and "Net Earnings (85%)" for Free hosts
- [x] 3.3 Update `frontend/components/dashboard/host/sales/SalesBreakdownTable.tsx` to dynamically render column header "Net Earnings (${netPercentage}%)" and individual competition net amounts

## 4. Host Withdrawal & Payouts UI

- [x] 4.1 Refactor `frontend/components/dashboard/host/payouts/RequestWithdrawalModal.tsx` to remove the PayPal tab, PayPal email input, and validation, locking payouts exclusively to Bank Transfer
- [x] 4.2 Update fee breakdown in `frontend/components/dashboard/host/payouts/RequestWithdrawalModal.tsx` to compute and display dynamic platform fee (10% on Premium/Pro, 15% on Free) and net payout amount
- [x] 4.3 Update copy on `frontend/app/dashboard/host/payouts/page.tsx` to reflect dynamic fee deduction and direct bank account transfers

## 5. Host Billing Page & Invoice Receipt Generation

- [x] 5.1 Remove `PaymentMethodCard` component from `frontend/app/dashboard/host/billing/page.tsx` so the billing page cleanly shows Current Plan and Billing History
- [x] 5.2 Implement `InvoiceReceiptModal.tsx` in `frontend/components/dashboard/host/billing/` displaying Fairway Draws branding, host details, itemized plan details, PAID badge, and browser print/PDF trigger
- [x] 5.3 Add "View Receipt" action to each row in `frontend/components/dashboard/host/billing/BillingHistoryTable.tsx` to launch the invoice receipt modal and verify printing/viewing

## 6. Competition Submission Wizard & Public Copy Alignment

- [x] 6.1 Update `frontend/components/dashboard/host/create/CreateRaffleStep6.tsx` and `CreateRaffleWizard.tsx` to calculate and display the dynamic platform fee (10% on Premium/Pro, 15% on Free) instead of the hardcoded 5% preview
- [x] 6.2 Update `frontend/data/pricing/pricing-plans.data.ts`, `frontend/data/pricing/pricing-faq.data.ts`, and `frontend/data/homepage/faq.data.ts` to align Premium and Pro commission copy to 10%
