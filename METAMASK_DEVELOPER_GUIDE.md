# MetaMask Implementation Guide - Developers
## Complete Integration for Flight Compensation System

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Setup](#backend-setup)
3. [Frontend Components](#frontend-components)
4. [Web3 Service Integration](#web3-service-integration)
5. [Smart Contract Interaction](#smart-contract-interaction)
6. [Wallet Management Endpoints](#wallet-management-endpoints)
7. [Testing](#testing)
8. [Security Considerations](#security-considerations)

---

## Architecture Overview

### System Flow

```
┌──────────────────┐
│  User Browser    │
│  + MetaMask      │
└────────┬─────────┘
         │
         │ window.ethereum API
         │
    ┌────▼───────────────┐
    │  Frontend (React)  │
    │  MetaMaskConnect   │
    │  + Web3Service     │
    └────┬───────────────┘
         │
         │ HTTP/REST
         │
    ┌────▼──────────────────┐
    │  Backend (Flask)      │
    │  - POST /api/auth/    │
    │    connect-wallet     │
    │  - Blockchain routes  │
    └────┬──────────────────┘
         │
         │ ethers.js / Web3.py
         │
    ┌────▼──────────────────┐
    │  Sepolia Blockchain   │
    │  - Smart Contracts    │
    │  - User Wallets       │
    │  - Transactions       │
    └───────────────────────┘
```

### Two-Wallet Architecture

Your system uses **two wallets per user:**

1. **Backend Wallet (Created at Registration)**
   - Created by backend using `eth_account`
   - Stored securely in database
   - Used for: Backend transactions, fund pooling
   - Private key: Never exposed to user

2. **MetaMask Wallet (User-Controlled)**
   - Created/imported by user
   - Never stored in your database
   - Used for: Direct user transfers, receiving compensation
   - Private key: Stored only in user's MetaMask

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install web3 eth-account eth-keys flask-cors
```

### 2. Environment Configuration

Create `.env` in backend directory:

```env
# Blockchain Configuration
WEB3_PROVIDER_URI=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY

# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=flight_compensation

# Security
SECRET_KEY=your-super-secret-key-here
JWT_SECRET=your-jwt-secret-here

# Blockchain Network
NETWORK=sepolia
NETWORK_ID=11155111
```

### 3. Update Database Schema

Add fields to MongoDB users collection:

```python
# In database/db.py or migration script
db.users.update_many(
    {},
    {
        "$set": {
            "metamask_address": None,           # User's MetaMask wallet
            "metamask_connected_at": None,      # Connection timestamp
            "address": "<backend_wallet>",       # Existing backend wallet
            "wallet_created_at": ISODate,       # Existing field
        }
    }
)
```

---

## Frontend Components

### 1. MetaMask Connection Component

Location: `frontend/src/components/MetaMaskConnect.jsx`

The component is already created. Key features:

```jsx
// Key props:
- account: Current user account object
- onWalletConnected: Callback when wallet connects

// Handles:
- Checks if MetaMask is installed
- Requests account access via window.ethereum
- Saves wallet address to backend
- Displays connection status
```

### 2. Updated MetaMaskConnect Component

For complete integration, ensure it has:

```jsx
import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const MetaMaskConnect = ({ account, onWalletConnected }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [walletConnected, setWalletConnected] = useState(!!account?.metamask_address);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.off('accountsChanged', handleAccountsChanged);
        window.ethereum.off('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      console.log('Account changed:', accounts[0]);
      // Optionally trigger re-connection with new account
    }
  };

  const handleChainChanged = (chainId) => {
    if (chainId !== '0xaa36a7') { // Sepolia chain ID
      alert('Please switch to Sepolia network in MetaMask');
    }
  };

  const connectMetaMask = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.ethereum) {
        setError('MetaMask not installed');
        setIsConnecting(false);
        return;
      }

      // Check network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') { // Sepolia
        setError('Please switch to Sepolia network in MetaMask');
        setIsConnecting(false);
        return;
      }

      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        setError('No accounts found');
        setIsConnecting(false);
        return;
      }

      const walletAddress = accounts[0];

      // Save to backend
      const response = await fetch('http://localhost:5000/api/auth/connect-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: account._id,
          wallet_address: walletAddress
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setWalletConnected(true);
      if (onWalletConnected) {
        onWalletConnected(walletAddress);
      }

    } catch (err) {
      console.error('Connection error:', err);
      if (err.code === 4001) {
        setError('User rejected connection');
      } else {
        setError(err.message);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  if (walletConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">✓ MetaMask Connected</p>
            <p className="text-sm text-green-700 font-mono">
              {account.metamask_address.slice(0, 10)}...
              {account.metamask_address.slice(-8)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <Wallet className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-900">Connect MetaMask</p>
            <p className="text-sm text-blue-700">
              Use your Ethereum wallet for transactions
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={connectMetaMask}
          disabled={isConnecting}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 
                     text-white font-semibold py-2 rounded-lg flex items-center 
                     justify-center gap-2 transition-colors"
        >
          {isConnecting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              Connect MetaMask
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MetaMaskConnect;
```

---

## Web3 Service Integration

### 1. Create Web3 Service for Frontend

Location: `frontend/src/services/web3.js`

```javascript
import { ethers } from 'ethers';

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.userAddress = null;
  }

  // Check if MetaMask is installed
  static isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
  }

  // Request account access
  async requestAccounts() {
    if (!Web3Service.isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    return accounts;
  }

  // Initialize provider and signer
  async initialize() {
    if (!Web3Service.isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.userAddress = await this.signer.getAddress();

    return this.userAddress;
  }

  // Get user's balance
  async getBalance() {
    if (!this.signer) {
      throw new Error('Web3 not initialized');
    }

    const balance = await this.provider.getBalance(this.userAddress);
    return ethers.formatEther(balance);
  }

  // Get current network
  async getNetwork() {
    const network = await this.provider.getNetwork();
    return {
      name: network.name,
      chainId: network.chainId,
      isSepoliachain: network.chainId === 11155111
    };
  }

  // Switch to Sepolia network
  async switchToSepolia() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }] // Sepolia
      });
    } catch (error) {
      if (error.code === 4902) {
        // Network not in MetaMask, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia',
            rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
            nativeCurrency: {
              name: 'Sepolia ETH',
              symbol: 'ETH',
              decimals: 18
            },
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
      } else {
        throw error;
      }
    }
  }

  // Send transaction to smart contract
  async sendTransaction(contractAddress, contractABI, functionName, args) {
    const contract = new ethers.Contract(contractAddress, contractABI, this.signer);
    const tx = await contract[functionName](...args);
    const receipt = await tx.wait();
    return receipt;
  }

  // Listen to wallet changes
  onAccountsChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  onChainChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }
}

export default Web3Service;
```

---

## Smart Contract Interaction

### 1. Contract ABI for Frontend

Location: `frontend/src/contracts/contractABI.js`

```javascript
// Example ABI for compensation contract
export const COMPENSATION_CONTRACT_ABI = [
  {
    "name": "purchasePolicy",
    "type": "function",
    "inputs": [
      { "name": "_flightNumber", "type": "string" },
      { "name": "_premiumAmount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "name": "claimCompensation",
    "type": "function",
    "inputs": [
      { "name": "_flightNumber", "type": "string" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "name": "getUserBalance",
    "type": "function",
    "inputs": [{ "name": "_user", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
];

export const CONTRACT_ADDRESS = '0x...'; // Your deployed contract address
```

### 2. Using Web3Service in Components

```javascript
// Example component using Web3Service
import React, { useState } from 'react';
import Web3Service from '../services/web3';

const CompensationClaim = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const web3Service = new Web3Service();

  const handleClaimCompensation = async (flightNumber, claimAmount) => {
    try {
      setIsSubmitting(true);

      // Initialize Web3
      await web3Service.initialize();

      // Check network
      const network = await web3Service.getNetwork();
      if (!network.isSepoliachain) {
        await web3Service.switchToSepolia();
      }

      // Submit claim to backend API
      const response = await fetch('/api/blockchain/claim-compensation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight_number: flightNumber,
          claim_amount: claimAmount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit claim');
      }

      const data = await response.json();
      console.log('Claim submitted:', data);
      alert('✓ Compensation claimed successfully!');

    } catch (error) {
      console.error('Error:', error);
      alert('✗ Failed to claim: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button 
      onClick={() => handleClaimCompensation('AA123', '0.05')}
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Processing...' : 'Claim Compensation'}
    </button>
  );
};

export default CompensationClaim;
```

---

## Wallet Management Endpoints

### Backend Endpoints for Wallet Operations

All endpoints in `backend/api/auth.py`:

#### 1. Connect MetaMask Wallet

**Endpoint:** `POST /api/auth/connect-wallet`

**Request:**
```json
{
  "user_id": "MongoDB ObjectId",
  "wallet_address": "0x..."
}
```

**Response (Success):**
```json
{
  "message": "MetaMask wallet connected successfully",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "address": "0x...",           // Backend wallet
    "metamask_address": "0x...",  // MetaMask wallet
    "fly_balance": 0.0
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid Ethereum address format"
}
```

#### 2. Get User with Wallets

**Endpoint:** `POST /api/auth/verify`

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "address": "0x...",
    "metamask_address": "0x...",
    "fly_balance": 100.5
  }
}
```

---

## Testing

### 1. Backend Endpoint Testing

**Test with curl:**

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Connect MetaMask wallet
curl -X POST http://localhost:5000/api/auth/connect-wallet \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
  }'
```

### 2. Frontend Testing

**Test MetaMask Connection:**

1. Install MetaMask extension
2. Create test account
3. Switch to Sepolia network
4. Visit application
5. Register account
6. Click "Connect MetaMask"
7. Approve connection request
8. Verify wallet address displayed

### 3. Smart Contract Testing

```python
# backend test script
import Web3
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('https://sepolia.infura.io/v3/YOUR_KEY'))

# Check connection
print("Connected:", w3.is_connected())

# Get account
account = w3.eth.accounts[0]
print("Account:", account)

# Get balance
balance = w3.eth.get_balance(account)
print("Balance:", Web3.from_wei(balance, 'ether'), "ETH")
```

---

## Security Considerations

### 1. Private Key Management

```python
# ✓ GOOD: Private keys never exposed
def create_wallet():
    account = Account.create()
    return {
        'address': account.address,
        # DON'T return 'privateKey'
    }

# ✗ BAD: Private key exposed
def create_wallet_bad():
    account = Account.create()
    return {
        'address': account.address,
        'privateKey': account.privateKey  # NEVER DO THIS
    }
```

### 2. Environment Variables

Never commit `.env` file:

```bash
# .gitignore
.env
.env.local
.env.*.local
private_keys/
```

### 3. CORS Configuration

Secure CORS for production:

```python
# ✓ GOOD: Specific origins
CORS(app, 
     origins=["https://yourdomain.com"],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST"],
     supports_credentials=True)

# ✗ BAD: Allow all origins
CORS(app, origins="*")  # Only for development!
```

### 4. MetaMask Best Practices

```javascript
// ✓ Always verify user address
const userAddress = await signer.getAddress();
const chainId = await provider.getNetwork();

// ✓ Validate contract address
if (!ethers.isAddress(contractAddress)) {
  throw new Error('Invalid contract address');
}

// ✗ Don't expose private keys
// window.ethereum users CONTROL their own keys
// Your backend should never see them
```

---

## Deployment Checklist

- [ ] Update `.env` with production Infura/Alchemy keys
- [ ] Set `DEBUG=False` in Flask
- [ ] Update CORS origins to production domain
- [ ] Deploy contract to Sepolia testnet
- [ ] Update contract address in frontend
- [ ] Test wallet connection on production URL
- [ ] Monitor for errors in application logs
- [ ] Backup MongoDB data regularly
- [ ] Document all contract addresses and ABIs

---

## Resources

- [MetaMask API Docs](https://docs.metamask.io/guide/)
- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [Sepolia Faucet](https://sepoliafaucet.com)
- [Etherscan Sepolia](https://sepolia.etherscan.io)
- [Web3.py Docs](https://web3py.readthedocs.io/)


