"""
CPS Punisher Backend API Testing
Comprehensive test suite for all backend functionality
"""

import requests
import json
import uuid
import sys
from datetime import datetime, timezone

class CPSPunisherTester:
    def __init__(self, base_url="https://b200b0c8-940f-4bb9-9410-a028f0ae6175.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.test_case_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        
        # Test user data
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.test_user = {
            "name": f"Test Warrior {timestamp}",
            "email": f"test_warrior_{timestamp}@cps-test.com",
            "password": "TestPassword123!"
        }
        
        print(f"🚀 Testing CPS Punisher API at: {base_url}")
        print(f"📧 Test user: {self.test_user['email']}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text[:200]}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ FAILED - Request timeout (30s)")
            return False, {}
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        success, data = self.run_test(
            "Health Check",
            "GET",
            "/api/health",
            200
        )
        if success:
            print(f"   Service: {data.get('service', 'Unknown')}")
            print(f"   Version: {data.get('version', 'Unknown')}")
        return success

    def test_user_signup(self):
        """Test user registration"""
        success, data = self.run_test(
            "User Signup",
            "POST",
            "/api/auth/signup",
            200,
            self.test_user
        )
        if success:
            self.token = data.get('access_token')
            self.user_data = data
            print(f"   User ID: {data.get('user_id')}")
            print(f"   Tier: {data.get('tier')}")
        return success

    def test_user_login(self):
        """Test user login (create fresh user for login test)"""
        # Create a new user for login test
        login_user = {
            "name": f"Login Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"login_test_{datetime.now().strftime('%H%M%S')}@cps-test.com",
            "password": "LoginTest123!"
        }
        
        # First create the user
        success, _ = self.run_test(
            "Create User for Login Test",
            "POST",
            "/api/auth/signup",
            200,
            login_user
        )
        if not success:
            return False
            
        # Now test login
        success, data = self.run_test(
            "User Login",
            "POST",
            "/api/auth/login",
            200,
            {"email": login_user["email"], "password": login_user["password"]}
        )
        return success

    def test_get_user_profile(self):
        """Test get current user profile"""
        success, data = self.run_test(
            "Get User Profile",
            "GET",
            "/api/auth/me",
            200
        )
        if success:
            print(f"   Name: {data.get('name')}")
            print(f"   Email: {data.get('email')}")
        return success

    def test_create_case(self):
        """Test creating a new CPS case"""
        case_data = {
            "title": f"Test Case {datetime.now().strftime('%H%M%S')}",
            "description": "This is a test CPS case for API validation",
            "state": "CA",
            "case_number": f"TEST-{uuid.uuid4().hex[:8].upper()}",
            "children_names": ["Test Child 1", "Test Child 2"]
        }
        
        success, data = self.run_test(
            "Create CPS Case",
            "POST",
            "/api/cases",
            200,
            case_data
        )
        if success:
            self.test_case_id = data.get('id')
            print(f"   Case ID: {self.test_case_id}")
            print(f"   Case Title: {data.get('title')}")
        return success

    def test_list_cases(self):
        """Test listing user cases"""
        success, data = self.run_test(
            "List Cases",
            "GET",
            "/api/cases",
            200
        )
        if success:
            cases = data.get('cases', [])
            print(f"   Found {len(cases)} cases")
        return success

    def test_get_case(self):
        """Test getting specific case"""
        if not self.test_case_id:
            print("❌ SKIPPED - No case ID available")
            return False
            
        success, data = self.run_test(
            "Get Specific Case",
            "GET",
            f"/api/cases/{self.test_case_id}",
            200
        )
        return success

    def test_ai_chat(self):
        """Test AI chat assistant"""
        chat_data = {
            "message": "What are my constitutional rights in a CPS case?",
            "case_id": self.test_case_id
        }
        
        success, data = self.run_test(
            "AI Chat Assistant",
            "POST",
            "/api/ai/chat",
            200,
            chat_data
        )
        if success:
            response_text = data.get('response', '')
            print(f"   Response length: {len(response_text)} chars")
            print(f"   Session ID: {data.get('session_id')}")
            # Check if response contains relevant legal content
            if any(keyword in response_text.lower() for keyword in ['constitutional', 'rights', 'amendment', 'cps', 'legal']):
                print("   ✅ Response contains relevant legal content")
            else:
                print("   ⚠️ Response may not contain expected legal content")
        return success

    def test_create_violation(self):
        """Test creating a violation"""
        if not self.test_case_id:
            print("❌ SKIPPED - No case ID available")
            return False
            
        violation_data = {
            "case_id": self.test_case_id,
            "violation_type": "4th Amendment - Unreasonable Search",
            "description": "CPS conducted search without proper warrant or exigent circumstances",
            "severity": "high",
            "date": "2024-01-15",
            "statute_reference": "4th Amendment, US Constitution"
        }
        
        success, data = self.run_test(
            "Create Violation",
            "POST",
            "/api/violations",
            200,
            violation_data
        )
        if success:
            print(f"   Violation ID: {data.get('id')}")
            print(f"   Type: {data.get('violation_type')}")
        return success

    def test_list_violations(self):
        """Test listing violations for case"""
        if not self.test_case_id:
            print("❌ SKIPPED - No case ID available")
            return False
            
        success, data = self.run_test(
            "List Violations",
            "GET",
            f"/api/violations/{self.test_case_id}",
            200
        )
        if success:
            violations = data.get('violations', [])
            print(f"   Found {len(violations)} violations")
        return success

    def test_create_timeline_event(self):
        """Test creating timeline event"""
        if not self.test_case_id:
            print("❌ SKIPPED - No case ID available")
            return False
            
        event_data = {
            "case_id": self.test_case_id,
            "title": "Initial CPS Contact",
            "description": "First contact from CPS worker regarding allegations",
            "date": "2024-01-10",
            "event_type": "contact"
        }
        
        success, data = self.run_test(
            "Create Timeline Event",
            "POST",
            "/api/timeline",
            200,
            event_data
        )
        if success:
            print(f"   Event ID: {data.get('id')}")
            print(f"   Title: {data.get('title')}")
        return success

    def test_list_timeline(self):
        """Test listing timeline events"""
        if not self.test_case_id:
            print("❌ SKIPPED - No case ID available")
            return False
            
        success, data = self.run_test(
            "List Timeline Events",
            "GET",
            f"/api/timeline/{self.test_case_id}",
            200
        )
        if success:
            events = data.get('events', [])
            print(f"   Found {len(events)} timeline events")
        return success

    def test_legal_research(self):
        """Test AI legal research"""
        research_data = {
            "query": "Emergency removal timeframes in California",
            "state": "CA",
            "topic": "emergency removal"
        }
        
        success, data = self.run_test(
            "Legal Research AI",
            "POST",
            "/api/ai/legal-research",
            200,
            research_data
        )
        if success:
            results = data.get('research_results', '')
            print(f"   Research results length: {len(results)} chars")
            if any(keyword in results.lower() for keyword in ['california', 'removal', 'emergency', 'statute']):
                print("   ✅ Research contains relevant legal information")
        return success

    def test_document_generator(self):
        """Test AI document generator"""
        if not self.test_case_id:
            print("❌ SKIPPED - No case ID available")
            return False
            
        doc_data = {
            "case_id": self.test_case_id,
            "document_type": "motion_to_dismiss",
            "custom_data": {"specific_grounds": "Lack of evidence"}
        }
        
        success, data = self.run_test(
            "Document Generator",
            "POST",
            "/api/ai/generate-document",
            200,
            doc_data
        )
        if success:
            document = data.get('document', '')
            print(f"   Generated document length: {len(document)} chars")
            if any(keyword in document.lower() for keyword in ['motion', 'dismiss', 'court', 'legal']):
                print("   ✅ Document contains legal content")
        return success

    def test_law_library_states(self):
        """Test law library states list"""
        success, data = self.run_test(
            "Law Library - Get States",
            "GET",
            "/api/law-library/states",
            200
        )
        if success:
            states = data.get('states', [])
            print(f"   Found {len(states)} states")
            if len(states) >= 50:
                print("   ✅ All US states available")
        return success

    def test_law_library_state_info(self):
        """Test getting specific state law information"""
        success, data = self.run_test(
            "Law Library - California Info",
            "GET",
            "/api/law-library/CA",
            200
        )
        if success:
            law_info = data.get('law_info', '')
            print(f"   California law info length: {len(law_info)} chars")
            if any(keyword in law_info.lower() for keyword in ['california', 'statute', 'cps', 'agency']):
                print("   ✅ State info contains relevant legal content")
        return success

    def run_all_tests(self):
        """Run all tests in order"""
        print("=" * 80)
        print("🛡️  THE CPS PUNISHER - COMPREHENSIVE API TESTING")
        print("=" * 80)
        
        # Basic health check
        if not self.test_health_check():
            print("\n💥 CRITICAL: Health check failed - API may be down")
            return False

        # Authentication tests
        if not self.test_user_signup():
            print("\n💥 CRITICAL: User signup failed")
            return False
            
        if not self.test_user_login():
            print("\n💥 CRITICAL: User login failed")
            return False
            
        if not self.test_get_user_profile():
            print("\n⚠️  WARNING: Get user profile failed")

        # Case management
        if not self.test_create_case():
            print("\n💥 CRITICAL: Case creation failed")
            return False
            
        self.test_list_cases()
        self.test_get_case()

        # AI Features
        if not self.test_ai_chat():
            print("\n⚠️  WARNING: AI Chat failed - check EMERGENT_LLM_KEY")
        
        # Case features (require active case)
        self.test_create_violation()
        self.test_list_violations()
        self.test_create_timeline_event()
        self.test_list_timeline()

        # AI Research and Documents
        if not self.test_legal_research():
            print("\n⚠️  WARNING: Legal Research failed")
            
        if not self.test_document_generator():
            print("\n⚠️  WARNING: Document Generator failed")

        # Law Library
        self.test_law_library_states()
        self.test_law_library_state_info()

        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: Backend is working well!")
        elif success_rate >= 75:
            print("✅ GOOD: Backend is mostly functional")  
        elif success_rate >= 50:
            print("⚠️  WARNING: Backend has significant issues")
        else:
            print("💥 CRITICAL: Backend is not functional")
            
        print("=" * 80)
        
        return success_rate

def main():
    """Main test execution"""
    tester = CPSPunisherTester()
    
    try:
        success = tester.run_all_tests()
        success_rate = tester.print_summary()
        
        # Return appropriate exit code
        if success_rate >= 75:
            return 0
        else:
            return 1
            
    except KeyboardInterrupt:
        print("\n\n🛑 Tests interrupted by user")
        tester.print_summary()
        return 2
    except Exception as e:
        print(f"\n\n💥 Test suite crashed: {str(e)}")
        return 3

if __name__ == "__main__":
    sys.exit(main())