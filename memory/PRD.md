# THE CPS PUNISHER - Product Requirements Document

## Original Problem Statement
Build THE CPS PUNISHER - the most powerful interactive Child Protective Services defense platform. An AI-powered case analyzer, document creator, resources law library, calendar, and comprehensive family defense tool. The app should surpass existing legal tools like LexisNexis for CPS-specific cases.

## Architecture & Tech Stack
- **Frontend**: React.js with Tailwind CSS, Lucide icons, Sonner notifications
- **Backend**: Python FastAPI with MongoDB (motor async driver)
- **AI**: GPT-5.2 via emergentintegrations library with Emergent LLM Key
- **Authentication**: JWT-based email authentication
- **Database**: MongoDB for users, cases, documents, violations, timeline, strategies

## User Personas
1. **Parents Fighting CPS**: Primary users defending against CPS allegations
2. **Family Advocates**: Helping families navigate CPS system
3. **Legal Researchers**: Studying CPS law across states
4. **Self-Represented Litigants**: Pro se parents in family court

## Core Requirements (Static)
- [x] AI-powered case analysis using GPT-5.2
- [x] Document generator for legal motions and letters
- [x] Violation tracker (constitutional + procedural)
- [x] Law Library covering all 50 states
- [x] Case timeline builder
- [x] Legal research AI assistant
- [x] User authentication (email/password)
- [x] Case management system

## What's Been Implemented (Feb 25, 2026)

### Backend API Endpoints
- `/api/auth/signup` - User registration
- `/api/auth/login` - User login
- `/api/auth/me` - Get user profile
- `/api/cases` - Case CRUD operations
- `/api/documents/{case_id}` - Document management
- `/api/violations` - Violation tracking
- `/api/timeline` - Timeline events
- `/api/strategies` - Defense strategies
- `/api/ai/chat` - AI legal assistant (GPT-5.2)
- `/api/ai/analyze` - Document analysis
- `/api/ai/generate-document` - Legal document generator
- `/api/ai/legal-research` - AI-powered legal research
- `/api/law-library/states` - All 50 states list
- `/api/law-library/{state_code}` - State-specific CPS law info

### Frontend Features
- Landing page with powerful "CPS PUNISHER" branding
- Authentication (signup/login) with JWT
- Dashboard with overview, stats, quick actions
- My Cases management with state selection
- AI Chat assistant with case context
- Violation tracker with 12+ violation types
- Document generator with 7 document types
- Timeline builder with event types
- Legal Research with state filtering
- Law Library for all 50 states

### AI Capabilities
- Real GPT-5.2 powered responses
- Constitutional rights education (4th, 5th, 6th, 14th Amendments)
- State-specific CPS statute citations
- Case law references with holdings
- Court-ready document generation
- Defense strategy recommendations

## Prioritized Backlog

### P0 (Critical - Next Phase)
- [ ] Google OAuth integration
- [ ] Facebook OAuth integration
- [ ] Calendar/court date reminders
- [ ] Document upload and OCR analysis

### P1 (High Priority)
- [ ] Case export to PDF
- [ ] Email notifications for deadlines
- [ ] Document templates library
- [ ] Multi-user case sharing

### P2 (Medium Priority)
- [ ] Mobile-responsive PWA
- [ ] Offline document access
- [ ] Attorney directory by state
- [ ] Community forum

### P3 (Future Enhancements)
- [ ] Stripe integration for premium tiers
- [ ] Video consultation scheduling
- [ ] Court document filing integration
- [ ] Case analytics dashboard

## Next Tasks List
1. Add Google and Facebook OAuth authentication
2. Implement calendar feature for court dates
3. Add document upload with AI analysis
4. Build PDF export for cases and documents
5. Add email notification system
6. Create attorney referral directory

## Technical Notes
- All AI responses include legal disclaimers
- State law information dynamically generated via GPT-5.2
- MongoDB indexes on user_id, case_id for performance
- JWT tokens expire in 30 days
- Emergent LLM Key: sk-emergent-1A6CeCc86Db94704bE

## Legal Disclaimers
- Platform provides legal EDUCATION, not legal advice
- Users should consult licensed attorneys
- All generated documents require attorney review
