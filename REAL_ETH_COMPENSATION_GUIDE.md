# Real SepoliaETH Compensation System Guide

## Overview

Your Flight Compensation System now fully supports real **SepoliaETH** transactions instead of dummy FLY tokens. This guide explains how to use your 0.05 SepoliaETH balance for all compensation transactions.

## Key Features

### 1. **Real Balance Display**
- **Header Balance**: Shows your real SepoliaETH balance near your username
- **Three-Column Display**:
  - **ETH**: Your SepoliaETH balance (e.g., 0.050000)
  - **USD**: Dollar equivalent (e.g., $100.00)
  - **FLY**: Equivalent FLY tokens (e.g., 50 FLY) - for reference only

### 2. **Price Conversion**
The system automatically converts between currencies:
- **1 ETH = $2,000 USD** (example rate, adjustable)
- **1 ETH = 1,000 FLY Tokens** (fixed rate for compatibility)

Example:
- 0.05 ETH = $100 USD = 50 FLY tokens

### 3. **Compensation Options**

You have three ways to send compensation:

#### Option A: Send in ETH (Recommended)
```
Amount: 0.01 ETH
Value: ~$20 USD
Equivalent: 10 FLY
```
- Direct blockchain transaction
- Fastest method
- Lower gas fees

#### Option B: Send in USD
```
Amount: $50 USD
Converts to: 0.025 ETH
Equivalent: 25 FLY
```
- System automatically converts to ETH
- Recipient receives ETH

#### Option C: Send in FLY (Token)
```
Amount: 25 FLY
Converts to: 0.025 ETH  ~$50 USD
```
- Sends FLY tokens instead of ETH
- Requires FLY token contract interaction

## How to Use

### Step 1: Check Your Balance

**In Header (Top Right)**
```
Wallet Balance
0.050000 ETH | $100.00 | 50 FLY
```

The header always shows:
- Your actual SepoliaETH balance
- USD equivalent based on current rates
- FLY token equivalent (informational)

### Step 2: Navigate to Compensate Page

1. Click "Compensate" in the navigation menu
2. You'll see your wallet profile with:
   - Email and wallet address
   - Three balance cards (ETH | USD | FLY)
   - Connection status

### Step 3: Send Compensation

1. **Select a Flight Booking** from your claimable bookings
2. **Choose Currency**:
   - Select from: ETH, USD, or FLY
3. **Enter Recipient Address**:
   - Paste the wallet address (e.g., 0xF7Dc7da...)
4. **Enter Amount**:
   - Enter amount in selected currency
   - System shows equivalent amounts automatically
5. **Review Transaction**:
   - See estimated gas fees
   - Confirm total amount with gas
6. **Send**:
   - Click "Send Compensation"
   - Approve in MetaMask
   - Wait for blockchain confirmation
7. **Confirmation**:
   - Transaction hash appears
   - View on Etherscan (optional)
   - Compensation logged with USD value

### Example Transaction Flow

User1 sends compensation to User2:

```
Step 1: Select 0.01 ETH compensation amount
Step 2: System shows:
  - Amount: 0.01 ETH
  - USD Value: $20
  - FLY Equivalent: 10 FLY
  - Estimated Gas: 0.001 ETH (~$2)
  - Total Cost: 0.011 ETH (~$22)
Step 3: Recipient receives: 0.01 ETH ($20)
Step 4: Backend logs: 
  {
    type: 'ETH',
    amount: 0.01,
    usdValue: 20.00,
    flyEquivalent: 10,
    txHash: '0x...',
    timestamp: '2026-02-26T...'
  }
```

## Service Files Reference

### 1. `priceService.js`
Handles all currency conversions:

```javascript
// Convert ETH to USD
priceService.convertETHToUSD('0.05')  // Returns: "100.00"

// Convert USD to ETH
priceService.convertUSDToETH('100')  // Returns: "0.050000"

// Convert ETH to FLY
priceService.convertETHToFLY('0.05')  // Returns: "50"

// Format complete balance
priceService.formatBalance('0.05')
// Returns: {
//   eth: "0.050000",
//   usd: "$100.00",
//   fly: "50.0000",
//   display: "0.050000 ETH ($100.00)"
// }
```

### 2. `realBalanceService.js`
Fetches actual wallet balances from blockchain:

```javascript
// Get real balance formatted
const balance = await realBalanceService.getRealBalance('0x45dd...');
// Returns: {
//   eth: "0.050000",
//   usd: "$100.00",
//   fly: "50.0000"
// }

// Get complete wallet info
const info = await realBalanceService.getWalletInfo('0x45dd...');
// Returns full wallet state with formatted balances

// Check sufficient balance
const hasFunds = await realBalanceService.hasSufficientBalance('0x45dd...', '0.01');
```

### 3. `realCompensationService.js`
Handles actual ETH/FLY transactions:

```javascript
// Send ETH compensation
await realCompensationService.sendETHCompensation(
  '0xF7Dc...',  // recipient
  '0.01',       // amount in ETH
  bookingData
);

// Send USD-equivalent
await realCompensationService.sendUSDEquivalentCompensation(
  '0xF7Dc...',
  '20',         // amount in USD
  bookingData
);

// Estimate gas fees
await realCompensationService.estimateGasFee('0.01');
// Returns: {
//   gasPrice: "30",
//   gasLimit: 21000,
//   totalGas: "0.00063",
//   gasCostUSD: "1.26",
//   totalWithGas: "0.01063",
//   totalWithGasUSD: "21.26"
// }
```

## Updated Components

### 1. Layout.jsx
- Shows real balance in header with USD
- Three-column format: ETH | USD | FLY
- Auto-updates every 10 seconds when visible
- Uses realBalanceService

### 2. CompensatePageSimple.jsx
- Three balance cards showing all currencies
- Uses realBalanceService for accurate balances
- Integrates with realCompensationService
- Shows USD equivalents for all amounts

### 3. TokenBalance.jsx (Updated)
- Currency selector (ETH/USD/FLY)
- Real-time conversion calculator
- Shows exchange rates
- Integrates priceService for calculations

## Important Notes

### Gas Fees
- All ETH transactions include gas fees (~$1-5 on Sepolia)
- System shows estimated gas before sending
- Gas is automatically calculated from recipient chain

### Test Network (Sepolia)
- Using real SepoliaETH (worth ~$0.05 per 0.05 ETH)
- All transactions are real blockchain transactions
- Visible on Etherscan: https://sepolia.etherscan.io/
- Test faucet for more funds: https://www.sepoliatech.org/

### Currency Rates
Current rates (adjustable in priceService.js):
```javascript
SEPOLIA_ETH_TO_USD = 2000;  // 1 ETH = $2000
ETH_TO_FLY = 1000;          // 1 ETH = 1000 FLY
```

To change rates:
1. Edit `frontend/src/services/priceService.js`
2. Update `SEPOLIA_ETH_TO_USD` or `ETH_TO_FLY` constants
3. All calculations automatically use new rates

### Backend Integration
Compensation transactions logged to MongoDB with:
- Transaction hash
- USD value
- User addresses
- Blockchain confirmations
- Timestamp
- FLY token equivalent

## Testing Transactions

### Test Setup
- **User1**: 0x45ddA9525B241De1a94E5c196Ac5b37c799F2530 (0.05 ETH)
- **User2**: 0xF7Dc7da1485346FbD0856FEa570885C4B8C02c6f (0.05 ETH)

### Test Flow
1. Login as User1
2. Go to Compensate page
3. Send 0.01 ETH to User2 address
4. Confirm in MetaMask
5. Wait for "confirmed" status
6. View transaction on Etherscan
7. Check User2 wallet increased by 0.01 ETH

### Verify on Etherscan
1. Go to: https://sepolia.etherscan.io/
2. Search your transaction hash
3. Verify: Amount, From/To addresses, Status (Success)

## Troubleshooting

### Balance shows $0.00
1. Check wallet connection status in header
2. Ensure MetaMask is connected to Sepolia
3. Verify wallet address in browser console
4. Refresh page to re-fetch balance

### Transaction failed
1. Check gas fee estimate before sending
2. Ensure you have enough ETH for gas (~0.001 ETH)
3. Verify recipient address is correct
4. Check MetaMask gas settings

### USD conversion not showing
1. Verify priceService.js has exchange rates
2. Check browser console for errors
3. Refresh page to reload services
4. Check localStorage for cached rates

## API Endpoints

### Send Compensation (Logged)
```
POST /api/blockchain/send-compensation
Body: {
  type: 'ETH' | 'FLY' | 'USD',
  toAddress: '0x...',
  amount: '0.01',
  usdAmount: '20.00',
  txHash: '0x...',
  bookingId: '...',
  timestamp: '2026-02-26T...'
}
```

### Get Compensation History
```
GET /api/blockchain/compensation-history?address=0x...
Response: {
  history: [
    {
      type: 'ETH',
      amount: 0.01,
      usdValue: 20,
      toAddress: '0x...',
      txHash: '0x...',
      timestamp: '2026-02-26T...',
      status: 'confirmed'
    }
  ]
}
```

## Next Steps

1. **Test Transaction**: Send 0.01 ETH from User1 to User2
2. **Verify Balance**: Check updated balances after transaction
3. **View History**: Check compensation history logs
4. **Monitor Gas**: Track gas fees and optimize amounts
5. **Production**: Deploy to mainnet when ready

---

**System Status**: ✅ Real SepoliaETH integration complete
**Balance Service**: ✅ RealBalanceService active
**Price Service**: ✅ USD conversion active (1 ETH = $2,000)
**Last Updated**: 2026-02-26
