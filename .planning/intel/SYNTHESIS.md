# Synthesis

## Project Scope
GigShield is an AI-powered parametric income protection platform for gig delivery workers in India. It automatically compensates workers when external disruptions (weather, pollution, curfews) reduce earning ability.

## Goals
- Protect gig workers from income volatility
- Provide fast, automated payouts (< 15 mins)
- Maintain low operational friction (no manual paperwork)

## Locked Decisions
- Web: Next.js 15
- Mobile: Expo (React Native)
- Backend: Node.js 22 + Fastify
- AI/ML Layer: Python + FastAPI
- DB: PostgreSQL 16 + Prisma
- Events: BullMQ (MVP)
- Payments: Razorpay

## Constraints
- No coverage for health, life, accidents, vehicle damage.
- Weekly pricing only.
