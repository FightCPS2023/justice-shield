"""
Test Person Lookup (Background Check) endpoint
Verifies /api/ai/person-lookup returns detailed structured JSON report
even when LLM output is weak/unparsable (fallback report).
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from iteration_18.json
TEST_EMAIL = "cpsvhuntingjustice@gmail.com"
TEST_PASSWORD = "cpssuxass"


class TestPersonLookup:
    """Person Lookup (Background Check) endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth token
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get("access_token") or data.get("token")
            if token:
                self.session.headers.update({"Authorization": f"Bearer {token}"})
                self.token = token
                print(f"✓ Logged in successfully as {TEST_EMAIL}")
            else:
                pytest.skip("No token in login response")
        else:
            pytest.skip(f"Login failed: {login_response.status_code} - {login_response.text}")
    
    def test_person_lookup_returns_structured_report(self):
        """Test that person lookup returns a detailed structured JSON report"""
        # Make person lookup request
        payload = {
            "name": "John Smith",
            "state": "California",
            "city": "Los Angeles",
            "additional_info": "CPS caseworker",
            "lookup_type": "comprehensive"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/ai/person-lookup",
            json=payload,
            timeout=60  # Allow time for AI processing
        )
        
        print(f"Response status: {response.status_code}")
        
        # Check status code
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        
        # Verify top-level response structure
        assert "name" in data, "Missing 'name' in response"
        assert "lookup_type" in data, "Missing 'lookup_type' in response"
        assert "results" in data, "Missing 'results' in response"
        assert "sources_checked" in data, "Missing 'sources_checked' in response"
        assert "disclaimer" in data, "Missing 'disclaimer' in response"
        assert "timestamp" in data, "Missing 'timestamp' in response"
        
        print(f"✓ Top-level response structure verified")
        
        # Verify results contains raw_report
        results = data["results"]
        assert "raw_report" in results, "Missing 'raw_report' in results"
        assert "structured_report" in results, "Missing 'structured_report' in results"
        
        print(f"✓ Results contains raw_report and structured_report")
        
        return data
    
    def test_person_lookup_raw_report_has_summary_narrative(self):
        """Test that raw_report contains summary.narrative with bullet lines"""
        payload = {
            "name": "Jane Doe",
            "state": "Texas",
            "city": "Houston",
            "additional_info": "Social worker",
            "lookup_type": "comprehensive"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/ai/person-lookup",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        results = data["results"]
        
        # Parse raw_report as JSON
        raw_report = results.get("raw_report", "")
        structured_report = results.get("structured_report", {})
        
        # Check structured_report has summary.narrative
        assert "summary" in structured_report, "Missing 'summary' in structured_report"
        summary = structured_report["summary"]
        assert "narrative" in summary, "Missing 'narrative' in summary"
        
        narrative = summary["narrative"]
        print(f"Narrative length: {len(narrative)} chars")
        print(f"Narrative preview: {narrative[:200]}...")
        
        # Verify narrative has bullet lines (contains "- " or "\n-")
        has_bullets = "- " in narrative or "\n-" in narrative
        assert has_bullets, f"Narrative should contain bullet lines. Got: {narrative[:300]}"
        
        # Count bullet lines
        bullet_count = narrative.count("\n-") + (1 if narrative.startswith("-") else 0)
        print(f"✓ Narrative has {bullet_count} bullet lines")
        
        # Should have at least some content
        assert len(narrative) > 100, f"Narrative too short: {len(narrative)} chars"
        
        print(f"✓ summary.narrative verified with bullet lines")
    
    def test_person_lookup_recommendations_next_steps(self):
        """Test that recommendations_next_steps has at least 6 items"""
        payload = {
            "name": "Test Person",
            "state": "Florida",
            "city": "Miami",
            "lookup_type": "comprehensive"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/ai/person-lookup",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        structured_report = data["results"].get("structured_report", {})
        
        # Check recommendations_next_steps
        assert "recommendations_next_steps" in structured_report, "Missing 'recommendations_next_steps'"
        recommendations = structured_report["recommendations_next_steps"]
        
        print(f"recommendations_next_steps count: {len(recommendations)}")
        for i, rec in enumerate(recommendations[:3]):
            print(f"  {i+1}. {rec[:80]}...")
        
        # Must have at least 6 items
        assert len(recommendations) >= 6, f"Expected >=6 recommendations, got {len(recommendations)}"
        
        print(f"✓ recommendations_next_steps has {len(recommendations)} items (>=6 required)")
    
    def test_person_lookup_verification_gaps(self):
        """Test that verification_gaps has at least 5 items"""
        payload = {
            "name": "Another Person",
            "state": "New York",
            "city": "New York City",
            "lookup_type": "comprehensive"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/ai/person-lookup",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        structured_report = data["results"].get("structured_report", {})
        
        # Check verification_gaps
        assert "verification_gaps" in structured_report, "Missing 'verification_gaps'"
        gaps = structured_report["verification_gaps"]
        
        print(f"verification_gaps count: {len(gaps)}")
        for i, gap in enumerate(gaps[:3]):
            print(f"  {i+1}. {gap}")
        
        # Must have at least 5 items
        assert len(gaps) >= 5, f"Expected >=5 verification_gaps, got {len(gaps)}"
        
        print(f"✓ verification_gaps has {len(gaps)} items (>=5 required)")
    
    def test_person_lookup_search_plan_present(self):
        """Test that search_plan is present and populated"""
        payload = {
            "name": "Search Plan Test",
            "state": "Illinois",
            "city": "Chicago",
            "lookup_type": "comprehensive"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/ai/person-lookup",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        structured_report = data["results"].get("structured_report", {})
        
        # Check search_plan
        assert "search_plan" in structured_report, "Missing 'search_plan'"
        search_plan = structured_report["search_plan"]
        
        print(f"search_plan count: {len(search_plan)}")
        
        # Should have items
        assert len(search_plan) > 0, "search_plan should not be empty"
        
        # Each item should have expected fields
        if len(search_plan) > 0:
            first_item = search_plan[0]
            print(f"First search_plan item: {first_item}")
            assert "step" in first_item or "source" in first_item, "search_plan items should have 'step' or 'source'"
        
        print(f"✓ search_plan present with {len(search_plan)} items")
    
    def test_person_lookup_search_queries_present(self):
        """Test that search_queries is present and populated"""
        payload = {
            "name": "Query Test Person",
            "state": "Ohio",
            "city": "Columbus",
            "lookup_type": "comprehensive"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/ai/person-lookup",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        structured_report = data["results"].get("structured_report", {})
        
        # Check search_queries
        assert "search_queries" in structured_report, "Missing 'search_queries'"
        queries = structured_report["search_queries"]
        
        print(f"search_queries count: {len(queries)}")
        for i, q in enumerate(queries[:3]):
            print(f"  {i+1}. {q}")
        
        # Should have items
        assert len(queries) > 0, "search_queries should not be empty"
        
        print(f"✓ search_queries present with {len(queries)} items")
    
    def test_person_lookup_records_to_request_present(self):
        """Test that records_to_request is present and populated"""
        payload = {
            "name": "Records Test Person",
            "state": "Pennsylvania",
            "city": "Philadelphia",
            "lookup_type": "comprehensive"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/ai/person-lookup",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        structured_report = data["results"].get("structured_report", {})
        
        # Check records_to_request
        assert "records_to_request" in structured_report, "Missing 'records_to_request'"
        records = structured_report["records_to_request"]
        
        print(f"records_to_request count: {len(records)}")
        
        # Should have items
        assert len(records) > 0, "records_to_request should not be empty"
        
        # Each item should have expected fields
        if len(records) > 0:
            first_item = records[0]
            print(f"First records_to_request item keys: {list(first_item.keys())}")
            assert "record_type" in first_item, "records_to_request items should have 'record_type'"
        
        print(f"✓ records_to_request present with {len(records)} items")
    
    def test_person_lookup_different_lookup_types(self):
        """Test different lookup_type values work"""
        lookup_types = ["comprehensive", "criminal", "civil", "professional"]
        
        for lookup_type in lookup_types:
            payload = {
                "name": f"Test {lookup_type}",
                "state": "California",
                "lookup_type": lookup_type
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/ai/person-lookup",
                json=payload,
                timeout=60
            )
            
            assert response.status_code == 200, f"lookup_type={lookup_type} failed: {response.status_code}"
            
            data = response.json()
            assert data["lookup_type"] == lookup_type, f"Expected lookup_type={lookup_type}"
            
            print(f"✓ lookup_type={lookup_type} works")
    
    def test_person_lookup_minimal_input(self):
        """Test with minimal input (just name)"""
        payload = {
            "name": "Minimal Test",
            "lookup_type": "comprehensive"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/ai/person-lookup",
            json=payload,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "results" in data
        assert "structured_report" in data["results"]
        
        # Even with minimal input, should have structured report
        structured_report = data["results"]["structured_report"]
        assert "summary" in structured_report
        assert "recommendations_next_steps" in structured_report
        
        print(f"✓ Minimal input (name only) returns structured report")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
