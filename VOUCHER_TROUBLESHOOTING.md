# Voucher Claim Troubleshooting Guide

## Issue Summary
- ETH is being added to user wallet instead of voucher wallet (0x32C532f9b48334c3F3f4410494163ec5Af109c62)
- Voucher is not showing on user's voucher page
- Database may not be storing voucher records

## Diagnostic Steps

### Step 1: Check Browser Console Logging

1. **Open DevTools** (Press F12)
2. **Go to Console tab**
3. **File a voucher claim** (Select "As Voucher" method)
4. **Look for these logs**:

   ```
   🔵 Filing voucher claim...
   📤 Payload: {...}
   📥 Response Status: 200
   ✅ Voucher claim response: {...}
   ```

**What to look for:**
- ✅ If you see `✅ Voucher claim response`, the backend succeeded
- ❌ If you see error in response, note the error message
- ❌ If response status is not 201 or 200, there's a backend issue

### Step 2: Check Backend Logs

1. **Look at the terminal running Flask backend**
2. **You should see logs like this**:

   ```
   🔵 FILE VOUCHER CLAIM REQUEST:
      User: 0x...
      Flight: AA1234
      Delay: 300 minutes
      Type: 1
   ✓ Database connection obtained
   ✓ Compensation calculated: 0.3 ETH
   🟡 Calling transfer_to_voucher_wallet()...
   🟣 TRANSFER_TO_VOUCHER_WALLET CALLED:
      Amount: 0.3 ETH
      To Wallet: 0x32C532f9b48334c3F3f4410494163ec5Af109c62
   ...
   ✅ VOUCHER CLAIM COMPLETE - Returning successful response
   ```

**What to look for:**
- ❌ If you see `❌ EXCEPTION`, there's an error (check message)
- ❌ If you don't see `TRANSFER_TO_VOUCHER_WALLET CALLED`, endpoint wasn't reached
- ❌ If you see `❌ Failed to transfer to voucher wallet`, check Etherscan link

### Step 3: Verify Transaction on Etherscan

1. **From browser console**, find the transaction hash in the response
2. **Go to** https://sepolia.etherscan.io
3. **Paste the transaction hash in search**
4. **Check the transaction**:
   - **To Address**: Should be `0x32C532f9b48334c3F3f4410494163ec5Af109c62` (voucher wallet)
   - **From Address**: Should be your deployer account
   - **Value**: Should show the ETH amount
   - **Status**: Should be "Success" or "Pending"

**Common Issues:**
- ❌ If "To Address" is user wallet instead of voucher wallet → `transfer_to_voucher_wallet()` not being called
- ❌ If transaction failed → deployer account has no ETH or wrong private key
- ❌ If no transaction found → transaction hash is wrong or fake

### Step 4: Check MongoDB Database

1. **Connect to MongoDB**:
   ```bash
   mongosh
   use flight_compensation_db
   ```

2. **Check vouchers collection**:
   ```javascript
   db.vouchers.find().pretty()
   // OR filter by user:
   db.vouchers.find({userAddress: "0x..."}).pretty()
   ```

3. **What to look for**:
   - ✅ Should see voucher records with `voucherCode`, `transactionHash`, `status: "active"`
   - ❌ No records → database insert failed
   - ❌ Records exist but status is not "active" → something went wrong

4. **Check claims collection**:
   ```javascript
   db.claims.find({claimMethod: "voucher"}).pretty()
   ```

   Should have matching claim records with `voucherCode` reference

### Step 5: Check User Voucher Page

1. **After filing voucher claim**, go to user voucher page
2. **If voucher not showing**:

   **Option A**: Check the API endpoint directly
   ```bash
   # Replace with your user address
   curl http://localhost:5000/api/blockchain/vouchers/0xYOURUSERADDRESS
   ```

   Should return:
   ```json
   {
     "status": "success",
     "vouchers": [
       {
         "voucherCode": "ABC123XYZ789",
         "compensationAmount": 0.3,
         ...
       }
     ]
   }
   ```

   **Option B**: If database has records but API returns empty, check:
   - User address case sensitivity (should be lowercase in DB)
   - Check if collection exists: `db.getCollectionNames()`

## Common Issues & Solutions

### Issue 1: ETH Goes to User Wallet Instead of Voucher Wallet

**Symptoms:**
- User sees ETH in their wallet
- Voucher not created
- Backend logs show direct transfer happening

**Cause**: `transfer_to_voucher_wallet()` not being called

**Solution**:
1. Check backend logs for "TRANSFER_TO_VOUCHER_WALLET CALLED"
2. If missing, check:
   - Is `compensation_amount` calculated correctly?
   - Is validation passing?
   - Check for errors before transfer call

**Debug**: Look for `❌` errors in backend logs and note the exact message

---

### Issue 2: Voucher Records Not in Database

**Symptoms:**
- Backend says claim successful
- But voucher not in MongoDB

**Cause**: Database insert failing (silent error)

**Solution**:
1. Check backend logs for "Inserting voucher record into database..."
2. Look for `❌ Database insertion error:` message
3. Common causes:
   - MongoDB connection failed
   - Vouchers collection doesn't exist
   - Field validation error

**Debug**:
```javascript
// Verify collection exists
db.getCollectionNames()

// Create index if missing
db.vouchers.createIndex({voucherCode: 1}, {unique: true})
db.vouchers.createIndex({userAddress: 1})
```

---

### Issue 3: Voucher Shows in DB But Not on Frontend Page

**Symptoms:**
- `db.vouchers.find()` shows records
- But user page displays empty list

**Cause**: API endpoint returning empty or frontend not querying correctly

**Solutions**:

**A. Test API directly**:
```bash
# Get your address from MetaMask
curl "http://localhost:5000/api/blockchain/vouchers/0xYOURLOWERCASEADDRESS"
```

**B. Check userAddress case in database**:
```javascript
// Check what's in DB
db.vouchers.find({}, {userAddress: 1}).limit(5)

// Should be all lowercase
// If not, update:
db.vouchers.updateMany({}, [
  {$set: {userAddress: {$toLower: "$userAddress"}}}
])
```

**C. Check frontend address format**:
- MetaMask gives mixed case address
- Backend converts to lowercase
- Make sure you're querying with lowercase

---

### Issue 4: Backend Throws Exception

**Symptoms**:
- Backend logs show `❌ EXCEPTION in file_voucher_claim:`
- Full traceback in terminal

**Solutions**:
1. **Read the exception message carefully** - it usually tells you what's wrong
2. **Common exceptions**:

   | Exception | Cause | Fix |
   |-----------|-------|-----|
   | `No module named 'hashlib'` | Import missing | Check imports in blockchain_service.py |
   | `AttributeError: 'NoneType' contract_manager` | Not initialized | Check blockchain_service init |
   | `InvalidPrivateKey` | DEPLOYER_PRIVATE_KEY invalid | Check .env file |
   | `InsufficientFunds` | Deployer has no ETH | Send ETH to deployer account |
   | `TypeError: 'str' object is not callable` | Type error | Check variable names |

3. **Full traceback** - copy it and search for specific error

---

## Testing Procedure

### Complete Test Flow

1. **Setup**:
   ```bash
   # Terminal 1: Backend
   cd backend
   python app.py
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

2. **Test in Browser**:
   - Go to http://localhost:5173/compensate
   - Connect MetaMask wallet
   - Fill form:
     - Flight: TEST123
     - Delay: 300 minutes
     - Type: Hotel
   - **Select "As Voucher"** ← This is important!
   - Click "File Claim"

3. **Monitor**:
   - **Browser Console**: Watch for logging
   - **Backend Terminal**: Watch for logging
   - **Etherscan**: Search for transaction hash

4. **Verify**:
   - Check transaction on Etherscan
   - Check user vouchers list
   - Check database records

---

## Quick Diagnostic Commands

**Run these to identify the issue:**

```bash
# 1. Check if backend is running
curl http://localhost:5000/api/test/status

# 2. Test voucher endpoint (replace address)
curl "http://localhost:5000/api/blockchain/vouchers/0x..."

# 3. Check database connection
mongosh -version  # (or mongo)

# 4. List all collections
mongosh
use flight_compensation_db
show collections

# 5. Count voucher records
db.vouchers.countDocuments()

# 6. Get recent voucher
db.vouchers.findOne({}, {sort: {createdAt: -1}})
```

---

## Data Flow Verification

To verify the complete flow, check each step:

```
Frontend: fileVoucherClaim() called
    ↓ (Check browser console)
Backend: /file-voucher-claim endpoint received
    ↓ (Check backend logs)
Validation: Flight, delay, type checked
    ↓ (Check backend logs)
Calculation: Compensation amount calculated
    ↓ (Check backend logs: "Compensation calculated: X ETH")
Transfer: transfer_to_voucher_wallet() called
    ↓ (Check backend logs: "TRANSFER_TO_VOUCHER_WALLET CALLED")
Blockchain: Transaction sent to Sepolia
    ↓ (Check Etherscan)
Database: Voucher record created
    ↓ (Check MongoDB)
Response: Frontend shows voucher code
    ↓ (Check browser console)
Display: Voucher appears in user list
    ↓ (Check frontend page)
```

**If flow breaks at any point**, check logs at that step.

---

## Logs Reference

### Frontend Console Colors
- 🔵 Blue: Info
- 📤 Arrow up: Request sent
- 📥 Arrow down: Response received
- ✅ Green: Success
- ❌ Red: Error

### Backend Console Colors
- 🔵 Blue: New request starting
- 🟡 Yellow: Progress/intermediate step
- 🟣 Purple: Function call
- ✓ Green: Success
- ❌ Red: Error
- ⚠️ Warning: Issue but continuing
- ✅ Bright: Complete

---

## Next Steps

**Report with these details**:
1. What you see in **browser console** (copy all logs from "Filing voucher" onwards)
2. What you see in **backend terminal** (copy all logs from "FILE VOUCHER CLAIM" onwards)
3. The **transaction hash** (if shown)
4. **MongoDB output** from `db.vouchers.findOne()`
5. Whether voucher was **sent to correct wallet** (check Etherscan)

This information will pinpoint exactly where the issue is occurring.

---

**Last Updated**: 2024  
**Status**: Diagnostic Guide Ready for Use
