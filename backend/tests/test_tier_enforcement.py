"""
TEST: Tier Enforcement Testing for CPS Punisher
Tests that tier-gated endpoints correctly enforce access control:
- Free tier: limited access, blocked from Essential/Professional/Attorney endpoints
- Enterprise tier: full access to all endpoints
- Passcode redemption for tier upgrade
- Case limit enforcement for free users (1 case max)
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Tier enforcement mapping based on server.py analysis
# free(0) < essential(1) < professional(2) < attorney(3) < enterprise(4)

class TestTierEnforcementFreeUser:
    """Test tier enforcement for a free tier user"""
    
    @pytest.fixture(scope="class")
    def free_user(self):
        """Create a free tier test user and return credentials"""
        unique_id = str(uuid.uuid4())[:8]
        email = f"TEST_free_tier_{unique_id}@test.com"
        password = "TestPass123!"
        name = "Free Tier Test User"
        
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json={"email": email, "password": password, "name": name, "state": "CA"}
        )
        
        assert response.status_code == 200, f"Signup failed: {response.text}"
        data = response.json()
        assert data.get("tier") == "free", f"New user should be free tier, got: {data.get('tier')}"
        
        return {
            "email": email,
            "password": password,
            "token": data["access_token"],
            "user_id": data["user_id"]
        }
    
    def test_01_free_user_tier_status(self, free_user):
        """Test 1: Verify tier-status endpoint returns tier='free' with correct limits"""
        response = requests.get(
            f"{BASE_URL}/api/auth/tier-status",
            headers={"Authorization": f"Bearer {free_user['token']}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify tier info
        assert data["tier"] == "free", f"Expected tier 'free', got: {data['tier']}"
        assert data["tier_level"] == 0, f"Expected tier_level 0, got: {data['tier_level']}"
        
        # Verify limits match free tier: 5 docs, 10 AI credits, 1 case
        limits = data["limits"]
        assert limits["docs_per_month"] == 5, f"Expected 5 docs/month, got: {limits['docs_per_month']}"
        assert limits["ai_credits"] == 10, f"Expected 10 AI credits, got: {limits['ai_credits']}"
        assert limits["cases_max"] == 1, f"Expected 1 case max, got: {limits['cases_max']}"
        
        print(f"✓ Free tier status verified: {data['tier']} with limits: {limits}")
    
    def test_02_free_user_can_access_cases(self, free_user):
        """Test 2: Free user can access GET /api/cases (free-tier endpoint)"""
        response = requests.get(
            f"{BASE_URL}/api/cases",
            headers={"Authorization": f"Bearer {free_user['token']}"}
        )
        
        assert response.status_code == 200, f"Free user should access /api/cases, got: {response.status_code}"
        print("✓ Free user can access GET /api/cases")
    
    def test_03_free_user_can_access_rights_guide(self, free_user):
        """Test 3: Free user can access GET /api/rights-guide (free-tier endpoint)"""
        response = requests.get(
            f"{BASE_URL}/api/rights-guide",
            headers={"Authorization": f"Bearer {free_user['token']}"}
        )
        
        assert response.status_code == 200, f"Free user should access /api/rights-guide, got: {response.status_code}"
        print("✓ Free user can access GET /api/rights-guide")
    
    def test_04_free_user_can_access_evidence_checklist(self, free_user):
        """Test 4: Free user can access GET /api/evidence-checklist (free-tier endpoint)"""
        response = requests.get(
            f"{BASE_URL}/api/evidence-checklist",
            headers={"Authorization": f"Bearer {free_user['token']}"}
        )
        
        assert response.status_code == 200, f"Free user should access /api/evidence-checklist, got: {response.status_code}"
        print("✓ Free user can access GET /api/evidence-checklist")
    
    def test_05_free_user_blocked_from_ai_chat_essential(self, free_user):
        """Test 5: Free user BLOCKED from POST /api/ai/chat (Essential tier required)"""
        response = requests.post(
            f"{BASE_URL}/api/ai/chat",
            headers={"Authorization": f"Bearer {free_user['token']}"},
            json={"message": "Hello, test message"}
        )
        
        assert response.status_code == 403, f"Free user should be blocked from /api/ai/chat, got: {response.status_code}"
        
        # Verify error message format
        data = response.json()
        assert "Essential" in data.get("detail", "") or "upgrade" in data.get("detail", "").lower(), \
            f"Expected upgrade message, got: {data.get('detail')}"
        
        print(f"✓ Free user correctly blocked from AI chat: {data.get('detail')}")
    
    def test_06_free_user_blocked_from_ada_federal_law_professional(self, free_user):
        """Test 6: Free user BLOCKED from GET /api/ada/federal-law (Professional tier required)"""
        response = requests.get(
            f"{BASE_URL}/api/ada/federal-law",
            headers={"Authorization": f"Bearer {free_user['token']}"}
        )
        
        assert response.status_code == 403, f"Free user should be blocked from /api/ada/federal-law, got: {response.status_code}"
        
        data = response.json()
        assert "Professional" in data.get("detail", "") or "upgrade" in data.get("detail", "").lower(), \
            f"Expected upgrade message, got: {data.get('detail')}"
        
        print(f"✓ Free user correctly blocked from ADA federal law: {data.get('detail')}")
    
    def test_07_free_user_blocked_from_strategy_builder_professional(self, free_user):
        """Test 7: Free user BLOCKED from POST /api/strategy-builder/build (Professional tier required)"""
        response = requests.post(
            f"{BASE_URL}/api/strategy-builder/build",
            headers={"Authorization": f"Bearer {free_user['token']}"},
            json={"case_id": "test", "strategy_focus": "defense"}
        )
        
        assert response.status_code == 403, f"Free user should be blocked from /api/strategy-builder/build, got: {response.status_code}"
        
        data = response.json()
        print(f"✓ Free user correctly blocked from Strategy Builder: {data.get('detail')}")
    
    def test_08_free_user_blocked_from_courtlistener_attorney(self, free_user):
        """Test 8: Free user BLOCKED from GET /api/courtlistener/search (Attorney tier required)"""
        response = requests.get(
            f"{BASE_URL}/api/courtlistener/search",
            headers={"Authorization": f"Bearer {free_user['token']}"},
            params={"query": "cps case law"}
        )
        
        assert response.status_code == 403, f"Free user should be blocked from /api/courtlistener/search, got: {response.status_code}"
        
        data = response.json()
        assert "Attorney" in data.get("detail", "") or "upgrade" in data.get("detail", "").lower(), \
            f"Expected upgrade message, got: {data.get('detail')}"
        
        print(f"✓ Free user correctly blocked from CourtListener: {data.get('detail')}")
    
    def test_09_free_user_blocked_from_section_1983_attorney(self, free_user):
        """Test 9: Free user BLOCKED from POST /api/section-1983/generate (Attorney tier required)"""
        response = requests.post(
            f"{BASE_URL}/api/section-1983/generate",
            headers={"Authorization": f"Bearer {free_user['token']}"},
            json={"case_id": "test", "complaint_type": "standard"}
        )
        
        assert response.status_code == 403, f"Free user should be blocked from /api/section-1983/generate, got: {response.status_code}"
        
        data = response.json()
        assert "Attorney" in data.get("detail", "") or "upgrade" in data.get("detail", "").lower(), \
            f"Expected upgrade message, got: {data.get('detail')}"
        
        print(f"✓ Free user correctly blocked from Section 1983: {data.get('detail')}")
    
    def test_10_free_user_can_create_one_case(self, free_user):
        """Test 10: Free user can create 1 case (within limit)"""
        response = requests.post(
            f"{BASE_URL}/api/cases",
            headers={"Authorization": f"Bearer {free_user['token']}"},
            json={
                "title": "TEST_Free_User_First_Case",
                "description": "First case for free user",
                "state": "CA"
            }
        )
        
        assert response.status_code == 200, f"Free user should create first case, got: {response.status_code}"
        data = response.json()
        assert "id" in data, "Case should have an ID"
        
        # Store case_id for cleanup
        free_user['case_id'] = data['id']
        print(f"✓ Free user successfully created first case: {data['title']}")
    
    def test_11_free_user_blocked_from_second_case(self, free_user):
        """Test 11: Free user BLOCKED from creating 2nd case (case limit enforcement)"""
        response = requests.post(
            f"{BASE_URL}/api/cases",
            headers={"Authorization": f"Bearer {free_user['token']}"},
            json={
                "title": "TEST_Free_User_Second_Case",
                "description": "Should fail - case limit exceeded",
                "state": "TX"
            }
        )
        
        assert response.status_code == 403, f"Free user should be blocked from 2nd case, got: {response.status_code}"
        
        data = response.json()
        assert "limit" in data.get("detail", "").lower() or "upgrade" in data.get("detail", "").lower(), \
            f"Expected case limit message, got: {data.get('detail')}"
        
        print(f"✓ Free user correctly blocked from creating 2nd case: {data.get('detail')}")
    
    def test_99_cleanup_free_user_data(self, free_user):
        """Cleanup: Delete test case and user data"""
        # Delete test case if created
        if 'case_id' in free_user:
            requests.delete(
                f"{BASE_URL}/api/cases/{free_user['case_id']}",
                headers={"Authorization": f"Bearer {free_user['token']}"}
            )
            print(f"✓ Cleaned up test case: {free_user['case_id']}")


class TestTierEnforcementEnterprise:
    """Test tier enforcement after enterprise upgrade via passcode"""
    
    @pytest.fixture(scope="class")
    def enterprise_user(self):
        """Create a user and upgrade to enterprise via passcode"""
        unique_id = str(uuid.uuid4())[:8]
        email = f"TEST_enterprise_tier_{unique_id}@test.com"
        password = "TestPass123!"
        name = "Enterprise Tier Test User"
        
        # Sign up as free user
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json={"email": email, "password": password, "name": name, "state": "NY"}
        )
        
        assert response.status_code == 200, f"Signup failed: {response.text}"
        data = response.json()
        token = data["access_token"]
        user_id = data["user_id"]
        
        return {
            "email": email,
            "password": password,
            "token": token,
            "user_id": user_id
        }
    
    def test_12_redeem_passcode_punisher2024(self, enterprise_user):
        """Test 12: Redeem passcode 'PUNISHER2024' to upgrade to enterprise tier"""
        response = requests.post(
            f"{BASE_URL}/api/auth/redeem-passcode",
            headers={"Authorization": f"Bearer {enterprise_user['token']}"},
            json={"passcode": "PUNISHER2024"}
        )
        
        assert response.status_code == 200, f"Passcode redemption failed: {response.text}"
        data = response.json()
        
        assert data.get("success") == True, f"Expected success=True, got: {data}"
        assert data.get("new_tier") == "enterprise", f"Expected enterprise tier, got: {data.get('new_tier')}"
        
        print(f"✓ Passcode redeemed successfully: {data.get('message')}")
    
    def test_13_enterprise_user_tier_status(self, enterprise_user):
        """Test 13: Verify enterprise user tier-status shows enterprise"""
        response = requests.get(
            f"{BASE_URL}/api/auth/tier-status",
            headers={"Authorization": f"Bearer {enterprise_user['token']}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["tier"] == "enterprise", f"Expected tier 'enterprise', got: {data['tier']}"
        assert data["tier_level"] == 4, f"Expected tier_level 4, got: {data['tier_level']}"
        
        # Enterprise has unlimited (-1) for all limits
        limits = data["limits"]
        assert limits["docs_per_month"] == -1, f"Enterprise should have unlimited docs"
        assert limits["ai_credits"] == -1, f"Enterprise should have unlimited AI credits"
        assert limits["cases_max"] == -1, f"Enterprise should have unlimited cases"
        
        print(f"✓ Enterprise tier status verified: {data['tier']} with unlimited limits")
    
    def test_14_enterprise_user_can_access_ai_chat(self, enterprise_user):
        """Test 14: Enterprise user CAN access POST /api/ai/chat"""
        # Note: We're just testing access, not the full AI response
        response = requests.post(
            f"{BASE_URL}/api/ai/chat",
            headers={"Authorization": f"Bearer {enterprise_user['token']}"},
            json={"message": "Test access check"}
        )
        
        # Should get 200 (success) - not 403 (blocked)
        assert response.status_code == 200, f"Enterprise user should access /api/ai/chat, got: {response.status_code}"
        print("✓ Enterprise user can access AI chat endpoint")
    
    def test_15_enterprise_user_can_access_ada_federal_law(self, enterprise_user):
        """Test 15: Enterprise user CAN access GET /api/ada/federal-law"""
        response = requests.get(
            f"{BASE_URL}/api/ada/federal-law",
            headers={"Authorization": f"Bearer {enterprise_user['token']}"}
        )
        
        assert response.status_code == 200, f"Enterprise user should access /api/ada/federal-law, got: {response.status_code}"
        print("✓ Enterprise user can access ADA federal law endpoint")
    
    def test_16_enterprise_user_can_access_courtlistener(self, enterprise_user):
        """Test 16: Enterprise user CAN access GET /api/courtlistener/search"""
        response = requests.get(
            f"{BASE_URL}/api/courtlistener/search",
            headers={"Authorization": f"Bearer {enterprise_user['token']}"},
            params={"query": "cps parental rights"}
        )
        
        # Should get 200 (success) - not 403 (blocked)
        assert response.status_code == 200, f"Enterprise user should access /api/courtlistener/search, got: {response.status_code}"
        print("✓ Enterprise user can access CourtListener endpoint")
    
    def test_17_enterprise_user_can_create_case_for_section1983(self, enterprise_user):
        """Test 17: Create a case for Section 1983 testing"""
        response = requests.post(
            f"{BASE_URL}/api/cases",
            headers={"Authorization": f"Bearer {enterprise_user['token']}"},
            json={
                "title": "TEST_Enterprise_Case",
                "description": "Enterprise test case for Section 1983",
                "state": "CA"
            }
        )
        
        assert response.status_code == 200, f"Enterprise user should create case, got: {response.status_code}"
        data = response.json()
        enterprise_user['case_id'] = data['id']
        print(f"✓ Enterprise user created case: {data['title']}")
    
    def test_18_enterprise_user_can_access_section_1983(self, enterprise_user):
        """Test 18: Enterprise user CAN access POST /api/section-1983/generate"""
        case_id = enterprise_user.get('case_id', 'dummy')
        response = requests.post(
            f"{BASE_URL}/api/section-1983/generate",
            headers={"Authorization": f"Bearer {enterprise_user['token']}"},
            json={"case_id": case_id, "complaint_type": "standard"}
        )
        
        # Should get 200 or 404 (if case not found) - but NOT 403 (tier blocked)
        assert response.status_code != 403, f"Enterprise user should not be blocked from /api/section-1983/generate, got: {response.status_code}"
        print(f"✓ Enterprise user can access Section 1983 endpoint (status: {response.status_code})")
    
    def test_19_enterprise_user_can_access_strategy_builder(self, enterprise_user):
        """Test 19: Enterprise user CAN access POST /api/strategy-builder/build"""
        case_id = enterprise_user.get('case_id', 'dummy')
        response = requests.post(
            f"{BASE_URL}/api/strategy-builder/build",
            headers={"Authorization": f"Bearer {enterprise_user['token']}"},
            json={"case_id": case_id, "strategy_focus": "defense"}
        )
        
        # Should get 200 or 404 (if case not found) - but NOT 403 (tier blocked)
        assert response.status_code != 403, f"Enterprise user should not be blocked from /api/strategy-builder/build, got: {response.status_code}"
        print(f"✓ Enterprise user can access Strategy Builder endpoint (status: {response.status_code})")
    
    def test_20_enterprise_user_can_create_multiple_cases(self, enterprise_user):
        """Test 20: Enterprise user CAN create multiple cases (no limit)"""
        # Create second case
        response = requests.post(
            f"{BASE_URL}/api/cases",
            headers={"Authorization": f"Bearer {enterprise_user['token']}"},
            json={
                "title": "TEST_Enterprise_Second_Case",
                "description": "Enterprise second case",
                "state": "TX"
            }
        )
        
        assert response.status_code == 200, f"Enterprise user should create second case, got: {response.status_code}"
        data = response.json()
        enterprise_user['case_id_2'] = data['id']
        
        # Create third case
        response = requests.post(
            f"{BASE_URL}/api/cases",
            headers={"Authorization": f"Bearer {enterprise_user['token']}"},
            json={
                "title": "TEST_Enterprise_Third_Case",
                "description": "Enterprise third case",
                "state": "NY"
            }
        )
        
        assert response.status_code == 200, f"Enterprise user should create third case, got: {response.status_code}"
        data = response.json()
        enterprise_user['case_id_3'] = data['id']
        
        print("✓ Enterprise user can create unlimited cases")
    
    def test_99_cleanup_enterprise_user_data(self, enterprise_user):
        """Cleanup: Delete test cases"""
        for key in ['case_id', 'case_id_2', 'case_id_3']:
            if key in enterprise_user:
                requests.delete(
                    f"{BASE_URL}/api/cases/{enterprise_user[key]}",
                    headers={"Authorization": f"Bearer {enterprise_user['token']}"}
                )
                print(f"✓ Cleaned up test case: {enterprise_user[key]}")


class TestTierEnforcementPasscodeValidation:
    """Test passcode validation"""
    
    @pytest.fixture(scope="class")
    def test_user(self):
        """Create test user for passcode validation"""
        unique_id = str(uuid.uuid4())[:8]
        email = f"TEST_passcode_validation_{unique_id}@test.com"
        password = "TestPass123!"
        
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json={"email": email, "password": password, "name": "Passcode Test", "state": "FL"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        return {"token": data["access_token"]}
    
    def test_21_invalid_passcode_rejected(self, test_user):
        """Test 21: Invalid passcode is rejected"""
        response = requests.post(
            f"{BASE_URL}/api/auth/redeem-passcode",
            headers={"Authorization": f"Bearer {test_user['token']}"},
            json={"passcode": "INVALID_CODE_12345"}
        )
        
        assert response.status_code == 400, f"Invalid passcode should be rejected, got: {response.status_code}"
        print("✓ Invalid passcode correctly rejected")
    
    def test_22_empty_passcode_rejected(self, test_user):
        """Test 22: Empty passcode is rejected"""
        response = requests.post(
            f"{BASE_URL}/api/auth/redeem-passcode",
            headers={"Authorization": f"Bearer {test_user['token']}"},
            json={"passcode": ""}
        )
        
        assert response.status_code == 400, f"Empty passcode should be rejected, got: {response.status_code}"
        print("✓ Empty passcode correctly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
