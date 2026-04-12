#!/usr/bin/env python3
"""
Verify User1 MetaMask wallet connection
"""
import requests

BASE_URL = 'http://localhost:5000'
user_email = 'user1@gmail.com'
user_password = 'user1@123'

print("=" * 60)
print("✅ Verifying User1 MetaMask Wallet Connection")
print("=" * 60)

# Login to verify
print("\n🔍 Logging in and checking wallet status...")
try:
    response = requests.post(
        f'{BASE_URL}/api/auth/login',
        json={'email': user_email, 'password': user_password},
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code in [200, 201]:
        result = response.json()
        user = result['user']
        
        print(f"\n✅ User Found!")
        print(f"   Name: {user.get('name', 'N/A')}")
        print(f"   Email: {user.get('email', 'N/A')}")
        print(f"   User ID: {user.get('id', 'N/A')}")
        print(f"   Backend Wallet: {user.get('address', 'N/A')}")
        print(f"   MetaMask Wallet: {user.get('metamask_address', 'N/A')}")
        print(f"   Wallet Connected: {user.get('wallet_created', False)}")
        
        if user.get('metamask_address'):
            print(f"\n✅ MetaMask wallet is connected!")
            print(f"   Wallet: {user['metamask_address']}")
        else:
            print(f"\n⚠️  MetaMask wallet not yet connected")
            
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.json())
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
