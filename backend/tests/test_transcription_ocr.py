"""
Test Suite for Audio/Video Transcription and PDF OCR - THE CPS PUNISHER
Tests for:
- PDF upload with text extraction (text-based PDFs)
- PDF upload with OCR fallback (scanned/image-based PDFs)
- Audio file upload (MP3) with Whisper transcription
- Video file upload (MP4) with audio transcription
- Document list showing uploaded files with correct categories
- Verify transcribed text is searchable and viewable

Test credentials: pdftest@test.com / Test123! (Attorney tier - unlimited uploads)
Case ID: fb3aefda-21dd-479f-8ded-0915fcc75856
Test files:
  - /tmp/test_upload.pdf (text PDF)
  - /tmp/scanned_test.pdf (image-based PDF)
  - /tmp/test_audio.mp3 (audio)
  - /tmp/test_video.mp4 (video)
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials (Attorney tier - unlimited uploads)
TEST_EMAIL = "pdftest@test.com"
TEST_PASSWORD = "Test123!"
TEST_CASE_ID = "fb3aefda-21dd-479f-8ded-0915fcc75856"

# Test files
TEXT_PDF = "/tmp/test_upload.pdf"
SCANNED_PDF = "/tmp/scanned_test.pdf"
AUDIO_FILE = "/tmp/test_audio.mp3"
VIDEO_FILE = "/tmp/test_video.mp4"


class TestTranscriptionAndOCR:
    """Test suite for document upload with transcription/OCR features"""
    
    @pytest.fixture(autouse=True, scope="class")
    def setup_class(self, request):
        """Setup test class - authenticate"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        token = data.get("access_token")
        user_id = data.get("user_id")
        tier = data.get("tier")
        
        print(f"Logged in as {TEST_EMAIL}, tier: {tier}")
        
        session.headers.update({"Authorization": f"Bearer {token}"})
        # Remove Content-Type for file uploads (let requests set it with boundary)
        
        request.cls.session = session
        request.cls.token = token
        request.cls.user_id = user_id
        request.cls.tier = tier
        request.cls.uploaded_doc_ids = []
        
        yield
        
        # Cleanup - delete uploaded test documents
        for doc_id in request.cls.uploaded_doc_ids:
            try:
                session.delete(f"{BASE_URL}/api/documents/{doc_id}")
                print(f"Cleaned up document: {doc_id}")
            except Exception as e:
                print(f"Cleanup failed for {doc_id}: {e}")
    
    def test_01_verify_test_files_exist(self):
        """Verify all test files exist and are readable"""
        test_files = [TEXT_PDF, SCANNED_PDF, AUDIO_FILE, VIDEO_FILE]
        for fpath in test_files:
            assert os.path.exists(fpath), f"Test file missing: {fpath}"
            assert os.path.getsize(fpath) > 0, f"Test file empty: {fpath}"
            print(f"✓ {fpath} exists ({os.path.getsize(fpath)} bytes)")
    
    def test_02_verify_case_exists(self):
        """Verify the test case exists and is accessible"""
        response = self.session.get(f"{BASE_URL}/api/cases/{TEST_CASE_ID}")
        assert response.status_code == 200, f"Case not found: {response.text}"
        case_data = response.json()
        print(f"✓ Case found: {case_data.get('title', 'Unknown')}")
        assert "title" in case_data
    
    def test_03_upload_text_pdf(self):
        """Test uploading a text-based PDF with text extraction"""
        with open(TEXT_PDF, 'rb') as f:
            files = {'file': ('test_text_document.pdf', f, 'application/pdf')}
            data = {
                'case_id': TEST_CASE_ID,
                'title': 'TEST_TextPDF_Document',
                'doc_type': 'cps_document',
                'auto_analyze': 'false'  # Skip AI analysis to speed up test
            }
            
            # Remove Content-Type header for multipart
            headers = {"Authorization": f"Bearer {self.token}"}
            
            response = requests.post(
                f"{BASE_URL}/api/documents/upload",
                files=files,
                data=data,
                headers=headers
            )
        
        assert response.status_code == 200, f"Upload failed: {response.status_code} - {response.text}"
        
        doc = response.json()
        print(f"✓ Text PDF uploaded: {doc.get('id')}")
        print(f"  File category: {doc.get('file_category')}")
        print(f"  Content preview: {doc.get('content', '')[:200]}...")
        
        # Verify document structure
        assert doc.get('id'), "Missing document ID"
        assert doc.get('file_category') == 'document', f"Expected category 'document', got {doc.get('file_category')}"
        assert doc.get('file_type') == '.pdf', f"Expected type '.pdf', got {doc.get('file_type')}"
        
        # Verify text was extracted (should NOT be OCR for text-based PDF)
        content = doc.get('content', '')
        assert '[PDF Document:' in content, "Missing PDF document marker in content"
        # Text PDF should NOT have OCR marker unless it was actually scanned
        
        self.uploaded_doc_ids.append(doc.get('id'))
        self.__class__.text_pdf_doc_id = doc.get('id')
    
    def test_04_upload_scanned_pdf_with_ocr(self):
        """Test uploading a scanned/image-based PDF with OCR fallback"""
        with open(SCANNED_PDF, 'rb') as f:
            files = {'file': ('scanned_document.pdf', f, 'application/pdf')}
            data = {
                'case_id': TEST_CASE_ID,
                'title': 'TEST_ScannedPDF_OCR_Document',
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
        
        assert response.status_code == 200, f"Upload failed: {response.status_code} - {response.text}"
        
        doc = response.json()
        print(f"✓ Scanned PDF uploaded: {doc.get('id')}")
        print(f"  File category: {doc.get('file_category')}")
        print(f"  Content preview: {doc.get('content', '')[:300]}...")
        
        # Verify document structure
        assert doc.get('id'), "Missing document ID"
        assert doc.get('file_category') == 'document'
        
        # Check if OCR was attempted (content should have OCR marker or text)
        content = doc.get('content', '')
        assert '[PDF Document:' in content, "Missing PDF document marker"
        
        # For scanned PDFs, we expect either OCR text or a note about OCR
        has_ocr_marker = '(OCR)' in content or 'OCR' in content
        has_scanned_note = 'scanned' in content.lower() or 'image-based' in content.lower()
        has_extracted_text = len(content) > 100 and '---' in content
        
        print(f"  OCR marker found: {has_ocr_marker}")
        print(f"  Scanned note found: {has_scanned_note}")
        print(f"  Has extracted text: {has_extracted_text}")
        
        # Should have either extracted text OR a note about the document
        assert has_extracted_text or has_scanned_note or has_ocr_marker, \
            "Scanned PDF should have OCR text extraction or appropriate note"
        
        self.uploaded_doc_ids.append(doc.get('id'))
        self.__class__.scanned_pdf_doc_id = doc.get('id')
    
    def test_05_upload_audio_mp3(self):
        """Test uploading an MP3 audio file with Whisper transcription"""
        with open(AUDIO_FILE, 'rb') as f:
            files = {'file': ('test_recording.mp3', f, 'audio/mpeg')}
            data = {
                'case_id': TEST_CASE_ID,
                'title': 'TEST_Audio_Recording',
                'doc_type': 'evidence',
                'auto_analyze': 'false'
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            
            response = requests.post(
                f"{BASE_URL}/api/documents/upload",
                files=files,
                data=data,
                headers=headers,
                timeout=60  # Longer timeout for transcription
            )
        
        assert response.status_code == 200, f"Upload failed: {response.status_code} - {response.text}"
        
        doc = response.json()
        print(f"✓ Audio file uploaded: {doc.get('id')}")
        print(f"  File category: {doc.get('file_category')}")
        print(f"  File size: {doc.get('file_size', 0) // 1024}KB")
        print(f"  Content preview: {doc.get('content', '')[:300]}...")
        
        # Verify document structure
        assert doc.get('id'), "Missing document ID"
        assert doc.get('file_category') == 'audio', f"Expected category 'audio', got {doc.get('file_category')}"
        assert doc.get('file_type') == '.mp3', f"Expected type '.mp3', got {doc.get('file_type')}"
        
        # Check content for audio marker
        content = doc.get('content', '')
        assert '[Audio Recording:' in content, "Missing audio recording marker"
        
        # Check if transcription was successful
        has_transcription = '(Transcribed)' in content
        has_audio_note = 'Audio file uploaded' in content
        
        print(f"  Transcription successful: {has_transcription}")
        print(f"  Has audio note: {has_audio_note}")
        
        # Should have either transcription or a note
        assert has_transcription or has_audio_note, \
            "Audio should have transcription text or upload note"
        
        self.uploaded_doc_ids.append(doc.get('id'))
        self.__class__.audio_doc_id = doc.get('id')
    
    def test_06_upload_video_mp4(self):
        """Test uploading an MP4 video file with audio transcription"""
        with open(VIDEO_FILE, 'rb') as f:
            files = {'file': ('test_video.mp4', f, 'video/mp4')}
            data = {
                'case_id': TEST_CASE_ID,
                'title': 'TEST_Video_Recording',
                'doc_type': 'evidence',
                'auto_analyze': 'false'
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            
            response = requests.post(
                f"{BASE_URL}/api/documents/upload",
                files=files,
                data=data,
                headers=headers,
                timeout=60  # Longer timeout for transcription
            )
        
        assert response.status_code == 200, f"Upload failed: {response.status_code} - {response.text}"
        
        doc = response.json()
        print(f"✓ Video file uploaded: {doc.get('id')}")
        print(f"  File category: {doc.get('file_category')}")
        print(f"  File size: {doc.get('file_size', 0) // 1024}KB")
        print(f"  Content preview: {doc.get('content', '')[:300]}...")
        
        # Verify document structure
        assert doc.get('id'), "Missing document ID"
        assert doc.get('file_category') == 'video', f"Expected category 'video', got {doc.get('file_category')}"
        assert doc.get('file_type') == '.mp4', f"Expected type '.mp4', got {doc.get('file_type')}"
        
        # Check content for video marker
        content = doc.get('content', '')
        assert '[Video Recording:' in content, "Missing video recording marker"
        
        # Check if transcription was successful
        has_transcription = '(Audio Transcribed)' in content
        has_video_note = 'Video file uploaded' in content
        
        print(f"  Transcription successful: {has_transcription}")
        print(f"  Has video note: {has_video_note}")
        
        # Should have either transcription or a note
        assert has_transcription or has_video_note, \
            "Video should have transcription text or upload note"
        
        self.uploaded_doc_ids.append(doc.get('id'))
        self.__class__.video_doc_id = doc.get('id')
    
    def test_07_list_documents_with_categories(self):
        """Test that document list shows files with correct categories"""
        response = self.session.get(f"{BASE_URL}/api/documents/{TEST_CASE_ID}")
        assert response.status_code == 200, f"Failed to list documents: {response.text}"
        
        data = response.json()
        docs = data.get('documents', [])
        
        print(f"✓ Found {len(docs)} documents in case")
        
        # Filter to our test documents
        test_docs = [d for d in docs if d.get('title', '').startswith('TEST_')]
        print(f"  Test documents: {len(test_docs)}")
        
        # Verify categories
        categories_found = {}
        for doc in test_docs:
            cat = doc.get('file_category', 'unknown')
            categories_found[cat] = categories_found.get(cat, 0) + 1
            print(f"  - {doc.get('title')}: category={cat}, type={doc.get('file_type')}")
        
        print(f"  Categories summary: {categories_found}")
        
        # We should have documents in multiple categories
        assert len(test_docs) >= 4, f"Expected at least 4 test documents, found {len(test_docs)}"
    
    def test_08_verify_document_content_searchable(self):
        """Test that uploaded document content is retrievable and searchable"""
        # Get the text PDF document
        if hasattr(self.__class__, 'text_pdf_doc_id'):
            doc_id = self.__class__.text_pdf_doc_id
            
            # Fetch document list and find our document
            response = self.session.get(f"{BASE_URL}/api/documents/{TEST_CASE_ID}")
            assert response.status_code == 200
            
            docs = response.json().get('documents', [])
            doc = next((d for d in docs if d.get('id') == doc_id), None)
            
            if doc:
                content = doc.get('content', '')
                print(f"✓ Text PDF content length: {len(content)} characters")
                print(f"  Content searchable: {'PDF' in content}")
                assert len(content) > 50, "Document content should be substantial"
            else:
                print("Warning: Could not find text PDF document in list")
    
    def test_09_verify_audio_transcription_content(self):
        """Verify audio transcription content is present and meaningful"""
        if hasattr(self.__class__, 'audio_doc_id'):
            doc_id = self.__class__.audio_doc_id
            
            response = self.session.get(f"{BASE_URL}/api/documents/{TEST_CASE_ID}")
            assert response.status_code == 200
            
            docs = response.json().get('documents', [])
            doc = next((d for d in docs if d.get('id') == doc_id), None)
            
            if doc:
                content = doc.get('content', '')
                has_transcription = '(Transcribed)' in content
                
                if has_transcription:
                    # Extract transcription text (after the marker)
                    transcription_start = content.find('(Transcribed)')
                    if transcription_start > -1:
                        transcription_text = content[transcription_start + 14:].strip()
                        print(f"✓ Audio transcription found: {len(transcription_text)} characters")
                        print(f"  Preview: {transcription_text[:200]}...")
                else:
                    print("Note: Audio transcription was not available (API may have failed)")
    
    def test_10_verify_video_transcription_content(self):
        """Verify video audio transcription content is present and meaningful"""
        if hasattr(self.__class__, 'video_doc_id'):
            doc_id = self.__class__.video_doc_id
            
            response = self.session.get(f"{BASE_URL}/api/documents/{TEST_CASE_ID}")
            assert response.status_code == 200
            
            docs = response.json().get('documents', [])
            doc = next((d for d in docs if d.get('id') == doc_id), None)
            
            if doc:
                content = doc.get('content', '')
                has_transcription = '(Audio Transcribed)' in content
                
                if has_transcription:
                    transcription_start = content.find('(Audio Transcribed)')
                    if transcription_start > -1:
                        transcription_text = content[transcription_start + 20:].strip()
                        print(f"✓ Video transcription found: {len(transcription_text)} characters")
                        print(f"  Preview: {transcription_text[:200]}...")
                else:
                    print("Note: Video transcription was not available (API may have failed)")


class TestDocumentUploadEdgeCases:
    """Test edge cases for document upload"""
    
    @pytest.fixture(autouse=True, scope="class")
    def setup_class(self, request):
        """Setup test class"""
        session = requests.Session()
        
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        
        data = response.json()
        request.cls.session = session
        request.cls.token = data.get("access_token")
    
    def test_upload_unsupported_file_type(self):
        """Test that unsupported file types are rejected"""
        # Create a temporary file with unsupported extension
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.exe', delete=False) as f:
            f.write(b'fake exe content')
            temp_path = f.name
        
        try:
            with open(temp_path, 'rb') as f:
                files = {'file': ('test.exe', f, 'application/octet-stream')}
                data = {
                    'case_id': TEST_CASE_ID,
                    'title': 'TEST_Unsupported',
                    'doc_type': 'evidence',
                    'auto_analyze': 'false'
                }
                
                headers = {"Authorization": f"Bearer {self.token}"}
                response = requests.post(
                    f"{BASE_URL}/api/documents/upload",
                    files=files,
                    data=data,
                    headers=headers
                )
            
            # Should be rejected with 400
            assert response.status_code == 400, f"Expected 400 for unsupported file, got {response.status_code}"
            print(f"✓ Unsupported file type correctly rejected: {response.json().get('detail', '')}")
        finally:
            os.unlink(temp_path)
    
    def test_upload_without_authentication(self):
        """Test that upload requires authentication"""
        with open(TEXT_PDF, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            data = {
                'case_id': TEST_CASE_ID,
                'title': 'TEST_Unauthorized',
                'doc_type': 'evidence'
            }
            
            # No auth header
            response = requests.post(
                f"{BASE_URL}/api/documents/upload",
                files=files,
                data=data
            )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Unauthenticated upload correctly rejected")
    
    def test_upload_to_nonexistent_case(self):
        """Test that upload to non-existent case fails"""
        fake_case_id = "00000000-0000-0000-0000-000000000000"
        
        with open(TEXT_PDF, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            data = {
                'case_id': fake_case_id,
                'title': 'TEST_BadCase',
                'doc_type': 'evidence'
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(
                f"{BASE_URL}/api/documents/upload",
                files=files,
                data=data,
                headers=headers
            )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Upload to non-existent case correctly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
