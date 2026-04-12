# 🎯 SkyGuard DAO - Quick Reference Guide

## 🚀 Run Everything in 60 Seconds

### Terminal 1: Backend
```bash
cd d:\Blockchain_Enabled_Flight_Compensation_System
python backend/run.py
```

### Terminal 2: Frontend
```bash
cd d:\Blockchain_Enabled_Flight_Compensation_System\frontend
npm run dev
```

### Browser
Open `http://localhost:5177`

---

## 👤 User Journey (Step-by-Step)

### 1️⃣ Register
| Step | Action | Result |
|------|--------|--------|
| Click "Register" | Enter email & password | Account created ✓ |

### 2️⃣ Create Blockchain Wallet
| Step | Action | Result |
|------|--------|--------|
| Dashboard | Click "Create Wallet" | New address generated on Sepolia |

### 3️⃣ Get Test ETH (Required!)
| Step | Action | Result |
|------|--------|--------|
| Visit [Faucet](https://sepolia-faucet.pk910.de/) | Paste wallet address | Receive ~1 test ETH |

### 4️⃣ File Compensation Claim
| Step | Action | Result |
|------|--------|--------|
| Compensate Tab | Enter flight details | Transaction on blockchain ✓ |
| | Click "File Claim" | Receive FLY tokens |

### 5️⃣ Verify on Blockchain
| Step | Action | Result |
|------|--------|--------|
| Copy Tx Hash | Visit Etherscan | See transaction confirmed |

---

## 🔑 Key Information

### Wallet Created?
✅ Check Dashboard → "Wallet Connected" shows address

### Need Test ETH?
💧 [Sepolia Faucet](https://sepolia-faucet.pk910.de/)

### Check Balance?
🏦 Dashboard → "FLY Balance" and "ETH Balance" cards

### File Claim?
📝 Compensate Tab (requires wallet + ETH)

### Verify Transaction?
🔍 Click Etherscan link in success message or:  
https://sepolia.etherscan.io/tx/{txHash}

---

## ❌ Common Issues

| Issue | Solution |
|-------|----------|
| Backend not running | `python backend/run.py` |
| Frontend not loading | `npm run dev` in `/frontend` |
| Wallet creation failed | Check backend logs, ensure ETH available |
| Can't file claim | Need test ETH from faucet |
| Balance not updating | Refresh Dashboard, wait for confirmation |
| Compensation filed but no update | Wait 1-2 blocks, then refresh |

---

## 📊 Contract Addresses (Sepolia)

```
FLY Token: 0x9AF9e45fae020bCA438B6aD17385686d3B4a93c6
Compensation: 0x8c89f99F624156ED5d7E3dFCF9Fd4D939996482F
```

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| Local Frontend | http://localhost:5177 |
| Backend API | http://localhost:5000 |
| Sepolia Etherscan | https://sepolia.etherscan.io |
| Faucet | https://sepolia-faucet.pk910.de/ |
| FLY Contract | https://sepolia.etherscan.io/address/0x9AF9e45fae020bCA438B6aD17385686d3B4a93c6 |

---

## ✅ Success Indicators

✓ Backend running: `GET /api/blockchain/status` returns `"connected"`  
✓ Wallet created: Dashboard shows address  
✓ Balance fetched: Shows real ETH + FLY amounts  
✓ Claim filed: Etherscan link shows transaction  
✓ Compensation approved: Balance increases  

---

**Everything connected. Ready to test!** 🚀
