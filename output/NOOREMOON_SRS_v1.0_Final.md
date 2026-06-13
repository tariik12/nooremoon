# NOOREMOON — Software Requirements Specification

**nooremoon.global**

**Version 1.0 — Final | June 2026**

| Field    | Value                                      |
| -------- | ------------------------------------------ |
| Status   | FINAL DRAFT                                |
| Client   | NOOREMOON / BYSL Global                    |
| Support  | support@nooremoon.global                   |
| Based on | Full site audit of ilyn.global — June 2026 |

---

## Revision History

| Version | Date      | Description                                                          | Author            |
| ------- | --------- | -------------------------------------------------------------------- | ----------------- |
| 1.0     | June 2026 | Initial SRS for NOOREMOON — derived from ilyn.global full site audit | Dev Team          |
| 1.1     | TBD       | Client review & acceptance                                           | Client + Dev Team |

---

## Table of Contents

1. Introduction
2. Overall Description
3. URL Structure & Routing Architecture
4. Functional Requirements
   - 4.1 User Registration & Authentication
   - 4.2 Navigation & Mega-Menu System
   - 4.3 Category Landing Pages (`/c/…`)
   - 4.4 Sub-Category / Collection Pages (`/s/…`)
   - 4.5 Seasonal Collection Pages (Eid, SS26)
   - 4.6 CottoCool Technology Pages
   - 4.7 Product Listing Pages (PLP) — Full Taxonomy
   - 4.8 Product Detail Page (PDP)
   - 4.9 Size Guide (`/size-guide`)
   - 4.10 Search & Filtering
   - 4.11 Shopping Bag (`/shopping-bag`)
   - 4.12 Checkout & Payment (Stripe)
   - 4.13 Order Cancellation Policy
   - 4.14 Order Management & Tracking
   - 4.15 Shipping & Delivery Policy
   - 4.16 Exchange & Return
   - 4.17 Loyalty Programme (`/loyalty-program`)
   - 4.18 Gift Cards (`/gift-card-policy`)
   - 4.19 User Profile & Account (`/profile`)
   - 4.20 Store Locations (`/store-locations`)
   - 4.21 CMS / Policy Content Pages
   - 4.22 About Us (`/about-us`)
   - 4.23 Contact Us (`/contact-us`) & Live Chat
   - 4.24 Intellectual Property (`/intellectual-property`)
   - 4.25 Admin Panel
   - 4.26 Mobile Applications (PWA)
5. Non-Functional Requirements
6. External Interface Requirements
7. Known Issues & Data Gaps
8. System Constraints & Assumptions
9. Glossary
10. Appendices

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) is the authoritative requirements document for the NOOREMOON digital retail platform at **nooremoon.global**. It is based on a complete page-by-page audit of the ilyn.global reference site conducted in June 2026. NOOREMOON is a high-end lifestyle fashion e-commerce platform built on the same architecture and feature set, rebranded and extended as specified herein.

### 1.2 Scope

NOOREMOON is a VPS-hosted, globally accessible e-commerce site for high-end lifestyle fashion. Scope includes:

- Responsive web application (desktop & mobile browsers)
- Full product catalogue with 3-level taxonomy: **Category → Sub-Category → Tier**
- Dynamic seasonal collection layers (Eid, SS26, and future seasons — fully manageable from dashboard)
- A proprietary **CottoCool Technology** cross-cutting filter/collection
- Checkout powered by **Stripe** payment gateway
- Post-order: tracking, exchange/return, cancellation
- Loyalty programme, gift cards, user profile
- CMS-managed policy and content pages
- Admin / back-office panel
- PWA (Progressive Web App) for iOS and Android

> **[CLIENT INPUT REQUIRED]** — Confirm any features or product lines that NOOREMOON adds beyond the ilyn.global baseline. Insert them in the relevant sections before Sprint 1 begins.

### 1.3 Definitions & Abbreviations

| Term                | Definition                                                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NOOREMOON           | The brand and platform (nooremoon.global)                                                                                                                        |
| SKU                 | Stock Keeping Unit — unique identifier per product variant                                                                                                       |
| PDP                 | Product Detail Page                                                                                                                                              |
| PLP                 | Product Listing Page                                                                                                                                             |
| CMS                 | Content Management System                                                                                                                                        |
| CottoCool           | NOOREMOON proprietary heat-management fabric technology                                                                                                          |
| Tier / Sub-brand    | Quality segmentation: Premium, Luxury, Platinum, Sahara, Ambassador, Legends, Exicutiv, Max, Holiday Island, Benazir Esita — also CRUD-manageable from dashboard |
| Eid Collection      | Eid seasonal collection (`/s/eid-collection-{year}-{id}`)                                                                                                        |
| SS26                | Spring/Summer 2026 seasonal collection (`/s/ss26-{id}`)                                                                                                          |
| Closed-box delivery | Policy: products arrive sealed; customer cannot return to delivery agent at door                                                                                 |
| Flash Sale          | Time-limited event; items sold during it are ineligible for exchange                                                                                             |
| Stripe              | Confirmed payment gateway — PCI-DSS Level 1 compliant                                                                                                            |
| UTC+4               | Service centre operating timezone (Dhaka)                                                                                                                        |
| 2FA                 | Two-Factor Authentication enforced on Stripe payments                                                                                                            |
| VAT                 | Value Added Tax — included in listed prices unless stated otherwise                                                                                              |
| RTL                 | Right-to-Left text direction (for Arabic)                                                                                                                        |

### 1.4 References

- Payment Policy: `/payment-policy`
- Shipping Policy: `/shipping-policy`
- Exchange & Return: `/exchange-return`
- Privacy Policy: `/privacy-policy`
- Terms & Conditions: `/terms-conditions`
- Size Guide: `/size-guide`
- Loyalty Program: `/loyalty-program`
- Gift Card Policy: `/gift-card-policy`
- Store Locations: `/store-locations`
- About Us: `/about-us`
- Intellectual Property: `/intellectual-property`
- Apps: `/apps`

---

## 2. Overall Description

### 2.1 Product Perspective

NOOREMOON is a standalone VPS-hosted Next.js e-commerce platform. Static assets and images are served via CloudFront CDN. Payments are processed by Stripe. The site operates in English (language selector present; multi-language architecture required). Support hours: **8:00 AM – 8:00 PM UTC+4, every day.**

### 2.2 User Classes

| User Class             | Description             | Key Capabilities                                                                     |
| ---------------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| Guest Visitor          | Unauthenticated browser | Browse, search, view PDPs, read policies; cannot place orders                        |
| Registered Customer    | Authenticated user      | Full shopping, order tracking, exchange requests, loyalty points, profile management |
| Customer Service Agent | NOOREMOON support staff | Handle exchange requests, live chat, email/social media support                      |
| Admin / Back-Office    | Internal staff          | Product management, order processing, CMS, promotions, reporting                     |
| Marketing Staff        | Non-technical team      | Manage seasonal collections, banners, promotional events via CMS without dev         |

### 2.3 Key Business Rules (enforced by system)

- Exchange window: **7 days** from delivery
- **Single exchange** per purchase
- **No exchange** on items at 50% or higher discount
- **No exchange** on Flash Sale items
- **Closed-box delivery**: no doorstep returns to delivery agent
- Customs duties and import taxes: sole responsibility of customer
- Prices include VAT; delivery charge is separate
- Order cancellation: **only permitted** before Service Centre reconfirmation call
- Payment: Stripe only; 2FA enforced; no card data stored on NOOREMOON servers
- Product cannot be returned to delivery agent if 'not as described' — contact support first

### 2.4 Operating Environment

- **Web**: Chrome (last 2 versions), Firefox, Safari, Edge; 320px to 4K viewports
- **Mobile**: iOS 15+, Android 10+
- **Backend**: NestJS / Next.js, Tailwind CSS, Redux frontend; VPS hosted; CDN via CloudFront
- **Message Bus**: RabbitMQ
- **Database**: PostgreSQL + Redis cache
- **Payment**: Stripe (live)

---

## 3. URL Structure & Routing Architecture

All routes must be implemented and resolve correctly.

| Route Pattern                         | Description                                              | Example                                                                                                        |
| ------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `/`                                   | Homepage                                                 | `https://nooremoon.global/`                                                                                    |
| `/c/{slug}-{id}`                      | Top-level Category PLP                                   | `/c/men-1305`, `/c/women-1356`, `/c/kids-1357`, `/c/footwear-1786`, `/c/fragrance-1359`, `/c/accessories-1360` |
| `/s/{slug}-{id}`                      | Sub-Category or Collection PLP (also tiers and seasonal) | `/s/panjabi-1304`, `/s/premium-1342`, `/s/eid-collection-2026-1907`, `/s/ss26-2044`                            |
| `/c/cottocool-technology-{id}`        | CottoCool Technology category page                       | `/c/cottocool-technology-1588`                                                                                 |
| `/category/cottocool-technology-{id}` | Alternative CottoCool route (both must work)             | `/category/cottocool-technology-1588`                                                                          |
| `/search`                             | Global search results page                               |                                                                                                                |
| `/shopping-bag`                       | Cart/bag page                                            |                                                                                                                |
| `/profile`                            | User profile and account                                 |                                                                                                                |
| `/store-locations`                    | Physical store locator                                   |                                                                                                                |
| `/contact-us`                         | Contact / support page                                   |                                                                                                                |
| `/apps`                               | Apps hub                                                 |                                                                                                                |
| `/waqt-al-salaah`                     | Waqt Al Salaah app page                                  |                                                                                                                |
| `/memorize-quran`                     | Memorize Quran app page                                  |                                                                                                                |
| `/size-guide`                         | Size guide (CMS-driven, dynamic)                         |                                                                                                                |
| `/shipping-policy`                    | Shipping policy                                          |                                                                                                                |
| `/exchange-return`                    | Exchange & return policy                                 |                                                                                                                |
| `/payment-policy`                     | Payment policy                                           |                                                                                                                |
| `/privacy-policy`                     | Privacy policy                                           |                                                                                                                |
| `/terms-conditions`                   | Terms & conditions                                       |                                                                                                                |
| `/loyalty-program`                    | Loyalty programme (CMS-driven)                           |                                                                                                                |
| `/gift-card-policy`                   | Gift card policy (CMS-driven)                            |                                                                                                                |
| `/about-us`                           | About Us (CMS-driven)                                    |                                                                                                                |
| `/intellectual-property`              | IP page                                                  |                                                                                                                |

> **Note:** Both `/c/cottocool-technology-{id}` and `/category/cottocool-technology-{id}` must resolve to the same page.

---

## 4. Functional Requirements

### 4.1 User Registration & Authentication

#### 4.1.1 Registration

1. The system shall allow visitors to register with email address and password.
2. The system shall send an email verification link upon registration.
3. Minimum password: 8 characters, at least one number and one special character.
4. Duplicate email addresses shall be rejected with a clear error message.
5. Social login (Google, Facebook) shall be supported as optional.

#### 4.1.2 Login & Session

6. Users shall log in with email and password.
7. 'Remember Me' option shall persist the session for 30 days.
8. Account shall be locked after 5 consecutive failed login attempts; unlock link sent via email.
9. OTP-based login shall be available as an alternative.
10. Mobile PWA shall support biometric authentication (Face ID / Fingerprint).

#### 4.1.3 Password Reset

11. 'Forgot Password' shall send a single-use reset link valid for 24 hours.

---

### 4.2 Navigation & Mega-Menu System

12. The primary navigation bar shall appear on all pages and include: **Eid Collection, SS26, Men, Women, Kids, Footwear, Fragrance, Accessories, CottoCool Technology** — fully dynamically manageable from the admin dashboard.
13. Seasonal nav items (Eid, SS26) must appear consistently across all page types.
14. Each top-level category shall expand into a **mega-menu** showing all sub-categories and tier links.
15. The navigation shall be **sticky (fixed)** on desktop scroll.
16. A **hamburger menu** shall be used on mobile with collapsible sub-menus.
17. The header shall contain: Logo (links to homepage), search icon, store locator icon, shopping bag icon with item count badge, user profile icon.
18. A secondary top bar shall display support email (`support@nooremoon.global`) and Contact link.
19. The footer shall contain four columns:
    - **Legal**: Shipping Policy, Privacy Policy, Terms & Conditions, Payment Policy
    - **Information**: Exchange & Return, Size Guide
    - **Company**: Contact Us, Intellectual Property, About Us
    - **Service Center**: Facebook, Instagram
    - Payment logos (Visa, Mastercard) shall appear in the footer.

---

### 4.3 Category Landing Pages (`/c/…`)

20. Each category landing page shall display a **hero/banner section**.
21. Below the hero, the page shall display a **'New Arrivals'** section linking to the full category PLP.
22. Below New Arrivals, a **'Trending Styles'** section highlighting curated sub-categories.
23. Both sections shall be CMS-manageable by marketing staff without developer involvement.
24. Required category pages:
    - `/c/men-{id}`
    - `/c/women-{id}`
    - `/c/kids-{id}`
    - `/c/footwear-{id}`
    - `/c/fragrance-{id}`
    - `/c/accessories-{id}`
    - `/c/cottocool-technology-{id}` (and `/category/cottocool-technology-{id}`)

> **[CLIENT INPUT REQUIRED]** — Confirm if NOOREMOON adds any categories beyond the above (e.g., Furniture was visible on ilyn).

---

### 4.4 Sub-Category / Collection Pages (`/s/…`)

Sub-category and tier pages are the primary product browsing pages. They share the `/s/` URL prefix regardless of whether they represent a garment type (Panjabi), a quality tier (Premium), or a special collection.

25. Each `/s/` page shall display a **hero banner image** (CMS-managed, served from CloudFront CDN).
26. Below the hero, **horizontal scrollable tier/filter tabs** shall display the relevant tier links for that sub-category.
27. Below the tabs, a **product grid (PLP)** shall display all products in that sub-category, filtered by the active tab.
28. The system shall support the complete sub-category taxonomy as specified in Section 4.7.

---

### 4.5 Seasonal Collection Pages (Eid, SS26)

Seasonal collections are top-level navigation items crossing all standard categories.

29. **Eid Collection** (`/s/eid-collection-{year}-{id}`) shall contain sub-collections:
    - **Men**: Panjabi, Thobe And Kabli, Waistcoats, Shirts, T-shirts And Polos, Jeans, Trousers, Essentials
    - **Women**: Abaya, Tops And Co-ords Dress Set, Scarf, Essentials
    - **Kids**: Panjabi, Thobe, Waistcoats, T-shirts And Polos, Abaya, Tops And Girls T-shirts, Father And Son Collection
    - **Footwear**
    - **Accessories**

30. **SS26 Collection** (`/s/ss26-{id}`) shall contain sub-collections:
    - **Men**: Panjabi, Thobe And Waistcoats, Shirts, T-shirts And Polos, Trousers And Chinos
    - **Women**: Abaya, Tops
    - **Kids**: Panjabi, Thobe, T-shirts And Polos, Tops And Girls T-shirts
    - **Footwear**

31. All seasonal collection pages shall be independently manageable by marketing staff via CMS.
32. Seasonal collections shall have an **expiry / archive mechanism** so past seasons can be retired from the nav without deletion.
33. The seasonal collection system shall be **fully dynamic** — new seasons (e.g. Eid 2027) are created from the dashboard without code changes.

---

### 4.6 CottoCool Technology

34. CottoCool Technology shall have its own dedicated category page accessible from the main navigation bar.
35. Both URL prefixes (`/c/` and `/category/`) shall resolve to the same CottoCool page.
36. The page shall explain the CottoCool Technology fabric concept and benefits.
37. Products tagged as CottoCool shall display a **badge** on PLP cards and PDPs.
38. CottoCool shall function as a **cross-category filter** applicable to any garment type.

---

### 4.7 Product Listing Pages (PLP) — Full Taxonomy

All sub-categories and tiers below must be supported. Tiers are CRUD-manageable from the admin dashboard.

#### Men

| Sub-Category          | Tiers                                                    |
| --------------------- | -------------------------------------------------------- |
| Thobe                 | Premium, Luxury, Platinum, Sahara                        |
| Kabli                 | Premium, Platinum                                        |
| Panjabi               | Premium, Luxury, Platinum, Sahara, Ambassador, Legends   |
| Sherwani              | Luxury, Platinum, Sahara                                 |
| Waistcoats            | Luxury, Platinum, Sahara                                 |
| Shirts                | Premium, Luxury, Platinum, Exicutiv, Holiday Island, Max |
| T-shirts And Polos    | Premium, Luxury, Platinum                                |
| Jeans                 | Max                                                      |
| Jackets And Outerwear | _(no tiers)_                                             |
| Hoodies               | _(no tiers)_                                             |
| Sweatshirt            | Max                                                      |
| Joggers And L-Chinos  | Premium, Max                                             |
| Trousers And Chinos   | Premium, Luxury, Platinum, Max, Exicutiv                 |
| Essentials            | _(no tiers)_                                             |
| Innerwear             | _(no tiers)_                                             |

#### Women

| Sub-Category        | Tiers                                            |
| ------------------- | ------------------------------------------------ |
| Abaya               | Premium, Luxury, Platinum, Sahara, Benazir Esita |
| Tops                | Premium, Luxury, Platinum, Benazir Esita         |
| Co-Ords Dress Set   | Premium, Luxury, Platinum, Sahara                |
| Dress And Dress Set | Premium, Platinum, Sahara                        |
| Scarf               | Premium, Sahara                                  |
| Accessories         | _(bags sub-category)_                            |
| Bags                | Clutch, Handbags                                 |
| Trousers            | Premium, Platinum                                |

#### Kids — Boys

| Sub-Category               | Tiers        |
| -------------------------- | ------------ |
| Thobe                      | _(no tiers)_ |
| Dresses                    | _(no tiers)_ |
| Shirts                     | _(no tiers)_ |
| T-shirts And Polos         | _(no tiers)_ |
| Panjabi                    | _(no tiers)_ |
| Waistcoats                 | _(no tiers)_ |
| Panjabi With Waistcoat Set | _(no tiers)_ |
| Headband                   | _(no tiers)_ |

#### Kids — Girls

| Sub-Category | Tiers        |
| ------------ | ------------ |
| T-shirts     | _(no tiers)_ |
| Tops         | _(no tiers)_ |
| Abaya        | _(no tiers)_ |
| Dresses      | _(no tiers)_ |

#### Kids — Cross

| Sub-Category              | Tiers        |
| ------------------------- | ------------ |
| Father And Son Collection | _(no tiers)_ |

#### Footwear — Men

| Sub-Category | Tiers        |
| ------------ | ------------ |
| Sandals      | _(no tiers)_ |
| Loafers      | _(no tiers)_ |

#### Footwear — Women

| Sub-Category | Tiers        |
| ------------ | ------------ |
| Sneakers     | _(no tiers)_ |
| Sandals      | _(no tiers)_ |
| Loafers      | _(no tiers)_ |

#### Footwear — Girls

| Sub-Category | Tiers        |
| ------------ | ------------ |
| Sandals      | _(no tiers)_ |

#### Fragrance

| Sub-Category | Tiers      |
| ------------ | ---------- |
| Premium      | _(no sub)_ |
| Luxury       | _(no sub)_ |

#### Accessories

| Sub-Category      | Tiers        |
| ----------------- | ------------ |
| Handbag           | _(no tiers)_ |
| Rings             | _(no tiers)_ |
| Travel Prayer Mat | _(no tiers)_ |
| Belt              | _(no tiers)_ |
| Ghutra            | _(no tiers)_ |
| Bag               | _(no tiers)_ |
| Bed Sheet         | _(no tiers)_ |
| Button Set        | _(no tiers)_ |
| Wallet            | _(no tiers)_ |
| Prayer Cap        | _(no tiers)_ |
| Shemagh           | _(no tiers)_ |
| Headband          | _(no tiers)_ |

> **[CLIENT INPUT REQUIRED]** — Confirm NOOREMOON-specific product catalogue differences: any additions, removals, or renamed categories/tiers vs. the above.

#### PLP Display Requirements

39. Each PLP shall support grid layout with product cards showing: image, name, tier badge, price, CottoCool badge (if applicable), Add to Bag / Quick View.
40. PLPs shall support filters: Category, Sub-Category, Tier, Size, Colour, Price Range, CottoCool Technology (yes/no).
41. PLPs shall support sorting by: Newest, Price Low–High, Price High–Low, Popularity.
42. Applied filters shall appear as removable chips.
43. Out-of-stock items shall be shown with visual indication and a 'Notify Me' option.

---

### 4.8 Product Detail Page (PDP)

44. The PDP shall display: product name, image gallery with zoom, price (VAT included), tier/sub-brand label, size options, colour variants, CottoCool badge (if applicable), full description, care instructions.
45. A size guide link shall open the size guide modal or link to `/size-guide`.
46. An **'Add to Bag'** CTA shall be primary. If size/variant not selected, the system shall prompt the user before adding.
47. Delivery estimate and free-shipping threshold (free above USD 150) shall be displayed.
48. A related products horizontal carousel shall appear at the bottom.
49. The system shall display product tier clearly (e.g., 'Panjabi – Legends Tier').

---

### 4.9 Size Guide (`/size-guide`)

> ⚠️ **KNOWN ISSUE (P1):** On the reference site, `/size-guide` rendered blank ('Loading...'). CMS entry was missing. This must be populated before launch.

50. The size guide page shall display sizing charts for all relevant garment categories: Thobe, Panjabi, Kabli, Sherwani, Shirts, T-shirts, Trousers, Jeans, Waistcoats, Hoodies, Jackets, Abaya, Tops, Kids garments, and Footwear.
51. Size guide content shall be manageable through the CMS without developer involvement.
52. The size guide shall be accessible from: the `/size-guide` URL, from any PDP via a link/modal, and from the footer Information section.
53. Size charts shall include measurements in both **centimetres and inches**.
54. Users shall be able to select garment type (tab) and style fit (sub-tab) to see the relevant chart.

---

### 4.10 Search & Filtering

55. A global search bar shall be accessible from the header on all pages.
56. Real-time **as-you-type suggestions** shall appear after 2 or more characters.
57. Search shall query product names, category names, sub-category names, tier names, and tags.
58. Search results shall be displayed at `/search` in a filterable PLP layout.
59. Empty search results shall display a helpful 'no results found' message with suggestions.

---

### 4.11 Shopping Bag (`/shopping-bag`)

60. Authenticated and guest users shall be able to add products to the shopping bag.
61. Guest bag contents shall be stored in browser/local storage and merged into the authenticated user's bag upon login.
62. The bag page shall display: product image, name, tier, size, quantity (adjustable), unit price, line total, order subtotal, shipping cost (USD 25 or free above USD 150), and grand total.
63. A gift card redemption code field shall be available in the bag.
64. The bag icon in the header shall display a live item-count badge.
65. Users shall be able to remove items or update quantities.

---

### 4.12 Checkout & Payment (Stripe)

#### 4.12.1 Checkout Flow

66. Checkout steps: (1) Address Entry → (2) Shipping Confirmation → (3) Payment → (4) Order Review → (5) Confirmation.
67. The system shall process one shipping address per order. Customers who want multiple destinations must place separate orders.
68. Required address fields: Full Name, Address Line 1 & 2, City, State/Province, Postal Code, Country (dropdown), Phone Number.
69. A prominent **customs/import tax disclaimer** shall appear before order placement.

#### 4.12.2 Payment via Stripe

70. The sole payment method shall be Stripe, supporting major debit and credit cards (Visa, Mastercard, and other Stripe-supported methods).
71. **2FA (Two-Factor Authentication)** shall be enforced on all payments via Stripe.
72. Card data shall never be stored on NOOREMOON servers; all card/bank information is handled exclusively by Stripe.
73. No hidden charges: the checkout page shall display the exact amount to be charged including delivery and VAT.
74. Gift card balance shall be redeemable as full or partial payment at checkout.
75. On successful payment, an order confirmation page shall be displayed and a confirmation email sent.
76. If a card is declined, the system shall display a meaningful error and advise the customer to contact their bank.
77. If a technical issue causes a payment deduction without order confirmation, the system shall provide a mechanism for the customer to report the incident.

#### 4.12.3 Order Verification

78. The system may request identity verification (phone number, address, order ID) before accepting an order.
79. The system shall reserve the right to cancel orders suspected of fraudulent card use, auto-cancelling within 2 working days if verification questions are not answered.

---

### 4.13 Order Cancellation Policy

80. The customer may cancel their order **only when the Service Centre calls** to confirm the order and delivery address.
81. Once the customer reconfirms the order to the Service Centre associate, cancellation is no longer possible until the delivery agent arrives.
82. The system shall communicate this cancellation window clearly in the order confirmation email and in the order management UI.

---

### 4.14 Order Management & Tracking

#### 4.14.1 Customer-Facing

83. Authenticated customers shall access Order History at `/profile`, listing all orders with: Order ID, Date, Status, Total.
84. Order tracking shall be available using the Order ID from the Order History page.
85. Automated email notifications shall be sent at: Order Placed, Processing, Shipped (with tracking number), Out for Delivery, Delivered.
86. The system shall provide a mechanism to report missing items via `support@nooremoon.global` or social media.

#### 4.14.2 Authorised Receipt

87. A customer may designate an authorised representative to receive the order. The system shall provide a mechanism to notify the service team prior to delivery.

---

### 4.15 Shipping & Delivery

| Parameter               | Value                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Coverage                | All countries worldwide                                                                                                                         |
| Delivery Type           | Regular — Air Courier                                                                                                                           |
| Order Acceptance        | 24/7 — 00:00–23:59 hrs, 7 days                                                                                                                  |
| Shipping Charge         | USD 25 flat rate                                                                                                                                |
| Free Shipping Threshold | Orders above USD 150                                                                                                                            |
| Estimated Delivery Time | Minimum 7 days (varies by destination and courier policy)                                                                                       |
| Tracking                | Order History page using Order ID                                                                                                               |
| Closed-Box Delivery     | Products arrive in sealed packaging. Returns must be initiated through NOOREMOON service; customer cannot return to delivery agent on doorstep. |
| Restricted Destinations | Certain locations unavailable due to external risks. NOOREMOON reserves the right to decline such orders.                                       |
| Customs / Import Tax    | Solely the customer's responsibility. NOOREMOON bears no liability.                                                                             |
| Price Lock              | Price at order date is guaranteed until delivery. No adjustment if price drops.                                                                 |

> ⚠️ **KNOWN ISSUE (P1 — Policy Conflict):** Terms & Conditions state that if a product is 'not as described', the customer must immediately return it to the delivery assistant. This partially contradicts the Closed-Box Delivery policy. Client must resolve this before the exchange workflow is implemented.

---

### 4.16 Exchange & Return

#### 4.16.1 Eligibility Conditions

88. Exchange request must be submitted within **7 days** of receiving the delivery package.
89. The product must be unused, unworn, unwashed, unaltered, and without any flaws. Trying on for fit is permitted.
90. All original tags, receipts/invoices, packaging, and barcodes must be intact.
91. Each purchase is eligible for a **single exchange only**.
92. No exchange for items offered at **50% discount or higher**.
93. No exchange for items purchased during a **Flash Sale**.
94. For damaged or missing products, an **unboxing video** must be provided by the customer.
95. Exchange offer is void if money receipt / tags / barcodes are irreparably damaged.
96. If the original receipt is lost, the customer must provide the purchase contact number for history verification.

#### 4.16.2 Exchange Process

97. The customer shall initiate an exchange request from the Order History page.
98. The system shall validate all eligibility conditions and surface clear ineligibility reasons if conditions are not met.
99. Approved exchanges shall require the customer to return the product to the NOOREMOON service centre at Dhaka.
100.  The system shall route the exchange request to the Customer Service team for review and coordination.
101.  Contact for all exchange assistance: `support@nooremoon.global`.

---

### 4.17 Loyalty Programme (`/loyalty-program`)

> ⚠️ **KNOWN ISSUE (P1 — Content Gap):** This page must have CMS content published before launch.

102. Registered customers shall earn loyalty points on eligible purchases.
103. Loyalty point balance shall be visible on the customer profile and at checkout.
104. Points shall be redeemable against future purchases.
105. The system shall support tiered loyalty levels (tier names, thresholds, and earning/redemption rates — **[CLIENT INPUT REQUIRED]**).
106. Point expiry rules shall be configurable by admin.
107. The `/loyalty-program` page shall fully explain programme rules, tiers, earning rates, and redemption conditions.

---

### 4.18 Gift Cards (`/gift-card-policy`)

> ⚠️ **KNOWN ISSUE (P1 — Content Gap):** This page must have CMS content published before launch.

108. The system shall allow purchase of digital gift cards in configurable denominations (**[CLIENT INPUT REQUIRED]** — confirm denominations and expiry periods).
109. A unique, system-generated gift card code shall be emailed to the recipient.
110. Gift card codes shall be redeemable at checkout as full or partial payment.
111. Remaining balance after partial use shall be preserved.
112. The system shall reject expired or fully-redeemed gift card codes with a clear error.
113. Admin shall be able to issue, block, and check the balance of gift cards.

---

### 4.19 User Profile & Account (`/profile`)

114. The profile page shall allow users to update: Full Name, Phone Number, Email, Password, Profile Picture.
115. Users shall maintain a **saved address book** with a default address designation.
116. The profile shall show loyalty point balance, tier, and point history.
117. Users shall be able to view and manage wishlisted/saved items.
118. Account deletion shall require a confirmation step and display a data retention notice per the Privacy Policy.

---

### 4.20 Store Locations (`/store-locations`)

> ⚠️ **KNOWN ISSUE (P1 — Bug):** This page renders blank on the reference site. CMS data pipeline must be fixed and all store details populated before launch.

119. The page shall display all NOOREMOON physical retail outlet locations (**[CLIENT INPUT REQUIRED]** — provide all store addresses, names, and opening hours).
120. Each location shall show: Store Name, Full Address, Opening Hours, and a map embed or directions link.
121. The Dhaka service centre shall be visually highlighted as the exchange/return drop-off point.
122. Location data shall be manageable via the CMS.

---

### 4.21 CMS / Policy Content Pages

Content is editable by authorised staff without developer involvement.

| Page URL                 | Status        | Required Content                                                                      |
| ------------------------ | ------------- | ------------------------------------------------------------------------------------- |
| `/shipping-policy`       | Required      | Delivery table, closed-box policy, tracking info, customs disclaimer, contact         |
| `/exchange-return`       | Required      | Full exchange conditions, unboxing video requirement, contact, service centre address |
| `/payment-policy`        | Required      | Stripe gateway info, 2FA, no hidden charges, card decline process, support hours      |
| `/privacy-policy`        | Required      | PII collection, cookies, usage, sharing policy, modification rights                   |
| `/terms-conditions`      | Required      | Cancellation, pricing, order acceptance, user content, force majeure, liability       |
| `/size-guide`            | ⚠️ P1 Fix     | Size charts for all garment types (see 4.9)                                           |
| `/loyalty-program`       | ⚠️ P1 Content | Loyalty programme rules, tiers, earning/redemption rates                              |
| `/gift-card-policy`      | ⚠️ P1 Content | Gift card purchase, use, balance, expiry rules                                        |
| `/about-us`              | ⚠️ P1 Content | Brand story, values, design philosophy, BYSL Global context                           |
| `/store-locations`       | ⚠️ P1 Fix     | Physical store addresses, hours, map embeds                                           |
| `/intellectual-property` | Required      | Copyright, trademark, IP notices                                                      |

---

### 4.22 About Us (`/about-us`)

123. The page shall describe the NOOREMOON brand story, design philosophy (minimalistic, abstract, multi-layered refinement), and the brand's position as a high-end global lifestyle retailer.
124. The page shall reference the BYSL Global parent company context where appropriate.

---

### 4.23 Contact Us (`/contact-us`) & Live Chat

125. The Contact Us page shall display: support email (`support@nooremoon.global`), social media links (Facebook, Instagram), support operating hours (8:00 AM – 8:00 PM, UTC+4, every day).
126. A **live chat widget** shall be integrated into the platform, accessible from all pages, especially the Shipping Policy and support pages.
127. Social media links shall open Facebook and Instagram pages in a new tab.

---

### 4.24 Intellectual Property (`/intellectual-property`)

128. The page shall display all copyright, trademark, and intellectual property notices.
129. NOOREMOON shall retain all rights to site content, brand assets, and product imagery.
130. User-generated content posted on the platform grants NOOREMOON a non-exclusive, irrevocable, global licence to use, reproduce, distribute, and publish that content.

---

### 4.25 Admin Panel

#### 4.25.1 Product & Catalogue Management

131. Admin shall create, edit, and archive products with all attributes: name, category, sub-category, tier, size variants, colour, price, CottoCool flag, images, description.
132. Admin shall manage all three taxonomy levels: Category, Sub-Category, Tier — full CRUD.
133. Admin shall manage seasonal collection overlays (Eid, SS26, future seasons) independently of core categories.
134. Bulk **CSV import/export** of product data shall be supported.
135. Inventory levels per SKU shall be manageable with **low-stock alerts**.

#### 4.25.2 CMS Content Management

136. Admin shall publish, edit, and unpublish all CMS-driven pages (About Us, Size Guide, Loyalty Program, Gift Card Policy, Store Locations, etc.) without developer involvement.
137. Hero banners and promotional images for Category and Sub-Category pages shall be uploadable by marketing staff.

#### 4.25.3 Order & Customer Management

138. Admin shall view, search, filter, and update all orders and customer accounts.
139. Admin shall trigger Service Centre reconfirmation calls and log outcomes.
140. Admin shall process exchange requests, log resolutions, and update order status accordingly.
141. Admin shall generate invoices and packing lists.

#### 4.25.4 Promotions & Flash Sales

142. Admin shall create discount rules: percentage or flat, with conditions (min order value, category, specific SKUs).
143. Admin shall create timed **Flash Sale events** with configurable start and end timestamps.
144. The system shall automatically enforce exchange ineligibility for Flash Sale and 50%+ discount items.

#### 4.25.5 Reporting

145. Dashboards for: Daily/Weekly/Monthly Sales, Top Products, Revenue by Category, Order Status Distribution, Customer Acquisition, Loyalty Points Issued/Redeemed.
146. All reports shall be exportable to CSV/Excel.

---

### 4.26 Mobile Applications (PWA)

147. iOS and Android apps shall provide full feature parity with the web platform.
148. Push notifications: order status updates, promotions, loyalty milestones.
149. Biometric authentication: Face ID and Fingerprint login.
150. Deep linking: marketing campaigns shall be able to link directly to specific products or categories.

> **[CLIENT INPUT REQUIRED]** — Confirm whether Waqt Al Salaah and Memorize Quran Islamic apps are bundled in the main NOOREMOON app or are separate apps.

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric                           | Target                                                         |
| -------------------------------- | -------------------------------------------------------------- |
| Home / Category Page Load        | < 2.0 s on 4G mobile                                           |
| PDP Load                         | < 2.5 s                                                        |
| Checkout Page Load               | < 1.5 s                                                        |
| Search Suggestions (as-you-type) | < 500 ms                                                       |
| API Response (95th percentile)   | < 300 ms under normal load                                     |
| Concurrent Users (normal)        | 5,000 concurrent sessions                                      |
| Peak Load (Eid / Sale events)    | 3× normal traffic — auto-scale                                 |
| Image Delivery                   | WebP via CloudFront CDN with appropriate cache-control headers |
| Core Web Vitals                  | LCP < 2.5 s, CLS < 0.1, FID < 100 ms                           |

### 5.2 Security

- All traffic via HTTPS, TLS 1.2 or higher.
- Payment via Stripe (PCI-DSS Level 1 certified). No card data stored on NOOREMOON servers.
- 2FA enforced on all Stripe payment transactions.
- Passwords hashed using **bcrypt** (cost ≥ 12) or **Argon2**.
- CSRF tokens on all state-changing endpoints.
- SQL injection and XSS protections via parameterised queries and output encoding.
- Admin panel requires **MFA**.
- Web Application Firewall (WAF) deployed in front of the application.
- Security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options.

### 5.3 Privacy & Data

- Personal data handling per NOOREMOON Privacy Policy and applicable GDPR / local data protection laws.
- NOOREMOON shall never sell, trade, or rent user PII to any third party.
- Aggregated, non-personally identifiable demographic data may be shared with business partners.
- Third-party services (Stripe, logistics, newsletter) may receive user data only as necessary to operate the service, and only with user consent.
- Users may opt out of marketing emails at any time.

### 5.4 Scalability

- Horizontally scalable backend via container orchestration (Docker + orchestrator TBD).
- Database read replicas for product browsing workloads.
- Auto-scaling policies triggered by CPU/memory thresholds.

### 5.5 Usability & Accessibility

- WCAG 2.1 Level AA compliance.
- RTL text direction support for Arabic language.
- Touch targets: minimum 44 × 44 px on mobile.
- Core journey (browse → cart → checkout) completable in ≤ 5 steps.
- Error messages descriptive and actionable.

### 5.6 Availability & Reliability

| SLA Attribute                  | Target                                 |
| ------------------------------ | -------------------------------------- |
| Monthly Uptime                 | 99.9% (excl. scheduled maintenance)    |
| Maintenance Window             | ≤ 2 hrs/week, 02:00–04:00 UTC          |
| RTO (Recovery Time Objective)  | < 1 hour for critical failures         |
| RPO (Recovery Point Objective) | < 15 minutes (DB backups every 15 min) |
| Monitoring                     | Real-time with automated alerting      |

### 5.7 Internationalisation

- Default language: English. Architecture shall support additional language packs without code changes.
- RTL layout support required for Arabic.
- Currency: USD primary. Multi-currency with configurable exchange rates shall be supported.
- Date/time display shall adapt to user locale.
- Islamic Apps shall support Arabic, English, and optionally Bangla.

---

## 6. External Interface Requirements

### 6.1 Brand & UI

All UIs shall comply with the NOOREMOON brand identity: minimalistic design, clean typography, premium imagery, dark navy (`#1F4E79`) palette on white (or client-specified palette). Seasonal banners and hero imagery shall be supplied by the client via the CMS.

### 6.2 Third-Party Integrations

| System                        | Interface         | Purpose                                                                 |
| ----------------------------- | ----------------- | ----------------------------------------------------------------------- |
| Stripe                        | REST API (HTTPS)  | Payment processing — 2FA enforced, no card data stored                  |
| Courier / Logistics API       | REST API          | Shipment booking and real-time tracking updates                         |
| VPS + CloudFront              | SDK / CDN         | Product images and static assets                                        |
| SendGrid / Email Service      | REST API / SMTP   | Transactional emails: order confirmation, shipping, OTP, password reset |
| SYSSMS Gateway                | REST API          | OTP delivery, delivery notifications                                    |
| Google Maps API               | REST API / JS SDK | Store Locator map embeds                                                |
| Social Auth (Google/Facebook) | OAuth 2.0         | Optional social login                                                   |
| Islamic Prayer Time API       | REST API          | Prayer time calculations for Waqt Al Salaah app                         |
| Quran Text / Audio API        | REST API          | Quran content and recitation audio for Memorize Quran app               |
| Analytics (GA4 / Mixpanel)    | JS SDK            | User behaviour, conversion tracking, admin reporting                    |
| Live Chat Widget              | JS SDK            | Customer support live chat on all pages                                 |
| RabbitMQ                      | AMQP              | Async message bus for order events, notifications                       |

### 6.3 Communication Interfaces

- All client-server communication over HTTPS (TLS 1.2+).
- Mobile apps via RESTful JSON APIs.
- Webhook endpoints for Stripe payment callbacks.
- WebSocket for live chat.

---

## 7. Known Issues & Data Gaps

The following issues must be resolved before launch or treated as P1 hotfixes.

| #   | Page / Area                       | Issue                                                                                               | Severity   | Action Required                                                           |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| 1   | `/size-guide`                     | Page renders blank — CMS content missing                                                            | P1 Bug     | Fix CMS data pipeline; populate all size chart content                    |
| 2   | `/loyalty-program`                | Shows 'Data not found' — no CMS content published                                                   | P1 Content | Client to provide loyalty programme details; dev to publish               |
| 3   | `/gift-card-policy`               | Shows 'Data not found' — no CMS content published                                                   | P1 Content | Client to provide gift card policy; dev to publish                        |
| 4   | `/about-us`                       | Shows 'Data not found' — no CMS content published                                                   | P1 Content | Client to provide brand story / About Us copy; dev to publish             |
| 5   | `/store-locations`                | Page renders blank                                                                                  | P1 Bug     | Fix CMS data pipeline; client to provide all store details                |
| 6   | Navigation inconsistency          | Some pages show seasonal nav items; others don't                                                    | P2 Bug     | Standardise nav across all page templates                                 |
| 7   | Closed-box vs T&C policy conflict | Shipping Policy says no doorstep returns; T&C allows return to delivery agent if 'not as described' | P1 Policy  | Client to clarify; single consistent policy to be enforced                |
| 8   | CottoCool URL duality             | Both `/c/` and `/category/` routes must work                                                        | P2         | Ensure both routes are mapped in router config                            |
| 9   | SEO meta tags                     | Most pages have blank meta-description, og:title, og:description                                    | P2         | Populate all meta fields via CMS before launch                            |
| 10  | Cancellation flow                 | No UI mechanism to facilitate the Service Centre reconfirmation call cancellation window            | P2         | Add 'Cancel Order' button in Order History active only pre-reconfirmation |

---

## 8. System Constraints & Assumptions

### 8.1 Legal & Regulatory

- PCI-DSS compliance required — handled via Stripe.
- GDPR and applicable local data protection laws for all markets.
- Custom/import tax disclaimer must appear in checkout flow.
- Intellectual property notices must be surfaced on the dedicated IP page.

### 8.2 Business Constraints

- Exchange rules (7 days, single exchange, no exchange on 50%+ discount or Flash Sale) must be **enforced by the system** — not just stated as policy text.
- Closed-box delivery must be consistently communicated across all relevant pages.
- Seasonal collection pages must be independently manageable by marketing without engineering.
- Stripe is the confirmed payment provider; no alternative gateway is required at this stage.

### 8.3 Assumptions

- NOOREMOON will supply brand assets, product photography, and all copywriting before UI development begins.
- The client will provide all store location details (addresses, hours) before the `/store-locations` page can be populated.
- Loyalty programme tier thresholds, earning rates, and redemption rules will be confirmed by the client in Sprint 2.
- Gift card denominations and expiry periods will be confirmed by the client in Sprint 2.
- Stripe integration credentials will be provided before the payment integration sprint.
- Logistics / courier API provider and credentials will be confirmed before the shipping integration sprint.
- The 'not as described' vs closed-box policy conflict (Issue #7) will be resolved by the client before the exchange workflow is implemented.
- Which headless CMS is preferred (Contentful, Strapi, custom) will be decided by Tech Lead in Sprint 1.

---

## 9. Glossary

| Term                      | Definition                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Abaya                     | Full-length modest robe worn by Muslim women                                                                                |
| Benazir Esita             | NOOREMOON women's premium sub-brand                                                                                         |
| Closed-Box Delivery       | NOOREMOON policy: products arrive in sealed packaging; no doorstep returns to delivery agent                                |
| CottoCool                 | NOOREMOON proprietary heat-management, breathable fabric technology                                                         |
| Eid Collection            | Seasonal collection for Eid; top-level navigation category                                                                  |
| Father And Son Collection | Cross-gender kids + men matching-outfit collection                                                                          |
| Flash Sale                | Time-limited promotional event; items sold during it are ineligible for exchange                                            |
| Ghutra                    | Traditional Gulf Arab white cotton headdress                                                                                |
| Joggers And L-Chinos      | Men's casual trouser sub-category                                                                                           |
| Kabli                     | Traditional South Asian men's two-piece garment (kurta + shalwar)                                                           |
| Panjabi                   | Traditional South Asian men's upper garment (Kurta)                                                                         |
| Shemagh                   | Red-and-white patterned traditional Arab headdress                                                                          |
| Sherwani                  | Long formal coat for South Asian men, worn at weddings and formal occasions                                                 |
| SS26                      | Spring/Summer 2026 seasonal collection                                                                                      |
| Stripe                    | Confirmed payment gateway; PCI-DSS compliant                                                                                |
| Thobe                     | Ankle-length robe worn by men in Gulf Arab countries                                                                        |
| Tier / Sub-brand          | Quality/price segment: Premium, Luxury, Platinum, Sahara, Ambassador, Legends, Exicutiv, Max, Holiday Island, Benazir Esita |
| UTC+4                     | Service centre operating timezone (Dhaka / Dubai)                                                                           |
| VAT                       | Value Added Tax — included in all listed prices unless stated otherwise                                                     |
| Waistcoat                 | Sleeveless formal jacket worn over kurta/panjabi or shirt                                                                   |
| Waqt Al Salaah            | Arabic for 'Prayer Time'; Islamic prayer times companion app                                                                |

---

## 10. Appendices

### Appendix A — Requirement Traceability Matrix (Starter)

| Req. ID | Section | Summary                                          | Test Case ID | Status  |
| ------- | ------- | ------------------------------------------------ | ------------ | ------- |
| FR-001  | 4.1.1   | User registration via email                      | TC-001       | Pending |
| FR-002  | 4.1.2   | Login with email/password                        | TC-002       | Pending |
| FR-003  | 4.12    | Stripe payment with 2FA                          | TC-003       | Pending |
| FR-004  | 4.3     | Men category landing page — New Arrivals section | TC-004       | Pending |
| FR-005  | 4.4     | Panjabi sub-category page — tier tabs            | TC-005       | Pending |
| FR-006  | 4.5     | Eid Collection sub-nav                           | TC-006       | Pending |
| FR-007  | 4.9     | Size guide content renders correctly             | TC-007       | Pending |
| FR-008  | 4.12    | Checkout customs disclaimer displayed            | TC-008       | Pending |
| FR-009  | 4.13    | Cancellation blocked post-reconfirmation         | TC-009       | Pending |
| FR-010  | 4.15    | Free shipping applied for orders > USD 150       | TC-010       | Pending |
| FR-011  | 4.16    | Exchange blocked for Flash Sale item             | TC-011       | Pending |
| FR-012  | 4.16    | Exchange blocked for 50%+ discount item          | TC-012       | Pending |
| FR-013  | 4.17    | Loyalty points earned on purchase                | TC-013       | Pending |
| FR-014  | 4.18    | Gift card redeemed at checkout                   | TC-014       | Pending |
| FR-015  | 4.6     | CottoCool badge displayed on PLP card            | TC-015       | Pending |

### Appendix B — Out-of-Scope Items (v1 Launch)

- POS integration for physical stores
- Virtual try-on / AR fitting room
- Subscription box / membership model
- Third-party marketplace seller accounts
- AI-powered personalised recommendation engine
- Full automated GDPR right-to-erasure workflow (manual process acceptable in v1)

### Appendix C — Open Questions Tracker

| #   | Question                                                                                   | Owner     | Target Sprint |
| --- | ------------------------------------------------------------------------------------------ | --------- | ------------- |
| 1   | Loyalty tier names, thresholds, and earning/redemption rates?                              | Client    | Sprint 2      |
| 2   | Gift card denominations and expiry periods?                                                | Client    | Sprint 2      |
| 3   | Is Arabic (RTL) language localisation in scope for v1?                                     | Client    | Sprint 1      |
| 4   | Which logistics / courier partner(s) will be integrated?                                   | Client    | Sprint 1      |
| 5   | Confirm final policy on 'not as described' doorstep return vs. closed-box (Issue #7)?      | Client    | Sprint 1      |
| 6   | All physical store addresses, names, and opening hours for `/store-locations`?             | Client    | Sprint 2      |
| 7   | Is COD (Cash on Delivery) planned for any markets?                                         | Client    | Sprint 1      |
| 8   | Which headless CMS is preferred (Contentful, Strapi, custom)?                              | Tech Lead | Sprint 1      |
| 9   | What are the Islamic Apps' target app stores (iOS App Store, Google Play)?                 | Client    | Sprint 1      |
| 10  | Should Waqt Al Salaah and Memorize Quran be bundled in the main NOOREMOON app or separate? | Client    | Sprint 1      |
| 11  | Will there be a dedicated Bangla language option?                                          | Client    | Sprint 2      |
| 12  | Confirm seasonal collection archive schedule for Eid post-season.                          | Client    | Sprint 1      |
| 13  | Confirm NOOREMOON-specific product catalogue differences from ilyn.global taxonomy.        | Client    | Sprint 1      |
| 14  | Confirm any additional features planned beyond ilyn.global baseline.                       | Client    | Sprint 1      |
| 15  | Confirm brand colour palette (confirm/replace dark navy #1F4E79).                          | Client    | Sprint 1      |

---

_— End of Document — NOOREMOON SRS v1.0 — June 2026 —_
