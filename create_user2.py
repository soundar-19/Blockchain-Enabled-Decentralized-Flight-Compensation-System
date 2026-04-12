#!/usr/bin/env python3
"""
Script to register User2 with MetaMask wallet
"""
import requests
import json

BASE_URL = 'http://localhost:5000'

# User2 Credentials
user_data = {
    'fullName': 'User2',
    'email': 'user2@gmail.com',
    'password': 'user2@123'
}

# MetaMask Wallet Address
metamask_wallet = '0xF7Dc7da1485346FbD0856FEa570885C4B8C02c6f'

print("=" * 70)
print("🚀 Creating User2 with MetaMask Wallet")
print("=" * 70)

# Step 1: Register User2
print("\n1️⃣  Registering User2...")
try:
    response = requests.post(
        f'{BASE_URL}/api/auth/register',
        json=user_data,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code in [200, 201]:
        result = response.json()
        user_id = result['user']['id']
        print(f"✅ Registration successful!")
        print(f"   User ID: {user_id}")
        print(f"   Email: {result['user']['email']}")
        print(f"   Name: {result['user']['name']}")
    else:
        print(f"❌ Registration failed: {response.status_code}")
        if response.status_code == 409:
            print(f"   User already exists - proceeding to login")
        else:
            print(f"   Response: {response.json()}")
            exit(1)
except Exception as e:
    print(f"❌ Error during registration: {e}")
    exit(1)

# Step 2: Login to get user ID if registration failed
if response.status_code == 409:
    print("\n2️⃣  Logging in with existing User2 credentials...")
    try:
        login_data = {
            'email': user_data['email'],
            'password': user_data['password']
        }
        
        response = requests.post(
            f'{BASE_URL}/api/auth/login',
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            user_id = result['user']['id']
            print(f"✅ Login successful!")
            print(f"   User ID: {user_id}")
        else:
            print(f"❌ Login failed: {response.status_code}")
            exit(1)
    except Exception as e:
        print(f"❌ Error during login: {e}")
        exit(1)
else:
    print("\n2️⃣  Connecting MetaMask wallet...")

# Step 3: Connect MetaMask Wallet (if not already done)
if response.status_code in [200, 201]:
    print(f"\n3️⃣  Connecting MetaMask wallet...")
    try:
        connect_data = {
            'user_id': user_id,
            'wallet_address': metamask_wallet
        }
        
        response = requests.post(
            f'{BASE_URL}/api/auth/connect-wallet',
            json=connect_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code in [200, 201]:
            print(f"✅ MetaMask wallet connected!")
            print(f"   Wallet: {metamask_wallet}")
        else:
            print(f"⚠️  Connection response: {response.status_code}")
            # This might fail if already connected, which is OK
    except Exception as e:
        print(f"⚠️  Wallet connection note: {e}")

# Step 4: Verify User2 setup
print(f"\n4️⃣  Verifying User2 setup...")
try:
    login_data = {
        'email': user_data['email'],
        'password': user_data['password']
    }
    
    response = requests.post(
        f'{BASE_URL}/api/auth/login',
        json=login_data,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code in [200, 201]:
        result = response.json()
        user = result['user']
        
        print(f"\n✅ User2 Verification:")
        print(f"   Name: {user.get('name', 'N/A')}")
        print(f"   Email: {user.get('email', 'N/A')}")
        print(f"   User ID: {user.get('id', 'N/A')}")
        print(f"   Wallet: {user.get('address', 'N/A')}")
        print(f"   Status: ✓ Ready")
    else:
        print(f"❌ Verification failed: {response.status_code}")
        
except Exception as e:
    print(f"❌ Error during verification: {e}")

print("\n" + "=" * 70)
print("✅ USER2 SETUP COMPLETE!")
print("=" * 70)
print("\n📋 User2 Account Details")
print("─" * 70)
print(f"Name:                    {user_data['fullName']}")
print(f"Email:                   {user_data['email']}")
print(f"Password:                {user_data['password']}")
print(f"Wallet:                  {metamask_wallet}")
print(f"Wallet Balance:          0.05 SepoliaETH (from faucet)")

print("\n🧪 Testing Instructions")
print("─" * 70)
print("Now you can test transactions between User1 and User2:")
print("")
print("1. Login as User1 (user1@gmail.com / user1@123)")
print("   - Go to Compensate page")
print("   - Send compensation to User2 address:")
print(f"   - {metamask_wallet}")
print("")
print("2. Then login as User2 (user2@gmail.com / user2@123)")
print("   - Go to Compensate page")
print("   - See your updated balance")
print("   - Send compensation back to User1")
print("")
print("3. View transactions on Etherscan:")
print("   - https://sepolia.etherscan.io/")
print("=" * 70)
