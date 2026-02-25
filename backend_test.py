#!/usr/bin/env python3
"""
CPS Punisher Backend API Tests - Iteration 2
Focus: Testing AI endpoints that were previously failing (500 errors)
Previous iteration showed core CRUD working, AI features broken
"""

import requests
import json
import sys
import time
from datetime import datetime

class CPSPunisherTester:
    def __init__(self, base_url="https://cps-battle-station.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_case_id = "7f01ed6e-e796-43cd-bfa0-7d2c84dd44c6"  # Provided test case
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test with error details"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                error_detail = "Unknown error"
                try:
                    error_data = response.json()
                    error_detail = error_data.get('detail', str(error_data))
                except:
                    error_detail = response.text

                self.log(f"❌ FAILED - {name}")
                self.log(f"   Expected: {expected_status}, Got: {response.status_code}")
                self.log(f"   Error: {error_detail}")
                
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "error": error_detail
                })
                
                return False, {}

        except requests.exceptions.Timeout:
            self.log(f"❌ FAILED - {name} - TIMEOUT after {timeout}s")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": f"Request timeout after {timeout}s"
            })
            return False, {}
        except Exception as e:
            self.log(f"❌ FAILED - {name} - Exception: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test basic health endpoint"""
        return self.run_test("Health Check", "GET", "/api/health", 200)

    def test_login(self):
        """Test login with provided test credentials"""
        self.log("🔐 Testing login with provided test user...")
        success, response = self.run_test(
            "Login Test User",
            "POST",
            "/api/auth/login",
            200,
            data={"email": "demo2@cpspunisher.com", "password": "demo123456"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response.get('user_id')
            self.log(f"✅ Login successful - Token acquired, User ID: {self.user_id}")
            return True
        return False

    def test_ai_chat_endpoint(self):
        """Test AI chat endpoint - was previously returning 500"""
        self.log("🤖 Testing AI Chat endpoint (GPT-5.2)...")
        
        # Test basic chat without case context
        success, response = self.run_test(
            "AI Chat - Basic Query",
            "POST", 
            "/api/ai/chat",
            200,
            data={
                "message": "What are my constitutional rights in a CPS case?",
                "session_id": None,
                "case_id": None
            },
            timeout=45  # AI responses can be slower
        )
        
        if success:
            if 'response' in response and response['response']:
                self.log(f"✅ AI Chat working - Response length: {len(response['response'])} chars")
                self.log(f"   Sample: {response['response'][:100]}...")
                return True
            else:
                self.log("❌ AI Chat response empty or malformed")
                self.failed_tests.append({
                    "test": "AI Chat Response Quality",
                    "issue": "Response empty or missing"
                })
        return False

    def test_ai_chat_with_case(self):
        """Test AI chat with case context"""
        if not self.test_case_id:
            self.log("⚠️  Skipping case context test - no test case available")
            return True
            
        self.log("🤖 Testing AI Chat with case context...")
        success, response = self.run_test(
            "AI Chat - With Case Context",
            "POST",
            "/api/ai/chat", 
            200,
            data={
                "message": "Analyze my case for constitutional violations",
                "case_id": self.test_case_id
            },
            timeout=45
        )
        
        if success and 'response' in response:
            self.log(f"✅ AI Chat with case context working")
            return True
        return False

    def test_legal_research_endpoint(self):
        """Test Legal Research endpoint - was previously returning 500"""
        self.log("📚 Testing Legal Research endpoint...")
        
        success, response = self.run_test(
            "Legal Research - General Query",
            "POST",
            "/api/ai/legal-research",
            200,
            data={
                "query": "Emergency removal timeframes in CPS cases",
                "state": "CA",
                "topic": "procedural_rights"
            },
            timeout=45
        )
        
        if success:
            if 'research_results' in response and response['research_results']:
                self.log(f"✅ Legal Research working - Result length: {len(response['research_results'])} chars")
                self.log(f"   Sample: {response['research_results'][:100]}...")
                return True
            else:
                self.log("❌ Legal Research response empty")
                self.failed_tests.append({
                    "test": "Legal Research Response",
                    "issue": "No research_results in response"
                })
        return False

    def test_document_generator_endpoint(self):
        """Test Document Generator endpoint - was previously returning 500"""
        if not self.test_case_id:
            self.log("⚠️  Skipping document generation - no test case")
            return True
            
        self.log("📄 Testing Document Generator endpoint...")
        
        success, response = self.run_test(
            "Document Generator - Motion to Dismiss",
            "POST",
            "/api/ai/generate-document",
            200,
            data={
                "case_id": self.test_case_id,
                "document_type": "motion_to_dismiss",
                "custom_data": {"urgency": "high"}
            },
            timeout=60  # Document generation can take longer
        )
        
        if success:
            if 'document' in response and response['document']:
                self.log(f"✅ Document Generator working - Document length: {len(response['document'])} chars")
                self.log(f"   Sample: {response['document'][:100]}...")
                return True
            else:
                self.log("❌ Document Generator response empty")
                self.failed_tests.append({
                    "test": "Document Generator Response", 
                    "issue": "No document in response"
                })
        return False

    def test_law_library_endpoint(self):
        """Test Law Library endpoint - was previously returning 500"""
        self.log("⚖️  Testing Law Library endpoint...")
        
        # Test states list first
        success, response = self.run_test(
            "Law Library - States List",
            "GET",
            "/api/law-library/states",
            200
        )
        
        if not success:
            return False
            
        # Test specific state info
        success, response = self.run_test(
            "Law Library - California Info",
            "GET",
            "/api/law-library/CA",
            200,
            timeout=45
        )
        
        if success:
            if 'law_info' in response and response['law_info']:
                self.log(f"✅ Law Library working - Info length: {len(response['law_info'])} chars")
                self.log(f"   Sample: {response['law_info'][:100]}...")
                return True
            else:
                self.log("❌ Law Library response empty")
                self.failed_tests.append({
                    "test": "Law Library State Info",
                    "issue": "No law_info in response"
                })
        return False

    def test_case_creation_flow(self):
        """Test case creation to ensure we can use AI features with cases"""
        self.log("📁 Testing case creation for AI integration...")
        
        success, response = self.run_test(
            "Create Test Case",
            "POST",
            "/api/cases",
            200,
            data={
                "title": "Test AI Integration Case",
                "description": "Testing AI features with real case data",
                "state": "TX",
                "case_number": "TEST-2025-001",
                "children_names": ["Test Child"]
            }
        )
        
        if success and 'id' in response:
            self.test_case_id = response['id']
            self.log(f"✅ Case created successfully - ID: {self.test_case_id}")
            return True
        return False

    def test_violation_creation(self):
        """Test adding violation for AI analysis"""
        if not self.test_case_id:
            self.log("⚠️  Skipping violation test - no case available")
            return True
            
        self.log("⚠️  Testing violation creation...")
        
        success, response = self.run_test(
            "Create Test Violation",
            "POST",
            "/api/violations",
            200,
            data={
                "case_id": self.test_case_id,
                "violation_type": "4th Amendment - Unreasonable Search",
                "description": "CPS entered home without warrant or exigent circumstances",
                "severity": "high",
                "date": "2025-01-15",
                "statute_reference": "4th Amendment US Constitution"
            }
        )
        
        if success:
            self.log(f"✅ Violation created successfully")
            return True
        return False

    def run_comprehensive_test(self):
        """Run all tests in logical order"""
        self.log("🚀 Starting CPS Punisher AI Features Test - Iteration 2")
        self.log("="*60)
        
        # Basic connectivity
        if not self.test_health_check()[0]:
            self.log("💀 Health check failed - aborting tests")
            return self.print_results()
            
        # Authentication 
        if not self.test_login():
            self.log("💀 Login failed - aborting tests")
            return self.print_results()
            
        # Create test case for AI features
        self.test_case_creation_flow()
        self.test_violation_creation()
        
        # Core AI Features Tests (these were failing in iteration 1)
        self.log("\n🤖 Testing AI Features (Previously Broken)...")
        self.test_ai_chat_endpoint()
        self.test_ai_chat_with_case()
        self.test_legal_research_endpoint()
        self.test_document_generator_endpoint()
        self.test_law_library_endpoint()
        
        return self.print_results()

    def print_results(self):
        """Print comprehensive test results"""
        self.log("="*60)
        self.log(f"🏁 TEST RESULTS SUMMARY")
        self.log(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"📈 Success rate: {success_rate:.1f}%")
        
        if self.failed_tests:
            self.log(f"\n❌ FAILED TESTS ({len(self.failed_tests)}):")
            for failure in self.failed_tests:
                self.log(f"   • {failure.get('test', 'Unknown')}")
                if 'endpoint' in failure:
                    self.log(f"     Endpoint: {failure['endpoint']}")
                if 'error' in failure:
                    self.log(f"     Error: {failure['error']}")
        else:
            self.log("\n🎉 ALL TESTS PASSED!")
            
        return success_rate >= 90  # Success if 90%+ pass rate

def main():
    tester = CPSPunisherTester()
    success = tester.run_comprehensive_test()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())