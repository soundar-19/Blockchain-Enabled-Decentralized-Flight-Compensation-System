# Voucher System Implementation Guide

## Overview

The voucher system allows users to receive flight delay compensation as digital vouchers instead of direct ETH transfers. Vouchers are stored on the blockchain and can be redeemed later.

## Key Features

### 1. **Claim Methods**
Users can now choose between two compensation claim methods:
- **Direct ETH Transfer**: Receive compensation directly to their wallet (original method)
- **Voucher Claim**: Receive a digital voucher code with compensation amount held in a secure voucher wallet

### 2. **Voucher Wallet**
All voucher claims are transferred to a dedicated voucher wallet:
```
Address: 0x32C532f9b48334c3F3f4410494163ec5Af109c62
```

### 3. **Voucher Code Generation**
Each voucher is assigned a unique 12-character alphanumeric code, e.g.:
```
EXAMPLE123AB
```

## System Architecture

### Frontend Components

#### CompensatePage.jsx
**File**: `frontend/src/pages/Compensate/CompensatePage.jsx`

**Features**:
- Claim method selector (Direct ETH or Voucher)
- Form validation for flight number, delay, and compensation type
- Success/error message display
- Support for both claim methods through blockchainService

**Key Changes**:
```javascript
// New state field
claimMethod: 'direct' // 'direct' or 'voucher'

// Updated handler
if (compensationForm.claimMethod === 'voucher') {
  result = await blockchainService.fileVoucherClaim(...);
} else {
  result = await blockchainService.fileCompensationClaim(...);
}
```

#### BlockchainDataService
**File**: `frontend/src/services/blockchainDataService.js`

**New Methods**:
1. `fileVoucherClaim(userAddress, flightNumber, delayMinutes, claimType, routeId)`
   - Files a voucher claim via backend
   - Returns voucher code and transaction hash

2. `getUserVouchers(userAddress)`
   - Fetches all vouchers for a user
   - Returns list of vouchers with status

3. `verifyVoucher(voucherCode)`
   - Verifies a voucher code
   - Returns voucher details and validity status

4. `redeemVoucher(voucherCode, userAddress)`
   - Marks a voucher as redeemed
   - Returns confirmation

### Backend Components

#### blockchain_service.py
**File**: `backend/blockchain/blockchain_service.py`

**New Method**: `transfer_to_voucher_wallet()`

```python
def transfer_to_voucher_wallet(self, amount_eth, user_address, 
                               flight_number, delay_minutes, claim_type):
    """
    Transfers ETH to voucher wallet and generates voucher code
    
    Returns:
    {
        'status': 'success',
        'transaction_hash': '0x...',
        'voucher_code': 'ABC123XYZ789',
        'amount_transferred': 0.3,
        ...
    }
    """
```

#### blockchain_routes.py
**File**: `backend/api/blockchain_routes.py`

**New Endpoints**:

##### 1. File Voucher Claim
```
POST /blockchain/compensation/file-voucher-claim
Content-Type: application/json

{
  "user_address": "0x...",
  "flight_number": "AA1234",
  "delay_minutes": 300,
  "claim_type": 1,
  "route_id": 1
}

Response:
{
  "status": "success",
  "voucher_code": "ABC123XYZ",
  "claim_id": "mongo_id",
  "transaction_hash": "0x...",
  "compensationAmount": 0.3
}
```

##### 2. Get User Vouchers
```
GET /blockchain/vouchers/{user_address}

Response:
{
  "status": "success",
  "vouchers": [
    {
      "voucherCode": "ABC123XYZ",
      "compensationAmount": 0.3,
      "status": "active|redeemed|expired",
      "flightNumber": "AA1234",
      "createdAt": "2024-01-15T10:30:00"
    }
  ],
  "count": 1
}
```

##### 3. Verify Voucher
```
GET /blockchain/vouchers/verify/{voucher_code}

Response:
{
  "status": "success",
  "voucher": {...},
  "isValid": true,
  "isRedeemed": false
}
```

##### 4. Redeem Voucher
```
POST /blockchain/vouchers/redeem
Content-Type: application/json

{
  "voucher_code": "ABC123XYZ",
  "user_address": "0x..."
}

Response:
{
  "status": "success",
  "message": "Voucher redeemed successfully",
  "voucherCode": "ABC123XYZ",
  "amount": 0.3
}
```

### Database Schema

#### Vouchers Collection

```javascript
{
  _id: ObjectId,
  userAddress: "0x...",
  flightNumber: "AA1234",
  delayMinutes: 300,
  claimType: 1,
  compensationAmount: 0.3,
  voucherCode: "ABC123XYZ789",
  transactionHash: "0x...",
  blockNumber: 5123456,
  status: "active",           // active, redeemed, expired
  voucherWallet: "0x32C532f9b48334c3F3f4410494163ec5Af109c62",
  createdAt: ISODate(),
  redeemedAt: null,
  redeemedByAddress: null,
  verificationStatus: "verified"
}
```

#### Claims Collection Updates

Existing claims collection now includes:
```javascript
{
  ...existing fields...
  claimMethod: "voucher",    // "voucher" or "direct"
  voucherId: ObjectId,       // Reference to voucher
  ...
}
```

## Compensation Amounts (ETH)

Based on delay duration:

| Claim Type | Amount (ETH) |
|-----------|-------------|
| Food (0)  | 0.05 ETH    |
| Hotel (1) | 0.3 ETH     |
| Transport (2) | 0.1 ETH  |
| Refund (3) | 0.5 ETH    |

Minimum delay required: **180 minutes (3 hours)**

## Workflow

### Filing a Voucher Claim

1. User navigates to CompensatePage
2. Selects "As Voucher" claim method
3. Fills in flight details:
   - Flight Number (e.g., AA1234)
   - Delay Duration (minutes)
   - Compensation Type (Food, Hotel, Transport, Refund)
4. Clicks "File Claim on Blockchain"
5. Backend processes:
   - Validates flight and delay
   - Calculates compensation amount
   - Transfers ETH to voucher wallet (0x32C532...)
   - Creates voucher record with unique code
   - Stores claim record in database
6. User receives:
   - Voucher code
   - Transaction hash
   - Etherscan link
   - Confirmation message

### Redeeming a Voucher

1. User obtains voucher code (from claim confirmation)
2. Can verify voucher authenticity:
   - Call verify endpoint with voucher code
   - Check status and amount
3. Redeem voucher:
   - Call redeem endpoint
   - Mark voucher as redeemed in database
   - (Future: Trigger ETH transfer to user wallet)

### Viewing Vouchers

Users can view all their vouchers:
- Get user vouchers list
- See status (active, redeemed, expired)
- View compensation amount
- Check creation date
- Track flight information

## Testing Guide

### Prerequisites
1. MetaMask connected with Sepolia testnet
2. Test account with ETH balance
3. Voucher wallet has sufficient ETH

### Test Scenarios

#### Test 1: File Direct ETH Claim
```
1. Go to CompensatePage
2. Select "Direct ETH Transfer"
3. Enter:
   - Flight: TEST123
   - Delay: 300 minutes
   - Type: Hotel
4. Click "File Claim"
5. Verify: ETH received in wallet
```

#### Test 2: File Voucher Claim
```
1. Go to CompensatePage
2. Select "As Voucher"
3. Enter same details as Test 1
4. Click "File Claim"
5. Verify: Voucher code displayed
6. Check: Vouchers in database created
7. Note: Transaction should go to voucher wallet
```

#### Test 3: Verify Voucher
```
1. Copy voucher code from claim
2. Call: GET /blockchain/vouchers/verify/{code}
3. Verify: Status is "active"
4. Check: Amount matches claim
```

#### Test 4: Redeem Voucher
```
1. Call: POST /blockchain/vouchers/redeem
2. Send: voucher_code and user_address
3. Verify: Status updated to "redeemed"
4. Check: redeemedAt timestamp set
```

#### Test 5: List User Vouchers
```
1. Call: GET /blockchain/vouchers/{user_address}
2. Verify: All vouchers for user returned
3. Check: Includes both active and redeemed
```

### API Testing Commands

Using cURL or Postman:

```bash
# File voucher claim
curl -X POST http://localhost:5000/api/blockchain/compensation/file-voucher-claim \
  -H "Content-Type: application/json" \
  -d '{
    "user_address": "0x...",
    "flight_number": "TEST123",
    "delay_minutes": 300,
    "claim_type": 1
  }'

# Get user vouchers
curl http://localhost:5000/api/blockchain/vouchers/0x...

# Verify voucher
curl http://localhost:5000/api/blockchain/vouchers/verify/ABC123XYZ

# Redeem voucher
curl -X POST http://localhost:5000/api/blockchain/vouchers/redeem \
  -H "Content-Type: application/json" \
  -d '{
    "voucher_code": "ABC123XYZ",
    "user_address": "0x..."
  }'
```

## Error Handling

### Common Errors

1. **Delay too short**
   ```
   Error: Delay must be at least 180 minutes (3 hours)
   ```
   Fix: Ensure delay_minutes is >= 180

2. **Wallet not connected**
   ```
   Error: Please create or connect a wallet first
   ```
   Fix: Connect MetaMask wallet

3. **Invalid address format**
   ```
   Error: Invalid user address
   ```
   Fix: Use valid Ethereum address (0x...)

4. **Voucher not found**
   ```
   Error: Voucher not found
   ```
   Fix: Check voucher code spelling

5. **Voucher already redeemed**
   ```
   Error: Voucher is redeemed, cannot be redeemed
   ```
   Fix: Use a different active voucher

## Security Considerations

1. **Voucher Wallet Recovery**
   - The designated voucher wallet (0x32C532f9b48334c3F3f4410494163ec5Af109c62) holds all voucher compensation
   - Ensure this wallet is secure and backed up
   - Consider multi-sig wallet for production

2. **Voucher Code Generation**
   - Codes are generated using MD5 hash of transaction hash + user address + timestamp
   - Codes are unique per transaction
   - Store codes securely in database

3. **Database Integrity**
   - Vouchers collection indexed by voucherCode for fast lookup
   - Immutable recording of all voucher transactions
   - Timestamp verification against blockchain

4. **Transaction Verification**
   - All transfers verified via Etherscan
   - Gas usage tracked for cost analysis
   - Reorg protection via confirmation waiting

## Future Enhancements

1. **Voucher Dashboard**
   - Dedicated page showing user's vouchers
   - Filter by status (active, redeemed, expired)
   - Expiration date support
   - Export voucher list

2. **Automatic Redemption**
   - Automated ETH transfer from voucher wallet to user wallet
   - Scheduled batch processing for redemptions
   - Gas optimization for multiple transfers

3. **Voucher Marketplace**
   - Transfer vouchers between users
   - Trade vouchers for different compensation types
   - Voucher pooling for larger amounts

4. **Analytics**
   - Voucher utilization rates
   - Redemption timeline analysis
   - Cost per voucher tracking

5. **Notifications**
   - Email/SMS when voucher created
   - Reminder to redeem before expiration
   - Redemption confirmation

## Troubleshooting

### Issue: Voucher not appearing in list
**Solution**:
1. Check user address is lowercase in database
2. Verify vouchers collection exists
3. Check transaction confirmation on Etherscan

### Issue: Verification timeout
**Solution**:
1. Check Etherscan for transaction
2. Wait for additional confirmations
3. Check gas price (may need to increase)

### Issue: Voucher code not generating
**Solution**:
1. Check DEPLOYER_PRIVATE_KEY is set
2. Verify deployer account has ETH balance
3. Check voucher wallet address is valid

## Support

For issues or questions:
1. Check Etherscan for transaction status
2. Verify database vouchers collection
3. Check backend logs for errors
4. Review console logs in browser DevTools

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Fully Functional
