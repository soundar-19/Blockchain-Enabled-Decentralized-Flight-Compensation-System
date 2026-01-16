# backend/api/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from blockchain.blockchain import Blockchain, Transaction
from blockchain.smart_contracts import (
    StakingContract, CompensationContract, 
    GovernanceContract, LoyaltyExchangeContract
)
from services.oracle_service import FlightOracle
from database.db_manager import DatabaseManager

app = Flask(__name__)
CORS(app)

# Initialize blockchain and services
blockchain = Blockchain()
db_manager = DatabaseManager()
flight_oracle = FlightOracle()

# Initialize smart contracts
contracts = {
    "staking": {},
    "compensation": {},
    "governance": GovernanceContract("GOV-001", "SYSTEM", 3),
    "loyalty": LoyaltyExchangeContract("LOY-001", "SYSTEM", 0.85, 0.02)
}

# Initialize dummy accounts
DUMMY_ACCOUNTS = [
    "0x742d35a8f9c3e12b4d89c7a63f2e8d1b5c4a9f3a",
    "0x892a56b4c7d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
    "0x7a2f8b3c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"
]

for account in DUMMY_ACCOUNTS:
    blockchain.accounts[account] = 5000.0

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "blockchain_length": len(blockchain.chain)})

@app.route('/api/blockchain/info', methods=['GET'])
def get_blockchain_info():
    return jsonify({
        "chain_length": len(blockchain.chain),
        "pending_transactions": len(blockchain.pending_transactions),
        "total_validators": len(blockchain.validators),
        "is_valid": blockchain.validate_chain()
    })

@app.route('/api/account/<address>', methods=['GET'])
def get_account(address):
    balance = blockchain.get_balance(address)
    staking_info = blockchain.get_staking_info(address)
    
    return jsonify({
        "address": address,
        "balance": balance,
        "staking_info": staking_info
    })

@app.route('/api/stake', methods=['POST'])
def stake_tokens():
    data = request.json
    address = data.get('address')
    route_id = data.get('route_id')
    amount = data.get('amount')
    
    # Create staking contract if doesn't exist
    if route_id not in contracts["staking"]:
        contracts["staking"][route_id] = StakingContract(
            f"STAKE-{route_id}", "SYSTEM", route_id, 50, 0.12
        )
    
    # Execute contract
    result = contracts["staking"][route_id].stake(address, amount)
    
    if result["success"]:
        # Create blockchain transaction
        tx = Transaction(
            address, f"POOL-{route_id}", amount, "stake",
            {"route_id": route_id}
        )
        blockchain.add_transaction(tx)
        blockchain.mine_pending_transactions()
    
    return jsonify(result)

@app.route('/api/compensate', methods=['POST'])
def file_compensation():
    data = request.json
    address = data.get('address')
    flight_number = data.get('flight_number')
    delay_minutes = data.get('delay_minutes')
    comp_type = data.get('type')
    route_id = data.get('route_id', 1)
    
    # Get oracle data
    oracle_data = flight_oracle.get_flight_data(flight_number)
    
    # Create compensation contract if doesn't exist
    if route_id not in contracts["compensation"]:
        contracts["compensation"][route_id] = CompensationContract(
            f"COMP-{route_id}", "SYSTEM", route_id,
            {"food": 25, "hotel": 150, "refund": 200, "transport": 50}
        )
    
    # Process claim
    result = contracts["compensation"][route_id].process_claim(
        address, flight_number, delay_minutes, comp_type, oracle_data
    )
    
    if result["success"]:
        # Create blockchain transaction
        tx = Transaction(
            "SYSTEM", address, result["amount"], "compensate",
            {"flight_number": flight_number, "comp_type": comp_type}
        )
        blockchain.add_transaction(tx)
        blockchain.mine_pending_transactions()
    
    return jsonify(result)

@app.route('/api/governance/proposals', methods=['GET'])
def get_proposals():
    proposals = contracts["governance"].state["proposals"]
    return jsonify({"proposals": list(proposals.values())})

@app.route('/api/governance/propose', methods=['POST'])
def create_proposal():
    data = request.json
    result = contracts["governance"].create_proposal(
        data['proposer'], data['title'], data['description'],
        data['type'], data.get('data', {})
    )
    return jsonify(result)

@app.route('/api/governance/vote', methods=['POST'])
def vote_proposal():
    data = request.json
    result = contracts["governance"].vote(
        data['proposal_id'], data['voter'], 
        data['vote_for'], data['voting_power']
    )
    blockchain.mine_pending_transactions()
    return jsonify(result)

@app.route('/api/loyalty/swap', methods=['POST'])
def swap_loyalty():
    data = request.json
    
    # Get user's current balances (this would come from database in production)
    user_balances = {
        "Delta": 15000,
        "United": 8000,
        "Emirates": 12000
    }
    
    result = contracts["loyalty"].swap_points(
        data['user'], data['from_airline'], data['to_airline'],
        data['amount'], user_balances
    )
    
    return jsonify(result)

@app.route('/api/routes', methods=['GET'])
def get_routes():
    # Return dummy route data
    routes = [
        {
            "id": 1,
            "route": "JFK → LAX",
            "airline": "Delta",
            "total_pool": 45000,
            "participants": 156,
            "avg_delay": 34
        }
    ]
    return jsonify({"routes": routes})

if __name__ == '__main__':
    print("SkyGuard DAO Backend Starting...")
    print(f"Blockchain initialized with {len(blockchain.chain)} blocks")
    print(f"{len(DUMMY_ACCOUNTS)} dummy accounts created")
    app.run(debug=True, port=5000)