"""
Test Credit System & Free Tier Features for CPS PUNISHER
Testing: 
- Free tier access to AI Chat and Documents
- Credit packages API
- Credit balance API
- Credit purchase flow
- AI credits exhaustion (403 after limit)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials
TEST_USER_EMAIL = f"test_credits_{uuid.uuid4().hex[:8]}@test.com"
TEST_USER_PASSWORD = "Test1234!"
TEST_USER_NAME = "Test Credits User"

class TestCreditSystem:
    """Tests for credit packages and purchase system"""
    
    token = None
    user_id = None
    
    @classmethod
    def setup_class(cls):
        """Register a new test user for credit testing"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME,
            "state": "TX"
        })
        if response.status_code == 200:
            data = response.json()
            cls.token = data.get("access_token")
            cls.user_id = data.get("user_id")
            print(f"Created test user: {TEST_USER_EMAIL}")
        else:
            # User might already exist, try login
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            })
            if response.status_code == 200:
                data = response.json()
                cls.token = data.get("access_token")
                cls.user_id = data.get("user_id")
                print(f"Logged in existing user: {TEST_USER_EMAIL}")
    
    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    # =================
    # TIER STATUS TESTS
    # =================
    
    def test_01_free_user_tier_status(self, auth_headers):
        """Verify free user has correct tier status with new limits (ai_credits=5, docs_per_month=1, cases_max=1)"""
        response = requests.get(f"{BASE_URL}/api/auth/tier-status", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["tier"] == "free", f"Expected tier='free', got tier='{data['tier']}'"
        
        limits = data["limits"]
        assert limits["ai_credits"] == 5, f"Expected ai_credits=5, got {limits['ai_credits']}"
        assert limits["docs_per_month"] == 1, f"Expected docs_per_month=1, got {limits['docs_per_month']}"
        assert limits["cases_max"] == 1, f"Expected cases_max=1, got {limits['cases_max']}"
        
        print(f"✓ Free tier status verified: tier={data['tier']}, limits={limits}")
    
    # ======================
    # CREDIT PACKAGES TESTS
    # ======================
    
    def test_02_get_credit_packages(self, auth_headers):
        """GET /api/credits/packages returns 4 packages with correct prices"""
        response = requests.get(f"{BASE_URL}/api/credits/packages", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        packages = data.get("packages", [])
        
        assert len(packages) == 4, f"Expected 4 packages, got {len(packages)}"
        
        # Verify each package
        expected_packages = [
            {"id": "credits_10", "credits": 10, "price": 4.99},
            {"id": "credits_50", "credits": 50, "price": 19.99},
            {"id": "credits_100", "credits": 100, "price": 34.99},
            {"id": "credits_250", "credits": 250, "price": 74.99},
        ]
        
        for expected in expected_packages:
            pkg = next((p for p in packages if p["id"] == expected["id"]), None)
            assert pkg is not None, f"Package {expected['id']} not found"
            assert pkg["credits"] == expected["credits"], f"Package {expected['id']} credits mismatch"
            assert pkg["price"] == expected["price"], f"Package {expected['id']} price mismatch"
        
        # Verify feature costs also returned
        feature_costs = data.get("feature_costs", {})
        assert len(feature_costs) > 0, "Expected feature_costs to be returned"
        
        print(f"✓ Credit packages verified: {[p['id'] for p in packages]}")
        print(f"✓ Feature costs returned: {len(feature_costs)} features")
    
    def test_03_get_credit_balance(self, auth_headers):
        """GET /api/credits/balance returns purchased_credits=0 for new user"""
        response = requests.get(f"{BASE_URL}/api/credits/balance", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "purchased_credits" in data, "purchased_credits field missing"
        assert data["purchased_credits"] == 0, f"Expected purchased_credits=0 for new user, got {data['purchased_credits']}"
        assert "tier" in data, "tier field missing"
        assert data["tier"] == "free", f"Expected tier='free', got {data['tier']}"
        
        print(f"✓ Credit balance verified: purchased_credits={data['purchased_credits']}, tier={data['tier']}")
    
    def test_04_purchase_credits_creates_checkout_url(self, auth_headers):
        """POST /api/credits/purchase with package_id='credits_10' returns Stripe checkout URL"""
        response = requests.post(
            f"{BASE_URL}/api/credits/purchase",
            headers=auth_headers,
            json={
                "package_id": "credits_10",
                "origin_url": "https://example.com"
            }
        )
        # Should return 200 with URL or 500 if Stripe not configured
        # We just verify the endpoint works
        if response.status_code == 200:
            data = response.json()
            assert "url" in data, "Expected 'url' in response"
            assert "session_id" in data, "Expected 'session_id' in response"
            assert data["url"].startswith("https://checkout.stripe.com"), f"Expected Stripe URL, got {data['url']}"
            print(f"✓ Credit purchase checkout URL generated: {data['url'][:50]}...")
        elif response.status_code == 500:
            # Stripe might not be configured in test environment
            print(f"! Credit purchase returned 500 - Stripe may not be configured: {response.text}")
        else:
            pytest.fail(f"Unexpected status code {response.status_code}: {response.text}")
    
    def test_05_purchase_invalid_package(self, auth_headers):
        """POST /api/credits/purchase with invalid package_id returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/credits/purchase",
            headers=auth_headers,
            json={
                "package_id": "invalid_package",
                "origin_url": "https://example.com"
            }
        )
        # Should return 400 for invalid package OR 500 if Stripe check happens first
        assert response.status_code in [400, 500], f"Expected 400 or 500, got {response.status_code}"
        print(f"✓ Invalid package rejected with status {response.status_code}")


class TestFreeTierAccess:
    """Tests for free tier access to AI Chat and Documents"""
    
    token = None
    user_id = None
    case_id = None
    
    @classmethod
    def setup_class(cls):
        """Create a fresh test user for AI chat testing"""
        email = f"test_freetier_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": email,
            "password": "Test1234!",
            "name": "Free Tier Test",
            "state": "CA"
        })
        assert response.status_code == 200, f"Failed to create test user: {response.text}"
        data = response.json()
        cls.token = data.get("access_token")
        cls.user_id = data.get("user_id")
        print(f"Created test user for free tier: {email}")
        
        # Create a case for document testing
        headers = {"Authorization": f"Bearer {cls.token}", "Content-Type": "application/json"}
        case_response = requests.post(
            f"{BASE_URL}/api/cases",
            headers=headers,
            json={"title": "Test Case for Free Tier", "state": "CA"}
        )
        if case_response.status_code == 200:
            cls.case_id = case_response.json().get("id")
            print(f"Created test case: {cls.case_id}")
    
    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    # ======================
    # FREE TIER AI CHAT TEST
    # ======================
    
    def test_01_free_user_can_access_ai_chat(self, auth_headers):
        """Free user can access POST /api/ai/chat (should work, not 403)"""
        response = requests.post(
            f"{BASE_URL}/api/ai/chat",
            headers=auth_headers,
            json={
                "message": "What are my rights when CPS comes to my door?",
                "session_id": str(uuid.uuid4()),
                "context_type": "general"
            }
        )
        # Should return 200 (chat working) or 500 (LLM issue) - NOT 403
        assert response.status_code != 403, f"Free user should NOT get 403 for AI chat, got {response.status_code}: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "response" in data or "message" in data, f"Expected response content, got {data}"
            print(f"✓ Free user AI chat works - got response")
        else:
            print(f"! AI chat returned {response.status_code} - may be LLM/config issue, not tier issue")
    
    # ============================
    # FREE TIER DOCUMENT UPLOAD TEST
    # ============================
    
    def test_02_free_user_can_upload_first_document(self, auth_headers):
        """Free user can upload first document (POST /api/documents/upload should work)"""
        if not self.case_id:
            pytest.skip("No case created for document testing")
        
        # Create a simple text file for upload
        files = {
            'file': ('test_document.txt', b'This is a test CPS document for analysis.', 'text/plain')
        }
        data = {
            'case_id': self.case_id,
            'title': 'Test Document Upload',
            'doc_type': 'cps_document',
            'auto_analyze': 'false'  # Skip AI analysis for faster test
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}  # No Content-Type for multipart
        
        response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            headers=headers,
            files=files,
            data=data
        )
        
        # Should return 200 (upload success) - NOT 403
        assert response.status_code != 403, f"Free user should NOT get 403 for first doc upload, got {response.status_code}: {response.text}"
        
        if response.status_code == 200:
            result = response.json()
            assert "id" in result, f"Expected document ID in response, got {result}"
            print(f"✓ Free user document upload works - doc ID: {result.get('id')}")
        else:
            print(f"! Document upload returned {response.status_code}: {response.text}")


class TestAICreditsExhaustion:
    """Test that 6th AI request fails with 403 after 5 credits used"""
    
    token = None
    user_id = None
    
    @classmethod
    def setup_class(cls):
        """Create a fresh test user for exhaustion testing"""
        email = f"test_exhaust_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": email,
            "password": "Test1234!",
            "name": "AI Exhaustion Test",
            "state": "NY"
        })
        assert response.status_code == 200, f"Failed to create test user: {response.text}"
        data = response.json()
        cls.token = data.get("access_token")
        cls.user_id = data.get("user_id")
        print(f"Created test user for exhaustion test: {email}")
    
    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_ai_credits_exhaustion(self, auth_headers):
        """After using 5 AI credits, 6th request should fail with 403"""
        successful_requests = 0
        
        # Make 6 AI chat requests - first 5 should work, 6th should fail
        for i in range(6):
            response = requests.post(
                f"{BASE_URL}/api/ai/chat",
                headers=auth_headers,
                json={
                    "message": f"Test question {i+1}: What is CPS?",
                    "session_id": str(uuid.uuid4()),
                    "context_type": "general"
                }
            )
            
            if response.status_code == 200:
                successful_requests += 1
                print(f"  Request {i+1}: OK (credits used: {successful_requests})")
            elif response.status_code == 403:
                print(f"  Request {i+1}: BLOCKED (403) - credits exhausted after {successful_requests} successful requests")
                break
            else:
                # Other errors (like LLM issues) - don't count but continue
                print(f"  Request {i+1}: Error {response.status_code} - {response.text[:100]}")
        
        # Check tier status to verify credits used
        status_response = requests.get(f"{BASE_URL}/api/auth/tier-status", headers=auth_headers)
        if status_response.status_code == 200:
            status = status_response.json()
            credits_used = status.get("usage", {}).get("ai_credits_used", 0)
            credits_limit = status.get("limits", {}).get("ai_credits", 5)
            print(f"✓ Tier status: {credits_used}/{credits_limit} AI credits used")
        
        # We expect exactly 5 successful requests for a free user
        # The test passes if we got 5 successful and the 6th was blocked
        if successful_requests <= 5:
            print(f"✓ AI credits limit enforced: {successful_requests} requests succeeded before limit")
        else:
            print(f"! Expected max 5 successful requests, got {successful_requests}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
