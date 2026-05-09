# THE CPS PUNISHER - Product Requirements Document
_Last Updated: 2026-04-30_

## Original Problem Statement
Build a powerful legal application named "THE CPS PUNISHER" - an "unstoppable defender of the family" with features superior to commercial legal tools. Focused on CPS (Child Protective Services) case defense with AI-powered analysis, document generation, and legal research.

## Architecture (v5.0 - Modular)

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── server.py              # Slim orchestrator (130 lines) - CORS, lifespan, router includes
├── config.py              # Centralized configuration, constants, tier definitions
├── auth.py                # JWT auth, password hashing, user verification
├── database.py            # MongoDB connection management
├── models/schemas.py      # All Pydantic request/response models
├── utils/credits.py       # Credit management, tier enforcement
├── routes/                # 17 modular route files
│   ├── auth_routes.py, admin_routes.py, cases_routes.py
│   ├── documents_routes.py (with background analysis)
│   ├── case_data_routes.py, ai_routes.py, payments_routes.py
│   ├── calendar_routes.py, legal_routes.py, courtlistener_routes.py
│   ├── community_routes.py, export_routes.py, section1983_routes.py
│   ├── podcast_routes.py, caselaw_routes.py, ada_routes.py
│   └── strategy_routes.py
```

### Frontend (React + Tailwind + shadcn/ui)
```
/app/frontend/src/
├── App.js                 # Slim orchestrator (422 lines)
├── lib/api.js             # Shared API helper
├── context/AuthContext.js  # React auth context
├── components/features/   # 48 tab/feature components
├── components/LandingPage.jsx, AuthPage.jsx, HelpBot.jsx
└── components/ui/         # shadcn/ui components
```

## What's Been Implemented
- Full authentication (JWT + Google OAuth) with 4-tier subscription system
- AI-powered document analysis with background processing
- OCR, Vision analysis for images, audio/video transcription
- Fraud, perjury, constitutional violation detection
- Background check / Person Lookup
- AI chat assistant, strategy builder, argument generator
- 50-state law library, Section 1983 tools, ADA compliance
- CourtListener integration, evidence mapper, precedent finder
- Admin board, advocate directory
- PWA support, mobile responsive design

## Completed Tasks (March 2026)

### Session 1: Codebase Refactoring (P1) - COMPLETE
- Backend: server.py split from 9,027 lines to 130 lines + 17 route modules
- Frontend: App.js split from 11,128 lines to 422 lines + 48 component files
- Created shared modules: config.py, auth.py, utils/credits.py, models/schemas.py

### Session 2: Document Analysis Fix - COMPLETE
- Fixed document upload timeout by making AI analysis run as FastAPI BackgroundTasks
- Upload now returns in 3-5 seconds (was timing out at 120s+)
- Added analysis-status polling endpoint
- Added retry logic for 502 API errors from LLM
- Optimized analysis prompt (trimmed from 250 lines to 30 lines while keeping quality)
- Frontend updated with polling for background analysis completion
- Testing: 100% pass rate (12/12 backend, all frontend)

### Session 3: Background Check Report Quality - IN PROGRESS
- Expanded person-lookup prompt with stricter JSON schema, search plan, and verification gaps
- Added timeout/retry/error handling for LLM 502/budget failures
- Pending: LLM service stability / Universal Key balance; re-test full report output

### Session 4: Document Analysis Reliability Hardening - COMPLETE
- Added concurrency throttling for background analysis to reduce LLM rate-limit failures
- Implemented exponential retry delays for transient LLM errors/timeouts
- Added explicit error reporting when AI API key is missing

### Session 5: Server-Side Analysis Queue + Progress Metrics - COMPLETE
- Added persistent analysis queue with queued/processing/complete/error statuses
- Added /api/analysis-queue metrics endpoint and queue position support
- Updated Documents UI with live queue metrics, progress bar, and queued badges

### Session 6: Per-File Queue Details - COMPLETE
- Added /api/analysis-queue/{doc_id} endpoint for per-document queue details
- Added queue detail panels in the document list with status, position, timestamps, and refresh
- Added queue status display in empty analysis view with refresh action

### Session 7: ADA Cross-Referencing + Background Extraction Pipeline - COMPLETE
- Added ADA Title II/III cross-reference guidance across AI tools (chat, research, doc gen, strategy, forensic, background check)
- Moved heavy PDF/image/audio/video extraction into the background analysis pipeline to reduce upload-time failures
- Added extraction_status tracking for queued/processing/complete/error on uploaded docs

### Session 8: Back + Cancel Buttons Across Forms - COMPLETE
- Added Back and Cancel controls inline next to primary actions across key forms (cases, violations, evidence, hearings, filings, services, communications, visitation, strategy, criminal case, judge watch, advocates, forum, notepad, research, expert AI, background check)
- Cancel clears form data and halts action; Back safely closes modals or stays in-app without navigating to about:blank

### Session 9: Deployment Serialization + Env File Fix - COMPLETE
- Removed .env patterns from .gitignore to allow Emergent deployment to inject env values
- Added FastAPI ObjectId encoder to prevent JSON serialization errors in production

### Session 10: Document Analysis Rendering Fix - COMPLETE
- Fixed DocumentAnalysisView to safely render structured key_allegations and defense_opportunities objects without React runtime errors
- Added defensive rendering for object fields (allegation, weaknesses, defense, legal_basis, likelihood)

### Session 11: Transient 502 Auto-Retry - COMPLETE
- Added transient error detection + auto re-queue for 502/BadGateway/timeout LLM failures
- Increased LLM retry window for analysis to reduce false failures under load

### Session 12: Case Memory System - COMPLETE
- Added persistent case memory collection with create/list/delete endpoints
- Added Case Memory UI tab with Add/Delete controls and tagging
- Injected case memory into AI prompts (chat, research, doc generation, defense strategy, expert analysis)
- Auto-saves key findings from document analysis into case memory

### Session 13: Upload Resilience Fix - COMPLETE
- Added safer token handling and upload URL normalization for document uploads
- Added explicit connection-error handling to prevent immediate “failed to fetch” in incognito
- Added session-expired guard with user-friendly messaging

### Session 14: DOCX/RTF Extraction Fix - COMPLETE
- Added DOCX and RTF text extraction (python-docx, striprtf) to prevent “no substantive text” errors
- DOCX/RTF now extracted in background and fed into analysis

### Session 15: Law Library Fixes - COMPLETE
- Unlocked Law Library for free tier and fixed in-memory cache for state law responses
- Resolved Save to Notepad error by importing state data helpers into community routes

### Session 16: How-To Guide + Essential Price Update - COMPLETE
- Added How To Use guide in sidebar with step-by-step workflow + troubleshooting
- Updated Essential plan pricing to $19/mo and $190/yr (frontend + backend)
- Updated HelpBot pricing reference

### Session 17: Policies + Required Acceptance - COMPLETE
- Added Policies sidebar tab with Terms of Service and Privacy Policy
- Added required acceptance on signup with modal viewing policies
- Added terms gate modal for existing users until acceptance is recorded
- Added backend acceptance fields + /api/auth/accept-terms endpoint

### Session 18: Login Connection Error Fix - COMPLETE
- Removed hard block on login when health check fails; login now proceeds if backend is reachable
- Normalized health check to use API_URL and improved retry messaging

### Session 19: Communications Error Handling - COMPLETE
- Added default date for communications form to prevent empty submissions
- Added clearer error messages for communications load/submit failures

### Session 20: User-Friendly Onboarding - COMPLETE
- Added onboarding checklist with progress actions on Overview
- Added quick-start wizard and walkthrough tour (Overview + How To Use)
- Added start-tour trigger from How To Use

### Session 21: Ultimate CPS AI Prompt - COMPLETE
- Applied the user-supplied “Ultimate CPS Defense AI” identity across AI tools while preserving legal-education disclaimer and ADA cross-referencing
- Structured outputs (document analysis / person lookup) embed the opening statement in summary/disclaimer fields to keep JSON valid

### Session 22: Section 1983 Generator Stabilization - COMPLETE
- Fixed missing imports (STATES_INFO + SECTION_1983_SYSTEM_PROMPT) that caused 500s
- Added retry + timeout handling with clearer AI budget error messaging for LLM failures
- Frontend: improved error visibility, added data-testid coverage, and set a 45s no-retry timeout for Section 1983 generation

### Session 23: Streaming AI + CourtListener Deepening + Connected Saves - COMPLETE
- Added streaming endpoints for Smart Research and Smart Document generation with timeout safeguards
- Auto-save AI outputs + next-step strategy into Case Notes and Case Memory (Chat, Research, Document, CourtListener save/analyze)
- CourtListener: added filters (judge, docket, citation, order), opinion detail endpoint, AI opinion analysis, and UI actions
- Frontend: Research/SmartDoc show streaming state, timeout errors, and Next Steps panels
- Sidebar reorganized into collapsible category submenus for faster navigation

### Session 24: Useful Case Law Index Added - COMPLETE
- Added comprehensive “Useful Case Law Index” sections to legal_knowledge.py with jurisdiction, service/notice, void judgments, DHR accountability, ADA, and Alabama Ex Parte groupings

### Session 25: Deployment Runtime Hardening (LLM 502) - COMPLETE
- Added explicit ChatError handling + timeouts in Smart Research and Smart Document endpoints to prevent unhandled crashes
- Returns 402/502 with user-friendly messages when LLM budget/BadGateway errors occur

### Session 26: Calm Mobile-First Redesign + Case Wizard - COMPLETE
- Applied light, supportive design system (Figtree/Outfit fonts, soft spacing, rounded controls, white backgrounds)
- Added guided 3-step case creation wizard with progress indicator, example placeholders, and supportive microcopy
- Added Immediate Help panel with quick actions and gentle guidance
- Reorganized sidebar for calm navigation and improved mobile close handling
- Updated Landing + Auth for reassurance and seamless onboarding

### Session 27: Auth Connection Fix - COMPLETE
- Updated AuthPage health checks to use /api/health, restoring connection indicator and login flow in preview

### Session 28: Original Graphics + Dark Palette Restoration - COMPLETE
- Restored courthouse hero image and emphasized shield logo in landing hero
- Reverted UI to red/black/silver/white palette while keeping larger readable text
- Updated wizard, auth, and dashboards for high-contrast readability

### Session 29: Shield Animation - COMPLETE
- Added fade + slow spin animation to the landing hero Punisher shield graphic

### Session 30: Landing Performance Optimization - COMPLETE
- Generated optimized hero and shield image assets with responsive srcSet to reduce load time
- Added responsive sizing + fetch priority for faster first paint

### Session 31: Deployment Auth Service Fix - COMPLETE
- Removed hardcoded Emergent auth URL; now reads AUTH_SERVICE_URL from environment
- Added explicit missing-config error to fail fast in production

### Session 32: UX Review + Performance Improvements - COMPLETE
- Added “Start Here: 3-Step Path” in Overview for guided navigation and faster onboarding
- Reduced initial API prefetch load; admin status now comes from auth response
- Added is_admin to auth responses for faster, clearer admin routing
- Fixed fetchpriority attribute warning on landing hero image

### Session 40: Smart Document Generator Reliability - COMPLETE
- Increased streaming timeout and added retry logic + improved error messaging for network/timeouts
- Verified streaming generation completes successfully in preview

### Session 39: Document Analyzer Reliability Overhaul - COMPLETE
- Expanded file support: ODT/HTML/MD/CSV/XLS/XLSX/PPT/PPTX/ZIP/TIFF plus larger media limits
- Added ZIP archive extraction with child document creation and background analysis
- Added OCR-first image pipeline (Tesseract + AI Vision fallback) and timestamped transcription
- Added Processing Log + Analyzer Test Lab (admin) with sample bundle download

### Session 38: Overview Walkthrough Placement + RRC Label - COMPLETE
- Moved onboarding checklist (Start Walkthrough) to top of Overview for visibility
- Renamed Real Estate module label to “Toll & Rollin!” badge and sidebar label

### Session 37: Real Estate Law Attorney Agent (RRC) - COMPLETE
- Added Revenant Realty Counsel AI endpoint with CPS-real-estate strategy framework
- Added Real Estate Law (RRC) tab with focus areas (torts, deeds/titles, wills/probate, etc.) and response panel
- Verified UI + API response from RRC module

### Session 36: Export Center (PDF/DOCX) - COMPLETE
- Added Document + Case Prep (All Data) export endpoints for PDF and DOCX
- Added Export Center UI with editable court templates and correction notes
- Made case prep export available to all tiers

### Session 35: Paywall Stability + Pricing UI Test IDs - COMPLETE
- Fixed Stripe checkout request model (origin_url + billing_period) and backend billing_period handling
- Added pricing/passcode UI test IDs for paywall controls
- Verified Stripe checkout redirects for subscriptions and credits

### Session 34: Child-Related Court Rulings Knowledge Base - COMPLETE
- Ingested user PDF rulings into legal_knowledge.py (41 case entries)
- Expanded get_relevant_case_law to use keyword matching and include new rulings

## Remaining Tasks

### P0 - Background Check Reliability
- LLM 502/budget failures can cause timeouts; top up Universal Key and re-test person lookup
- If timeouts persist, consider background job + polling flow

### P0 - Production Deployment
- User needs to redeploy to push all fixes to production (thecpspunisher.com)
- LLM budget/timeouts in preview can block Streaming Research + Smart Document generation; top up Universal Key for full responses
- CourtListener opinion detail may require a CourtListener API key for full-text access

### P2 - Future Features
- CourtListener: add full-opinion fallback or bulk citation export
- Multi-client management for Attorney Suite
- Email notification system
