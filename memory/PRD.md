# THE CPS PUNISHER - Product Requirements Document

## Overview
A powerful legal application designed to help families defend themselves against CPS (Child Protective Services). The platform provides AI-powered case analysis, document management, legal research, and defense strategy generation.

## Core Features (Implemented)

### Authentication & User Management
- JWT-based authentication with secure password hashing
- Google OAuth integration (Emergent-managed)
- 4-tier subscription system: Free, Essential, Professional, Attorney
- Passcode-based Enterprise tier access (20 reusable codes)
- Admin user management capabilities

### Case Management
- Create and manage multiple CPS cases
- Track case details: caseworker, attorney, judge, court info
- Document organization per case
- Violation tracking and timeline management

### Document Management (Updated 2026-03-10)
- **PDF Upload with OCR**: Standard text extraction + automatic OCR fallback for scanned documents
- Audio file upload support (MP3, WAV, etc.)
- Video file upload support (MP4, MOV, etc.)
- AI-powered document analysis
- Automatic violation and timeline extraction

### AI-Powered Features
- Smart Legal Research Engine
- Smart Document Generator
- Legal Forensic Document Analyzer
- Defense Strategy Generator
- Incident Analyzer
- Case Law Research
- 50-State Law Library
- Judge Research
- Section 1983 Analysis
- Criminal Case Defense Prep

### AI Case Notes (Implemented)
- Automatic saving of all AI-generated responses
- Organized by case and feature
- Searchable and reviewable history

### Help Bot (Implemented)
- In-app AI assistant for navigation
- Feature explanations and guidance
- Floating chat interface

### Advocate System (Implemented)
- Public advocate directory
- Application form for new advocates
- Admin approval workflow
- Profile management (photo, bio, specialties)

### Admin Dashboard (Implemented)
- User management (view, upgrade tiers)
- Advocate approval/rejection
- Passcode management
- System statistics

### Legal Notepad (Implemented)
- Rich text note-taking
- Case association
- PDF export (single and bulk)

### Payments (Implemented)
- Stripe integration for subscriptions
- Pay-as-you-go credit system
- Credit packages for additional features

## Technical Stack
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, lucide-react
- **Backend**: Python, FastAPI, Pydantic
- **Database**: MongoDB
- **AI**: LiteLLM with Emergent LLM Key
- **PDF Processing**: pypdf, pytesseract, pdf2image, ReportLab
- **OCR**: Tesseract OCR with Poppler

## Recent Changes

### 2026-03-10
- **FIXED**: PDF text extraction with OCR fallback for scanned documents
- Added `pytesseract`, `pdf2image` dependencies
- Installed `tesseract-ocr`, `poppler-utils` system packages
- Text-based PDFs: Extracted via pypdf
- Scanned PDFs: Automatically detected and OCR processed

### Previous Session
- Implemented Admin Dashboard
- Implemented Advocate Directory and Application System
- Implemented AI Case Notes auto-saving
- Implemented Help Bot
- Added audio/video file upload support
- Fixed production CORS issues
- Modified passcodes to be reusable

## Known Issues
- Production CORS issue - RESOLVED (user confirmed)
- Monolithic codebase needs refactoring (server.py, App.js)

## Upcoming Tasks (Priority Order)
1. **P0**: Full E2E test of production environment
2. **P1**: Codebase refactoring - split server.py into routes/
3. **P1**: Codebase refactoring - split App.js into components/
4. **P2**: Audio/video transcription and analysis
5. **P2**: Deepen CourtListener integration
6. **P2**: Multi-client Attorney Suite
7. **P2**: Email notification system
8. **P2**: Streaming responses for slow AI endpoints

## File Structure
```
/app
├── backend/
│   ├── routes/         # (To be populated during refactoring)
│   ├── server.py       # Main backend (monolithic - needs refactoring)
│   ├── legal_knowledge.py
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── features/ # (To be populated during refactoring)
        │   └── ui/       # shadcn components
        ├── App.js        # Main frontend (monolithic - needs refactoring)
        ├── index.js
    ├── package.json
    └── .env
```

## Test Credentials
- **Test User**: pdftest@test.com / Test123! (Attorney tier)
- **Enterprise Passcodes**: PUNISHER2024, CPS-WARRIOR-001, etc. (20 reusable codes)
