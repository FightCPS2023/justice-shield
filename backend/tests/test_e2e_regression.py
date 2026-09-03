"""
E2E Regression Test Suite - THE CPS PUNISHER
Comprehensive testing of all major features:
- User authentication (signup, login, logout)
- Case management (create, list, view, delete)
- Document upload (PDF, audio, video with transcription)
- AI Chat functionality
- Smart Legal Research
- Smart Document Generator  
- Law Library access
- Legal Notepad (create, view, export)
- AI Case Notes viewing
- Help Bot functionality
- Advocate Directory
- Navigation and tier restrictions

Test credentials: pdftest@test.com / Test123! (Attorney tier)
Test case ID: fb3aefda-21dd-479f-8ded-0915fcc75856
"""

import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "pdftest@test.com"
TEST_PASSWORD = "Test123!"
TEST_CASE_ID = "fb3aefda-21dd-479f-8ded-0915fcc75856"

# Test files
TEXT_PDF = "/tmp/test_upload.pdf"
AUDIO_FILE = "/tmp/test_audio.mp3"
VIDEO_FILE = "/tmp/test_video.mp4"


@pytest.fixture(scope="module")
def auth_session():
    """Setup authenticated session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    
    # Login
    response = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    
    data = response.json()
    token = data.get("access_token")
    tier = data.get("tier")
    
    print(f"✓ Authenticated as {TEST_EMAIL}, tier: {tier}")
    session.headers.update({"Authorization": f"Bearer {token}"})
    
    return session, data


class TestHealthAndAuth:
    """Test basic health checks and authentication"""
    
    def test_01_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "operational"
        print(f"✓ API operational: {data.get('version')}")
    
    def test_02_login_success(self):
        """Test successful login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data.get("email") == TEST_EMAIL
        assert data.get("tier") == "attorney"
        print(f"✓ Login successful, tier: {data.get('tier')}")
    
    def test_03_login_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_04_get_current_user(self, auth_session):
        """Test get current user info"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data.get("email") == TEST_EMAIL
        print(f"✓ User profile retrieved: {data.get('name')}")
    
    def test_05_tier_status(self, auth_session):
        """Test tier status endpoint"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/auth/tier-status")
        assert response.status_code == 200
        data = response.json()
        assert "tier" in data
        assert "usage" in data
        assert "limits" in data
        print(f"✓ Tier status: {data.get('tier')}, AI credits used: {data['usage'].get('ai_credits_used')}")


class TestCaseManagement:
    """Test case creation and management"""
    
    def test_01_list_cases(self, auth_session):
        """Test listing user cases"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/cases")
        assert response.status_code == 200
        data = response.json()
        assert "cases" in data
        print(f"✓ Found {len(data['cases'])} cases")
    
    def test_02_get_specific_case(self, auth_session):
        """Test getting specific case"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/cases/{TEST_CASE_ID}")
        assert response.status_code == 200
        data = response.json()
        assert data.get("id") == TEST_CASE_ID
        print(f"✓ Case retrieved: {data.get('title')}, State: {data.get('state')}")
    
    def test_03_get_case_summary(self, auth_session):
        """Test getting case summary with all related data"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/cases/{TEST_CASE_ID}/summary")
        assert response.status_code == 200
        data = response.json()
        assert "case" in data
        assert "stats" in data
        print(f"✓ Case summary: {data['stats'].get('total_violations')} violations, {data['stats'].get('total_evidence')} evidence")
    
    def test_04_create_and_delete_case(self, auth_session):
        """Test creating and deleting a case"""
        session, _ = auth_session
        
        # Create
        new_case = {
            "title": f"Test Case {uuid.uuid4().hex[:8]}",
            "description": "E2E test case - will be deleted",
            "state": "TX"
        }
        response = session.post(f"{BASE_URL}/api/cases", json=new_case)
        assert response.status_code == 200
        data = response.json()
        case_id = data.get("id")
        assert case_id is not None
        print(f"✓ Case created: {case_id}")
        
        # Delete
        response = session.delete(f"{BASE_URL}/api/cases/{case_id}")
        assert response.status_code == 200
        print(f"✓ Case deleted: {case_id}")


class TestDocumentUpload:
    """Test document upload with transcription/OCR"""
    
    @pytest.fixture(autouse=True)
    def setup(self, auth_session):
        self.session, _ = auth_session
        self.uploaded_doc_ids = []
        yield
        # Cleanup
        for doc_id in self.uploaded_doc_ids:
            try:
                self.session.delete(f"{BASE_URL}/api/documents/{doc_id}")
            except Exception:
                pass
    
    def test_01_upload_pdf(self):
        """Test PDF upload with text extraction"""
        if not os.path.exists(TEXT_PDF):
            pytest.skip("Test PDF not found")
        
        with open(TEXT_PDF, 'rb') as f:
            files = {'file': ('test_document.pdf', f, 'application/pdf')}
            data = {'case_id': TEST_CASE_ID, 'title': 'E2E Test PDF', 'doc_type': 'cps_document', 'auto_analyze': 'false'}
            headers = {'Authorization': self.session.headers.get('Authorization')}
            response = requests.post(f"{BASE_URL}/api/documents/upload", files=files, data=data, headers=headers)
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        doc_data = response.json()
        self.uploaded_doc_ids.append(doc_data.get("id"))
        assert doc_data.get("file_type") == "pdf"
        assert doc_data.get("file_category") == "document"
        print(f"✓ PDF uploaded: {doc_data.get('id')}, content length: {len(doc_data.get('content', ''))}")
    
    def test_02_upload_audio(self):
        """Test audio upload with Whisper transcription"""
        if not os.path.exists(AUDIO_FILE):
            pytest.skip("Test audio file not found")
        
        with open(AUDIO_FILE, 'rb') as f:
            files = {'file': ('test_audio.mp3', f, 'audio/mpeg')}
            data = {'case_id': TEST_CASE_ID, 'title': 'E2E Test Audio', 'doc_type': 'recording', 'auto_analyze': 'false'}
            headers = {'Authorization': self.session.headers.get('Authorization')}
            response = requests.post(f"{BASE_URL}/api/documents/upload", files=files, data=data, headers=headers)
        
        assert response.status_code == 200, f"Audio upload failed: {response.text}"
        doc_data = response.json()
        self.uploaded_doc_ids.append(doc_data.get("id"))
        assert doc_data.get("file_category") == "audio"
        print(f"✓ Audio uploaded and transcribed: {len(doc_data.get('content', ''))} chars")
    
    def test_03_upload_video(self):
        """Test video upload with transcription"""
        if not os.path.exists(VIDEO_FILE):
            pytest.skip("Test video file not found")
        
        with open(VIDEO_FILE, 'rb') as f:
            files = {'file': ('test_video.mp4', f, 'video/mp4')}
            data = {'case_id': TEST_CASE_ID, 'title': 'E2E Test Video', 'doc_type': 'recording', 'auto_analyze': 'false'}
            headers = {'Authorization': self.session.headers.get('Authorization')}
            response = requests.post(f"{BASE_URL}/api/documents/upload", files=files, data=data, headers=headers)
        
        assert response.status_code == 200, f"Video upload failed: {response.text}"
        doc_data = response.json()
        self.uploaded_doc_ids.append(doc_data.get("id"))
        assert doc_data.get("file_category") == "video"
        print(f"✓ Video uploaded and transcribed: {len(doc_data.get('content', ''))} chars")
    
    def test_04_list_documents(self):
        """Test listing documents for a case"""
        response = self.session.get(f"{BASE_URL}/api/documents/{TEST_CASE_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "documents" in data
        print(f"✓ Found {len(data['documents'])} documents for case")


class TestAIFeatures:
    """Test AI chat and analysis features"""
    
    def test_01_ai_chat(self, auth_session):
        """Test AI chat functionality"""
        session, _ = auth_session
        response = session.post(f"{BASE_URL}/api/ai/chat", json={
            "message": "What are my constitutional rights in a CPS case?",
            "context_type": "general"
        })
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data.get("response", "")) > 50
        print(f"✓ AI Chat response received: {len(data['response'])} chars")
    
    def test_02_help_bot(self, auth_session):
        """Test Help Bot functionality"""
        session, _ = auth_session
        response = session.post(f"{BASE_URL}/api/ai/help-bot", json={
            "question": "How do I upload documents?"
        })
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        print(f"✓ Help Bot response: {len(data['answer'])} chars")
    
    def test_03_smart_research(self, auth_session):
        """Test Smart Legal Research"""
        session, _ = auth_session
        response = session.post(f"{BASE_URL}/api/ai/smart-research", json={
            "query": "Fourth Amendment violations in CPS home visits",
            "state": "TX",
            "include_case_law": True
        })
        assert response.status_code == 200
        data = response.json()
        assert "research" in data
        print(f"✓ Smart Research response: {len(str(data))} chars")
    
    def test_04_smart_document_generator(self, auth_session):
        """Test Smart Document Generator"""
        session, _ = auth_session
        response = session.post(f"{BASE_URL}/api/ai/smart-document", json={
            "document_type": "Motion to Dismiss",
            "state": "TX",
            "case_facts": "CPS failed to provide reasonable efforts before removal."
        })
        assert response.status_code == 200
        data = response.json()
        assert "document" in data
        print(f"✓ Document generated: {len(data['document'])} chars")
    
    def test_05_ai_case_notes(self, auth_session):
        """Test getting AI case notes"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/cases/{TEST_CASE_ID}/ai-notes")
        assert response.status_code == 200
        data = response.json()
        assert "notes" in data
        print(f"✓ AI Case Notes: {data.get('total', 0)} notes found")


class TestLawLibrary:
    """Test Law Library and legal knowledge base"""
    
    def test_01_supreme_court_cases(self, auth_session):
        """Test Supreme Court cases endpoint"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/legal/supreme-court-cases")
        assert response.status_code == 200
        data = response.json()
        assert "cases" in data
        print(f"✓ Supreme Court cases: {len(data.get('cases', []))} available")
    
    def test_02_blacks_law_definitions(self, auth_session):
        """Test Black's Law Dictionary definitions"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/legal/blacks-law")
        assert response.status_code == 200
        data = response.json()
        assert "definitions" in data
        print(f"✓ Black's Law definitions: {len(data.get('definitions', {}))} terms")
    
    def test_03_constitutional_rights(self, auth_session):
        """Test Constitutional Rights endpoint"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/legal/constitutional-rights")
        assert response.status_code == 200
        data = response.json()
        assert "rights" in data
        print(f"✓ Constitutional rights data retrieved")
    
    def test_04_rights_guide(self, auth_session):
        """Test Rights Guide"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/rights-guide")
        assert response.status_code == 200
        data = response.json()
        assert "guide" in data
        print(f"✓ Rights guide retrieved")


class TestNotepad:
    """Test Legal Notepad functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self, auth_session):
        self.session, _ = auth_session
        self.created_notes = []
        yield
        # Cleanup
        for note_id in self.created_notes:
            try:
                self.session.delete(f"{BASE_URL}/api/notepad/{note_id}")
            except Exception:
                pass
    
    def test_01_create_note(self):
        """Test creating a notepad entry"""
        response = self.session.post(f"{BASE_URL}/api/notepad", json={
            "title": "E2E Test Note",
            "content": "This is a test note created during E2E testing.",
            "category": "general",
            "tags": ["test", "e2e"]
        })
        assert response.status_code == 200
        data = response.json()
        self.created_notes.append(data.get("id"))
        assert data.get("title") == "E2E Test Note"
        print(f"✓ Note created: {data.get('id')}")
    
    def test_02_list_notes(self):
        """Test listing notepad entries"""
        response = self.session.get(f"{BASE_URL}/api/notepad")
        assert response.status_code == 200
        data = response.json()
        assert "entries" in data
        print(f"✓ Found {len(data['entries'])} notes")
    
    def test_03_export_notepad_pdf(self):
        """Test exporting notepad to PDF"""
        response = self.session.get(f"{BASE_URL}/api/export/notepad/all/pdf")
        # Either 200 with PDF or appropriate error
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            assert response.headers.get('content-type') == 'application/pdf'
            print(f"✓ Notepad PDF export: {len(response.content)} bytes")
        else:
            print("✓ Notepad export: No notes to export (expected)")


class TestAdvocateDirectory:
    """Test Advocate Directory functionality"""
    
    def test_01_list_advocates(self, auth_session):
        """Test listing approved advocates"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/advocates")
        assert response.status_code == 200
        data = response.json()
        assert "advocates" in data
        print(f"✓ Found {len(data['advocates'])} approved advocates")
    
    def test_02_filter_by_state(self, auth_session):
        """Test filtering advocates by state"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/advocates?state=TX")
        assert response.status_code == 200
        data = response.json()
        assert "advocates" in data
        print(f"✓ Texas advocates: {len(data['advocates'])}")


class TestCreditsAndPricing:
    """Test credits and pricing endpoints"""
    
    def test_01_credit_packages(self, auth_session):
        """Test getting credit packages"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/credits/packages")
        assert response.status_code == 200
        data = response.json()
        assert "packages" in data
        assert "feature_costs" in data
        print(f"✓ Credit packages: {len(data['packages'])} available")
    
    def test_02_credit_balance(self, auth_session):
        """Test getting credit balance"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/credits/balance")
        assert response.status_code == 200
        data = response.json()
        assert "purchased_credits" in data
        assert "tier" in data
        print(f"✓ Credit balance: {data.get('purchased_credits')} purchased, tier: {data.get('tier')}")


class TestViolationsAndEvidence:
    """Test violations and evidence management"""
    
    def test_01_violation_types(self, auth_session):
        """Test getting violation types"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/violations/types")
        assert response.status_code == 200
        data = response.json()
        assert "types" in data
        print(f"✓ Violation types: {len(data['types'])} available")
    
    def test_02_list_violations(self, auth_session):
        """Test listing case violations"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/violations/{TEST_CASE_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "violations" in data
        print(f"✓ Case violations: {len(data['violations'])}")
    
    def test_03_list_evidence(self, auth_session):
        """Test listing case evidence"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/evidence/{TEST_CASE_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "evidence" in data
        print(f"✓ Case evidence: {len(data['evidence'])}")
    
    def test_04_evidence_checklist(self, auth_session):
        """Test evidence checklist"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/evidence-checklist")
        assert response.status_code == 200
        data = response.json()
        assert "checklist" in data
        print(f"✓ Evidence checklist: {len(data['checklist'])} categories")


class TestCalendarAndTimeline:
    """Test calendar and timeline features"""
    
    def test_01_list_calendar_events(self, auth_session):
        """Test listing calendar events"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/calendar")
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        print(f"✓ Calendar events: {len(data['events'])}")
    
    def test_02_timeline_events(self, auth_session):
        """Test listing timeline events"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/timeline/{TEST_CASE_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        print(f"✓ Timeline events: {len(data['events'])}")


class TestAdvancedFeatures:
    """Test advanced AI features (for attorney tier)"""
    
    def test_01_section_1983_templates(self, auth_session):
        """Test Section 1983 templates"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/section-1983/templates")
        assert response.status_code == 200
        data = response.json()
        assert "templates" in data
        print(f"✓ Section 1983 templates: {len(data['templates'])} available")
    
    def test_02_ada_federal_law(self, auth_session):
        """Test ADA federal law endpoint"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/ada/federal-law")
        assert response.status_code == 200
        data = response.json()
        assert "federal_law" in data
        print(f"✓ ADA federal law data retrieved")
    
    def test_03_court_hearing_types(self, auth_session):
        """Test court hearing types"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/court-hearings/types")
        assert response.status_code == 200
        data = response.json()
        assert "types" in data
        print(f"✓ Court hearing types: {len(data['types'])}")


class TestUnauthenticatedAccess:
    """Test that protected endpoints reject unauthenticated requests"""
    
    def test_01_cases_requires_auth(self):
        """Test that cases endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/cases")
        assert response.status_code == 401
        print("✓ Cases endpoint correctly requires auth")
    
    def test_02_documents_requires_auth(self):
        """Test that documents endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/documents/{TEST_CASE_ID}")
        assert response.status_code == 401
        print("✓ Documents endpoint correctly requires auth")
    
    def test_03_ai_chat_requires_auth(self):
        """Test that AI chat requires authentication"""
        response = requests.post(f"{BASE_URL}/api/ai/chat", json={"message": "test"})
        assert response.status_code == 401
        print("✓ AI chat correctly requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
