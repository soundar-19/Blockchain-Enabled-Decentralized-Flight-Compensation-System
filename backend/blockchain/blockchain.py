# backend/blockchain/blockchain.py
import hashlib
import json
import time
from typing import List, Dict, Any
from datetime import datetime
import uuid

class Block:
    def __init__(self, index: int, timestamp: float, transactions: List[Dict], 
                 previous_hash: str, validator: str = None):
        self.index = index
        self.timestamp = timestamp
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.validator = validator
        self.nonce = 0
        self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """Calculate block hash using SHA-256"""
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": self.transactions,
            "previous_hash": self.previous_hash,
            "validator": self.validator,
            "nonce": self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def to_dict(self) -> Dict:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": self.transactions,
            "previous_hash": self.previous_hash,
            "validator": self.validator,
            "nonce": self.nonce,
            "hash": self.hash
        }

class Transaction:
    def __init__(self, sender: str, recipient: str, amount: float, 
                 tx_type: str, metadata: Dict = None):
        self.tx_id = str(uuid.uuid4())
        self.sender = sender
        self.recipient = recipient
        self.amount = amount
        self.tx_type = tx_type  # stake, unstake, compensate, vote, transfer
        self.metadata = metadata or {}
        self.timestamp = time.time()
        self.signature = self.sign()
    
    def sign(self) -> str:
        """Sign transaction with sender's private key (simplified)"""
        tx_string = json.dumps({
            "sender": self.sender,
            "recipient": self.recipient,
            "amount": self.amount,
            "tx_type": self.tx_type,
            "timestamp": self.timestamp
        }, sort_keys=True)
        return hashlib.sha256(tx_string.encode()).hexdigest()
    
    def to_dict(self) -> Dict:
        return {
            "tx_id": self.tx_id,
            "sender": self.sender,
            "recipient": self.recipient,
            "amount": self.amount,
            "tx_type": self.tx_type,
            "metadata": self.metadata,
            "timestamp": self.timestamp,
            "signature": self.signature
        }

class Blockchain:
    def __init__(self):
        self.chain: List[Block] = []
        self.pending_transactions: List[Transaction] = []
        self.validators: Dict[str, float] = {}  # address -> staked amount
        self.accounts: Dict[str, float] = {}  # address -> balance
        self.staking_pools: Dict[int, Dict] = {}  # route_id -> pool info
        self.compensations: List[Dict] = []
        self.proposals: List[Dict] = []
        self.carbon_credits: Dict[str, int] = {}  # address -> credits
        
        # Create genesis block
        self.create_genesis_block()
    
    def create_genesis_block(self):
        """Create the first block in the chain"""
        genesis_block = Block(0, time.time(), [], "0", "genesis")
        self.chain.append(genesis_block)
    
    def get_latest_block(self) -> Block:
        """Get the most recent block"""
        return self.chain[-1]
    
    def add_transaction(self, transaction: Transaction) -> bool:
        """Add transaction to pending pool"""
        if not self.validate_transaction(transaction):
            return False
        
        self.pending_transactions.append(transaction)
        return True
    
    def validate_transaction(self, transaction: Transaction) -> bool:
        """Validate transaction before adding"""
        if transaction.sender == "SYSTEM":
            return True
        
        if transaction.sender not in self.accounts:
            return False
        
        if self.accounts[transaction.sender] < transaction.amount:
            return False
        
        return True
    
    def select_validator(self) -> str:
        """Select validator based on stake (Proof of Stake)"""
        if not self.validators:
            return "genesis"
        
        total_stake = sum(self.validators.values())
        random_point = hash(str(time.time())) % int(total_stake)
        
        cumulative = 0
        for validator, stake in self.validators.items():
            cumulative += stake
            if cumulative > random_point:
                return validator
        
        return list(self.validators.keys())[0]
    
    def mine_pending_transactions(self) -> Block:
        """Mine pending transactions into a new block"""
        if not self.pending_transactions:
            return None
        
        validator = self.select_validator()
        new_block = Block(
            len(self.chain),
            time.time(),
            [tx.to_dict() for tx in self.pending_transactions],
            self.get_latest_block().hash,
            validator
        )
        
        # Process transactions
        for tx in self.pending_transactions:
            self.process_transaction(tx)
        
        # Reward validator
        if validator != "genesis":
            self.accounts[validator] = self.accounts.get(validator, 0) + 10
        
        self.chain.append(new_block)
        self.pending_transactions = []
        
        return new_block
    
    def process_transaction(self, tx: Transaction):
        """Process transaction and update state"""
        if tx.tx_type == "transfer":
            self.accounts[tx.sender] -= tx.amount
            self.accounts[tx.recipient] = self.accounts.get(tx.recipient, 0) + tx.amount
        
        elif tx.tx_type == "stake":
            self.accounts[tx.sender] -= tx.amount
            route_id = tx.metadata.get("route_id")
            if route_id not in self.staking_pools:
                self.staking_pools[route_id] = {
                    "total_staked": 0,
                    "participants": []
                }
            self.staking_pools[route_id]["total_staked"] += tx.amount
            self.staking_pools[route_id]["participants"].append(tx.sender)
            self.validators[tx.sender] = self.validators.get(tx.sender, 0) + tx.amount
        
        elif tx.tx_type == "compensate":
            self.accounts[tx.recipient] = self.accounts.get(tx.recipient, 0) + tx.amount
            self.compensations.append({
                "flight_number": tx.metadata.get("flight_number"),
                "recipient": tx.recipient,
                "amount": tx.amount,
                "type": tx.metadata.get("comp_type"),
                "timestamp": tx.timestamp
            })
    
    def get_balance(self, address: str) -> float:
        """Get account balance"""
        return self.accounts.get(address, 0)
    
    def get_staking_info(self, address: str) -> Dict:
        """Get staking information for an address"""
        total_staked = sum(
            pool["total_staked"] for pool in self.staking_pools.values()
            if address in pool["participants"]
        )
        return {
            "total_staked": total_staked,
            "pools": len([p for p in self.staking_pools.values() if address in p["participants"]])
        }
    
    def validate_chain(self) -> bool:
        """Validate entire blockchain"""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]
            
            if current.hash != current.calculate_hash():
                return False
            
            if current.previous_hash != previous.hash:
                return False
        
        return True
    
    def get_chain_data(self) -> List[Dict]:
        """Get blockchain as list of dictionaries"""
        return [block.to_dict() for block in self.chain]