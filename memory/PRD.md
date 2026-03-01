# THE CPS PUNISHER - Product Requirements Document

## Original Problem Statement
Build the most powerful, interactive legal application for Child Protective Services (CPS) cases - an "unstoppable defender of the family." Port all functionality (324+ features) from an existing application and enhance with superior AI and legal knowledge.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui, lucide-react
- **Backend:** Python, FastAPI, Pydantic, Motor (async MongoDB)
- **AI:** LiteLLM via Emergent integrations (GPT-5.2)
- **PDF:** ReportLab, PyPDF
- **Payments:** Stripe (live keys)
- **Auth:** JWT + Google OAuth
- **Database:** MongoDB

## Architecture
- `/app/backend/server.py` - Main backend (monolithic, ~6800 lines)
- `/app/frontend/src/App.js` - Main frontend (monolithic, ~8500 lines)
- `/app/frontend/src/components/tabs/index.jsx` - Extracted tab components (not yet wired in)
- `/app/backend/routes/` - Modular route files (partially set up)

## Completed Features

### Core Platform
- JWT auth + Google OAuth
- Case management (CRUD)
- Stripe payments (live)
- Passcode system for tier access
- 50-state CPS law library
- AI-powered chat assistant
- Legal research tools
- Document generation (10 types)
- Violation tracking
- Timeline management
- Evidence management
- Court hearings tracker
- Communications log
- Strategy builder
- Argument generator
- Evidence mapper
- Precedent finder
- Section 1983 lawsuit tools
- Incident analyzer
- Legal knowledge base
- Know Your Rights guide
- Podcast creator
- Case law analysis
- Visitation log
- Court filings
- Judge watch
- Criminal case tools
- Services tracker
- Calendar
- Community forum
- Find advocates

### Recent Additions (March 2026)
- **Legal Notepad** - Create, tag, export notes as PDFs
- **CourtListener UI** - Search 50M+ court opinions
- **Case Preparation Kit** - 12-page court-ready PDF bundle
- **ADA Compliance Center** - 9-section tool: Federal law, case law, state laws (50 states), common violations, False Claims Act, Civil Guardian/GAL, case analysis, search
- **Enhanced Document Uploads** (March 1, 2026):
  - Multi-file selection
  - Folder upload (webkitdirectory)
  - Drag-and-drop (files and folders, recursive)
  - Upload queue with per-file status tracking
  - Batch processing with violation/timeline counts

## Key Endpoints
- `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- `/api/cases` (CRUD)
- `/api/documents/upload` (multipart), `/api/documents/{case_id}`
- `/api/notes` (CRUD), `/api/notes/all/pdf`
- `/api/courtlistener/search`
- `/api/cases/{case_id}/court-prep-kit`
- `/api/ada/federal-law`, `/api/ada/case-law`, `/api/ada/violations`
- `/api/ada/state/{state}`, `/api/ada/false-claims-act`, `/api/ada/civil-guardian`
- `/api/ada/analyze-case/{case_id}`

## Pending Tasks

### P1 - Codebase Refactoring
- Break `server.py` into modular route files
- Break `App.js` into modular components
- Wire `tabs/index.jsx` components into main app

### P2 - Future Features
- Facebook OAuth (needs user's App ID & Secret)
- Deeper CourtListener integration
- Attorney Suite multi-client management
- Email notifications for case updates
- "Centinet law AI" exploration

## Credentials
- Passcode: `EMERGENT_FULL_ACCESS` (Enterprise tier)
- Stripe: Live keys configured
