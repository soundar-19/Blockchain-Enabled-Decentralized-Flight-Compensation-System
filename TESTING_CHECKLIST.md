# ✅ SkyGuard DAO - Testing & Verification Checklist

**Date Started:** ________________  
**Date Completed:** ________________  
**Tester Name:** ________________  

---

## 🚀 Phase 1: Startup & Connection

### Backend Startup
- [ ] Navigate to `d:\Blockchain_Enabled_Flight_Compensation_System\backend`
- [ ] Run `python run.py`
- [ ] See "Running on http://localhost:5000" message
- [ ] No errors in console
- [ ] Backend is responsive

**Issues Found:** _______________________________________________________________

### Frontend Startup
- [ ] Navigate to `d:\Blockchain_Enabled_Flight_Compensation_System\frontend`
- [ ] Run `npm run dev`
- [ ] See "Local: http://localhost:5177" message
- [ ] No build errors
- [ ] Frontend loads in browser

**Issues Found:** _______________________________________________________________

### API Connectivity
- [ ] Open browser console: `F12`
- [ ] Run: `fetch('http://localhost:5000/api/blockchain/status').then(r => r.json()).then(console.log)`
- [ ] See blockchain status response
- [ ] Status shows "connected"
- [ ] Shows Sepolia network

**Response:** ___________________________________________________________________

---

## 👤 Phase 2: User Registration & Login

### Register New Account
- [ ] Click "Register" on login page
- [ ] Enter valid email address
- [ ] Enter password (min 6 chars)
- [ ] Click "Register"
- [ ] See success message: "Account Created!"
- [ ] Can log in with these credentials
- [ ] Account appears in MongoDB

**Email Used:** __________________________________________________________________
**Any Errors:** ___________________________________________________________________

### Login with Account
- [ ] Click "Login"
- [ ] Enter same email & password
- [ ] Click "Login"
- [ ] Successfully logged in
- [ ] Redirected to Dashboard
- [ ] Account name shown in top header

**Status:** ✅ Success / ❌ Failed

---

## 🔐 Phase 3: Blockchain Wallet Operations

### Create New Wallet
- [ ] Go to Dashboard (after login)
- [ ] Find "Blockchain Wallet" card
- [ ] See "Create Wallet" button (no wallet yet)
- [ ] Click "Create Wallet"
- [ ] See loading indicator
- [ ] Receive success message
- [ ] Wallet address displayed (0x...)
- [ ] Address is 42 characters long
- [ ] Private key mentioned (save securely!)

**Wallet Address:** ______________________________________________________________
**See in Dashboard:** ✅ Yes / ❌ No

### Verify Wallet Persistence
- [ ] Refresh page (F5)
- [ ] Dashboard still shows wallet address
- [ ] No need to create again
- [ ] Address in localStorage (check via DevTools)

**Status:** ✅ Persisted / ❌ Lost

### Copy Wallet Address
- [ ] Click "Copy Address" button in wallet card
- [ ] Notification shows "Copied!"
- [ ] Can paste wallet address elsewhere
- [ ] No additional dialogs

**Status:** ✅ Works / ❌ Failed

---

## 💰 Phase 4: Test ETH Acquisition

### Get Test ETH from Faucet
- [ ] Visit: https://sepolia-faucet.pk910.de/
- [ ] Paste your wallet address from Dashboard
- [ ] Complete captcha if required
- [ ] Request test ETH
- [ ] Wait for confirmation
- [ ] Receive ~1 test ETH (may take 1-2 min)
- [ ] Keep faucet window open until done

**Faucet Request Time:** __________________________________________________________
**ETH Received:** ✅ Yes / ❌ No (still waiting/failed)

### Verify Balance Update
- [ ] Return to Dashboard
- [ ] Click Dashboard tab to refresh
- [ ] Wait for balance to update (max 2 min)
- [ ] See ETH balance > 0
- [ ] Balance shows in "ETH Balance" card
- [ ] Shows network is "Sepolia"

**Reported Balance:** _____________________________________________________________
**On Etherscan:** https://sepolia.etherscan.io/address/{YOUR_WALLET_ADDRESS}

---

## 📝 Phase 5: Compensation Claim Filing

### Navigate to Compensation
- [ ] Click "Compensate" tab
- [ ] Form appears with fields
- [ ] All form fields visible
- [ ] No errors in console

**Fields Visible:**
- [ ] Flight Number input
- [ ] Delay Minutes input
- [ ] Compensation Type dropdown
- [ ] File Claim button

### Fill Compensation Form
- [ ] Enter Flight Number: `AA123`
- [ ] Enter Delay Minutes: `180`
- [ ] Select Compensation Type: `Hotel`
- [ ] All fields populated correctly
- [ ] No validation errors

**Form Data:**
```
Flight: AA123
Delay: 180 minutes
Type: Hotel
```

### File Claim
- [ ] Click "File Claim" button
- [ ] See loading indicator ("Filing...")
- [ ] Wait for transaction (5-10 seconds)
- [ ] See success message with:
  - ✅ "Compensation Filed" title
  - ✅ Transaction hash (0x...)
  - ✅ Etherscan link
- [ ] Message shows claim filed successfully

**Transaction Hash:** ____________________________________________________________
**Etherscan Link:** ______________________________________________________________

### Verify on Etherscan
- [ ] Copy Etherscan link from message
- [ ] Open link in new tab
- [ ] Page loads successfully
- [ ] Shows transaction details
- [ ] Shows "Sepolia" network
- [ ] Status eventually shows "Success" ✓
- [ ] Takes 1-2 blocks to confirm (~30 sec)

**Etherscan Verified:** ✅ Yes / ❌ No (pending/failed)

---

## 💳 Phase 6: Balance Updates

### Initial Balance Check
- [ ] Note ETH balance before claim (if visible)
- [ ] Then file compensation claim
- [ ] Wait for transaction confirmation (1-2 blocks)

**Balance Before:** _______________________________________________________________

### Refresh Balance After Claim
- [ ] Go back to Dashboard
- [ ] Click Dashboard tab
- [ ] Let page refresh
- [ ] Check "FLY Balance" card
- [ ] Should increase by claim amount
- [ ] Check "Total Compensated" metric
- [ ] Should show claim amount

**Balance After:** ________________________________________________________________
**FLY Balance Increased:** ✅ Yes / ❌ No

### Recent Activity
- [ ] Go to Dashboard
- [ ] Find "Recent Activity" section
- [ ] Should show your compensation claim
- [ ] Shows flight number
- [ ] Shows compensation type
- [ ] Shows timestamp

**Activity Appears:** ✅ Yes / ❌ No

---

## 🔄 Phase 7: Full Workflow Test

### Complete Second Claim
- [ ] File another compensation claim:
  - Flight: `UA456`
  - Delay: `240` 
  - Type: `Food`
- [ ] Transaction succeeds
- [ ] Gets different transaction hash
- [ ] Appears on Etherscan

**Second Tx Hash:** _______________________________________________________________

### Verify Multiple Claims
- [ ] Dashboard shows `Total Claims: 2`
- [ ] Total compensated amount increased
- [ ] Recent Activity shows both claims
- [ ] Total received amount correct

**Total Claims:** ✅ Shows 2 / ❌ Shows other number

---

## 🛡️ Phase 8: Error Handling

### No Wallet Error
- [ ] Create new account (different email)
- [ ] Don't create wallet
- [ ] Try to file claim
- [ ] Should show error: "Please create a blockchain wallet first"
- [ ] Can't proceed without wallet

**Error Message:** ________________________________________________________________
**Behavior Correct:** ✅ Yes / ❌ No

### Missing Fields Error
- [ ] Go to Compensate tab
- [ ] Leave Flight Number blank
- [ ] Click File Claim
- [ ] Should show validation error
- [ ] Error message is clear
- [ ] Can't submit with missing data

**Error Message:** ________________________________________________________________

### Invalid Delay Error
- [ ] Try to file with delay < 180 minutes
- [ ] Smart contract rejects (if validation exists)
- [ ] Error message appears

**Result:** ________________________________________________________________________

---

## 📊 Phase 9: Data Persistence

### Logout & Login
- [ ] Click "Logout" button
- [ ] Logged out successfully
- [ ] Log back in with same credentials
- [ ] Dashboard loads
- [ ] Wallet address still there
- [ ] Claims history still visible

**Data Persisted:** ✅ Yes / ❌ No

### Browser Refresh
- [ ] While logged in & on Dashboard
- [ ] Press F5 to refresh page
- [ ] Dashboard reloads
- [ ] Wallet address still visible
- [ ] Balance information retained
- [ ] Account logged in still

**After Refresh:** ✅ Preserved / ❌ Lost

---

## 🎯 Phase 10: Final Verification

### System Status Summary
- [ ] Backend running: ✅ Yes / ❌ No
  - Port: 5000
  - Status: Connected / Disconnected
  
- [ ] Frontend running: ✅ Yes / ❌ No
  - Port: 5177
  - Status: Responsive / Sluggish
  
- [ ] Blockchain connection: ✅ Yes / ❌ No
  - Network: Sepolia
  - Chain ID: 11155111
  
- [ ] Database: ✅ Yes / ❌ No
  - MongoDB connected
  - Data persisted

### User Journey Complete
- [ ] Register: ✅ Works / ❌ Fails
- [ ] Login: ✅ Works / ❌ Fails
- [ ] Create Wallet: ✅ Works / ❌ Fails
- [ ] Get Test ETH: ✅ Works / ❌ Fails
- [ ] File Claim: ✅ Works / ❌ Fails
- [ ] Verify on Etherscan: ✅ Works / ❌ Fails
- [ ] Balance Updates: ✅ Works / ❌ Fails
- [ ] Data Persists: ✅ Works / ❌ Fails

---

## 📋 Summary Report

### Overall Status
- **Frontend:** ✅ Operational
- **Backend:** ✅ Operational
- **Blockchain:** ✅ Connected
- **Database:** ✅ Functional
- **User Workflow:** ✅ Complete

### Successful Tests: ____ / 30

### Critical Issues Found:
1. ___________________________________________________________________
2. ___________________________________________________________________
3. ___________________________________________________________________

### Minor Issues Found:
1. ___________________________________________________________________
2. ___________________________________________________________________

### Performance Notes:
- Wallet Creation Speed: ____________
- Claim Filing Speed: _______________
- Page Load Speed: __________________
- UI Responsiveness: ________________

### Recommendations:
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

---

## 🎉 Sign-Off

**Tester Name:** ____________________________  
**Date:** ____________________________  
**Overall Assessment:** 
- ✅ **PASS - System is operational and ready for use**
- ⚠️ **PASS WITH NOTES - See issues above**
- ❌ **FAIL - Critical issues found, system not ready**

**Signature:** ____________________________

---

## 📁 Testing Artifacts

Attach or reference:
- [ ] Screenshots of wallets
- [ ] Transaction hashes
- [ ] Error logs
- [ ] Performance metrics
- [ ] Database records

---

**Thank you for thoroughly testing SkyGuard DAO!** 🙏

Your feedback helps us improve the system for all users.
