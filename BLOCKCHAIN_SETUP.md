# SkyGuard DAO - Blockchain Backend Setup Guide

## Overview
This guide will help you set up the blockchain-enabled backend for the SkyGuard DAO flight compensation system using **Ethereum Sepolia testnet** and **real smart contracts**.

## Prerequisites

1. **Node.js** (v16+) - For contract compilation
2. **Python** (v3.8+) - For backend
3. **OpenZeppelin Contracts** - For smart contract dependencies

## Step 1: Get Sepolia Testnet ETH

You need ETH on Sepolia testnet to deploy contracts.

### Option A: Sepolia Faucet (Recommended)
1. Go to: https://sepolia-faucet.pk910.de/
2. Enter your wallet address
3. Complete the captcha
4. Claim 0.5 ETH (you can claim every 24 hours)

### Option B: Using Infura Faucet
1. Sign up at https://infura.io
2. Go to their Faucet section
3. Request funds directly

### Option C: Using Alchemy Faucet
1. Sign up at https://www.alchemy.com
2. Connect wallet to their faucet
3. Claim Sepolia ETH

## Step 2: Setup Infura or Alchemy API Key

### Using Infura:
1. Go to https://infura.io
2. Sign up / Log in
3. Create a new project
4. Select Ethereum as the network
5. Copy your API key
6. Your RPC URL will be: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`

### Using Alchemy (Alternative):
1. Go to https://www.alchemy.com
2. Sign up / Create account
3. Create a new app (select Ethereum + Sepolia)
4. Copy your API key
5. Your RPC URL will be: `https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY`

## Step 3: Compile Smart Contracts

Navigate to the hardhat folder and compile contracts:

```bash
cd hardhat
npm install
npx hardhat compile
```

The compiled contracts will be in: `hardhat/artifacts/contracts/`

## Step 4: Copy Contract ABIs

Copy the compiled contract ABIs to the backend:

```bash
# From the root directory
mkdir -p backend/blockchain/abis

# Copy FlightToken ABI
cp hardhat/artifacts/contracts/FlightToken.sol/FlightToken.json backend/blockchain/abis/

# Copy CompensationContract ABI  
cp hardhat/artifacts/contracts/CompensationContract.sol/CompensationContract.json backend/blockchain/abis/
```

## Step 5: Setup Backend Environment

1. Copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```

2. Edit `.env` and fill in your values:
```
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=your_private_key_without_0x_prefix
DEPLOYER_ACCOUNT=0xyour_account_address
```

⚠️ **IMPORTANT**: Never commit `.env` to git. Your private key is sensitive!

## Step 6: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 7: Deploy Smart Contracts

Run the deployment script:

```bash
python blockchain/deploy_sepolia.py
```

This will:
1. Connect to Sepolia via your Infura/Alchemy key
2. Deploy FLY Token contract
3. Deploy Compensation Contract (linked to FLY Token)
4. Output contract addresses

**Save the contract addresses!**

## Step 8: Update Environment Variables

After deployment, update your `.env` with the deployed contract addresses:

```
FLY_TOKEN_ADDRESS=0x... (deployed address)
COMPENSATION_CONTRACT_ADDRESS=0x... (deployed address)
```

## Step 9: Start the Backend

```bash
# From backend directory
python run.py
```

The API will start on: `http://localhost:5000`

## Step 10: Verify Deployment on Sepolia Explorer

Check your deployed contracts:
1. Go to https://sepolia.etherscan.io
2. Paste your contract addresses
3. You should see:
   - Contract code
   - Transactions
   - Account interactions

## API Endpoints

### Blockchain Status
```bash
GET /api/blockchain/status
```
Returns blockchain connection status and network info.

### Address/Wallet Management
```bash
POST /api/blockchain/wallet/create
# Creates a new wallet

POST /api/blockchain/wallet/import
# Imports wallet from private key

POST /api/blockchain/wallet/validate
# Validates an Ethereum address
```

### Compensation Claims (Real blockchain)
```bash
POST /api/blockchain/compensation/file-claim
# Files a compensation claim on Sepolia
# Body: {
#   "userAddress": "0x...",
#   "flightNumber": "AA101",
#   "delayMinutes": 180,
#   "claimType": 1  // 0=food, 1=hotel, 2=transport, 3=refund
# }

GET /api/blockchain/compensation/claims/<userAddress>
# Gets all claims for a user from Sepolia contract

GET /api/blockchain/compensation/claim/<claimId>
# Gets details of a specific claim

GET /api/blockchain/compensation/stats
# Gets system statistics
```

### Wallet Balances
```bash
GET /api/blockchain/wallet/balance/<address>
# Returns ETH and FLY token balance
```

### Transaction Status
```bash
GET /api/blockchain/transaction/status/<txHash>
# Checks transaction status on Sepolia
```

## Example: File a Compensation Claim

1. **Prepare the transaction:**
```bash
curl -X POST http://localhost:5000/api/blockchain/compensation/file-claim \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x1234...",
    "flightNumber": "AA101",
    "delayMinutes": 300,
    "claimType": 1
  }'
```

2. **Sign and send:**
Use the returned transaction object with your private key to sign and submit to Sepolia.

## Troubleshooting

### "RPC_URL not configured" Error
- Make sure `.env` has your Infura/Alchemy key
- Format: `https://sepolia.infura.io/v3/YOUR_KEY`

### "Failed to connect to Sepolia" Error
- Verify your RPC URL is correct
- Check your internet connection
- Ensure Infura/Alchemy service is running

### "Low ETH balance" Warning
- Claim more test ETH from the faucet
- You need at least ~0.1 ETH for deployment

### Contract addresses show 0x0
- Run the deployment script first
- Ensure DEPLOYER_PRIVATE_KEY is set correctly

### "Invalid contract address" Error
- Check the contract addresses in `.env`
- Make sure they start with "0x"
- Verify the address format using Sepolia Etherscan

## Network Information

**Sepolia Testnet:**
- Chain ID: 11155111
- Network: Ethereum Sepolia
- Explorer: https://sepolia.etherscan.io
- RPC: https://sepolia.infura.io/v3/ (Infura)
- RPC: https://eth-sepolia.g.alchemy.com/v2/ (Alchemy)

## Security Notes

⚠️ **NEVER**:
- Commit `.env` file to git
- Share your private key
- Expose your Infura/Alchemy API key
- Use mainnet keys for testnet (or vice versa)

✓ **DO**:
- Use different addresses for testnet and mainnet
- Rotate API keys regularly
- Keep backups of private keys in secure storage
- Use hardware wallet in production

## Next Steps

After successful deployment:

1. **Test claims:** File test claims through the API
2. **Monitor transactions:** Use Sepolia Etherscan to track all transactions
3. **Integrate UI:** Connect your React frontend to these blockchain endpoints
4. **Add more features:** Implement Oracle integration for real flight data
5. **Upgrade to mainnet:** When ready, deploy to Ethereum mainnet

## Support

For issues:
1. Check Sepolia Etherscan for transaction status
2. Review error messages in backend logs
3. Verify all contract addresses and private keys
4. Check RPC endpoint availability

---

**Happy deploying! 🚀**
