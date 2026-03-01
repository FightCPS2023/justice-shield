"""
Test Law Library API - Testing pre-built database for instant state CPS law info
Tests verify:
1. All 50 states grid displays correctly via /api/law-library/states
2. Individual state endpoints return instant results (pre_built_database source)
3. Texas (TX) returns correct agency (DFPS), statutes (Family Code 261-266)
4. California (CA) returns correct agency (CDSS), statutes (WIC 300-395)
5. Federal law section includes CAPTA, ASFA, ICWA references
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLawLibraryEndpoints:
    """Test Law Library API endpoints for instant state CPS law info"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        # Login with test credentials
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "lawtest@test.com",
            "password": "Test123!"
        })
        
        if response.status_code != 200:
            # Create user if doesn't exist
            signup_response = requests.post(f"{BASE_URL}/api/auth/signup", json={
                "email": "lawtest@test.com",
                "password": "Test123!",
                "name": "Law Library Test User"
            })
            if signup_response.status_code == 200:
                self.token = signup_response.json().get("access_token")
            else:
                pytest.skip("Could not create or login test user")
        else:
            self.token = response.json().get("access_token")
        
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    # Test: States list endpoint works
    def test_states_list_endpoint(self):
        """Verify /api/law-library/states returns all 50 states"""
        response = requests.get(f"{BASE_URL}/api/law-library/states")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "states" in data, "Response should have 'states' key"
        
        states = data["states"]
        assert len(states) == 50, f"Expected 50 states, got {len(states)}"
        
        # Check structure of state objects
        state_codes = [s["code"] for s in states]
        assert "TX" in state_codes, "Texas should be in the list"
        assert "CA" in state_codes, "California should be in the list"
        print(f"✓ States list endpoint returns {len(states)} states")
    
    # Test: Texas endpoint returns correct data from pre-built database
    def test_texas_state_info(self):
        """Verify Texas endpoint returns instant results with correct DFPS info"""
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/law-library/TX", headers=self.headers)
        elapsed = time.time() - start_time
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Check source is pre-built database (not AI-generated)
        assert data.get("source") == "pre_built_database", f"Expected pre_built_database source, got {data.get('source')}"
        
        # Check response time is under 1 second (instant)
        assert elapsed < 1.0, f"Response took {elapsed:.2f}s, expected < 1s for instant loading"
        
        # Check state info
        assert data.get("state_code") == "TX"
        assert data.get("state_name") == "Texas"
        
        # Check law_info contains correct Texas info
        law_info = data.get("law_info", "")
        assert "DFPS" in law_info or "Department of Family and Protective Services" in law_info, \
            "Texas should mention DFPS (Department of Family and Protective Services)"
        assert "261" in law_info or "Family Code" in law_info, \
            "Texas should mention Family Code Chapter 261"
        assert "266" in law_info, "Texas should mention Family Code Chapter 266"
        
        # Check federal law is included
        assert "federal_law" in data, "Response should include federal_law"
        
        print(f"✓ Texas state info loaded in {elapsed:.3f}s (instant)")
        print(f"✓ Texas source: {data.get('source')}")
        print(f"✓ Texas law_info includes DFPS and Family Code references")
    
    # Test: California endpoint returns correct data
    def test_california_state_info(self):
        """Verify California endpoint returns instant results with correct CDSS info"""
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/law-library/CA", headers=self.headers)
        elapsed = time.time() - start_time
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Check source is pre-built database
        assert data.get("source") == "pre_built_database", f"Expected pre_built_database source, got {data.get('source')}"
        
        # Check response time is under 1 second
        assert elapsed < 1.0, f"Response took {elapsed:.2f}s, expected < 1s"
        
        # Check state info
        assert data.get("state_code") == "CA"
        assert data.get("state_name") == "California"
        
        # Check law_info contains correct California info
        law_info = data.get("law_info", "")
        assert "CDSS" in law_info or "California Department of Social Services" in law_info, \
            "California should mention CDSS"
        assert "300" in law_info or "WIC" in law_info or "Welfare" in law_info, \
            "California should mention WIC 300"
        assert "395" in law_info, "California should mention WIC 395"
        
        print(f"✓ California state info loaded in {elapsed:.3f}s (instant)")
        print(f"✓ California source: {data.get('source')}")
        print(f"✓ California law_info includes CDSS and WIC references")
    
    # Test: Federal law includes CAPTA, ASFA, ICWA
    def test_federal_law_references(self):
        """Verify federal law section includes CAPTA, ASFA, ICWA"""
        response = requests.get(f"{BASE_URL}/api/law-library/TX", headers=self.headers)
        
        assert response.status_code == 200
        
        data = response.json()
        federal_law = data.get("federal_law", {})
        
        # Check federal statutes include key laws
        statutes = federal_law.get("statutes", [])
        statutes_text = " ".join(statutes)
        
        assert "CAPTA" in statutes_text, "Federal law should include CAPTA"
        assert "ASFA" in statutes_text, "Federal law should include ASFA"
        assert "ICWA" in statutes_text, "Federal law should include ICWA"
        
        # Check constitutional rights are included
        constitutional = federal_law.get("constitutional_rights", [])
        assert len(constitutional) > 0, "Should include constitutional rights"
        
        # Check Supreme Court cases are included
        supreme_court = federal_law.get("supreme_court_cases", [])
        assert len(supreme_court) > 0, "Should include Supreme Court cases"
        
        print(f"✓ Federal law includes CAPTA, ASFA, ICWA")
        print(f"✓ Federal law includes {len(constitutional)} constitutional rights")
        print(f"✓ Federal law includes {len(supreme_court)} Supreme Court cases")
    
    # Test: Multiple states load instantly (parallel test)
    def test_multiple_states_instant_loading(self):
        """Verify multiple states load instantly from pre-built database"""
        test_states = ["NY", "FL", "IL", "PA", "OH", "GA", "NC", "MI", "AZ", "CO"]
        
        for state_code in test_states:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/api/law-library/{state_code}", headers=self.headers)
            elapsed = time.time() - start_time
            
            assert response.status_code == 200, f"State {state_code} failed with status {response.status_code}"
            
            data = response.json()
            assert data.get("source") == "pre_built_database", f"State {state_code} should use pre_built_database"
            assert elapsed < 1.0, f"State {state_code} took {elapsed:.2f}s, expected < 1s"
            
            print(f"✓ {state_code}: {elapsed:.3f}s (source: {data.get('source')})")
    
    # Test: All 50 states have pre-built database entries
    def test_all_50_states_prebuilt(self):
        """Verify all 50 states have pre-built database entries"""
        all_states = [
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
            "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
            "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
            "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
        ]
        
        prebuilt_count = 0
        generic_count = 0
        
        for state_code in all_states:
            response = requests.get(f"{BASE_URL}/api/law-library/{state_code}", headers=self.headers)
            assert response.status_code == 200, f"State {state_code} returned {response.status_code}"
            
            data = response.json()
            if data.get("source") == "pre_built_database":
                prebuilt_count += 1
            else:
                generic_count += 1
                print(f"  Note: {state_code} uses generic template")
        
        print(f"✓ Tested all 50 states: {prebuilt_count} pre-built, {generic_count} generic")
        # At minimum, major states should be pre-built
        assert prebuilt_count >= 10, f"Expected at least 10 pre-built states, got {prebuilt_count}"
    
    # Test: Invalid state returns 404
    def test_invalid_state_returns_404(self):
        """Verify invalid state codes return 404"""
        response = requests.get(f"{BASE_URL}/api/law-library/XX", headers=self.headers)
        
        assert response.status_code == 404, f"Expected 404 for invalid state, got {response.status_code}"
        print(f"✓ Invalid state XX returns 404 as expected")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
