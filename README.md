# Job Board Backend Platform 💼

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

A RESTful backend API powering a multi-tenant tech job board platform. The platform connects **Employers**, **Candidates**, and **Admins** with support for account authentication, subscription plan billing, Stripe Checkout & idempotent webhook processing, AI-assisted content generation (Groq LLM), Cloudinary file storage, search filtering with saved queries, and push notifications.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [User Roles & Capabilities](#-user-roles--capabilities)
- [Core Features](#-core-features)
- [System Architecture & Request Lifecycle](#-system-architecture--request-lifecycle)
- [Tech Stack](#-tech-stack)
- [Authentication & Authorization](#-authentication--authorization)
- [Core Business Flows](#-core-business-flows)
  - [1. Job Moderation & Expiration Lifecycle](#1-job-moderation--expiration-lifecycle)
  - [2. Stripe Payment & Webhook Synchronization](#2-stripe-payment--webhook-synchronization)
  - [3. Candidate Application Lifecycle](#3-candidate-application-lifecycle)
- [Important Business Rules](#-important-business-rules)
- [API Capabilities](#-api-capabilities)
- [Module Breakdown](#-module-breakdown)
- [Project & Directory Structure](#-project--directory-structure)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [NPM Scripts & Running the Project](#-npm-scripts--running-the-project)
- [Local Stripe Webhook Testing](#-local-stripe-webhook-testing)

---

## 💡 Project Overview

The **Job Board Backend** provides a production-grade API for hiring platforms. It addresses key technical and commercial requirements:

- **SaaS Monetization**: Tiered subscription plans (Free, Basic, Premium) with quota enforcement on job postings.
- **Payment Reliability**: Cryptographic Stripe webhook signature verification combined with atomic database deduplication locks to prevent double-billing.
- **AI Integration**: AI LLM services powered by Groq to assist employers with job description drafting and candidates with tailored cover letters.
- **Zero-Cron Period Rolling**: Lazy date arithmetic that resets monthly subscription quotas automatically upon expiration without background worker overhead.

---

## 🌟 User Roles & Capabilities

### 🏢 Employer Role (`role: "employer"`)
- **Company Profile Setup**: Manage company details, industry, website, and Cloudinary logo uploads.
- **Subscription Management**: Auto-provisioned a 30-day Free plan ($0, 5 jobs/mo). Upgrade to **Basic** (15 jobs/mo) or **Premium** (Unlimited) via Stripe Checkout.
- **Job Posting & Quota Verification**: Create job listings with taxonomy references (Category, Technologies). Quotas are verified against active billing windows.
- **AI Job Description Generator**: Generate structured Job Descriptions, Responsibilities, and Requirements using Groq AI (`openai/gpt-oss-20b`).
- **Applicant Review Pipeline**: Review candidate applications, inspect PDF resumes, and update candidate statuses (`submitted` → `under_review` → `accepted` / `rejected`).

### 👤 Candidate Role (`role: "candidate"`)
- **Profile & Resume Setup**: Manage headline, bio, location, portfolio link, experience level, skill taxonomy tags, and Cloudinary PDF resume uploads.
- **Search & Saved Queries**: Search jobs with multi-field filters (query, location, category, work type, salary bounds, date range). Save search queries for future execution.
- **Wishlist & Bookmarks**: Bookmark job listings with unique candidate-job lock protection.
- **AI Cover Letter Generator**: Generate tailored cover letters under 350 words matching candidate resume text to target job requirements.
- **Application Tracking**: Submit applications with attached resumes and track status or cancel applications.

### 🛡️ Admin Role (`role: "admin"`)
- **Job Moderation**: Review pending job posts and approve or reject them with feedback reasons.
- **User Account Moderation**: List registered users, block/unblock accounts (instantly revoking access), or soft-delete accounts.
- **Comment Thread Moderation**: Inspect reported user comments and execute soft-deletions (`deletedAt`).
- **Platform Analytics**: Inspect aggregate statistics for users, job states, applications, and active subscriptions.

---

## 🎨 Core Features

- **Authentication & Security**: Dual-token authentication with 1-day JWT access tokens and 7-day SHA-256 hashed refresh tokens stored in database sessions.
- **Subscription Engine**: Stripe customer creation, checkout session generation, in-place subscription updates with proration, and lazy period rolling.
- **Idempotent Webhooks**: Raw body webhook parsing, signature verification, and atomic `StripeEvent` idempotency locks.
- **AI Content Services**: Groq LLM completions (`openai/gpt-oss-20b`) for job description generation, cover letter generation, and interactive chatbot assistant.
- **Taxonomy Tagging**: Reference models for Category, Technology, and Skill taxonomies with case-insensitive upserts.
- **Media & File Storage**: Cloudinary stream uploads for employer logos and candidate PDF resumes.
- **Device Push Alerts**: OneSignal REST API push notification delivery backed by in-app notification records.

---

## 🏗️ System Architecture & Request Lifecycle

The application is structured as a **Layered Modular Monolith** written in TypeScript for Node.js.

```text
                                  ┌───────────────────────────┐
                                  │   Client Applications     │
                                  └─────────────┬─────────────┘
                                                │ REST API / HTTP
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────┐
│                               EXPRESS 5 APP (src/app.ts)                           │
│                                                                                    │
│  ┌──────────────────────┐   ┌──────────────────────┐   ┌────────────────────────┐  │
│  │ Stripe Webhooks Raw  │   │   Auth & Session     │   │ Zod Validate           │  │
│  │ (/api/webhooks raw)  │   │  (JWT & Session DB)  │   │ (Request Validation)   │  │
│  └──────────┬───────────┘   └──────────┬───────────┘   └───────────┬────────────┘  │
│             │                          │                           │               │
│  ┌──────────▼──────────────────────────▼───────────────────────────▼────────────┐  │
│  │                                MODULE ROUTERS                                │  │
│  │ auth | employer | candidate | job | application | subscription | search...   │  │
│  └──────────┬──────────────────────────────────────────────────────┬────────────┘  │
│             │                                                      │               │
│  ┌──────────▼──────────────────────────────────────────────────────▼────────────┐  │
│  │                                MODULE SERVICES                               │  │
│  │ Quota Checks | State Machines | Period Rolling | Webhook Sync | AI Services  │  │
│  └──────────┬──────────────────────────────────────────────────────┬────────────┘  │
│             │                                                      │               │
└─────────────┼──────────────────────────────────────────────────────┼───────────────┘
              │                                                      │
              ▼                                                      ▼
┌───────────────────────────┐                            ┌───────────────────────────┐
│     EXTERNAL INTEGRATIONS │                            │    DATA LAYER (MongoDB)   │
├───────────────────────────┤                            ├───────────────────────────┤
│ • Stripe (Checkout/Events)│                            │ Mongoose Schemas (16):    │
│ • Groq AI (LLM Models)    │                            │ User, Session, Job, App,  │
│ • Cloudinary (Uploads)    │                            │ Plan, Subscription, etc.  │
│ • OneSignal (Push Alerts) │                            │ StripeEvent, Comment...   │
└───────────────────────────┘                            └───────────────────────────┘
```

### Request Lifecycle Path
1. **Webhook Exemption**: `/api/webhooks` is mounted before `express.json()` to preserve raw body buffers for Stripe signature verification.
2. **Global Middlewares**: `express.json()`, `cookieParser()`, and `cors()` process incoming standard HTTP requests.
3. **Module Routing**: Express router matches prefix paths (e.g. `/api/auth`, `/api/jobs`).
4. **Authentication (`authMiddleware`)**: Validates Bearer JWT, inspects `Session` in DB, and checks `is_blocked === false`.
5. **Authorization (`authorize`)**: Verifies role permissions (`admin`, `employer`, `candidate`).
6. **Validation (`validate`)**: Runs Zod schema parsing on `body`, `query`, `params`, and `cookies`.
7. **Controller & Service Execution**: Business logic, database operations, and external SDK integrations execute.

---

## 🛠️ Tech Stack

- **Runtime & Language**: Node.js (ESM), TypeScript (`tsx`, `tsc`)
- **Framework**: Express 5 (`express@^5.2.1`)
- **Database & ODM**: MongoDB with Mongoose (`mongoose@^9.9.3`)
- **Validation & Security**: Zod (`zod@^4.4.3`), Bcrypt (`bcrypt`/`bcryptjs`), Cookie Parser
- **Payment Processing**: Stripe Node SDK (`stripe@^22.6.0`), Stripe CLI (`@stripe/cli@^1.50.6`)
- **AI LLM Services**: Groq SDK (`groq-sdk@^1.6.0`) with model `openai/gpt-oss-20b`
- **File Storage**: Cloudinary (`cloudinary@^2.11.0`) & Multer memory storage (`multer@^2.2.0`)
- **Push Notifications**: OneSignal REST API

---

## 🔒 Authentication & Authorization

- **Dual-Token Security**: 1-day JWT access tokens paired with 7-day SHA-256 hashed refresh tokens stored in database `Session` documents (`src/models/session.model.ts`).
- **HTTP-Only Cookies**: Refresh tokens are returned exclusively in HTTP-only, `sameSite=strict` cookies (`path: "/api/auth/refresh"`).
- **Instant Revocation**: Protected routes validate session state in database on every request. Blocking a user (`is_blocked = true`) or logging out revokes access immediately across all active JWT access tokens.
- **Role Guards**: Middleware `authorize('admin', 'employer', 'candidate')` enforces access control per endpoint.

---

## 🔄 Core Business Flows

### 1. Job Moderation & Expiration Lifecycle

```text
               ┌───────────────────────────┐
               │       Job Drafted         │
               │      (status: draft)      │
               └─────────────┬─────────────┘
                             │
                             ▼
               ┌───────────────────────────┐
               │   Submitted by Employer   │
               │ (status: pending_approval)│
               └─────────────┬─────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────────┐     ┌───────────────────────────┐
│     Approved by Admin     │     │     Rejected by Admin     │
│    (status: approved)     │     │    (status: rejected)     │
└─────────────┬─────────────┘     └───────────────────────────┘
              │
      ┌───────┴───────┐
      ▼               ▼
┌───────────┐   ┌───────────┐
│  Closed   │   │  Expired  │
│(Employer) │   │(Deadline) │
└───────────┘   └───────────┘
```

---

### 2. Stripe Payment & Webhook Synchronization

```text
 Employer Initiates Checkout (POST /api/subscriptions/checkout)
                           │
                           ▼
 Create/Retrieve Stripe Customer & Create Checkout Session
                           │
                           ▼
 Employer Completes Payment on Stripe Host
                           │
                           ▼
 Stripe POST /api/webhooks/stripe (Raw HTTP Body + Stripe-Signature)
                           │
                           ▼
 ┌──────────────────────────────────────────────────────────┐
 │ 1. Construct Event & Verify Cryptographic Signature      │
 └─────────────────────────┬────────────────────────────────┘
                           │
                           ▼
 ┌──────────────────────────────────────────────────────────┐
 │ 2. Idempotency Lock: StripeEvent.create({ id, status })  │
 │    If Duplicate Key Error (code 11000) -> Return 200 OK  │
 └─────────────────────────┬────────────────────────────────┘
                           │
                           ▼
 ┌──────────────────────────────────────────────────────────┐
 │ 3. Process Event (`invoice.paid` / `payment_failed` etc) │
 │    - Update local `Subscription` status = 'active'       │
 │    - Roll period dates forward                           │
 │    - Record completed `Payment` transaction in ledger    │
 │    - Dispatch notification to Employer                   │
 └─────────────────────────┬────────────────────────────────┘
                           │
                           ▼
 Update StripeEvent Status = 'processed' & Return 200 OK
```

---

### 3. Candidate Application Lifecycle

```text
               ┌───────────────────────────┐
               │    Application Submitted  │
               │    (status: submitted)    │
               └─────────────┬─────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐
│ Under Review │     │  Cancelled   │     │  Direct Decision  │
│ (employer    │     │(by candidate)│     │(accepted/rejected)│
│  views app)  │     └──────────────┘     └─────────┬─────────┘
└──────┬───────┘                                    │
       │                                            │
       └─────────────────────┬──────────────────────┘
                             │
                             ▼
               ┌───────────────────────────┐
               │     Terminal Decision     │
               │   accepted  |  rejected   │
               └───────────────────────────┘
```

---

## 📌 Important Business Rules

- **Single Profile Constraint**: A `User` document cannot contain both `employerProfile` and `candidateProfile`. Pre-validate schema hooks clean up non-applicable profiles based on `role`.
- **Job Posting Quota Limit**: `checkJobPostingQuota` checks created jobs in the active billing window against `plan.job_post_limit` before allowing job creation.
- **Single Application Constraint**: A candidate can apply to a specific job only once. Enforced by a compound unique index `{ job_id: 1, candidate_id: 1 }` on `Application`.
- **Unique Candidate View Counter**: Candidate views increment `Job.views_count` once per candidate. Enforced by a compound unique index `{ job_id: 1, candidate_id: 1 }` on `JobView`.
- **Webhook Idempotency**: Stripe webhooks execute idempotently using `StripeEvent` collection duplicate key catches (`code === 11000`).
- **Lazy Period Rolling**: Subscription billing windows automatically roll forward by 30-day or 365-day intervals when accessed after expiration.

---

## ⚡ API Capabilities

### 🔓 Unauthenticated Endpoints
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/jobs
GET  /api/jobs/:id
GET  /api/subscriptions/plans
GET  /api/categories
GET  /api/technologies
GET  /api/skills
GET  /api/health
```

### 👤 Candidate Endpoints
```http
GET   /api/candidate/me
PATCH /api/candidate/me
PUT   /api/candidate/me/skills
PATCH /api/candidate/me/resume
POST  /api/application/cover-letter
POST  /api/application/apply/:jobId
GET   /api/application/me
POST  /api/application/:id/cancel
GET   /api/search/jobs
POST  /api/search/saved
GET   /api/search/saved
DELETE /api/search/saved/:id
POST  /api/search/saved/:id/apply
POST  /api/wishlist/:jobId
GET   /api/wishlist
DELETE /api/wishlist/:jobId
POST  /api/comments
POST  /api/comments/:id/report
```

### 🏢 Employer Endpoints
```http
GET   /api/employer/me
PATCH /api/employer/me
PATCH /api/employer/me/logo
POST  /api/jobs
POST  /api/jobs/generate-description
PATCH /api/jobs/:id
PATCH /api/jobs/:id/close
DELETE /api/jobs/:id
GET   /api/application/job/:jobId
PATCH /api/application/:id/status
POST  /api/subscriptions/checkout
GET   /api/subscriptions/current
POST  /api/subscriptions/cancel
GET   /api/subscriptions/payments
```

### 🛡️ Admin Endpoints
```http
GET   /api/admin/jobs/pending
POST  /api/admin/jobs/:id/approve
POST  /api/admin/jobs/:id/reject
GET   /api/admin/users
PATCH /api/admin/users/:id/block
PATCH /api/admin/users/:id/unblock
DELETE /api/admin/users/:id
GET   /api/admin/comments/reported
GET   /api/admin/stats
```

### 💳 Webhook Endpoint
```http
POST /api/webhooks/stripe
```

---

## 🧩 Module Breakdown

The codebase is organized into **17 feature modules** in `src/modules`:

- `src/modules/auth`: Authentication, registration, Bcrypt hashing, JWT issuance, session management.
- `src/modules/employer`: Employer company profile updates and Cloudinary logo stream uploads.
- `src/modules/candidate`: Candidate profile, experience level, skill tag upserts, and PDF resume uploads.
- `src/modules/job`: Job creation, taxonomy references, view counter locks, status state machine, AI job description drafting.
- `src/modules/application`: Application submissions, PDF attachments, status reviews, cover letter AI generation.
- `src/modules/subscription`: Plan management, Stripe Checkout, in-place upgrades, lazy period rolling, quota calculations.
- `src/modules/webhook`: Stripe webhook signature verification, `StripeEvent` idempotency lock, payment ledger processing.
- `src/modules/search`: Multi-param search filtering, pagination, saved filter queries (`SavedSearch`).
- `src/modules/wishlist`: Job bookmarking system with unique index locks.
- `src/modules/comment`: Job discussion threads, user reporting flags, and admin soft-deletions.
- `src/modules/notification`: Notification records and OneSignal REST API push notification delivery.
- `src/modules/chatbot`: Interactive AI virtual assistant using Groq SDK (`openai/gpt-oss-20b`).
- `src/modules/category`, `technology`, `skill`: Taxonomy reference CRUD services.
- `src/modules/admin`: Job moderation, user moderation (block/unblock/delete), comment moderation, system stats.
- `src/modules/health`: System health check endpoint.

---

## 📂 Project & Directory Structure

```text
upwork/
├── .env.example                       # Shared environment variable template
├── package.json                       # Dependencies & NPM scripts
├── tsconfig.json                      # TypeScript compiler configuration
├── vercel.json                        # Vercel deployment configuration
│
├── api/                               # Vercel serverless entry point
│   └── index.ts
│
└── src/                               # Application source code
    ├── app.ts                         # Express app setup & route mounting
    ├── server.ts                      # Server entry point & DB connection
    ├── config/                        # Database connection config (`db.ts`)
    ├── error/                         # Custom AppError class
    ├── middlewares/                   # Auth, Upload, Validation middlewares
    ├── models/                        # 16 Mongoose data models
    ├── modules/                       # 17 Feature modules
    ├── seeds/                         # Admin & Subscription plan seeders
    ├── types/                         # Global TypeScript type definitions
    └── utils/                         # Stripe, Groq AI, Cloudinary, OneSignal, JWT utils
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` in the root directory:

```env
# Server & Database Configuration
PORT=5000
MONGO_URL=mongodb://localhost:27017/job-board-db
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Groq AI SDK
GROQ_API_KEY=gsk_...

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OneSignal Push Notifications
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_API_KEY=your_onesignal_api_key
```

---

## ⚡ Setup & Installation

### 1. Install Dependencies
```bash
git clone https://github.com/techmasterycompany-star/upwork_nodejs.git
cd upwork_nodejs
npm install
```

### 2. Seed Database Initial Data
- **Seed Subscription Plans** (Free, Basic, Premium):
  ```bash
  npm run seed-plans
  ```
- **Seed Default Admin User**:
  ```bash
  npm run seed-admin
  ```

---

## 📜 NPM Scripts & Running the Project

| Script | Command | Purpose |
| ------ | ------- | ------- |
| `npm run dev` | `tsx watch src/server.ts` | Start local development server with hot-reloading |
| `npm run build` | `tsc` | Compile TypeScript source code into `dist/` |
| `npm run start` | `node dist/server.js` | Run compiled production server |
| `npm run seed-admin` | `tsx src/seeds/admin.seed.ts` | Bootstrap default admin user in database |
| `npm run seed-plans` | `tsx src/seeds/plans.seed.ts` | Bootstrap Free, Basic, and Premium subscription plans |

---

## 🧪 Local Stripe Webhook Testing

To test Stripe webhooks locally during development:

1. **Install & Login to Stripe CLI**:
   ```bash
   stripe login
   ```
2. **Forward Webhook Events to Local Server**:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
3. Copy the output signing secret (`whsec_...`) into your `.env` file as `STRIPE_WEBHOOK_SECRET`.
4. Trigger test events:
   ```bash
   stripe trigger invoice.paid
   ```