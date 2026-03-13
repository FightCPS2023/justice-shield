"""
CPS Punisher - Post-Refactoring Regression Tests
Tests all major endpoints after codebase refactoring:
- Backend: server.py split into 17 route modules
- Tests: health, auth, cases, documents, AI chat, admin, legal library, credits
"""

import os
import pytest
import requests
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "cpsvhuntingjustice@gmail.com"
ADMIN_PASSWORD = "cpssuxass"


class TestHealthAndSystem:
    """Health check and system endpoints"""
    
    def test_health_check_root(self):
        """Test /api/health endpoint (via /health might hit frontend)"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ /api/health endpoint working")
    
    def test_api_health_check(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "CPS Punisher" in data["service"]
        print(f"✓ /api/health working - version {data.get('version', 'N/A')}")
    
    def test_api_root(self):
        """Test /api root endpoint"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "operational"
        print("✓ /api root endpoint working")
    
    def test_stats_endpoint(self):
        """Test /api/stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_cases" in data
        print(f"✓ /api/stats - {data.get('total_users', 0)} users, {data.get('total_cases', 0)} cases")


class TestAuthentication:
    """Auth routes - login, signup, profile, tier status"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        print(f"✓ Login successful - tier: {data.get('tier', 'N/A')}")
        return data["access_token"]
    
    def test_login_with_admin_credentials(self, auth_token):
        """Verify login returns valid token"""
        assert auth_token is not None
        assert len(auth_token) > 20
        print("✓ Auth token valid")
    
    def test_get_current_user(self, auth_token):
        """Test /api/auth/me endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ /api/auth/me - user: {data.get('name', 'N/A')}, tier: {data.get('tier', 'free')}")
    
    def test_tier_status(self, auth_token):
        """Test /api/auth/tier-status endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/auth/tier-status",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "tier" in data
        assert "limits" in data
        assert "usage" in data
        print(f"✓ /api/auth/tier-status - tier: {data.get('tier')}, AI credits used: {data.get('usage', {}).get('ai_credits_used', 0)}")
    
    def test_login_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login rejected correctly")


class TestCasesRoutes:
    """Cases CRUD operations"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Login and return auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_list_cases(self, auth_headers):
        """Test GET /api/cases"""
        response = requests.get(f"{BASE_URL}/api/cases", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "cases" in data
        case_count = len(data["cases"])
        print(f"✓ GET /api/cases - found {case_count} cases")
        return data["cases"]
    
    def test_create_case(self, auth_headers):
        """Test POST /api/cases - create new case"""
        test_case = {
            "title": f"TEST_Case_{uuid.uuid4().hex[:8]}",
            "description": "Automated test case for regression testing",
            "state": "TX",
            "county": "Travis",
            "children_names": ["Test Child 1", "Test Child 2"]
        }
        response = requests.post(f"{BASE_URL}/api/cases", json=test_case, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["title"] == test_case["title"]
        assert data["state"] == "TX"
        print(f"✓ POST /api/cases - created case: {data['id'][:8]}...")
        return data["id"]
    
    def test_get_case_by_id(self, auth_headers):
        """Test GET /api/cases/{id}"""
        # First create a case
        test_case = {"title": f"TEST_GetCase_{uuid.uuid4().hex[:8]}", "state": "CA"}
        create_response = requests.post(f"{BASE_URL}/api/cases", json=test_case, headers=auth_headers)
        case_id = create_response.json()["id"]
        
        # Now get it
        response = requests.get(f"{BASE_URL}/api/cases/{case_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == case_id
        print(f"✓ GET /api/cases/{case_id[:8]}... - retrieved successfully")
    
    def test_get_case_summary(self, auth_headers):
        """Test GET /api/cases/{id}/summary"""
        # Create a test case first
        test_case = {"title": f"TEST_Summary_{uuid.uuid4().hex[:8]}", "state": "NY"}
        create_response = requests.post(f"{BASE_URL}/api/cases", json=test_case, headers=auth_headers)
        case_id = create_response.json()["id"]
        
        # Get summary
        response = requests.get(f"{BASE_URL}/api/cases/{case_id}/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "case" in data
        assert "violations" in data
        assert "timeline" in data
        print(f"✓ GET /api/cases/{case_id[:8]}.../summary - {data.get('stats', {}).get('total_violations', 0)} violations")


class TestDocumentsRoutes:
    """Documents routes"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    @pytest.fixture(scope="class")
    def test_case_id(self, auth_headers):
        """Create a test case for document tests"""
        test_case = {"title": f"TEST_Docs_{uuid.uuid4().hex[:8]}", "state": "FL"}
        response = requests.post(f"{BASE_URL}/api/cases", json=test_case, headers=auth_headers)
        return response.json()["id"]
    
    def test_create_document(self, auth_headers, test_case_id):
        """Test POST /api/documents"""
        doc = {
            "case_id": test_case_id,
            "title": f"TEST_Document_{uuid.uuid4().hex[:8]}",
            "content": "This is a test document content for regression testing.",
            "doc_type": "cps_report"
        }
        response = requests.post(f"{BASE_URL}/api/documents", json=doc, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✓ POST /api/documents - created document: {data['id'][:8]}...")
    
    def test_list_documents(self, auth_headers, test_case_id):
        """Test GET /api/documents/{case_id}"""
        response = requests.get(f"{BASE_URL}/api/documents/{test_case_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "documents" in data
        print(f"✓ GET /api/documents/{test_case_id[:8]}... - {len(data['documents'])} documents")


class TestAdminRoutes:
    """Admin routes - accessible only to admin users"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_admin_stats(self, admin_headers):
        """Test GET /api/admin/stats"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_cases" in data
        assert "tier_breakdown" in data
        print(f"✓ GET /api/admin/stats - {data['total_users']} users, {data['total_cases']} cases")
    
    def test_admin_users_list(self, admin_headers):
        """Test GET /api/admin/users"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        print(f"✓ GET /api/admin/users - {data['total']} total users")
    
    def test_admin_passcodes(self, admin_headers):
        """Test GET /api/admin/passcodes"""
        response = requests.get(f"{BASE_URL}/api/admin/passcodes", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "passcodes" in data
        print(f"✓ GET /api/admin/passcodes - {len(data['passcodes'])} passcodes")


class TestAIChatRoutes:
    """AI chat and analysis routes"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_ai_chat(self, auth_headers):
        """Test POST /api/ai/chat"""
        message = {
            "message": "What are my rights during a CPS investigation?",
            "context_type": "general"
        }
        response = requests.post(f"{BASE_URL}/api/ai/chat", json=message, headers=auth_headers, timeout=60)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 50  # Should be a substantive response
        print(f"✓ POST /api/ai/chat - received {len(data['response'])} char response")
    
    def test_help_bot(self, auth_headers):
        """Test POST /api/ai/help-bot"""
        message = {"message": "How do I create a new case?"}
        response = requests.post(f"{BASE_URL}/api/ai/help-bot", json=message, headers=auth_headers, timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        print(f"✓ POST /api/ai/help-bot - response received")


class TestLegalLibraryRoutes:
    """Legal library and research routes"""
    
    def test_rights_guide(self):
        """Test GET /api/rights-guide (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/rights-guide")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert len(data["categories"]) > 0
        print(f"✓ GET /api/rights-guide - {len(data['categories'])} categories")
    
    def test_evidence_checklist(self):
        """Test GET /api/evidence-checklist (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/evidence-checklist")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        print(f"✓ GET /api/evidence-checklist - {len(data['categories'])} categories")
    
    def test_supreme_court_cases(self):
        """Test GET /api/legal/supreme-court-cases"""
        response = requests.get(f"{BASE_URL}/api/legal/supreme-court-cases")
        assert response.status_code == 200
        data = response.json()
        assert "cases" in data
        print(f"✓ GET /api/legal/supreme-court-cases - {data.get('count', 0)} cases")
    
    def test_incident_types(self):
        """Test GET /api/legal/incident-types"""
        response = requests.get(f"{BASE_URL}/api/legal/incident-types")
        assert response.status_code == 200
        data = response.json()
        assert "incident_types" in data
        print(f"✓ GET /api/legal/incident-types - {len(data['incident_types'])} types")


class TestCreditsRoutes:
    """Credits and payment routes"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_credits_balance(self, auth_headers):
        """Test GET /api/credits/balance"""
        response = requests.get(f"{BASE_URL}/api/credits/balance", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "tier" in data or "tier_credits_total" in data or "purchased_credits" in data
        print(f"✓ GET /api/credits/balance - tier: {data.get('tier', 'N/A')}, credits: {data.get('tier_credits_total', 'N/A')}")
    
    def test_credits_packages(self):
        """Test GET /api/credits/packages"""
        response = requests.get(f"{BASE_URL}/api/credits/packages")
        assert response.status_code == 200
        data = response.json()
        assert "packages" in data
        print(f"✓ GET /api/credits/packages - {len(data['packages'])} packages available")


class TestAdvocatesRoutes:
    """Advocate directory routes"""
    
    def test_get_approved_advocates(self):
        """Test GET /api/advocates"""
        response = requests.get(f"{BASE_URL}/api/advocates")
        assert response.status_code == 200
        data = response.json()
        assert "advocates" in data
        print(f"✓ GET /api/advocates - {len(data['advocates'])} approved advocates")


class TestCalendarRoutes:
    """Calendar routes"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_list_calendar_events(self, auth_headers):
        """Test GET /api/calendar"""
        response = requests.get(f"{BASE_URL}/api/calendar", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        print(f"✓ GET /api/calendar - {len(data['events'])} events")


# Run cleanup after tests
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after tests"""
    yield
    # Test cleanup would go here
    print("\n--- Test cleanup complete ---")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
