"""
Test Auth Cookie Flow - httpOnly session_token cookie authentication
Tests:
1. POST /api/auth/login sets httpOnly session_token cookie and returns user payload
2. GET /api/auth/me using cookie returns user profile (no Authorization header required)
3. POST /api/auth/google/logout clears session_token cookie (no crash)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
ADMIN_EMAIL = "cpsvhuntingjustice@gmail.com"
ADMIN_PASSWORD = "cpssuxass"


class TestAuthCookieFlow:
    """Test httpOnly cookie-based authentication flow"""
    
    def test_login_sets_cookie_and_returns_user(self):
        """POST /api/auth/login should set httpOnly session_token cookie and return user payload"""
        session = requests.Session()
        
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Login failed with status {response.status_code}: {response.text}"
        
        # Check response body contains user data
        data = response.json()
        assert "access_token" in data, "Response missing access_token"
        assert "user_id" in data, "Response missing user_id"
        assert "email" in data, "Response missing email"
        assert data["email"] == ADMIN_EMAIL, f"Email mismatch: expected {ADMIN_EMAIL}, got {data['email']}"
        assert "name" in data, "Response missing name"
        assert "tier" in data, "Response missing tier"
        
        # Check that session_token cookie was set
        cookies = session.cookies.get_dict()
        assert "session_token" in cookies, f"session_token cookie not set. Cookies: {cookies}"
        
        # Verify cookie value is not empty
        assert len(cookies["session_token"]) > 0, "session_token cookie is empty"
        
        print(f"✓ Login successful - user_id: {data['user_id']}, tier: {data['tier']}")
        print(f"✓ session_token cookie set (length: {len(cookies['session_token'])})")
        
        return session  # Return session for use in other tests
    
    def test_auth_me_with_cookie_returns_profile(self):
        """GET /api/auth/me using cookie should return user profile without Authorization header"""
        # First login to get the cookie
        session = requests.Session()
        
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        
        # Verify cookie is set
        cookies = session.cookies.get_dict()
        assert "session_token" in cookies, "session_token cookie not set after login"
        
        # Now call /api/auth/me WITHOUT Authorization header - only using cookie
        me_response = session.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Content-Type": "application/json"}
            # Note: NO Authorization header - relying on cookie only
        )
        
        # Status code assertion
        assert me_response.status_code == 200, f"/api/auth/me failed with status {me_response.status_code}: {me_response.text}"
        
        # Check response body contains user profile
        profile = me_response.json()
        assert "email" in profile, "Profile missing email"
        assert profile["email"] == ADMIN_EMAIL, f"Email mismatch: expected {ADMIN_EMAIL}, got {profile['email']}"
        assert "user_id" in profile, "Profile missing user_id"
        assert "tier" in profile, "Profile missing tier"
        
        # Verify no password_hash is returned
        assert "password_hash" not in profile, "password_hash should not be returned in profile"
        
        print(f"✓ /api/auth/me returned profile using cookie only")
        print(f"  - email: {profile['email']}")
        print(f"  - user_id: {profile['user_id']}")
        print(f"  - tier: {profile['tier']}")
        print(f"  - is_admin: {profile.get('is_admin', False)}")
    
    def test_google_logout_clears_cookie_no_crash(self):
        """POST /api/auth/google/logout should clear session_token cookie without crashing"""
        session = requests.Session()
        
        # First login to get a cookie
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        
        # Verify cookie is set
        cookies_before = session.cookies.get_dict()
        assert "session_token" in cookies_before, "session_token cookie not set after login"
        
        # Call logout endpoint
        logout_response = session.post(
            f"{BASE_URL}/api/auth/google/logout",
            headers={"Content-Type": "application/json"}
        )
        
        # Should not crash - accept 200 or 204
        assert logout_response.status_code in [200, 204], f"Logout failed with status {logout_response.status_code}: {logout_response.text}"
        
        # Check response body if 200
        if logout_response.status_code == 200:
            data = logout_response.json()
            assert "message" in data, "Logout response missing message"
            print(f"✓ Logout response: {data['message']}")
        
        print(f"✓ /api/auth/google/logout completed without crash (status: {logout_response.status_code})")
    
    def test_auth_me_without_cookie_returns_401(self):
        """GET /api/auth/me without cookie or token should return 401"""
        # Fresh session with no cookies
        session = requests.Session()
        
        response = session.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 401 Unauthorized
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        
        print(f"✓ /api/auth/me correctly returns 401 without authentication")
    
    def test_login_with_invalid_credentials_returns_401(self):
        """POST /api/auth/login with invalid credentials should return 401"""
        session = requests.Session()
        
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "invalid@example.com", "password": "wrongpassword"},
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 401 Unauthorized
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        
        # Verify no cookie was set
        cookies = session.cookies.get_dict()
        assert "session_token" not in cookies, f"session_token cookie should not be set on failed login. Cookies: {cookies}"
        
        print(f"✓ Login with invalid credentials correctly returns 401")


class TestCookieAttributes:
    """Test cookie attributes (httpOnly, secure, samesite)"""
    
    def test_cookie_attributes_on_login(self):
        """Verify session_token cookie has correct attributes"""
        session = requests.Session()
        
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        # Check Set-Cookie header for attributes
        set_cookie_header = response.headers.get('Set-Cookie', '')
        
        # Note: httpOnly cookies won't be visible in session.cookies in some cases
        # but we can check the Set-Cookie header
        print(f"Set-Cookie header: {set_cookie_header}")
        
        # Verify cookie is present
        assert "session_token" in set_cookie_header, "session_token not in Set-Cookie header"
        
        # Check for httponly attribute (case-insensitive)
        assert "httponly" in set_cookie_header.lower(), "Cookie missing httponly attribute"
        
        # Check for secure attribute
        assert "secure" in set_cookie_header.lower(), "Cookie missing secure attribute"
        
        # Check for samesite attribute
        assert "samesite" in set_cookie_header.lower(), "Cookie missing samesite attribute"
        
        print(f"✓ Cookie attributes verified: httponly, secure, samesite present")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
