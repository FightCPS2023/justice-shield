"""
Backend Health & Engine Endpoints Test - Iteration 28
Verifies backend health and all 4 engine modules after CSS/UI changes.
Tests: /api/health, /api/lawsuit-architect/complaints, /api/integrity-db/profiles,
       /api/vault/certificates, /api/political-strike/contacts, /api/auth/me
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "cpsvhuntingjustice@gmail.com"
TEST_PASSWORD = "cpssuxass"


class TestHealthCheck:
    """Health endpoint - no auth required"""
    
    def test_health_endpoint_returns_200(self):
        """Verify /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200, f"Health check failed: {response.status_code} - {response.text}"
        data = response.json()
        print(f"Health check response: {data}")
        assert "status" in data or "service" in data or "message" in data, "Health response missing expected fields"


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_login_returns_token(self):
        """Verify login returns valid JWT token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=10
        )
        assert response.status_code == 200, f"Login failed: {response.status_code} - {response.text}"
        data = response.json()
        assert "access_token" in data, "Login response missing access_token"
        assert len(data["access_token"]) > 0, "Access token is empty"
        print(f"Login successful, user_id: {data.get('user_id')}, tier: {data.get('tier')}")
        return data["access_token"]


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for authenticated tests"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=10
    )
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    return response.json().get("access_token")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestAuthMe:
    """Test /api/auth/me endpoint"""
    
    def test_auth_me_returns_user_data(self, auth_headers):
        """Verify /api/auth/me returns user data after login"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers=auth_headers,
            timeout=10
        )
        assert response.status_code == 200, f"Auth/me failed: {response.status_code} - {response.text}"
        data = response.json()
        assert "email" in data, "User data missing email"
        assert data["email"] == TEST_EMAIL, f"Email mismatch: {data['email']}"
        print(f"Auth/me response: email={data.get('email')}, tier={data.get('tier')}")


class TestLawsuitArchitect:
    """Lawsuit Architect engine endpoint tests"""
    
    def test_complaints_endpoint_returns_200(self, auth_headers):
        """Verify /api/lawsuit-architect/complaints returns 200"""
        response = requests.get(
            f"{BASE_URL}/api/lawsuit-architect/complaints",
            headers=auth_headers,
            timeout=10
        )
        assert response.status_code == 200, f"Lawsuit Architect complaints failed: {response.status_code} - {response.text}"
        data = response.json()
        assert "complaints" in data, "Response missing 'complaints' key"
        print(f"Lawsuit Architect: {len(data.get('complaints', []))} complaints found")


class TestIntegrityDB:
    """Integrity Database engine endpoint tests"""
    
    def test_profiles_endpoint_returns_200(self, auth_headers):
        """Verify /api/integrity-db/profiles returns 200"""
        response = requests.get(
            f"{BASE_URL}/api/integrity-db/profiles",
            headers=auth_headers,
            timeout=10
        )
        assert response.status_code == 200, f"Integrity DB profiles failed: {response.status_code} - {response.text}"
        data = response.json()
        assert "profiles" in data, "Response missing 'profiles' key"
        print(f"Integrity DB: {len(data.get('profiles', []))} profiles found")


class TestImmutableVault:
    """Immutable Vault engine endpoint tests"""
    
    def test_certificates_endpoint_returns_200(self, auth_headers):
        """Verify /api/vault/certificates returns 200"""
        response = requests.get(
            f"{BASE_URL}/api/vault/certificates",
            headers=auth_headers,
            timeout=10
        )
        assert response.status_code == 200, f"Vault certificates failed: {response.status_code} - {response.text}"
        data = response.json()
        assert "certificates" in data, "Response missing 'certificates' key"
        print(f"Immutable Vault: {len(data.get('certificates', []))} certificates found")


class TestPoliticalStrike:
    """Political Strike engine endpoint tests"""
    
    def test_contacts_endpoint_returns_200(self, auth_headers):
        """Verify /api/political-strike/contacts returns 200"""
        response = requests.get(
            f"{BASE_URL}/api/political-strike/contacts",
            headers=auth_headers,
            timeout=10
        )
        assert response.status_code == 200, f"Political Strike contacts failed: {response.status_code} - {response.text}"
        data = response.json()
        assert "contacts" in data, "Response missing 'contacts' key"
        print(f"Political Strike: {len(data.get('contacts', []))} contacts found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
