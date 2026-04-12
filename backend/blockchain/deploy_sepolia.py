#!/usr/bin/env python3
"""
Blockchain Deployment Script
Deploy real FLY Token and Compensation contracts to Sepolia testnet
"""

from web3 import Web3
from eth_account import Account
import json
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Sepolia configuration
RPC_URL = os.getenv('RPC_URL', 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY')
DEPLOYER_PRIVATE_KEY = os.getenv('DEPLOYER_PRIVATE_KEY')
DEPLOYER_ACCOUNT = os.getenv('DEPLOYER_ACCOUNT')
ETHERSCAN_API_KEY = os.getenv('ETHERSCAN_API_KEY', '')

# Path to hardhat artifacts
ARTIFACTS_PATH = Path(__file__).parent.parent.parent / 'hardhat' / 'artifacts' / 'contracts'

class Deployer:
    """Contract deployer for Sepolia testnet"""
    
    def __init__(self):
        if not RPC_URL or 'YOUR_INFURA_KEY' in RPC_URL:
            raise Exception("RPC_URL not configured. Set RPC_URL environment variable with Infura/Alchemy key.")
        
        if not DEPLOYER_PRIVATE_KEY:
            raise Exception("DEPLOYER_PRIVATE_KEY not configured")
        
        self.w3 = Web3(Web3.HTTPProvider(RPC_URL))
        self.account = Account.from_key(DEPLOYER_PRIVATE_KEY)
        
        if not self.w3.is_connected():
            raise Exception("Failed to connect to Sepolia testnet")
        
        print(f"✓ Connected to Sepolia (Chain ID: {self.w3.eth.chain_id})")
        print(f"✓ Deployer: {self.account.address}")
        
        # Check ETH balance
        balance = self.w3.eth.get_balance(self.account.address)
        balance_eth = Web3.from_wei(balance, 'ether')
        print(f"✓ Balance: {balance_eth} ETH")
        
        if balance_eth < 0.01:
            print("⚠ Warning: Low ETH balance. You may need testnet ETH from a faucet.")
    
    def deploy_fly_token(self, initial_supply=1000000):
        """Deploy FLY Token contract"""
        print("\n=== Deploying FLY Token ===")
        
        # FlightToken contract bytecode and ABI
        bytecode = "608060405234801561001057600080fd5b506040516109d83803806109d883398101604090815290516000805433600160a060020a031991821681179055919291600480805461005092919061013a565b600480546001828101805461007088949293919061013a565b600480546001818101805461008a88949293919061013a565b60048054600181810180546100a488949293919061013a565b60048054600181810180549096979695940192939461013a565b6040516001818801816001600160a060020a0388169055601e9060949067ffffffffffffffff821181850310156100e857600080fd5b6040519250819350602060405180830381858888f15050505050505050509150505091905056fea165627a7a7230582007dd8a1ba3b31626b1a8a1d8c6c9f9e5d5c5b5a5959585756555453525150a0029"
        
        abi = [
            {
                "constant": False,
                "inputs": [{"name": "initialSupply", "type": "uint256"}],
                "name": "initialize",
                "outputs": [],
                "type": "function"
            }
        ]
        
        # Use predefined bytecode for FlightToken
        contract_bytecode = self._get_fly_token_bytecode()
        contract_abi = self._get_erc20_abi()
        
        try:
            contract = self.w3.eth.contract(abi=contract_abi, bytecode=contract_bytecode)
            
            # Prepare transaction
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            gas_price = self.w3.eth.gas_price
            
            constructor_tx = contract.constructor(int(initial_supply * 10**18)).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 3000000,
                'gasPrice': gas_price,
                'chainId': 11155111
            })
            
            # Sign and send
            signed_tx = self.account.sign_transaction(constructor_tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx['rawTransaction'])
            
            print(f"✓ Transaction sent: {tx_hash.hex()}")
            print("⏳ Waiting for confirmation...")
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt['status'] == 1:
                contract_address = receipt['contractAddress']
                print(f"✓ FLY Token deployed: {contract_address}")
                return contract_address
            else:
                print("✗ Deployment failed")
                return None
                
        except Exception as e:
            print(f"✗ Error deploying FLY Token: {str(e)}")
            return None
    
    def deploy_compensation_contract(self, fly_token_address):
        """Deploy Compensation contract"""
        print(f"\n=== Deploying Compensation Contract ===")
        
        if not Web3.is_address(fly_token_address):
            print("✗ Invalid FLY token address")
            return None
        
        contract_abi = self._get_compensation_abi()
        contract_bytecode = self._get_compensation_bytecode()
        
        try:
            contract = self.w3.eth.contract(abi=contract_abi, bytecode=contract_bytecode)
            
            # Prepare transaction
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            gas_price = self.w3.eth.gas_price
            
            constructor_tx = contract.constructor(
                Web3.to_checksum_address(fly_token_address)
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 3000000,
                'gasPrice': gas_price,
                'chainId': 11155111
            })
            
            # Sign and send
            signed_tx = self.account.sign_transaction(constructor_tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx['rawTransaction'])
            
            print(f"✓ Transaction sent: {tx_hash.hex()}")
            print("⏳ Waiting for confirmation...")
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt['status'] == 1:
                contract_address = receipt['contractAddress']
                print(f"✓ Compensation Contract deployed: {contract_address}")
                return contract_address
            else:
                print("✗ Deployment failed")
                return None
                
        except Exception as e:
            print(f"✗ Error deploying Compensation Contract: {str(e)}")
            return None
    
    def _load_contract_artifact(self, contract_name):
        """Load contract ABI and bytecode from hardhat artifacts"""
        artifact_path = ARTIFACTS_PATH / f"{contract_name}.sol" / f"{contract_name}.json"
        
        if not artifact_path.exists():
            raise FileNotFoundError(f"Artifact not found: {artifact_path}")
        
        with open(artifact_path, 'r') as f:
            artifact = json.load(f)
        
        bytecode = artifact.get('bytecode', '')
        abi = artifact.get('abi', [])
        
        if not bytecode or bytecode == '0x':
            raise ValueError(f"No bytecode found for {contract_name}")
        
        return bytecode, abi
    
    def _get_fly_token_bytecode(self):
        """Return FLY Token bytecode from hardhat artifacts"""
        bytecode, _ = self._load_contract_artifact('FlightToken')
        return bytecode
    
    def _get_compensation_bytecode(self):
        """Return Compensation contract bytecode from hardhat artifacts"""
        bytecode, _ = self._load_contract_artifact('CompensationContract')
        return bytecode
    
    def _get_erc20_abi(self):
        """Return FLY Token ABI from hardhat artifacts"""
        _, abi = self._load_contract_artifact('FlightToken')
        return abi
    
    def _get_compensation_abi(self):
        """Return Compensation contract ABI from hardhat artifacts"""
        _, abi = self._load_contract_artifact('CompensationContract')
        return abi

def main():
    """Main deployment flow"""
    print("╔══════════════════════════════════════════════════════╗")
    print("║  SkyGuard DAO - Contract Deployment to Sepolia      ║")
    print("╚══════════════════════════════════════════════════════╝")
    
    try:
        deployer = Deployer()
        
        # Deploy FLY Token
        fly_token_address = deployer.deploy_fly_token(initial_supply=1000000)
        if not fly_token_address:
            sys.exit(1)
        
        # Deploy Compensation Contract
        compensation_address = deployer.deploy_compensation_contract(fly_token_address)
        if not compensation_address:
            sys.exit(1)
        
        # Print results
        print("\n╔══════════════════════════════════════════════════════╗")
        print("║  ✓ DEPLOYMENT SUCCESSFUL                           ║")
        print("╚══════════════════════════════════════════════════════╝")
        print(f"\nFLY Token Address: {fly_token_address}")
        print(f"Compensation Contract Address: {compensation_address}")
        print(f"\nUpdate your .env file with:")
        print(f"FLY_TOKEN_ADDRESS={fly_token_address}")
        print(f"COMPENSATION_CONTRACT_ADDRESS={compensation_address}")
        
    except Exception as e:
        print(f"\n✗ Deployment failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
