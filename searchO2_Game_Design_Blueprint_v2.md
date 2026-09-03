# searchO2 - Game Design & Technical Development Blueprint (v2)

> v2 changelog: appends a "Production & Security Addendum" and a "Delivery Phasing" section to the original v1 blueprint. No original sections were removed or altered — this is additive only.

## 1. Vision
searchO2 is an educational single-page browser farming simulation game where players transform infertile land into a self-sustaining eco-community. The core economy is driven by Oxygen (O2) production from trees and plants.

---

# Game Objectives

1. Restore barren land.
2. Increase oxygen production.
3. Earn Euro-based virtual income.
4. Unlock new regions.
5. Build an independent green settlement.
6. Learn environmental sustainability.
7. Compete globally through leaderboards.

---

# Target Audience

- Children 8+
- Families
- Schools
- Environmental education programs

---

# Technical Architecture

## Frontend

- Single Page HTML Application (SPA)
- HTML5
- CSS3
- SVG Vector Graphics
- JavaScript (TypeScript preferred)
- Canvas optional for animations

## Backend

- Node.js + Express
- REST API
- WebSocket for countdown updates

## Database

- PostgreSQL
- Redis Cache

## Authentication

- Email login
- Google login
- Guest mode

## Deployment

- Azure App Service
- Azure PostgreSQL
- Azure Redis Cache
- Azure CDN

---

# Game Time System

## Time Compression

Real Time → Game Time

24 Hours Real = 96 Hours Game

Ratio = 1:4

1 Real Hour = 4 Game Hours

15 Real Minutes = 1 Game Hour

### Formula

GameHours = RealHours × 4

---

# Starting Regions

## Unlocked Regions

1. Germany Grassland
2. France Countryside
3. Netherlands Meadow

## Premium/Locked Regions

4. Amazon Edge Zone
5. African Savannah
6. Nordic Forest
7. Himalayan Valley
8. Mediterranean Valley
9. Tropical Island
10. Mountain Plateau

Unlock via:

- Oxygen achievements
- Farm value
- Coins

---

# Starting Economy

Initial Balance: €10,000

Player Spending:

- Land preparation
- Equipment
- Seeds
- Saplings
- Workers
- Storage
- Irrigation

---

# Resource Types

## Primary

- Oxygen (O2)
- Money (€)
- Water
- Fertility
- Energy

## Secondary

- Fruits
- Vegetables
- Timber
- Compost
- Seeds

---

# Tree Categories

## Oxygen Trees

- Oak
- Pine
- Maple
- Poplar

Highest O2 generation.

## Fruit Trees

- Apple
- Orange
- Mango
- Lemon

Produce fruits + oxygen.

## Vegetable Crops

- Tomato
- Potato
- Carrot
- Onion

Fast cash generation.

## Timber Trees

- Teak
- Cedar
- Eucalyptus

Late-game profit.

## Biodiversity Trees

- Cherry Blossom
- Acacia
- Birch

Boost eco score.

---

# Oxygen Economy

## Base Formula

OxygenProducedPerDay × O2Rate = Daily Income

Example:

1000 O2 Units × €0.05
= €50 Daily Reward

## Bonuses

Forest Bonus +10%

Diverse Species Bonus +15%

Healthy Soil Bonus +20%

Worker Efficiency +10%

---

# Workers System

## Worker Types

### Laborer

Cost: €20/day

Tasks:
- Digging
- Watering

### Farmer

Cost: €50/day

Tasks:
- Planting
- Harvesting

### Specialist Botanist

Cost: €100/day

Tasks:
- Growth bonus
- Disease prevention

### Engineer

Cost: €150/day

Tasks:
- Irrigation systems
- Automation

---

# Farm Development Stages

## Stage 1
Barren Land

## Stage 2
Prepared Soil

## Stage 3
Young Farm

## Stage 4
Productive Farm

## Stage 5
Eco Village

## Stage 6
Sustainable Town

## Stage 7
Independent Green City

---

# Core Gameplay Loop

1. Login
2. Collect rewards
3. Assign workers
4. Complete active task
5. Wait for timer
6. New task unlocks
7. Harvest resources
8. Expand farm
9. Increase oxygen
10. Earn money

---

# Task Queue System

Every task has:

- Start Time
- End Time
- Status
- Reward

Statuses:

- Locked
- Active
- Completed
- Claimable

Example:

Dig Land
Duration: 3 Hours

After completion:

Plant Tree
Unlocked automatically.

---

# Session Persistence Requirements

Store:

- Current task
- Remaining timer
- Farm state
- Inventory
- Worker assignments
- Oxygen production

## Backend Storage

PostgreSQL

## Fast Access

Redis Cache

---

# Offline Progress Engine

When user returns:

Calculate:

CurrentTime - LastLoginTime

Simulate:

- Task completion
- Tree growth
- Oxygen generation
- Harvest readiness
- Income reward

Present summary popup.

---

# Tree Lifecycle

1. Seed
2. Sprout
3. Young Plant
4. Mature Tree
5. Flowering
6. Fruiting
7. Harvest Stage
8. Aging

Growth depends on:

- Water
- Fertility
- Worker skills
- Season

---

# Seasons System

Spring
- Growth +20%

Summer
- Fruit production +25%

Autumn
- Harvest bonus +20%

Winter
- Growth -15%

---

# Educational Components

Each tree includes:

- Real oxygen facts
- Environmental impact
- Carbon absorption
- Water usage
- Wildlife benefit

Quiz rewards:

- Coins
- Seeds
- Fertility points

---

# Buildings

1. Shed
2. Water Tank
3. Greenhouse
4. Storage House
5. Processing Factory
6. Research Center
7. School
8. Hospital
9. Ecosystem Lab
10. Eco City Hall

---

# Achievement System

## Beginner

First Tree

## Green Starter

100 O2 Generated

## Eco Farmer

1000 O2 Generated

## Forest Maker

100 Trees

## Oxygen Hero

10000 O2 Generated

## Eco Billionaire

€1,000,000 Wealth

## Green Planet Champion

100000 O2 Generated

---

# Level Design

## Level 1
First Farm

## Level 2
Irrigation

## Level 3
Fruit Economy

## Level 4
Worker Management

## Level 5
Forest Development

## Level 6
Export Economy

## Level 7
Eco Village

## Level 8
Regional Expansion

## Level 9
Green Town

## Level 10
Independent Living Area

## Level 11-20
Advanced Sustainability Levels

## Level 21+
Global Eco Leadership

---

# Leaderboard Design

## Global Oxygen Ranking

Ranked by total oxygen.

## Wealth Ranking

Ranked by Euro balance.

## Fastest Growth Ranking

Ranked by weekly growth.

## Best Eco Score

Ranked by biodiversity.

## Country Ranking

Compare regions.

Leaderboard Fields:

- Rank
- Username
- Region
- Oxygen
- Money
- Eco Score

---

# Daily Events

- Rain Bonus
- Fertility Day
- Fruit Festival
- Tree Week
- Oxygen Marathon

---

# Monetization (Optional)

Cosmetic only:

- Farm skins
- Decorative items
- Avatar customization

No pay-to-win mechanics.

---

# Visual Design Requirements

Use SVG graphics:

- Cute child-friendly style
- Bright colors
- Smooth animations
- Responsive UI

Animations:

- Growing trees
- Water flow
- Oxygen particles
- Flying birds
- Wind effects

---

# Accessibility

- Colorblind mode
- Keyboard navigation
- Screen reader labels
- Mobile support

---

# API Modules

Auth API
Farm API
Task API
Tree API
Worker API
Economy API
Leaderboard API
Achievement API
Notification API

---

# Notifications

Examples:

Tree Ready To Harvest

Task Completed

Worker Finished Assignment

Forest Bonus Activated

Region Unlocked

---

# Database Tables

Users
Regions
Farms
Trees
Workers
Tasks
Buildings
Achievements
EconomyTransactions
Leaderboards
Notifications

---

# Development Milestones

## Milestone 1
Project Setup
SPA Foundation
Authentication

## Milestone 2
Farm Engine
Land System
Inventory System

## Milestone 3
Tree Growth Engine
Time Compression
Oxygen Economy

## Milestone 4
Worker System
Task Scheduling
Automation

## Milestone 5
Buildings
Expansion
Region Unlocking

## Milestone 6
Achievements
Leaderboards
Daily Rewards

## Milestone 7
Educational Content
Environmental Facts
Quiz Engine

## Milestone 8
Balancing
Testing
Optimization

## Milestone 9
Beta Launch

## Milestone 10
Public Release

---

# Success Metrics

- Daily Active Users
- Trees Planted
- Oxygen Produced
- Returning Users
- Average Session Time
- Task Completion Rate
- Educational Quiz Completion

---

# End Goal

Transform a small infertile plot into a thriving self-sustainable eco city while maximizing oxygen production and educating children about environmental responsibility.

---
---

# ADDENDUM (v2): Production & Security Hardening

*Added after design review, approved before implementation began. This section does not change any game mechanic above — it specifies HOW the above gets built safely and scalably.*

## A1. Server-Authoritative State (Anti-Cheat)

Idle/farming games are a classic target for client-side tampering (modifying local O2/money values, replaying network calls, or skipping timers via devtools). To prevent this at the architecture level:

- The client **never** sends absolute resource values (`money: 50000`) to the server. It only sends **actions** (`plantTree`, `claimTask`, `harvest`).
- The server is the sole source of truth for O2 totals, money, and task timers. On every claim/harvest action, the server recomputes elapsed game-time from stored `startedAt` timestamps and the fixed 1:4 ratio — never trusting a client-submitted duration.
- All reward formulas (Oxygen Economy, bonuses, worker efficiency) live server-side only. The client may *display* a projected value for UX, but the server independently recalculates on claim.

## A2. Authentication & Session Security

- Passwords: bcrypt (cost factor 12+), never stored or logged in plaintext.
- Access tokens: short-lived JWT (15 min), stored in memory only (never `localStorage`).
- Refresh tokens: long-lived, stored as `httpOnly`, `Secure`, `SameSite=Strict` cookies — not accessible to JS, mitigating XSS token theft.
- Google login via OAuth2 authorization-code flow (never implicit flow).
- Guest mode: a signed, unguessable anonymous session token issued server-side (not a client-generated ID), with a clear, explicit upgrade path to a real account so guest progress can be claimed later.

## A3. Input Validation & Injection Prevention

- Every API boundary validated against a schema (e.g. zod/joi) before touching business logic — reject unknown fields, wrong types, out-of-range values (e.g. negative worker counts).
- 100% parameterized queries / query-builder or ORM usage — no raw string-concatenated SQL, anywhere.
- Rate limiting specifically on economy-sensitive endpoints (`claimTask`, `harvest`, `convertOxygen`) to blunt scripted farming/abuse, separate from general API rate limits.

## A4. Data Model Notes for Scale

- `EconomyTransactions` table is append-only (ledger style) — balances are derived/cached, not the only record — so any dispute or exploit can be audited and replayed.
- Redis is used strictly as a cache/session/task-timer accelerator in front of Postgres, never as the sole store of truth, so a Redis flush cannot destroy farm progress.
- Leaderboard aggregates computed via scheduled jobs (not on every request) to keep read paths cheap at scale.

## A5. Child-Directed Product Considerations

Since the target audience explicitly includes children 8+ and schools:

- Minimize personal data collection at signup (avoid unnecessary fields); guest mode should be a fully viable path for classroom use.
- No open text chat or user-generated content surfaces between players (leaderboards show username/rank only).
- Cosmetic-only monetization as already specified in v1 — reinforced here as a hard constraint, not a suggestion.

---

# ADDENDUM (v2): Delivery Phasing

Given the full stack (SPA + Express API + Postgres + Redis + Azure) can't be stood up as a live multi-service deployment inside a single build/review pass, delivery is split into independently reviewable phases:

1. **Phase 1 — Playable core-loop prototype** (frontend only, in-memory/local persistence): land plots, tree planting, time-compressed growth engine, oxygen → money economy, task queue with timers, offline-progress catch-up, basic achievements. Validates game feel before backend investment.
2. **Phase 2 — Backend API scaffold**: Express + TypeScript project, Postgres schema/migrations matching the Database Tables section, JWT auth with the hardening in A2, core Farm/Task/Tree/Economy API routes with server-authoritative logic (A1), input validation (A3).
3. **Phase 3 — Integration**: wire the Phase 1 frontend to the Phase 2 API, replacing local state with real network calls; add WebSocket countdown sync.
4. **Phase 4+**: Workers, Buildings, Leaderboards, Achievements persistence, Educational quiz engine, Azure deployment config — per the original Milestones 4–10.

This document (v2) is the reference for all phases; each phase's code should be traceable back to a specific section above.
