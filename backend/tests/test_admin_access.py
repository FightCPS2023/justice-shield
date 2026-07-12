"""
Test Admin Access Endpoints
Tests admin authentication and admin-only endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials from test_credentials.md
ADMIN_EMAIL = "cpsvhuntingjustice@gmail.com"
ADMIN_PASSWORD = "cpssuxass"


class TestAdminAccess:
    """Test admin authentication and admin endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        # Try login endpoint
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        print(f"Login response status: {response.status_code}")
        print(f"Login response: {response.text[:500] if response.text else 'empty'}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token") or data.get("token")
            if token:
                print(f"Got token: {token[:50]}...")
                return token
        
        pytest.skip(f"Admin login failed: {response.status_code} - {response.text}")
    
    def test_admin_login_success(self):
        """Test that admin user can login successfully"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        print(f"Login status: {response.status_code}")
        print(f"Login response: {response.text[:500] if response.text else 'empty'}")
        
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data or "token" in data, "No token in response"
        
        # Verify user info - email can be at top level or in user object
        email = data.get("email") or data.get("user", {}).get("email")
        assert email == ADMIN_EMAIL, f"Email mismatch: {email}"
        print(f"Admin user logged in: email={email}, tier={data.get('tier')}")
    
    def test_admin_stats_endpoint(self, admin_token):
        """Test GET /api/admin/stats returns 200 for admin user"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        
        print(f"Admin stats status: {response.status_code}")
        print(f"Admin stats response: {response.text[:500] if response.text else 'empty'}")
        
        assert response.status_code == 200, f"Admin stats failed: {response.status_code} - {response.text}"
        
        data = response.json()
        # Verify expected fields in stats
        assert "total_users" in data, "Missing total_users in stats"
        assert "total_cases" in data, "Missing total_cases in stats"
        assert "total_documents" in data, "Missing total_documents in stats"
        print(f"Admin stats: {data}")
    
    def test_admin_users_list(self, admin_token):
        """Test GET /api/admin/users returns users list with is_admin flag"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        
        print(f"Admin users status: {response.status_code}")
        print(f"Admin users response: {response.text[:1000] if response.text else 'empty'}")
        
        assert response.status_code == 200, f"Admin users failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "users" in data, "Missing users in response"
        assert "total" in data, "Missing total count in response"
        
        users = data["users"]
        assert isinstance(users, list), "Users should be a list"
        
        # Check that at least one user has is_admin flag
        admin_found = False
        for user in users:
            assert "email" in user, "User missing email field"
            assert "is_admin" in user, f"User {user.get('email')} missing is_admin flag"
            if user.get("email") == ADMIN_EMAIL:
                assert user.get("is_admin") == True, f"Admin user should have is_admin=True"
                admin_found = True
                print(f"Found admin user: {user}")
        
        print(f"Total users: {data['total']}, returned: {len(users)}")
        if admin_found:
            print("Admin user found in users list with is_admin=True")
    
    def test_admin_stats_without_auth(self):
        """Test that admin stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        print(f"Unauthenticated admin stats: {response.status_code}")
        
        # Should return 401 or 403
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_admin_users_without_auth(self):
        """Test that admin users list requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/users")
        print(f"Unauthenticated admin users: {response.status_code}")
        
        # Should return 401 or 403
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_admin_passcodes_endpoint(self, admin_token):
        """Test GET /api/admin/passcodes returns passcode list"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/passcodes", headers=headers)
        
        print(f"Admin passcodes status: {response.status_code}")
        print(f"Admin passcodes response: {response.text[:500] if response.text else 'empty'}")
        
        assert response.status_code == 200, f"Admin passcodes failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "passcodes" in data, "Missing passcodes in response"
        
        passcodes = data["passcodes"]
        assert isinstance(passcodes, list), "Passcodes should be a list"
        assert len(passcodes) > 0, "Should have at least one passcode"
        
        # Check passcode structure
        for pc in passcodes[:3]:  # Check first 3
            assert "code" in pc, "Passcode missing code field"
            assert "active" in pc, "Passcode missing active field"
            print(f"Passcode: {pc['code']}, active: {pc['active']}")
    
    def test_admin_redemptions_endpoint(self, admin_token):
        """Test GET /api/admin/redemptions returns redemption history"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/redemptions", headers=headers)
        
        print(f"Admin redemptions status: {response.status_code}")
        print(f"Admin redemptions response: {response.text[:500] if response.text else 'empty'}")
        
        assert response.status_code == 200, f"Admin redemptions failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "redemptions" in data, "Missing redemptions in response"
        assert "total" in data, "Missing total count in response"
    
    def test_admin_advocates_endpoint(self, admin_token):
        """Test GET /api/admin/advocates returns advocate applications"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/advocates", headers=headers)
        
        print(f"Admin advocates status: {response.status_code}")
        print(f"Admin advocates response: {response.text[:500] if response.text else 'empty'}")
        
        assert response.status_code == 200, f"Admin advocates failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "advocates" in data, "Missing advocates in response"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
