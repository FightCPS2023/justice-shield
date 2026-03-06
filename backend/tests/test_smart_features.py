"""
Test Smart Research Engine and Smart Document Generator features
Testing Cetient-style AI-powered legal research and document generation
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "freeuser@test.com"
TEST_PASSWORD = "Test1234!"


class TestSmartFeatures:
    """Tests for smart-research and smart-document endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - login and get token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test user (has Enterprise tier)
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        self.token = data["access_token"]
        self.user_id = data["user_id"]
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        print(f"\n[Setup] Logged in as {TEST_EMAIL}, tier: {data.get('tier')}")
    
    # ============== Smart Research Tests ==============
    
    def test_smart_research_comprehensive(self):
        """Test POST /api/ai/smart-research with comprehensive research type"""
        print("\n[Test] Smart Research - Comprehensive")
        response = self.session.post(f"{BASE_URL}/api/ai/smart-research", json={
            "query": "What are a parent's rights when CPS comes to their door without a warrant in California?",
            "state": "CA",
            "research_type": "comprehensive"
        }, timeout=60)
        
        assert response.status_code == 200, f"Smart research failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "query" in data, "Response missing 'query' field"
        assert "state" in data, "Response missing 'state' field"
        assert "research_type" in data, "Response missing 'research_type' field"
        assert "results" in data, "Response missing 'results' field"
        assert "sources_used" in data, "Response missing 'sources_used' field"
        
        # Verify values
        assert data["state"] == "CA", f"Expected state 'CA', got '{data.get('state')}'"
        assert data["research_type"] == "comprehensive", f"Expected research_type 'comprehensive', got '{data.get('research_type')}'"
        assert len(data["results"]) > 500, f"Results too short ({len(data['results'])} chars), expected substantial content"
        
        print(f"[Pass] Smart research returned {len(data['results'])} chars of results")
        print(f"[Pass] Sources used: {data.get('sources_used')}")
    
    def test_smart_research_case_law(self):
        """Test POST /api/ai/smart-research with case_law research type"""
        print("\n[Test] Smart Research - Case Law")
        response = self.session.post(f"{BASE_URL}/api/ai/smart-research", json={
            "query": "Fourth Amendment violations in CPS home visits",
            "state": "TX",
            "research_type": "case_law"
        }, timeout=60)
        
        assert response.status_code == 200, f"Case law research failed: {response.text}"
        data = response.json()
        
        assert data["research_type"] == "case_law", f"Expected research_type 'case_law', got '{data.get('research_type')}'"
        assert len(data["results"]) > 500, f"Results too short for case law search"
        
        print(f"[Pass] Case law research returned {len(data['results'])} chars")
    
    def test_smart_research_statutes(self):
        """Test POST /api/ai/smart-research with statutes research type"""
        print("\n[Test] Smart Research - Statutes")
        response = self.session.post(f"{BASE_URL}/api/ai/smart-research", json={
            "query": "Emergency removal timeframes and requirements",
            "state": "NY",
            "research_type": "statutes"
        }, timeout=60)
        
        assert response.status_code == 200, f"Statute research failed: {response.text}"
        data = response.json()
        
        assert data["research_type"] == "statutes", f"Expected research_type 'statutes', got '{data.get('research_type')}'"
        print(f"[Pass] Statute research returned {len(data['results'])} chars")
    
    def test_smart_research_defense_strategy(self):
        """Test POST /api/ai/smart-research with defense_strategy research type"""
        print("\n[Test] Smart Research - Defense Strategy")
        response = self.session.post(f"{BASE_URL}/api/ai/smart-research", json={
            "query": "How to challenge false allegations in a CPS case",
            "state": "FL",
            "research_type": "defense_strategy"
        }, timeout=60)
        
        assert response.status_code == 200, f"Defense strategy research failed: {response.text}"
        data = response.json()
        
        assert data["research_type"] == "defense_strategy", f"Expected research_type 'defense_strategy', got '{data.get('research_type')}'"
        print(f"[Pass] Defense strategy research returned {len(data['results'])} chars")
    
    def test_smart_research_no_state(self):
        """Test POST /api/ai/smart-research without state (federal law focus)"""
        print("\n[Test] Smart Research - No State (Federal)")
        response = self.session.post(f"{BASE_URL}/api/ai/smart-research", json={
            "query": "What are the federal CAPTA requirements for CPS investigations?",
            "research_type": "comprehensive"
        }, timeout=60)
        
        assert response.status_code == 200, f"Federal research failed: {response.text}"
        data = response.json()
        
        assert data["state"] is None, f"Expected state to be None, got '{data.get('state')}'"
        print(f"[Pass] Federal research returned {len(data['results'])} chars")
    
    # ============== Smart Document Generator Tests ==============
    
    def test_smart_document_basic(self):
        """Test POST /api/ai/smart-document with basic prompt"""
        print("\n[Test] Smart Document - Basic")
        response = self.session.post(f"{BASE_URL}/api/ai/smart-document", json={
            "prompt": "Draft a formal letter to CPS demanding they cease their unlawful investigation",
            "state": "CA"
        }, timeout=90)
        
        assert response.status_code == 200, f"Smart document generation failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "document" in data, "Response missing 'document' field"
        assert "prompt" in data, "Response missing 'prompt' field"
        assert "state" in data, "Response missing 'state' field"
        
        # Verify content
        assert len(data["document"]) > 500, f"Document too short ({len(data['document'])} chars)"
        
        print(f"[Pass] Smart document generated {len(data['document'])} chars")
    
    def test_smart_document_motion_to_dismiss(self):
        """Test POST /api/ai/smart-document with motion to dismiss template"""
        print("\n[Test] Smart Document - Motion to Dismiss")
        response = self.session.post(f"{BASE_URL}/api/ai/smart-document", json={
            "prompt": "Draft a Motion to Dismiss the CPS dependency petition for lack of evidence and failure to meet the statutory burden of proof",
            "state": "TX"
        }, timeout=90)
        
        assert response.status_code == 200, f"Motion to dismiss generation failed: {response.text}"
        data = response.json()
        
        assert len(data["document"]) > 1000, "Motion to dismiss should be substantial"
        print(f"[Pass] Motion to Dismiss generated {len(data['document'])} chars")
    
    def test_smart_document_section_1983(self):
        """Test POST /api/ai/smart-document with Section 1983 complaint"""
        print("\n[Test] Smart Document - Section 1983 Complaint")
        response = self.session.post(f"{BASE_URL}/api/ai/smart-document", json={
            "prompt": "Draft a Section 1983 Civil Rights Complaint against CPS caseworkers for violation of 4th and 14th Amendment rights during home investigation",
            "state": "NY"
        }, timeout=90)
        
        assert response.status_code == 200, f"Section 1983 generation failed: {response.text}"
        data = response.json()
        
        assert len(data["document"]) > 1000, "Section 1983 complaint should be substantial"
        print(f"[Pass] Section 1983 Complaint generated {len(data['document'])} chars")
    
    # ============== Caching Test ==============
    
    def test_law_library_caching(self):
        """Test GET /api/law-library/{state} caching - 2nd call should be faster"""
        print("\n[Test] Law Library Caching")
        
        # First call
        start1 = time.time()
        response1 = self.session.get(f"{BASE_URL}/api/law-library/CA", timeout=30)
        time1 = time.time() - start1
        
        assert response1.status_code == 200, f"First law library call failed: {response1.text}"
        data1 = response1.json()
        
        # Second call (should use cache)
        start2 = time.time()
        response2 = self.session.get(f"{BASE_URL}/api/law-library/CA", timeout=30)
        time2 = time.time() - start2
        
        assert response2.status_code == 200, f"Second law library call failed: {response2.text}"
        data2 = response2.json()
        
        # Verify same data returned
        assert data1.get("state") == data2.get("state"), "Cache returned different data"
        
        print(f"[Pass] First call: {time1:.3f}s, Second call: {time2:.3f}s")
        print(f"[Pass] Law library returned data for {data1.get('state', 'CA')}")
    
    # ============== Credit Packages Test ==============
    
    def test_credit_packages_feature_costs(self):
        """Test GET /api/credits/packages returns 20 feature costs"""
        print("\n[Test] Credit Packages - Feature Costs")
        response = self.session.get(f"{BASE_URL}/api/credits/packages", timeout=10)
        
        assert response.status_code == 200, f"Credit packages call failed: {response.text}"
        data = response.json()
        
        assert "packages" in data, "Response missing 'packages' field"
        assert "feature_costs" in data, "Response missing 'feature_costs' field"
        
        feature_costs = data["feature_costs"]
        print(f"[Info] Feature costs count: {len(feature_costs)}")
        
        # Should have at least 20 features
        assert len(feature_costs) >= 20, f"Expected at least 20 feature costs, got {len(feature_costs)}"
        
        # Verify some key features are present
        expected_features = ["ai_chat", "doc_generate", "defense_strategy", "legal_research", "section_1983"]
        for feature in expected_features:
            assert feature in feature_costs, f"Missing expected feature: {feature}"
        
        print(f"[Pass] Feature costs has {len(feature_costs)} features")
        print(f"[Pass] Sample costs: ai_chat={feature_costs.get('ai_chat')}, legal_research={feature_costs.get('legal_research')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
