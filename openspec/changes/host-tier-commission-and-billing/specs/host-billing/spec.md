## Purpose

Defines host billing operations, transaction recording for subscription payments, automatic reconciliation, invoice receipt viewing, and bank-transfer-only payout enforcement.

## ADDED Requirements

### Requirement: Subscription Payment Transaction Recording
The system SHALL create a persistent `Transaction` record with type `SUBSCRIPTION_FEE` upon successful completion of a host subscription checkout via payment return confirmation or webhook notification.

#### Scenario: Host subscription payment confirmed via return URL
- **WHEN** a host completes checkout for a subscription plan and is returned to the platform confirmation endpoint
- **THEN** the system creates or updates the active `HostSubscription` and creates a `Transaction` record with status `COMPLETED`, type `SUBSCRIPTION_FEE`, amount equal to the plan price, and the gateway order reference

#### Scenario: Host subscription payment confirmed via webhook
- **WHEN** the payment gateway sends an asynchronous success webhook for a host subscription order
- **THEN** the system ensures a matching `Transaction` record of type `SUBSCRIPTION_FEE` exists for the host user and marks it `COMPLETED`

### Requirement: Active Paid Subscription Auto-Reconciliation
The system SHALL detect active paid host subscriptions that lack a recorded `SUBSCRIPTION_FEE` transaction in the database and automatically generate the missing transaction record upon billing history inquiry.

#### Scenario: Existing paid subscriber views billing history
- **WHEN** a host with an active paid subscription (such as Premium £29) visits their billing page and no corresponding `SUBSCRIPTION_FEE` transaction exists
- **THEN** the system auto-reconciles by creating the completed transaction record so the payment immediately appears in the Billing History table

### Requirement: Host Invoice Receipt Viewer and Export
The system SHALL provide a viewable and printable invoice receipt for each completed host charge in the Billing History table.

#### Scenario: Host views an invoice receipt
- **WHEN** a host clicks "View Receipt" on any completed billing history item
- **THEN** the system opens an invoice receipt modal displaying the invoice number, issue date, host details, Fairway Draws business details, itemized line items, amount paid, payment method reference, and a "PAID" status badge

#### Scenario: Host prints or downloads an invoice receipt
- **WHEN** a host clicks "Print Receipt" within the invoice receipt modal
- **THEN** the system invokes standard browser print dialog formatted specifically for clean receipt printing or PDF export

### Requirement: Bank Transfer Only Payout Processing
The withdrawal request system SHALL process host payouts exclusively via Bank Transfer and SHALL NOT provide or accept PayPal as a payout method.

#### Scenario: Requesting a withdrawal
- **WHEN** a host opens the Request Withdrawal modal
- **THEN** the system presents Bank Transfer as the sole payout method, requires Account Holder Name, Bank Name, Account Number, and Sort Code, and does not display any PayPal option

#### Scenario: Rejecting invalid payout methods
- **WHEN** a payout request is submitted with any payout method other than `BANK_TRANSFER`
- **THEN** the backend rejects the request with a bad request error

### Requirement: Billing Management Clean Presentation
The host billing settings interface SHALL present only active account management controls and SHALL NOT display static or mock credit card containers.

#### Scenario: Viewing billing settings
- **WHEN** a host visits the Billing settings page
- **THEN** the page displays the current plan card and the billing transaction history table without any mock payment method card
