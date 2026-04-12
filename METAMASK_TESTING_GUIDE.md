# MetaMask Integration - Manual Testing Guide

## ✅ Integration Complete

### What Was Done:

#### 1. **Backend Endpoint** ✓
- Created `/api/auth/connect-wallet` POST endpoint in `backend/app.py`
- Validates Ethereum address format (0x prefix, 42 characters)
- Saves wallet address to MongoDB with `wallet_type: 'metamask'`
- Returns proper HTTP status codes and error messages

#### 2. **React Component** ✓
- Created `MetaMaskConnect.jsx` component with:
  - MetaMask detection via `window.ethereum`
  - Account request via `eth_requestAccounts`
  - Backend API integration
  - Error handling and validation
  - Three UI states: disconnected, connecting, connected

#### 3. **Dashboard Integration** ✓
- Added MetaMaskConnect component import to DashboardPageSimple
- Added wallet connection prompt banner
- Shows only when user has no wallet connected
- Calls parent callback to update account state
- Persists wallet address to localStorage

#### 4. **Router Integration** ✓
- Added `onAccountUpdate` callback to Dashboard component
- Updates parent state in AppRouter when wallet connects
- Persists account to localStorage for persistence

---

## 🧪 Manual Testing Steps

### Prerequisites:
1. Install MetaMask browser extension (Chrome, Firefox, Brave, Edge)
2. Create a test Ethereum account in MetaMask
3. Backend running on `http://localhost:5000`
4. Frontend running on `http://localhost:5177`
5. MongoDB running locally

### Test Scenario 1: User Registration → Wallet Connection

**Steps:**
1. Navigate to `http://localhost:5177`
2. Go to Register page
3. Create new account:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "testpass123"
4. Click "Register"
5. **Expected:** Dashboard loads with "Connect Your Wallet" banner visible

**Verify:**
- [ ] "Connect Your Wallet" section is visible
- [ ] MetaMaskConnect component shows blue button
- [ ] Button text says "Connect MetaMask Wallet"

### Test Scenario 2: MetaMask Connection

**Steps:**
1. From dashboard, click "Connect MetaMask Wallet" button
2. **Expected:** MetaMask extension popup appears
3. Note: If MetaMask not installed, error message appears

**If MetaMask installed:**
1. MetaMask popup shows "Connect request from localhost"
2. Click "Connect" to approve
3. **Expected:** 
   - Frontend shows success dialog with wallet address
   - Banner disappears from dashboard
   - Layout header shows "✓ Wallet Ready" with address

### Test Scenario 3: Verify Database Update

**Steps:**
1. Open MongoDB client (MongoCompass or mongosh)
2. Connect to `mongodb://localhost:27017`
3. Navigate to `blockchain_compensation` database
4. Open `users` collection
5. Find the test user created above
6. **Expected fields in user document:**
   - `address`: "0x..." (the connected wallet)
   - `wallet_created`: true
   - `wallet_type`: "metamask"

### Test Scenario 4: Wallet Persistence

**Steps:**
1. After connecting wallet on dashboard
2. Refresh page (Ctrl+F5 or Cmd+Shift+R)
3. **Expected:**
   - User stays logged in (JWT in localStorage)
   - Wallet address still visible in header
   - "Connect Your Wallet" banner NOT shown

### Test Scenario 5: Navigation with Connected Wallet

**Steps:**
1. From dashboard with connected wallet
2. Navigate to "Booking" tab
3. Navigate to "Compensate" tab
4. Navigate to "Testing" tab
5. **Expected:** 
   - Wallet address visible in header on all pages
   - No errors in browser console
   - Account prop passed correctly to all pages

---

## 📊 Expected Behavior After Integration

### Before Wallet Connection:
```
Dashboard
├── Key Metrics (with demo data)
├── ⚠️ "Connect Your Wallet" Banner (PROMINENT)
│   ├── Wallet icon
│   ├── Instructions
│   └── [Connect MetaMask Wallet] Button
├── Your Account Summary
└── ...
```

### After Wallet Connection:
```
Dashboard
├── Layout Header: "✓ Wallet Ready: 0xABC...XYZ"
├── Key Metrics
├── ✅ (Banner removed)
├── Your Account Summary
│   ├── FLY Balance
│   ├── MATIC Balance
│   ├── Staked Tokens
│   ├── Total Claims
│   ├── ✓ Wallet Connected (YES)
│   └── (Wallet address displayed)
└── ...
```

---

## 🔍 Troubleshooting

### Issue: "MetaMask not installed"
- **Solution:** Install MetaMask extension from browser store
- Test at `chrome://extensions` or equivalent

### Issue: User denied wallet connection
- **Solution:** Click button again and approve in MetaMask popup
- Check MetaMask notification area

### Issue: Wallet not showing in header after connection
- **Solution:** 
  - Refresh page (should show due to localStorage)
  - Check browser console for errors (F12 → Console tab)
  - Verify Backend endpoint returned 200 status

### Issue: No "Connect Your Wallet" banner showing
- **Solution:** 
  - Verify `account.address` is null/undefined in browser console
  - Check if wallet was already connected previously
  - Look for JavaScript errors in console

### Issue: Backend returns error "Invalid Ethereum address"
- **Solution:**
  - MetaMask address must be 42 characters (0x + 40 hex chars)
  - Cannot be shortened or modified
  - Frontend validates before sending

---

## 📝 Code Locations

### Backend:
- Endpoint: `backend/app.py` lines 231-274
- Route: `POST /api/auth/connect-wallet`

### Frontend Components:
- MetaMaskConnect: `frontend/src/components/MetaMaskConnect.jsx`
- Dashboard: `frontend/src/pages/Dashboard/DashboardPageSimple.jsx`
- Router: `frontend/src/AppRouter.jsx`

### Database:
- Collection: `blockchain_compensation.users`
- Fields: `address`, `wallet_created`, `wallet_type`

---

## ✨ Success Criteria

- [ ] User can see "Connect Your Wallet" banner on first dashboard visit
- [ ] Clicking button opens MetaMask popup
- [ ] Approving shows success dialog with wallet address
- [ ] Wallet address saved to MongoDB
- [ ] Wallet address persists across page refreshes (localStorage)
- [ ] Layout header shows "✓ Wallet Ready" after connection
- [ ] Banner disappears after wallet connection
- [ ] All pages accessible with connected wallet
- [ ] No JavaScript errors in console
- [ ] Multiple users can have different wallets

---

**Status:** ✅ READY FOR MANUAL TESTING

Integration complete. Follow the testing scenarios above to verify functionality.
