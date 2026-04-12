# 🔗 Data Flow Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│  http://localhost:5177 / http://localhost:5177/vite/...     │
├─────────────────────────────────────────────────────────────┤
│  • App.jsx (Main orchestrator)                              │
│  • blockchainDataService.js (API integration)               │
│  • Pages: Dashboard, Compensate, Login, etc.                │
│  • State: wallet, account, balance, compensations           │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP REST API
                     │ (CORS enabled)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Flask + Python)                  │
│              http://localhost:5000/api/...                  │
├─────────────────────────────────────────────────────────────┤
│  • app.py (Flask setup)                                     │
│  • blockchain_routes.py (Blockchain endpoints)              │
│  • auth.py (Authentication)                                 │
│  • BlockchainService (Web3 integration)                      │
│  • WalletManager (Wallet operations)                         │
└────────────────────┬────────────────────────────────────────┘
                     │ Web3.py RPC Calls
                     │ MongoDB Queries
                     ▼
        ┌────────────────────────────────┐
        │   ETHEREUM SEPOLIA TESTNET     │
        │  (Chain ID: 11155111)          │
        ├────────────────────────────────┤
        │  • Smart Contracts             │
        │  • Wallet Accounts             │
        │  • Token Balances              │
        │  • Transaction History         │
        └────────────────────────────────┘
```

---

## 🔄 Complete Data Flow: Filing a Compensation Claim

### Step 1: User Interaction (Frontend)
```javascript
// User clicks "File Claim" button in CompensatePage.jsx
handleFileCompensation(flightNumber, delayMinutes, compensationType)
  ↓
// Validates wallet exists
if (!wallet?.address) → Error dialog
  ↓
// Calls blockchain service
blockchainDataService.fileCompensationClaim(
  wallet.address,
  flightNumber,
  delayMinutes,
  claimType,
  routeId
)
```

### Step 2: API Request (Frontend → Backend)
```
POST /api/blockchain/compensation/file-claim

Request Body:
{
  "user_address": "0x209f303ea41370253220C0dB8cA73d910612Cd71",
  "flight_number": "AA123",
  "delay_minutes": 180,
  "claim_type": 2,  // 1=food, 2=hotel, 3=refund, 4=transport
  "route_id": 1
}

// CORS Headers automatically included
Authorization: Bearer {user_token}
Content-Type: application/json
```

### Step 3: Backend Processing
```python
# backend/api/blockchain_routes.py
@blockchain_bp.route('/compensation/file-claim', methods=['POST'])
def file_compensation_claim():
    # 1. Get request data
    data = request.get_json()
    user_address = data.get('user_address')
    
    # 2. Validate inputs
    if not all([user_address, flight_number, delay_minutes]):
        return error_response("Missing fields")
    
    # 3. Call blockchain service
    result = blockchain_service.file_compensation_claim(
        user_address,
        flight_number,
        int(delay_minutes),
        int(claim_type),
        int(route_id)
    )
    
    # 4. Save to database
    db.claims.insert_one({
        'user_address': user_address,
        'flight_number': flight_number,
        'tx_hash': result['transaction_hash'],
        'timestamp': datetime.now()
    })
    
    # 5. Return response
    return jsonify({
        'status': 'success',
        'transaction_hash': result['transaction_hash'],
        'claim_id': result['claim_id']
    })
```

### Step 4: Blockchain Interaction
```python
# backend/blockchain/blockchain_service.py
def file_compensation_claim(self, user_address, flight_number, 
                            delay_minutes, claim_type, route_id):
    
    # 1. Load contract
    contract = self.compensation_contract
    
    # 2. Prepare transaction
    tx_data = contract.functions.fileCompensationClaim(
        user_address,
        flight_number,
        delay_minutes,
        claim_type,
        route_id
    ).build_transaction({
        'from': deployer_account,
        'nonce': w3.eth.get_transaction_count(deployer_account),
        'gas': 300000,
        'gasPrice': w3.eth.gas_price
    })
    
    # 3. Sign transaction
    signed_tx = w3.eth.account.sign_transaction(tx_data, private_key)
    
    # 4. Send to blockchain
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    
    # 5. Wait for confirmation
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    # 6. Return confirmation
    return {
        'status': 'success',
        'transaction_hash': tx_hash.hex(),
        'claim_id': receipt['logs'][0]['topics'][1],
        'block_number': receipt['blockNumber']
    }
```

### Step 5: Smart Contract Execution
```solidity
// Sepolia: 0x8c89f99F624156ED5d7E3dFCF9Fd4D939996482F

contract CompensationContract {
    function fileCompensationClaim(
        address user,
        string memory flightNumber,
        uint256 delayMinutes,
        uint256 claimType,
        uint256 routeId
    ) public {
        // 1. Validate delay
        require(delayMinutes >= 180, "Minimum 3h delay required");
        
        // 2. Calculate compensation
        uint256 amount = calculateCompensation(
            delayMinutes, 
            claimType
        );
        
        // 3. Transfer FLY tokens
        flyToken.transfer(user, amount * 10**18);
        
        // 4. Emit event
        emit ClaimFiled(user, flightNumber, amount, block.timestamp);
        
        // 5. Store claim record
        claims[user].push(Claim({
            flightNumber: flightNumber,
            amount: amount,
            timestamp: block.timestamp,
            status: "approved"
        }));
    }
}
```

### Step 6: Backend Returns Response
```javascript
Response:
{
  "status": "success",
  "transaction_hash": "0x1234...abcd",
  "claim_id": "12345",
  "message": "Claim filed successfully on Sepolia"
}
```

### Step 7: Frontend Updates UI
```javascript
const result = await blockchainDataService.fileCompensationClaim(...)

if (result.success) {
  // 1. Show success dialog with Etherscan link
  setDialog({
    title: '✅ Compensation Filed',
    message: `Tx: ${result.transactionHash}\nEtherscan: ${result.explorerUrl}`
  })
  
  // 2. Refresh compensation history
  await loadCompensationHistory(wallet.address)
  
  // 3. Refresh balance
  await refreshAccountBalance(wallet.address)
  
  // 4. Update state
  setCompensations([...])
}
```

### Step 8: User Sees Results
```
Dashboard updates:
✓ Transaction appears in "Recent Activity"
✓ FLY Balance increases
✓ Total Claims count increases
✓ Can click Etherscan link to verify
```

---

## 📊 Data Persistence Flow

### User Registration
```
Frontend Input → Backend Validation → MongoDB Save
Email + Password → Hash + Verify → User Collection
```

### Wallet Creation
```
Desktop Crypto Library → RPC Call → Account Storage
Generate Private Key → Sepolia Network → LocalStorage + DB
```

### Compensation Claims
```
Smart Contract Event → Backend Listener → Database Record
Claim Filed Event → Log Parser → Claims Collection
```

### Balance Updates
```
User Action → RPC Query → State Update → UI Render
File Claim → Contract Call → Balance Fetch → Dashboard
```

---

## 🔐 Authentication & Security Flow

```
┌─────────────────────┐
│  User Login/Reg     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Backend Auth Check  │
│ - Verify email      │
│ - Hash password     │
│ - Create JWT token  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Store JWT Token     │
│ localStorage        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Include in Headers  │
│ Authorization:      │
│   Bearer {token}    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Backend Validates   │
│ Verify JWT          │
│ Allow API access    │
└─────────────────────┘
```

---

## 💾 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  name: "John Doe",
  password_hash: "...bcrypt...",
  created_at: ISODate("2026-02-25T...")
}
```

### Claims Collection
```javascript
{
  _id: ObjectId,
  user_address: "0x209f...",
  flight_number: "AA123",
  delay_minutes: 180,
  claim_type: 2,
  amount: 150,
  tx_hash: "0x1234...",
  block_number: 5432100,
  status: "approved",
  created_at: ISODate("2026-02-25T...")
}
```

### Wallets Collection
```javascript
{
  _id: ObjectId,
  user_email: "user@example.com",
  address: "0x209f...",
  network: "Sepolia",
  chain_id: 11155111,
  created_at: ISODate("2026-02-25T...")
}
```

---

## 🔄 Real-Time Balance Update Flow

```
User Files Claim
       │
       ▼
[Frontend] Transaction Submitted
       │
       ▼
[Smart Contract] FLY Tokens Transferred
       │
       ▼
[Blockchain] Block Mined (≈12 sec)
       │
       ▼
[Frontend] User Triggered Refresh
       │
       ▼
[Backend] Query Contract: balanceOf(address)
       │
       ▼
[Smart Contract] Returns New Balance
       │
       ▼
[Frontend] Update State & Display
       │
       ▼
Dashboard Shows New Balance ✓
```

---

## 🛠️ Error Handling Flow

```
┌─────────────────┐
│  Error Occurs   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ Determine Error Type     │
├──────────────────────────┤
│ • Network error          │
│ • Invalid input          │
│ • Contract error         │
│ • Database error         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Create Error Response    │
├──────────────────────────┤
│ {                        │
│   "status": "error",     │
│   "message": "...",      │
│   "error_code": 400      │
│ }                        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Backend Logs Error       │
│ console.error(...)       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Frontend Receives Error  │
│ setDialog(...)           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Display User-Friendly    │
│ Error Message            │
└──────────────────────────┘
```

---

## 🚀 Deployment Checklist

### Frontend
- [ ] Build: `npm run build`
- [ ] Output: `frontend/dist/`
- [ ] Deploy to: Vercel/Netlify

### Backend
- [ ] Set production env vars
- [ ] Use production database
- [ ] Update contract addresses
- [ ] Deploy to: AWS/Heroku/Railway

### Smart Contracts
- [ ] Audit code
- [ ] Test coverage >90%
- [ ] Deploy to mainnet
- [ ] Verify on Etherscan

### DNS & HTTPS
- [ ] Configure domain
- [ ] Get SSL certificate
- [ ] Set CORS headers
- [ ] Enable rate limiting

---

**Data flows bi-directionally between all layers. All transactions are recorded and immutable!** 🔗
