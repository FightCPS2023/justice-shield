"""
Tests for new CPS Punisher features:
1. AI Chat Streaming endpoint (SSE)
2. Google OAuth session processing
3. Verify existing email/password auth still works
"""
import pytest
import requests
import os
import json
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "strategytester@test.com"
TEST_PASSWORD = "Test123!"


class TestExistingAuth:
    """Verify existing email/password authentication still works"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert data["email"] == TEST_EMAIL
        assert "user_id" in data
        print(f"✓ Login successful for {data['email']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@test.com", "password": "wrongpass"}
        )
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected with 401")
    
    def test_signup_new_user(self):
        """Test user signup"""
        import uuid
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json={
                "email": unique_email,
                "password": "TestPassword123!",
                "name": "Test User"
            }
        )
        assert response.status_code == 200, f"Signup failed: {response.text}"
        
        data = response.json()
        assert data["email"] == unique_email
        assert "access_token" in data
        print(f"✓ Signup successful for {unique_email}")
    
    def test_protected_endpoint_without_token(self):
        """Test that protected endpoints require auth"""
        response = requests.get(f"{BASE_URL}/api/cases")
        assert response.status_code == 401
        print("✓ Protected endpoints correctly require authentication")


class TestGoogleOAuthSession:
    """Test Google OAuth session endpoint"""
    
    def test_google_session_missing_session_id(self):
        """Test endpoint requires session_id"""
        response = requests.post(
            f"{BASE_URL}/api/auth/google/session",
            json={}
        )
        assert response.status_code == 400
        assert "session_id" in response.json().get("detail", "").lower()
        print("✓ Google session endpoint requires session_id parameter")
    
    def test_google_session_invalid_session_id(self):
        """Test endpoint rejects invalid session IDs"""
        response = requests.post(
            f"{BASE_URL}/api/auth/google/session",
            json={"session_id": "invalid-test-session-123"}
        )
        # Should return 500 (auth service error) or 401 (invalid session)
        assert response.status_code in [401, 500], f"Unexpected status: {response.status_code}"
        print("✓ Invalid session ID correctly rejected")
    
    def test_google_logout_endpoint_exists(self):
        """Test logout endpoint exists and works"""
        response = requests.post(f"{BASE_URL}/api/auth/google/logout")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✓ Google logout endpoint works")


class TestAIChatStreaming:
    """Test AI Chat Streaming endpoint (SSE)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_streaming_endpoint_requires_auth(self):
        """Test streaming endpoint requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/ai/chat/stream",
            json={"message": "test"}
        )
        assert response.status_code == 401
        print("✓ Streaming endpoint requires authentication")
    
    def test_streaming_response_format(self):
        """Test streaming endpoint returns SSE format"""
        response = requests.post(
            f"{BASE_URL}/api/ai/chat/stream",
            json={
                "message": "What is the 4th amendment?",
                "context_type": "general"
            },
            headers=self.headers,
            stream=True,
            timeout=60
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")
        print("✓ Streaming endpoint returns text/event-stream content type")
        
        # Read first few chunks to verify SSE format
        chunks_received = 0
        full_content = ""
        
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                try:
                    data = json.loads(line[6:])  # Remove "data: " prefix
                    
                    if "chunk" in data:
                        chunks_received += 1
                        full_content += data.get("chunk", "")
                    
                    if data.get("done"):
                        print(f"✓ Received {chunks_received} chunks, stream completed")
                        break
                        
                except json.JSONDecodeError:
                    continue
            
            # Stop after receiving enough chunks to verify format
            if chunks_received >= 10 and not full_content:
                break
        
        assert chunks_received > 0, "No SSE chunks received"
        print(f"✓ Streaming works: received {chunks_received} chunks")
        print(f"✓ Content sample: {full_content[:100]}...")
    
    def test_streaming_with_case_context(self):
        """Test streaming works with case_id context"""
        # First get user's cases
        cases_response = requests.get(
            f"{BASE_URL}/api/cases",
            headers=self.headers
        )
        cases = cases_response.json().get("cases", [])
        
        case_id = cases[0]["id"] if cases else None
        
        response = requests.post(
            f"{BASE_URL}/api/ai/chat/stream",
            json={
                "message": "Help me understand my case",
                "context_type": "defense",
                "case_id": case_id
            },
            headers=self.headers,
            stream=True,
            timeout=60
        )
        assert response.status_code == 200
        print(f"✓ Streaming works with case context (case_id: {case_id})")
    
    def test_non_streaming_chat_still_works(self):
        """Verify the non-streaming /api/ai/chat endpoint still works"""
        response = requests.post(
            f"{BASE_URL}/api/ai/chat",
            json={
                "message": "What is CPS?",
                "context_type": "general"
            },
            headers=self.headers,
            timeout=90
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "session_id" in data
        assert len(data["response"]) > 50
        print("✓ Non-streaming chat endpoint still works")
        print(f"✓ Response length: {len(data['response'])} chars")


class TestStreamingEdgeCases:
    """Test edge cases for streaming endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_streaming_with_session_id(self):
        """Test streaming maintains session across calls"""
        # First call - get session_id
        response1 = requests.post(
            f"{BASE_URL}/api/ai/chat/stream",
            json={"message": "Hello", "context_type": "general"},
            headers=self.headers,
            stream=True,
            timeout=60
        )
        
        session_id = None
        for line in response1.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                try:
                    data = json.loads(line[6:])
                    if data.get("session_id"):
                        session_id = data["session_id"]
                        break
                except Exception:
                    continue
        
        assert session_id is not None, "No session_id returned"
        print(f"✓ Session ID returned: {session_id[:20]}...")
        
        # Second call with session_id
        response2 = requests.post(
            f"{BASE_URL}/api/ai/chat/stream",
            json={
                "message": "Continue our conversation",
                "session_id": session_id,
                "context_type": "general"
            },
            headers=self.headers,
            stream=True,
            timeout=60
        )
        assert response2.status_code == 200
        print("✓ Streaming maintains session across calls")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
