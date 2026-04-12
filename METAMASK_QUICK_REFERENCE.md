# MetaMask Implementation - Quick Reference

## ✅ What's Been Implemented

### Frontend Components (Ready to Use)

1. **MetaMaskConnect.jsx**
   - Displays "Connect MetaMask" button on dashboard
   - Handles user connection flow
   - Shows wallet address when connected
   - Location: `frontend/src/components/MetaMaskConnect.jsx`

2. **WalletProfile.jsx** 
   - Shows connected wallet details
   - Displays balance, network, address
   - Allows refresh and network switching
   - Copy address to clipboard
   - Location: `frontend/src/components/WalletProfile.jsx`

3. **WalletButton.jsx**
   - Quick access wallet button for header/navbar
   - Dropdown menu with wallet info
   - Connect/disconnect functionality
   - Location: `frontend/src/components/WalletButton.jsx`

### Frontend Services & Hooks

1. **web3Service.js**
   - Singleton service for all MetaMask operations
   - Methods: connectWallet, getCurrentAccount, getBalance, switchNetwork, sendTransaction, signMessage
   - Event listeners for account/network changes
   - Location: `frontend/src/services/web3Service.js`

2. **useMetaMask Hook**
   - Custom React hook for easy integration
   - Returns: account, balance, network, isConnected, error, connect/disconnect functions
   - Usage: `const { account, balance, connectWallet } = useMetaMask();`
   - Location: `frontend/src/hooks/useMetaMask.js`

3. **authService.js (Updated)**
   - New method: `connectMetaMaskWallet(walletAddress)`
   - Syncs MetaMask wallet with user database
   - Location: `frontend/src/services/authService.js`

4. **walletUtils.js**
   - Utility functions for wallet operations
   - Methods: formatWalletAddress, isValidEthereumAddress, getSepoliaExplorerUrl, formatWeiToEth, etc.
   - Location: `frontend/src/utils/walletUtils.js`

### Backend Endpoints

1. **POST /api/auth/connect-wallet**
   - Connect user's MetaMask wallet to account
   - Request: `{ user_id, wallet_address }`
   - Response: Updated user with both backend and MetaMask wallets
   - Location: `backend/api/auth.py` (Lines 123-175)

### Testing

1. **test_metamask_integration.py** (Updated)
   - Complete test suite for MetaMask functionality
   - Tests: Registration, Login, Wallet Connection, Token Verification, Address Validation
   - Usage: `python test_metamask_integration.py`
   - Location: `test_metamask_integration.py`

---

## 🚀 How to Use

### For Users - Connect MetaMask

1. **Install MetaMask** (if not already done)
   - Go to https://metamask.io
   - Install extension

2. **Create Wallet**
   - Save recovery phrase safely
   - Set password

3. **Switch to Sepolia Testnet**
   - Network dropdown → Show test networks → Sepolia

4. **Get Test ETH**
   - Visit https://sepoliafaucet.com
   - Paste your address
   - Request ETH

5. **Connect in App**
   - Login to SkyGuard DAO
   - Dashboard → Click "Connect MetaMask Wallet"
   - Approve in MetaMask popup
   - ✓ Connected!

### For Developers - Use in Components

#### Basic Connection Button
```jsx
import MetaMaskConnect from '../components/MetaMaskConnect';

<MetaMaskConnect 
  account={userAccount}
  onWalletConnected={(address) => console.log('Connected:', address)}
/>
```

#### Use Hook in Component
```jsx
import { useMetaMask } from '../hooks/useMetaMask';

const MyComponent = () => {
  const { account, balance, connectWallet, isConnected } = useMetaMask();
  
  return (
    <>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect</button>
      ) : (
        <p>Balance: {balance} ETH</p>
      )}
    </>
  );
};
```

#### Show Wallet Profile
```jsx
import WalletProfile from '../components/WalletProfile';

<WalletProfile onDisconnect={() => alert('Disconnected')} />
```

#### Use Wallet Button in Header
```jsx
import WalletButton from '../components/WalletButton';

<header>
  <nav>
    <Logo />
    <WalletButton />
  </nav>
</header>
```

#### Format Addresses in Display
```jsx
import { formatWalletAddress, getSepoliaExplorerUrl } from '../utils/walletUtils';

const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f63e0e';

// Short format
console.log(formatWalletAddress(address)); // "0x742d...63e0e"

// Link to Etherscan
const url = getSepoliaExplorerUrl('address', address);
<a href={url} target="_blank">View on Etherscan</a>
```

#### Send Transaction
```jsx
const { sendTransaction, getTransactionReceipt } = useMetaMask();

const sendETH = async () => {
  try {
    const txHash = await sendTransaction({
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f63e0e',
      value: '0.1'
    });
    
    const receipt = await getTransactionReceipt(txHash);
    console.log('Transaction confirmed:', receipt);
  } catch (error) {
    console.error('Failed:', error);
  }
};
```

---

## 📁 File Structure

```
frontend/src/
├── components/
│   ├── MetaMaskConnect.jsx       ✓ Connection button
│   ├── WalletProfile.jsx         ✓ Wallet info display
│   └── WalletButton.jsx          ✓ Header button
├── hooks/
│   ├── useMetaMask.js            ✓ Custom hook
│   └── index.js                  ✓ Hook exports
├── services/
│   ├── web3Service.js            ✓ Web3 service
│   ├── authService.js            ✓ Updated with wallet connection
│   └── ...
├── utils/
│   ├── walletUtils.js            ✓ Wallet utilities
│   └── index.js                  ✓ Updated exports
└── pages/
    └── Dashboard/
        └── DashboardPageSimple.jsx  ✓ Uses MetaMaskConnect

backend/
├── api/
│   ├── auth.py                   ✓ Updated with /connect-wallet
│   └── ...
├── blockchain/
│   ├── wallet_manager.py         ✓ Wallet operations
│   └── ...
└── database/
    └── db.py                     ✓ User & wallet storage

root/
├── test_metamask_integration.py  ✓ Test suite
└── METAMASK_USER_IMPLEMENTATION.md
```

---

## 🧪 Testing

### Run Integration Tests
```bash
python test_metamask_integration.py
```

Tests:
1. User Registration
2. User Login
3. MetaMask Wallet Connection
4. Token Verification
5. Address Validation

### Manual Testing

1. **Register Account**
   - Go to http://localhost:3000
   - Click Register
   - Fill form and create account
   - Backend wallet is auto-created

2. **Login**
   - Use registered email/password
   - Go to Dashboard

3. **Connect MetaMask**
   - See "Connect Your MetaMask Wallet" section
   - Click button
   - MetaMask popup appears
   - Select account and approve
   - ✓ Connected!

4. **Verify Connection**
   - Wallet address displayed
   - Can see balance
   - Can refresh balance
   - Network shows Sepolia

---

## 🔐 Security Notes

### For Users
- ✅ Your private key stays in MetaMask
- ✅ We never see or store your private key
- ✅ Your wallet address is public - safe to share
- ❌ Never share your recovery phrase
- ❌ Never share your private key

### For Developers
- ✅ All MetaMask interactions are client-side
- ✅ Private keys never leave user's browser
- ✅ Backend only stores wallet addresses
- ❌ Never request user's private key
- ❌ Never send wallet secrets over HTTP (use HTTPS)

---

## 📊 Data Flow

```
User Browser (MetaMask)
    ↓
Frontend (React Components)
    ↓
Backend API (/api/auth/connect-wallet)
    ↓
MongoDB (Store wallet address in user doc)
```

### User Document Structure
```json
{
  "_id": "mongo_id",
  "name": "John Doe",
  "email": "john@example.com",
  "address": "0x...",                    // Backend wallet
  "metamask_address": "0x...",           // User's MetaMask wallet
  "metamask_connected_at": "2026-02-26",
  "fly_balance": 100,
  ...
}
```

---

## ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MetaMask not detected | Install extension from https://metamask.io |
| Wrong network | Click network dropdown → Switch to Sepolia |
| No balance | Go to https://sepoliafaucet.com for test ETH |
| Connection rejected | Click button again and approve in MetaMask |
| Connected but address not showing | Clear browser cache, refresh page |
| "0x0000..." address | You're on wrong network - switch to Sepolia |

---

## 🔗 Next Steps

1. ✅ Users can connect MetaMask wallets
2. ✅ Frontend can read wallet info
3. ✅ Backend stores wallet addresses
4. ⏳ **Next**: Build compensation claim transactions
5. ⏳ **Next**: Send FLY tokens to user wallets
6. ⏳ **Next**: Display transaction history

---

## 📚 Documentation Files

- `METAMASK_USER_IMPLEMENTATION.md` - Complete user/developer guide
- `METAMASK_TESTING_GUIDE.md` - Testing procedures
- `test_metamask_integration.py` - Automated tests
- This file - Quick reference

---

## 🚨 Troubleshooting

### Backend Not Starting?
```bash
cd backend
pip install -r requirements.txt
python run.py
```

### API Connection Error?
```
Check: http://localhost:5000/api/health
Should show: {"status": "healthy"}
```

### Frontend Not Loading?
```bash
cd frontend
npm install
npm run dev
```

### Tests Failing?
```bash
# Check MongoDB
# Check backend is running
# Check API URL in test file
python test_metamask_integration.py
```

---

## 💡 Tips

1. **Always test on Sepolia first** (use testnet ETH, not real)
2. **Keep multiple accounts** in MetaMask for testing
3. **Save browser console output** when debugging
4. **Use Etherscan** to verify transactions: https://sepolia.etherscan.io
5. **MetaMask sometimes needs refresh** after network changes

---

For detailed information, see:
- Full guide: `METAMASK_USER_IMPLEMENTATION.md`
- Developer info: `METAMASK_DEVELOPER_GUIDE.md`
- API Reference: `API_REFERENCE.md`
