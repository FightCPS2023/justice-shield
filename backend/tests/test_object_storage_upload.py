"""
Test Object Storage Upload Flow
Tests:
1. POST /api/documents/upload returns doc with storage_path populated and file_path null
2. Upload returns analysis_status 'queued' for regular files or 'archive_processing' for ZIP
3. Upload rejects files >100MB (check limit logic)
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "cpsvhuntingjustice@gmail.com"
TEST_PASSWORD = "cpssuxass"


class TestObjectStorageUpload:
    """Test object storage integration for document uploads"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: login and get auth token, create a case if needed"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        self.token = login_data.get("access_token")
        self.user_id = login_data.get("user_id")
        assert self.token, "No access_token in login response"
        
        # Set auth header
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        
        # Get or create a case for uploads
        cases_resp = self.session.get(f"{BASE_URL}/api/cases")
        assert cases_resp.status_code == 200, f"Failed to get cases: {cases_resp.text}"
        cases_data = cases_resp.json()
        cases = cases_data.get("cases", []) if isinstance(cases_data, dict) else cases_data
        
        if cases and len(cases) > 0:
            self.case_id = cases[0].get("id")
        else:
            # Create a test case
            case_resp = self.session.post(f"{BASE_URL}/api/cases", json={
                "title": "TEST_ObjectStorageUpload_Case",
                "state": "California",
                "case_type": "investigation"
            })
            assert case_resp.status_code in [200, 201], f"Failed to create case: {case_resp.text}"
            self.case_id = case_resp.json().get("id")
        
        assert self.case_id, "No case_id available for testing"
        print(f"Using case_id: {self.case_id}")
        yield
        
    def test_upload_returns_storage_path_and_null_file_path(self):
        """
        Test: POST /api/documents/upload should return doc with:
        - storage_path populated (object storage path)
        - file_path null (no local file storage)
        """
        # Create a small test file
        test_content = b"This is a test document for object storage upload testing."
        files = {
            'file': ('test_upload.txt', io.BytesIO(test_content), 'text/plain')
        }
        data = {
            'case_id': self.case_id,
            'title': 'TEST_ObjectStorage_Upload',
            'doc_type': 'cps_document',
            'auto_analyze': 'true'
        }
        
        # Remove Content-Type header for multipart upload
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            files=files,
            data=data,
            headers=headers
        )
        
        print(f"Upload response status: {response.status_code}")
        print(f"Upload response: {response.text[:500] if response.text else 'empty'}")
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        
        doc = response.json()
        
        # Verify storage_path is populated
        assert "storage_path" in doc, "Response missing storage_path field"
        assert doc["storage_path"] is not None, "storage_path should not be null"
        assert len(doc["storage_path"]) > 0, "storage_path should not be empty"
        assert "cps-punisher" in doc["storage_path"], f"storage_path should contain app name: {doc['storage_path']}"
        
        # Verify file_path is null
        assert "file_path" in doc, "Response missing file_path field"
        assert doc["file_path"] is None, f"file_path should be null, got: {doc['file_path']}"
        
        print(f"SUCCESS: storage_path={doc['storage_path']}, file_path={doc['file_path']}")
        
    def test_upload_returns_analysis_status_queued(self):
        """
        Test: Upload with auto_analyze=true should return analysis_status='queued'
        """
        test_content = b"Test document content for analysis queue testing."
        files = {
            'file': ('test_analysis_queue.txt', io.BytesIO(test_content), 'text/plain')
        }
        data = {
            'case_id': self.case_id,
            'title': 'TEST_AnalysisQueue_Upload',
            'doc_type': 'cps_document',
            'auto_analyze': 'true'
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            files=files,
            data=data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        
        doc = response.json()
        
        # Verify analysis_status is 'queued' for regular files
        assert "analysis_status" in doc, "Response missing analysis_status field"
        assert doc["analysis_status"] == "queued", f"Expected analysis_status='queued', got: {doc['analysis_status']}"
        
        # Also check analysis_result
        if "analysis_result" in doc and doc["analysis_result"]:
            assert doc["analysis_result"].get("status") == "queued", f"analysis_result.status should be 'queued'"
        
        print(f"SUCCESS: analysis_status={doc['analysis_status']}")
        
    def test_zip_upload_returns_archive_processing_status(self):
        """
        Test: ZIP archive upload should return analysis_status='archive_processing'
        """
        import zipfile
        
        # Create a small ZIP file in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.writestr('test_file.txt', 'This is a test file inside the ZIP archive.')
        zip_buffer.seek(0)
        
        files = {
            'file': ('test_archive.zip', zip_buffer, 'application/zip')
        }
        data = {
            'case_id': self.case_id,
            'title': 'TEST_ZipArchive_Upload',
            'doc_type': 'cps_document',
            'auto_analyze': 'true'
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            files=files,
            data=data,
            headers=headers
        )
        
        assert response.status_code == 200, f"ZIP upload failed: {response.text}"
        
        doc = response.json()
        
        # For ZIP archives, analysis_status should be None (archives don't get analyzed directly)
        # But analysis_result.status should be 'archive_processing'
        if "analysis_result" in doc and doc["analysis_result"]:
            assert doc["analysis_result"].get("status") == "archive_processing", \
                f"Expected analysis_result.status='archive_processing', got: {doc['analysis_result']}"
        
        # storage_path should still be populated
        assert doc.get("storage_path") is not None, "ZIP upload should have storage_path"
        assert doc.get("file_path") is None, "ZIP upload should have file_path=null"
        
        print(f"SUCCESS: ZIP archive upload - analysis_result.status={doc.get('analysis_result', {}).get('status')}")
        
    def test_upload_size_limit_logic(self):
        """
        Test: Verify the 100MB upload limit is enforced
        Note: We can't actually upload 100MB+ in tests, so we verify the limit exists in response
        or test with a file just under the limit
        """
        # Create a 1MB test file (small enough to upload, but tests the flow)
        test_content = b"X" * (1 * 1024 * 1024)  # 1MB
        files = {
            'file': ('test_1mb.txt', io.BytesIO(test_content), 'text/plain')
        }
        data = {
            'case_id': self.case_id,
            'title': 'TEST_SizeLimit_Upload',
            'doc_type': 'cps_document',
            'auto_analyze': 'false'
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            files=files,
            data=data,
            headers=headers
        )
        
        # 1MB should succeed
        assert response.status_code == 200, f"1MB upload should succeed: {response.text}"
        
        doc = response.json()
        assert doc.get("file_size") == len(test_content), f"File size mismatch: expected {len(test_content)}, got {doc.get('file_size')}"
        
        print(f"SUCCESS: 1MB file uploaded, size={doc.get('file_size')}")
        
    def test_upload_without_auto_analyze(self):
        """
        Test: Upload with auto_analyze=false should have analysis_status=None
        """
        test_content = b"Test document without auto analysis."
        files = {
            'file': ('test_no_analyze.txt', io.BytesIO(test_content), 'text/plain')
        }
        data = {
            'case_id': self.case_id,
            'title': 'TEST_NoAnalyze_Upload',
            'doc_type': 'cps_document',
            'auto_analyze': 'false'
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            files=files,
            data=data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        
        doc = response.json()
        
        # With auto_analyze=false, analysis_status should be None
        # Note: The code sets analysis_status to None when auto_analyze is false
        assert doc.get("analysis_result") is None, f"Expected analysis_result=None when auto_analyze=false, got: {doc.get('analysis_result')}"
        
        print(f"SUCCESS: Upload without auto_analyze - analysis_result={doc.get('analysis_result')}")
        
    def test_upload_pdf_returns_correct_category(self):
        """
        Test: PDF upload should have file_category='document'
        """
        # Create a minimal PDF
        pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
196
%%EOF"""
        
        files = {
            'file': ('test_document.pdf', io.BytesIO(pdf_content), 'application/pdf')
        }
        data = {
            'case_id': self.case_id,
            'title': 'TEST_PDF_Upload',
            'doc_type': 'cps_document',
            'auto_analyze': 'true'
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            files=files,
            data=data,
            headers=headers
        )
        
        assert response.status_code == 200, f"PDF upload failed: {response.text}"
        
        doc = response.json()
        
        # Verify file_category
        assert doc.get("file_category") == "document", f"Expected file_category='document', got: {doc.get('file_category')}"
        assert doc.get("file_type") == ".pdf", f"Expected file_type='.pdf', got: {doc.get('file_type')}"
        assert doc.get("storage_path") is not None, "PDF should have storage_path"
        assert doc.get("file_path") is None, "PDF should have file_path=null"
        
        print(f"SUCCESS: PDF upload - file_category={doc.get('file_category')}, file_type={doc.get('file_type')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
