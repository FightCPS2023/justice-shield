# THE CPS PUNISHER - Product Requirements Document

## Original Problem Statement
Build the most powerful, interactive legal application for CPS cases - "unstoppable defender of the family." AI-powered legal tools, document analysis, violation tracking, court preparation.

## Tech Stack
- Frontend: React, Tailwind CSS, shadcn/ui, lucide-react
- Backend: Python, FastAPI, Motor (async MongoDB)
- AI: LiteLLM via Emergent integrations
- Payments: Stripe (live keys)
- Auth: JWT + Google OAuth
- Database: MongoDB

## Tier Structure (Enforced Backend + Frontend)

| Tier | Price | Docs/mo | AI Credits | Cases |
|------|-------|---------|------------|-------|
| Free | $0 | 1 | 5 | 1 |
| Essential | $49/mo | 25 | 100 | Unlimited |
| Professional | $99/mo | Unlimited | 500 | Unlimited |
| Attorney | $299/mo | Unlimited | 2,000 | Unlimited |
| Enterprise | $999/mo | Unlimited | Unlimited | Unlimited |

### Credit System (A La Carte)
- 10 credits: $4.99
- 50 credits: $19.99 (BEST VALUE)
- 100 credits: $34.99
- 250 credits: $74.99

Credits allow access to any feature without upgrading tier. Never expire.

### Feature Credit Costs
- AI Chat: 1 | Document Upload: 2 | Document Generation: 3
- Defense Strategy: 3 | Incident Analyzer: 2 | Expert Legal AI: 5
- Strategy Builder: 5 | Argument Generator: 5 | Evidence Mapper: 3
- Precedent Finder: 3 | ADA Compliance: 3 | Case Law: 3
- Law Library: 1 | Judge Research: 2 | Legal Research: 3
- Section 1983: 10 | CourtListener: 3 | Case Prep Kit: 10
- Podcast: 5 | Criminal Case: 3

### Enforcement
- Backend: `require_tier(min_tier, feature_key)` with credit bypass
- Frontend: Lock icons + tier badges; click redirects to pricing
- Credit system: purchased credits bypass tier gates
- Limits: `check_case_limit()`, `check_doc_upload_limit()`, `check_ai_credits()` with purchased credit fallback

## Completed Features

### Core Platform
- JWT auth + Google OAuth
- Case management with tier-based limits
- Stripe payments (live) - subscriptions + credit purchases
- Passcode system (PUNISHER2024 = Enterprise)
- Full tier enforcement (backend 403s + frontend lock UI)
- Credit purchase system (4 packages via Stripe checkout)

### Free Tier Features
- AI Chat (5 questions/month)
- 1 Document upload with AI analysis
- 1 Case
- Violation & Timeline tracking
- Evidence & Visitation Logs
- Court Hearings, Communications, Calendar
- Know Your Rights, Community Forum, Find Advocates

### Essential Tier (+)
- AI Document Analysis & Generation
- Defense Strategy, Incident Analyzer
- Legal Notepad with PDF Export
- Court Filings, Services tracking

### Professional Tier (+)
- Expert Legal AI, Strategy Builder
- Argument Generator, Evidence Mapper, Precedent Finder
- ADA Compliance (50 States), Case Law Analysis
- Law Library (50 States), Judge Watch
- Legal Research, Multi-file & Folder Upload

### Attorney Tier (+)
- Section 1983 Lawsuit Generator
- CourtListener (50M+ opinions)
- Court Preparation Kit (PDF)
- Podcast Creator, Criminal Case Tools

### UI Features
- Landing page Sign In button (top right corner)
- Usage Dashboard on Overview (tier, credits, usage bars)
- Settings tab (account info, usage stats, app info, credit costs)
- Credit Purchase section on Pricing page
- Sidebar lock icons + tier badges (ESS/PRO/ATT)

## Key API Endpoints
- Auth: /api/auth/signup, /api/auth/login, /api/auth/tier-status
- Credits: /api/credits/packages, /api/credits/balance, /api/credits/purchase, /api/credits/verify/{session_id}
- Cases: /api/cases (limited by tier)
- Documents: /api/documents/upload (limited by tier)
- AI: /api/ai/chat (all tiers), /api/ai/expert-analysis (professional)
- ADA: /api/ada/* (professional)
- Section 1983: /api/section-1983/* (attorney)
- CourtListener: /api/courtlistener/* (attorney)

## Pending Tasks

### P1 - Codebase Refactoring
- Break server.py (~7100 lines) into modular route files
- Break App.js (~8900 lines) into modular components

### P2 - Future Features
- Facebook OAuth (needs user's App ID & Secret)
- Deeper CourtListener integration
- Multi-client case management (Enterprise)
- Email notifications
- "Centinet law AI" exploration

## Credentials
- Passcode: PUNISHER2024 (Enterprise)
- Stripe: Live keys configured
