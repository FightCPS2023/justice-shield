# THE CPS PUNISHER - Product Requirements Document

## Status: PRODUCTION READY ✅
Last Updated: 2026-03-11

## New Features (This Session)

### Background Check / Person Lookup
- **NCIC-style** investigation tool for CPS defense
- Search caseworkers, judges, witnesses
- Lookup types: Comprehensive, Criminal, Civil, Address, Professional
- Court Records Search endpoint
- Auto-saves to AI Case Notes

### AI Vision for Images
- GPT-5.2 Vision analyzes uploaded images
- Full OCR text extraction from photos
- Detailed content description
- Works for screenshots, documents, evidence photos

## Document Extraction (All Working)

| File Type | Method | Status |
|-----------|--------|--------|
| Text PDF | pypdf | ✅ Working |
| Scanned PDF | Tesseract OCR | ✅ Working |
| Images | AI Vision (GPT-5.2) | ✅ Working |
| Audio | Whisper | ✅ Working |
| Video | Whisper | ✅ Working |

## API Endpoints (New)
- `POST /api/ai/person-lookup` - Background check
- `POST /api/ai/court-records-search` - Court records search

## Credit Costs
- person_lookup: 5 credits
- court_records_search: 3 credits
- forensic_analysis: 5 credits

## Known Issues
- LLM budget exceeded - need to add balance
- Codebase needs refactoring (~8600 lines in server.py)

## Test Credentials
- **Admin**: cpsvhuntingjustice@gmail.com / cpssuxass
- **Test User**: pdftest@test.com / Test123!

## Technical Stack
- Frontend: React, Tailwind, shadcn/ui
- Backend: FastAPI, Python
- Database: MongoDB
- AI: GPT-5.2 (text + vision), Whisper (audio)
- OCR: Tesseract
- PDF: pypdf, pdf2image
