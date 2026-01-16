# 🚀 SkyGuard DAO - Decentralized Flight Compensation Protocol

A comprehensive blockchain-based platform that revolutionizes flight delay compensation through decentralization, smart contracts, and community governance.

## 🌟 Features

### 1. **Decentralized Compensation Pools**
- Route-specific staking pools with customizable parameters
- Automatic compensation via smart contracts
- Transparent fund management on blockchain
- Real-time pool statistics and participant tracking

### 2. **Instant Compensation**
- **Food vouchers** for short delays (25 FLY tokens)
- **Hotel accommodation** for overnight delays (150 FLY tokens)
- **Full ticket refunds** for major delays (200 FLY tokens)
- **Ground transportation** coverage (50 FLY tokens)
- Oracle-verified delay validation
- Automatic payout processing

### 3. **DAO Governance**
- Community voting on compensation rates
- Proposal creation for new routes and features
- Democratic decision-making with stake-weighted voting
- 3-day voting periods with quorum requirements
- Transparent proposal execution

### 4. **Cross-Airline Loyalty Exchange**
- Swap loyalty points between airlines (Delta, United, Emirates)
- Real-time conversion rates (0.85 exchange rate)
- Blockchain-secured transfers
- 2% smart contract fee
- Instant point swapping

### 5. **Carbon Offset Marketplace**
- Purchase verified carbon credits
- Multiple environmental projects (Rainforest, Wind Energy, Ocean Cleanup)
- NFT certificates for transparency
- Support environmental projects with FLY tokens
- Track environmental impact

### 6. **Peer-to-Peer Seat Trading**
- Buy and sell confirmed flight seats
- Smart contract escrow for secure transactions
- Fair pricing mechanism (no scalping)
- Instant ticket transfer to wallet
- Savings tracking on purchases

## 🏗️ Architecture

```
SkyGuard DAO
├── Blockchain Layer (Python)
│   ├── Custom Proof-of-Stake consensus
│   ├── Smart contracts for staking, compensation, governance
│   └── Transaction processing
├── Backend API (Flask)
│   ├── RESTful API endpoints
│   ├── Flight data oracle integration
│   └── Database management
└── Frontend (React + Vite)
    ├── Modern, responsive UI
    ├── Real-time blockchain interaction
    └── Wallet integration ready
```

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- Git

### Option 1: Automated Setup (Windows)

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/skyguard-dao.git
cd flight-compensation-system
```

2. **Start Backend** (in first terminal)
```bash
start_backend.bat
```

3. **Start Frontend** (in second terminal)
```bash
start_frontend.bat
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Generate dummy blockchain data**
```bash
cd ..
python scripts/generate_dummy_data.py
```

4. **Start the Flask server**
```bash
python backend/api/app.py
```

The backend will start on http://localhost:5000

#### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
```bash
cd frontend
```

2. **Install npm dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

The frontend will start on http://localhost:5173

## 📁 Project Structure

```
flight-compensation-system/
├── backend/
│   ├── api/
│   │   └── app.py                 # Flask API server
│   ├── blockchain/
│   │   ├── blockchain.py          # Core blockchain implementation
│   │   └── smart_contracts.py    # Smart contract logic
│   ├── config/
│   │   └── config.py              # Configuration settings
│   ├── database/
│   │   └── db_manager.py          # Database operations
│   └── requirements.txt           # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main React component
│   │   └── main.jsx               # Entry point
│   ├── index.html
│   └── package.json               # Node dependencies
├── scripts/
│   └── generate_dummy_data.py     # Data generation script
├── .env.example                   # Environment template
├── .gitignore
├── docker-compose.yml             # Docker configuration
└── README.md
```

## 🔌 API Endpoints

### Health & Info
- `GET /api/health` - Health check
- `GET /api/blockchain/info` - Get blockchain information

### Accounts
- `GET /api/account/<address>` - Get account balance and staking info

### Staking
- `POST /api/stake` - Stake tokens in route pool
  ```json
  {
    "address": "0x...",
    "route_id": 1,
    "amount": 100
  }
  ```

### Compensation
- `POST /api/compensate` - File compensation claim
  ```json
  {
    "address": "0x...",
    "flight_number": "AA1234",
    "delay_minutes": 120,
    "type": "food",
    "route_id": 1
  }
  ```

### Governance
- `GET /api/governance/proposals` - Get all proposals
- `POST /api/governance/propose` - Create new proposal
  ```json
  {
    "proposer": "0x...",
    "title": "Proposal Title",
    "description": "Description",
    "type": "rate_change",
    "data": {}
  }
  ```
- `POST /api/governance/vote` - Vote on proposal
  ```json
  {
    "proposal_id": 1,
    "voter": "0x...",
    "vote_for": true,
    "voting_power": 100
  }
  ```

### Loyalty Exchange
- `POST /api/loyalty/swap` - Swap loyalty points
  ```json
  {
    "user": "0x...",
    "from_airline": "Delta",
    "to_airline": "United",
    "amount": 1000
  }
  ```

### Routes
- `GET /api/routes` - Get available routes

## 🧪 Testing

### Test Backend API

1. **Health Check**
```bash
curl http://localhost:5000/api/health
```

2. **Get Blockchain Info**
```bash
curl http://localhost:5000/api/blockchain/info
```

3. **Get Account Balance**
```bash
curl http://localhost:5000/api/account/0x742d35a8f9c3e12b4d89c7a63f2e8d1b5c4a9f3a
```

4. **Stake Tokens**
```bash
curl -X POST http://localhost:5000/api/stake \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35a8f9c3e12b4d89c7a63f2e8d1b5c4a9f3a","route_id":1,"amount":100}'
```

5. **File Compensation**
```bash
curl -X POST http://localhost:5000/api/compensate \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35a8f9c3e12b4d89c7a63f2e8d1b5c4a9f3a","flight_number":"AA1234","delay_minutes":120,"type":"food","route_id":1}'
```

### Test Frontend

1. Open http://localhost:5173 in your browser
2. Navigate through different tabs:
   - **Dashboard**: View overall statistics
   - **Stake**: Stake tokens in route pools
   - **Compensate**: File compensation claims
   - **Governance**: Vote on DAO proposals
   - **Loyalty**: Exchange airline points
   - **Carbon**: Purchase carbon credits
   - **Marketplace**: Trade flight seats

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

## 🔐 Security Features

- Proof-of-Stake consensus mechanism
- Transaction signature verification
- Smart contract validation
- Secure API endpoints
- Environment variable protection

## 🛠️ Technology Stack

### Backend
- Python 3.8+
- Flask (Web Framework)
- SQLite (Database)
- Custom Blockchain Implementation

### Frontend
- React 18
- Vite (Build Tool)
- Tailwind CSS
- Lucide Icons
- Axios

## 📊 Smart Contract Functions

### StakingContract
- `stake(address, route_id, amount)` - Stake tokens
- `unstake(address, stake_id)` - Withdraw stake
- `calculate_rewards(address)` - Calculate staking rewards

### CompensationContract
- `request_compensation(flight_number, delay_minutes)` - Request compensation
- `process_compensation(request_id)` - Process compensation claim

### GovernanceContract
- `create_proposal(title, description)` - Create DAO proposal
- `vote(proposal_id, vote_choice)` - Vote on proposal
- `execute_proposal(proposal_id)` - Execute approved proposal

## 🌐 Environment Variables

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_PATH=skyguard.db
API_HOST=0.0.0.0
API_PORT=5000
FLIGHT_API_KEY=your-flight-api-key
```

## 📈 Roadmap

- [ ] Web3 wallet integration (MetaMask)
- [ ] Real flight API integration
- [ ] Mobile app development
- [ ] Multi-chain support
- [ ] Advanced analytics dashboard
- [ ] AI-powered delay prediction

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ by the SkyGuard DAO Team

## 📞 Support

- Documentation: [docs.skyguard.dao](https://docs.skyguard.dao)
- Discord: [discord.gg/skyguard](https://discord.gg/skyguard)
- Twitter: [@SkyGuardDAO](https://twitter.com/SkyGuardDAO)

## ⚠️ Disclaimer

This is a prototype/educational project. Not intended for production use with real financial transactions without proper security audits and regulatory compliance.

## 🔧 Troubleshooting

### Backend Issues

**Port 5000 already in use**
```bash
# Windows: Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Module not found errors**
```bash
# Reinstall dependencies
cd backend
pip install -r requirements.txt --force-reinstall
```

**Database errors**
```bash
# Delete and regenerate database
del skyguard.db
python scripts/generate_dummy_data.py
```

### Frontend Issues

**Port 5173 already in use**
- The Vite dev server will automatically try the next available port
- Or manually kill the process using port 5173

**npm install fails**
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Tailwind CSS not working**
```bash
# Ensure PostCSS and Tailwind are properly installed
npm install -D tailwindcss postcss autoprefixer
```

**API calls failing**
- Ensure backend is running on http://localhost:5000
- Check browser console for CORS errors
- Verify Vite proxy configuration in vite.config.js

### Common Issues

**Python version incompatibility**
- Ensure Python 3.8 or higher is installed
- Check with: `python --version`

**Node.js version incompatibility**
- Ensure Node.js 16 or higher is installed
- Check with: `node --version`

**CORS errors**
- Backend has CORS enabled via Flask-CORS
- If issues persist, check Flask-CORS installation
