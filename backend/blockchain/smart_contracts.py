# backend/blockchain/smart_contracts.py
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class SmartContract:
    """Base smart contract class"""
    def __init__(self, contract_id: str, creator: str):
        self.contract_id = contract_id
        self.creator = creator
        self.created_at = datetime.now()
        self.state = {}
    
    def execute(self, *args, **kwargs):
        raise NotImplementedError

class StakingContract(SmartContract):
    """Smart contract for staking operations"""
    def __init__(self, contract_id: str, creator: str, route_id: int, 
                 min_stake: float, reward_rate: float):
        super().__init__(contract_id, creator)
        self.route_id = route_id
        self.min_stake = min_stake
        self.reward_rate = reward_rate
        self.state = {
            "total_staked": 0,
            "participants": {},
            "rewards_pool": 0
        }
    
    def stake(self, address: str, amount: float) -> Dict:
        """Stake tokens in the pool"""
        if amount < self.min_stake:
            return {"success": False, "error": "Below minimum stake"}
        
        if address not in self.state["participants"]:
            self.state["participants"][address] = {
                "staked": 0,
                "join_time": datetime.now(),
                "rewards_claimed": 0
            }
        
        self.state["participants"][address]["staked"] += amount
        self.state["total_staked"] += amount
        
        return {
            "success": True,
            "total_staked": self.state["participants"][address]["staked"]
        }
    
    def calculate_rewards(self, address: str) -> float:
        """Calculate pending rewards for an address"""
        if address not in self.state["participants"]:
            return 0
        
        participant = self.state["participants"][address]
        time_staked = (datetime.now() - participant["join_time"]).days
        
        rewards = (participant["staked"] * self.reward_rate * time_staked) / 365
        return rewards - participant["rewards_claimed"]
    
    def unstake(self, address: str, amount: float) -> Dict:
        """Unstake tokens from the pool"""
        if address not in self.state["participants"]:
            return {"success": False, "error": "Not a participant"}
        
        if self.state["participants"][address]["staked"] < amount:
            return {"success": False, "error": "Insufficient staked amount"}
        
        rewards = self.calculate_rewards(address)
        self.state["participants"][address]["staked"] -= amount
        self.state["total_staked"] -= amount
        
        return {
            "success": True,
            "unstaked": amount,
            "rewards": rewards
        }

class CompensationContract(SmartContract):
    """Smart contract for automatic compensation"""
    def __init__(self, contract_id: str, creator: str, route_id: int,
                 compensation_rates: Dict):
        super().__init__(contract_id, creator)
        self.route_id = route_id
        self.compensation_rates = compensation_rates
        self.state = {
            "total_compensated": 0,
            "claims_processed": 0
        }
    
    def validate_delay(self, delay_minutes: int, oracle_data: Dict) -> bool:
        """Validate delay using oracle data"""
        # In production, this would verify against multiple oracles
        return oracle_data.get("delay_minutes") >= delay_minutes
    
    def process_claim(self, claimant: str, flight_number: str, 
                     delay_minutes: int, comp_type: str, 
                     oracle_data: Dict) -> Dict:
        """Process compensation claim"""
        if not self.validate_delay(delay_minutes, oracle_data):
            return {"success": False, "error": "Delay not verified"}
        
        if comp_type not in self.compensation_rates:
            return {"success": False, "error": "Invalid compensation type"}
        
        compensation_amount = self.compensation_rates[comp_type]
        
        self.state["total_compensated"] += compensation_amount
        self.state["claims_processed"] += 1
        
        return {
            "success": True,
            "amount": compensation_amount,
            "type": comp_type,
            "claim_id": f"CLM-{self.state['claims_processed']}"
        }

class GovernanceContract(SmartContract):
    """Smart contract for DAO governance"""
    def __init__(self, contract_id: str, creator: str, voting_period_days: int):
        super().__init__(contract_id, creator)
        self.voting_period_days = voting_period_days
        self.state = {
            "proposals": {},
            "proposal_count": 0
        }
    
    def create_proposal(self, proposer: str, title: str, description: str,
                       proposal_type: str, data: Dict) -> Dict:
        """Create a new governance proposal"""
        proposal_id = self.state["proposal_count"] + 1
        end_time = datetime.now() + timedelta(days=self.voting_period_days)
        
        self.state["proposals"][proposal_id] = {
            "id": proposal_id,
            "proposer": proposer,
            "title": title,
            "description": description,
            "type": proposal_type,
            "data": data,
            "votes_for": 0,
            "votes_against": 0,
            "voters": set(),
            "end_time": end_time,
            "executed": False
        }
        
        self.state["proposal_count"] += 1
        
        return {"success": True, "proposal_id": proposal_id}
    
    def vote(self, proposal_id: int, voter: str, vote_for: bool, 
            voting_power: float) -> Dict:
        """Vote on a proposal"""
        if proposal_id not in self.state["proposals"]:
            return {"success": False, "error": "Proposal not found"}
        
        proposal = self.state["proposals"][proposal_id]
        
        if datetime.now() > proposal["end_time"]:
            return {"success": False, "error": "Voting period ended"}
        
        if voter in proposal["voters"]:
            return {"success": False, "error": "Already voted"}
        
        if vote_for:
            proposal["votes_for"] += voting_power
        else:
            proposal["votes_against"] += voting_power
        
        proposal["voters"].add(voter)
        
        return {"success": True, "votes_for": proposal["votes_for"],
                "votes_against": proposal["votes_against"]}
    
    def execute_proposal(self, proposal_id: int) -> Dict:
        """Execute a passed proposal"""
        if proposal_id not in self.state["proposals"]:
            return {"success": False, "error": "Proposal not found"}
        
        proposal = self.state["proposals"][proposal_id]
        
        if datetime.now() < proposal["end_time"]:
            return {"success": False, "error": "Voting still in progress"}
        
        if proposal["executed"]:
            return {"success": False, "error": "Already executed"}
        
        if proposal["votes_for"] <= proposal["votes_against"]:
            return {"success": False, "error": "Proposal rejected"}
        
        proposal["executed"] = True
        
        return {
            "success": True,
            "proposal_type": proposal["type"],
            "data": proposal["data"]
        }

class LoyaltyExchangeContract(SmartContract):
    """Smart contract for cross-airline loyalty point exchange"""
    def __init__(self, contract_id: str, creator: str, exchange_rate: float, fee: float):
        super().__init__(contract_id, creator)
        self.exchange_rate = exchange_rate
        self.fee = fee
        self.state = {
            "total_swapped": 0,
            "fees_collected": 0
        }
    
    def swap_points(self, user: str, from_airline: str, to_airline: str,
                   amount: int, user_balances: Dict) -> Dict:
        """Swap loyalty points between airlines"""
        if user_balances.get(from_airline, 0) < amount:
            return {"success": False, "error": "Insufficient points"}
        
        fee_amount = amount * self.fee
        net_amount = amount - fee_amount
        converted_amount = int(net_amount * self.exchange_rate)
        
        self.state["total_swapped"] += amount
        self.state["fees_collected"] += fee_amount
        
        return {
            "success": True,
            "from_airline": from_airline,
            "to_airline": to_airline,
            "original_amount": amount,
            "fee": fee_amount,
            "converted_amount": converted_amount
        }