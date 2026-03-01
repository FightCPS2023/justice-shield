"""
Test Legal Notepad and PDF Export Features for CPS Punisher
Tests:
- Legal Notepad CRUD operations
- Save from Law Library to Notepad
- Save from CourtListener to Notepad
- PDF Export for single note
- PDF Export for all notes
- CourtListener search functionality
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cps-punisher-preview.preview.emergentagent.com')
TEST_EMAIL = "lawtest@test.com"
TEST_PASSWORD = "Test123!"


class TestSetup:
    """Setup and authentication tests"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create requests session"""
        return requests.Session()
    
    @pytest.fixture(scope="class")
    def auth_token(self, session):
        """Get authentication token for test user"""
        # Try login first
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
        
        # If login fails, try signup
        if response.status_code == 401:
            signup_response = session.post(f"{BASE_URL}/api/auth/signup", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "name": "Law Test User",
                "state": "TX"
            })
            if signup_response.status_code == 200:
                data = signup_response.json()
                return data.get("access_token")
        
        pytest.skip("Could not authenticate - skipping tests")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }


class TestNotepadCRUD(TestSetup):
    """Test Notepad Create, Read, Update, Delete operations"""
    
    created_note_id = None
    
    def test_create_note_manually(self, session, auth_headers):
        """Test creating a new note manually"""
        response = session.post(f"{BASE_URL}/api/notepad", 
            headers=auth_headers,
            json={
                "title": "TEST_Manual Note",
                "content": "This is a test note with important legal information about CPS procedures.",
                "category": "general",
                "tags": ["test", "manual"]
            }
        )
        
        assert response.status_code == 200, f"Create note failed: {response.text}"
        data = response.json()
        
        assert "id" in data, "Response should contain note ID"
        assert data["title"] == "TEST_Manual Note"
        assert data["category"] == "general"
        assert data["content"] == "This is a test note with important legal information about CPS procedures."
        
        # Store for later tests
        TestNotepadCRUD.created_note_id = data["id"]
        print(f"✓ Created note with ID: {data['id']}")
    
    def test_list_notes(self, session, auth_headers):
        """Test listing all notes"""
        response = session.get(f"{BASE_URL}/api/notepad", headers=auth_headers)
        
        assert response.status_code == 200, f"List notes failed: {response.text}"
        data = response.json()
        
        assert "entries" in data, "Response should contain entries list"
        assert "total" in data, "Response should contain total count"
        assert len(data["entries"]) >= 1, "Should have at least 1 note"
        print(f"✓ Found {len(data['entries'])} notes")
    
    def test_get_single_note(self, session, auth_headers):
        """Test getting a specific note"""
        assert TestNotepadCRUD.created_note_id, "Need created note ID"
        
        response = session.get(
            f"{BASE_URL}/api/notepad/{TestNotepadCRUD.created_note_id}", 
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Get note failed: {response.text}"
        data = response.json()
        
        assert data["id"] == TestNotepadCRUD.created_note_id
        assert data["title"] == "TEST_Manual Note"
        print(f"✓ Retrieved note: {data['title']}")
    
    def test_update_note(self, session, auth_headers):
        """Test updating a note"""
        assert TestNotepadCRUD.created_note_id, "Need created note ID"
        
        response = session.put(
            f"{BASE_URL}/api/notepad/{TestNotepadCRUD.created_note_id}",
            headers=auth_headers,
            json={
                "title": "TEST_Updated Manual Note",
                "content": "Updated content with more details."
            }
        )
        
        assert response.status_code == 200, f"Update note failed: {response.text}"
        data = response.json()
        
        assert data["title"] == "TEST_Updated Manual Note"
        print(f"✓ Updated note title")
    
    def test_delete_note(self, session, auth_headers):
        """Test deleting a note"""
        assert TestNotepadCRUD.created_note_id, "Need created note ID"
        
        response = session.delete(
            f"{BASE_URL}/api/notepad/{TestNotepadCRUD.created_note_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Delete note failed: {response.text}"
        data = response.json()
        
        assert data["status"] == "deleted"
        print(f"✓ Deleted note successfully")
        
        # Verify deletion
        get_response = session.get(
            f"{BASE_URL}/api/notepad/{TestNotepadCRUD.created_note_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404, "Deleted note should return 404"
        print(f"✓ Verified note no longer exists")


class TestSaveFromLibrary(TestSetup):
    """Test saving state law info from Law Library to Notepad"""
    
    saved_note_id = None
    
    def test_save_texas_law_to_notepad(self, session, auth_headers):
        """Test saving Texas state law to notepad"""
        response = session.post(
            f"{BASE_URL}/api/notepad/save-from-library",
            headers=auth_headers,
            json={"state_code": "TX"}
        )
        
        assert response.status_code == 200, f"Save from library failed: {response.text}"
        data = response.json()
        
        assert "id" in data, "Response should contain note ID"
        assert "Texas" in data["title"], "Title should mention Texas"
        assert data["category"] == "statute"
        assert data["source_type"] == "law_library"
        assert "tx" in data["tags"] or "TX" in str(data["tags"]).upper()
        
        TestSaveFromLibrary.saved_note_id = data["id"]
        print(f"✓ Saved Texas law to notepad with ID: {data['id']}")
    
    def test_verify_saved_law_content(self, session, auth_headers):
        """Verify the saved law note has proper content"""
        assert TestSaveFromLibrary.saved_note_id, "Need saved note ID"
        
        response = session.get(
            f"{BASE_URL}/api/notepad/{TestSaveFromLibrary.saved_note_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Texas law should mention DFPS and Family Code
        assert "DFPS" in data["content"] or "Family" in data["content"], \
            "Texas law content should reference DFPS or Family Code"
        print(f"✓ Verified saved law content is accurate")
    
    def test_cleanup_saved_law(self, session, auth_headers):
        """Clean up test data"""
        if TestSaveFromLibrary.saved_note_id:
            response = session.delete(
                f"{BASE_URL}/api/notepad/{TestSaveFromLibrary.saved_note_id}",
                headers=auth_headers
            )
            assert response.status_code == 200
            print(f"✓ Cleaned up test note")


class TestCourtListenerSearch(TestSetup):
    """Test CourtListener court opinions search"""
    
    def test_search_court_opinions(self, session, auth_headers):
        """Test searching CourtListener for court opinions"""
        response = session.get(
            f"{BASE_URL}/api/courtlistener/search?q=CPS+parental+rights",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        assert "results" in data, "Response should contain results"
        assert "count" in data, "Response should contain count"
        
        # CourtListener should return results for this common search
        print(f"✓ Found {len(data['results'])} court opinion results")
    
    def test_search_with_court_filter(self, session, auth_headers):
        """Test searching with court filter"""
        response = session.get(
            f"{BASE_URL}/api/courtlistener/search?q=fourth+amendment&court=ca9",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Filtered search failed: {response.text}"
        data = response.json()
        
        assert "results" in data
        print(f"✓ Filtered search returned {len(data['results'])} results")


class TestSaveFromCourtListener(TestSetup):
    """Test saving CourtListener cases to Notepad"""
    
    saved_case_id = None
    
    def test_save_case_to_notepad(self, session, auth_headers):
        """Test saving a court case to notepad"""
        response = session.post(
            f"{BASE_URL}/api/notepad/save-from-courtlistener",
            headers=auth_headers,
            json={
                "case_name": "TEST_Smith v. Jones",
                "citation": "123 F.3d 456 (9th Cir. 2023)",
                "court": "9th Circuit Court of Appeals",
                "date_filed": "2023-05-15",
                "snippet": "The court held that parental rights are fundamental...",
                "url": "https://www.courtlistener.com/opinion/test-case/"
            }
        )
        
        assert response.status_code == 200, f"Save case failed: {response.text}"
        data = response.json()
        
        assert "id" in data, "Response should contain note ID"
        assert data["title"] == "TEST_Smith v. Jones"
        assert data["category"] == "case_law"
        assert data["source_type"] == "courtlistener"
        assert "case_law" in data["tags"]
        
        TestSaveFromCourtListener.saved_case_id = data["id"]
        print(f"✓ Saved court case to notepad with ID: {data['id']}")
    
    def test_verify_saved_case_content(self, session, auth_headers):
        """Verify saved case has properly formatted content"""
        assert TestSaveFromCourtListener.saved_case_id, "Need saved case ID"
        
        response = session.get(
            f"{BASE_URL}/api/notepad/{TestSaveFromCourtListener.saved_case_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Content should include case details
        assert "TEST_Smith v. Jones" in data["content"] or "Smith" in data["content"]
        assert "9th Circuit" in data["content"]
        print(f"✓ Verified case content is properly formatted")
    
    def test_cleanup_saved_case(self, session, auth_headers):
        """Clean up test data"""
        if TestSaveFromCourtListener.saved_case_id:
            response = session.delete(
                f"{BASE_URL}/api/notepad/{TestSaveFromCourtListener.saved_case_id}",
                headers=auth_headers
            )
            assert response.status_code == 200
            print(f"✓ Cleaned up test case")


class TestPDFExport(TestSetup):
    """Test PDF Export functionality"""
    
    test_note_id = None
    
    @pytest.fixture(scope="class", autouse=True)
    def setup_test_note(self, session, auth_headers):
        """Create a test note for PDF export"""
        response = session.post(f"{BASE_URL}/api/notepad", 
            headers=auth_headers,
            json={
                "title": "TEST_PDF Export Note",
                "content": "This note tests PDF export functionality.\n\nIt includes:\n- Multiple lines\n- Important legal content\n- Test data",
                "category": "statute",
                "tags": ["test", "pdf"]
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            TestPDFExport.test_note_id = data["id"]
            print(f"✓ Created test note for PDF export: {data['id']}")
        
        yield
        
        # Cleanup
        if TestPDFExport.test_note_id:
            session.delete(
                f"{BASE_URL}/api/notepad/{TestPDFExport.test_note_id}",
                headers=auth_headers
            )
    
    def test_export_single_note_to_pdf(self, session, auth_headers):
        """Test exporting a single note to PDF"""
        assert TestPDFExport.test_note_id, "Need test note ID"
        
        response = session.get(
            f"{BASE_URL}/api/export/notepad/{TestPDFExport.test_note_id}/pdf",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"PDF export failed: {response.text}"
        assert response.headers.get("content-type") == "application/pdf", \
            "Response should be PDF content type"
        
        # PDF files start with %PDF
        content = response.content
        assert content[:4] == b'%PDF', "Content should be valid PDF"
        assert len(content) > 1000, "PDF should have substantial content"
        
        print(f"✓ Exported single note to PDF ({len(content)} bytes)")
    
    def test_export_all_notes_to_pdf(self, session, auth_headers):
        """Test exporting all notes to single PDF"""
        response = session.get(
            f"{BASE_URL}/api/export/notepad/all/pdf",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Export all PDF failed: {response.text}"
        assert response.headers.get("content-type") == "application/pdf"
        
        content = response.content
        assert content[:4] == b'%PDF', "Content should be valid PDF"
        
        print(f"✓ Exported all notes to PDF ({len(content)} bytes)")
    
    def test_export_nonexistent_note_returns_404(self, session, auth_headers):
        """Test that exporting non-existent note returns 404"""
        response = session.get(
            f"{BASE_URL}/api/export/notepad/nonexistent-id-12345/pdf",
            headers=auth_headers
        )
        
        assert response.status_code == 404, "Should return 404 for non-existent note"
        print(f"✓ Correctly returns 404 for non-existent note")


class TestNotepadFiltering(TestSetup):
    """Test notepad filtering by category and case"""
    
    def test_filter_global_notes(self, session, auth_headers):
        """Test filtering to only global notes (no case_id)"""
        response = session.get(
            f"{BASE_URL}/api/notepad?global_only=true",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned notes should have null case_id
        for entry in data["entries"]:
            assert entry.get("case_id") is None, "Global notes should have null case_id"
        
        print(f"✓ Global filter returned {len(data['entries'])} notes")
    
    def test_filter_by_category(self, session, auth_headers):
        """Test filtering notes by category"""
        response = session.get(
            f"{BASE_URL}/api/notepad?category=statute",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned notes should be statute category
        for entry in data["entries"]:
            assert entry.get("category") == "statute", "Should only return statute category"
        
        print(f"✓ Category filter returned {len(data['entries'])} statute notes")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
