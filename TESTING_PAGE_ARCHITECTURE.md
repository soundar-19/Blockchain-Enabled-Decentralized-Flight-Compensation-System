# Testing Page - Blockchain Network Architecture

**Blockchain Network Architecture**

A decentralized ledger system maintains immutable records of passenger flight data, submitted compensation claims, eligibility verification through multi-layer validation mechanisms, and all compensation transactions processed through the SkyGuard DAO smart contracts on the Ethereum Sepolia testnet, ensuring tamper-proof storage of all claim records with permanent, cryptographically-signed transaction hashes that cannot be modified, modified or deleted, transparent auditing capabilities through real-time blockchain explorers and audit trail generation for regulatory compliance, cryptographic authentication using ECDSA signatures and SHA-256 hashing to prevent unauthorized access and signature forgery, and secure interaction between passengers, airlines, regulators, and the blockchain network through MetaMask wallet integration that enables safe private key management without exposing sensitive credentials to the backend server. The architecture implements a three-tier verification system where the frontend (React + Ethers.js) handles user interactions and wallet connections, the backend (Flask + Web3.py) validates business logic and manages database records in MongoDB, and the Ethereum Sepolia blockchain serves as the immutable source of truth for all compensation transactions with smart contracts (CompensationContract, FlightToken, GovernanceContract, StakingPool) deployed at fixed addresses and accessible through Alchemy RPC endpoints, while IPFS integration enables distributed storage of large claim documents and evidence files with content-addressable hashing so that any modification to stored documents becomes immediately detectable. The system leverages Sepolia Ethereum's rapid block confirmation times (~12 seconds per block), Web3.js and Ethers.js libraries for seamless blockchain interaction from the frontend, MetaMask's browser extension for hardware wallet-compatible transaction signing, and distributed node networks to ensure high availability and resilience against single points of failure, creating a robust, transparent, and trustworthy infrastructure where every compensation claim is permanently recorded, cryptographically verified, and auditable by all stakeholders in the flight compensation ecosystem.

---

## Testing Validation Checklist

- ✅ Blockchain connection test via Alchemy RPC endpoint
- ✅ MetaMask wallet integration and transaction signing
- ✅ Smart contract function calls and gas estimation
- ✅ Immutability verification of past transactions
- ✅ Cryptographic signature validation
- ✅ IPFS document storage and retrieval
- ✅ Real-time blockchain explorer verification
- ✅ Multi-signature authorization testing (for large payouts)
- ✅ Data persistence across blockchain and MongoDB
- ✅ Network failover and recovery mechanisms

## Test Environment Details

| Component | Network | Status | Test Address |
|-----------|---------|--------|--------------|
| **Ethereum RPC** | Sepolia | ✅ Live | https://sepolia.g.alchemy.com/v2/ |
| **CompensationContract** | Sepolia | ✅ Deployed | 0x8c89f99... |
| **FlightToken (FLY)** | Sepolia | ✅ Deployed | 0x9AF9e45... |
| **Block Explorer** | Sepolia | ✅ Live | https://sepolia.etherscan.io/ |
| **Web3 Provider** | MetaMask | ✅ Connected | v10.0+ required |
| **IPFS Gateway** | Public | ✅ Available | gateway.pinata.cloud |
