#!/usr/bin/env python3
"""
Direct transaction test - transfers 0.01 ETH from deployer to user wallet
"""
from web3 import Web3
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables
backend_dir = Path(__file__).parent
env_file = backend_dir / '.env'
load_dotenv(dotenv_path=env_file)

# Get configuration
RPC_URL = os.getenv('RPC_URL')
DEPLOYER_ACCOUNT = os.getenv('DEPLOYER_ACCOUNT')
DEPLOYER_PRIVATE_KEY = os.getenv('DEPLOYER_PRIVATE_KEY')
CHAIN_ID = int(os.getenv('CHAIN_ID', '11155111'))

# User wallet to receive ETH
USER_ADDRESS = '0x45ddA9525B241De1a94E5c196Ac5b37c799F2530'
ETH_AMOUNT = 0.01

print("="*80)
print("🧪 DIRECT TRANSACTION TEST")
print("="*80)
print(f"RPC URL: {RPC_URL}")
print(f"Deployer: {DEPLOYER_ACCOUNT}")
print(f"Private Key: {'SET ✓' if DEPLOYER_PRIVATE_KEY else 'NOT SET ✗'}")
print(f"User Address: {USER_ADDRESS}")
print(f"ETH Amount: {ETH_AMOUNT}")
print(f"Chain ID: {CHAIN_ID}")
print("="*80)

try:
    # Connect to Sepolia
    print("\n1️⃣  Connecting to Sepolia RPC...")
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    
    if not w3.is_connected():
        raise Exception("❌ Failed to connect to RPC")
    
    print(f"✅ Connected! Chain: {w3.eth.chain_id}")
    
    # Check balance
    print("\n2️⃣  Checking deployer balance...")
    balance_wei = w3.eth.get_balance(DEPLOYER_ACCOUNT)
    balance_eth = w3.from_wei(balance_wei, 'ether')
    print(f"✅ Deployer balance: {balance_eth} SepoliaETH")
    
    if balance_eth < ETH_AMOUNT:
        raise Exception(f"❌ Insufficient balance! Have {balance_eth} ETH, need {ETH_AMOUNT} ETH")
    
    # Get nonce
    print("\n3️⃣  Getting nonce...")
    nonce = w3.eth.get_transaction_count(DEPLOYER_ACCOUNT)
    print(f"✅ Nonce: {nonce}")
    
    # Get gas price
    print("\n4️⃣  Getting gas price...")
    gas_price = w3.eth.gas_price
    gas_price_gwei = w3.from_wei(gas_price, 'gwei')
    print(f"✅ Gas Price: {gas_price_gwei} Gwei")
    
    # Build transaction
    print("\n5️⃣  Building transaction...")
    tx = {
        'from': DEPLOYER_ACCOUNT,
        'to': USER_ADDRESS,
        'value': w3.to_wei(ETH_AMOUNT, 'ether'),
        'gas': 21000,
        'gasPrice': gas_price,
        'nonce': nonce,
        'chainId': CHAIN_ID
    }
    print(f"✅ Transaction object created")
    print(f"   From: {tx['from']}")
    print(f"   To: {tx['to']}")
    print(f"   Value: {ETH_AMOUNT} ETH")
    print(f"   Gas: {tx['gas']}")
    
    # Sign transaction
    print("\n6️⃣  Signing transaction with private key...")
    signed_tx = w3.eth.account.sign_transaction(tx, DEPLOYER_PRIVATE_KEY)
    print(f"✅ Transaction signed!")
    print(f"   Raw TX: {signed_tx.raw_transaction.hex()[:50]}...")
    
    # Send transaction
    print("\n7️⃣  Sending raw transaction to Sepolia blockchain...")
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction).hex()
    print(f"\n{'='*80}")
    print(f"✅✅✅ TRANSACTION SENT SUCCESSFULLY!")
    print(f"{'='*80}")
    print(f"TX Hash: {tx_hash}")
    print(f"From: {DEPLOYER_ACCOUNT}")
    print(f"To: {USER_ADDRESS}")
    print(f"Amount: {ETH_AMOUNT} SepoliaETH")
    print(f"\n🔍 Check status: https://sepolia.etherscan.io/tx/{tx_hash}")
    print(f"   (Wait ~15 seconds for confirmation)")
    print(f"{'='*80}\n")
    
except Exception as e:
    print(f"\n{'='*80}")
    print(f"❌ ERROR: {str(e)}")
    print(f"{'='*80}\n")
    import traceback
    traceback.print_exc()
