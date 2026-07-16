"""
Test Suite for 'The Punishers' Engine Modules
- Lawsuit Architect: POST /api/lawsuit-architect/generate, GET /api/lawsuit-architect/complaints
- Integrity Database: create profile, log violation, retrieve risk metrics
- Immutable Vault: generate key, seal evidence with AES-256, list certificates
- Political Strike: fetch contacts, generate dossier, dispatch simulated report
"""
import pytest
import requests
import os
import base64
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "cpsvhuntingjustice@gmail.com"
TEST_PASSWORD = "cpssuxass"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for all tests"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token") or data.get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


# ============================================================================
# LAWSUIT ARCHITECT TESTS
# ============================================================================
class TestLawsuitArchitect:
    """Tests for Lawsuit Architect - 42 U.S.C. §1983 complaint generator"""
    
    created_complaint_id = None
    
    def test_generate_complaint_returns_markdown_and_pdf(self, auth_headers):
        """POST /api/lawsuit-architect/generate returns markdown + pdf_base64"""
        payload = {
            "plaintiff": {
                "name": "TEST_John Doe",
                "address": "123 Test Street",
                "city": "Test City",
                "state": "TX",
                "zip": "75001",
                "phone": "555-123-4567",
                "email": "test@example.com"
            },
            "defendant": {
                "name": "TEST_Jane Smith",
                "badge": "CW-12345",
                "title": "Caseworker",
                "employer": "Test CPS Agency"
            },
            "agency": {
                "name": "Test Child Protective Services",
                "address": "456 Agency Blvd",
                "city": "Test City",
                "state": "TX",
                "zip": "75002"
            },
            "incident": {
                "date": "2024-01-15",
                "location": "123 Test Street, Test City, TX",
                "district": "Northern District of Texas"
            },
            "violations": [
                {
                    "matched_phrase": "Unlawful entry",
                    "amendments": ["4th Amendment"],
                    "legal_citations": ["42 U.S.C. §1983"],
                    "description": "Defendant entered home without warrant or consent"
                },
                {
                    "matched_phrase": "Due process violation",
                    "amendments": ["14th Amendment"],
                    "legal_citations": ["42 U.S.C. §1983"],
                    "description": "Defendant removed children without proper hearing"
                }
            ],
            "bond_details": {
                "bond_number": "BOND-123456",
                "surety_company": "Test Surety Co",
                "coverage_amount": "$100,000",
                "effective_dates": "2024-01-01 to 2025-01-01",
                "oath_on_file": True
            },
            "children": {
                "count": 2,
                "ages": ["5", "8"]
            },
            "transcripts": ["Defendant stated: 'I don't need a warrant'"],
            "output_format": "pdf"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/lawsuit-architect/generate",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify response structure
        assert "complaint_id" in data, "Response missing complaint_id"
        assert "generated_document" in data, "Response missing generated_document (markdown)"
        assert "pdf_base64" in data, "Response missing pdf_base64"
        assert "output_format" in data, "Response missing output_format"
        
        # Verify markdown content
        markdown = data["generated_document"]
        assert "UNITED STATES DISTRICT COURT" in markdown, "Markdown missing court header"
        assert "42 U.S.C. §1983" in markdown, "Markdown missing §1983 reference"
        assert "TEST_John Doe" in markdown, "Markdown missing plaintiff name"
        assert "TEST_Jane Smith" in markdown, "Markdown missing defendant name"
        assert "Northern District of Texas" in markdown, "Markdown missing district"
        
        # Verify PDF is valid base64
        pdf_base64 = data["pdf_base64"]
        assert pdf_base64 is not None, "pdf_base64 should not be None"
        try:
            pdf_bytes = base64.b64decode(pdf_base64)
            assert len(pdf_bytes) > 0, "PDF bytes should not be empty"
            # PDF files start with %PDF
            assert pdf_bytes[:4] == b'%PDF', "PDF should start with %PDF header"
        except Exception as e:
            pytest.fail(f"Failed to decode pdf_base64: {e}")
        
        # Store complaint_id for later tests
        TestLawsuitArchitect.created_complaint_id = data["complaint_id"]
        print(f"Created complaint: {data['complaint_id']}")
    
    def test_list_complaints(self, auth_headers):
        """GET /api/lawsuit-architect/complaints returns list of complaints"""
        response = requests.get(
            f"{BASE_URL}/api/lawsuit-architect/complaints",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "complaints" in data, "Response missing complaints array"
        assert isinstance(data["complaints"], list), "complaints should be a list"
        
        # Verify our created complaint is in the list
        if TestLawsuitArchitect.created_complaint_id:
            complaint_ids = [c.get("complaint_id") for c in data["complaints"]]
            assert TestLawsuitArchitect.created_complaint_id in complaint_ids, \
                f"Created complaint {TestLawsuitArchitect.created_complaint_id} not found in list"
        
        print(f"Found {len(data['complaints'])} complaints")
    
    def test_get_single_complaint(self, auth_headers):
        """GET /api/lawsuit-architect/complaints/{id} returns specific complaint"""
        if not TestLawsuitArchitect.created_complaint_id:
            pytest.skip("No complaint created to retrieve")
        
        response = requests.get(
            f"{BASE_URL}/api/lawsuit-architect/complaints/{TestLawsuitArchitect.created_complaint_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("complaint_id") == TestLawsuitArchitect.created_complaint_id
        assert "plaintiff" in data
        assert "defendant" in data
        assert "generated_document" in data
    
    def test_delete_complaint(self, auth_headers):
        """DELETE /api/lawsuit-architect/complaints/{id} removes complaint"""
        if not TestLawsuitArchitect.created_complaint_id:
            pytest.skip("No complaint created to delete")
        
        response = requests.delete(
            f"{BASE_URL}/api/lawsuit-architect/complaints/{TestLawsuitArchitect.created_complaint_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        
        # Verify deletion
        verify_response = requests.get(
            f"{BASE_URL}/api/lawsuit-architect/complaints/{TestLawsuitArchitect.created_complaint_id}",
            headers=auth_headers
        )
        assert verify_response.status_code == 404, "Deleted complaint should return 404"


# ============================================================================
# INTEGRITY DATABASE TESTS
# ============================================================================
class TestIntegrityDatabase:
    """Tests for Integrity Database - Caseworker tracking"""
    
    created_profile_id = None
    created_violation_id = None
    
    def test_create_profile(self, auth_headers):
        """POST /api/integrity-db/profiles creates caseworker profile"""
        payload = {
            "name": "TEST_Caseworker Smith",
            "badge_number": "CW-TEST-001",
            "agency": "Test CPS Agency",
            "region": "North Texas",
            "supervisor": "Test Supervisor",
            "phone": "555-987-6543",
            "email": "test.caseworker@agency.gov",
            "notes": "Test profile for automated testing"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/integrity-db/profiles",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "profile_id" in data, "Response missing profile_id"
        assert "profile" in data, "Response missing profile object"
        
        profile = data["profile"]
        assert profile["name"] == payload["name"]
        assert profile["badge_number"] == payload["badge_number"]
        assert profile["agency"] == payload["agency"]
        
        TestIntegrityDatabase.created_profile_id = data["profile_id"]
        print(f"Created profile: {data['profile_id']}")
    
    def test_log_violation(self, auth_headers):
        """POST /api/integrity-db/profiles/{id}/violations logs a violation"""
        if not TestIntegrityDatabase.created_profile_id:
            pytest.skip("No profile created to log violation")
        
        payload = {
            "violation_type": "Unlawful Home Entry (4th)",
            "incident_date": "2024-06-15T10:30:00Z",
            "description": "Entered home without warrant or consent during investigation",
            "section_1983_link": "complaint-12345",
            "evidence_hash": "sha256:abc123def456",
            "reported_by": "test@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/integrity-db/profiles/{TestIntegrityDatabase.created_profile_id}/violations",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        assert "violation" in data
        
        violation = data["violation"]
        assert violation["violation_type"] == payload["violation_type"]
        assert violation["description"] == payload["description"]
        assert "violation_id" in violation
        
        TestIntegrityDatabase.created_violation_id = violation["violation_id"]
        print(f"Logged violation: {violation['violation_id']}")
    
    def test_log_second_violation_for_risk_metrics(self, auth_headers):
        """Log additional violation to test risk metrics calculation"""
        if not TestIntegrityDatabase.created_profile_id:
            pytest.skip("No profile created")
        
        payload = {
            "violation_type": "Due Process Violation (14th)",
            "incident_date": "2024-07-20T14:00:00Z",
            "description": "Removed children without proper hearing or notice",
            "section_1983_link": None,
            "evidence_hash": None,
            "reported_by": None
        }
        
        response = requests.post(
            f"{BASE_URL}/api/integrity-db/profiles/{TestIntegrityDatabase.created_profile_id}/violations",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_get_risk_metrics(self, auth_headers):
        """GET /api/integrity-db/profiles/{id}/risk-metrics returns risk assessment"""
        if not TestIntegrityDatabase.created_profile_id:
            pytest.skip("No profile created")
        
        response = requests.get(
            f"{BASE_URL}/api/integrity-db/profiles/{TestIntegrityDatabase.created_profile_id}/risk-metrics",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify risk metrics structure
        assert "total_violations" in data, "Missing total_violations"
        assert "constitutional_violations" in data, "Missing constitutional_violations"
        assert "constitutional_strike_rate" in data, "Missing constitutional_strike_rate"
        assert "verified_violations" in data, "Missing verified_violations"
        assert "section_1983_notices" in data, "Missing section_1983_notices"
        assert "recency_score" in data, "Missing recency_score"
        assert "risk_level" in data, "Missing risk_level"
        
        # Verify values make sense
        assert data["total_violations"] >= 2, "Should have at least 2 violations"
        assert data["constitutional_violations"] >= 2, "Both violations are constitutional"
        assert data["risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
        
        print(f"Risk metrics: {data}")
    
    def test_list_profiles(self, auth_headers):
        """GET /api/integrity-db/profiles returns list of profiles"""
        response = requests.get(
            f"{BASE_URL}/api/integrity-db/profiles",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "profiles" in data
        assert isinstance(data["profiles"], list)
        
        if TestIntegrityDatabase.created_profile_id:
            profile_ids = [p.get("profile_id") for p in data["profiles"]]
            assert TestIntegrityDatabase.created_profile_id in profile_ids
    
    def test_search_profiles(self, auth_headers):
        """GET /api/integrity-db/search searches profiles"""
        response = requests.get(
            f"{BASE_URL}/api/integrity-db/search?q=TEST_Caseworker",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "profiles" in data
    
    def test_verify_violation(self, auth_headers):
        """PUT /api/integrity-db/violations/{id}/verify marks violation as verified"""
        if not TestIntegrityDatabase.created_violation_id:
            pytest.skip("No violation created to verify")
        
        response = requests.put(
            f"{BASE_URL}/api/integrity-db/violations/{TestIntegrityDatabase.created_violation_id}/verify",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
    
    def test_delete_profile(self, auth_headers):
        """DELETE /api/integrity-db/profiles/{id} removes profile"""
        if not TestIntegrityDatabase.created_profile_id:
            pytest.skip("No profile created to delete")
        
        response = requests.delete(
            f"{BASE_URL}/api/integrity-db/profiles/{TestIntegrityDatabase.created_profile_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify deletion
        verify_response = requests.get(
            f"{BASE_URL}/api/integrity-db/profiles/{TestIntegrityDatabase.created_profile_id}",
            headers=auth_headers
        )
        assert verify_response.status_code == 404


# ============================================================================
# IMMUTABLE VAULT TESTS
# ============================================================================
class TestImmutableVault:
    """Tests for Immutable Vault - AES-256 encrypted evidence storage"""
    
    generated_key = None
    created_vault_id = None
    certificate_hash = None
    file_sha256 = None
    file_md5 = None
    
    def test_generate_key(self, auth_headers):
        """POST /api/vault/generate-key generates AES-256 key"""
        response = requests.post(
            f"{BASE_URL}/api/vault/generate-key",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "key_id" in data, "Response missing key_id"
        assert "key_b64" in data, "Response missing key_b64"
        
        # Verify key is valid base64 and correct length for AES-256
        key_b64 = data["key_b64"]
        try:
            key_bytes = base64.b64decode(key_b64)
            assert len(key_bytes) == 32, f"AES-256 key should be 32 bytes, got {len(key_bytes)}"
        except Exception as e:
            pytest.fail(f"Failed to decode key_b64: {e}")
        
        TestImmutableVault.generated_key = key_b64
        print(f"Generated key: {data['key_id']}")
    
    def test_seal_evidence(self, auth_headers):
        """POST /api/vault/seal encrypts and stores evidence"""
        if not TestImmutableVault.generated_key:
            pytest.skip("No key generated")
        
        # Create test file content
        test_content = b"TEST EVIDENCE FILE - This is test evidence for automated testing of the Immutable Vault system."
        
        # Calculate expected hashes
        import hashlib
        TestImmutableVault.file_sha256 = hashlib.sha256(test_content).hexdigest()
        TestImmutableVault.file_md5 = hashlib.md5(test_content).hexdigest()
        
        # Prepare multipart form data
        files = {
            'file': ('test_evidence.txt', io.BytesIO(test_content), 'text/plain')
        }
        data = {
            'key_b64': TestImmutableVault.generated_key,
            'latitude': '32.7767',
            'longitude': '-96.7970',
            'altitude_m': '150.5',
            'accuracy_m': '5.0',
            'device_id': 'TEST_DEVICE_001'
        }
        
        # Remove Content-Type from headers for multipart
        headers = {"Authorization": auth_headers["Authorization"]}
        
        response = requests.post(
            f"{BASE_URL}/api/vault/seal",
            files=files,
            data=data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        cert = response.json()
        
        # Verify certificate structure
        assert "vault_id" in cert, "Missing vault_id"
        assert "vault_version" in cert, "Missing vault_version"
        assert "created_at" in cert, "Missing created_at"
        assert "proof_of_custody" in cert, "Missing proof_of_custody"
        assert "encrypted_payload_meta" in cert, "Missing encrypted_payload_meta"
        assert "upload_result" in cert, "Missing upload_result"
        assert "gps_coordinates" in cert, "Missing gps_coordinates"
        assert "certificate_hash" in cert, "Missing certificate_hash"
        
        # Verify proof of custody
        poc = cert["proof_of_custody"]
        assert poc["sha256_hash"] == TestImmutableVault.file_sha256, "SHA256 hash mismatch"
        assert poc["md5_hash"] == TestImmutableVault.file_md5, "MD5 hash mismatch"
        assert poc["file_name"] == "test_evidence.txt"
        
        # Verify encryption metadata
        enc_meta = cert["encrypted_payload_meta"]
        assert enc_meta["algorithm"] == "AES-256-GCM", "Should use AES-256-GCM"
        assert "nonce_b64" in enc_meta
        assert "aad_b64" in enc_meta
        
        # Verify GPS coordinates
        gps = cert["gps_coordinates"]
        assert gps["latitude"] == 32.7767
        assert gps["longitude"] == -96.7970
        
        TestImmutableVault.created_vault_id = cert["vault_id"]
        TestImmutableVault.certificate_hash = cert["certificate_hash"]
        print(f"Sealed evidence: {cert['vault_id']}")
    
    def test_list_certificates(self, auth_headers):
        """GET /api/vault/certificates returns list of certificates"""
        response = requests.get(
            f"{BASE_URL}/api/vault/certificates",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "certificates" in data
        assert isinstance(data["certificates"], list)
        
        if TestImmutableVault.created_vault_id:
            vault_ids = [c.get("vault_id") for c in data["certificates"]]
            assert TestImmutableVault.created_vault_id in vault_ids
        
        print(f"Found {len(data['certificates'])} certificates")
    
    def test_get_single_certificate(self, auth_headers):
        """GET /api/vault/certificates/{id} returns specific certificate"""
        if not TestImmutableVault.created_vault_id:
            pytest.skip("No vault created")
        
        response = requests.get(
            f"{BASE_URL}/api/vault/certificates/{TestImmutableVault.created_vault_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        cert = response.json()
        assert cert.get("vault_id") == TestImmutableVault.created_vault_id
    
    def test_verify_certificate(self, auth_headers):
        """POST /api/vault/verify verifies certificate integrity"""
        if not TestImmutableVault.certificate_hash:
            pytest.skip("No certificate to verify")
        
        payload = {
            "certificate_hash": TestImmutableVault.certificate_hash,
            "file_sha256": TestImmutableVault.file_sha256,
            "file_md5": TestImmutableVault.file_md5
        }
        
        response = requests.post(
            f"{BASE_URL}/api/vault/verify",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "verified" in data
        assert data["verified"] == True, "Certificate should verify successfully"
        assert data["expected_sha256"] == TestImmutableVault.file_sha256
        assert data["expected_md5"] == TestImmutableVault.file_md5


# ============================================================================
# POLITICAL STRIKE TESTS
# ============================================================================
class TestPoliticalStrike:
    """Tests for Political Strike - Mass escalation engine"""
    
    created_dossier_id = None
    contact_ids = []
    dispatch_report_id = None
    
    def test_fetch_contacts(self, auth_headers):
        """GET /api/political-strike/contacts returns political contacts"""
        response = requests.get(
            f"{BASE_URL}/api/political-strike/contacts",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "contacts" in data
        assert isinstance(data["contacts"], list)
        
        # Store some contact IDs for dispatch test
        if data["contacts"]:
            TestPoliticalStrike.contact_ids = [c.get("contact_id") for c in data["contacts"][:3] if c.get("contact_id")]
        
        print(f"Found {len(data['contacts'])} contacts")
    
    def test_fetch_contacts_by_state(self, auth_headers):
        """GET /api/political-strike/contacts?state=TX filters by state"""
        response = requests.get(
            f"{BASE_URL}/api/political-strike/contacts?state=TX",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "contacts" in data
        
        # All returned contacts should be from TX
        for contact in data["contacts"]:
            if contact.get("state"):
                assert contact["state"] == "TX", f"Expected TX, got {contact['state']}"
    
    def test_generate_dossier(self, auth_headers):
        """POST /api/political-strike/generate-dossier creates corruption dossier"""
        payload = {
            "case_title": "TEST_Constitutional Rights Violation Case",
            "caseworker_name": "TEST_Jane Doe",
            "agency": "Test CPS Agency",
            "violations": [
                "Unlawful home entry without warrant (4th Amendment)",
                "Removal of children without due process (14th Amendment)",
                "Retaliation against parent for exercising rights (1st Amendment)"
            ],
            "vault_refs": ["vault_abc123", "vault_def456"],
            "foia_status": "Filed 2024-01-15, awaiting response",
            "section_1983_status": "Served 2024-02-01",
            "narrative": "This case involves systematic constitutional violations by CPS caseworkers."
        }
        
        response = requests.post(
            f"{BASE_URL}/api/political-strike/generate-dossier",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "dossier_id" in data, "Response missing dossier_id"
        assert "document" in data, "Response missing document"
        
        # Verify document content
        doc = data["document"]
        assert "JUSTICE SHIELD — POLITICAL STRIKE ENGINE" in doc
        assert "TEST_Constitutional Rights Violation Case" in doc
        assert "TEST_Jane Doe" in doc
        assert "4th Amendment" in doc
        assert "14th Amendment" in doc
        
        TestPoliticalStrike.created_dossier_id = data["dossier_id"]
        print(f"Created dossier: {data['dossier_id']}")
    
    def test_list_dossiers(self, auth_headers):
        """GET /api/political-strike/dossiers returns list of dossiers"""
        response = requests.get(
            f"{BASE_URL}/api/political-strike/dossiers",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "dossiers" in data
        assert isinstance(data["dossiers"], list)
        
        if TestPoliticalStrike.created_dossier_id:
            dossier_ids = [d.get("dossier_id") for d in data["dossiers"]]
            assert TestPoliticalStrike.created_dossier_id in dossier_ids
    
    def test_get_single_dossier(self, auth_headers):
        """GET /api/political-strike/dossiers/{id} returns specific dossier"""
        if not TestPoliticalStrike.created_dossier_id:
            pytest.skip("No dossier created")
        
        response = requests.get(
            f"{BASE_URL}/api/political-strike/dossiers/{TestPoliticalStrike.created_dossier_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("dossier_id") == TestPoliticalStrike.created_dossier_id
    
    def test_dispatch_simulated_report(self, auth_headers):
        """POST /api/political-strike/dispatch sends simulated dispatch"""
        if not TestPoliticalStrike.created_dossier_id:
            pytest.skip("No dossier created")
        
        # Use contact IDs if available, otherwise use dummy IDs
        target_ids = TestPoliticalStrike.contact_ids if TestPoliticalStrike.contact_ids else ["contact_test1", "contact_test2"]
        
        payload = {
            "dossier_id": TestPoliticalStrike.created_dossier_id,
            "target_ids": target_ids
        }
        
        response = requests.post(
            f"{BASE_URL}/api/political-strike/dispatch",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "report_id" in data, "Response missing report_id"
        assert "status" in data, "Response missing status"
        assert data["status"] == "SIMULATED", "Status should be SIMULATED"
        assert "targets" in data, "Response missing targets"
        
        # Verify targets have simulated status
        for target in data["targets"]:
            assert target.get("status") == "SIMULATED"
            assert target.get("transport") == "SIMULATED"
        
        TestPoliticalStrike.dispatch_report_id = data["report_id"]
        print(f"Dispatch report: {data['report_id']}")
    
    def test_get_dispatch_report(self, auth_headers):
        """GET /api/political-strike/dispatch-reports/{id} returns dispatch report"""
        if not TestPoliticalStrike.dispatch_report_id:
            pytest.skip("No dispatch report created")
        
        response = requests.get(
            f"{BASE_URL}/api/political-strike/dispatch-reports/{TestPoliticalStrike.dispatch_report_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("report_id") == TestPoliticalStrike.dispatch_report_id
        assert data.get("status") == "SIMULATED"


# ============================================================================
# AUTHENTICATION TESTS
# ============================================================================
class TestAuthentication:
    """Verify auth is required for all endpoints"""
    
    def test_lawsuit_architect_requires_auth(self):
        """Lawsuit Architect endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/lawsuit-architect/complaints")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_integrity_db_requires_auth(self):
        """Integrity DB endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/integrity-db/profiles")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_vault_requires_auth(self):
        """Vault endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/vault/certificates")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_political_strike_requires_auth(self):
        """Political Strike endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/political-strike/contacts")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
