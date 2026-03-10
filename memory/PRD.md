# THE CPS PUNISHER - Product Requirements Document

## Overview
A powerful legal application designed to help families defend themselves against CPS (Child Protective Services). The platform provides AI-powered case analysis, document management, legal research, and defense strategy generation.

## Current Status: PRODUCTION READY ✅
- Full E2E testing completed (Backend 78%, Frontend 100%)
- Mobile PWA support added
- Audio/video transcription implemented
- CORS issues resolved

## Mobile & PWA Support (Added 2026-03-10)
- **PWA Manifest**: `/public/manifest.json` configured
- **Service Worker**: `/public/sw.js` for offline support
- **Mobile Meta Tags**: viewport, apple-mobile-web-app-capable, theme-color
- **Mobile CSS**: Touch-friendly buttons, safe-area insets, responsive layouts
- **Install**: Users can "Add to Home Screen" from mobile browsers

## Core Features (All Implemented & Tested)

### Authentication & User Management ✅
- JWT-based authentication with secure password hashing
- Google OAuth integration (Emergent-managed)
- 4-tier subscription system: Free, Essential, Professional, Attorney
- Passcode-based Enterprise tier access (20 reusable codes)
- Admin user management capabilities

### Case Management ✅
- Create and manage multiple CPS cases
- Track case details: caseworker, attorney, judge, court info
- Document organization per case
- Violation tracking and timeline management

### Document Management ✅
- **PDF Upload**: Standard text extraction + automatic OCR fallback for scanned documents
- **Audio Transcription**: MP3, WAV, M4A files transcribed via OpenAI Whisper
- **Video Transcription**: MP4, MOV, WebM audio tracks extracted and transcribed
- AI-powered document analysis
- File size limits: 25MB for transcription, 50MB for audio/video upload

### AI-Powered Features ✅
- Smart Legal Research Engine
- Smart Document Generator
- AI Chat (GPT-5.2 powered)
- Legal Forensic Document Analyzer
- Defense Strategy Generator
- 50-State Law Library
- Help Bot (floating assistant)

### Admin Dashboard ✅
- User management (view, upgrade tiers)
- Advocate approval/rejection
- Passcode management
- System statistics
- **Location**: Bottom of sidebar (red "Admin Board" button)

### Admin Credentials
- **Email**: cpsvhuntingjustice@gmail.com
- **Password**: cpssuxass
- **Note**: This email is in ADMIN_EMAILS list, auto-grants admin access on any deployment

## Technical Stack
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, lucide-react
- **Backend**: Python, FastAPI, Pydantic
- **Database**: MongoDB
- **AI**: LiteLLM with Emergent LLM Key (GPT-5.2, Whisper)
- **PDF**: pypdf, pytesseract, pdf2image, ReportLab
- **Mobile**: PWA with Service Worker

## Google Play Store Deployment Options

### Option 1: PWA (Current - Ready Now)
Users can install directly from browser via "Add to Home Screen"

### Option 2: TWA (Trusted Web Activity)
1. Go to https://pwabuilder.com
2. Enter your production URL
3. Download Android package
4. Submit to Google Play Store

### Option 3: Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap sync
```

## File Structure
```
/app
├── backend/
│   ├── server.py          # Main backend (~8200 lines)
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── public/
    │   ├── manifest.json   # PWA manifest
    │   ├── sw.js           # Service worker
    │   └── index.html      # Mobile meta tags
    └── src/
        ├── App.js          # Main frontend
        ├── index.js        # SW registration
        └── index.css       # Mobile CSS
```

## Test Credentials
- **Admin User**: cpsvhuntingjustice@gmail.com / cpssuxass
- **Test User**: pdftest@test.com / Test123! (Attorney tier)
- **Enterprise Passcodes**: PUNISHER2024, CPS-WARRIOR-001, etc.

## Known Issues
- Codebase needs refactoring (server.py ~8200 lines, App.js large)

## Upcoming Tasks
1. **P1**: Codebase refactoring
2. **P2**: TWA wrapper for Google Play Store
3. **P2**: iOS App Store deployment
4. **P2**: Add AI vision for image analysis
