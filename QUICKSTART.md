# SkyGuard DAO - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Prerequisites
- Python 3.8+ → https://www.python.org/downloads/
- Node.js 16+ → https://nodejs.org/

### Step 2: Clone & Navigate
```bash
git clone <repository-url>
cd flight-compensation-system
```

### Step 3: Start Backend (Terminal 1)
```bash
# Windows
start_backend.bat

# Manual
cd backend
pip install -r requirements.txt
cd ..
python scripts/generate_dummy_data.py
python backend/api/app.py
```

### Step 4: Start Frontend (Terminal 2)
```bash
# Windows
start_frontend.bat

# Manual
cd frontend
npm install
npm run dev
```

### Step 5: Open Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

## 🎮 Using the Application

### Dashboard Tab
- View total pool value, participants, and claims processed
- See how the system works in 4 steps

### Stake Tab
- Browse 4 available routes (JFK→LAX, LHR→CDG, SFO→SEA, DXB→BOM)
- Click "Stake 100 FLY" to stake tokens
- View pool size, participants, average delay, and APY

### Compensate Tab
- Click quick action buttons (Food, Hotel, Refund, Transport)
- Watch claim status change from "Processing" to "Approved"
- See compensation credited to your balance

### Governance Tab
- View active proposals (rate changes, new routes, carbon initiatives)
- Click "Vote For" or "Vote Against"
- See voting progress bars and quorum status

### Loyalty Tab
- View your points across Delta, United, Emirates
- Select airlines and amount to swap
- Click "Swap Now" for instant exchange

### Carbon Tab
- Browse environmental projects
- See available credits, price, and impact
- Click "Buy 10 Credits" to purchase

### Marketplace Tab
- View available flight seats for sale
- See savings percentage
- Click "Buy Seat" to purchase

## 🧪 Testing API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get Account Info
```bash
curl http://localhost:5000/api/account/0x742d35a8f9c3e12b4d89c7a63f2e8d1b5c4a9f3a
```

### Stake Tokens
```bash
curl -X POST http://localhost:5000/api/stake \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35a8f9c3e12b4d89c7a63f2e8d1b5c4a9f3a","route_id":1,"amount":100}'
```

### File Compensation
```bash
curl -X POST http://localhost:5000/api/compensate \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35a8f9c3e12b4d89c7a63f2e8d1b5c4a9f3a","flight_number":"AA1234","delay_minutes":120,"type":"food","route_id":1}'
```

### Get Blockchain Info
```bash
curl http://localhost:5000/api/blockchain/info
```

## 📊 Default Test Accounts

| Address | Balance | Purpose |
|---------|---------|---------|
| 0x742d35a8f9c3e12b4d89c7a63f2e8d1b5c4a9f3a | 5000 FLY | Primary test account |
| 0x892a56b4c7d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6 | 5000 FLY | Secondary test account |
| 0x7a2f8b3c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8 | 5000 FLY | Tertiary test account |

## 🔧 Common Commands

### Backend
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Generate test data
python scripts/generate_dummy_data.py

# Start server
python backend/api/app.py

# Check Python version
python --version
```

### Frontend
```bash
# Install dependencies
cd frontend && npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check Node version
node --version
```

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 in use | Kill process: `netstat -ano \| findstr :5000` then `taskkill /PID <PID> /F` |
| Port 5173 in use | Vite will auto-select next port |
| Module not found | Reinstall: `pip install -r requirements.txt --force-reinstall` |
| npm install fails | Clear cache: `npm cache clean --force` then retry |
| API calls fail | Ensure backend is running on port 5000 |
| Blank page | Check browser console for errors |

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/api/app.py` | Flask API server |
| `backend/blockchain/blockchain.py` | Blockchain implementation |
| `backend/blockchain/smart_contracts.py` | Smart contracts |
| `frontend/src/App.jsx` | React UI component |
| `scripts/generate_dummy_data.py` | Test data generator |
| `README.md` | Full documentation |
| `ARCHITECTURE.md` | Technical architecture |

## 🎯 Next Steps

1. ✅ Get the app running
2. ✅ Explore all 7 tabs in the UI
3. ✅ Test API endpoints with curl
4. ✅ Review the code structure
5. ✅ Read ARCHITECTURE.md for details
6. ✅ Customize and extend features

## 💡 Tips

- **Watch the console**: Backend logs show blockchain activity
- **Check browser DevTools**: See API calls and responses
- **Use the test accounts**: All have 5000 FLY to start
- **Experiment freely**: Data resets when you restart
- **Read the code**: Well-commented for learning

## 📚 Documentation

- **README.md**: Complete setup and features
- **ARCHITECTURE.md**: Technical details and status
- **This file**: Quick reference guide

## 🆘 Need Help?

1. Check the Troubleshooting section above
2. Review README.md for detailed instructions
3. Read ARCHITECTURE.md for technical details
4. Examine code comments in source files
5. Create an issue on GitHub

---

**Happy Coding! 🚀**
