# 🛡️ GigShield — Project Todo List

> **Scope:** MVP (Phase 1) as defined in the PRD
> **Stack:** Next.js 15 · Fastify · Python FastAPI · PostgreSQL 16 · Prisma · Redis · BullMQ · Clerk · Razorpay · Expo

Each task is **atomic** — complete one before moving to the next. No overlapping dependencies.

---

## Phase 1 — Project Scaffolding & Monorepo Setup

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 1 | Initialize monorepo root | Create root `package.json`, set up workspace structure (`apps/`, `packages/`, `services/`). Add `.gitignore`, `.editorconfig`, `.nvmrc` (Node 22). | Monorepo skeleton |
| 2 | Scaffold Next.js 15 web app | `npx -y create-next-app@latest apps/web` — App Router, TypeScript, ESLint. No Tailwind (use vanilla CSS per Design doc). | `apps/web` boots on `localhost:3000` |
| 3 | Create global CSS design system | Implement `globals.css` with Design doc tokens: colors (#0B1F3A, #00D084, #4DA6FF, #FF8A00, #F7F9FC, #1A1A1A), typography (Inter + Poppins via Google Fonts), 8pt spacing scale, button styles, card styles, rounded corners (8–12px). | Design system CSS file |
| 4 | Scaffold Fastify backend | Create `apps/api` with Fastify + TypeScript. Add `dotenv`, JSON Schema validation plugin, CORS config. Verify it boots on `localhost:4000`. | `apps/api` boots cleanly |
| 5 | Scaffold Python FastAPI ML service | Create `services/ml` with FastAPI + `uvicorn`. Add `requirements.txt` (fastapi, uvicorn, scikit-learn, pandas, numpy). Add health endpoint. | `services/ml` boots on `localhost:8000/health` |
| 6 | Add shared TypeScript config | Create `packages/tsconfig` with base tsconfig shared across `apps/web` and `apps/api`. | Shared TS config |
| 7 | Set up environment variables | Create `.env.example` files in each app/service. Document all required env vars (DB URL, Redis URL, Clerk keys, Razorpay keys, OpenWeather key, AQI API key). | `.env.example` files |

---

## Phase 2 — Database & Prisma ORM

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 8 | Install and configure Prisma | Add Prisma to `apps/api`. Run `npx prisma init`. Point `DATABASE_URL` to local PostgreSQL 16 instance. | Prisma initialized with `schema.prisma` |
| 9 | Define `User` model | Fields: `id`, `phone`, `name`, `platform` (Swiggy/Zomato), `city`, `zone`, `lat`, `lng`, `createdAt`, `updatedAt`. | Prisma schema + migration |
| 10 | Define `Plan` model | Fields: `id`, `name` (Basic/Standard/Pro), `weeklyPremium` (29/59/99), `coverageAmount` (500/1000/2000), `isActive`. Seed with 3 fixed plans. | Prisma schema + seed script |
| 11 | Define `Subscription` model | Fields: `id`, `userId`, `planId`, `status` (active/expired/cancelled), `startDate`, `endDate`, `autoRenew`, `razorpaySubscriptionId`. | Prisma schema + migration |
| 12 | Define `TriggerEvent` model | Fields: `id`, `type` (rain/heat/aqi/curfew/traffic), `city`, `zone`, `severity`, `rawData` (JSON), `source`, `detectedAt`, `thresholdBreached`. | Prisma schema + migration |
| 13 | Define `Claim` model (append-only ledger) | Fields: `id`, `userId`, `subscriptionId`, `triggerEventId`, `status` (pending/approved/rejected/paid), `amount`, `fraudScore`, `createdAt`. **No update — insert only.** | Prisma schema + migration |
| 14 | Define `Payout` model (append-only ledger) | Fields: `id`, `claimId`, `userId`, `amount`, `method` (upi/wallet), `razorpayPayoutId`, `status` (initiated/success/failed), `createdAt`. **No update — insert only.** | Prisma schema + migration |
| 15 | Define `FraudCheck` model | Fields: `id`, `claimId`, `userId`, `checkType` (location/activity/duplicate/anomaly), `passed`, `details` (JSON), `checkedAt`. | Prisma schema + migration |
| 16 | Run all migrations & verify | Run `npx prisma migrate dev`. Verify all tables created. Run seed script for plans. | Database fully migrated and seeded |

---

## Phase 3 — Authentication (Clerk)

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 17 | Create Clerk project | Set up Clerk project in dashboard. Enable **Phone + OTP** as primary auth method. Get publishable + secret keys. | Clerk project configured |
| 18 | Integrate Clerk in Next.js frontend | Install `@clerk/nextjs`. Wrap app in `<ClerkProvider>`. Add middleware for route protection. | Auth provider active |
| 19 | Build OTP login page | Create `/sign-in` page with phone number input + OTP flow. Style per Design doc (clean, large tap targets, friendly microcopy: "Enter your mobile number to get started"). | Functional OTP login screen |
| 20 | Integrate Clerk in Fastify backend | Install `@clerk/fastify`. Add auth middleware to verify session tokens on protected routes. | Backend auth verification working |
| 21 | Build post-login user sync | On first login, check if user exists in DB. If not, create `User` record with phone number. Redirect to onboarding if profile incomplete. | User auto-creation flow |

---

## Phase 4 — Backend API Core (Fastify)

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 22 | Build `GET /api/plans` endpoint | Return all active plans (Basic, Standard, Pro) with premium and coverage info. Public endpoint. | Plans API |
| 23 | Build `POST /api/users/onboard` endpoint | Accept `name`, `platform`, `city`, `zone`, `lat`, `lng`. Update user record. Mark onboarding complete. | Onboarding API |
| 24 | Build `GET /api/users/me` endpoint | Return current user profile, active subscription, risk level. Auth-protected. | User profile API |
| 25 | Build `POST /api/subscriptions` endpoint | Create new subscription for user + plan. Set `startDate` to current Monday, `endDate` to Sunday. Status = `active`. | Subscription creation API |
| 26 | Build `GET /api/subscriptions/active` endpoint | Return user's current active subscription with plan details. | Active subscription API |
| 27 | Build `GET /api/claims` endpoint | Return paginated claims history for current user. Include trigger event details and payout status. | Claims history API |
| 28 | Build `GET /api/claims/:id` endpoint | Return single claim with full detail: trigger event data, fraud check results, payout info. Transparency endpoint ("why I was paid"). | Claim detail API |
| 29 | Add global error handling middleware | Consistent error response format (`{ error, message, statusCode }`). Log errors with request context. | Error handler |
| 30 | Add request logging middleware | Log method, path, status, response time for every request. | Request logger |

---

## Phase 5 — External API Integrations

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 31 | Build OpenWeather API client | Create `services/weather.ts` in API. Fetch current weather by lat/lng. Extract temperature (°C) and rainfall (mm/hr). Cache responses in Redis (5-min TTL). | Weather data fetcher |
| 32 | Build AQI API client | Create `services/aqi.ts`. Fetch current AQI by lat/lng. Extract AQI index value. Cache in Redis (10-min TTL). | AQI data fetcher |
| 33 | Build mock traffic API client | Create `services/traffic.ts`. Return simulated traffic shutdown zones. Configurable via environment to toggle mock/real. | Mock traffic service |
| 34 | Build mock delivery platform client | Create `services/platform.ts`. Return simulated delivery logs for a user (trips, hours active, zones covered). Used for activity verification. | Mock platform service |
| 35 | Build `GET /api/weather/:city` endpoint | Expose weather data for a city. Used by frontend for disruption alerts display. | Weather API endpoint |
| 36 | Build `GET /api/triggers/status` endpoint | Return current trigger status for user's zone: is any threshold breached? Which ones? Combine weather + AQI data. | Trigger status API |

---

## Phase 6 — Parametric Trigger Engine

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 37 | Define trigger threshold config | Create `config/thresholds.ts`: temperature > 42°C, rainfall > X mm/hr, AQI > 300. Make thresholds configurable per city. | Threshold config |
| 38 | Build trigger evaluation function | `evaluateTriggers(city, zone)` — fetch latest weather + AQI data, compare against thresholds, return list of breached triggers with severity. | Core trigger logic |
| 39 | Build trigger polling scheduler | Create a cron job (BullMQ repeatable job) that runs every 15 minutes. For each active city/zone, call `evaluateTriggers()`. | Trigger polling active |
| 40 | Build trigger event recorder | When a threshold is breached, insert a `TriggerEvent` row with raw API data, breach type, and severity. Deduplicate: don't create duplicate events for same city+zone+type within 1 hour. | Trigger events persisted |
| 41 | Build affected user identifier | Given a `TriggerEvent`, query all users in that city/zone with active subscriptions. Return list of eligible user IDs. | User identification logic |
| 42 | Build trigger-to-claim pipeline | For each affected user: run fraud checks (Task 47–50), create `Claim` row if passed. Dispatch payout job to BullMQ queue. | End-to-end trigger → claim flow |

---

## Phase 7 — Event Queue & Claims Pipeline (BullMQ)

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 43 | Set up Redis connection | Install `ioredis` + `bullmq`. Create shared Redis connection config. Verify connection. | Redis connected |
| 44 | Create `trigger-processing` queue | Queue for processing trigger events → identifying affected users → creating claims. Add worker with concurrency limit. | Trigger queue + worker |
| 45 | Create `payout-processing` queue | Queue for processing approved claims → initiating payouts. Add retry logic (3 retries, exponential backoff). Add dead-letter queue for failures. | Payout queue + worker + DLQ |
| 46 | Build claim status tracker | Insert new `Claim` rows for status transitions (pending → approved → paid) as append-only ledger entries. Expose via `GET /api/claims/:id`. | Append-only claim tracking |

---

## Phase 8 — Fraud Detection (Rule-Based MVP)

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 47 | Build location validation check | Compare user's declared zone GPS (lat/lng) against trigger event zone. Flag if distance > threshold (e.g., 20km). | Location fraud check |
| 48 | Build activity verification check | Query mock delivery platform logs. Flag if user had zero activity in last 24 hours (potential non-worker). | Activity fraud check |
| 49 | Build duplicate claim detection | Check if user already has a paid/pending claim for the same trigger event type within the same week. Flag duplicates. | Duplicate claim check |
| 50 | Build fraud orchestrator | Run all fraud checks (location, activity, duplicate) for a claim. Calculate composite fraud score (0–1). Auto-approve if < 0.3, auto-reject if > 0.7, flag for review if between. Store `FraudCheck` records. | Fraud pipeline |
| 51 | Build `GET /api/admin/fraud-alerts` endpoint | Return claims flagged for manual review (fraud score 0.3–0.7). Admin-only. | Fraud alerts API |

---

## Phase 9 — Payments (Razorpay Sandbox)

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 52 | Set up Razorpay SDK | Install `razorpay` npm package. Configure with sandbox API keys. Verify connectivity. | Razorpay SDK initialized |
| 53 | Build subscription payment flow | On plan selection, create Razorpay subscription (UPI Autopay). Handle webhook for payment success/failure. Update `Subscription.status`. | Subscription payment working |
| 54 | Build payout initiation service | For approved claims, initiate Razorpay payout to user's UPI ID. Store `Payout` record with `razorpayPayoutId`. | Payout initiation |
| 55 | Build payout webhook handler | Handle Razorpay payout status webhooks (success/failed). Insert new `Payout` ledger entry with updated status. | Payout status tracking |
| 56 | Build `POST /api/subscriptions/renew` endpoint | Auto-renew active subscriptions weekly. Trigger Razorpay charge. Handle success/failure. | Weekly renewal logic |

---

## Phase 10 — AI / ML Risk Scoring (Python FastAPI)

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 57 | Build sample training dataset | Generate synthetic historical data: city, zone, season, weather stats, disruption frequency, claim rates. Save as CSV. | Training dataset |
| 58 | Train MVP risk scoring model | Use Scikit-learn (Random Forest or XGBoost). Features: city, zone, season, avg rainfall, avg temp, historical claims. Output: risk score (Low/Medium/High). | Trained model (`.pkl` file) |
| 59 | Build `POST /ml/risk-score` endpoint | Accept `city`, `zone`, `season`. Load model, return `{ riskScore, riskLevel, confidence }`. | Risk scoring API |
| 60 | Build `POST /ml/premium-suggest` endpoint | Accept `city`, `zone`, `riskLevel`. Return suggested weekly premium within ₹20–₹150 range based on risk. (MVP: use lookup table mapped to risk level). | Premium suggestion API |
| 61 | Integrate risk scoring into backend | Call ML service from Fastify `POST /api/users/onboard` to get initial risk score. Store on user profile. Call on subscription renewal for updated score. | Risk score integration |

---

## Phase 11 — Frontend (Next.js 15 Web App)

### 11a — Layout & Navigation

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 62 | Build app layout shell | Root layout with sticky top nav (web), footer. Import Inter + Poppins fonts. Apply Design doc color scheme. Mobile-first responsive. | App shell |
| 63 | Build top navigation bar | Logo, nav links (Home, Coverage, Claims, Insights, Profile). Auth-aware (show login/logout). Fintech-style: clean, minimal, sticky. | Top nav component |
| 64 | Build bottom navigation bar (mobile) | Mobile-only bottom tab bar: Home, Coverage, Claims, Insights, Profile. Large tap targets. Active state indicator with accent green. | Bottom nav component |

### 11b — Onboarding Flow

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 65 | Build onboarding step 1 — Platform select | Screen: "Which platform do you deliver for?" Radio cards for Swiggy, Zomato, Amazon. Friendly illustration. | Platform select screen |
| 66 | Build onboarding step 2 — Location | Screen: "Where do you work?" Auto-detect location (Geolocation API) + manual city/zone input fallback. | Location screen |
| 67 | Build onboarding step 3 — Plan selection | Screen: "Choose your protection plan." Three plan cards (Basic ₹29, Standard ₹59, Pro ₹99) side by side. Highlight recommended. Show weekly pricing prominently. Green CTA: "Subscribe Now". | Plan selection screen |
| 68 | Wire onboarding to APIs | Connect steps to `POST /api/users/onboard` + `POST /api/subscriptions`. Redirect to home on completion. | Onboarding flow functional |

### 11c — Home / Dashboard Screen

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 69 | Build hero coverage card | Top card: "You're Protected ✅" or "Not Covered ❌". Show active plan name, coverage amount, days remaining this week. Green accent for active. | Coverage status card |
| 70 | Build active disruption alerts section | Show current trigger status for user's zone. Cards for each active alert (e.g., "🌧️ Heavy rain detected — You're covered 👍"). Orange/warning styling. Soft bounce animation. | Disruption alerts |
| 71 | Build weekly earnings protection summary | Card showing: "This week: ₹X protected". Mini chart of weekly trend (last 4 weeks). Clean data viz per Design doc. | Earnings protection card |
| 72 | Build recent claims list | Show last 3 claims with status badges (Paid ✅, Pending ⏳). Link to full claims page. | Recent claims component |

### 11d — Claims Screen

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 73 | Build claims history page | Full paginated list of all claims. Filter by status. Each row: date, trigger type, amount, status. | Claims page |
| 74 | Build claim detail page | `/claims/[id]` — Full breakdown: what triggered it, weather data at the time, fraud check result, payout status + method. Transparency-first design. | Claim detail page |

### 11e — Plan/Coverage Screen

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 75 | Build coverage page | Show current plan details. Upgrade/downgrade options. Renewal date. Risk level badge. "Why this premium?" explainer section. | Coverage page |

### 11f — Insights Screen

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 76 | Build user insights page | Risk score display (Low/Med/High with color coding). Weather forecast impact for the week. Weekly payout trend chart. Protection coverage graph. | Insights page |

### 11g — Profile Screen

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 77 | Build profile page | User info (name, phone, platform, city/zone). UPI ID for payouts. Subscription management (cancel/pause). Notification preferences. | Profile page |

---

## Phase 12 — Admin Dashboard

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 78 | Build admin layout & auth gate | Separate `/admin` route group. Restrict access to admin role (Clerk custom claims). Sidebar nav. | Admin shell |
| 79 | Build admin overview page | Cards: total active users, premium collected this week, total payouts this week, loss ratio, active triggers count. | Admin overview |
| 80 | Build admin users page | Paginated user list with search. View user details, subscription status, claim history. | Admin users page |
| 81 | Build admin claims page | All claims with filters (status, city, date range). Bulk approve/reject for flagged claims. | Admin claims page |
| 82 | Build admin fraud alerts page | Display claims with fraud score 0.3–0.7. Show fraud check details. Approve/reject actions. | Fraud review page |
| 83 | Build admin trigger events page | Timeline of all trigger events. Filter by city, type, date. Show which users were affected and resulting claims. | Trigger events page |

---

## Phase 13 — Polish, Testing & Deployment

| # | Task | Details | Deliverable |
|---|------|---------|-------------|
| 84 | Add micro-animations | Payout success confetti burst, loading shimmer, alert soft bounce, card hover effects, page transitions. Per Design doc motion spec. | Animations live |
| 85 | Implement responsive design pass | Test all pages at 320px, 375px, 768px, 1024px, 1440px. Fix layout issues. Ensure large tap targets on mobile. | Fully responsive |
| 86 | Add accessibility pass | WCAG contrast checks, semantic HTML audit, keyboard navigation, `aria-` labels on interactive elements, text scaling support. | WCAG-compliant |
| 87 | Write API integration tests | Test all Fastify endpoints with Vitest / Jest. Cover happy paths + error cases. Test auth middleware. | API test suite |
| 88 | Write trigger engine tests | Test threshold evaluation, affected user identification, deduplication, fraud check pipeline. Mock external APIs. | Trigger engine tests |
| 89 | Write frontend component tests | Test onboarding flow, plan selection, claim detail rendering. Use React Testing Library. | Frontend test suite |
| 90 | Set up OpenTelemetry instrumentation | Add OTel SDK to Fastify + Next.js. Configure traces, metrics, logs. Ship to Grafana Cloud (or local Jaeger for dev). Set up critical alerts: payout latency > 15min, loss ratio drift. | Observability live |
| 91 | Configure Vercel deployment (frontend) | Connect `apps/web` to Vercel. Set environment variables. Verify production build. | Frontend deployed |
| 92 | Configure Railway deployment (backend) | Deploy `apps/api` and `services/ml` to Railway. Connect to Railway-managed PostgreSQL + Redis. Set env vars. | Backend deployed |
| 93 | End-to-end smoke test | Full flow: sign up → onboard → subscribe → simulate trigger → verify claim created → verify payout initiated. Manually on production. | E2E validated |

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1–7 | Project scaffolding & monorepo |
| 2 | 8–16 | Database schema & Prisma |
| 3 | 17–21 | Authentication (Clerk OTP) |
| 4 | 22–30 | Backend API core |
| 5 | 31–36 | External API integrations |
| 6 | 37–42 | Parametric trigger engine |
| 7 | 43–46 | Event queue & claims pipeline |
| 8 | 47–51 | Fraud detection (rule-based) |
| 9 | 52–56 | Payments (Razorpay sandbox) |
| 10 | 57–61 | AI/ML risk scoring |
| 11 | 62–77 | Frontend (Next.js web app) |
| 12 | 78–83 | Admin dashboard |
| 13 | 84–93 | Polish, testing & deploy |
| **Total** | **93 tasks** | **Full MVP** |

> [!IMPORTANT]
> This covers **MVP scope only**: basic onboarding, 2 triggers (rain + heat), fixed pricing tiers, mock integrations, simple fraud rules, UPI payout simulation. Advanced ML, real platform integrations, Kafka, and AWS production deployment are **Phase 2**.
