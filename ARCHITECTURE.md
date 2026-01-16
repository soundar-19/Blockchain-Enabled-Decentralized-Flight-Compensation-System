# SkyGuard DAO - Project Status & Architecture

## Project Overview
SkyGuard DAO is a decentralized flight compensation protocol built with Python (Flask) backend and React frontend. It uses a custom Proof-of-Stake blockchain implementation with smart contracts for automated compensation, staking, governance, and more.

## Current Implementation Status

### ✅ Fully Implemented

#### Backend (Python/Flask)
- **Custom Blockchain** (`backend/blockchain/blockchain.py`)
  - Block and Transaction classes
  - Proof-of-Stake consensus mechanism
  - Chain validation
  - Account management
  - Staking pools tracking
  
- **Smart Contracts** (`backend/blockchain/smart_contracts.py`)
  - StakingContract: Token staking with rewards calculation
  - CompensationContract: Automated delay compensation
  - GovernanceContract: DAO proposal and voting system
  - LoyaltyExchangeContract: Cross-airline point swapping
  
- **API Server** (`backend/api/app.py`)
  - Health check endpoint
  - Blockchain info endpoint
  - Account balance retrieval
  - Staking operations
  - Compensation claims processing
  - Governance (proposals, voting)
  - Loyalty point swapping
  - Routes information
  
- **Services**
  - FlightOracle: Simulated flight delay data provider
  - Database Manager: SQLite operations for persistence
  
- **Database** (`backend/database/db_manager.py`)
  - Users table
  - Transactions table
  - Compensations table
  - Staking table

#### Frontend (React/Vite)
- **Main Application** (`frontend/src/App.jsx`)
  - Dashboard tab with statistics
  - Stake tab for route-specific staking
  - Compensate tab for filing claims
  - Governance tab for DAO voting
  - Loyalty tab for point exchange
  - Carbon tab for offset marketplace
  - Marketplace tab for seat trading
  
- **Configuration**
  - Vite setup with React
  - Tailwind CSS styling
  - PostCSS configuration
  - Proxy setup for API calls

#### Scripts
- `generate_dummy_data.py`: Creates test blockchain data
- `start_backend.bat`: Automated backend startup
- `start_frontend.bat`: Automated frontend startup

### 🔄 Partially Implemented

#### Backend
- **Oracle Service**: Currently returns dummy data; needs real flight API integration
- **Database Persistence**: Basic structure exists but not fully integrated with blockchain state
- **Transaction Signing**: Simplified implementation; needs proper cryptographic signing

#### Frontend
- **API Integration**: UI is functional but makes mock calls; needs connection to backend
- **Wallet Integration**: Hardcoded addresses; needs Web3 wallet connection
- **Real-time Updates**: Static data; needs WebSocket or polling for live updates

### ❌ Not Implemented

- **Security Features**
  - Proper cryptographic key management
  - Transaction signature verification
  - API authentication/authorization
  - Rate limiting
  
- **Production Features**
  - Real flight API integration (AviationStack, FlightAware, etc.)
  - Email notifications
  - Mobile app
  - Multi-chain support
  - Advanced analytics dashboard
  
- **Testing**
  - Unit tests
  - Integration tests
  - End-to-end tests

## Architecture

### Data Flow

```
Frontend (React) 
    ↓ HTTP/REST
Backend API (Flask)
    ↓
Smart Contracts
    ↓
Blockchain (Custom PoS)
    ↓
Database (SQLite)
```

### Key Components

1. **Blockchain Layer**
   - Manages blocks, transactions, and chain validation
   - Implements Proof-of-Stake consensus
   - Tracks account balances and staking

2. **Smart Contract Layer**
   - Executes business logic (staking, compensation, governance)
   - Maintains contract state
   - Validates operations

3. **API Layer**
   - Exposes REST endpoints
   - Handles HTTP requests
   - Coordinates between blockchain and contracts

4. **Frontend Layer**
   - User interface for all features
   - State management with React hooks
   - Responsive design with Tailwind CSS

## Running the Application

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm

### Quick Start

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
cd ..
python scripts/generate_dummy_data.py
python backend/api/app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Dummy Accounts

The system initializes with 3 test accounts:
- `0x742d35a8f9c3e12b4d89c7a63f2e8d1b5c4a9f3a` (5000 FLY)
- `0x892a56b4c7d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6` (5000 FLY)
- `0x7a2f8b3c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8` (5000 FLY)

## Token Economics

- **FLY Token**: Native token for the platform
- **Initial Balance**: 5000 FLY per account
- **Staking Rewards**: 12% APY
- **Compensation Rates**:
  - Food: 25 FLY
  - Hotel: 150 FLY
  - Refund: 200 FLY
  - Transport: 50 FLY
- **Loyalty Exchange**: 0.85 conversion rate, 2% fee
- **Validator Rewards**: 10 FLY per block

## Next Steps for Production

1. **Security Audit**
   - Implement proper cryptographic signing
   - Add API authentication
   - Secure key management

2. **Real Data Integration**
   - Integrate flight APIs
   - Connect to real oracles
   - Implement data verification

3. **Testing**
   - Write comprehensive test suite
   - Load testing
   - Security testing

4. **Deployment**
   - Containerize with Docker
   - Set up CI/CD pipeline
   - Deploy to cloud infrastructure

5. **Compliance**
   - Legal review
   - Regulatory compliance
   - Terms of service

## File Structure

```
flight-compensation-system/
├── backend/
│   ├── api/
│   │   └── app.py              # Flask API server
│   ├── blockchain/
│   │   ├── blockchain.py       # Core blockchain
│   │   └── smart_contracts.py  # Smart contracts
│   ├── config/
│   │   └── config.py           # Configuration
│   ├── database/
│   │   └── db_manager.py       # Database operations
│   ├── services/
│   │   └── oracle_service.py   # Flight data oracle
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Styles
│   ├── index.html              # HTML template
│   ├── package.json            # npm dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind configuration
│   └── postcss.config.js       # PostCSS configuration
├── scripts/
│   └── generate_dummy_data.py  # Data generation
├── start_backend.bat           # Backend startup script
├── start_frontend.bat          # Frontend startup script
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
└── README.md                   # Documentation
```

## Technology Stack

### Backend
- **Language**: Python 3.8+
- **Framework**: Flask 3.0.0
- **Database**: SQLite
- **CORS**: Flask-CORS 4.0.0
- **Environment**: python-dotenv 1.0.0

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.3.6
- **Icons**: Lucide React 0.263.1
- **HTTP Client**: Axios 1.6.0

### Blockchain
- **Consensus**: Custom Proof-of-Stake
- **Hashing**: SHA-256
- **Smart Contracts**: Python-based execution

## Contact & Support

For questions or issues:
1. Check the Troubleshooting section in README.md
2. Review this architecture document
3. Examine the code comments in source files
4. Create an issue on GitHub

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Development/Prototype
