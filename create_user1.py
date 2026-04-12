#!/usr/bin/env python3
"""
Script to create User1 with MetaMask wallet integration
"""
import requests
import json

BASE_URL = 'http://localhost:5000'

# User1 Credentials
user_data = {
    'fullName': 'User1',
    'email': 'user1@gmail.com',
    'password': 'user1@123'
}

# MetaMask Wallet Address (from Sepolia Faucet)
metamask_wallet = '0x45ddA9525B241De1a94E5c196Ac5b37c799F2530'

print("=" * 60)
print("🚀 Creating User1 with MetaMask Wallet Integration")
print("=" * 60)

# Step 1: Register User1
print("\n1️⃣  Registering User1...")
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
        print(f"   Backend Wallet: {result['user'].get('address', 'N/A')}")
        print(f"   Token: {result['token'][:50]}...")
    else:
        print(f"❌ Registration failed: {response.status_code}")
        print(f"   Response: {response.json()}")
        exit(1)
except Exception as e:
    print(f"❌ Error during registration: {e}")
    exit(1)

# Step 2: Connect MetaMask Wallet
print(f"\n2️⃣  Connecting MetaMask wallet...")
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
        result = response.json()
        print(f"✅ MetaMask wallet connected!")
        print(f"   Wallet: {result['user'].get('metamask_address', 'N/A')}")
        print(f"   Connected At: {result['user'].get('metamask_connected_at', 'N/A')}")
    else:
        print(f"❌ Connection failed: {response.status_code}")
        print(f"   Response: {response.json()}")
        exit(1)
except Exception as e:
    print(f"❌ Error during wallet connection: {e}")
    exit(1)

# Step 3: Login with new credentials
print(f"\n3️⃣  Testing login with new credentials...")
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
        auth_token = result['token']
        print(f"✅ Login successful!")
        print(f"   Token: {auth_token[:50]}...")
        print(f"   Wallet (Backend): {result['user'].get('address', 'N/A')}")
        print(f"   Wallet (MetaMask): {result['user'].get('metamask_address', 'N/A')}")
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(f"   Response: {response.json()}")
        exit(1)
except Exception as e:
    print(f"❌ Error during login: {e}")
    exit(1)

print("\n" + "=" * 60)
print("✅ User1 Setup Complete!")
print("=" * 60)
print("\n📋 Account Details:")
print(f"   Name: {user_data['fullName']}")
print(f"   Email: {user_data['email']}")
print(f"   Password: {user_data['password']}")
print(f"   MetaMask Wallet: {metamask_wallet}")
print(f"   User ID: {user_id}")
print("\n💡 You can now:")
print("   1. Login with email: user1@gmail.com")
print("   2. Password: user1@123")
print("   3. Connect to MetaMask wallet in the UI")
print("=" * 60)
