# THE CPS PUNISHER - Product Requirements Document

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

### Session 3: Background Check Report Quality - COMPLETE
- Upgraded person-lookup prompt to require strict JSON structured reports
- Added per-section confidence + data availability guidance and red flag structure
- Added JSON parsing with formatted output for consistent UI display
- Disabled automatic saving of background check results to case notes (per user preference)

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

## Remaining Tasks

### P0 - Production Deployment
- User needs to redeploy to push all fixes to production (thecpspunisher.com)

### P2 - Future Features
- Deepen CourtListener integration
- Multi-client management for Attorney Suite
- Email notification system
- Streaming response architecture for AI endpoints
