# Public-Facing Static & Mock Data Audit Report

This document presents a comprehensive audit of all static, mock, or fake data identified across public-facing routes of the Fairway Draws platform.

---

## Executive Summary

While core statistics (Live Draws, Total Earned, Host Preview Metrics, and Winner Stats) have been successfully connected to real database endpoints, several public-facing pages still rely on **hardcoded static text, mock fallback datasets, or un-wired local TypeScript files**.

---

## Audit Breakdown by Public Page

### 1. Homepage (`/`)
* **File / Route:** `frontend/app/page.tsx`

| Section / Component | Status | Item Description | Source File / Line | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Subtitle** | Static Copy | *"Over £180k in luxury prizes already won by our community."* | [hero.data.ts](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/data/homepage/hero.data.ts#L19) | Connect to real dynamic total winner prize sum API or rephrase to general tagline. |
| **Testimonials Section** | Static Data | Mock testimonials array (`David K.`, `Alex M.`, `Tom H.`) | [TestimonialsSection.tsx](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/components/website/home/TestimonialsSection.tsx#L4) / [testimonials.data.ts](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/data/homepage/testimonials.data.ts#L3) | Fetch real winner reviews or community feedback from backend. |
| **FAQ Section** | Static Copy | Informational FAQ items (7 standard Q&As) | [faq.data.ts](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/data/homepage/faq.data.ts#L3) | Standard legal/platform copy — no change strictly required unless dynamic FAQ management is desired. |

---

### 2. Competition Details Page (`/live-raffles/[slug]`)
* **File / Route:** `frontend/app/live-raffles/[slug]/page.tsx`

| Component | Status | Item Description | Source File / Line | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Raffle Fallback Mapping** | Dynamic / Sanitized | Dynamic `draw.category` with `"Drivers"` fallback | [page.tsx](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/app/live-raffles/%5Bslug%5D/page.tsx#L37) | Uses dynamic `draw.category` with `"Drivers"` fallback. |
| **Free Postal Address** | Hardcoded Copy | `Fairway Draws, PO Box 99, Manchester, M1 1AA` | [page.tsx](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/app/live-raffles/%5Bslug%5D/page.tsx#L65) | Move PO Box address to environment configuration or dynamic settings. |
| **You Might Also Like** | Mock Dataset Import | Imports and filters `liveRafflesData` mock dataset | [RelatedRafflesSection.tsx](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/components/website/raffle-details/RelatedRafflesSection.tsx#L2) | Fetch active related public raffles via `raffleService.getPublicRaffles()` API. |

---

### 3. Public Winners Page (`/winners`)
* **File / Route:** `frontend/app/winners/page.tsx`

| Component | Status | Item Description | Source File / Line | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Winner Highlight Card** | Hardcoded Mock | Featured winner quote: *"Aisha R. · Leeds", "Won: Premium Driver Bundle — June 2026"* with Unsplash photo | [WinnerHighlightCard.tsx](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/components/website/winners/WinnerHighlightCard.tsx#L46-L56) | Dynamically select latest verified winner with picture from database or hide section if no winner photo exists. |

---

### 4. Public Host Profile Page (`/hosts/[slug]`)
* **File / Route:** `frontend/app/hosts/[slug]/page.tsx` / `HostProfileTabs.tsx`

| Component | Status | Item Description | Source File / Line | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Host About Tab** | Dynamic / Sanitized | Host bio, website URL, and business location dynamic or defaulted to Fairway Pro Shop | [HostProfileTabs.tsx](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/components/website/host-profile/HostProfileTabs.tsx#L103-L111) | Render dynamic host bio, website URL, and business location from `host.businessName`, `host.website`, `host.city`. |
| **Host Reviews Tab** | Empty State / Static Text | Static explanation message for reviews | [HostProfileTabs.tsx](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/components/website/host-profile/HostProfileTabs.tsx#L91-L98) | Connect to backend host reviews endpoint (`/reviews/host/:id`). |

---

### 5. Contact & How It Works Pages
* **Routes:** `/contact`, `/how-it-works`

| Page / Component | Status | Item Description | Source File / Line | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Contact Info Cards** | Static Copy | Static support email, phone number (+44 7984 594833), and operating hours | [ContactInfoCards.tsx](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/components/website/contact/ContactInfoCards.tsx#L123-L168) | Static support info is standard, but phone/hours can be centralized in environment config. |
| **How It Works Steps** | Static Copy | Step-by-step guides for entrants and hosts | [how-it-works-steps.data.ts](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/data/how-it-works/how-it-works-steps.data.ts#L1) | Standard instructional content — no changes needed. |

---

### 6. Host Login & Registration Brand Panels
* **Components:** `HostAuthBrandPanel.tsx`

| Component | Status | Item Description | Source File / Line | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Host Login Side Panel** | Static Copy | `"£284,600 Paid to Hosts"` static text string | [HostAuthBrandPanel.tsx](file:///Users/syedrakibhasan/projects/FD/fairway-draws/frontend/components/host-auth/HostAuthBrandPanel.tsx#L35) | Connect to real public host payout summary API or render general platform benefits. |

---

## Action Plan Summary

1. **`RelatedRafflesSection.tsx`**: Replace `liveRafflesData` import with API call to `raffleService.getPublicRaffles()`.
2. **`HostProfileTabs.tsx`**: Wire dynamic host biography, website link, location, and reviews.
3. **`WinnerHighlightCard.tsx`**: Wire to real winner database record or hide when no feature winner photo is uploaded.
4. **`app/live-raffles/[slug]/page.tsx`**: Dynamic raffle category with fallback `"Drivers"`.
