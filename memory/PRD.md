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

## Completed Features

### Core Platform
- JWT auth + Google OAuth
- Case management with tier-based limits
- Stripe payments (live) - subscriptions + credit purchases
- Full tier enforcement (backend 403s + frontend lock UI)
- Credit purchase system (4 packages via Stripe checkout)

### 20 Reusable Passcodes (Enterprise Access)
All passcodes grant Enterprise tier and are reusable until admin deactivates:
- PUNISHER2024, CPS-WARRIOR-001 through 005
- FAMILY-DEFENDER-01 through 05
- LEGAL-SHIELD-001 through 005
- JUSTICE-KEY-2024-A through D

### Advocate System (NEW - Mar 2026)
- **Public Application Form:** Name, email, phone, website, photo, bio, experience, specialties, state, city, organization, certifications, languages
- **Advocate Directory:** Searchable by state, shows approved advocates only
- **Admin Approval:** Advocates require admin approval before visible
- **API Endpoints:**
  - POST /api/advocates/apply (public)
  - GET /api/advocates (public, approved only)
  - GET /api/advocates/{id} (public, approved only)
  - GET /api/admin/advocates (admin)
  - POST /api/admin/advocates/update-status (admin)

### Admin Board (NEW - Mar 2026)
- **Dashboard:** Total users, cases, documents, redemptions, advocates stats, tier breakdown
- **User Management:** View all users, change tiers
- **Advocate Management:** View/approve/reject advocate applications
- **Passcode Management:** View all passcodes, enable/disable, redemption counts
- **Redemption History:** Track who redeemed what passcode and when
- **Admin Access:** Controlled by ADMIN_EMAILS list in server.py
- **Current Admin Emails:** admin@thecpspunisher.com, owner@thecpspunisher.com

### Legal Forensic Document Analyzer
- 7-point analysis framework
- Located in Documents tab > Forensic Analyzer
- Single document or entire case modes

### All Other Features
- AI Chat, Document Analysis, Document Generation
- Defense Strategy, Incident Analyzer, Expert Legal AI
- Strategy Builder, Argument Generator, Evidence Mapper
- ADA Compliance (50 states), Case Law Analysis
- Law Library (50 states), Judge Watch, Legal Research
- Section 1983 Lawsuit Generator, CourtListener
- Court Preparation Kit, Podcast Creator

## Key API Endpoints

### Admin (Protected - requires admin email)
- GET /api/admin/stats - Dashboard statistics
- GET /api/admin/users - All users with pagination
- POST /api/admin/users/update-tier - Change user tier
- GET /api/admin/advocates - All advocate applications
- POST /api/admin/advocates/update-status - Approve/reject
- GET /api/admin/passcodes - All passcodes with status
- POST /api/admin/passcodes/toggle - Enable/disable passcode
- GET /api/admin/redemptions - Redemption history

### Public
- POST /api/advocates/apply - Submit advocate application
- GET /api/advocates - List approved advocates

## Known Issues

### Production CORS Issue (BLOCKING)
- Frontend: https://www.thecpspunisher.com
- Backend: https://case-analyzer-15.emergent.host
- Issue: CORS headers not being returned in production despite code having proper middleware
- Resolution: Contact Emergent support - deployment infrastructure issue
- Preview environment works correctly

## Pending Tasks

### P0 - Resolve Production CORS
- Contact Emergent support about CORS headers not being returned
- Code is correct, deployment isn't picking up changes

### P1 - To Add Admin Emails
- Add your email to ADMIN_EMAILS list in server.py line ~818 to get admin access

### P2 - Future Features
- Facebook OAuth (needs credentials)
- Deeper CourtListener integration
- Multi-client management for Enterprise
- Email notifications

## Credentials
- Passcodes: See list above (20 codes)
- Admin: admin@thecpspunisher.com, owner@thecpspunisher.com
