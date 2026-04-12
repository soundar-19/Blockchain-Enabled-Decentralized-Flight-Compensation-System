# MetaMask User Implementation Guide

## For End Users - Step-by-Step Setup

### Step 1: Install MetaMask Extension
1. Go to https://metamask.io
2. Click "Download now"
3. Install the extension for your browser (Chrome, Firefox, Edge, Safari)
4. Click the MetaMask icon in your browser toolbar

### Step 2: Create Your Wallet
1. Click "Create a new wallet"
2. Create a strong password (this is only for your local MetaMask)
3. **IMPORTANT**: Write down your 12-word Secret Recovery Phrase on paper
   - NEVER take screenshots
   - NEVER share with anyone
   - Store safely - this is your backup

### Step 3: Switch to Sepolia Testnet
1. Click the network dropdown at the top left (shows "Ethereum Mainnet")
2. Toggle "Show test networks" switch ON
3. Select "Sepolia"
4. Your wallet is now on the testnet!

### Step 4: Get Free Test ETH
1. Visit one of these faucets:
   - https://sepoliafaucet.com (Fastest)
   - https://infura.io/faucet/sepolia
2. Paste your wallet address (starts with 0x)
3. Choose "Request 1 ETH" or similar
4. Wait 30 seconds - ETH should appear in MetaMask!

### Step 5: Connect to SkyGuard DAO
1. Log in to the app with your email/password
2. Go to Dashboard
3. Click "Connect MetaMask Wallet"
4. MetaMask will pop up - click "Next", then "Connect"
5. You're connected! 🎉

---

## For Developers - Using MetaMask in Components

### Quick Start: Using the useMetaMask Hook

```jsx
import { useMetaMask } from '../hooks/useMetaMask';

function MyComponent() {
  const {
    account,           // Connected wallet address (string)
    balance,           // ETH balance (string, e.g. "0.5")
    network,           // Network info {chainId, name}
    isConnected,       // Boolean
    isConnecting,      // Boolean
    error,             // Error message if any
    connectWallet,     // Function to connect
    disconnectWallet,  // Function to disconnect
    refreshBalance,    // Function to refresh balance
    ensureSepoliaNetwork, // Function to switch to Sepolia
    sendTransaction,   // Function to send tx
    signMessage,       // Function to sign message
  } = useMetaMask();

  return (
    <div>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {account}</p>
          <p>Balance: {balance} ETH</p>
        </>
      )}
    </div>
  );
}
```

### Using MetaMaskConnect Component

Already connected to your registration/dashboard flow:

```jsx
import MetaMaskConnect from '../components/MetaMaskConnect';

<MetaMaskConnect 
  account={user}
  onWalletConnected={(walletAddress) => {
    console.log('Wallet connected:', walletAddress);
  }}
/>
```

### Using WalletProfile Component

Shows full wallet details:

```jsx
import WalletProfile from '../components/WalletProfile';

<WalletProfile 
  onDisconnect={() => {
    // Handle disconnect
  }}
/>
```

### Using WalletButton in Header/Navbar

```jsx
import WalletButton from '../components/WalletButton';

// In your header/navbar
<WalletButton />
```

### Sending Transactions with MetaMask

```jsx
const { sendTransaction, getTransactionReceipt } = useMetaMask();

// Send 0.1 SepoliaETH to an address
try {
  const txHash = await sendTransaction({
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f63e0e',
    value: '0.1'
  });
  
  console.log('Transaction sent:', txHash);
  
  // Wait for receipt
  const receipt = await getTransactionReceipt(txHash);
  console.log('Transaction confirmed:', receipt);
} catch (error) {
  console.error('Transaction failed:', error);
}
```

### Signing Messages with MetaMask

```jsx
const { signMessage } = useMetaMask();

// Sign a message to prove wallet ownership
try {
  const signature = await signMessage('Verify wallet ownership');
  console.log('Signed message:', signature);
} catch (error) {
  console.error('Sign failed:', error);
}
```

### Using Wallet Utilities

```jsx
import * as walletUtils from '../utils/walletUtils';

// Format address for display
const short = walletUtils.formatWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f63e0e', 6, 4);
// Result: '0x742d3...63e0e'

// Validate address
const isValid = walletUtils.isValidEthereumAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f63e0e');

// Get Etherscan URL
const url = walletUtils.getSepoliaExplorerUrl('address', '0x742d35Cc6634C0532925a3b844Bc9e7595f63e0e');
// Result: 'https://sepolia.etherscan.io/address/0x742d35Cc6634C0532925a3b844Bc9e7595f63e0e'

// Format Wei to ETH
const eth = walletUtils.formatWeiToEth('1000000000000000000');
// Result: '1.0000'

// Get network name
const name = walletUtils.getNetworkName(11155111);
// Result: 'Sepolia Testnet'
```

---

## Backend Implementation - Connect Wallet Endpoint

The `/api/auth/connect-wallet` endpoint is already implemented. 

### How It Works:

1. User clicks "Connect MetaMask" in the frontend
2. MetaMask pops up and user approves
3. Frontend sends wallet address to `/api/auth/connect-wallet`
4. Backend stores the wallet address in database
5. Backend updates the user's profile with their MetaMask wallet

### API Request:
```javascript
POST /api/auth/connect-wallet
Content-Type: application/json

{
  "user_id": "user_mongo_id",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f63e0e"
}
```

### API Response:
```json
{
  "message": "MetaMask wallet connected successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "address": "0x...",        // Backend-generated wallet
    "metamask_address": "0x...", // User's MetaMask wallet
    "fly_balance": 100
  }
}
```

---

## Important Security Notes

### For Users:
- ✅ MetaMask is trustworthy - use it for real blockchain transactions
- ✅ Your wallet address (0x...) is PUBLIC - safe to share
- ❌ NEVER share your private key - it gives total control of your funds
- ❌ NEVER share your Secret Recovery Phrase - anyone with it can steal your wallet
- ❌ NEVER take screenshots of your recovery phrase

### For Developers:
- ✅ All MetaMask operations are in the frontend - safer
- ✅ Private keys never leave the user's device
- ❌ Never request or store user's private keys on backend
- ❌ Never send wallet secrets over unencrypted connections
- ✅ Use HTTPS in production

---

## Troubleshooting

### "MetaMask is not installed"
- Install MetaMask from https://metamask.io
- Refresh the page
- Try a different browser

### "User denied wallet connection"
- This means you clicked "Reject" in MetaMask
- Click "Connect MetaMask Wallet" again and approve

### "Wrong network"
- MetaMask shows your connected network (top left)
- The app needs Sepolia testnet
- Click network dropdown → Show test networks → Select Sepolia

### "No ETH balance / 0.0 balance"
- You have no test ETH
- Go to https://sepoliafaucet.com to get free ETH
- Paste your address and request ETH

### "Connection rejected by user" after trying to send transaction
- You clicked "Reject" in the MetaMask transaction popup
- Click the button again and approve the transaction

### Wallet connected but not showing in app
- Refresh the page (F5)
- Make sure you're on Sepolia network
- You may need to disconnect and reconnect

---

## File Structure

```
frontend/
├── src/
│   ├── services/
│   │   ├── web3Service.js          # Main Web3/MetaMask service
│   │   ├── authService.js          # Auth + wallet connection
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── useMetaMask.js          # Custom React hook
│   │   └── index.js                # Hook exports
│   │
│   ├── components/
│   │   ├── MetaMaskConnect.jsx      # Connect button
│   │   ├── WalletProfile.jsx        # Wallet details display
│   │   ├── WalletButton.jsx         # Header wallet button
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── walletUtils.js          # Utility functions
│   │   └── ...
│   │
│   └── pages/
│       ├── Dashboard/
│       │   └── DashboardPageSimple.jsx  # Uses MetaMaskConnect
│       └── ...
```

---

## Next Steps

1. ✅ Users can now connect MetaMask and manage wallets
2. 🔄 Frontend can read wallet balance and network
3. 🔄 Backend stores connected wallets
4. ⏳ Next: Build smart contract interactions for compensation claims

For compensation flow questions, see `COMPENSATION_FEATURE_INDEX.md`
