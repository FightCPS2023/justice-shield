"""
Test file for CPS Punisher - Document Upload and ADA Compliance Features
Tests:
- User signup/login
- Case creation
- Document upload endpoint
- ADA API endpoints (federal-law, violations, state)
"""
import os
import pytest
import requests
import io
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials
TEST_EMAIL = f"test_docs_ada_{uuid.uuid4().hex[:8]}@test.com"
TEST_PASSWORD = "Test123!"
TEST_NAME = "Test User"
TEST_STATE = "CA"


class TestAuthAndCase:
    """Authentication and Case creation tests"""
    token = None
    user_id = None
    case_id = None
    
    def test_01_signup(self):
        """Test user signup endpoint"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "state": TEST_STATE
        })
        
        assert response.status_code == 200, f"Signup failed: {response.text}"
        data = response.json()
        
        # Data assertions
        assert "access_token" in data, "Missing access_token in response"
        assert "user_id" in data, "Missing user_id in response"
        assert data["email"] == TEST_EMAIL, f"Email mismatch: {data['email']}"
        assert data["name"] == TEST_NAME, f"Name mismatch: {data['name']}"
        assert data["tier"] == "free", f"Tier should be 'free': {data['tier']}"
        
        TestAuthAndCase.token = data["access_token"]
        TestAuthAndCase.user_id = data["user_id"]
        print(f"SUCCESS: User signed up with ID: {TestAuthAndCase.user_id}")
    
    def test_02_login(self):
        """Test login endpoint with created user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        assert "access_token" in data, "Missing access_token"
        assert data["email"] == TEST_EMAIL, "Email mismatch"
        
        # Update token (login might return new one)
        TestAuthAndCase.token = data["access_token"]
        print(f"SUCCESS: User logged in successfully")
    
    def test_03_create_case(self):
        """Test case creation"""
        headers = {"Authorization": f"Bearer {TestAuthAndCase.token}"}
        
        response = requests.post(f"{BASE_URL}/api/cases", 
            json={
                "title": "Test CPS Case for Documents",
                "state": TEST_STATE,
                "description": "Test case for document upload testing"
            },
            headers=headers
        )
        
        assert response.status_code == 200, f"Case creation failed: {response.text}"
        data = response.json()
        
        # Data assertions
        assert "id" in data, "Missing case ID"
        assert data["title"] == "Test CPS Case for Documents"
        assert data["state"] == TEST_STATE
        assert data["status"] == "active"
        
        TestAuthAndCase.case_id = data["id"]
        print(f"SUCCESS: Case created with ID: {TestAuthAndCase.case_id}")
    
    def test_04_get_case(self):
        """Verify case was persisted by GET"""
        headers = {"Authorization": f"Bearer {TestAuthAndCase.token}"}
        
        response = requests.get(f"{BASE_URL}/api/cases/{TestAuthAndCase.case_id}",
            headers=headers
        )
        
        assert response.status_code == 200, f"GET case failed: {response.text}"
        data = response.json()
        
        assert data["id"] == TestAuthAndCase.case_id
        assert data["title"] == "Test CPS Case for Documents"
        print(f"SUCCESS: Case verified - persisted correctly")


class TestDocumentUpload:
    """Document upload endpoint tests"""
    
    def test_05_upload_txt_file(self):
        """Test uploading a .txt file"""
        headers = {"Authorization": f"Bearer {TestAuthAndCase.token}"}
        
        # Create a test file in memory
        test_content = """
        CPS INVESTIGATION REPORT
        Date: January 15, 2026
        
        This is a test document for CPS Punisher document upload testing.
        The caseworker conducted an investigation without proper notice.
        No safety plan was offered to the family.
        Fourth Amendment rights may have been violated during home entry.
        """
        
        files = {
            "file": ("test_document.txt", io.BytesIO(test_content.encode('utf-8')), "text/plain")
        }
        data = {
            "case_id": TestAuthAndCase.case_id,
            "title": "Test Investigation Report",
            "doc_type": "cps_document",
            "auto_analyze": "false"  # Skip AI analysis for faster test
        }
        
        response = requests.post(f"{BASE_URL}/api/documents/upload",
            headers=headers,
            files=files,
            data=data
        )
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        result = response.json()
        
        # Data assertions
        assert "id" in result, "Missing document ID"
        assert result["title"] == "Test Investigation Report"
        assert result["doc_type"] == "cps_document"
        assert result["case_id"] == TestAuthAndCase.case_id
        assert result["source"] == "upload"
        assert "content" in result, "Missing content field"
        
        print(f"SUCCESS: Document uploaded with ID: {result['id']}")
    
    def test_06_upload_without_auth(self):
        """Test that upload requires authentication"""
        files = {
            "file": ("test.txt", io.BytesIO(b"test content"), "text/plain")
        }
        data = {
            "case_id": TestAuthAndCase.case_id,
            "title": "Unauthorized Upload",
            "doc_type": "cps_document",
            "auto_analyze": "false"
        }
        
        response = requests.post(f"{BASE_URL}/api/documents/upload",
            files=files,
            data=data
        )
        
        assert response.status_code == 401, f"Should return 401, got: {response.status_code}"
        print("SUCCESS: Unauthenticated upload correctly rejected")
    
    def test_07_upload_unsupported_type(self):
        """Test upload with unsupported file type"""
        headers = {"Authorization": f"Bearer {TestAuthAndCase.token}"}
        
        files = {
            "file": ("test.xyz", io.BytesIO(b"test content"), "application/octet-stream")
        }
        data = {
            "case_id": TestAuthAndCase.case_id,
            "title": "Unsupported File",
            "doc_type": "cps_document",
            "auto_analyze": "false"
        }
        
        response = requests.post(f"{BASE_URL}/api/documents/upload",
            headers=headers,
            files=files,
            data=data
        )
        
        assert response.status_code == 400, f"Should return 400, got: {response.status_code}"
        print("SUCCESS: Unsupported file type correctly rejected")
    
    def test_08_list_documents(self):
        """Verify uploaded documents are listed"""
        headers = {"Authorization": f"Bearer {TestAuthAndCase.token}"}
        
        response = requests.get(f"{BASE_URL}/api/documents/{TestAuthAndCase.case_id}",
            headers=headers
        )
        
        assert response.status_code == 200, f"List documents failed: {response.text}"
        data = response.json()
        
        assert "documents" in data
        assert len(data["documents"]) >= 1, "Should have at least one document"
        
        print(f"SUCCESS: Found {len(data['documents'])} document(s)")


class TestADAEndpoints:
    """ADA API endpoint tests"""
    
    def test_09_get_federal_law(self):
        """Test GET /api/ada/federal-law"""
        headers = {"Authorization": f"Bearer {TestAuthAndCase.token}"}
        
        response = requests.get(f"{BASE_URL}/api/ada/federal-law",
            headers=headers
        )
        
        assert response.status_code == 200, f"Federal law endpoint failed: {response.text}"
        data = response.json()
        
        # Data assertions - check expected structure
        assert "federal_law" in data, "Missing 'federal_law' in response"
        assert "cps_requirements" in data, "Missing 'cps_requirements'"
        assert "compliance_checklist" in data, "Missing 'compliance_checklist'"
        
        print(f"SUCCESS: Federal law endpoint returns expected data structure")
    
    def test_10_get_violations(self):
        """Test GET /api/ada/violations"""
        headers = {"Authorization": f"Bearer {TestAuthAndCase.token}"}
        
        response = requests.get(f"{BASE_URL}/api/ada/violations",
            headers=headers
        )
        
        assert response.status_code == 200, f"Violations endpoint failed: {response.text}"
        data = response.json()
        
        # Data assertions
        assert "violations" in data, "Missing 'violations' in response"
        assert "checklist" in data, "Missing 'checklist'"
        
        print(f"SUCCESS: Violations endpoint returns expected data structure")
    
    def test_11_get_state_info(self):
        """Test GET /api/ada/state/CA"""
        headers = {"Authorization": f"Bearer {TestAuthAndCase.token}"}
        
        response = requests.get(f"{BASE_URL}/api/ada/state/CA",
            headers=headers
        )
        
        assert response.status_code == 200, f"State info endpoint failed: {response.text}"
        data = response.json()
        
        # Data assertions
        assert "state" in data, "Missing 'state' in response"
        assert data["state"] == "CA", f"State should be CA: {data['state']}"
        assert "federal_law" in data, "Missing 'federal_law'"
        assert "common_violations" in data, "Missing 'common_violations'"
        
        print(f"SUCCESS: State info endpoint returns data for CA")
    
    def test_12_get_state_unknown(self):
        """Test GET /api/ada/state with unknown state returns generic info"""
        headers = {"Authorization": f"Bearer {TestAuthAndCase.token}"}
        
        response = requests.get(f"{BASE_URL}/api/ada/state/XX",
            headers=headers
        )
        
        # Should still return 200 with generic federal info
        assert response.status_code == 200, f"Unknown state should return 200: {response.text}"
        data = response.json()
        
        assert data["state"] == "XX"
        assert "federal_law" in data, "Should include federal law fallback"
        
        print(f"SUCCESS: Unknown state returns generic federal info")
    
    def test_13_ada_without_auth(self):
        """Test ADA endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/ada/federal-law")
        assert response.status_code == 401, f"Should return 401, got: {response.status_code}"
        
        response = requests.get(f"{BASE_URL}/api/ada/violations")
        assert response.status_code == 401, f"Should return 401, got: {response.status_code}"
        
        response = requests.get(f"{BASE_URL}/api/ada/state/CA")
        assert response.status_code == 401, f"Should return 401, got: {response.status_code}"
        
        print("SUCCESS: ADA endpoints correctly require authentication")


class TestCleanup:
    """Cleanup test data"""
    
    def test_99_cleanup_case(self):
        """Delete test case and all related data"""
        if not TestAuthAndCase.case_id:
            pytest.skip("No case to cleanup")
        
        headers = {"Authorization": f"Bearer {TestAuthAndCase.token}"}
        
        response = requests.delete(f"{BASE_URL}/api/cases/{TestAuthAndCase.case_id}",
            headers=headers
        )
        
        assert response.status_code == 200, f"Cleanup failed: {response.text}"
        print(f"SUCCESS: Test case and related data cleaned up")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
