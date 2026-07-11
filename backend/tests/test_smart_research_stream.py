"""
Test smart-research/stream endpoint - verifies streaming response and fallback handling
Tests:
1. Normal path: stream returns chunks and done=true
2. Fallback path: when LLM fails, returns fallback chunk with done=true and fallback=true

Note: Uses localhost:8001 for testing to avoid gateway timeout issues with external proxy.
The public URL may timeout due to Cloudflare/nginx proxy limits on long-running streams.
"""
import pytest
import requests
import json
import os

# Use localhost for reliable testing (external URL may timeout on long streams)
BASE_URL = "http://localhost:8001"

# Test credentials from test_credentials.md
TEST_EMAIL = "cpsvhuntingjustice@gmail.com"
TEST_PASSWORD = "cpssuxass"


class TestSmartResearchStream:
    """Tests for POST /api/ai/smart-research/stream endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        token = data.get("access_token") or data.get("token")
        assert token, f"No token in response: {data}"
        return token
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_stream_returns_chunks_and_done_true(self, auth_headers):
        """
        Test normal path: stream returns chunks and final event has done=true
        Uses a short query to get a quick response
        """
        payload = {
            "query": "4th Amendment",  # Short query for faster response
            "research_type": "comprehensive"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/smart-research/stream",
            json=payload,
            headers=auth_headers,
            stream=True,
            timeout=120  # AI responses can take time
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.headers.get("content-type", "").startswith("text/event-stream"), \
            f"Expected text/event-stream, got {response.headers.get('content-type')}"
        
        # Parse SSE events
        chunks_received = []
        final_event = None
        
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                data_str = line[6:]  # Remove "data: " prefix
                try:
                    event_data = json.loads(data_str)
                    chunks_received.append(event_data)
                    if event_data.get("done") is True:
                        final_event = event_data
                        break
                except json.JSONDecodeError:
                    continue
        
        # Assertions
        assert len(chunks_received) > 0, "No chunks received from stream"
        assert final_event is not None, "No final event with done=true received"
        assert final_event.get("done") is True, f"Final event done should be True: {final_event}"
        
        # Check that we got actual content (not just fallback)
        all_chunks = "".join([c.get("chunk", "") for c in chunks_received])
        assert len(all_chunks) > 50, f"Expected substantial content, got: {all_chunks[:100]}"
        
        print(f"SUCCESS: Received {len(chunks_received)} chunks, total length: {len(all_chunks)}")
        print(f"Final event: done={final_event.get('done')}, has_next_steps={bool(final_event.get('next_steps'))}")
    
    def test_stream_with_state_parameter(self, auth_headers):
        """
        Test stream with state parameter for jurisdiction-specific research
        """
        payload = {
            "query": "CPS removal procedures",
            "state": "TX",
            "research_type": "statutes"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/smart-research/stream",
            json=payload,
            headers=auth_headers,
            stream=True,
            timeout=180
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Parse SSE events
        final_event = None
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                try:
                    event_data = json.loads(line[6:])
                    if event_data.get("done") is True:
                        final_event = event_data
                        break
                except json.JSONDecodeError:
                    continue
        
        assert final_event is not None, "No final event received"
        assert final_event.get("done") is True, "Final event should have done=true"
        print(f"SUCCESS: State-specific research completed with done=true")
    
    def test_stream_fallback_structure(self, auth_headers):
        """
        Test that fallback response (if triggered) has correct structure:
        - done=true
        - fallback=true flag
        - chunk contains guidance text
        
        Note: This test verifies the fallback structure is correct when errors occur.
        In normal operation, the LLM should succeed and return regular chunks.
        """
        # This test verifies the code structure is correct
        # We can't easily force an LLM error, but we can verify the endpoint works
        payload = {
            "query": "test query",
            "research_type": "comprehensive"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/smart-research/stream",
            json=payload,
            headers=auth_headers,
            stream=True,
            timeout=180
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Parse all events
        all_events = []
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                try:
                    event_data = json.loads(line[6:])
                    all_events.append(event_data)
                except json.JSONDecodeError:
                    continue
        
        assert len(all_events) > 0, "No events received"
        
        # Find the final event
        final_event = None
        for event in all_events:
            if event.get("done") is True:
                final_event = event
                break
        
        assert final_event is not None, "No final event with done=true"
        
        # Check if it's a fallback or normal response
        if final_event.get("fallback") is True:
            # Fallback response - verify structure
            assert "error" in final_event, "Fallback should include error message"
            assert "chunk" in final_event, "Fallback should include chunk with guidance"
            chunk_content = final_event.get("chunk", "")
            assert "Ultimate CPS Defense AI" in chunk_content or "NOTICE" in chunk_content, \
                f"Fallback chunk should contain guidance text: {chunk_content[:200]}"
            print(f"FALLBACK TRIGGERED: Error={final_event.get('error')}")
            print(f"Fallback chunk preview: {chunk_content[:200]}...")
        else:
            # Normal response
            print(f"SUCCESS: Normal response completed (no fallback needed)")
            print(f"Final event has next_steps: {bool(final_event.get('next_steps'))}")
    
    def test_stream_requires_authentication(self):
        """Test that endpoint requires authentication"""
        payload = {
            "query": "test query",
            "research_type": "comprehensive"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/smart-research/stream",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403], \
            f"Expected 401/403 without auth, got {response.status_code}"
        print(f"SUCCESS: Endpoint correctly requires authentication (status={response.status_code})")
    
    def test_stream_validates_credits(self, auth_headers):
        """
        Test that endpoint checks AI credits before processing
        Note: With attorney tier, user should have credits available
        """
        payload = {
            "query": "brief test",
            "research_type": "comprehensive"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/smart-research/stream",
            json=payload,
            headers=auth_headers,
            stream=True,
            timeout=180
        )
        
        # Should succeed with valid credits (attorney tier has credits)
        assert response.status_code == 200, \
            f"Expected 200 with valid credits, got {response.status_code}: {response.text}"
        
        # Consume the stream
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                try:
                    event_data = json.loads(line[6:])
                    if event_data.get("done") is True:
                        break
                except json.JSONDecodeError:
                    continue
        
        print("SUCCESS: Credits check passed for attorney tier user")


class TestSmartResearchStreamEdgeCases:
    """Edge case tests for smart-research/stream"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        return data.get("access_token") or data.get("token")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_stream_with_empty_query(self, auth_headers):
        """Test behavior with empty query"""
        payload = {
            "query": "",
            "research_type": "comprehensive"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/smart-research/stream",
            json=payload,
            headers=auth_headers,
            stream=True,
            timeout=60
        )
        
        # Should either return 400/422 for validation error or process with fallback
        if response.status_code in [400, 422]:
            print(f"SUCCESS: Empty query rejected with status {response.status_code}")
        else:
            # If it processes, should still return done=true
            final_event = None
            for line in response.iter_lines(decode_unicode=True):
                if line and line.startswith("data: "):
                    try:
                        event_data = json.loads(line[6:])
                        if event_data.get("done") is True:
                            final_event = event_data
                            break
                    except json.JSONDecodeError:
                        continue
            
            assert final_event is not None, "Should receive final event even with empty query"
            print(f"SUCCESS: Empty query handled gracefully, done={final_event.get('done')}")
    
    def test_stream_with_different_research_types(self, auth_headers):
        """Test different research_type values"""
        research_types = ["comprehensive", "case_law", "statutes", "defense_strategy"]
        
        for research_type in research_types:
            payload = {
                "query": "parental rights",
                "research_type": research_type
            }
            
            response = requests.post(
                f"{BASE_URL}/api/ai/smart-research/stream",
                json=payload,
                headers=auth_headers,
                stream=True,
                timeout=180
            )
            
            assert response.status_code == 200, \
                f"Failed for research_type={research_type}: {response.status_code}"
            
            # Find final event
            final_event = None
            for line in response.iter_lines(decode_unicode=True):
                if line and line.startswith("data: "):
                    try:
                        event_data = json.loads(line[6:])
                        if event_data.get("done") is True:
                            final_event = event_data
                            break
                    except json.JSONDecodeError:
                        continue
            
            assert final_event is not None, f"No final event for research_type={research_type}"
            print(f"SUCCESS: research_type={research_type} completed with done=true")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
