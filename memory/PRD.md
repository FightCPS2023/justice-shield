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
- **PDF Upload**: Standard text extraction + automatic OCR fallback for scanned documents
- **Audio Transcription**: MP3, WAV, M4A files transcribed via OpenAI Whisper
- **Video Transcription**: MP4, MOV, WebM audio tracks extracted and transcribed
- AI-powered document analysis
- Automatic violation and timeline extraction
- File size limits: 25MB for transcription, 50MB for audio/video upload

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
- **Audio/Video**: OpenAI Whisper via emergentintegrations, ffmpeg

## Recent Changes

### 2026-03-10 (Session 2)
- **IMPLEMENTED**: Audio transcription using OpenAI Whisper (whisper-1 model)
- **IMPLEMENTED**: Video transcription (extracts and transcribes audio track)
- **SUPPORTED FORMATS**: MP3, WAV, M4A, MP4, MOV, WebM, MPEG
- **FILE LIMITS**: 25MB for Whisper transcription, 50MB for upload
- **TESTING**: 13/13 backend tests passed for transcription/OCR features

### 2026-03-10 (Session 1)
- **FIXED**: PDF text extraction with OCR fallback for scanned documents
- Added `pytesseract`, `pdf2image` dependencies
- Installed `tesseract-ocr`, `poppler-utils` system packages

### Previous Session
- Implemented Admin Dashboard
- Implemented Advocate Directory and Application System
- Implemented AI Case Notes auto-saving
- Implemented Help Bot
- Added audio/video file upload support
- Fixed production CORS issues
- Modified passcodes to be reusable

## Known Issues
- ~~Production CORS issue~~ - RESOLVED
- Monolithic codebase needs refactoring (server.py ~8200 lines, App.js large)

## Upcoming Tasks (Priority Order)
1. **P0**: Full E2E test of production environment
2. **P1**: Codebase refactoring - split server.py into routes/
3. **P1**: Codebase refactoring - split App.js into components/
4. **P2**: Add AI vision capability for image analysis
5. **P2**: Deepen CourtListener integration
6. **P2**: Multi-client Attorney Suite
7. **P2**: Email notification system
8. **P2**: Streaming responses for slow AI endpoints

## File Structure
```
/app
├── backend/
│   ├── routes/         # (To be populated during refactoring)
│   ├── tests/
│   │   └── test_transcription_ocr.py  # New test file
│   ├── server.py       # Main backend (~8200 lines - needs refactoring)
│   ├── legal_knowledge.py
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── features/ # (To be populated during refactoring)
        │   └── ui/       # shadcn components
        ├── App.js        # Main frontend (needs refactoring)
        ├── index.js
    ├── package.json
    └── .env
```

## Test Credentials
- **Test User**: pdftest@test.com / Test123! (Attorney tier)
- **Test Case ID**: fb3aefda-21dd-479f-8ded-0915fcc75856
- **Enterprise Passcodes**: PUNISHER2024, CPS-WARRIOR-001, etc. (20 reusable codes)

## API Endpoints for Document Upload
- `POST /api/documents/upload` - Upload files (PDF, audio, video)
  - Supports: PDF (with OCR), MP3/WAV/M4A (transcription), MP4/MOV (video transcription)
  - Max sizes: 10MB documents, 50MB audio/video
  - Auto-transcription for audio/video under 25MB

## Test Reports
- `/app/test_reports/iteration_14.json` - Latest transcription/OCR tests (13/13 passed)
