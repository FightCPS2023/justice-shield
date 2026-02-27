# THE CPS PUNISHER - Product Requirements Document

## Original Problem Statement
Build THE CPS PUNISHER - the most powerful interactive Child Protective Services defense platform. An AI-powered case analyzer, document creator, resources law library, calendar, and comprehensive family defense tool. The app should surpass existing legal tools like LexisNexis for CPS-specific cases.

## Version 4.0 - POWERHOUSE LEGAL AI

## Architecture & Tech Stack
- **Frontend**: React.js with Tailwind CSS, Lucide icons, Sonner notifications
- **Backend**: Python FastAPI with MongoDB (motor async driver)
- **AI**: GPT-5.2 via emergentintegrations library with Emergent LLM Key
- **Payments**: Stripe integration with 4 subscription tiers
- **Authentication**: JWT-based email authentication
- **Database**: MongoDB for users, cases, documents, violations, timeline, calendar, payments
- **Legal Research**: CourtListener API integration (50M+ court opinions)

## User Personas
1. **Parents Fighting CPS**: Primary users defending against CPS allegations
2. **Family Advocates**: Helping families navigate CPS system
3. **Legal Researchers**: Studying CPS law across states
4. **Self-Represented Litigants**: Pro se parents in family court
5. **Attorneys**: Legal professionals using the Attorney Suite ($299/mo)

## Core Requirements

### Completed Features (Feb 27, 2026)

#### POWERHOUSE FEATURES (NEW!)
- [x] **Section 1983 Civil Rights Lawsuit Generator** - Generate federal lawsuits against CPS
- [x] **Podcast Script Creator** - Create professional podcast scripts about CPS defense
- [x] **Expert Legal AI** - Smarter than any other legal AI for CPS cases
- [x] **Deep Case Law Analysis** - AI-powered precedent research
- [x] **CourtListener Deep Integration** - Search 50M+ court opinions

#### CORE FEATURES
- [x] **DOCUMENT UPLOAD WITH AI ANALYSIS** - Core feature! Upload CPS docs and AI extracts violations, timeline, recommendations
- [x] AI-powered case analysis using GPT-5.2
- [x] Document generator for legal motions and letters (20+ document types)
- [x] Violation tracker (26 violation types - constitutional + procedural)
- [x] Law Library covering all 50 states
- [x] Case timeline builder
- [x] Legal research AI assistant
- [x] User authentication (email/password with JWT)
- [x] Case management system (CRUD with ownership)
- [x] Calendar for court dates and deadlines
- [x] Stripe payment integration with 4 tiers
- [x] Evidence item tracking
- [x] Communication log
- [x] Service records tracking
- [x] Court filings management
- [x] Criminal case component
- [x] Judge research feature
- [x] Defense strategy generator
- [x] CourtListener API integration
- [x] Community forum (basic)
- [x] Advocate directory

### Backend API Endpoints (All Tested & Working)
| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/documents/upload` | POST | **Upload doc + AI analysis** | ✅ |
| `/api/documents/{doc_id}/analysis` | GET | Get document analysis | ✅ |
| `/api/documents/{doc_id}/reanalyze` | POST | Re-run AI analysis | ✅ |
| `/api/health` | GET | Health check | ✅ |
| `/api/auth/signup` | POST | User registration | ✅ |
| `/api/auth/login` | POST | User login | ✅ |
| `/api/auth/me` | GET | Get user profile | ✅ |
| `/api/auth/profile` | PUT | Update profile | ✅ |
| `/api/cases` | GET/POST | List/Create cases | ✅ |
| `/api/cases/{id}` | GET/PUT/DELETE | Case CRUD | ✅ |
| `/api/cases/{id}/summary` | GET | Full case summary | ✅ |
| `/api/violations` | POST | Create violation | ✅ |
| `/api/violations/{case_id}` | GET | List violations | ✅ |
| `/api/violations/types` | GET | Get 26 violation types | ✅ |
| `/api/timeline` | POST | Create timeline event | ✅ |
| `/api/timeline/{case_id}` | GET | List events | ✅ |
| `/api/documents` | POST | Create document | ✅ |
| `/api/documents/{case_id}` | GET | List documents | ✅ |
| `/api/strategies` | POST/GET | Defense strategies | ✅ |
| `/api/evidence` | POST/GET | Evidence items | ✅ |
| `/api/communications` | POST/GET | Communication log | ✅ |
| `/api/services` | POST/GET | Service records | ✅ |
| `/api/court-filings` | POST/GET | Court filings | ✅ |
| `/api/criminal-case` | POST/GET | Criminal cases | ✅ |
| `/api/judge-research` | POST/GET | Judge research | ✅ |
| `/api/calendar` | GET/POST | Calendar events | ✅ |
| `/api/calendar/upcoming/{days}` | GET | Upcoming events | ✅ |
| `/api/ai/chat` | POST | AI chat assistant | ✅ |
| `/api/ai/analyze-document` | POST | Document analysis | ✅ |
| `/api/ai/generate-document` | POST | Generate 20+ doc types | ✅ |
| `/api/ai/defense-strategy` | POST | Strategy generator | ✅ |
| `/api/ai/legal-research` | POST | AI research | ✅ |
| `/api/law-library/states` | GET | All 50 states | ✅ |
| `/api/law-library/{state}` | GET | State-specific law | ✅ |
| `/api/courtlistener/search` | GET | Case law search | ✅ |
| `/api/courtlistener/judges` | GET | Judge search | ✅ |
| `/api/stripe/create-checkout` | POST | Payment checkout | ✅ |
| `/api/stripe/checkout-status/{id}` | GET | Payment status | ✅ |
| `/api/forum/posts` | GET/POST | Forum posts | ✅ |
| `/api/advocates` | GET | Advocate directory | ✅ |

### Frontend Features (All Working)
- Landing page with CPS PUNISHER branding
- Authentication (signup/login) with JWT
- Dashboard with overview, stats, quick actions
- My Cases management with state selection
- AI Chat assistant with case context
- Violation tracker with 26+ violation types
- Document Upload with AI Analysis (Core Feature!)
- Document generator with 20+ document types
- Timeline builder with event types
- **Evidence Tracker** - Track all evidence (NEW!)
- **Communications Log** - Log all CPS communications (NEW!)
- **Court Filings** - Track motions, petitions, orders (NEW!)
- **Judge Watch** - Research your judge (NEW!)
- **Defense Strategy** - AI-generated + manual strategies (NEW!)
- **Criminal Case Link** - Track related criminal charges (NEW!)
- **Services Tracker** - Track case plan services (NEW!)
- **Community Forum** - Connect with other parents (NEW!)
- **Advocates Directory** - Find help by state (NEW!)
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

## Testing Status (Feb 25, 2026)
- **Backend**: 100% pass rate (25/25 tests)
- **Frontend**: 95% functional
- **Test file**: `/app/backend/tests/test_cps_punisher.py`
- **Test report**: `/app/test_reports/iteration_3.json`

## Prioritized Backlog

### P0 (Critical - Next Phase)
- [x] ~~Document upload with AI analysis~~ **DONE!**
- [ ] Google OAuth integration
- [ ] Facebook OAuth integration  
- [ ] Stripe webhook signature verification

### P1 (High Priority)
- [ ] Case export to PDF
- [ ] Email notifications for calendar reminders
- [ ] Document templates library
- [ ] Multi-user case sharing
- [ ] AI response streaming for better UX

### P2 (Medium Priority)
- [ ] Mobile-responsive PWA
- [ ] Offline document access
- [ ] Attorney directory by state (populated)
- [ ] Community forum moderation

### P3 (Future Enhancements)
- [ ] Video consultation scheduling
- [ ] Court document filing integration
- [ ] Case analytics dashboard
- [ ] Bulk document generation

## Technical Notes
- AI responses take ~10-30 seconds (GPT-5.2 processing time)
- State law information dynamically generated via GPT-5.2
- MongoDB indexes on user_id, case_id, session_id for performance
- JWT tokens expire in 30 days
- All AI responses include legal disclaimers

## Legal Disclaimers
- Platform provides legal EDUCATION, not legal advice
- Users should consult licensed attorneys
- All generated documents require attorney review

## Test Credentials
- Email: test@example.com
- Password: Test123!
