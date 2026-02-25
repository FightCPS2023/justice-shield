# THE CPS PUNISHER - Product Requirements Document

## Original Problem Statement
Build THE CPS PUNISHER - the most powerful interactive Child Protective Services defense platform. An AI-powered case analyzer, document creator, resources law library, calendar, and comprehensive family defense tool. The app should surpass existing legal tools like LexisNexis for CPS-specific cases. Integrate existing Supabase and Stripe features from the GitHub repository.

## Architecture & Tech Stack
- **Frontend**: React.js with Tailwind CSS, Lucide icons, Sonner notifications
- **Backend**: Python FastAPI with MongoDB (motor async driver)
- **AI**: GPT-5.2 via emergentintegrations library with Emergent LLM Key
- **Payments**: Stripe integration with 4 subscription tiers
- **Authentication**: JWT-based email authentication
- **Database**: MongoDB for users, cases, documents, violations, timeline, calendar, payments

## User Personas
1. **Parents Fighting CPS**: Primary users defending against CPS allegations
2. **Family Advocates**: Helping families navigate CPS system
3. **Legal Researchers**: Studying CPS law across states
4. **Self-Represented Litigants**: Pro se parents in family court
5. **Attorneys**: Legal professionals using the Attorney Suite ($299/mo)

## Core Requirements (Static)
- [x] AI-powered case analysis using GPT-5.2
- [x] Document generator for legal motions and letters
- [x] Violation tracker (constitutional + procedural)
- [x] Law Library covering all 50 states
- [x] Case timeline builder
- [x] Legal research AI assistant
- [x] User authentication (email/password)
- [x] Case management system
- [x] Calendar for court dates and deadlines
- [x] Stripe payment integration with 4 tiers

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
- `/api/calendar` - Calendar events CRUD
- `/api/calendar/upcoming/{days}` - Upcoming events
- `/api/stripe/create-checkout` - Create Stripe checkout session
- `/api/stripe/checkout-status/{session_id}` - Check payment status
- `/api/webhook/stripe` - Stripe webhook handler

### Frontend Features
- Landing page with powerful "CPS PUNISHER" branding
- Authentication (signup/login) with JWT
- Dashboard with overview, stats, quick actions
- My Cases management with state selection
- AI Chat assistant with case context
- Violation tracker with 12+ violation types
- Document generator with 7 document types
- Timeline builder with event types
- Calendar for court dates and deadlines
- Legal Research with state filtering
- Law Library for all 50 states
- Pricing page with 4 subscription tiers

### Stripe Pricing Tiers
| Tier | Monthly | Annual | Features |
|------|---------|--------|----------|
| Essential | $39 | $390 | 25 docs/mo, AI analysis, templates |
| Professional | $79 | $790 | Unlimited docs, AI generation, case law |
| Attorney Suite | $299 | $2,990 | Multi-client, Section 1983, white-label |
| Enterprise | $999 | $9,990 | Unlimited team, API, custom branding |

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
- [ ] Document upload and OCR analysis
- [ ] Stripe webhook signature verification

### P1 (High Priority)
- [ ] Case export to PDF
- [ ] Email notifications for calendar reminders
- [ ] Document templates library
- [ ] Multi-user case sharing

### P2 (Medium Priority)
- [ ] Mobile-responsive PWA
- [ ] Offline document access
- [ ] Attorney directory by state
- [ ] Community forum

### P3 (Future Enhancements)
- [ ] Video consultation scheduling
- [ ] Court document filing integration
- [ ] Case analytics dashboard
- [ ] Supabase migration for auth/storage

## Next Tasks List
1. Add Google and Facebook OAuth authentication
2. Add document upload with AI analysis
3. Build PDF export for cases and documents
4. Add email notification system for calendar reminders
5. Implement Stripe webhook signature verification
6. Create attorney referral directory

## Technical Notes
- All AI responses include legal disclaimers
- State law information dynamically generated via GPT-5.2
- MongoDB indexes on user_id, case_id, session_id for performance
- JWT tokens expire in 30 days
- Emergent LLM Key: sk-emergent-1A6CeCc86Db94704bE
- Stripe Price IDs configured for 8 plans (4 tiers x 2 billing periods)

## Legal Disclaimers
- Platform provides legal EDUCATION, not legal advice
- Users should consult licensed attorneys
- All generated documents require attorney review
