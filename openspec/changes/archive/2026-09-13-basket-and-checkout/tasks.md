## 1. Backend DTOs & Checkout API

- [x] 1.1 Create `BasketCheckoutDto`, `BasketCheckoutItemDto`, and `ShippingDetailsDto` with `class-validator` rules in `backend/src/tickets/dto/basket-checkout.dto.ts` and verify backend TypeScript compilation.
- [x] 1.2 Implement `allocateBasketTicketsInDatabase` in `backend/src/tickets/tickets.service.ts` to execute an atomic database transaction that validates remaining ticket inventory, allocates random tickets across multiple competitions, evaluates instant wins, updates host wallet balances, and generates a unified transaction record.
- [x] 1.3 Add `@Post('checkout')` endpoint in `backend/src/tickets/tickets.controller.ts` with JWT authentication and Swagger documentation, verifying endpoint routing via curl or Postman.

## 2. Backend Payment Gateway Adaptation

- [x] 2.1 Implement `createCashflowsBasketCheckout` in `backend/src/tickets/tickets.service.ts` to generate Cashflows checkout sessions with `BSK_` order prefixes for multi-item baskets when `USE_TEST_PAYMENT=false`.
- [x] 2.2 Update `confirmPaymentReturn` and `handleWebhook` in `backend/src/payment/payment.service.ts` to recognize `BSK_` order references and complete multi-raffle allocations while leaving existing `TCK_` single-ticket order handlers intact.

## 3. Frontend Basket State & Navigation

- [x] 3.1 Create `BasketContext` and `useBasket` custom hook in `frontend/features/basket/BasketContext.tsx` with `localStorage` persistence, supporting add, remove, quantity update, clear actions, and total price calculation.
- [x] 3.2 Update `frontend/components/website/layout/WebsiteNavbar.tsx` to include a shopping basket icon with an active item count badge on both desktop and mobile drawer views.
- [x] 3.3 Add "Add to Basket" action button to `frontend/components/website/raffle-details/RaffleEntryCard.tsx` alongside the existing "Enter Draw" button with feedback toast notifications.

## 4. Frontend Basket & Checkout Pages

- [x] 4.1 Build the `/basket` route in `frontend/app/basket/page.tsx` displaying selected competition items, thumbnails, ticket quantity selectors, item subtotals, grand total, and a "Proceed to Checkout" action button.
- [x] 4.2 Build the `/checkout` route in `frontend/app/checkout/page.tsx` with a Contact & UK Shipping Address form (First Name, Last Name, Email, Phone, Address Line 1, Line 2, City, Postcode, Country) and an order summary sidebar.
- [x] 4.3 Implement auto-filling of contact and shipping fields in `/checkout` from `useAuthUser()`, plus a "Save this shipping address to my profile" option that triggers `userService.updateProfile`.
- [x] 4.4 Add checkout submission logic in `frontend/services/ticket.service.ts` calling `POST /api/v1/tickets/checkout` and routing either to Cashflows hosted checkout or the order confirmation page.

## 5. Order Confirmation & Verification

- [x] 5.1 Implement the `/checkout/success` page displaying all allocated ticket numbers grouped by competition, clearing the basket upon confirmation, and triggering `WinAnimationModal` for any instant-win prizes won.
- [x] 5.2 Execute an end-to-end multi-raffle checkout test with multiple draws in `USE_TEST_PAYMENT=true` mode, verifying tickets appear in `/dashboard/user/tickets` and the admin orders table displays the combined transaction.
