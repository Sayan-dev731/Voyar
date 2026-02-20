# 🕶️ Voyar Backend API

> Production-grade RESTful backend server for **Voyar Eyewear** — a full-featured E-commerce platform for premium eyewear products.

Built with **Node.js**, **Express.js v5**, and **MongoDB** using **ES Modules (ESM)**.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Server](#-running-the-server)
- [API Endpoints](#-api-endpoints)
  - [Health Check](#health-check)
  - [Products](#products)
  - [Orders](#orders)
  - [Users / Authentication](#users--authentication)
  - [Admin](#admin)
  - [Payments (Razorpay)](#payments-razorpay)
  - [Reviews](#reviews)
  - [Shipping (Shiprocket)](#shipping-shiprocket)
  - [Shipping Webhooks](#shipping-webhooks)
- [Database Models](#-database-models)
- [Middleware Pipeline](#-middleware-pipeline)
- [Security Features](#-security-features)
- [Email System](#-email-system)
- [Payment Integration (Razorpay)](#-payment-integration-razorpay)
- [Shipping Integration (Shiprocket)](#-shipping-integration-shiprocket)
- [Error Handling](#-error-handling)
- [Default Admin Credentials](#-default-admin-credentials)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features

### Core
- RESTful API built on **Express.js v5** with ES Modules
- **MongoDB** database with **Mongoose v9** ODM
- Full product catalog management (CRUD) with color variants, specifications, and multi-image support
- Comprehensive order lifecycle management (create → confirm → process → ship → deliver)
- Admin dashboard with analytics, user management, and site settings

### Authentication & Users
- **JWT-based authentication** for both users and admins
- User registration with **email verification** (token-based)
- **Two-Factor Authentication (2FA)** via email OTP
- Password reset via email with secure tokens
- **Password strength validation** following OWASP standards
- **Account lockout** after 5 failed login attempts
- **Password history** tracking (prevents reuse of last 5 passwords)
- User profile management with multiple saved addresses
- Server-side **cart** and **wishlist** syncing

### Payments
- **Razorpay** payment gateway integration (Live keys)
- Support for **online payments** and **Cash on Delivery (COD)**
- Payment verification with cryptographic signature validation
- **Razorpay Webhooks** for asynchronous payment event handling
- Full **refund management** (initiate, track, complete)
- **Payment timeline** tracking (Razorpay dashboard style)
- Secure payment tokens with 30-minute expiry

### Shipping
- **Shiprocket** shipping integration for order fulfillment
- Automated shipment creation and courier assignment
- Courier serviceability check by pincode
- Shipment tracking with AWB (Air Waybill) codes
- Pickup location management (create, sync, select)
- Label and invoice generation
- **Webhook-based real-time shipment status updates**
- Quick-ship and bulk tracking utilities

### Reviews
- Product review and rating system
- Verified purchase badge support
- Helpful vote mechanism
- Admin moderation (approve/reject reviews)
- Automatic product rating recalculation on review changes

### Security (OWASP Compliant)
- **Helmet.js** for secure HTTP headers
- **CORS** with configurable allowed origins
- **Rate limiting** (standard, auth, payment, email, sensitive endpoints)
- **Input validation** with `express-validator`
- **XSS prevention** with `xss-filters`
- **NoSQL injection prevention** with `mongo-sanitize`
- **Body size limiting** (10KB) to prevent DoS
- Mass assignment protection via `allowedFields` middleware
- Sanitized request logging (prevents log injection)
- Proxy trust configuration for deployment behind reverse proxies

### Email
- Transactional emails via **Nodemailer** (Gmail SMTP)
- Email verification, password reset, 2FA OTP delivery
- Order confirmation, status updates, and billing emails
- Admin password reset emails
- Styled HTML email templates

---

## 🛠️ Tech Stack

| Category         | Technology                                                             |
| ---------------- | ---------------------------------------------------------------------- |
| **Runtime**      | Node.js (ES Modules)                                                   |
| **Framework**    | Express.js v5                                                          |
| **Database**     | MongoDB Atlas / Mongoose v9                                            |
| **Auth**         | JSON Web Tokens (jsonwebtoken), bcryptjs                               |
| **Payments**     | Razorpay SDK                                                           |
| **Shipping**     | Shiprocket API v2                                                      |
| **Email**        | Nodemailer (Gmail SMTP)                                                |
| **Validation**   | express-validator, validator.js                                        |
| **Security**     | helmet, cors, express-rate-limit, xss-filters, mongo-sanitize          |
| **Dev Tools**    | nodemon                                                                |

---

## 🏗️ Architecture Overview

```
Client (React Frontend)
        │
        ▼
┌─────────────────────────────────────────┐
│           Express.js Server             │
│  ┌────────────────────────────────────┐ │
│  │  Security Layer                    │ │
│  │  Helmet → CORS → Body Parser →    │ │
│  │  Sanitization → Rate Limiting     │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Routing Layer                     │ │
│  │  /api/products  → productRoutes   │ │
│  │  /api/orders    → orderRoutes     │ │
│  │  /api/users     → userRoutes      │ │
│  │  /api/admin     → adminRoutes     │ │
│  │  /api/payment   → paymentRoutes   │ │
│  │  /api/reviews   → reviewRoutes    │ │
│  │  /api/shiprocket→ shiprocketRoutes│ │
│  │  /api/shipping-webhook → webhooks │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Controller Layer                  │ │
│  │  Business logic & data processing │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Model Layer (Mongoose)            │ │
│  │  User, Product, Order, Admin,     │ │
│  │  Review, SiteSettings             │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
   MongoDB        Razorpay       Shiprocket
   Atlas          Gateway        Shipping API
                       │
                       ▼
                  Gmail SMTP
                  (Nodemailer)
```

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js                          # MongoDB connection (Mongoose)
│   ├── email.js                       # Nodemailer transporter & email templates
│   ├── security.js                    # Environment validation, password utilities, OWASP helpers
│   └── shiprocket.js                  # Shiprocket API client (auth, requests, caching)
│
├── controllers/
│   ├── adminController.js             # Admin auth, user/admin CRUD, analytics, site settings
│   ├── orderController.js             # Order CRUD, stock management, Shiprocket integration
│   ├── paymentController.js           # Razorpay order creation, verification, COD, refunds, webhooks
│   ├── productController.js           # Product CRUD, search, stats
│   ├── reviewController.js            # Review CRUD, moderation, helpful votes, rating calc
│   ├── shiprocketController.js        # Shipment creation, courier mgmt, tracking, labels, invoices
│   ├── shiprocketWebhookController.js # Webhook handler for real-time shipment status updates
│   └── userController.js              # User auth, profile, addresses, cart, wishlist, 2FA
│
├── middleware/
│   ├── auth.js                        # JWT auth middleware (protect, authMiddleware, protectOrAdmin)
│   ├── rateLimiter.js                 # Rate limiting (standard, auth, payment, email, sensitive, public)
│   └── validation.js                  # Input validation, XSS/NoSQL sanitization, allowed fields
│
├── models/
│   ├── Admin.js                       # Admin schema + SiteSettings singleton schema
│   ├── Order.js                       # Order schema (items, shipping, payment, Shiprocket, refund, timeline)
│   ├── Product.js                     # Product schema (color variants, specifications, images)
│   ├── Review.js                      # Review schema (ratings, helpful votes, moderation)
│   └── User.js                        # User schema (auth, 2FA, addresses, cart, wishlist, password history)
│
├── routes/
│   ├── adminRoutes.js                 # Admin endpoints
│   ├── orderRoutes.js                 # Order endpoints
│   ├── paymentRoutes.js               # Payment (Razorpay) endpoints
│   ├── productRoutes.js               # Product endpoints
│   ├── reviewRoutes.js                # Review endpoints
│   ├── shiprocketRoutes.js            # Shiprocket shipping endpoints
│   └── shiprocketWebhookRoutes.js     # Shiprocket webhook endpoints
│
├── utils/
│   └── otpGenerator.js                # Cryptographically secure OTP generation
│
├── docs/                              # Additional documentation
├── .env.example                       # Environment variable template
├── .deployment                        # Deployment configuration
├── .gitignore
├── package.json
├── server.js                          # Main application entry point
├── WEBHOOK_SETUP_GUIDE.md             # Shiprocket webhook setup instructions
└── WEBHOOK_SETUP_REQUIRED.md          # Webhook setup requirements
```

---

## 📦 Prerequisites

- **Node.js** v18+ (ES Modules support required)
- **npm** v9+
- **MongoDB Atlas** account (or local MongoDB instance)
- **Razorpay** account (for payment processing)
- **Shiprocket** account (for shipping/logistics)
- **Gmail** account with App Password (for transactional emails)

---

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sayan-dev731/Voyar.git
   cd Voyar/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual credentials (see [Environment Variables](#-environment-variables) below).

4. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

5. **(Optional) Seed the database**
   ```bash
   npm run seed
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

| Variable                     | Required | Description                                          |
| ---------------------------- | -------- | ---------------------------------------------------- |
| `PORT`                       | No       | Server port (default: `5000`)                        |
| `NODE_ENV`                   | No       | `development` or `production`                        |
| `MONGODB_URI`                | **Yes**  | MongoDB connection string                            |
| `JWT_SECRET`                 | **Yes**  | Secret key for JWT signing (min 32 chars recommended)|
| `FRONTEND_URL`               | Yes      | Frontend URL for CORS & email links                  |
| `ADMIN_USERNAME`             | Yes      | Default admin username                               |
| `ADMIN_PASSWORD`             | Yes      | Default admin password                               |
| `ADMIN_EMAIL`                | Yes      | Admin email address                                  |
| `EMAIL_ID`                   | Yes      | Gmail address for sending emails                     |
| `EMAIL_PASSWORD`             | Yes      | Gmail App Password (not regular password)            |
| `Live_Key_ID`                | Yes      | Razorpay Live API Key ID                             |
| `Live_Key_Secret`            | Yes      | Razorpay Live API Key Secret                         |
| `SHIPROCKET_EMAIL`           | Yes      | Shiprocket API user email                            |
| `SHIPROCKET_PASSWORD`        | Yes      | Shiprocket API user password                         |
| `SHIPROCKET_PICKUP_LOCATION` | No       | Default pickup location name (default: `Primary`)    |
| `SHIPROCKET_WEBHOOK_TOKEN`   | No       | Security token for webhook verification              |
| `PICKUP_PINCODE`             | No       | Default pickup pincode for serviceability checks     |

### Gmail App Password Setup
1. Enable 2-Factor Authentication on your Google account
2. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate an App Password
4. Use that App Password as `EMAIL_PASSWORD`

---

## 🏃 Running the Server

```bash
# Development mode (with hot-reload via nodemon)
npm run dev

# Production mode
npm start

# Seed database with sample products
npm run seed
```

The server starts on `http://localhost:5000` by default.

---

## 📡 API Endpoints

### Health Check

| Method | Endpoint       | Access | Description         |
| ------ | -------------- | ------ | ------------------- |
| GET    | `/api/health`  | Public | Server health status|

---

### Products

| Method | Endpoint                      | Access        | Description                    |
| ------ | ----------------------------- | ------------- | ------------------------------ |
| GET    | `/api/products`               | Public        | Get all products (paginated)   |
| GET    | `/api/products/search`        | Public        | Search products by query       |
| GET    | `/api/products/stats/summary` | Admin         | Get product statistics         |
| GET    | `/api/products/:id`           | Public        | Get single product by ID       |
| POST   | `/api/products`               | Admin         | Create a new product           |
| PUT    | `/api/products/:id`           | Admin         | Update an existing product     |
| DELETE | `/api/products/:id`           | Admin         | Delete a product               |

---

### Orders

| Method | Endpoint                         | Access        | Description                          |
| ------ | -------------------------------- | ------------- | ------------------------------------ |
| POST   | `/api/orders`                    | Public        | Create order (legacy)                |
| GET    | `/api/orders/my-orders`          | User          | Get current user's orders            |
| GET    | `/api/orders/:id`                | Public        | Get single order                     |
| PUT    | `/api/orders/:id/cancel`         | User          | Cancel order (before shipped)        |
| DELETE | `/api/orders/:id/user-delete`    | User          | Soft-delete order (after delivered)  |
| GET    | `/api/orders`                    | Admin         | Get all orders                       |
| PUT    | `/api/orders/:id/status`         | Admin         | Update order status                  |
| DELETE | `/api/orders/:id`                | Admin         | Delete order                         |
| GET    | `/api/orders/stats/summary`      | Admin         | Get order statistics                 |
| POST   | `/api/orders/:id/generate-bill`  | Admin         | Generate order bill/invoice          |

---

### Users / Authentication

| Method | Endpoint                              | Access  | Description                      |
| ------ | ------------------------------------- | ------- | -------------------------------- |
| POST   | `/api/users/signup`                   | Public  | Register a new user              |
| POST   | `/api/users/login`                    | Public  | Login & get JWT token            |
| GET    | `/api/users/verify-email/:token`      | Public  | Verify email address             |
| POST   | `/api/users/resend-verification`      | Public  | Resend verification email        |
| POST   | `/api/users/forgot-password`          | Public  | Request password reset           |
| POST   | `/api/users/reset-password/:token`    | Public  | Reset password with token        |
| POST   | `/api/users/verify-2fa`               | Public  | Verify 2FA OTP code              |
| POST   | `/api/users/resend-2fa-otp`           | Public  | Resend 2FA OTP                   |
| GET    | `/api/users/profile`                  | User    | Get user profile                 |
| PUT    | `/api/users/profile`                  | User    | Update user profile              |
| POST   | `/api/users/change-password`          | User    | Change password                  |
| PUT    | `/api/users/2fa-settings`             | User    | Enable/disable 2FA               |
| POST   | `/api/users/addresses`                | User    | Add new address                  |
| PUT    | `/api/users/addresses/:id`            | User    | Update address                   |
| DELETE | `/api/users/addresses/:id`            | User    | Delete address                   |
| GET    | `/api/users/cart`                     | User    | Get cart                         |
| POST   | `/api/users/cart`                     | User    | Add item to cart                 |
| PUT    | `/api/users/cart/:productId`          | User    | Update cart item quantity         |
| DELETE | `/api/users/cart/:productId`          | User    | Remove item from cart            |
| DELETE | `/api/users/cart`                     | User    | Clear entire cart                |
| POST   | `/api/users/cart/sync`                | User    | Sync local cart with server      |
| GET    | `/api/users/wishlist`                 | User    | Get wishlist                     |
| POST   | `/api/users/wishlist`                 | User    | Add to wishlist                  |
| DELETE | `/api/users/wishlist/:productId`      | User    | Remove from wishlist             |
| POST   | `/api/users/wishlist/sync`            | User    | Sync local wishlist with server  |
| DELETE | `/api/users/wishlist`                 | User    | Clear wishlist                   |

---

### Admin

| Method | Endpoint                           | Access       | Description                      |
| ------ | ---------------------------------- | ------------ | -------------------------------- |
| POST   | `/api/admin/login`                 | Public       | Admin login                      |
| POST   | `/api/admin/forgot-password`       | Public       | Admin forgot password            |
| POST   | `/api/admin/reset-password/:token` | Public       | Admin reset password             |
| GET    | `/api/admin/settings/public`       | Public       | Get public site settings         |
| GET    | `/api/admin/verify`                | Admin        | Verify admin token               |
| POST   | `/api/admin/change-password`       | Admin        | Change admin password            |
| PUT    | `/api/admin/profile`               | Admin        | Update admin profile             |
| GET    | `/api/admin/analytics`             | Admin        | Get dashboard analytics          |
| GET    | `/api/admin/login-history`         | Admin        | Get login history                |
| GET    | `/api/admin/settings`              | Super Admin  | Get site settings                |
| PUT    | `/api/admin/settings`              | Super Admin  | Update site settings             |
| GET    | `/api/admin/users`                 | Admin        | Get all users                    |
| GET    | `/api/admin/users/:id`             | Admin        | Get user by ID                   |
| PUT    | `/api/admin/users/:id`             | Admin        | Update user                      |
| DELETE | `/api/admin/users/:id`             | Admin        | Delete user                      |
| GET    | `/api/admin/admins`                | Super Admin  | Get all admins                   |
| POST   | `/api/admin/admins`                | Super Admin  | Create new admin                 |
| PUT    | `/api/admin/admins/:id`            | Super Admin  | Update admin                     |
| DELETE | `/api/admin/admins/:id`            | Super Admin  | Delete admin                     |
| GET    | `/api/admin/export`                | Admin        | Export data                      |

---

### Payments (Razorpay)

| Method | Endpoint                             | Access           | Description                                 |
| ------ | ------------------------------------ | ---------------- | ------------------------------------------- |
| POST   | `/api/payment/create-order`          | User             | Create Razorpay order                       |
| POST   | `/api/payment/verify`                | User             | Verify payment after checkout               |
| POST   | `/api/payment/failure`               | User             | Handle payment failure                      |
| GET    | `/api/payment/order/:token`          | Public           | Get order by payment token                  |
| POST   | `/api/payment/webhook`               | Public (Razorpay)| Razorpay webhook for async payment events   |
| POST   | `/api/payment/cod`                   | User             | Create Cash on Delivery order               |
| GET    | `/api/payment/refund-status/:orderId`| User/Admin       | Get refund status                           |
| GET    | `/api/payment/timeline/:orderId`     | User/Admin       | Get payment timeline                        |

---

### Reviews

| Method | Endpoint                                   | Access  | Description                      |
| ------ | ------------------------------------------ | ------- | -------------------------------- |
| GET    | `/api/reviews/product/:productId`          | Public  | Get product reviews (paginated)  |
| POST   | `/api/reviews/product/:productId`          | User    | Create a review                  |
| PUT    | `/api/reviews/:reviewId`                   | User    | Update own review                |
| DELETE | `/api/reviews/:reviewId`                   | User    | Delete own review                |
| POST   | `/api/reviews/:reviewId/helpful`           | User    | Mark review as helpful           |
| GET    | `/api/reviews/can-review/:productId`       | User    | Check if user can review product |
| GET    | `/api/reviews/admin/all`                   | Admin   | Get all reviews (moderation)     |
| PUT    | `/api/reviews/admin/:reviewId/moderate`    | Admin   | Moderate review (approve/reject) |
| DELETE | `/api/reviews/admin/:reviewId`             | Admin   | Admin delete review              |

---

### Shipping (Shiprocket)

| Method | Endpoint                                             | Access  | Description                      |
| ------ | ---------------------------------------------------- | ------- | -------------------------------- |
| GET    | `/api/shiprocket/track/:orderId`                     | User    | Track shipment by order ID       |
| GET    | `/api/shiprocket/test-connection`                    | Admin   | Test Shiprocket credentials      |
| GET    | `/api/shiprocket/sync-pickup-locations`              | Admin   | Sync pickup locations            |
| POST   | `/api/shiprocket/pickup-location`                    | Admin   | Add new pickup location          |
| POST   | `/api/shiprocket/select-pickup-location`             | Admin   | Select active pickup location    |
| POST   | `/api/shiprocket/orders/:orderId/create-shipment`    | Admin   | Create shipment for order        |
| GET    | `/api/shiprocket/orders/:orderId/couriers`           | Admin   | Get available couriers           |
| POST   | `/api/shiprocket/orders/:orderId/assign-courier`     | Admin   | Assign courier to order          |
| POST   | `/api/shiprocket/orders/:orderId/schedule-pickup`    | Admin   | Schedule pickup                  |
| POST   | `/api/shiprocket/orders/:orderId/generate-label`     | Admin   | Generate shipping label          |
| POST   | `/api/shiprocket/orders/:orderId/generate-invoice`   | Admin   | Generate invoice                 |
| POST   | `/api/shiprocket/orders/:orderId/cancel-shipment`    | Admin   | Cancel shipment                  |
| POST   | `/api/shiprocket/orders/:orderId/quick-ship`         | Admin   | Quick ship (auto courier)        |
| GET    | `/api/shiprocket/admin/track/:orderId`               | Admin   | Admin tracking view              |
| GET    | `/api/shiprocket/pickup-locations`                   | Admin   | Get all pickup locations         |
| POST   | `/api/shiprocket/bulk-update-tracking`               | Admin   | Bulk update tracking info        |
| POST   | `/api/shiprocket/webhook`                            | Public  | Shiprocket webhook (legacy)      |

---

### Shipping Webhooks

| Method | Endpoint                                    | Access  | Description                          |
| ------ | ------------------------------------------- | ------- | ------------------------------------ |
| POST   | `/api/shipping-webhook/webhook`             | Public  | Shiprocket shipment status webhook   |
| GET    | `/api/shipping-webhook/webhook-config`      | Public  | Get webhook configuration info       |

---

## 📊 Database Models

### User
- Authentication (email/password, JWT tokens)
- Email verification with token-based flow
- Two-Factor Authentication (2FA via OTP)
- Password history (last 5 passwords)
- Account lockout (after 5 failed attempts)
- Multiple addresses (home, work, other)
- Server-side cart with color variant support
- Server-side wishlist
- Profile fields (name, email, phone, gender, dateOfBirth)

### Product
- Core fields: name, category, price, description, image(s)
- Categories: `Sunglasses`, `Eyeglasses`, `Computer Glasses`, `Sports Glasses`
- Color variants with individual pricing and stock tracking
- Detailed specifications (frame width, lens width, bridge width, material, etc.)
- Auto-calculated stock from color variant quantities
- Rating and review count (auto-updated)

### Order
- Full customer information and shipping address
- Order items with lens configuration support (with power, zero power, frame only)
- Prescription handling (manual entry, upload, email later)
- Payment tracking (Razorpay order ID, payment ID, signature)
- Payment timeline with detailed event tracking
- Refund management (status, ID, amount, timestamps)
- Shiprocket integration fields (order ID, shipment ID, AWB code, courier info)
- Shipment status tracking with detailed shipping timeline
- Stock reservation and deduction tracking
- Email notification tracking

### Admin
- Role-based access (`admin`, `super_admin`)
- Granular permissions (manageProducts, manageOrders, manageUsers, viewAnalytics, manageAdmins, manageSettings)
- Login history with IP and user-agent tracking
- Account lockout mechanism
- Password reset via recovery email

### SiteSettings (Singleton)
- Site name, support email, recovery email
- Platform charges and delivery charges configuration
- Cash on Delivery toggle
- Shiprocket pickup address configuration
- Lens settings with customizable pricing (anti-glare, blue block, photochromic, colour)
- Power range pricing configuration

### Review
- One review per user per product (enforced by unique index)
- Verified purchase badge (linked to Order)
- Rating (1-5 stars), title, and comment
- Helpful vote system (with voter tracking to prevent duplicate votes)
- Admin moderation (approve/reject)
- Admin response capability
- Auto-triggers product rating recalculation

---

## 🔗 Middleware Pipeline

Requests flow through this middleware chain in order:

```
Request → Helmet (Security Headers)
        → Trust Proxy (for reverse proxy support)
        → CORS (Origin validation)
        → Body Parser (JSON, 10KB limit)
        → Global Sanitizer (NoSQL injection & XSS prevention)
        → Standard Rate Limiter (100 req/15min)
        → Public Rate Limiter (for product routes)
        → Request Logger (sanitized logging)
        → Route-specific middleware:
           ├── Auth Limiter (5 req/15min for login/signup)
           ├── Payment Limiter (for payment endpoints)
           ├── Email Limiter (for email-related endpoints)
           ├── Sensitive Limiter (for admin operations)
           ├── Password Reset Limiter
           ├── Allowed Fields (mass assignment protection)
           ├── Input Validators (express-validator schemas)
           └── Auth Middleware (JWT verification)
        → Controller (Business Logic)
        → Error Handler / 404 Handler
```

### Authentication Middleware

| Middleware       | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `protect`        | User authentication — verifies JWT and checks email verified |
| `authMiddleware` | Admin authentication — verifies JWT with admin claims     |
| `protectOrAdmin` | Combined — accepts both user and admin tokens             |

### Rate Limiters

| Limiter             | Limit              | Window   | Use Case                      |
| ------------------- | ------------------- | -------- | ----------------------------- |
| `standardLimiter`   | 100 requests        | 15 min   | All API routes                |
| `publicLimiter`     | Higher limit        | 15 min   | Public product browsing       |
| `authLimiter`       | 5 attempts          | 15 min   | Login, signup, 2FA            |
| `paymentLimiter`    | Limited             | 15 min   | Payment creation/verification |
| `emailLimiter`      | Limited             | 15 min   | Email verification, resend    |
| `sensitiveLimiter`  | Limited             | 15 min   | Password change, admin ops    |
| `passwordResetLimiter` | Limited          | 15 min   | Password reset requests       |

---

## 🛡️ Security Features

| Feature                        | Implementation                                           |
| ------------------------------ | -------------------------------------------------------- |
| **HTTP Security Headers**      | Helmet.js (X-Content-Type-Options, X-Frame-Options, HSTS)|
| **CORS**                       | Whitelist-based origin validation with credentials       |
| **Rate Limiting**              | Per-route rate limits with IP + user-based tracking      |
| **Input Validation**           | express-validator with schema-based validation           |
| **XSS Prevention**             | xss-filters for output encoding                          |
| **NoSQL Injection Prevention** | mongo-sanitize on body, query, and params                |
| **Mass Assignment Protection** | allowedFields middleware rejects unexpected fields        |
| **Body Size Limiting**         | 10KB JSON body limit to prevent DoS                      |
| **Password Security**          | bcryptjs (12 rounds), strength validation, history check |
| **Account Lockout**            | 5 failed attempts → temporary lock                       |
| **JWT Best Practices**         | Token expiry (7d user, 8h admin), strong secret required |
| **Log Injection Prevention**   | Sanitized request path logging                           |
| **Environment Validation**     | Startup checks for required/recommended env vars         |
| **Proxy Trust**                | Configured for deployment behind Vercel/Nginx            |

---

## 📧 Email System

The email system uses **Nodemailer** with **Gmail SMTP** and sends styled HTML emails for:

| Email Type                | Trigger                                    |
| ------------------------- | ------------------------------------------ |
| **Verification Email**    | User signup                                |
| **Password Reset**        | User forgot password request               |
| **2FA OTP**               | Login with 2FA enabled                     |
| **Order Received**        | New order placed                           |
| **Order Status Update**   | Order status changes (shipped, delivered)  |
| **Order Bill/Invoice**    | Admin generates bill                       |
| **Admin Password Reset**  | Admin forgot password                      |

> **Note:** Email sending is non-blocking. If email credentials are not configured, the system gracefully degrades without breaking functionality.

---

## 💳 Payment Integration (Razorpay)

### Flow
1. **Create Order** → Backend creates Razorpay order and generates a secure payment token
2. **Checkout** → Frontend uses Razorpay SDK with the order details
3. **Verify Payment** → Backend verifies the payment signature cryptographically
4. **Stock Deduction** → Stock is reduced only after successful payment verification
5. **Order Confirmation** → Order status updated, confirmation email sent
6. **Webhook Backup** → Razorpay webhooks handle async payment events (captures, failures, refunds)

### Supported Payment Methods
- **Online Payment** via Razorpay (cards, UPI, netbanking, wallets)
- **Cash on Delivery (COD)** — toggleable via admin site settings

### Refund Flow
- Admin initiates refund → Razorpay processes → Webhook confirms completion
- Full refund tracking with timeline events

---

## 🚚 Shipping Integration (Shiprocket)

### Capabilities
- **Create Shipments** from confirmed orders
- **Check Courier Serviceability** by pickup and delivery pincodes
- **Assign Couriers** (manual or auto via quick-ship)
- **Schedule Pickups** with courier partners
- **Track Shipments** via AWB codes (real-time)
- **Generate Labels & Invoices**
- **Cancel Shipments** before dispatch
- **Manage Pickup Locations** (create, sync, select)
- **Bulk Tracking Updates** for multiple orders

### Webhook Status Mapping
Real-time shipment status updates via Shiprocket webhooks:

| Shiprocket Status     | Internal Status      |
| --------------------- | -------------------- |
| NEW                   | new                  |
| AWB ASSIGNED          | awb_assigned         |
| PICKUP SCHEDULED      | pickup_scheduled     |
| PICKED UP             | picked_up            |
| SHIPPED               | shipped              |
| IN TRANSIT            | in_transit           |
| OUT FOR DELIVERY      | out_for_delivery     |
| DELIVERED             | delivered            |
| RTO INITIATED         | rto_initiated        |
| CANCELLED             | cancelled            |

### Token Caching
- Shiprocket auth tokens are cached for 9 days (token validity: 10 days)
- Pickup locations are cached for 5 minutes with force-refresh support

---

## ❌ Error Handling

All errors return a consistent JSON response:

```json
{
    "success": false,
    "message": "Human-readable error message",
    "error": {
        "message": "Detailed message (development only)",
        "stack": "Stack trace (development only)"
    }
}
```

- **400** — Bad Request / Validation Error
- **401** — Unauthorized (missing/invalid token)
- **403** — Forbidden (unverified email, deactivated account)
- **404** — Not Found
- **423** — Account Locked
- **429** — Too Many Requests (rate limited)
- **500** — Internal Server Error (details hidden in production)

---

## 👤 Default Admin Credentials

- **Username:** `admin`
- **Password:** Set via `ADMIN_PASSWORD` environment variable

On first login, a super admin account is automatically created with full permissions.

---

## 🚀 Deployment

The backend is configured for deployment on **Azure App Service** (`.deployment` file present) and works seamlessly behind reverse proxies like **Vercel**, **Nginx**, or **Azure**.

### CORS Allowed Origins
```
http://localhost:5173
http://localhost:5174
https://voyar.vercel.app
https://www.voyareyewear.com
https://voyareyewear.com
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Configure all required environment variables
- [ ] Set up Razorpay webhook URL
- [ ] Set up Shiprocket webhook URL
- [ ] Configure Gmail App Password for email
- [ ] Set up MongoDB Atlas with proper network access rules
- [ ] Configure Shiprocket pickup location

---

## 📄 License

**ISC**
