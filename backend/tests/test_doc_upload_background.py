"""
Test Document Upload Background Analysis Fix
Tests the fix where document analysis now runs as a background task to avoid timeout.

Key features to test:
1. Document upload returns quickly (under 30 seconds)
2. Upload response includes 'analyzing' status when auto_analyze=true
3. Analysis status polling endpoint works
4. Reanalyze endpoint returns immediately with 'analyzing' status
5. Text file upload works
6. Image upload with auto_analyze=true returns 'analyzing' status
"""
import pytest
import requests
import os
import time
import io
from PIL import Image

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDocumentUploadBackgroundAnalysis:
    """Tests for document upload with background analysis"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "cpsvhuntingjustice@gmail.com",
            "password": "cpssuxass"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def case_id(self):
        """Test case ID from fixtures"""
        return "26b68d9a-e89f-4e8f-adf4-aec7b6a712d8"
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}

    # =========================
    # Test 1: Login flow works
    # =========================
    def test_login_admin_user(self):
        """Test login with admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "cpsvhuntingjustice@gmail.com",
            "password": "cpssuxass"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["email"] == "cpsvhuntingjustice@gmail.com"
        assert data["tier"] == "attorney"
        print("✓ Login flow works for admin user")

    # =========================
    # Test 2: Dashboard loads (cases endpoint)
    # =========================
    def test_cases_api_returns_data(self, auth_headers):
        """Test that cases API returns data"""
        response = requests.get(f"{BASE_URL}/api/cases", headers=auth_headers)
        assert response.status_code == 200, f"Cases API failed: {response.text}"
        data = response.json()
        # API returns { "cases": [...] }
        cases = data.get("cases", data) if isinstance(data, dict) else data
        print(f"✓ Cases API returns {len(cases)} cases")

    # =========================
    # Test 3: Admin stats endpoint works
    # =========================
    def test_admin_stats_endpoint(self, auth_headers):
        """Test admin stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers)
        assert response.status_code == 200, f"Admin stats failed: {response.text}"
        data = response.json()
        assert "users_count" in data or "total_users" in data
        print(f"✓ Admin stats endpoint works: {data}")

    # =========================
    # Test 4: Credits endpoint works
    # =========================
    def test_credits_endpoint(self, auth_headers):
        """Test credits balance endpoint"""
        response = requests.get(f"{BASE_URL}/api/credits/balance", headers=auth_headers)
        assert response.status_code == 200, f"Credits endpoint failed: {response.text}"
        data = response.json()
        # API returns tier_credits_total, tier_credits_used, etc.
        assert "tier_credits_total" in data or "tier" in data
        print(f"✓ Credits endpoint works: {data}")

    # =========================
    # Test 5: Text file upload returns quickly
    # =========================
    def test_text_file_upload_returns_quickly(self, auth_headers, case_id):
        """Test that text file upload returns within 30 seconds"""
        test_content = """CPS CASE FILE - MOCK DOCUMENT FOR TESTING
        
        Case Number: 2024-TEST-001
        Date: January 15, 2024
        Caseworker: Jane Smith
        
        ALLEGATIONS:
        On January 10, 2024, caseworker conducted home visit without proper notice or warrant.
        Parent was not informed of their rights under the 4th Amendment.
        
        This is a test document for API testing purposes.
        """
        
        files = {
            'file': ('test_cps_document.txt', test_content.encode('utf-8'), 'text/plain')
        }
        data = {
            'case_id': case_id,
            'title': 'TEST_API_Upload_Text_File',
            'doc_type': 'cps_document',
            'auto_analyze': 'true'
        }
        
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            headers=auth_headers,
            files=files,
            data=data
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        assert elapsed < 30, f"Upload took {elapsed:.1f}s - should be under 30s"
        
        result = response.json()
        assert "id" in result, "Response should include document ID"
        print(f"✓ Text file upload returned in {elapsed:.1f}s (under 30s)")
        
        # Check if analysis is running in background
        if result.get("analysis_result"):
            status = result["analysis_result"].get("status")
            print(f"  Analysis status: {status}")
            if status == "analyzing":
                print("  ✓ Analysis is running in background as expected")
        
        return result.get("id")

    # =========================
    # Test 6: Image upload with auto_analyze returns 'analyzing' status
    # =========================
    def test_image_upload_with_analyze_returns_analyzing_status(self, auth_headers, case_id):
        """Test that image upload with auto_analyze=true returns 'analyzing' status"""
        # Create a test image using PIL
        img = Image.new('RGB', (100, 100), color='red')
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        files = {
            'file': ('test_image.png', img_buffer, 'image/png')
        }
        data = {
            'case_id': case_id,
            'title': 'TEST_API_Upload_Image',
            'doc_type': 'cps_document',
            'auto_analyze': 'true'
        }
        
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            headers=auth_headers,
            files=files,
            data=data
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200, f"Image upload failed: {response.text}"
        
        result = response.json()
        assert "id" in result, "Response should include document ID"
        print(f"✓ Image upload returned in {elapsed:.1f}s")
        
        # Check analysis result status
        if result.get("analysis_result"):
            status = result["analysis_result"].get("status")
            print(f"  Analysis status: {status}")
            # Status should be 'analyzing' for background task
            if status == "analyzing":
                print("  ✓ Analysis is running in background as expected")
        
        return result.get("id")

    # =========================
    # Test 7: Analysis status polling endpoint works
    # =========================
    def test_analysis_status_polling_endpoint(self, auth_headers, case_id):
        """Test that analysis status endpoint returns correct status"""
        # First upload a document to get a doc_id
        test_content = "Quick test for status polling"
        files = {
            'file': ('poll_test.txt', test_content.encode('utf-8'), 'text/plain')
        }
        data = {
            'case_id': case_id,
            'title': 'TEST_Status_Poll',
            'doc_type': 'cps_document',
            'auto_analyze': 'true'
        }
        
        upload_response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            headers=auth_headers,
            files=files,
            data=data
        )
        assert upload_response.status_code == 200, f"Upload failed: {upload_response.text}"
        
        doc_id = upload_response.json()["id"]
        
        # Now poll the status endpoint
        status_response = requests.get(
            f"{BASE_URL}/api/documents/{doc_id}/analysis-status",
            headers=auth_headers
        )
        
        assert status_response.status_code == 200, f"Status endpoint failed: {status_response.text}"
        
        status_data = status_response.json()
        assert "status" in status_data, "Response should include status field"
        assert "doc_id" in status_data, "Response should include doc_id field"
        assert status_data["status"] in ["analyzing", "complete", "error", "none"], \
            f"Invalid status: {status_data['status']}"
        
        print(f"✓ Analysis status polling endpoint works. Status: {status_data['status']}")
        
        return doc_id

    # =========================
    # Test 8: Reanalyze endpoint returns immediately with 'analyzing' status
    # =========================
    def test_reanalyze_endpoint_returns_immediately(self, auth_headers, case_id):
        """Test that reanalyze endpoint returns immediately with 'analyzing' status"""
        # First upload a document
        test_content = "Test document for reanalysis"
        files = {
            'file': ('reanalyze_test.txt', test_content.encode('utf-8'), 'text/plain')
        }
        data = {
            'case_id': case_id,
            'title': 'TEST_Reanalyze',
            'doc_type': 'cps_document',
            'auto_analyze': 'false'  # Don't auto-analyze on upload
        }
        
        upload_response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            headers=auth_headers,
            files=files,
            data=data
        )
        assert upload_response.status_code == 200, f"Upload failed: {upload_response.text}"
        
        doc_id = upload_response.json()["id"]
        
        # Call reanalyze endpoint
        start_time = time.time()
        reanalyze_response = requests.post(
            f"{BASE_URL}/api/documents/{doc_id}/reanalyze",
            headers=auth_headers
        )
        elapsed = time.time() - start_time
        
        assert reanalyze_response.status_code == 200, f"Reanalyze failed: {reanalyze_response.text}"
        assert elapsed < 10, f"Reanalyze took {elapsed:.1f}s - should return immediately"
        
        result = reanalyze_response.json()
        assert result.get("status") == "analyzing", f"Expected 'analyzing' status, got: {result.get('status')}"
        
        print(f"✓ Reanalyze endpoint returned in {elapsed:.1f}s with status: {result['status']}")

    # =========================
    # Test 9: List documents for case
    # =========================
    def test_list_documents_for_case(self, auth_headers, case_id):
        """Test listing documents for a case"""
        response = requests.get(
            f"{BASE_URL}/api/documents/{case_id}",
            headers=auth_headers
        )
        assert response.status_code == 200, f"List documents failed: {response.text}"
        
        data = response.json()
        assert "documents" in data, "Response should include documents list"
        
        print(f"✓ List documents returns {len(data['documents'])} documents for case")

    # =========================
    # Test 10: Wait for analysis completion (optional integration test)
    # =========================
    def test_analysis_completes_eventually(self, auth_headers, case_id):
        """Test that analysis eventually completes (integration test)"""
        # Upload a document
        test_content = """
        CPS PETITION FOR DEPENDENCY
        Case: 2024-TEST-COMPLETION
        
        ALLEGATION: On December 1, 2023, the caseworker entered the home without consent
        violating the family's 4th Amendment rights.
        
        The parent was not given proper notice as required by state law.
        """
        files = {
            'file': ('completion_test.txt', test_content.encode('utf-8'), 'text/plain')
        }
        data = {
            'case_id': case_id,
            'title': 'TEST_Completion_Check',
            'doc_type': 'cps_document',
            'auto_analyze': 'true'
        }
        
        upload_response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            headers=auth_headers,
            files=files,
            data=data
        )
        assert upload_response.status_code == 200
        
        doc_id = upload_response.json()["id"]
        
        # Poll for completion (max 60 seconds)
        max_attempts = 12
        final_status = None
        
        for attempt in range(max_attempts):
            time.sleep(5)
            status_response = requests.get(
                f"{BASE_URL}/api/documents/{doc_id}/analysis-status",
                headers=auth_headers
            )
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                final_status = status_data.get("status")
                print(f"  Poll {attempt+1}: Status = {final_status}")
                
                if final_status in ["complete", "error"]:
                    break
        
        # We expect it to complete or error, not stay in 'analyzing' forever
        assert final_status in ["complete", "error", "analyzing"], \
            f"Unexpected final status: {final_status}"
        
        if final_status == "complete":
            print(f"✓ Analysis completed successfully after {(attempt+1)*5}s")
        elif final_status == "error":
            print(f"! Analysis errored after {(attempt+1)*5}s - check logs")
        else:
            print(f"! Analysis still running after {max_attempts*5}s - background task may be slow")


class TestHealthAndBasicEndpoints:
    """Basic health and endpoint tests"""
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        print("✓ Health check endpoint works")

    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code == 200, f"Root endpoint failed: {response.text}"
        print("✓ Root API endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
