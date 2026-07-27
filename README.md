# FixHub

A Nepal-focused home services marketplace that connects customers with verified professionals for plumbing, electrical, HVAC, painting, and related work.

## Problem Statement

Homeowners in Kathmandu Valley struggle to find trustworthy technicians quickly. Informal hiring lacks verified credentials, transparent pricing, and dispute handling. FixHub addresses this with:

1. **Verified professionals** — admins review business/industrial licenses before pros can list services.
2. **Bookable services** — customers book at a scheduled time with escrow-held payment.
3. **Tracked job lifecycle** — bookings move through a controlled state machine.
4. **Trust loop** — post-job reviews update service and professional ratings.

## Decomposition of Sub-problems

| Sub-problem | Approach |
|---|---|
| Identity & roles | JWT auth; roles `customer`, `professional`, `admin`; Google OAuth optional |
| Trust & compliance | Pro uploads license → admin verifies → gate service CRUD |
| Catalog | Service listings by category with search indexes |
| Booking | State machine `pending → confirmed → in_progress → completed/cancelled` |
| Double-booking | Partial unique index on `(professionalId, scheduledAt)` for active statuses |
| Payments (simulated) | Wallet + escrow hold on book, release on complete, refund on cancel |
| Quality feedback | One review per completed booking; averages on Service & User |
| Support | Tickets linked to booking IDs |
| Engineering quality | Zod validation middleware, Winston logging, Morgan HTTP logs, Jest unit tests |

## Architecture

```
Browser (Next.js :3000)
    │  rewrite /api → Express
    ▼
Express API (:5000)
    │
    ▼
MongoDB (users, services, bookings, wallets, transactions, reviews, tickets)
```

**Layers:** Routes → Controllers → Services → Models/Repositories  
**Auth:** Bearer JWT and/or HTTP-only cookie

## Roles & Use Cases

```mermaid
flowchart LR
  subgraph actors [Actors]
    Customer
    Professional
    Admin
  end

  Customer -->|Register_Login| Auth
  Professional -->|Register_UploadLicense| Auth
  Admin -->|VerifyProfessional| Users
  Professional -->|CreateService| Services
  Customer -->|TopUpWallet_Book| Bookings
  Professional -->|Confirm_Start_Complete| Bookings
  Bookings -->|Hold_Release_Refund| Escrow
  Customer -->|RateCompletedJob| Reviews
  Customer -->|ReportIssue| Tickets
  Admin -->|ManageUsers_Tickets| AdminPanel
```

## Status of Completeness Checklist

| Item | Status |
|---|---|
| Booking state machine | Done |
| Escrow / wallet simulation | Done |
| Review & rating loop | Done |
| Global error handler | Done (Express middleware + Winston) |
| Zod request validation middleware | Done (`validateBody`) |
| DB indexing | Done (users, services, bookings, tickets) |
| Root README / academic docs | Done (this file) |
| Env security | Done (`.env.example`, fail-fast in production) |
| Logging | Done (Morgan + Winston) |
| Jest unit tests | Done (`npm test` in backend) |

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env
# set SECRET_KEY, SESSION_SECRET, MONGO_URI
npm install
npm run seed          # optional admin user
npm run dev           # http://localhost:5000
npm test              # booking + escrow unit tests
```

Default seeded admin (if using seed script): `admin@fixhub.com` / `admin123`

### Frontend

```bash
cd frontend
npm install
npm run dev           # http://localhost:3000
```

## Key API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register (pros may upload verification doc) |
| POST | `/api/v1/auth/login` | Login → JWT cookie |
| PATCH | `/api/v1/admin/verify-pro/:id` | Admin verifies professional |
| GET/POST | `/api/v1/services` | Browse / create services |
| GET/POST | `/api/v1/wallet` / `/topup` | Wallet balance & demo top-up |
| GET/POST | `/api/v1/bookings` | List / create bookings |
| PATCH | `/api/v1/bookings/:id/status` | `{ action: confirm\|start\|complete\|cancel }` |
| POST | `/api/v1/reviews` | Rate a completed booking |
| GET | `/api/v1/reviews/service/:serviceId` | List reviews |
| POST | `/api/v1/things` | Create a protected Thing resource |

## New Thing API Resource

The backend now supports a new protected resource for creating `Thing` records with a clean, modular API flow.

- **Route:** `POST /api/v1/things`
- **Security:** JWT-protected via `backend/src/middlewares/jwtAuth.middleware.ts`
- **Purpose:** allow authenticated users to create a new `Thing` with a name and optional description.
- **Layers:** route → service → repository → model

### CRUD Operation Summary

The new `Thing` API follows the same layered architecture as existing modules. The request flow is:

1. Route receives `POST` request with `name` and optional `description`
2. JWT middleware validates the user token and attaches user context
3. Service logic creates the resource and records ownership
4. Repository saves the document to MongoDB

This ensures separation of concerns and consistent behavior with other backend modules.

### Authentication & Authorization

Access is gated by the existing JWT auth middleware so only authenticated users can create a `Thing`.
The middleware reads the `Authorization: Bearer <token>` header and rejects requests without valid credentials.

### Testing Summary

A test was added to validate the new API behavior. The endpoint is covered by an integration-style test in `backend/src/__tests__/thing.integration.test.ts`.

- Verifies `POST /api/v1/things` returns `201` for authenticated requests
- Confirms the response uses the shared `ApiResponseHelper` success format
- Runs as part of the backend Jest suite

## Demo Script (Presentation)

1. Register as professional → upload license → login as admin → verify pro.
2. Pro posts a service.
3. Customer tops up wallet → books service → escrow **held**.
4. Pro **confirm → start → complete** → escrow **released**.
5. Customer leaves a review → average rating updates on the service.
6. Show `npm test` and this README use-case diagram.
7. Highlight **verification flow** as the trust USP.

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind
- **Backend:** Express 5, TypeScript, Mongoose, Zod, Passport Google OAuth
- **DB:** MongoDB
- **Logging:** Morgan + Winston
- **Tests:** Jest + ts-jest

## License

Academic / college project — FixHub.
