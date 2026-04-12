# MetaMask Integration Guide for Users
## Blockchain-Enabled Flight Compensation System

---

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [User Registration Process](#user-registration-process)
3. [Connecting MetaMask Wallet](#connecting-metamask-wallet)
4. [How It Works](#how-it-works)
5. [Security Best Practices](#security-best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Installation & Setup

### Step 1: Install MetaMask Browser Extension

#### For Chrome/Edge/Brave:
1. Go to [MetaMask Official Website](https://metamask.io)
2. Click "Download" or "Install MetaMask"
3. Select your browser from the dropdown
4. Click "Install MetaMask for [Browser]"
5. A new tab will open with the Chrome Web Store
6. Click "Add to Chrome" (or your browser)
7. Click "Add extension" to confirm

#### For Firefox:
1. Visit [MetaMask on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/ether-metamask/)
2. Click "Add to Firefox"
3. Click "Add" in the popup

#### For Safari:
1. MetaMask is available on the App Store
2. Search for "MetaMask"
3. Click "Get" and install

### Step 2: Create Your MetaMask Wallet

After installation, you'll see the MetaMask icon in your browser toolbar.

1. **Click the MetaMask icon** in your browser's extension area
2. **Click "Get Started"**
3. **Select "Create a Wallet"** (or "Import Wallet" if you have an existing one)
4. **Create a password:**
   - This password ONLY locks MetaMask on your current device
   - Use a strong password (12+ characters, mix of uppercase, lowercase, numbers, symbols)
   - **Important:** This is NOT your blockchain password
5. **Read and accept the terms** of use
6. **Save your Secret Recovery Phrase (CRITICAL!)**
   - MetaMask will show you a 12-word phrase
   - **WRITE THIS DOWN on a piece of paper RIGHT NOW**
   - **DO NOT take a screenshot or save it digitally**
   - Store the paper in a safe location (safe, drawer, etc.)
   - **ANYONE with these 12 words can access your funds**
7. **Confirm your Secret Recovery Phrase:**
   - MetaMask will ask you to select specific words from your phrase
   - This proves you wrote it down correctly
8. **All Done!** Your MetaMask wallet is ready

---

## User Registration Process

### Automatic Wallet Creation During Registration

When you register for the Flight Compensation System, our platform automatically:

1. **Creates a backend wallet** for securing compensation claims
2. **Stores your wallet address** in your account
3. **Associates it with your flying profile** and compensation history

#### Registration Steps:

1. Go to [Flight Compensation System](http://localhost:3000)
2. Click **"Register"** or **"Sign Up"**
3. Fill in your details:
   - **Full Name:** Your legal name
   - **Email:** A valid email address
   - **Password:** Strong password (12+ characters)
   - **Confirm Password:** Repeat your password
4. Click **"Create Account"**
5. You'll receive a confirmation that your account AND wallet were created
6. Your backend wallet address (starting with `0x...`) is automatically associated with your account
7. **Login to continue**

---

## Connecting MetaMask Wallet

### Why Connect MetaMask?

- **Direct Fund Transfers:** Receive compensation directly to your MetaMask wallet
- **User Control:** You control your private keys, not us
- **True Decentralization:** Your funds are on the blockchain, not a server
- **Real Blockchain:** Transactions are on Sepolia Ethereum (testnet) or Polygon (mainnet)

### Step-by-Step Connection

#### 1. **Ensure MetaMask is Installed**
   - Check your browser's extension area
   - You should see the MetaMask fox icon

#### 2. **Log Into the Flight Compensation System**
   - Go to the application dashboard
   - Enter your email and password
   - Click "Login"

#### 3. **Find the "Connect MetaMask" Button**
   - On your dashboard, look for the section: **"Connect Your MetaMask Wallet"**
   - This section shows:
     - A wallet icon
     - Text: "Use your real Ethereum wallet for on-chain transactions"
     - An orange "Connect MetaMask Wallet" button

#### 4. **Click "Connect MetaMask"**
   - The MetaMask popup will appear
   - You'll see your wallet address(es) listed

#### 5. **Select Your Wallet Account**
   - Choose the account you want to use (usually "Account 1")
   - Click on the account to select it

#### 6. **Approve the Connection**
   - MetaMask will ask: "Do you allow this site to see your Ethereum address?"
   - Click **"Next"**
   - Review the permissions (the site can only see your address, not move funds)
   - Click **"Connect"**

#### 7. **Success!**
   - The section will now show: ✓ **MetaMask Connected**
   - You'll see your wallet address displayed as: `0x1234...abcd`
   - Your backend wallet and MetaMask wallet are now linked

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FLIGHT COMPENSATION SYSTEM                │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
           ┌────────▼────────┐  ┌──────▼──────────┐
           │ Backend Wallet  │  │ MetaMask Wallet │
           │  (Secure)       │  │ (User Controlled)
           │ 0x123...ABC     │  │   0x456...DEF   │
           │ Created at      │  │ Connected by    │
           │ Registration    │  │ User            │
           └────────────────┘  └─────────────────┘
                  │                      │
        ┌─────────▼──────────────────────▼────────┐
        │    Compensation Distribution Logic      │
        │  - Verify flight delay                  │
        │  - Calculate payout amount              │
        │  - Execute blockchain transaction      │
        └─────────────────────────────────────────┘
                  │
        ┌─────────▼────────────────────────┐
        │  Sepolia/Polygon Blockchain      │
        │  Immutable Transaction Record    │
        └────────────────────────────────┘
```

### When You Receive Compensation

1. **Flight Delay Detected:**
   - System monitors your flight status via APIs
   - Delay > 2 hours detected: ✓

2. **Claim Processed:**
   - Your compensation amount is calculated
   - Smart contract validates the claim
   - Payout is prepared

3. **Funds Transferred:**
   - FLY tokens (Compensation Tokens) are sent to your MetaMask wallet
   - Direct blockchain transaction
   - Permanent record on Sepolia Ethereum

4. **You Receive Notification:**
   - Email confirmation
   - Dashboard notification
   - Blockchain transaction link

5. **Funds in Your Wallet:**
   - Open MetaMask
   - You'll see the FLY token balance
   - You can hold, transfer, or swap these tokens

---

## Security Best Practices

### DO ✓

✓ **Write down your 12-word recovery phrase** and store it safely  
✓ **Use a strong, unique password** for MetaMask  
✓ **Enable 2FA (Two-Factor Authentication)** on your email  
✓ **Log out of MetaMask** when leaving a public computer  
✓ **Review permissions carefully** before connecting to any dApp  
✓ **Double-check wallet addresses** before confirming transactions  
✓ **Use hardware wallets** for large sums (Ledger, Trezor)  
✓ **Keep your browser and MetaMask updated**  

### DON'T ✗

✗ **Never share your 12-word phrase** with anyone, even support staff  
✗ **Never share your private key** with anyone  
✗ **Never enter your phrase on a website** (only in MetaMask)  
✗ **Never click links from suspicious emails** claiming to be MetaMask  
✗ **Never approve unlimited token spending** without understanding it  
✗ **Never use the same password** as other accounts  
✗ **Never take screenshots** of your recovery phrase  
✗ **Never use MetaMask on public WiFi** without a VPN  

### Recovery Phrase Security

```
Example (DO NOT USE - FOR EXAMPLE ONLY):
┌────────────────────────────────────────────┐
│ 1. apple     5. tiger     9. mouse         │
│ 2. banana    6. orange   10. keyboard      │
│ 3. cherry    7. grape    11. laptop        │
│ 4. dragon    8. house    12. zebra         │
└────────────────────────────────────────────┘

✓ SAFE: Written on paper, locked in safe
✗ UNSAFE: Screenshot folder
✗ UNSAFE: Email draft
✗ UNSAFE: Cloud storage
✗ UNSAFE: Text message
```

---

## Troubleshooting

### Issue 1: MetaMask Not Detected

**Problem:** "MetaMask is not installed" message

**Solution:**
1. Check your browser extension area (top-right corner)
2. Look for the fox icon
3. If not present, reinstall MetaMask from official website
4. Refresh the page after installation
5. Ensure MetaMask is enabled:
   - Right-click the extension icon
   - Select "Manage extension"
   - Ensure it's enabled

### Issue 2: "Wrong Network" Error

**Problem:** MetaMask is on Ethereum Mainnet, but system needs Sepolia

**Solution:**
1. Click the network dropdown in MetaMask (top-left)
2. Select **"Show test networks"** toggle (enable it)
3. Click the network dropdown again
4. Select **"Sepolia"**
5. Refresh the website
6. Try connecting again

### Issue 3: Connection Request Popup Doesn't Appear

**Problem:** Click "Connect MetaMask" but nothing happens

**Solution:**
1. Check if MetaMask popup is hidden behind other windows
2. Look for the MetaMask icon notification (should show a popup indicator)
3. Click the MetaMask extension icon
4. Try clicking "Connect MetaMask" button again
5. Clear browser cache and refresh:
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "All time"
   - Check "Cookies and other site data"
   - Click "Clear data"
6. Refresh the website and retry

### Issue 4: "Invalid Ethereum Address" Error

**Problem:** Connection fails with address validation error

**Solution:**
1. Ensure MetaMask is unlocked (not showing locked icon)
2. Click MetaMask icon to unlock if needed
3. Ensure correct account is selected in MetaMask
4. Try a different account:
   - Click account selection circle at top
   - Select a different account
   - Try connecting again
5. If issue persists, logout and login again

### Issue 5: No Compensation Received After Claim

**Problem:** Claim was submitted but no tokens received

**Solution:**
1. **Check your dashboard:**
   - Look for transaction history
   - Verify claim is marked as "Approved"
2. **Check MetaMask wallet:**
   - Open MetaMask
   - Search for the FLY token address
   - Tokens might not display until you add the token
3. **Add FLY Token to MetaMask:**
   - In MetaMask, click "Import tokens"
   - Paste FLY token address: `0x...` (provided by system)
   - Click "Add Token"
   - Your balance should now display
4. **Check the blockchain:**
   - Copy transaction hash from dashboard
   - Visit [Sepolia Etherscan](https://sepolia.etherscan.io)
   - Paste transaction hash
   - Verify transaction status "Success"
5. **Contact Support:** If transaction shows success but funds not received

### Issue 6: "Insufficient Gas" Error

**Problem:** Transaction fails during compensation transfer

**Solution:**
1. Ensure MetaMask account has Sepolia ETH:
   - Your address needs tiny amount for gas fees
   - Faucets: [Alchemy Faucet](https://sepoliafaucet.com)
2. Add Sepolia ETH to your account
3. Wait a few seconds
4. Retry the transaction

### Issue 7: Lost Recovery Phrase

**Problem:** You lost your 12-word recovery phrase

**Solution:**
- **If MetaMask is still logged in:**
  1. Do NOT log out
  2. Create a new wallet with MetaMask
  3. Save the new recovery phrase
  4. Contact support to link new wallet to account
- **If already logged out:**
  1. This wallet cannot be recovered
  2. Create a new MetaMask account with new recovery phrase
  3. Contact system administrator
  4. Update your account with new wallet address

---

## Testing Your Setup

### Quick Connection Test

1. **Register an account:**
   ```
   Email: user@example.com
   Password: TestPassword123!
   Full Name: John Doe
   ```

2. **Log in and check dashboard:**
   - You should see a section: "Connect Your MetaMask Wallet"

3. **Ensure MetaMask is installed:**
   - Extension icon visible in browser

4. **Click "Connect MetaMask":**
   - Popup should appear
   - Select account
   - Click "Connect"

5. **Verify connection:**
   - Section should show ✓ MetaMask Connected
   - Your wallet address displayed

### Transaction Test (Testnet Only)

1. **Fund your MetaMask wallet** (if on Sepolia):
   - Go to [Alchemy Faucet](https://sepoliafaucet.com)
   - Paste your address
   - Claim test ETH

2. **Submit a test compensation claim:**
   - Select a flight
   - Submit claim
   - MetaMask should prompt for approval

3. **Verify transaction:**
   - Open MetaMask
   - Should show transaction in history
   - Check token balance increase

---

## Frequently Asked Questions

**Q: Is my private key safe?**  
A: Yes. MetaMask stores your private key locally on your device only. It never sends it to servers or websites.

**Q: Can this website steal my funds?**  
A: No. MetaMask only allows us to see your wallet address and send tokens you approve. You must confirm every transaction.

**Q: What happens if I lose my recovery phrase?**  
A: You'll lose access to that wallet forever. Write it down and store it safely.

**Q: Can I use multiple wallets?**  
A: Yes. You can create multiple accounts in MetaMask and connect different ones.

**Q: Is Sepolia testnet real money?**  
A: No. Sepolia ETH and tokens have no real value. Use it for development/testing only.

**Q: How do I switch to main network?**  
A: Contact system administrators for production setup. Mainnet uses real cryptocurrency.

**Q: How much does a transaction cost?**  
A: Sepolia: Free (testnet)  
   Polygon: ~$0.01 per transaction  
   Ethereum: $5-50 depending on network congestion

---

## Support Resources

- **MetaMask Help:** https://support.metamask.io
- **Ethereum Basics:** https://ethereum.org/en/learn/
- **Sepolia Faucet:** https://sepoliafaucet.com
- **Block Explorer:** https://sepolia.etherscan.io
- **System Support:** support@flightcompensation.local

---

## Next Steps

1. ✓ Install MetaMask
2. ✓ Create your wallet and save recovery phrase
3. ✓ Register on Flight Compensation System
4. ✓ Connect MetaMask wallet
5. ✓ Fund wallet with testnet ETH (if needed)
6. ✓ Submit a flight compensation claim
7. ✓ Receive tokens directly to your wallet

**You're ready to use blockchain-enabled flight compensation!**
