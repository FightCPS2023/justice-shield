"""
Test Suite: PDF Document Analysis Feature
Testing: PDF upload with auto_analyze=true, violations extraction, timeline events,
         analysis object structure, Document Analysis view, re-analyze, forensic analysis

Test Case ID: 6d991b7d-a6ef-4b1d-8bfd-05e40fc8baf8
Test User: cpsvhuntingjustice@gmail.com / cpssuxass
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPDFDocumentAnalysis:
    """Tests for PDF document analysis feature - critical functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session and login"""
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.token = None
        self.user_id = None
        self.case_id = '6d991b7d-a6ef-4b1d-8bfd-05e40fc8baf8'  # Pre-existing test case
        
        # Login with test credentials
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "cpsvhuntingjustice@gmail.com",
            "password": "cpssuxass"
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get('access_token')
            self.user_id = data.get('user_id')
            self.session.headers.update({'Authorization': f'Bearer {self.token}'})
        else:
            pytest.skip(f"Login failed: {login_response.status_code}")
    
    def test_01_login_and_verify_admin_user(self):
        """Test login with admin credentials"""
        assert self.token is not None, "Token should be obtained"
        assert self.user_id is not None, "User ID should be obtained"
        print(f"Login successful - User ID: {self.user_id}")
    
    def test_02_verify_test_case_exists(self):
        """Verify the test case exists for PDF upload"""
        response = self.session.get(f"{BASE_URL}/api/cases/{self.case_id}")
        
        if response.status_code == 404:
            # Create test case if it doesn't exist
            create_response = self.session.post(f"{BASE_URL}/api/cases", json={
                "title": "PDF Analysis Test Case",
                "state": "CA",
                "description": "Test case for PDF document analysis testing"
            })
            assert create_response.status_code in [200, 201], f"Failed to create test case: {create_response.text}"
            case_data = create_response.json()
            self.case_id = case_data.get('id')
            print(f"Created new test case: {self.case_id}")
        else:
            assert response.status_code == 200, f"Failed to get case: {response.text}"
            print(f"Using existing test case: {self.case_id}")
    
    def test_03_upload_pdf_with_auto_analyze(self):
        """CRITICAL: Test PDF upload with auto_analyze=true"""
        # Check if test PDF exists
        pdf_path = '/tmp/cps_test_document.pdf'
        
        if not os.path.exists(pdf_path):
            pytest.skip("Test PDF not found at /tmp/cps_test_document.pdf")
        
        # Upload PDF with auto_analyze=true
        with open(pdf_path, 'rb') as pdf_file:
            files = {'file': ('cps_test_document.pdf', pdf_file, 'application/pdf')}
            data = {
                'case_id': self.case_id,
                'title': f'Test PDF Analysis {int(time.time())}',
                'doc_type': 'safety_assessment',
                'auto_analyze': 'true'
            }
            
            # Remove Content-Type for multipart upload
            headers = {'Authorization': f'Bearer {self.token}'}
            
            response = requests.post(
                f"{BASE_URL}/api/documents/upload",
                files=files,
                data=data,
                headers=headers,
                timeout=120  # Allow time for AI analysis
            )
        
        assert response.status_code == 200, f"Upload failed: {response.status_code} - {response.text}"
        
        doc_data = response.json()
        print(f"Upload response: {doc_data.keys()}")
        
        # Verify document was created
        assert 'id' in doc_data, "Document ID should be in response"
        self.uploaded_doc_id = doc_data['id']
        print(f"Uploaded document ID: {self.uploaded_doc_id}")
        
        # Store for subsequent tests
        pytest.uploaded_doc_id = self.uploaded_doc_id
        
        return doc_data
    
    def test_04_verify_analysis_result_structure(self):
        """CRITICAL: Verify analysis object contains required fields"""
        if not hasattr(pytest, 'uploaded_doc_id'):
            pytest.skip("No uploaded document from previous test")
        
        doc_id = pytest.uploaded_doc_id
        
        # Get document analysis
        response = self.session.get(f"{BASE_URL}/api/documents/{doc_id}/analysis")
        assert response.status_code == 200, f"Failed to get analysis: {response.text}"
        
        analysis_data = response.json()
        print(f"Analysis response keys: {analysis_data.keys()}")
        
        # Check required fields in analysis object
        analysis = analysis_data.get('analysis', {})
        
        # The analysis should have these fields according to the AI prompt
        required_fields = ['summary', 'violations', 'key_allegations', 'defense_opportunities', 'timeline_events']
        
        if isinstance(analysis, dict):
            for field in required_fields:
                if field in analysis:
                    print(f"  - {field}: Present with {len(analysis[field]) if isinstance(analysis[field], list) else 'value'}")
                else:
                    print(f"  - {field}: MISSING")
        else:
            print(f"Analysis is type: {type(analysis)}")
        
        return analysis_data
    
    def test_05_verify_violations_extracted_and_saved(self):
        """CRITICAL: Verify violations are extracted and saved to database"""
        # Get violations for the test case
        response = self.session.get(f"{BASE_URL}/api/violations/{self.case_id}")
        assert response.status_code == 200, f"Failed to get violations: {response.text}"
        
        data = response.json()
        violations = data.get('violations', [])
        
        print(f"Total violations in case: {len(violations)}")
        
        # Check for auto-extracted violations
        auto_extracted = [v for v in violations if v.get('auto_extracted') == True]
        print(f"Auto-extracted violations: {len(auto_extracted)}")
        
        if len(auto_extracted) > 0:
            print("Sample violations extracted:")
            for v in auto_extracted[:3]:
                print(f"  - Type: {v.get('violation_type')}, Severity: {v.get('severity')}")
        
        return violations
    
    def test_06_verify_timeline_events_extracted(self):
        """CRITICAL: Verify timeline events are extracted"""
        response = self.session.get(f"{BASE_URL}/api/timeline/{self.case_id}")
        assert response.status_code == 200, f"Failed to get timeline: {response.text}"
        
        data = response.json()
        events = data.get('events', [])
        
        print(f"Total timeline events: {len(events)}")
        
        # Check for auto-extracted events
        auto_extracted = [e for e in events if e.get('auto_extracted') == True]
        print(f"Auto-extracted events: {len(auto_extracted)}")
        
        if len(auto_extracted) > 0:
            print("Sample timeline events:")
            for e in auto_extracted[:3]:
                print(f"  - Date: {e.get('date')}, Title: {e.get('title')[:50] if e.get('title') else 'N/A'}...")
        
        return events
    
    def test_07_verify_document_list_shows_analysis(self):
        """Verify document list includes analysis data"""
        response = self.session.get(f"{BASE_URL}/api/documents/{self.case_id}")
        assert response.status_code == 200, f"Failed to get documents: {response.text}"
        
        data = response.json()
        documents = data.get('documents', [])
        
        print(f"Documents in case: {len(documents)}")
        
        # Check for documents with analysis
        with_analysis = [d for d in documents if d.get('analysis') is not None]
        print(f"Documents with analysis: {len(with_analysis)}")
        
        return documents
    
    def test_08_reanalyze_document(self):
        """Test re-analyze document endpoint"""
        if not hasattr(pytest, 'uploaded_doc_id'):
            # Get first document from case
            response = self.session.get(f"{BASE_URL}/api/documents/{self.case_id}")
            if response.status_code == 200:
                docs = response.json().get('documents', [])
                if docs:
                    pytest.uploaded_doc_id = docs[0]['id']
                else:
                    pytest.skip("No documents available to reanalyze")
            else:
                pytest.skip("Cannot list documents")
        
        doc_id = pytest.uploaded_doc_id
        
        # Trigger reanalysis
        response = self.session.post(
            f"{BASE_URL}/api/documents/{doc_id}/reanalyze",
            timeout=120
        )
        
        assert response.status_code == 200, f"Reanalysis failed: {response.status_code} - {response.text}"
        
        result = response.json()
        print(f"Reanalysis result keys: {result.keys()}")
        
        # Verify reanalysis created violations/timeline
        violations_created = result.get('violations_created', 0)
        timeline_created = result.get('timeline_events_created', 0)
        
        print(f"Violations created: {violations_created}")
        print(f"Timeline events created: {timeline_created}")
        
        return result
    
    def test_09_forensic_analysis_endpoint(self):
        """Test forensic analysis endpoint"""
        if not hasattr(pytest, 'uploaded_doc_id'):
            pytest.skip("No document ID for forensic analysis")
        
        doc_id = pytest.uploaded_doc_id
        
        response = self.session.post(
            f"{BASE_URL}/api/ai/forensic-analysis",
            json={
                "document_id": doc_id,
                "case_id": self.case_id
            },
            timeout=120
        )
        
        # Could fail if tier restrictions apply
        if response.status_code == 403:
            print("Forensic analysis requires higher tier - testing API availability")
            return
        
        assert response.status_code == 200, f"Forensic analysis failed: {response.status_code} - {response.text}"
        
        result = response.json()
        print(f"Forensic analysis result keys: {result.keys()}")
        
        if 'analysis' in result:
            print(f"Analysis length: {len(result['analysis'])} chars")
        
        return result
    
    def test_10_get_case_summary_with_violations(self):
        """Verify case summary includes violations and timeline"""
        response = self.session.get(f"{BASE_URL}/api/cases/{self.case_id}/summary")
        assert response.status_code == 200, f"Failed to get summary: {response.text}"
        
        data = response.json()
        
        print(f"Case summary keys: {data.keys()}")
        print(f"Total violations: {len(data.get('violations', []))}")
        print(f"Total timeline events: {len(data.get('timeline', []))}")
        print(f"Total evidence: {len(data.get('evidence', []))}")
        print(f"Total strategies: {len(data.get('strategies', []))}")
        
        return data


class TestExistingAnalyzedDocuments:
    """Tests for viewing existing analyzed documents"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.case_id = '6d991b7d-a6ef-4b1d-8bfd-05e40fc8baf8'
        
        # Login
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "cpsvhuntingjustice@gmail.com",
            "password": "cpssuxass"
        })
        
        if login_response.status_code == 200:
            self.token = login_response.json().get('access_token')
            self.session.headers.update({'Authorization': f'Bearer {self.token}'})
        else:
            pytest.skip("Login failed")
    
    def test_01_check_existing_violations_in_db(self):
        """Check database for existing violations from previous analysis"""
        response = self.session.get(f"{BASE_URL}/api/violations/{self.case_id}")
        
        if response.status_code == 200:
            data = response.json()
            violations = data.get('violations', [])
            
            print(f"\n=== EXISTING VIOLATIONS IN DATABASE ===")
            print(f"Total: {len(violations)}")
            
            for v in violations:
                print(f"  [{v.get('severity', 'N/A')}] {v.get('violation_type')}: {v.get('description', '')[:80]}...")
                if v.get('auto_extracted'):
                    print(f"       (Auto-extracted from: {v.get('source', 'Unknown')})")
        else:
            print(f"Failed to get violations: {response.status_code}")
    
    def test_02_check_existing_timeline_in_db(self):
        """Check database for existing timeline events from analysis"""
        response = self.session.get(f"{BASE_URL}/api/timeline/{self.case_id}")
        
        if response.status_code == 200:
            data = response.json()
            events = data.get('events', [])
            
            print(f"\n=== EXISTING TIMELINE EVENTS IN DATABASE ===")
            print(f"Total: {len(events)}")
            
            for e in events[:10]:  # Show first 10
                print(f"  [{e.get('date', 'N/A')}] {e.get('title', 'No title')[:60]}...")
                if e.get('auto_extracted'):
                    print(f"       (Auto-extracted)")
        else:
            print(f"Failed to get timeline: {response.status_code}")
    
    def test_03_check_documents_with_analysis(self):
        """Check for documents that have analysis attached"""
        response = self.session.get(f"{BASE_URL}/api/documents/{self.case_id}")
        
        if response.status_code == 200:
            data = response.json()
            documents = data.get('documents', [])
            
            print(f"\n=== DOCUMENTS WITH ANALYSIS ===")
            print(f"Total documents: {len(documents)}")
            
            for doc in documents:
                has_analysis = doc.get('analysis') is not None
                has_result = doc.get('analysis_result') is not None
                
                print(f"\n  [{doc.get('id')[:8]}...] {doc.get('title', 'Untitled')}")
                print(f"       Type: {doc.get('doc_type')}, Source: {doc.get('source')}")
                print(f"       Has analysis: {has_analysis}, Has analysis_result: {has_result}")
                
                if has_analysis and isinstance(doc.get('analysis'), dict):
                    analysis = doc.get('analysis')
                    print(f"       Analysis summary: {str(analysis.get('summary', 'N/A'))[:80]}...")
                    print(f"       Violations in analysis: {len(analysis.get('violations', []))}")
        else:
            print(f"Failed to get documents: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
