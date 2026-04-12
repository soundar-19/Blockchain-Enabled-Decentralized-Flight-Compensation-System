# SkyGuard DAO - Blockchain Backend Verification Checklist

## ✅ Installation Verification

### Step 1: Verify Python Dependencies
```bash
cd backend
pip install -r requirements.txt

# Verify installations
python -c "import web3; print('✓ web3.py installed:', web3.__version__)"
python -c "import eth_account; print('✓ eth-account installed')"
python -c "import flask; print('✓ Flask installed')"
python -c "import pymongo; print('✓ MongoDB driver installed')"
```

**Expected Output:**
```
✓ web3.py installed: 6.11.0
✓ eth-account installed
✓ Flask installed
✓ MongoDB driver installed
```

### Step 2: Verify Smart Contracts Compiled
```bash
cd hardhat
npx hardhat compile

# Check for artifacts
ls artifacts/contracts/
# Should show:
# - CompensationContract.sol/
# - FlightToken.sol/
```

**Expected Output:**
```
Compiling 2 files with 0.8.19
Compilation finished successfully
```

### Step 3: Verify Backend Structure
```bash
cd backend

# Check blockchain module
ls blockchain/
# Should show:
# - __init__.py
# - web3_config.py
# - contract_manager.py
# - blockchain_service.py
# - wallet_manager.py
# - deploy_sepolia.py

# Check API routes
grep -n "blockchain_bp" api/app.py
# Should find the import and registration
```

## 🔧 Configuration Verification

### Step 1: Create .env File
```bash
cd backend
cp .env.example .env

# Edit .env and verify:
# 1. RPC_URL is set (Infura/Alchemy)
# 2. DEPLOYER_PRIVATE_KEY is set (your private key)
# 3. DEPLOYER_ACCOUNT is set (your account address)
```

### Step 2: Verify Web3 Connection
```bash
python -c "
from blockchain.web3_config import BlockchainConfig
try:
    w3 = BlockchainConfig.get_web3_instance()
    print('✓ Connected to Sepolia')
    print('✓ Chain ID:', w3.eth.chain_id)
    print('✓ Block Number:', w3.eth.block_number)
except Exception as e:
    print('✗ Connection failed:', e)
"
```

**Expected Output:**
```
✓ Connected to Sepolia
✓ Chain ID: 11155111
✓ Block Number: 5123456
```

### Step 3: Verify Account
```bash
python -c "
from blockchain.wallet_manager import WalletManager
from blockchain.web3_config import BlockchainConfig
import os
from dotenv import load_dotenv

load_dotenv()
pk = os.getenv('DEPLOYER_PRIVATE_KEY')
account = os.getenv('DEPLOYER_ACCOUNT')

if pk:
    print('✓ Private key set')
    from eth_account import Account
    acc = Account.from_key(pk)
    print('✓ Account address:', acc.address)
if account:
    print('✓ DEPLOYER_ACCOUNT set:', account)
"
```

## 🚀 Deployment Verification

### Step 1: Pre-Deployment Checklist
```bash
# 1. Check account has ETH
python -c "
from blockchain.blockchain_service import BlockchainService
import os
from dotenv import load_dotenv

load_dotenv()
try:
    service = BlockchainService()
except:
    pass  # Service may fail before contracts deployed

from blockchain.web3_config import BlockchainConfig
account = os.getenv('DEPLOYER_ACCOUNT')
if account:
    w3 = BlockchainConfig.get_web3_instance()
    balance_wei = w3.eth.get_balance(account)
    balance_eth = w3.from_wei(balance_wei, 'ether')
    print(f'✓ Account balance: {balance_eth} ETH')
"

# 2. Check RPC is responding
python -c "
from blockchain.web3_config import BlockchainConfig
w3 = BlockchainConfig.get_web3_instance()
print(f'✓ RPC responding')
print(f'✓ Latest block: {w3.eth.block_number}')
print(f'✓ Gas price: {w3.from_wei(w3.eth.gas_price, \"gwei\")} Gwei')
"
```

### Step 2: Deploy Contracts
```bash
cd backend
python blockchain/deploy_sepolia.py

# Output should show:
# ✓ Connected to Sepolia (Chain ID: 11155111)
# ✓ Deployer: 0x...
# ✓ Balance: X.X ETH
# ✓ Transaction sent: 0x...
# ⏳ Waiting for confirmation...
# ✓ FLY Token deployed: 0x...
# ✓ Compensation Contract deployed: 0x...
```

### Step 3: Update .env with Contract Addresses
```bash
# Add to backend/.env:
FLY_TOKEN_ADDRESS=0x... (from deployment output)
COMPENSATION_CONTRACT_ADDRESS=0x... (from deployment output)
```

## 🧪 API Verification

### Step 1: Start Backend
```bash
cd backend
python run.py

# Output should show:
# * Running on http://127.0.0.1:5000
# * Debug mode: on
```

### Step 2: Test Health Endpoint
```bash
curl http://localhost:5000/api/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "SkyGuard DAO Backend",
#   "version": "1.0.0",
#   "blockchain": "connected",
#   "network": "Sepolia"
# }
```

### Step 3: Test Blockchain Status
```bash
curl http://localhost:5000/api/blockchain/status

# Expected response:
# {
#   "status": "connected",
#   "network": "Sepolia",
#   "chainId": 11155111,
#   "blockNumber": 5123456,
#   "gasPrice": 25.0,
#   "compensationContract": "0x...",
#   "flyTokenContract": "0x..."
# }
```

### Step 4: Test Wallet Creation
```bash
curl -X POST http://localhost:5000/api/blockchain/wallet/create

# Expected response:
# {
#   "status": "success",
#   "address": "0x...",
#   "privateKey": "0x...",
#   "message": "Wallet created successfully"
# }
```

### Step 5: Test Balance Query
```bash
# Replace with actual address from wallet creation
ADDR="0x..." 

curl "http://localhost:5000/api/blockchain/wallet/balance/$ADDR"

# Expected response:
# {
#   "address": "0x...",
#   "ethBalance": 0.0,
#   "flyTokenBalance": 0.0,
#   "network": "Sepolia"
# }
```

### Step 6: Test File Claim
```bash
curl -X POST http://localhost:5000/api/blockchain/compensation/file-claim \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0xYourAddress",
    "flightNumber": "AA101",
    "delayMinutes": 300,
    "claimType": 1
  }'

# Expected response:
# {
#   "status": "success",
#   "message": "Claim transaction prepared",
#   "claimId": "...",
#   "transaction": {...},
#   "estimatedGas": 150000
# }
```

## 📊 Blockchain Verification

### Step 1: Verify Deployment on Sepolia Etherscan
```bash
# Open browser and go to:
# https://sepolia.etherscan.io

# Search for:
# 1. Your deployer account address
# 2. FLY Token contract address
# 3. Compensation Contract address

# You should see:
# - Transactions from account
# - Contract code for both contracts
# - No errors in transaction receipt
```

### Step 2: Verify Contract Functions
```bash
python -c "
from blockchain.contract_manager import ContractManager

cm = ContractManager()
print('✓ Loaded contract ABIs')

# List available functions
fly_token = cm.get_contract('FlightToken')
print('✓ FlightToken functions:')
for func in dir(fly_token.functions):
    if not func.startswith('_'):
        print(f'  - {func}')

comp = cm.get_contract('CompensationContract')
print('✓ CompensationContract functions:')
for func in dir(comp.functions):
    if not func.startswith('_'):
        print(f'  - {func}')
"
```

### Step 3: Read Contract State
```bash
python -c "
from blockchain.blockchain_service import BlockchainService

service = BlockchainService()

# Read total claims
total = service.get_total_claims_count()
print(f'✓ Total claims: {total}')

# Read total paid
paid = service.get_total_compensation_paid()
print(f'✓ Total FLY paid: {paid}')
"
```

## 🔍 Full Integration Test

### Complete Flow Test
```bash
#!/bin/bash

echo "1. Creating test wallet..."
WALLET=$(curl -s -X POST http://localhost:5000/api/blockchain/wallet/create | python -c "import sys, json; print(json.load(sys.stdin)['address'])")
echo "   ✓ Wallet: $WALLET"

echo "2. Checking wallet balance..."
curl -s "http://localhost:5000/api/blockchain/wallet/balance/$WALLET" | python -m json.tool

echo "3. Filing test claim..."
CLAIM=$(curl -s -X POST http://localhost:5000/api/blockchain/compensation/file-claim \
  -H "Content-Type: application/json" \
  -d "{\"userAddress\": \"$WALLET\", \"flightNumber\": \"TEST101\", \"delayMinutes\": 180, \"claimType\": 1}")
echo "$CLAIM" | python -m json.tool

echo "4. Getting system stats..."
curl -s http://localhost:5000/api/blockchain/compensation/stats | python -m json.tool
```

## ✅ Final Checklist

- [ ] Python dependencies installed
- [ ] Smart contracts compiled
- [ ] .env file configured
- [ ] Web3 connection verified
- [ ] Account has Sepolia ETH
- [ ] Contracts deployed to Sepolia
- [ ] Contract addresses in .env
- [ ] Backend starts without errors
- [ ] Health endpoint responds
- [ ] Blockchain status shows "connected"
- [ ] Wallet creation works
- [ ] Balance queries work
- [ ] File claim endpoint works
- [ ] Contracts visible on Sepolia Etherscan
- [ ] No dummy data in any response

## 🎯 Success Criteria

**All of the following must be true:**

✅ Backend connects to Sepolia testnet
✅ Smart contracts deployed to Sepolia
✅ All API endpoints respond
✅ Queries return real blockchain data
✅ No hardcoded/dummy responses
✅ Transactions can be signed
✅ Sepolia Etherscan shows contracts
✅ Flask app runs without errors

---

**If all checks pass, you have a REAL production-ready blockchain backend! 🎉**
