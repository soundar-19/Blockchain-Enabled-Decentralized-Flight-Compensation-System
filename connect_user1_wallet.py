#!/usr/bin/env python3
"""
Script to connect MetaMask wallet to existing User1
"""
import requests
import json

BASE_URL = 'http://localhost:5000'

# User1 Credentials
user_email = 'user1@gmail.com'
user_password = 'user1@123'

# MetaMask Wallet Address (from Sepolia Faucet)
metamask_wallet = '0x45ddA9525B241De1a94E5c196Ac5b37c799F2530'

print("=" * 60)
print("🔗 Connecting MetaMask Wallet to User1")
print("=" * 60)

# Step 1: Login to get user ID and token
print("\n1️⃣  Logging in as User1...")
try:
    login_data = {
        'email': user_email,
        'password': user_password
    }
    
    response = requests.post(
        f'{BASE_URL}/api/auth/login',
        json=login_data,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code in [200, 201]:
        result = response.json()
        user_id = result['user']['id']
        auth_token = result['token']
        print(f"✅ Login successful!")
        print(f"   User ID: {user_id}")
        print(f"   Email: {result['user']['email']}")
        print(f"   Backend Wallet: {result['user'].get('address', 'N/A')}")
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(f"   Response: {response.json()}")
        exit(1)
except Exception as e:
    print(f"❌ Error during login: {e}")
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
        if 'metamask_connected_at' in result['user']:
            print(f"   Connected At: {result['user']['metamask_connected_at']}")
    else:
        print(f"❌ Connection failed: {response.status_code}")
        print(f"   Response: {response.json()}")
        exit(1)
except Exception as e:
    print(f"❌ Error during wallet connection: {e}")
    exit(1)

print("\n" + "=" * 60)
print("✅ MetaMask Wallet Connected to User1!")
print("=" * 60)
print("\n📋 Account Details:")
print(f"   Name: User1")
print(f"   Email: {user_email}")
print(f"   MetaMask Wallet: {metamask_wallet}")
print(f"   User ID: {user_id}")
print("\n💡 Next Steps:")
print("   1. Go to http://localhost:5177/compensate")
print("   2. You should see your wallet balance displayed")
print("   3. Ready to send and receive compensation!")
print("=" * 60)
