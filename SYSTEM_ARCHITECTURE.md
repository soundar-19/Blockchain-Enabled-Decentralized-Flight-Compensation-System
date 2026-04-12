# System Architecture: Real SepoliaETH Compensation

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
├──────────────────┬──────────────────┬──────────────────────────┤
│   Header         │  Compensate Page │   TokenBalance Component │
│  (Layout.jsx)    │ (Simple.jsx)     │   (TokenBalance.jsx)     │
│                  │                  │                          │
│ 0.05 ETH         │ 3 Balance Cards  │ Currency Selector        │
│ $100.00 USD      │ ETH | USD | FLY  │ Swap Calculator          │
│ 50 FLY           │                  │ Exchange Rates           │
└──────────────────┴──────────────────┴──────────────────────────┘
         ↓                    ↓                      ↓
         └────────────────────┼──────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (Frontend)                     │
├──────────────────┬──────────────────┬──────────────────────────┤
│ priceService.js  │realBalanceService│realCompensationService.js│
│                  │.js               │                          │
│ ✓ ETH→USD        │ ✓ Fetch balance  │ ✓ Send ETH              │
│ ✓ USD→ETH        │ ✓ Get FLY tokens │ ✓ Send FLY              │
│ ✓ ETH→FLY        │ ✓ Format display │ ✓ Estimate gas          │
│ ✓ Format amounts │ ✓ Check balance  │ ✓ Log to backend        │
└──────────────────┴──────────────────┴──────────────────────────┘
         ↓                    ↓                      ↓
         └────────────────────┼──────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER (Sepolia)                   │
├──────────────────┬──────────────────┬──────────────────────────┤
│ Sepolia RPC      │ MetaMask         │ Smart Contracts          │
│ (Infura)         │ (Signing)        │                          │
│                  │                  │ FLY Token: 0xd7Ad...     │
│ https://sepolia  │ window.ethereum  │ Compensation: 0xDAf5... │
│ .infura.io       │ ethers.js v6     │                          │
└──────────────────┴──────────────────┴──────────────────────────┘
         ↓                    ↓                      ↓
         └────────────────────┼──────────────────────┘
                              ↓
                    ACTUAL BLOCKCHAIN STATE
                  (Real SepoliaETH transfers)
```

---

## Data Flow: Sending Compensation

```
┌──────────────────────────────────────────────────────────────┐
│ User Initiates Transaction                                   │
│ - Selects booking                                            │
│ - Chooses currency (ETH/USD/FLY)                            │
│ - Enters amount and recipient address                       │
└──────────────────┬───────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ priceService                                                 │
│ - Converts amount to all three currencies                   │
│ - Shows ETH | USD | FLY equivalents                         │
│ Output: {eth: "0.01", usd: "$20", fly: "10"}               │
└──────────────────┬───────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ realBalanceService                                           │
│ - Fetches current balance from blockchain                  │
│ - Verifies sufficient funds                                │
│ - Returns formatted balance info                           │
└──────────────────┬───────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ realCompensationService                                      │
│ - Estimates gas fees                                         │
│ - Shows total cost (amount + gas)                           │
│ - Requests MetaMask approval                                │
└──────────────────┬───────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ MetaMask                                                     │
│ - User reviews transaction                                  │
│ - User clicks "Confirm"                                     │
│ - User signs transaction                                    │
└──────────────────┬───────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ Sepolia Blockchain                                           │
│ - Transaction sent to network                               │
│ - Miners/validators process transaction                    │
│ - Block confirmation (1 block = ~12 seconds)               │
│ - Transaction becomes permanent                            │
└──────────────────┬───────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ Backend (Python/Flask)                                       │
│ POST /api/blockchain/send-compensation                      │
│ - Receives transaction hash                                 │
│ - Logs with USD value                                       │
│ - Stores in MongoDB                                         │
│ - Returns confirmation                                      │
└──────────────────┬───────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ Etherscan                                                    │
│ - Transaction visible at:                                   │
│ - https://sepolia.etherscan.io/tx/0x...                    │
│ - Shows: from, to, amount, gas, timestamp                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Balance Update Flow

```
┌────────────────────────────┐
│ User Page Load or Refresh  │
└─────────────┬──────────────┘
              ↓
┌────────────────────────────────────────┐
│ realBalanceService.getWalletInfo()     │
└────────────────┬───────────────────────┘
                 ↓
        ┌────────┴────────┐
        ↓                 ↓
┌─────────────────┐  ┌──────────────────┐
│ RPC Call        │  │ FLY Token Call   │
│ getBalance()    │  │ balanceOf()      │
└────────┬────────┘  └────────┬─────────┘
         ↓                    ↓
    ETH Balance          FLY Balance
    (Wei) ────────┐     (Raw amount)
                  ↓                ↓
            ┌─────────────────────────┐
            │ Format & Convert        │
            │ - Convert Wei to ETH    │
            │ - Calculate USD         │
            │ - Calculate FLY equiv   │
            └──────────┬──────────────┘
                       ↓
            ┌────────────────────────────┐
            │ Return Formatted Object    │
            │ {                          │
            │  eth: "0.050000",         │
            │  usd: "$100.00",          │
            │  fly: "50.0000",          │
            │  display: "0.050000 ETH..." │
            │ }                          │
            └──────────┬─────────────────┘
                       ↓
        ┌──────────────┴──────────────┐
        ↓                             ↓
    UI Update             State Update
    Display values        React useState
    (Header/Component)    (ethBalance, etc)
```

---

## Currency Conversion Matrix

```
                     priceService
                            |
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
      1 ETH              1 USD              1 FLY
        |                  |                  |
        |                  |                  |
        ├─→ $2,000         |                  |
        |                  |                  |
        ├─→ 1,000 FLY      |                  |
        |                  |                  |
        |              ←─── ÷ 2,000            |
        |                  |                  |
        |              ←─── × $2,000           |
        |                  |                  |
        └─→ $0.002 per FLY ←─ ÷ 1,000    ¬─── ÷ 1,000 FLY
                           |                  |
                       = 1 FLY            ←─── = $0.002
                           |
                           |
                    Example for User:
                    0.05 ETH
                       |
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      0.05 ETH     $100.00 USD    50 FLY
     (your amt)   (value today)   (tokens)
```

---

## Service Integration Map

```
Layout.jsx (Header)
    │
    ├─→ realBalanceService.getWalletInfo()
    │       ├─→ fetches from Infura RPC
    │       ├─→ priceService.convertETHToUSD()
    │       └─→ returns {eth, usd, fly}
    │
    └─→ Display updating every 10 seconds

CompensatePageSimple.jsx
    │
    ├─→ realBalanceService.getWalletInfo()
    │       └─→ Show in 3 balance cards
    │
    ├─→ TokenBalance.jsx
    │       ├─→ priceService conversions
    │       ├─→ Swap calculator
    │       └─→ Currency selector
    │
    └─→ realCompensationService.sendETHCompensation()
            ├─→ Collects MetaMask signature
            ├─→ Sends transaction to Sepolia
            ├─→ Logs to Backend API
            └─→ Returns transaction hash

Backend API
    │
    └─→ /api/blockchain/send-compensation
            ├─→ Receives transaction data
            ├─→ Stores with USD value
            ├─→ Logs to MongoDB
            └─→ Returns confirmation
```

---

## File Dependencies

```
Layout.jsx
    ├─ imports: realBalanceService
    └─ imports: priceService

CompensatePageSimple.jsx
    ├─ imports: realBalanceService
    ├─ imports: priceService
    └─ imports: realCompensationService

TokenBalance.jsx
    ├─ imports: realBalanceService
    ├─ imports: priceService
    └─ imports: compensationService
        └─ uses: realCompensationService methods

priceService.js
    └─ (no external dependencies - pure logic)

realBalanceService.js
    ├─ imports: ethers.js
    ├─ imports: priceService
    └─ uses: Infura RPC endpoint

realCompensationService.js
    ├─ imports: ethers.js
    ├─ imports: priceService
    └─ uses: MetaMask (window.ethereum)
        ├─ Sign transactions
        ├─ Read balances
        └─ Send to network
```

---

## External Integrations

```
┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Infura RPC (Read-only balance queries)                    │
│  https://sepolia.infura.io/v3/a75bc1be3bb...             │
│  - getBalance() calls                                      │
│  - ERC20 contract reads                                    │
│  └─ No transactions (cheaper/faster)                       │
│                                                             │
│  MetaMask (User signing & transactions)                    │
│  window.ethereum provider                                  │
│  - Sign transactions                                       │
│  - Broadcast to network                                    │
│  - Store user's private key (local)                        │
│  └─ Real transactions (slower)                             │
│                                                             │
│  Sepolia Network (Blockchain)                              │
│  - Receive transactions from MetaMask                      │
│  - Execute smart contract calls                            │
│  - Store transaction permanently                           │
│  └─ ~12 second block time                                  │
│                                                             │
│  Etherscan (Public transaction explorer)                   │
│  https://sepolia.etherscan.io/                            │
│  - View transaction details                                │
│  - Track transaction status                                │
│  - Verify on-chain data                                    │
│  └─ Real-time updates                                      │
│                                                             │
│  Backend API (Logging & History)                           │
│  http://localhost:5000                                     │
│  - Log transactions with USD values                        │
│  - Store in MongoDB                                        │
│  - Retrieve transaction history                            │
│  └─ Application data storage                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Transaction Lifecycle

```
┌─────────────────────────────────────────────────────────────┐

USER SUBMITS TRANSACTION
    │
    ├─ Status: "Pending"
    ├─ TX Hash: Assigned
    └─ Location: Local (not on chain yet)
    
                  ↓
    
MetaMask Signs Transaction
    │
    ├─ User approves in MetaMask
    ├─ Private key signs locally
    └─ Signed TX ready to broadcast
    
                  ↓
    
Transaction Broadcast to Network
    │
    ├─ Status: "Submitted"
    ├─ Location: Network mempool
    └─ Waiting for validators
    
                  ↓
    
Included in Block
    │
    ├─ Status: "Confirmed"
    ├─ Block: #12345678
    ├─ Location: On blockchain
    └─ 1st confirmation received
    
                  ↓
    
Additional Blocks (2-3 confirmations)
    │
    ├─ Status: "Confirmed"
    ├─ Block: #12345679+
    ├─ Confirmations: 2-3
    └─ Become immutable
    
                  ↓
    
Final State
    │
    ├─ Status: "Success" ✓
    ├─ Visible on Etherscan
    ├─ Balance updated
    └─ Logged with USD value
    
└─────────────────────────────────────────────────────────────┘

Total Time: ~1-5 minutes depending on network
```

---

## Error Handling Flow

```
Try: User sends transaction
    │
    ├─ Catch: User denies in MetaMask
    │   └─ Show: "Transaction cancelled by user"
    │
    ├─ Catch: Insufficient balance
    │   └─ Show: "Not enough ETH (need X, have Y)"
    │
    ├─ Catch: Invalid recipient address
    │   └─ Show: "Invalid wallet address"
    │
    ├─ Catch: Network error
    │   └─ Show: "Network error - try again"
    │
    ├─ Catch: MetaMask not connected
    │   └─ Show: "Please connect MetaMask"
    │
    ├─ Catch: Wrong network
    │   └─ Show: "Please switch to Sepolia testnet"
    │
    └─ Success: Transaction sent
        └─ Show: "TX Hash: 0x... ✓"
```

---

## Performance Considerations

```
Operation              | Time    | Cost
─────────────────────────────────────────
Fetch balance          | 1-2s    | Free (RPC)
Convert currency       | <1ms    | Free (math)
Estimate gas fee       | 1-2s    | Free (RPC)
Send ETH transaction   | 15-60s  | ~$1-3 gas
Wait for confirmation  | 12-300s | (included)
Log to backend         | 1-2s    | Server call
Get history            | 1-2s    | DB query
Display update         | <1ms    | React render
```

---

## Security Considerations

```
✅ SECURE:
- Private keys never leave MetaMask
- Transactions signed locally
- Using Infura public RPC (read-only)
- No private keys in frontend code
- No sensitive data in localStorage
- All transactions on public blockchain

⚠️ TESTNET ONLY:
- SepoliaETH has no real value
- Use for testing/development
- Switch to mainnet for production
- Addresses visible on Etherscan

🔐 USER RESPONSIBILITY:
- Don't share private keys
- Don't approve malicious contracts
- Verify addresses before sending
- Keep MetaMask updated
```

---

This architecture ensures:
✅ Real blockchain integration
✅ Secure transaction handling
✅ Accurate price conversion
✅ Seamless user experience
✅ Proper error handling
✅ Complete transaction logging
