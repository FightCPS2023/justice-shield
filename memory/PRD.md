# THE CPS PUNISHER - Product Requirements Document

## Original Problem Statement
Build the most powerful, interactive legal application for Child Protective Services (CPS) cases - an "unstoppable defender of the family." Port all functionality (324+ features) from an existing application and enhance with superior AI and legal knowledge.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui, lucide-react
- **Backend:** Python, FastAPI, Pydantic, Motor (async MongoDB)
- **AI:** LiteLLM via Emergent integrations
- **PDF:** ReportLab, PyPDF
- **Payments:** Stripe (live keys)
- **Auth:** JWT + Google OAuth
- **Database:** MongoDB

## Tier Structure (Enforced Backend + Frontend)

| Tier | Price | Docs/mo | AI Credits | Cases | Key Features |
|------|-------|---------|------------|-------|--------------|
| Free | $0 | 5 | 10 | 1 | Basic tracking, violations, timeline, evidence, visitation, calendar, Know Your Rights, Community |
| Essential | $49/mo | 25 | 100 | Unlimited | AI Chat, Document Analysis, Document Generation, Defense Strategy, Incident Analyzer, Legal Notepad, Court Filings, Services |
| Professional | $99/mo | Unlimited | 500 | Unlimited | Expert Legal AI, Strategy Builder, Argument Generator, Evidence Mapper, Precedent Finder, ADA Compliance, Case Law, Law Library, Judge Watch, Legal Research |
| Attorney | $299/mo | Unlimited | 2,000 | Unlimited | Section 1983, CourtListener, Case Prep Kit, Podcast Creator, Criminal Case Tools |
| Enterprise | $999/mo | Unlimited | Unlimited | Unlimited | Multi-Client Management, Bulk Import, Analytics, API Access, Custom AI Training |

### Enforcement
- Backend: `require_tier()` dependency factory on all gated endpoints returns 403 with upgrade message
- Frontend: Lock icons + tier badges (ESS/PRO/ATT) on sidebar; click redirects to pricing page
- Limits: `check_case_limit()`, `check_doc_upload_limit()`, `check_ai_credits()` enforce quotas
- Passcode: `PUNISHER2024` grants Enterprise access

## Completed Features

### Core Platform
- JWT auth + Google OAuth
- Case management (CRUD) with tier-based limits
- Stripe payments (live)
- Passcode system for tier access
- Full tier enforcement (backend 403s + frontend lock UI)

### Free Tier Features
- Violation tracking, Timeline, Evidence management
- Evidence Checklist, Visitation Log, Court Hearings
- Communications Log, Calendar
- Know Your Rights guide, Community Forum, Find Advocates

### Essential Tier Features
- AI Chat Assistant, AI Document Analysis & Generation
- Defense Strategy Generator, Incident Analyzer
- Legal Notepad with PDF Export
- Court Filings Tracker, Services Tracker

### Professional Tier Features
- Expert Legal AI, Strategy Builder, Argument Generator
- Evidence Mapper, Precedent Finder
- ADA Compliance Center (50 States, 9 sections)
- Case Law Analysis, Law Library (50 States)
- Judge Watch, Legal Research Engine
- Multi-file & Folder Upload

### Attorney Tier Features
- Section 1983 Lawsuit Generator
- CourtListener Integration (50M+ opinions)
- Court Preparation Kit (12-page PDF)
- Podcast Script Creator, Criminal Case Tools

### Recent Additions (March 2026)
- **Enhanced Document Uploads** (Mar 1): Multi-file, folder upload, drag-and-drop, upload queue
- **Full Tier Enforcement** (Mar 1): Backend require_tier() on all endpoints, frontend lock UI, pricing cards updated

## Key API Endpoints
- Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/tier-status`, `/api/auth/redeem-passcode`
- Cases: `/api/cases` (free, limited to 1)
- Documents: `/api/documents/upload` (free, limited to 5/mo)
- AI: `/api/ai/chat` (essential), `/api/ai/expert-analysis` (professional)
- ADA: `/api/ada/*` (professional)
- Section 1983: `/api/section-1983/*` (attorney)
- CourtListener: `/api/courtlistener/*` (attorney)
- Strategy: `/api/strategy-builder/*` (professional)

## Pending Tasks

### P1 - Codebase Refactoring
- Break `server.py` (~6900 lines) into modular route files
- Break `App.js` (~8700 lines) into modular components

### P2 - Future Features
- Facebook OAuth (needs user's App ID & Secret)
- Deeper CourtListener integration
- Attorney Suite multi-client management
- Email notifications for case updates
- "Centinet law AI" exploration

## Credentials
- Passcode: `PUNISHER2024` (Enterprise tier)
- Stripe: Live keys configured
