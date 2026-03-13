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
├── models/
│   └── schemas.py         # All Pydantic request/response models
├── utils/
│   ├── __init__.py
│   └── credits.py         # Credit management, tier enforcement, case ownership
├── routes/                # 17 modular route files
│   ├── __init__.py        # Router registration
│   ├── auth_routes.py     # Auth + Google OAuth
│   ├── admin_routes.py    # Admin + Advocate management
│   ├── cases_routes.py    # Case CRUD + AI Notes
│   ├── documents_routes.py # Document upload + analysis
│   ├── case_data_routes.py # Violations, timeline, strategies, evidence, etc.
│   ├── ai_routes.py       # AI chat, person lookup, analysis, research
│   ├── payments_routes.py # Credits + Stripe checkout
│   ├── calendar_routes.py # Calendar events
│   ├── legal_routes.py    # Legal library, rights guide, evidence checklist
│   ├── courtlistener_routes.py # CourtListener search + law library
│   ├── community_routes.py # Forum, notepad, visitation, court hearings
│   ├── export_routes.py   # PDF export
│   ├── section1983_routes.py # Section 1983 civil rights
│   ├── podcast_routes.py  # Podcast creator
│   ├── caselaw_routes.py  # Case law analysis
│   ├── ada_routes.py      # ADA compliance
│   └── strategy_routes.py # Strategy builder tools
├── legal_knowledge.py     # CPS case law database
└── ada_knowledge.py       # ADA knowledge base
```

### Frontend (React + Tailwind + shadcn/ui)
```
/app/frontend/src/
├── App.js                 # Slim orchestrator (422 lines) - Auth + Dashboard routing
├── lib/
│   └── api.js             # Shared API helper with retry logic
├── context/
│   └── AuthContext.js     # React auth context
├── components/
│   ├── LandingPage.jsx    # Landing page
│   ├── AuthPage.jsx       # Login/signup
│   ├── HelpBot.jsx        # Floating help assistant
│   └── features/          # 48 tab/feature components
│       ├── OverviewTab.jsx
│       ├── CasesTab.jsx
│       ├── ChatTab.jsx
│       ├── DocumentsTab.jsx
│       ├── AdminBoardTab.jsx
│       └── ... (45 more)
└── components/ui/         # shadcn/ui components
```

## What's Been Implemented
- Full authentication (JWT + Google OAuth)
- 4-tier subscription system (Free, Essential, Professional, Attorney) with Stripe
- Credit system for pay-as-you-go access
- Case management with CRUD operations
- AI-powered document analysis (OCR, Vision, fraud/perjury detection)
- Audio/video transcription (OpenAI Whisper)
- Background check / Person Lookup
- AI chat assistant with legal expertise
- 50-state law library
- Section 1983 civil rights tools
- CourtListener integration
- ADA compliance tools
- Strategy builder, argument generator, evidence mapper, precedent finder
- Admin board with user/advocate management
- PWA support (service worker + manifest)
- Mobile responsive design

## Completed: March 2026 - Codebase Refactoring (P1)
- Backend: server.py split from 9,027 lines to 130 lines + 17 route modules
- Frontend: App.js split from 11,128 lines to 422 lines + 48 component files
- Created shared modules: config.py, auth.py, utils/credits.py, models/schemas.py, lib/api.js, AuthContext.js
- All 27 backend tests passed, all frontend UI tests passed
- Zero breaking changes - full backward compatibility maintained

## Remaining Tasks

### P0 - Production Deployment
- User needs to redeploy to push modular code to production
- Production site (thecpspunisher.com) needs fresh deployment

### P2 - Future Features
- Deepen CourtListener integration
- Multi-client management for Attorney Suite
- Email notification system
- Streaming response architecture for AI endpoints
- Enhanced PDF export capabilities
