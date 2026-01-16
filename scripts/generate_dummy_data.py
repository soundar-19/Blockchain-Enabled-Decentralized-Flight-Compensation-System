import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.blockchain.blockchain import Blockchain, Transaction
from backend.database.db_manager import DatabaseManager
import random

def generate_dummy_data():
    print("Generating dummy data for SkyGuard DAO...")
    
    blockchain = Blockchain()
    db = DatabaseManager()
    
    # Create dummy accounts
    accounts = [
        "0x742d35a8f9c3e12b4d89c7a63f2e8d1b5c4a9f3a",
        "0x892a56b4c7d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
        "0x7a2f8b3c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
        "0x3c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
        "0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4"
    ]
    
    print(f"Creating {len(accounts)} dummy accounts...")
    for account in accounts:
        blockchain.accounts[account] = 5000.0
        db.add_user(account, 5000.0)
    
    # Generate dummy transactions
    print("Generating dummy transactions...")
    tx_types = ["transfer", "stake", "compensate"]
    
    for i in range(20):
        sender = random.choice(accounts)
        recipient = random.choice(accounts)
        amount = random.randint(10, 200)
        tx_type = random.choice(tx_types)
        
        tx = Transaction(sender, recipient, amount, tx_type, {
            "flight_number": f"AA{random.randint(1000, 9999)}",
            "route_id": random.randint(1, 4)
        })
        
        blockchain.add_transaction(tx)
        
        if len(blockchain.pending_transactions) >= 5:
            block = blockchain.mine_pending_transactions()
            print(f"Mined block #{block.index} with {len(block.transactions)} transactions")
    
    # Mine remaining transactions
    if blockchain.pending_transactions:
        blockchain.mine_pending_transactions()
    
    print(f"Generated {len(blockchain.chain)} blocks")
    print(f"Total transactions: {sum(len(block.transactions) for block in blockchain.chain)}")
    print(f"Blockchain is valid: {blockchain.validate_chain()}")
    
    return blockchain

if __name__ == "__main__":
    generate_dummy_data()
