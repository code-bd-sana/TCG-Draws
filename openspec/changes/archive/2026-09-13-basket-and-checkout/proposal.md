## Why

Fairway Draws currently only allows entering one competition at a time through a direct payment redirect. Entrants who want to participate in multiple raffles must undergo separate checkouts and payment processing for each draw. Introducing an "Add to Basket" (Cart) mechanism alongside a unified checkout page with contact and shipping details collection enables customers to bundle multiple competitions in one order, streamline their purchasing experience, ensure accurate prize delivery details, and auto-populate known profile information for logged-in users while preserving existing direct-entry capabilities.

## What Changes

- **Basket System (Cart)**: Introduce client-side basket state management (`BasketContext` backed by `localStorage`) to allow adding, updating quantities of, and removing raffle entries from anywhere on the site.
- **Header & Navigation Integration**: Add a responsive Basket icon with a live item counter badge in `WebsiteNavbar` (desktop & mobile drawer).
- **Raffle Entry Interaction**: Enhance `RaffleEntryCard` to provide an "Add to Basket" action alongside the existing direct "Enter Draw" action without breaking existing single-entry flows.
- **Dedicated Basket Page (`/basket`)**: Create a full basket page displaying selected competitions, thumbnails, ticket counts, price per ticket, subtotal calculations, and a "Proceed to Checkout" call-to-action.
- **Unified Checkout Page (`/checkout`)**:
  - Contact & Shipping details form: First Name, Last Name, Email, Phone Number, Shipping Address (Street Line 1, Line 2, City, Postcode, Country).
  - Profile Auto-Fill: Automatically pre-fill contact and shipping fields for logged-in users using their stored profile data (`firstName`, `lastName`, `email`, `phone`, `address`).
  - Option to persist updated shipping details back to the user's profile.
  - Authentication prompt or inline login for unauthenticated users prior to order placement (preserving basket items).
- **Multi-Raffle Checkout Backend Endpoint**: Introduce `POST /api/v1/tickets/checkout` in `TicketsController` to handle atomic multi-competition ticket allocations, instant-win validations, host wallet crediting, and unified transaction creation.
- **Payment Gateway Adaptation**: Support both simulated test payments (`USE_TEST_PAYMENT=true`) and Cashflows payment gateway integration with a new multi-item order identifier format (`BSK_<orderId>_<timestamp>`) while maintaining backwards compatibility for existing single-purchase orders (`TCK_`).
- **Post-Purchase Order Confirmation**: Provide an order confirmation experience that displays all allocated tickets across all purchased draws and triggers win animations if any instant-win prizes are won.

## Capabilities

### New Capabilities
- `basket-checkout`: Provides cart state management, basket page, multi-draw checkout with contact/shipping address collection and profile pre-filling, and backend atomic multi-raffle ticket order processing.

### Modified Capabilities
*(None. No previous capability specs exist in the repository.)*

## Impact

- **Frontend**:
  - Added `BasketContext` and custom hooks for cart management.
  - Added `/basket` and `/checkout` routes and UI components.
  - Updated `WebsiteNavbar` with basket badge and drawer link.
  - Updated `RaffleEntryCard` to include "Add to Basket" functionality.
  - Added `order.service.ts` or updated `ticket.service.ts` for checkout API calls.
- **Backend (`/backend`)**:
  - Added DTOs: `BasketCheckoutDto`, `BasketCheckoutItemDto`, `ShippingDetailsDto`.
  - Added `POST /api/v1/tickets/checkout` to `TicketsController` and implementation in `TicketsService`.
  - Updated `PaymentService` to handle multi-item checkout sessions and return confirmations with `BSK_` prefix.
- **Database (`schema.prisma`)**:
  - Leverages existing `Transaction` (type `TICKET_PURCHASE`) and `Ticket` models with multi-ticket relations, or introduces an `Order` model if persistent snapshot tracking of orders and shipping addresses is desired.
- **Compatibility**:
  - 100% backwards-compatible: existing `POST /api/v1/tickets/purchase/:raffleId` and `TCK_` order number webhooks remain untouched.
