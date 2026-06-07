

# 🛡️ GigShield – Product Requirements Document (PRD)

## 📌 Product overview
GigShield is an AI-powered parametric income protection platform for gig delivery workers in India. It automatically compensates workers when external disruptions (weather, pollution, curfews, etc.) reduce earning ability.

**Unlike traditional insurance, GigShield:**
- Does not require manual claims
- Uses real-time data triggers
- Offers weekly subscription-based pricing
- Ensures instant payouts

## 🎯 Goals & objectives

### Primary goals
- Protect gig workers from income volatility
- Provide fast, automated payouts (within minutes–hours)
- Maintain low operational friction (no paperwork claims)

### Secondary goals
- Build trust via transparency
- Achieve a fraud-resistant system
- Enable scalable B2B2C partnerships with platforms like Zomato, Swiggy, and Amazon

## 👤 Target user persona

**“Ravi” – Delivery partner**
- Age: 22–40
- Works with: Swiggy / Zomato
- Daily earnings: ₹500–₹1200
- Weekly earnings: ₹3,500–₹7,000

**Pain points**
- No earnings during:
  - Heavy rain / heatwaves
  - Pollution spikes
  - Curfews or strikes
- No savings buffer
- No access to traditional insurance

## ⚙️ Core features

### 1) 🧠 AI-powered risk assessment

**Functionality**
- Dynamic weekly premium calculation based on:
  - Location (city/zone)
  - Historical weather data
  - Worker activity patterns
  - Seasonal trends

**ML models**
- Time-series forecasting (weather & disruptions)
- Behavioral risk scoring

**Output**
- Weekly premium: ₹20–₹150
- Risk score: Low / Medium / High

### 2) 💸 Weekly pricing model

**Structure**
- Subscription-based (weekly auto-renewal)
- Tiered plans:

| Plan | Weekly premium | Coverage |
|---|---:|---|
| Basic | ₹29 | ₹500 payout/week |
| Standard | ₹59 | ₹1000 payout/week |
| Pro | ₹99 | ₹2000 payout/week |

**Key principle**
- Premium aligned with weekly earning cycle

### 3) 🌦️ Parametric trigger engine

**Triggers (no manual claims):**
- Temperature > 42°C
- Rainfall > X mm/hour
- AQI > 300 (severe pollution)
- Government-issued curfew
- Traffic shutdown zones

**Workflow**
- External API detects an event
- System validates event against thresholds
- Affected users are auto-identified
- Claim is triggered instantly

### 4) ⚡ Automated claims & payout

**Process**
- Trigger → Eligibility check → Payout

**Payout channels**
- UPI (primary)
- Wallets (Paytm/PhonePe)

**Time to payout**
- < 15 minutes (target)

### 5) 🛡️ Intelligent fraud detection

**Mechanisms**
- Location validation (GPS vs declared zone)
- Activity verification (delivery logs / mock API)
- Duplicate claim detection
- Behavioral anomaly detection

**AI techniques**
- Clustering anomalies
- Rule-based + ML hybrid fraud engine

### 6) 🔗 Integration layer

**APIs (can be mocked initially)**
- Weather: OpenWeather / IMD
- Pollution: AQI APIs
- Traffic: Google Maps API (mock allowed)
- Platform data: simulated delivery logs
- Payments: Razorpay / Stripe (sandbox)

### 7) 📊 Analytics dashboard

**For admin**
- Active users
- Premium collected vs payouts
- Loss ratio
- Fraud alerts

**For users**
- Weekly earnings protection
- Claims history
- Risk level insights

## 📲 User journey

### Onboarding flow
- Mobile number login (OTP)
- Select platform (e.g., Swiggy)
- Enable location tracking
- View recommended plan
- Subscribe (UPI autopay)

### Weekly lifecycle
- Monday: Subscription renews
- During week: System monitors triggers
- If disruption occurs → auto payout

## 🧩 User stories

**Onboarding**
- As a delivery partner, I want to sign up in under 2 minutes so I can start coverage quickly.

**Pricing**
- As a user, I want to see my weekly premium clearly so I can decide affordability.

**Protection**
- As a worker, I want automatic payouts when I can’t work so I don’t lose income.

**Transparency**
- As a user, I want to know why I received a payout so I trust the system.

**Fraud prevention**
- As a platform, I want to detect suspicious claims so losses are minimized.

## 🏗️ System architecture (high-level)

**Frontend**
- Web Page (React)
- Mobile app (React)

**Backend**
- Node.js

**AI layer**
- Risk model (Python, TensorFlow/Scikit)

**Data sources**
- Weather APIs
- Pollution APIs
- Mock gig platform APIs

**Database**
- PostgreSQL + Prisma

**Event engine**
- Kafka / PubSub for real-time triggers

## 📈 Success metrics (KPIs)

**User metrics**
- Weekly active users (WAU)
- Subscription retention rate (>70%)
- Onboarding completion rate (>80%)

**Financial metrics**
- Loss ratio (target: 60–75%)
- Average premium per user
- Payout turnaround time (<15 min)

**Product metrics**
- Trigger accuracy (>90%)
- Fraud detection precision (>85%)

## 🚧 Constraints & compliance

**Must follow**
- No coverage for:
  - Health
  - Life
  - Accidents
  - Vehicle damage
- Only: income loss due to external disruptions
- Weekly pricing only

## 🚀 MVP scope (first version)

**Include**
- Basic onboarding
- 2 triggers (rain + heat)
- Fixed pricing tiers
- Mock integrations
- Simple fraud rules
- UPI payout simulation

**Exclude**
- Advanced ML (phase 2)
- Full platform integrations
- Complex fraud AI

## 🔮 Future enhancements
- Personalized AI pricing (per worker)
- Platform partnerships (B2B model)
- Real-time earning tracking
- Gamified safety incentives
- Expansion to other gig sectors (drivers, logistics)

## 💡 Key differentiator
GigShield is not insurance in the traditional sense. It is a real-time, AI-triggered income stabilizer designed specifically for the unpredictable nature of gig work.