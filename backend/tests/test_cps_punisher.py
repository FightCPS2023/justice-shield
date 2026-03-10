"""
CPS Punisher Backend API Tests
Tests core CRUD operations, authentication, and AI features
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://legal-defender-8.preview.emergentagent.com')

# Test user credentials
TEST_EMAIL = f"test_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "Test123!"
TEST_NAME = "Test User"

# Shared state for tests
test_state = {
    "token": None,
    "user_id": None,
    "case_id": None,
    "violation_id": None,
    "timeline_event_id": None,
    "document_id": None,
    "calendar_event_id": None
}


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test backend health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "CPS Punisher" in data.get("service", "")
        print(f"✓ Health check passed: {data['service']}")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_signup_new_user(self):
        """Test user registration"""
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "name": TEST_NAME
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "access_token" in data
        assert data["email"] == TEST_EMAIL
        assert data["name"] == TEST_NAME
        assert data["tier"] == "free"
        
        # Store token for subsequent tests
        test_state["token"] = data["access_token"]
        test_state["user_id"] = data["user_id"]
        
        print(f"✓ Signup successful: {TEST_EMAIL}")
    
    def test_signup_duplicate_email(self):
        """Test duplicate email registration fails"""
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "name": "Duplicate User"
            }
        )
        assert response.status_code == 400
        print("✓ Duplicate email correctly rejected")
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response
        assert "access_token" in data
        assert data["email"] == TEST_EMAIL
        
        test_state["token"] = data["access_token"]
        print(f"✓ Login successful")
    
    def test_login_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": "WrongPassword123"
            }
        )
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_get_current_user(self):
        """Test authenticated user profile retrieval"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL
        assert data["name"] == TEST_NAME
        print("✓ User profile retrieved successfully")


class TestCaseCRUD:
    """Case management CRUD tests"""
    
    def test_create_case(self):
        """Test case creation"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        case_data = {
            "title": "TEST_Smith Family CPS Case",
            "description": "Test case for automated testing",
            "state": "TX",
            "county": "Travis",
            "case_number": "CPS-2025-12345",
            "children_names": ["Child One", "Child Two"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cases",
            headers=headers,
            json=case_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response data
        assert data["title"] == case_data["title"]
        assert data["state"] == "TX"
        assert data["county"] == "Travis"
        assert "id" in data
        
        test_state["case_id"] = data["id"]
        print(f"✓ Case created: {data['id']}")
    
    def test_get_case_list(self):
        """Test case listing"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        response = requests.get(f"{BASE_URL}/api/cases", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "cases" in data
        assert len(data["cases"]) >= 1
        
        # Verify our created case is in the list
        case_ids = [c["id"] for c in data["cases"]]
        assert test_state["case_id"] in case_ids
        print(f"✓ Found {len(data['cases'])} cases")
    
    def test_get_specific_case(self):
        """Test single case retrieval with ownership verification"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        response = requests.get(
            f"{BASE_URL}/api/cases/{test_state['case_id']}",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == test_state["case_id"]
        assert data["state"] == "TX"
        assert "violation_count" in data
        print(f"✓ Case retrieved: {data['title']}")
    
    def test_update_case(self):
        """Test case update"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        update_data = {
            "status": "closed",
            "caseworker_name": "Jane Doe"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/cases/{test_state['case_id']}",
            headers=headers,
            json=update_data
        )
        
        assert response.status_code == 200
        
        # Verify update was persisted
        response = requests.get(
            f"{BASE_URL}/api/cases/{test_state['case_id']}",
            headers=headers
        )
        data = response.json()
        assert data["status"] == "closed"
        assert data["caseworker_name"] == "Jane Doe"
        print("✓ Case updated successfully")


class TestViolations:
    """Violation tracking tests"""
    
    def test_create_violation(self):
        """Test violation creation"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        violation_data = {
            "case_id": test_state["case_id"],
            "violation_type": "fourth_amendment",
            "description": "Warrantless entry into home without consent or exigent circumstances",
            "severity": "high",
            "date": "2025-01-15",
            "statute_reference": "Fourth Amendment, U.S. Constitution"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/violations",
            headers=headers,
            json=violation_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["violation_type"] == "fourth_amendment"
        assert data["severity"] == "high"
        assert "id" in data
        
        test_state["violation_id"] = data["id"]
        print(f"✓ Violation created: {data['id']}")
    
    def test_list_violations(self):
        """Test violation listing"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        response = requests.get(
            f"{BASE_URL}/api/violations/{test_state['case_id']}",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "violations" in data
        assert len(data["violations"]) >= 1
        
        # Verify our created violation
        violation_ids = [v["id"] for v in data["violations"]]
        assert test_state["violation_id"] in violation_ids
        print(f"✓ Found {len(data['violations'])} violations")
    
    def test_get_violation_types(self):
        """Test violation types reference data"""
        response = requests.get(f"{BASE_URL}/api/violations/types")
        
        assert response.status_code == 200
        data = response.json()
        assert "violation_types" in data
        assert "fourth_amendment" in data["violation_types"]
        print(f"✓ Got {len(data['violation_types'])} violation types")


class TestTimeline:
    """Timeline event tests"""
    
    def test_create_timeline_event(self):
        """Test timeline event creation"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        event_data = {
            "case_id": test_state["case_id"],
            "title": "Initial CPS Contact",
            "description": "First contact with CPS caseworker at residence",
            "date": "2025-01-10",
            "event_type": "contact",
            "importance": "high"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/timeline",
            headers=headers,
            json=event_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["title"] == "Initial CPS Contact"
        assert data["event_type"] == "contact"
        assert "id" in data
        
        test_state["timeline_event_id"] = data["id"]
        print(f"✓ Timeline event created: {data['id']}")
    
    def test_list_timeline_events(self):
        """Test timeline listing (sorted by date)"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        response = requests.get(
            f"{BASE_URL}/api/timeline/{test_state['case_id']}",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        assert len(data["events"]) >= 1
        print(f"✓ Found {len(data['events'])} timeline events")


class TestDocuments:
    """Document management tests"""
    
    def test_create_document(self):
        """Test document creation"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        doc_data = {
            "case_id": test_state["case_id"],
            "title": "TEST_Initial Safety Plan",
            "content": "Test document content for safety plan",
            "doc_type": "safety_plan",
            "date": "2025-01-12"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/documents",
            headers=headers,
            json=doc_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["title"] == "TEST_Initial Safety Plan"
        assert data["doc_type"] == "safety_plan"
        assert "id" in data
        
        test_state["document_id"] = data["id"]
        print(f"✓ Document created: {data['id']}")
    
    def test_list_documents(self):
        """Test document listing for case"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        response = requests.get(
            f"{BASE_URL}/api/documents/{test_state['case_id']}",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "documents" in data
        assert len(data["documents"]) >= 1
        print(f"✓ Found {len(data['documents'])} documents")


class TestCalendar:
    """Calendar event tests"""
    
    def test_create_calendar_event(self):
        """Test calendar event creation"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        event_data = {
            "title": "TEST_Court Hearing",
            "description": "Preliminary hearing for CPS case",
            "event_date": "2025-02-15",
            "event_time": "09:00",
            "event_type": "court_hearing",
            "case_id": test_state["case_id"],
            "reminder_days": 3
        }
        
        response = requests.post(
            f"{BASE_URL}/api/calendar",
            headers=headers,
            json=event_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["title"] == "TEST_Court Hearing"
        assert data["event_type"] == "court_hearing"
        assert "id" in data
        
        test_state["calendar_event_id"] = data["id"]
        print(f"✓ Calendar event created: {data['id']}")
    
    def test_list_calendar_events(self):
        """Test calendar event listing"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        response = requests.get(f"{BASE_URL}/api/calendar", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        print(f"✓ Found {len(data['events'])} calendar events")


class TestLawLibrary:
    """Law library tests"""
    
    def test_get_all_states(self):
        """Test states list endpoint"""
        response = requests.get(f"{BASE_URL}/api/law-library/states")
        
        assert response.status_code == 200
        data = response.json()
        assert "states" in data
        assert len(data["states"]) == 50
        
        # Verify state structure
        state = data["states"][0]
        assert "code" in state
        assert "name" in state
        print(f"✓ Retrieved {len(data['states'])} states")


class TestAIChat:
    """AI Chat endpoint tests (note: AI responses may take 20-30s)"""
    
    def test_ai_chat_simple_question(self):
        """Test AI chat with simple question"""
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        chat_data = {
            "message": "What are my basic constitutional rights in a CPS case?",
            "context_type": "general"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/chat",
            headers=headers,
            json=chat_data,
            timeout=60  # AI may take time
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "response" in data
        assert "session_id" in data
        assert len(data["response"]) > 50  # Verify meaningful response
        
        print(f"✓ AI Chat response received ({len(data['response'])} chars)")


class TestCleanup:
    """Cleanup test data"""
    
    def test_delete_calendar_event(self):
        """Delete test calendar event"""
        if not test_state["calendar_event_id"]:
            pytest.skip("No calendar event to delete")
        
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        response = requests.delete(
            f"{BASE_URL}/api/calendar/{test_state['calendar_event_id']}",
            headers=headers
        )
        
        assert response.status_code == 200
        print("✓ Calendar event deleted")
    
    def test_delete_document(self):
        """Delete test document"""
        if not test_state["document_id"]:
            pytest.skip("No document to delete")
        
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        response = requests.delete(
            f"{BASE_URL}/api/documents/{test_state['document_id']}",
            headers=headers
        )
        
        assert response.status_code == 200
        print("✓ Document deleted")
    
    def test_delete_violation(self):
        """Delete test violation"""
        if not test_state["violation_id"]:
            pytest.skip("No violation to delete")
        
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        response = requests.delete(
            f"{BASE_URL}/api/violations/{test_state['violation_id']}",
            headers=headers
        )
        
        assert response.status_code == 200
        print("✓ Violation deleted")
    
    def test_delete_case(self):
        """Delete test case and verify removal"""
        if not test_state["case_id"]:
            pytest.skip("No case to delete")
        
        headers = {"Authorization": f"Bearer {test_state['token']}"}
        response = requests.delete(
            f"{BASE_URL}/api/cases/{test_state['case_id']}",
            headers=headers
        )
        
        assert response.status_code == 200
        
        # Verify case is deleted
        response = requests.get(
            f"{BASE_URL}/api/cases/{test_state['case_id']}",
            headers=headers
        )
        assert response.status_code == 404
        print("✓ Case deleted and verified removed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
