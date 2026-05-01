<div align="center">

# 🕶️ Voyar — Premium Eyewear E‑Commerce Platform

**A production‑grade, full‑stack eyewear commerce platform engineered for performance, security, and scale.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2451?logo=razorpay&logoColor=white)](https://razorpay.com)
[![Shiprocket](https://img.shields.io/badge/Logistics-Shiprocket-EE3124)](https://www.shiprocket.in)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](#-license)

[**Live Site**](https://voyareyewear.com) · [**Frontend Docs**](./frontend/README.md) · [**Backend Docs**](./backend/README.md) · [**Shiprocket Architecture**](./SHIPROCKET_ARCHITECTURE.md)

</div>

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Engineering Challenges & Solutions](#-engineering-challenges--solutions)
4. [Technology Stack](#-technology-stack)
5. [High‑Level Design (HLD)](#-high-level-design-hld)
6. [Low‑Level Design (LLD)](#-low-level-design-lld)
7. [Frontend Architecture](#-frontend-architecture)
8. [Backend Architecture](#-backend-architecture)
9. [Data Models](#-data-models)
10. [API Surface](#-api-surface)
11. [Security Architecture](#-security-architecture)
12. [Third‑Party Integrations](#-third-party-integrations)
13. [Project Structure](#-project-structure)
14. [Getting Started](#-getting-started)
15. [Environment Variables](#-environment-variables)
16. [Deployment](#-deployment)
17. [Contributing](#-contributing)
18. [License](#-license)

---

## 🌐 Overview

**Voyar** is a full‑featured, modern e‑commerce platform purpose‑built for premium eyewear retail. It pairs an Apple‑inspired, motion‑rich storefront with a hardened, OWASP‑compliant API server that handles the entire commerce lifecycle — from product discovery and virtual try‑on, through secure checkout and payment, to fulfillment, tracking, refunds, and post‑purchase support.

The platform is structured as a **decoupled two‑tier monorepo**:

| Tier         | Stack                                                                                 | Purpose                                                                                   |
| ------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Frontend** | React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui · GSAP · Framer Motion · Lenis | Customer storefront, admin dashboard, immersive UX                                        |
| **Backend**  | Node.js · Express 5 (ESM) · MongoDB · Mongoose 9 · JWT · Razorpay · Shiprocket         | RESTful API, auth, payments, order fulfillment, transactional email, webhook orchestration |

> **Design philosophy:** Performance‑first, secure‑by‑default, polished by motion — engineered with the rigor expected of a large‑company production system.

---

## ✨ Key Features

### 🛍️ Storefront
- Cinematic landing experience with **GSAP ScrollTrigger**, **Framer Motion**, and **Lenis** smooth scrolling
- Product catalog with **color variants**, multi‑image galleries, lens selectors, and bento‑grid showcases
- **Virtual try‑on** module, mood/look curation, and "shop by gender" navigation
- Live **shipment tracker** and Razorpay‑style **payment timeline** UI
- Customer reviews with verified‑purchase badges and helpful votes
- Light / dark **theme toggle** with persisted preference
- Fully **responsive** across mobile, tablet, and desktop

### 🔐 Authentication & Identity
- JWT‑based authentication for both **users** and **admins**
- **Email verification** flow with one‑time tokens
- **Two‑Factor Authentication (2FA)** via email OTP
- Secure **password reset** with cryptographic tokens
- **OWASP‑compliant** password strength validation
- **Account lockout** after 5 failed attempts
- **Password history** (prevents reuse of last 5 passwords)
- Multiple saved addresses, server‑synced **cart** and **wishlist**

### 💳 Payments
- **Razorpay** integration (live keys) with cryptographic signature verification
- **Online payments** + **Cash on Delivery (COD)** flows
- **Webhook‑driven** asynchronous payment event handling
- Full **refund lifecycle** (initiate → track → complete)
- **Payment timeline** modeled after Razorpay dashboard
- Time‑boxed payment tokens (30‑minute expiry)

### 📦 Shipping & Fulfillment
- **Shiprocket API v2** integration for end‑to‑end logistics
- Pincode‑based **courier serviceability** check
- Automated **AWB assignment**, label & invoice generation
- **Pickup location** management (create, sync, select)
- **Webhook‑based real‑time shipment status** updates
- Bulk tracking and quick‑ship utilities

### 🛡️ Admin Dashboard
- Product CRUD with rich variant management
- Order pipeline (confirm → process → ship → deliver)
- User and admin management
- Site settings (singleton config)
- Analytics dashboards powered by **Recharts**
- Review moderation (approve / reject)

---

## 🧩 Engineering Challenges & Solutions

A non‑exhaustive look at the technical problems we solved and how.

| #  | Challenge                                                        | Why it was hard                                                                                                                | Solution                                                                                                                                                                                                                                |
| -- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | **Buttery 60 fps storefront with heavy media**                   | Hero animations, parallax, and scroll‑linked transitions are CPU/GPU heavy on mid‑tier devices.                                | **GSAP ScrollTrigger** + **Framer Motion** for GPU‑accelerated transforms, **Lenis** for inertia scrolling, code‑split routes via Vite, and lazy‑loaded media in the `BentoGrid` and `Hero` components.                                 |
| 2  | **Atomic, race‑free order placement**                            | Concurrent buyers can race to claim the last unit of a SKU; a naive flow oversells stock.                                      | Order creation runs inside a **stock‑decrement guard** in `orderController` using Mongoose conditional updates, so stock is reserved only on a successful, validated order — and reverted on payment failure or cancellation.            |
| 3  | **Verifiable online payments**                                   | Client‑side payment confirmations are forgeable; a malicious client could mark unpaid orders as paid.                          | **Server‑side Razorpay signature verification** in `paymentController` using HMAC‑SHA256 with the secret key, plus an idempotent **webhook** path that is the source of truth for terminal payment state.                                |
| 4  | **Real‑time shipment tracking without polling**                  | Polling Shiprocket per order does not scale and burns API quota.                                                               | **Webhook‑first architecture**: Shiprocket pushes status updates to `/api/shipping-webhook/webhook`, validated via `x-api-key`, sanitized, and persisted to the order's tracking timeline (see `SHIPROCKET_ARCHITECTURE.md`).            |
| 5  | **OWASP Top‑10 hardening on a public API**                       | E‑commerce APIs are routinely scanned for injection, XSS, brute‑force, and DoS.                                                | Layered defense: **Helmet** headers, **CORS** allow‑list, **express‑rate‑limit** (per‑route tiers), **express‑validator**, **xss‑filters**, **mongo‑sanitize**, 10 KB body cap, mass‑assignment protection via `allowedFields`.          |
| 6  | **Credential‑stuffing & brute‑force on auth**                    | Attackers automate login attempts against leaked credentials.                                                                  | **Account lockout** after 5 failed logins, dedicated `authLimiter` rate limit, **2FA via email OTP**, OWASP password strength rules, and **password history** to block reuse.                                                            |
| 7  | **Reliable transactional email at scale**                        | SMTP failures or template drift can silently break verification, OTP, and receipts.                                            | Centralized **Nodemailer** transporter in `config/email.js` with reusable HTML templates for verification, OTP, password reset, order confirmation, and admin notifications.                                                              |
| 8  | **Mass‑assignment via JSON bodies**                              | Mongoose models with broad schemas allow privilege escalation through unexpected fields (`role`, `isAdmin`, `wallet`, etc.).   | A custom `allowedFields` middleware whitelists writable fields per route, stripping unknown keys before they reach controllers or models.                                                                                                |
| 9  | **NoSQL injection through query operators**                      | A `$where`, `$ne`, or nested operator in `req.body` can bypass auth or leak data.                                              | Global **`mongo-sanitize`** middleware and explicit query construction in controllers — never spreading raw client input into Mongoose queries.                                                                                          |
| 10 | **Cross‑origin requests from multiple deployments**              | Storefront, admin, and webhook callers live on different origins (Vercel, custom domain, ngrok, Drive previews).               | Allow‑list‑driven `cors()` configuration with origin callback, plus `app.set("trust proxy", 1)` for accurate client IPs behind Vercel.                                                                                                  |
| 11 | **Type safety across a large React 19 codebase**                 | Untyped React components with rich domain data (orders, payments, shipments) drift quickly.                                    | **TypeScript strict mode** via `tsconfig.app.json`, shared `src/types/`, ESLint with `typescript-eslint`, and `react-hooks` / `react-refresh` plugins.                                                                                  |
| 12 | **Consistent design system with shadcn/ui + Tailwind**           | Ad‑hoc styling diverges across pages; pure utilities lose semantic meaning.                                                    | **shadcn/ui** primitives (Radix Slot/Icons, CVA variants) composed with `clsx` + `tailwind-merge`, themed via Tailwind config and CSS variables for light/dark.                                                                          |
| 13 | **Refunds and partial state**                                    | Refunds are inherently asynchronous and partial; UIs that only show "paid/refunded" hide reality.                              | A **payment timeline** model on `Order` records every state transition (authorized, captured, refund initiated, refund processed) and is rendered by the `PaymentTimeline.tsx` component.                                                |
| 14 | **Webhook reliability & idempotency**                            | Both Razorpay and Shiprocket may retry deliveries; double‑processing corrupts state.                                           | Idempotent webhook handlers keyed on event/payment IDs, signature/`x-api-key` verification, and sanitized request logging that never echoes secrets.                                                                                    |
| 15 | **Single source of truth for product variants**                  | Eyewear has color variants × lens types × specs × multiple images — a flat schema explodes.                                    | A nested `Product` schema with `colorVariants[]`, per‑variant images, and `specifications` keeps queries simple while supporting rich rendering on the storefront.                                                                       |

---

## 🛠️ Technology Stack

### Frontend

| Layer            | Technology                                                                              |
| ---------------- | --------------------------------------------------------------------------------------- |
| Language         | **TypeScript 5.9**                                                                      |
| Framework        | **React 19**                                                                            |
| Build Tool       | **Vite 7**                                                                              |
| Routing          | **React Router DOM 7**                                                                  |
| Styling          | **Tailwind CSS 3.4**, `tailwindcss-animate`, `tailwind-merge`, `clsx`                   |
| UI Primitives    | **shadcn/ui** (Radix Slot, Radix Icons), `class-variance-authority`, **Lucide React**   |
| Animation        | **GSAP** (+ ScrollTrigger), **Framer Motion**, **Lenis** smooth scroll                  |
| Charts           | **Recharts**                                                                            |
| Linting          | ESLint 9, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`|
| Deployment       | **Vercel** (`vercel.json`)                                                              |

### Backend

| Layer            | Technology                                                                              |
| ---------------- | --------------------------------------------------------------------------------------- |
| Runtime          | **Node.js 18+** (ES Modules)                                                            |
| Framework        | **Express.js v5**                                                                       |
| Database         | **MongoDB Atlas** with **Mongoose 9** ODM                                               |
| Authentication   | **jsonwebtoken**, **bcryptjs**                                                          |
| Validation       | **express‑validator**, **validator.js**                                                 |
| Security         | **helmet**, **cors**, **express‑rate‑limit**, **xss‑filters**, **mongo‑sanitize**       |
| Payments         | **Razorpay** SDK                                                                        |
| Shipping         | **Shiprocket API v2**                                                                   |
| Email            | **Nodemailer** (Gmail SMTP)                                                             |
| Dev Tools        | **nodemon**                                                                             |

---

## 🏛️ High‑Level Design (HLD)

The platform is a classic **three‑tier architecture** (Client → API → Data) with two synchronous third‑party integrations (Razorpay, Shiprocket) and one asynchronous channel (SMTP), all glued together by a **webhook bus** for eventual consistency.

```
                    ┌────────────────────────────────────────────────────────────┐
                    │                          USERS                             │
                    │   Customers (Web)         Admins (Web)        Couriers     │
                    └──────────┬───────────────────┬────────────────────┬────────┘
                               │                   │                    │
                               ▼                   ▼                    │
                    ┌──────────────────────────────────────┐            │
                    │       FRONTEND  (Vercel Edge)        │            │
                    │  React 19 · Vite · TS · Tailwind     │            │
                    │  shadcn/ui · GSAP · Framer · Lenis   │            │
                    │  Pages: Home, Collections, Product,  │            │
                    │  Cart, Checkout, Orders, Profile,    │            │
                    │  Admin Dashboard, Auth flows         │            │
                    └───────────────────┬──────────────────┘            │
                                        │ HTTPS / JSON                  │
                                        │ JWT in Authorization header   │
                                        ▼                               │
        ┌──────────────────────────────────────────────────────────────┐│
        │                  BACKEND API  (Express 5)                    ││
        │                                                              ││
        │  ┌────────────────────────────────────────────────────────┐ ││
        │  │  SECURITY EDGE                                         │ ││
        │  │  Helmet → CORS allow‑list → Body size cap → Trust Proxy│ ││
        │  │  → Sanitization (mongo‑sanitize, xss‑filters)          │ ││
        │  │  → Rate limiters (standard / auth / payment / email)   │ ││
        │  └────────────────────────────────────────────────────────┘ ││
        │  ┌────────────────────────────────────────────────────────┐ ││
        │  │  ROUTING LAYER                                         │ ││
        │  │  /api/products  /api/orders  /api/users  /api/admin    │ ││
        │  │  /api/payment   /api/reviews /api/shiprocket           │ ││
        │  │  /api/shipping-webhook                                 │ ││
        │  └────────────────────────────────────────────────────────┘ ││
        │  ┌────────────────────────────────────────────────────────┐ ││
        │  │  CONTROLLER LAYER  (business logic, orchestration)     │ ││
        │  └────────────────────────────────────────────────────────┘ ││
        │  ┌────────────────────────────────────────────────────────┐ ││
        │  │  MODEL LAYER  (Mongoose schemas + validators)          │ ││
        │  └────────────────────────────────────────────────────────┘ ││
        └────────┬───────────────┬──────────────┬──────────────┬─────┘│
                 │               │              │              │      │
                 ▼               ▼              ▼              ▼      │
         ┌─────────────┐  ┌────────────┐  ┌────────────┐ ┌──────────┐│
         │  MongoDB    │  │  Razorpay  │  │ Shiprocket │ │  Gmail   ││
         │  Atlas      │  │  Gateway   │  │  Logistics │ │  SMTP    ││
         └─────────────┘  └─────┬──────┘  └─────┬──────┘ └──────────┘│
                                │                │                    │
                                │ webhooks       │ webhooks (status)  │
                                └────────┬───────┴────────────────────┘
                                         ▼
                                  /api/...-webhook
                                  (idempotent handlers)
```

### Request Lifecycle (happy path)

1. **Browser** loads the React bundle from Vercel's edge.
2. **User action** (e.g., place order) triggers a fetch to the backend with the JWT in `Authorization: Bearer <token>`.
3. Request passes through the **security edge**: Helmet headers → CORS check → sanitization → rate limiter.
4. Router dispatches to the appropriate **controller**, which validates input and runs business logic.
5. **Mongoose models** persist or read state from MongoDB Atlas.
6. For payments: a **Razorpay order** is created server‑side; the client opens Razorpay Checkout; the server later **verifies the signature** and reconciles via webhook.
7. For shipping: a **Shiprocket shipment** is created; status updates flow back via **webhook** rather than polling.
8. **Email side‑effects** (verification, OTP, receipts) are dispatched through Nodemailer.
9. JSON response is returned to the React client; UI updates state and animates the transition.

---

## 🔬 Low‑Level Design (LLD)

### 1. Layered Module Diagram (Backend)

```
┌─────────────────────────────────────────────────────────────────┐
│                          server.js                              │
│  - dotenv.config()                                              │
│  - validateEnvironment()                                        │
│  - connectDB()                                                  │
│  - app.use(helmet, cors, json, sanitizers, rateLimiters)        │
│  - app.use("/api/...", routeModules)                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
        ┌──────────────────────┼─────────────────────────┐
        ▼                      ▼                         ▼
  ┌──────────┐          ┌─────────────┐           ┌──────────────┐
  │ routes/  │          │ middleware/ │           │   config/    │
  │ *Routes  │──uses───▶│  auth.js    │           │  db.js       │
  │          │          │  validation │           │  email.js    │
  │          │          │  rateLimiter│           │  security.js │
  └────┬─────┘          └─────────────┘           │  shiprocket  │
       │                                          └──────────────┘
       ▼
  ┌──────────────┐       ┌─────────────┐       ┌────────────────┐
  │ controllers/ │──uses▶│   models/   │──uses▶│   MongoDB      │
  │  *Controller │       │  Mongoose   │       │   (Atlas)      │
  └──────┬───────┘       └─────────────┘       └────────────────┘
         │
         ├──▶ Razorpay SDK ──▶ Razorpay API
         ├──▶ shiprocket.js ──▶ Shiprocket REST
         └──▶ email.js (Nodemailer) ──▶ Gmail SMTP
```

### 2. Order + Payment Sequence (Online)

```
User      Frontend         Backend           Razorpay        MongoDB        Shiprocket
 │            │                │                 │               │              │
 │  Checkout  │                │                 │               │              │
 │───────────▶│                │                 │               │              │
 │            │ POST /api/orders                  │              │              │
 │            │───────────────▶│                  │              │              │
 │            │                │ validate + reserve stock        │              │
 │            │                │────────────────────────────────▶│              │
 │            │                │ create Razorpay order           │              │
 │            │                │────────────────▶│                              │
 │            │                │   { orderId }   │                              │
 │            │                │◀────────────────│                              │
 │            │   { rzpOrder } │                                                │
 │            │◀───────────────│                                                │
 │  Razorpay Checkout opens    │                                                │
 │◀───────────│                                                                 │
 │  Pays      │                                                                 │
 │───────────▶│                                                                 │
 │            │ POST /api/payment/verify (orderId, paymentId, signature)        │
 │            │───────────────▶│                                                │
 │            │                │ HMAC verify signature                          │
 │            │                │ mark order PAID, push to timeline              │
 │            │                │────────────────────────────────▶│              │
 │            │                │ create Shiprocket shipment                     │
 │            │                │───────────────────────────────────────────────▶│
 │            │                │   { awb, label, invoice }                      │
 │            │                │◀───────────────────────────────────────────────│
 │            │   { success }  │                                                │
 │            │◀───────────────│                                                │
 │  Order page│                                                                 │
 │            │  Email receipt sent via Nodemailer (async)                      │
 │            │                                                                 │
 │   ... later ...                                                              │
 │            │                │◀── Razorpay webhook (event) ─────              │
 │            │                │   reconcile / refund / capture                 │
 │            │                │◀── Shiprocket webhook (status) ────────────────│
 │            │                │   append to order.tracking timeline            │
```

### 3. Auth + 2FA Flow

```
Signup  ─▶ POST /api/users/register
        ─▶ bcrypt(password) → User created (isVerified=false)
        ─▶ email verification token (signed JWT) → Nodemailer

Verify  ─▶ GET /api/users/verify-email/:token → isVerified=true

Login   ─▶ POST /api/users/login
        ─▶ rate-limited (authLimiter)
        ─▶ verify password (bcrypt.compare)
        ─▶ if 2FA enabled → generate OTP → email → 200 { twoFactorRequired: true }
        ─▶ else → sign JWT → 200 { token }

2FA OK  ─▶ POST /api/users/verify-2fa { otp }
        ─▶ verify OTP (time-window) → sign JWT → 200 { token }

Lockout ─▶ 5 failed attempts within window → account locked, alert email
```

### 4. Shiprocket Webhook Flow

```
Courier scan ─▶ Shiprocket Webhook Service
              ─▶ POST https://api.voyareyewear.com/api/shipping-webhook/webhook
                  Headers: x-api-key, Content-Type: application/json
              ─▶ express.json() → globalSanitizer → verify x-api-key
              ─▶ shiprocketWebhookController.handleWebhook
                  • Find order by AWB / shipment_id
                  • Append { status, location, timestamp } to order.tracking
                  • Update top-level order.status when terminal
                  • Optionally email customer on key transitions
              ─▶ 200 OK (idempotent — safe to retry)
```

### 5. Frontend Component Tree (abridged)

```
<App>
 ├── <ThemeProvider>
 ├── <AuthProvider>          (context/)
 ├── <CartProvider>
 └── <BrowserRouter>
      ├── <Navbar />          (scroll-aware, theme toggle)
      ├── <Routes>
      │    ├── /                → <Home>
      │    │       ├── <Hero/>           (GSAP timeline)
      │    │       ├── <Features/>
      │    │       ├── <BentoGrid/>
      │    │       ├── <ShopByGender/>
      │    │       ├── <ProductGrid/>
      │    │       ├── <VirtualTryOn/>
      │    │       ├── <MoodLook/>
      │    │       ├── <BrandShowcase/>
      │    │       ├── <Services/>
      │    │       ├── <Testimonials/>
      │    │       ├── <Newsletter/>
      │    │       └── <ContactCTA/>
      │    ├── /collections     → <Collections>
      │    ├── /product/:id     → <ProductDetail> (LensSelector, reviews)
      │    ├── /cart            → <Cart>
      │    ├── /checkout        → <Checkout> (Razorpay integration)
      │    ├── /orders          → <Orders>     (ShipmentTracker, PaymentTimeline)
      │    ├── /profile         → <Profile>    (TwoFactorAuth)
      │    ├── /login,/signup,/verify-email,/forgot,/reset
      │    ├── /admin/login,/admin/forgot,/admin/reset
      │    ├── /admin           → <AdminDashboard> (Recharts analytics)
      │    └── *                → <NotFound>
      └── <Footer />
```

### 6. State & Data Flow (Frontend)

- **Server state**: fetched per‑route via typed `fetch` wrappers in `src/config/`, with JWT attached from auth context.
- **Auth state**: held in a React Context (`src/context/`) and persisted to `localStorage`; refreshed on app boot.
- **Cart state**: optimistic local context, **synced server‑side** for logged‑in users so the cart survives device changes.
- **Theme state**: context‑driven, with class‑based dark mode wired into Tailwind.
- **Animations**: GSAP timelines registered inside `useEffect` with cleanup; ScrollTrigger pinned/scrub configured per section; Lenis ties native scroll to GSAP's `ticker`.

---

## 🎨 Frontend Architecture

### Why this stack?

| Choice               | Rationale                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Vite 7**           | Sub‑second HMR, native ESM, fast TypeScript builds. Perfect for an animation‑heavy SPA where iteration speed matters.            |
| **React 19**         | Latest concurrent features, automatic batching, and improved Suspense unlock smoother route transitions.                         |
| **TypeScript**       | Domain types (Product, Order, Payment, Shipment) are wide; compile‑time guarantees prevent prop drift across 17+ pages.          |
| **Tailwind + shadcn**| Utility‑first speed without losing semantic components. shadcn primitives stay in‑repo, owned by us — no opaque vendor library.  |
| **GSAP + Framer**    | GSAP for complex, scroll‑linked timelines; Framer Motion for declarative micro‑interactions on enter/exit and gestures.          |
| **Lenis**            | Smooths native scroll into a 60 fps inertia model that GSAP ScrollTrigger can drive deterministically.                           |
| **Recharts**         | Composable, responsive admin charts without bringing in a heavy charting toolkit.                                                |
| **React Router 7**   | File‑agnostic routing with nested layouts and data APIs.                                                                         |

### Styling system

- **Tailwind config** defines the palette, typography, container widths, and motion tokens.
- **CSS variables** drive light/dark theming so shadcn primitives respond automatically.
- **`tailwind-merge` + `clsx`** are used everywhere class names are composed conditionally, preventing conflicting utilities from leaking through.
- **`class-variance-authority`** powers component variants (size, intent, tone) on shadcn buttons/cards.

### Performance practices

- Route‑level **code splitting** via Vite's dynamic imports.
- **Image optimization** through `public/` assets and `<img loading="lazy">` for below‑the‑fold media.
- GSAP timelines created **once** per mount and **killed** on unmount to prevent memory leaks.
- Lenis tied into GSAP's ticker — **single rAF loop** instead of competing animation frames.

---

## 🔧 Backend Architecture

### Layered design

| Layer           | Responsibility                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| **server.js**   | Boot sequence: env validation → DB connect → security middleware → routes → start listener.                 |
| **config/**     | DB, email transporter, security helpers, Shiprocket client (with token caching).                            |
| **middleware/**  | `auth.js` (JWT verify + role guards), `rateLimiter.js` (per‑tier limiters), `validation.js` (sanitizers).   |
| **routes/**     | Thin routers binding HTTP verbs + paths to controllers, with per‑route validators and limiters.             |
| **controllers/**| All business logic. Pure async functions returning `res.json(...)` or throwing typed errors.                |
| **models/**     | Mongoose schemas with validators, virtuals, hooks (e.g., bcrypt pre‑save on User), and instance methods.    |
| **utils/**      | Pure helpers (e.g., cryptographically secure OTP generator).                                                |

### Cross‑cutting concerns

- **Environment validation** at boot — the server refuses to start without required secrets (DB URI, JWT secret, Razorpay keys, SMTP credentials).
- **Centralized error responses** with sanitized messages (no stack traces leak in production).
- **Sanitized request logging** — never echo `Authorization`, `password`, OTP, or webhook secrets into logs.

---

## 🗃️ Data Models

### Entity overview

```
┌──────────┐ 1  ┌─────────┐ N  ┌──────────┐
│   User   │────│  Order  │────│  Item    │  (embedded snapshot of Product)
└────┬─────┘    └────┬────┘    └─────┬────┘
     │ 1             │ 1             │ N
     │ N             │ 1             ▼
┌────▼─────┐    ┌────▼────────┐  ┌────────────┐
│ Address  │    │  Payment    │  │  Product   │
│ (embed)  │    │  Timeline   │  └─────┬──────┘
└──────────┘    └─────────────┘        │ 1
                ┌─────────────┐        │ N
                │  Shipment   │   ┌────▼─────────┐
                │  Tracking   │   │ ColorVariant │ (embed)
                └─────────────┘   └──────────────┘

┌──────────┐ N  ┌─────────┐
│   User   │────│ Review  │──N──▶ Product
└──────────┘    └─────────┘

┌──────────┐
│  Admin   │   (separate collection; site-wide settings as singleton)
└──────────┘
```

### Key schemas

| Model      | Highlights                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**   | Email, hashed password (bcrypt), `isVerified`, `twoFactorEnabled`, `passwordHistory[]`, `failedLoginAttempts`, `addresses[]`, `cart[]`, `wishlist[]`.             |
| **Product**| Name, slug, description, brand, category, gender, price, MRP, stock, `colorVariants[]` (with images per color), `specifications`, ratings aggregate.             |
| **Order**  | Items snapshot, shipping address, payment block (provider, IDs, status), `paymentTimeline[]`, `shiprocket` (shipmentId, awb, label, invoice), `tracking[]`.       |
| **Review** | Product ref, user ref, rating, body, `verifiedPurchase`, `helpfulVotes`, `status` (pending/approved/rejected).                                                    |
| **Admin**  | Email, hashed password, `role`, plus a singleton `SiteSettings` document for global config.                                                                       |

> See [`backend/models/`](./backend/models) for the authoritative schema definitions.

---

## 🌐 API Surface

All routes are namespaced under `/api`. Authentication uses `Authorization: Bearer <jwt>`.

| Group                | Base path                  | Examples                                                                                                |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Health**           | `/api/health`              | `GET /api/health`                                                                                       |
| **Products**         | `/api/products`            | `GET /`, `GET /:id`, `POST /` (admin), `PUT /:id` (admin), `DELETE /:id` (admin), `GET /search`         |
| **Orders**           | `/api/orders`              | `POST /`, `GET /my`, `GET /:id`, `PATCH /:id/status` (admin)                                            |
| **Users / Auth**     | `/api/users`               | `POST /register`, `POST /login`, `POST /verify-2fa`, `POST /forgot`, `POST /reset/:token`, `GET /me`     |
| **Admin**            | `/api/admin`               | `POST /login`, `GET /analytics`, `GET /users`, site‑settings endpoints                                  |
| **Payments**         | `/api/payment`             | `POST /create`, `POST /verify`, `POST /cod`, `POST /refund`, `POST /webhook`                            |
| **Reviews**          | `/api/reviews`             | `POST /`, `GET /product/:id`, `POST /:id/helpful`, `PATCH /:id/moderate` (admin)                        |
| **Shipping**         | `/api/shiprocket`          | Serviceability, create shipment, AWB, label, invoice, pickup locations, tracking                        |
| **Shipping Webhook** | `/api/shipping-webhook`    | `POST /webhook` (Shiprocket → Voyar)                                                                    |

> Full endpoint reference and payload contracts live in [`backend/README.md`](./backend/README.md).

---

## 🛡️ Security Architecture

A layered, defense‑in‑depth approach modeled on the **OWASP Top 10**.

```
┌──────────────────────────────────────────────────────────────┐
│  EDGE                                                        │
│  • Helmet (HSTS, X‑Frame‑Options, X‑Content‑Type‑Options…)   │
│  • CORS allow‑list                                           │
│  • Trust proxy (correct client IPs behind Vercel)            │
│  • Body size cap (10 KB)                                     │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  SANITIZATION                                                │
│  • mongo‑sanitize (strip $ / . operators)                    │
│  • xss‑filters (escape user content)                         │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  RATE LIMITING (per‑tier)                                    │
│  • standardLimiter   (general API)                           │
│  • authLimiter       (login / register / 2FA)                │
│  • paymentLimiter    (checkout / verify / refund)            │
│  • emailLimiter      (resend verification / OTP)             │
│  • sensitiveLimiter  (admin & destructive ops)               │
│  • publicLimiter     (catalog browsing)                      │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  AUTHN / AUTHZ                                               │
│  • JWT (signed, expiring) verified by middleware             │
│  • protect / protectOrAdmin / authMiddleware role guards     │
│  • Account lockout, password history, 2FA                    │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  INPUT VALIDATION & MASS‑ASSIGNMENT GUARDS                   │
│  • express‑validator schemas per route                       │
│  • allowedFields whitelist before model writes               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔌 Third‑Party Integrations

| Provider      | Purpose                       | Touchpoints                                                                                          |
| ------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| **MongoDB Atlas** | Primary datastore           | `config/db.js` connection, all Mongoose models                                                       |
| **Razorpay**      | Payments + refunds + webhooks | `controllers/paymentController.js`, `routes/paymentRoutes.js`, frontend `Checkout.tsx`               |
| **Shiprocket**    | Shipping + tracking + webhooks| `config/shiprocket.js`, `controllers/shiprocketController.js`, `controllers/shiprocketWebhookController.js`, frontend `ShipmentTracker.tsx`, see [`SHIPROCKET_ARCHITECTURE.md`](./SHIPROCKET_ARCHITECTURE.md) |
| **Gmail SMTP**    | Transactional email           | `config/email.js` Nodemailer transporter and HTML templates                                          |
| **Vercel**        | Hosting (frontend + serverless)| `frontend/vercel.json`, `frontend/.deployment`, `backend/.deployment`                               |

---

## 📁 Project Structure

```
Voyar/
├── README.md                          ← (this file)
├── SHIPROCKET_ARCHITECTURE.md         ← Webhook architecture & sequence diagrams
├── SHIPROCKET_QUICK_START.md
├── SHIPROCKET_SETUP_FIX.md
├── SHIPROCKET_WEBHOOK_SUMMARY.md
│
├── backend/                           ← Node.js + Express 5 API server
│   ├── server.js                      ← App entrypoint
│   ├── config/                        ← db, email, security, shiprocket
│   ├── controllers/                   ← Business logic
│   ├── middleware/                    ← auth, rateLimiter, validation
│   ├── models/                        ← Mongoose schemas
│   ├── routes/                        ← REST routers
│   ├── utils/                         ← Helpers (OTP, etc.)
│   ├── docs/                          ← Backend deep‑dive docs
│   ├── WEBHOOK_SETUP_GUIDE.md
│   ├── WEBHOOK_SETUP_REQUIRED.md
│   ├── README.md                      ← Backend README
│   ├── .env.example
│   └── package.json
│
└── frontend/                          ← React 19 + Vite SPA
    ├── index.html
    ├── src/
    │   ├── main.tsx                   ← React root
    │   ├── App.tsx                    ← Router + providers
    │   ├── components/                ← UI building blocks (shadcn + custom)
    │   │   └── ui/                    ← shadcn/ui primitives
    │   ├── pages/                     ← Route components
    │   ├── context/                   ← Auth / cart / theme contexts
    │   ├── config/                    ← API client + env config
    │   ├── data/                      ← Static seed/demo data
    │   ├── lib/                       ← cn(), helpers
    │   ├── styles/                    ← Global styles
    │   ├── types/                     ← Shared TS types
    │   └── assets/
    ├── public/
    ├── docs/
    ├── tailwind.config.js
    ├── vite.config.ts
    ├── tsconfig*.json
    ├── eslint.config.js
    ├── vercel.json
    ├── README.md                      ← Frontend README
    ├── .env.example
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- **MongoDB Atlas** cluster (or local MongoDB)
- **Razorpay** account (live or test keys)
- **Shiprocket** account (API user + password)
- **Gmail** account with an App Password (for SMTP)

### 1. Clone

```bash
git clone https://github.com/Sayan-dev731/Voyar.git
cd Voyar
```

### 2. Backend

```bash
cd backend
cp .env.example .env       # then fill in values (see next section)
npm install
npm run dev                # http://localhost:5000
```

### 3. Frontend

In a new terminal:

```bash
cd frontend
cp .env.example .env       # set VITE_API_BASE_URL to your backend
npm install
npm run dev                # http://localhost:5173
```

### 4. Build for production

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build && npm run preview
```

---

## 🔐 Environment Variables

> Never commit real secrets. Use `.env.example` files as a template.

### Backend (`backend/.env`)

| Variable                | Purpose                                                   |
| ----------------------- | --------------------------------------------------------- |
| `PORT`                  | API port (default `5000`)                                 |
| `NODE_ENV`              | `development` \| `production`                             |
| `MONGO_URI`             | MongoDB Atlas connection string                           |
| `JWT_SECRET`            | Secret for signing user/admin JWTs                        |
| `JWT_EXPIRES_IN`        | e.g. `7d`                                                 |
| `RAZORPAY_KEY_ID`       | Razorpay key ID                                           |
| `RAZORPAY_KEY_SECRET`   | Razorpay key secret                                       |
| `RAZORPAY_WEBHOOK_SECRET`| Secret to verify Razorpay webhook signatures             |
| `SHIPROCKET_EMAIL`      | Shiprocket API user                                       |
| `SHIPROCKET_PASSWORD`   | Shiprocket API password                                   |
| `SHIPROCKET_WEBHOOK_TOKEN`| `x-api-key` for Shiprocket → Voyar webhooks             |
| `SMTP_HOST` / `SMTP_PORT` | Gmail SMTP host & port                                  |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials (use Gmail App Password)               |
| `EMAIL_FROM`            | Sender address shown to users                             |
| `FRONTEND_URL`          | Public URL of the frontend (used in email links)          |

### Frontend (`frontend/.env`)

| Variable                | Purpose                                                   |
| ----------------------- | --------------------------------------------------------- |
| `VITE_API_BASE_URL`     | Backend base URL, e.g. `http://localhost:5000/api`        |
| `VITE_RAZORPAY_KEY_ID`  | Public Razorpay key ID for the Checkout widget            |

---

## 🚢 Deployment

| Component     | Target                                         | Notes                                                                                     |
| ------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Frontend**  | **Vercel** (`frontend/vercel.json`)            | Static SPA build (`vite build`), edge‑cached, custom domain `voyareyewear.com`.           |
| **Backend**   | Vercel Serverless / Node host                  | `app.set("trust proxy", 1)` is enabled for accurate client IPs behind reverse proxies.    |
| **Database**  | **MongoDB Atlas**                              | Configure IP allow‑list and a least‑privilege DB user.                                    |
| **Webhooks**  | Razorpay & Shiprocket dashboards               | Point to `/api/payment/webhook` and `/api/shipping-webhook/webhook` respectively.          |

See [`SHIPROCKET_QUICK_START.md`](./SHIPROCKET_QUICK_START.md) and [`backend/WEBHOOK_SETUP_GUIDE.md`](./backend/WEBHOOK_SETUP_GUIDE.md) for webhook setup.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. **Fork** the repository.
2. Create a feature branch: `git checkout -b feat/awesome-thing`.
3. Commit using clear messages: `git commit -m "feat(orders): add bulk export"`.
4. Run linters and basic smoke tests:
   ```bash
   cd frontend && npm run lint && npm run build
   cd backend  && npm run dev    # smoke test
   ```
5. Push and open a **Pull Request** against `main`.

Please follow existing patterns:
- Keep controllers thin; move shared logic to `utils/` or `config/`.
- Add new routes behind the appropriate **rate limiter** and **validator**.
- Use **typed props** and **shadcn primitives** for new React components.
- Never log secrets, OTPs, JWTs, or webhook payloads verbatim.

---

## 📜 License

This project is licensed under the **ISC License**. See individual `package.json` files for details.

---

<div align="center">

**Built with care by the Voyar engineering team.**

[Live Site](https://voyareyewear.com) · [Frontend README](./frontend/README.md) · [Backend README](./backend/README.md) · [Shiprocket Architecture](./SHIPROCKET_ARCHITECTURE.md)

</div>
