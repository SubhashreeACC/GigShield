# GigShield – Tech Stack Recommendation (2026)

## Quick Reference

| Layer | Choice | Key Reason |
|---|---|---|
| Web | Next.js 15 | Server components, India CDN via Vercel edge |
| Mobile | Expo (React Native) | GPS + push notifications; shared code with web |
| Auth | Clerk | Phone OTP, DPDP-friendly, fraud signals |
| API | Node.js 22 + Fastify | PRD-aligned, 3× faster than Express |
| AI / ML | Python + FastAPI | Isolates ML runtime from Node cleanly |
| Payments | Razorpay | Only real UPI Autopay + instant payout option in India |
| Database | PostgreSQL 16 + Prisma | PRD-specified; ledger model for claims |
| Cache | Redis 7 (Upstash) | API caching + BullMQ backbone |
| Events (MVP) | BullMQ | Simple, reliable, no Kafka ops overhead |
| Events (Scale) | Kafka | Phase 2 only, when volume demands it |
| Deploy (MVP) | Vercel + Railway | Fastest time-to-production |
| Deploy (Prod) | AWS Mumbai (ECS + RDS) | Data residency, latency, RBI compliance |

---

## Frontend — React 19 + Next.js 15 (Web) + Expo (Mobile)

The PRD specifies React for both web and mobile. **Next.js 15** with the App Router is the clear 2026 choice for the web dashboard — server components reduce bundle size significantly, and its built-in API routes can handle lightweight BFF (backend-for-frontend) logic. For mobile, **Expo SDK 52+** (React Native) lets you share ~70% of business logic and component code with the web app.

**State management:**
- **Zustand** — lightweight client state, no boilerplate
- **React Query v5** — server-state and cache management, critical for real-time trigger/payout status polling

> **Why not a PWA?** GigShield needs push notifications for payout alerts and GPS location access. Native beats PWA for this use case.

---

## Auth — Clerk (or Supertokens as fallback)

The PRD requires mobile OTP login for delivery workers. **Clerk** in 2026 has first-class support for phone/OTP flows, React Native SDKs, and a generous free tier — ideal for a gig-worker base that won't have corporate SSO. It handles session management, device trust, and fraud signals (multiple logins per device) out of the box, which dovetails with GigShield's fraud detection requirements.

> **Alt:** If you need full data sovereignty in India (DPDP Act compliance), **self-hosted Supertokens** is the open-source alternative.

---

## Backend — Node.js 22 LTS + Fastify

The PRD already calls for Node.js. **Fastify** (over Express) is the right 2026 choice:

- ~3× faster throughput than Express
- First-class plugin system
- Schema-based validation with JSON Schema — aligns well with parametric trigger contracts

Use **tRPC** for the Next.js ↔ Fastify channel to get end-to-end type safety without REST boilerplate.

### AI / ML Layer — Python + FastAPI

Keep the AI/ML layer in Python (FastAPI + Scikit-learn / XGBoost for MVP risk scoring). Expose it as an internal microservice called by the Node backend. This respects the PRD's architecture split and avoids mixing runtimes.

---

## Payments — Razorpay

For India, **Razorpay** is the clear winner over Stripe:

- **UPI Autopay** for weekly subscription renewals
- **UPI Payouts** for the sub-15-minute instant payout requirement
- **Paytm / PhonePe wallet** support built-in
- Stripe's Indian operations are limited by RBI regulations

Use Razorpay Sandbox for MVP, production for go-live.

---

## Database — PostgreSQL 16 + Prisma ORM + Redis

The PRD calls this out directly.

### PostgreSQL 16
- Logical replication improvements useful for the event ledger
- Model `claims` and `payouts` tables as **append-only ledgers** — never update a payout row, only insert. Non-negotiable for audit trails in a financial product.

### Prisma ORM
- Type-safe DB access
- Clean migration history

### Redis 7 (Upstash for serverless, or self-hosted)
- Rate limiting on trigger APIs
- Caching AQI / weather API responses (cost reduction)
- Pub/sub channel for fast payout status updates to connected clients

---

## Event Engine — BullMQ + Redis (MVP) → Kafka (Phase 2)

### MVP: BullMQ
**BullMQ** (Redis-backed job queues) is far simpler to operate than Kafka and handles the trigger → eligibility check → payout pipeline perfectly:

- Delayed jobs and retries
- Dead-letter queues for failed payouts
- No separate cluster to manage

### Phase 2: Apache Kafka (or Confluent Cloud)
Migrate to Kafka only when:

- Event volume exceeds what Redis can handle
- You need event replay for audit / fraud analysis

> **Key decision:** Don't pay for Kafka complexity until you need it. BullMQ handles thousands of payout jobs/day on Redis with full reliability.

---

## External APIs (Trigger Data Sources)

| Purpose | API | MVP approach |
|---|---|---|
| Weather | OpenWeather / IMD | Live API |
| Pollution | AQI API | Live API |
| Traffic | Google Maps API | Mocked |
| Delivery platform data | Zomato / Swiggy | Simulated logs |

---

## Deployment

### MVP — Vercel + Railway / Render

| Service | Hosts |
|---|---|
| Vercel | Next.js frontend (zero-config, edge middleware, India CDN) |
| Railway / Render | Node.js + Python backend services (Docker, managed Postgres) |

Both platforms have Mumbai / Asia regions and are optimised for fast iteration.

### Production Scale — AWS Mumbai (`ap-south-1`)

| AWS Service | Purpose |
|---|---|
| ECS Fargate | Containerised backend services |
| RDS Aurora PostgreSQL | Multi-AZ managed database |
| ElastiCache | Managed Redis |
| CloudFront | CDN for static assets |

AWS Mumbai is chosen for data residency, low latency to Indian users, and RBI / DPDP compliance requirements.

---

## Observability — OpenTelemetry + Grafana Cloud

Instrument everything with **OpenTelemetry** (vendor-neutral) from day one — traces, metrics, and logs — shipping to **Grafana Cloud** (generous free tier).

**Critical alerts to configure:**
- Payout latency > 15 minutes (KPI breach)
- Loss ratio drift outside 60–75% target
- Trigger accuracy drops below 90%
- Fraud detection precision drops below 85%

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND                                           │
│  Next.js 15 (web)     Expo / React Native (mobile)  │
│  Zustand + React Query v5                           │
└───────────────────┬─────────────────────────────────┘
                    │ tRPC / REST
┌───────────────────▼─────────────────────────────────┐
│  AUTH                                               │
│  Clerk (OTP phone login)  ← Supertokens (alt)        │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│  BACKEND                                            │
│  Node.js 22 + Fastify (API)                         │
│  Python + FastAPI (AI / risk scoring microservice)  │
│  Razorpay (UPI Autopay + instant payouts)           │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│  DATA                                               │
│  PostgreSQL 16 + Prisma (append-only ledger)        │
│  Redis 7 / Upstash (cache + rate limiting)          │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│  EVENT ENGINE                                       │
│  BullMQ (MVP) → Kafka / Confluent (Phase 2)         │
│  OpenWeather + AQI APIs (trigger data sources)      │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│  DEPLOYMENT                                         │
│  MVP: Vercel (frontend) + Railway (backend)         │
│  Prod: AWS Mumbai — ECS Fargate + RDS Aurora        │
│  Observability: OpenTelemetry + Grafana Cloud       │
└─────────────────────────────────────────────────────┘
```

---

## MVP vs Phase 2 Scope

| Concern | MVP | Phase 2 |
|---|---|---|
| Event queue | BullMQ (Redis) | Kafka / Confluent |
| ML model | Scikit-learn / XGBoost | TensorFlow time-series |
| Auth hosting | Clerk (managed) | Supertokens (self-hosted) |
| Deployment | Vercel + Railway | AWS ECS + RDS Aurora |
| Platform integrations | Mocked delivery logs | Real Swiggy / Zomato APIs |
| Fraud detection | Rule-based | ML hybrid engine |
