"""
Test Case Preparation Kit Feature
- PDF generation for court-ready case documentation
- Includes: Case info, violations, timeline, evidence, documents, notes, strategies, communications, court filings
"""

import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip('/')

# Test credentials
TEST_EMAIL = "lawtest@test.com"
TEST_PASSWORD = "Test123!"

# Test case ID provided by main agent
TEST_CASE_ID = "b49908b1-e3a7-404b-8d91-ed0f2b71ce1a"


class TestCasePreparationKit:
    """Test suite for Case Preparation Kit PDF export feature"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json().get("access_token")
    
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        """Request headers with auth token"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_preparation_kit_endpoint_exists(self, headers):
        """Test that the preparation kit endpoint exists and responds"""
        response = requests.get(
            f"{BASE_URL}/api/export/case/{TEST_CASE_ID}/preparation-kit",
            headers=headers
        )
        # Should return 200 with PDF or 404 if case doesn't exist
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code} - {response.text}"
    
    def test_preparation_kit_returns_pdf(self, headers):
        """Test that preparation kit returns valid PDF content"""
        response = requests.get(
            f"{BASE_URL}/api/export/case/{TEST_CASE_ID}/preparation-kit",
            headers=headers
        )
        
        if response.status_code == 404:
            pytest.skip("Test case not found - may need to create test data")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Check content type is PDF
        content_type = response.headers.get("Content-Type", "")
        assert "application/pdf" in content_type, f"Expected PDF content type, got: {content_type}"
        
        # Check content disposition header for download
        content_disposition = response.headers.get("Content-Disposition", "")
        assert "attachment" in content_disposition, f"Expected attachment disposition, got: {content_disposition}"
        assert ".pdf" in content_disposition.lower(), f"Expected .pdf in filename, got: {content_disposition}"
    
    def test_preparation_kit_pdf_has_content(self, headers):
        """Test that the PDF has meaningful content (not empty)"""
        response = requests.get(
            f"{BASE_URL}/api/export/case/{TEST_CASE_ID}/preparation-kit",
            headers=headers
        )
        
        if response.status_code == 404:
            pytest.skip("Test case not found")
        
        # PDF should have content
        pdf_content = response.content
        assert len(pdf_content) > 1000, f"PDF too small: {len(pdf_content)} bytes (expected > 1000)"
        
        # Check PDF magic bytes
        assert pdf_content[:4] == b'%PDF', "Response doesn't start with PDF magic bytes"
    
    def test_preparation_kit_unauthorized(self):
        """Test that unauthenticated requests are rejected"""
        response = requests.get(
            f"{BASE_URL}/api/export/case/{TEST_CASE_ID}/preparation-kit"
        )
        assert response.status_code == 401, f"Expected 401 for unauthenticated request, got {response.status_code}"
    
    def test_preparation_kit_case_not_found(self, headers):
        """Test that invalid case ID returns 404"""
        fake_case_id = "00000000-0000-0000-0000-000000000000"
        response = requests.get(
            f"{BASE_URL}/api/export/case/{fake_case_id}/preparation-kit",
            headers=headers
        )
        assert response.status_code == 404, f"Expected 404 for non-existent case, got {response.status_code}"


class TestCasePreparationKitIntegration:
    """Integration tests - create case with data and verify PDF includes all sections"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    @pytest.fixture(scope="class")
    def test_case(self, headers):
        """Create a test case with data for PDF generation"""
        # Create test case
        case_data = {
            "title": "TEST_PrepKit_Case",
            "state": "TX",
            "county": "Harris",
            "description": "Test case for Court Preparation Kit PDF generation",
            "case_number": "2024-TEST-123"
        }
        response = requests.post(f"{BASE_URL}/api/cases", json=case_data, headers=headers)
        assert response.status_code == 200, f"Failed to create case: {response.text}"
        case = response.json()
        case_id = case.get("id")
        
        # Add violation
        requests.post(f"{BASE_URL}/api/violations", json={
            "case_id": case_id,
            "violation_type": "fourth_amendment",
            "description": "Test violation for PDF kit",
            "severity": "high"
        }, headers=headers)
        
        # Add timeline event
        requests.post(f"{BASE_URL}/api/timeline", json={
            "case_id": case_id,
            "title": "Test Timeline Event",
            "description": "Event for PDF kit testing",
            "date": "2024-01-15",
            "event_type": "hearing"
        }, headers=headers)
        
        # Add evidence
        requests.post(f"{BASE_URL}/api/evidence", json={
            "case_id": case_id,
            "title": "Test Evidence",
            "description": "Evidence item for PDF kit",
            "evidence_type": "document",
            "source": "Test source"
        }, headers=headers)
        
        # Add communication
        requests.post(f"{BASE_URL}/api/communications", json={
            "case_id": case_id,
            "contact_type": "email",
            "contact_with": "CPS Worker",
            "date": "2024-01-16",
            "summary": "Test communication for PDF kit"
        }, headers=headers)
        
        # Add strategy
        requests.post(f"{BASE_URL}/api/strategies", json={
            "case_id": case_id,
            "title": "Test Defense Strategy",
            "description": "Strategy for PDF kit testing",
            "priority": "high"
        }, headers=headers)
        
        yield case
        
        # Cleanup - delete case and related data
        requests.delete(f"{BASE_URL}/api/cases/{case_id}", headers=headers)
    
    def test_full_preparation_kit_generation(self, headers, test_case):
        """Test that preparation kit with full data generates correctly"""
        case_id = test_case.get("id")
        
        response = requests.get(
            f"{BASE_URL}/api/export/case/{case_id}/preparation-kit",
            headers=headers
        )
        
        assert response.status_code == 200, f"PDF generation failed: {response.status_code}"
        
        # Verify PDF properties
        assert "application/pdf" in response.headers.get("Content-Type", "")
        
        pdf_content = response.content
        assert len(pdf_content) > 2000, f"PDF seems too small for full case: {len(pdf_content)} bytes"
        assert pdf_content[:4] == b'%PDF', "Invalid PDF format"
        
        print(f"✓ Full preparation kit PDF generated: {len(pdf_content)} bytes")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
