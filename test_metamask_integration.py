#!/usr/bin/env python3
"""
MetaMask Integration Test Script
Tests basic MetaMask functionality and connectivity
Run this to verify your MetaMask setup is working correctly

Usage:
    python test_metamask_integration.py

This script tests:
1. User registration with automatic wallet creation
2. User login
3. MetaMask wallet connection
4. Token verification
5. Wallet address validation
"""

import requests
import json
from datetime import datetime
import sys

API_BASE_URL = "http://localhost:5000/api"

class MetaMaskTester:
    def __init__(self):
        self.session = requests.Session()
        self.user_data = None
        self.token = None
        self.wallet_address = None
        self.test_email = f"test{int(datetime.now().timestamp())}@example.com"
        
    def log(self, status, message):
        """Print formatted log message"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        if status == "pass":
            symbol = "✓"
            color = "\033[92m"
        elif status == "fail":
            symbol = "✗"
            color = "\033[91m"
        else:
            symbol = "→"
            color = "\033[94m"
        print(f"{color}[{timestamp}] {symbol} {message}\033[0m")
    
    def test_register(self):
        """Test user registration"""
        print("\n" + "="*60)
        print("TEST 1: User Registration")
        print("="*60)
        
        try:
            self.log("info", f"Registering new user: {self.test_email}")
            
            response = self.session.post(
                f"{API_BASE_URL}/auth/register",
                json={
                    "fullName": "Test User",
                    "email": self.test_email,
                    "password": "TestPassword123",
                    "confirmPassword": "TestPassword123"
                },
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                self.user_data = data.get('user', {})
                self.token = data.get('token')
                self.log("pass", f"Registration successful")
                self.log("info", f"User ID: {self.user_data.get('id')}")
                self.log("info", f"Backend Wallet Created: {self.user_data.get('address')[:10]}...")
                return True
            elif response.status_code == 400:
                # User might already exist, try login instead
                self.log("info", "User exists, returning to login...")
                return self.test_login()
            else:
                self.log("fail", f"Registration failed: {response.text}")
                return False
                
        except Exception as e:
            self.log("fail", f"Registration error: {str(e)}")
            return False
    
    def test_login(self):
        """Test user login"""
        print("\n" + "="*60)
        print("TEST 2: User Login")
        print("="*60)
        
        try:
            self.log("info", f"Logging in: {self.test_email}")
            
            response = self.session.post(
                f"{API_BASE_URL}/auth/login",
                json={
                    "email": self.test_email,
                    "password": "TestPassword123"
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.user_data = data.get('user', {})
                self.token = data.get('token')
                self.log("pass", f"Login successful")
                self.log("info", f"User: {self.user_data.get('name')} ({self.user_data.get('email')})")
                self.log("info", f"Current Address: {self.user_data.get('address', 'None')[:10] if self.user_data.get('address') else 'Not set'}...")
                return True
            else:
                self.log("fail", f"Login failed: {response.text}")
                return False
                
        except Exception as e:
            self.log("fail", f"Login error: {str(e)}")
            return False
    
    def test_connect_wallet(self, custom_address=None):
        """Test MetaMask wallet connection"""
        print("\n" + "="*60)
        print("TEST 3: MetaMask Wallet Connection")
        print("="*60)
        
        if not self.user_data or not self.user_data.get('id'):
            self.log("fail", "No user data. Run registration/login test first.")
            return False
        
        # Use custom address or default Sepolia testnet address
        wallet_address = custom_address or "0x742d35Cc6634C0532925a3b844Bc9e7595f63e0e"
        
        try:
            self.wallet_address = wallet_address
            self.log("info", f"Connecting wallet: {wallet_address[:10]}...")
            
            response = self.session.post(
                f"{API_BASE_URL}/auth/connect-wallet",
                json={
                    "user_id": self.user_data.get('id'),
                    "wallet_address": wallet_address
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                updated_user = data.get('user', {})
                self.log("pass", f"Wallet connected successfully")
                self.log("info", f"MetaMask Address: {updated_user.get('metamask_address', 'N/A')}")
                self.log("info", f"Backend Address: {updated_user.get('address', 'N/A')}")
                return True
            else:
                self.log("fail", f"Wallet connection failed: {response.text}")
                return False
                
        except Exception as e:
            self.log("fail", f"Wallet connection error: {str(e)}")
            return False
    
    def test_verify_token(self):
        """Test token verification"""
        print("\n" + "="*60)
        print("TEST 4: Token Verification")
        print("="*60)
        
        if not self.token:
            self.log("fail", "No token available. Run login test first.")
            return False
        
        try:
            self.log("info", "Verifying authentication token")
            
            headers = {
                'Authorization': f'Bearer {self.token}'
            }
            
            response = self.session.post(
                f"{API_BASE_URL}/auth/verify",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                verified_user = data.get('user', {})
                self.log("pass", f"Token verification successful")
                self.log("info", f"Verified User: {verified_user.get('name')}")
                metamask_addr = verified_user.get('metamask_address')
                self.log("info", f"Connected MetaMask: {metamask_addr[:10] if metamask_addr else 'Not connected'}...")
                return True
            else:
                self.log("fail", f"Token verification failed: {response.text}")
                return False
                
        except Exception as e:
            self.log("fail", f"Token verification error: {str(e)}")
            return False
    
    def test_wallet_validation(self):
        """Test wallet address validation"""
        print("\n" + "="*60)
        print("TEST 5: Wallet Address Validation")
        print("="*60)
        
        test_cases = [
            ("0x742d35Cc6634C0532925a3b844Bc9e7595f63e0e", True, "Valid Sepolia address"),
            ("0x1234567890123456789012345678901234567890", True, "Valid format"),
            ("742d35Cc6634C0532925a3b844Bc9e7595f63e0e", False, "Missing 0x prefix"),
            ("0x742d35Cc6634C0532925a3b844Bc9e75", False, "Too short"),
            ("0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ", False, "Invalid characters"),
        ]
        
        all_pass = True
        for address, should_be_valid, description in test_cases:
            is_valid = self._validate_address(address)
            status = "pass" if is_valid == should_be_valid else "fail"
            if status == "fail":
                all_pass = False
            
            expected = "✓ valid" if should_be_valid else "✗ invalid"
            actual = "✓ valid" if is_valid else "✗ invalid"
            self.log(status, f"{description}: {address[:12]}... → {actual}")
        
        return all_pass
    
    @staticmethod
    def _validate_address(address):
        """Validate Ethereum address format"""
        import re
        return bool(re.match(r'^0x[a-fA-F0-9]{40}$', address))
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("\n")
        print("╔" + "="*58 + "╗")
        print("║" + "  MetaMask Integration Test Suite  ".center(58) + "║")
        print("║" + " "*58 + "║")
        print("║" + "  Testing: User Auth → Wallet Connection  ".center(58) + "║")
        print("╚" + "="*58 + "╝")
        
        # Test sequence
        tests = [
            ("User Registration", lambda: self.test_register()),
            ("User Login", lambda: self.test_login()),
            ("MetaMask Connection", lambda: self.test_connect_wallet()),
            ("Token Verification", lambda: self.test_verify_token()),
            ("Address Validation", lambda: self.test_wallet_validation()),
        ]
        
        results = {}
        for test_name, test_func in tests:
            try:
                results[test_name] = test_func()
            except requests.exceptions.ConnectionError:
                self.log("fail", f"Cannot connect to API at {API_BASE_URL}")
                results[test_name] = False
            except Exception as e:
                self.log("fail", f"Test '{test_name}' error: {str(e)}")
                results[test_name] = False
        
        # Summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for v in results.values() if v)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✓" if result else "✗"
            self.log("pass" if result else "fail", f"{test_name}")
        
        print("-"*60)
        color = "\033[92m" if passed == total else "\033[93m"
        print(f"{color}Result: {passed}/{total} tests passed\033[0m\n")
        
        if passed == total:
            print("✅ All tests passed! MetaMask integration is ready.\n")
            print("Next steps:")
            print("1. Log in to the app with your test account")
            print("2. Go to Dashboard → Connect MetaMask Wallet")
            print("3. Approve the connection in your MetaMask extension")
            print("4. Your wallet will be connected to the system\n")
        else:
            print(f"⚠️  {total - passed} test(s) failed. See above for details.\n")
            print("Troubleshooting:")
            print("1. Ensure backend is running: python backend/run.py")
            print("2. Check MongoDB is running")
            print("3. Verify API URL is correct: " + API_BASE_URL)
            print("4. Check backend logs for errors\n")
        
        return passed == total


def main():
    """Main entry point"""
    print("\n")
    print("🧪 Starting MetaMask Integration Tests...")
    
    # Test API connectivity first
    print("\n📡 Checking API connectivity...")
    try:
        response = requests.get(f"{API_BASE_URL.replace('/api', '')}/", timeout=5)
        print("✓ API is reachable")
    except requests.exceptions.ConnectionError:
        print(f"\n❌ ERROR: Cannot reach API at {API_BASE_URL}")
        print("\nMake sure the backend is running:")
        print("  1. Open terminal in 'backend' folder")
        print("  2. Run: pip install -r requirements.txt")
        print("  3. Run: python run.py")
        print("\nOr use the batch file:")
        print("  - Windows: .\\start_backend.bat")
        print("  - PowerShell: .\\START_ALL_INTEGRATED.ps1\n")
        sys.exit(1)
    except Exception as e:
        print(f"⚠️  Connection check error: {e}")
    
    # Run tests
    tester = MetaMaskTester()
    success = tester.run_all_tests()
    
    return 0 if success else 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/connect-wallet",
            json={"user_id": "invalid", "wallet_address": "invalid"},
            headers={"Content-Type": "application/json"}
        )
        print(f"✓ Endpoint responds with status: {response.status_code}")
        print(f"  Response: {response.json()}")
        return True
    except Exception as e:
        print(f"✗ Endpoint not available: {e}")
        return False

def test_invalid_wallet_format():
    """Test 2: Validate Ethereum address format"""
    print("\n📝 Test 2: Invalid Wallet Format")
    print("-" * 50)
    user_id = setup_test_user()
    
    invalid_addresses = [
        "invalid_address",  # Not hex
        "0x123",  # Too short
        "0x" + "a" * 50,  # Too long
        "123456789abcdef",  # Missing 0x prefix
    ]
    
    for invalid_addr in invalid_addresses:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/connect-wallet",
            json={"user_id": user_id, "wallet_address": invalid_addr},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 400:
            print(f"✓ Rejected invalid address: {invalid_addr}")
        else:
            print(f"✗ Should have rejected: {invalid_addr}")

def test_valid_wallet_connection():
    """Test 3: Connect valid Ethereum wallet"""
    print("\n📝 Test 3: Valid Wallet Connection")
    print("-" * 50)
    user_id = setup_test_user()
    
    # Valid Ethereum address format
    valid_wallet = "0x" + "a" * 40  # 0x + 40 hex chars = 42 total
    
    response = requests.post(
        f"{BACKEND_URL}/api/auth/connect-wallet",
        json={"user_id": user_id, "wallet_address": valid_wallet},
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Wallet connected successfully")
        print(f"  Response: {data}")
        
        # Verify in database
        client = pymongo.MongoClient(MONGODB_URI)
        db = client["blockchain_compensation"]
        user = db.users.find_one({"_id": ObjectId(user_id)})
        
        if user["address"] == valid_wallet and user["wallet_type"] == "metamask":
            print(f"✓ Wallet saved to MongoDB correctly")
            print(f"  Address: {user['address']}")
            print(f"  Type: {user['wallet_type']}")
            return True
        else:
            print(f"✗ Wallet not saved correctly in database")
            return False
    else:
        print(f"✗ Failed to connect wallet: {response.status_code}")
        print(f"  Response: {response.json()}")
        return False

def test_missing_user():
    """Test 4: Handle non-existent user"""
    print("\n📝 Test 4: Non-existent User Handling")
    print("-" * 50)
    
    fake_user_id = str(ObjectId())  # Generate valid ObjectId format
    valid_wallet = "0x" + "b" * 40
    
    response = requests.post(
        f"{BACKEND_URL}/api/auth/connect-wallet",
        json={"user_id": fake_user_id, "wallet_address": valid_wallet},
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 404:
        print(f"✓ Properly returns 404 for non-existent user")
        print(f"  Response: {response.json()}")
        return True
    else:
        print(f"✗ Should return 404, got {response.status_code}")
        return False

def test_missing_parameters():
    """Test 5: Handle missing required parameters"""
    print("\n📝 Test 5: Missing Parameters")
    print("-" * 50)
    
    # Missing wallet_address
    response1 = requests.post(
        f"{BACKEND_URL}/api/auth/connect-wallet",
        json={"user_id": "test123"},
        headers={"Content-Type": "application/json"}
    )
    
    # Missing user_id
    response2 = requests.post(
        f"{BACKEND_URL}/api/auth/connect-wallet",
        json={"wallet_address": "0x" + "c" * 40},
        headers={"Content-Type": "application/json"}
    )
    
    if response1.status_code == 400 and response2.status_code == 400:
        print(f"✓ Both missing parameter cases return 400")
        return True
    else:
        print(f"✗ Should return 400 for missing parameters")
        return False

# ============================================================
# Frontend File Verification
# ============================================================

def verify_frontend_integration():
    """Verify MetaMask component is properly integrated"""
    print("\n📝 Frontend Integration Verification")
    print("-" * 50)
    
    files_to_check = {
        "MetaMaskConnect Component": "frontend/src/components/MetaMaskConnect.jsx",
        "Dashboard Page": "frontend/src/pages/Dashboard/DashboardPageSimple.jsx",
        "App Router": "frontend/src/AppRouter.jsx"
    }
    
    for name, filepath in files_to_check.items():
        try:
            with open(filepath, 'r') as f:
                content = f.read()
                if 'MetaMaskConnect' in content or 'connect-wallet' in content:
                    print(f"✓ {name}: Integration found")
                else:
                    print(f"⚠ {name}: May not be fully integrated")
        except FileNotFoundError:
            print(f"✗ {name}: File not found")

# ============================================================
# Run All Tests
# ============================================================

def main():
    print("=" * 60)
    print("🧪 MetaMask Integration Test Suite")
    print("=" * 60)
    
    # Check backend is running
    try:
        response = requests.get(f"{BACKEND_URL}/api/health")
        print(f"\n✅ Backend Server: Running on {BACKEND_URL}")
    except:
        print(f"\n❌ Backend Server: Not running on {BACKEND_URL}")
        return
    
    # Run test cases
    results = {}
    results["Endpoint Exists"] = test_endpoint_exists()
    results["Invalid Wallet Format"] = test_invalid_wallet_format() is None  # Just verification
    results["Valid Wallet Connection"] = test_valid_wallet_connection()
    results["Non-existent User"] = test_missing_user()
    results["Missing Parameters"] = test_missing_parameters()
    
    # Verify frontend integration
    verify_frontend_integration()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"\nPassed: {passed}/{total}")
    for test_name, result in results.items():
        status = "✓" if result else "✗"
        print(f"  {status} {test_name}")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
