"""
Test Advanced Legal Strategy Components API Endpoints
Tests: Strategy Builder, Argument Generator, Evidence Mapper, Precedent Finder
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://legal-defender-8.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "strategytester@test.com"
TEST_PASSWORD = "Test123!"
TEST_CASE_ID = "c003e28f-3b38-4686-9c71-0465b716bbe3"


@pytest.fixture(scope="module")
def auth_token():
    """Get auth token for tests"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    assert response.status_code == 200, f"Auth failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for API calls"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


class TestAuthAndCases:
    """Verify auth and existing cases still work"""
    
    def test_login_works(self):
        """Test login endpoint still works"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["email"] == TEST_EMAIL
        print(f"✓ Login successful for {TEST_EMAIL}")
    
    def test_signup_returns_400_for_existing_email(self, auth_headers):
        """Test signup returns 400 for existing user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json={
                "email": TEST_EMAIL,
                "password": "Test123!",
                "name": "Test User"
            }
        )
        assert response.status_code == 400
        print("✓ Signup returns 400 for existing email")
    
    def test_get_cases(self, auth_headers):
        """Test case listing still works"""
        response = requests.get(f"{BASE_URL}/api/cases", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "cases" in data
        print(f"✓ Got {len(data['cases'])} cases")


class TestPrecedentFinder:
    """Test Precedent Finder endpoint - returns quickly, good for initial tests"""
    
    def test_precedent_finder_search_basic(self, auth_headers):
        """Test POST /api/precedent-finder/search with default options"""
        response = requests.post(
            f"{BASE_URL}/api/precedent-finder/search",
            headers=auth_headers,
            json={
                "violation_type": "warrantless_entry",
                "include_federal": True,
                "include_state": True
            },
            timeout=90
        )
        assert response.status_code == 200, f"Precedent search failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "violation_type" in data
        assert data["violation_type"] == "warrantless_entry"
        assert "precedent_analysis" in data
        assert len(data["precedent_analysis"]) > 100  # Should be substantial AI response
        
        print(f"✓ Precedent search returned {len(data['precedent_analysis'])} chars of analysis")
    
    def test_precedent_finder_with_state(self, auth_headers):
        """Test precedent finder with state filter"""
        response = requests.post(
            f"{BASE_URL}/api/precedent-finder/search",
            headers=auth_headers,
            json={
                "violation_type": "due_process",
                "state": "TX",
                "include_federal": True,
                "include_state": True
            },
            timeout=90
        )
        assert response.status_code == 200
        data = response.json()
        assert "precedent_analysis" in data
        print("✓ Precedent search with state filter works")
    
    def test_precedent_finder_returns_case_law_data(self, auth_headers):
        """Test precedent finder returns internal case law data"""
        response = requests.post(
            f"{BASE_URL}/api/precedent-finder/search",
            headers=auth_headers,
            json={
                "violation_type": "strip_search",
                "include_federal": True,
                "include_state": False
            },
            timeout=90
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should return internal case law data
        assert "internal_case_law" in data or "supreme_court_cases" in data or "circuit_court_cases" in data
        print("✓ Precedent finder returns case law data structures")
    
    def test_precedent_finder_unauthorized(self):
        """Test precedent finder requires auth"""
        response = requests.post(
            f"{BASE_URL}/api/precedent-finder/search",
            json={"violation_type": "warrantless_entry"}
        )
        assert response.status_code == 401
        print("✓ Precedent finder correctly requires auth")


class TestStrategyBuilder:
    """Test Strategy Builder endpoint"""
    
    def test_strategy_builder_requires_auth(self):
        """Test strategy builder requires auth"""
        response = requests.post(
            f"{BASE_URL}/api/strategy-builder/build",
            json={
                "case_id": TEST_CASE_ID,
                "goal": "reunification",
                "aggressive_level": "medium"
            }
        )
        assert response.status_code == 401
        print("✓ Strategy builder requires auth")
    
    def test_strategy_builder_requires_case_id(self, auth_headers):
        """Test strategy builder requires valid case_id"""
        response = requests.post(
            f"{BASE_URL}/api/strategy-builder/build",
            headers=auth_headers,
            json={
                "goal": "reunification",
                "aggressive_level": "medium"
            }
        )
        # Should return 422 for missing required field
        assert response.status_code == 422
        print("✓ Strategy builder requires case_id")
    
    def test_strategy_builder_build(self, auth_headers):
        """Test POST /api/strategy-builder/build - builds comprehensive strategy"""
        response = requests.post(
            f"{BASE_URL}/api/strategy-builder/build",
            headers=auth_headers,
            json={
                "case_id": TEST_CASE_ID,
                "goal": "dismissal",
                "aggressive_level": "aggressive"
            },
            timeout=120  # AI may take 30-60 seconds
        )
        assert response.status_code == 200, f"Strategy build failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "strategy" in data
        assert "goal" in data
        assert data["goal"] == "dismissal"
        assert "case_context" in data
        assert "id" in data  # Should save and return ID
        
        # Strategy should be substantial
        assert len(data["strategy"]) > 500
        
        print(f"✓ Strategy built with {len(data['strategy'])} chars")
        return data["id"]
    
    def test_strategy_builder_saved_endpoint(self, auth_headers):
        """Test GET /api/strategy-builder/saved/{case_id}"""
        response = requests.get(
            f"{BASE_URL}/api/strategy-builder/saved/{TEST_CASE_ID}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "strategies" in data
        print(f"✓ Got {len(data['strategies'])} saved strategies")


class TestArgumentGenerator:
    """Test Argument Generator endpoint"""
    
    def test_argument_generator_requires_auth(self):
        """Test argument generator requires auth"""
        response = requests.post(
            f"{BASE_URL}/api/argument-generator/generate",
            json={
                "case_id": TEST_CASE_ID,
                "argument_type": "general"
            }
        )
        assert response.status_code == 401
        print("✓ Argument generator requires auth")
    
    def test_argument_generator_generate(self, auth_headers):
        """Test POST /api/argument-generator/generate"""
        response = requests.post(
            f"{BASE_URL}/api/argument-generator/generate",
            headers=auth_headers,
            json={
                "case_id": TEST_CASE_ID,
                "argument_type": "constitutional"
            },
            timeout=120
        )
        assert response.status_code == 200, f"Argument generation failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "arguments" in data
        assert "argument_type" in data
        assert data["argument_type"] == "constitutional"
        assert "violations_analyzed" in data
        assert "evidence_analyzed" in data
        assert "id" in data
        
        print(f"✓ Arguments generated: {len(data['arguments'])} chars")
    
    def test_argument_generator_saved_endpoint(self, auth_headers):
        """Test GET /api/argument-generator/saved/{case_id}"""
        response = requests.get(
            f"{BASE_URL}/api/argument-generator/saved/{TEST_CASE_ID}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "arguments" in data
        print(f"✓ Got {len(data['arguments'])} saved arguments")
    
    def test_argument_generator_different_types(self, auth_headers):
        """Test argument generator with different argument types"""
        for arg_type in ["general", "procedural", "section_1983"]:
            response = requests.post(
                f"{BASE_URL}/api/argument-generator/generate",
                headers=auth_headers,
                json={
                    "case_id": TEST_CASE_ID,
                    "argument_type": arg_type
                },
                timeout=120
            )
            assert response.status_code == 200, f"Failed for {arg_type}: {response.text}"
            assert response.json()["argument_type"] == arg_type
            print(f"✓ Argument type '{arg_type}' works")


class TestEvidenceMapper:
    """Test Evidence Mapper endpoint"""
    
    def test_evidence_mapper_requires_auth(self):
        """Test evidence mapper requires auth"""
        response = requests.post(
            f"{BASE_URL}/api/evidence-mapper/map",
            json={
                "case_id": TEST_CASE_ID,
                "evidence_description": "Test evidence"
            }
        )
        assert response.status_code == 401
        print("✓ Evidence mapper requires auth")
    
    def test_evidence_mapper_map(self, auth_headers):
        """Test POST /api/evidence-mapper/map"""
        response = requests.post(
            f"{BASE_URL}/api/evidence-mapper/map",
            headers=auth_headers,
            json={
                "case_id": TEST_CASE_ID,
                "evidence_description": "CPS caseworker entered home without consent or warrant on 01/15/2025",
                "violation_type": "warrantless_entry",
                "facts": "Homeowner explicitly told caseworker not to enter, but they pushed past anyway"
            },
            timeout=120
        )
        assert response.status_code == 200, f"Evidence mapping failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "mapping" in data
        assert "id" in data
        assert "relevant_case_law" in data
        
        print(f"✓ Evidence mapping returned {len(data['mapping'])} chars")
    
    def test_evidence_mapper_without_violation_type(self, auth_headers):
        """Test evidence mapper works without violation_type"""
        response = requests.post(
            f"{BASE_URL}/api/evidence-mapper/map",
            headers=auth_headers,
            json={
                "case_id": TEST_CASE_ID,
                "evidence_description": "Child was strip-searched at school without parental consent"
            },
            timeout=120
        )
        assert response.status_code == 200
        data = response.json()
        assert "mapping" in data
        print("✓ Evidence mapper works without violation_type")


class TestExistingFeatures:
    """Verify existing features still work after new additions"""
    
    def test_case_crud(self, auth_headers):
        """Test case create, read, delete still works"""
        # Create
        create_response = requests.post(
            f"{BASE_URL}/api/cases",
            headers=auth_headers,
            json={
                "title": "TEST_Regression Test Case",
                "description": "Testing existing features",
                "state": "TX"
            }
        )
        assert create_response.status_code == 200
        case_id = create_response.json()["id"]
        print(f"✓ Case created: {case_id}")
        
        # Read
        get_response = requests.get(
            f"{BASE_URL}/api/cases/{case_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 200
        assert get_response.json()["title"] == "TEST_Regression Test Case"
        print("✓ Case read works")
        
        # Delete
        delete_response = requests.delete(
            f"{BASE_URL}/api/cases/{case_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        print("✓ Case delete works")
    
    def test_ai_chat(self, auth_headers):
        """Test AI chat still works"""
        response = requests.post(
            f"{BASE_URL}/api/ai/chat",
            headers=auth_headers,
            json={
                "message": "What is the 4th Amendment?",
                "context_type": "general"
            },
            timeout=90
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "session_id" in data
        print("✓ AI chat works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
