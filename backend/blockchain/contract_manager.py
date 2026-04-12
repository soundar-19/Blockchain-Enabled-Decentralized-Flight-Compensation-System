#!/usr/bin/env python3
"""
Smart Contract Manager
Real blockchain interactions with compiled Hardhat contracts
"""

import json
import os
from web3 import Web3
from web3.contract import Contract
from .web3_config import BlockchainConfig

class ContractManager:
    """Manage real smart contract interactions"""
    
    def __init__(self):
        self.w3 = BlockchainConfig.get_web3_instance()
        self.contracts = {}
        self.contract_abis = {}
        self._load_contract_abis()
    
    def _load_contract_abis(self):
        """Load real contract ABIs from compiled Hardhat artifacts"""
        # Try to load from hardhat artifacts
        hardhat_artifacts = os.path.join(
            os.path.dirname(__file__), 
            '..', '..', 'hardhat', 'artifacts', 'contracts'
        )
        
        print(f"Looking for contract ABIs in: {hardhat_artifacts}")
        
        # Map of contract names to artifact paths
        contracts_map = {
            'FlightToken': os.path.join(hardhat_artifacts, 'FlightToken.sol/FlightToken.json'),
            'CompensationContract': os.path.join(hardhat_artifacts, 'CompensationContract.sol/CompensationContract.json'),
        }
        
        for contract_name, artifact_path in contracts_map.items():
            if os.path.exists(artifact_path):
                try:
                    with open(artifact_path, 'r') as f:
                        artifact = json.load(f)
                        self.contract_abis[contract_name] = artifact['abi']
                        print(f"✓ Loaded ABI for {contract_name}")
                except Exception as e:
                    print(f"⚠ Warning: Could not load ABI for {contract_name}: {e}")
            else:
                print(f"⚠ Artifact not found: {artifact_path}")
    
    def load_contract(self, contract_name, contract_address):
        """Load a contract instance from Sepolia"""
        try:
            if contract_name not in self.contract_abis:
                raise ValueError(f"ABI not found for contract: {contract_name}. Run 'npx hardhat compile' first.")
            
            address = BlockchainConfig.to_checksum_address(contract_address)
            if not address:
                raise ValueError(f"Invalid contract address: {contract_address}")
            
            contract = self.w3.eth.contract(
                address=address,
                abi=self.contract_abis[contract_name]
            )
            
            self.contracts[contract_name] = contract
            print(f"✓ Loaded contract {contract_name} at {address}")
            return contract
        except Exception as e:
            raise Exception(f"Failed to load contract {contract_name}: {str(e)}")
    
    def get_contract(self, contract_name):
        """Get loaded contract instance"""
        if contract_name not in self.contracts:
            raise ValueError(f"Contract {contract_name} not loaded")
        return self.contracts[contract_name]
    
    def call_contract_function(self, contract_name, function_name, *args):
        """Call a read-only contract function"""
        try:
            contract = self.get_contract(contract_name)
            function = getattr(contract.functions, function_name)
            result = function(*args).call()
            return result
        except Exception as e:
            raise Exception(f"Contract call failed: {str(e)}")
    
    def estimate_gas(self, contract_name, function_name, from_address, *args):
        """Estimate gas for a transaction"""
        try:
            contract = self.get_contract(contract_name)
            function = getattr(contract.functions, function_name)
            from_addr = BlockchainConfig.to_checksum_address(from_address)
            
            gas_estimate = function(*args).estimate_gas({'from': from_addr})
            return gas_estimate
        except Exception as e:
            raise Exception(f"Gas estimation failed: {str(e)}")
    
    def build_transaction(self, contract_name, function_name, from_address, *args, **kwargs):
        """Build transaction dict for signing"""
        try:
            contract = self.get_contract(contract_name)
            function = getattr(contract.functions, function_name)
            from_addr = BlockchainConfig.to_checksum_address(from_address)
            
            nonce = self.w3.eth.get_transaction_count(from_addr)
            gas_price = self.w3.eth.gas_price
            
            tx_dict = function(*args).build_transaction({
                'from': from_addr,
                'nonce': nonce,
                'gasPrice': gas_price,
                'gas': kwargs.get('gas', 300000),
                'chainId': BlockchainConfig.CHAIN_ID
            })
            
            return tx_dict
        except Exception as e:
            raise Exception(f"Transaction building failed: {str(e)}")
    
    def send_transaction(self, signed_tx):
        """Send signed transaction to blockchain"""
        try:
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx)
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            raise Exception(f"Transaction sending failed: {str(e)}")
    
    def get_transaction_receipt(self, tx_hash):
        """Get transaction receipt"""
        try:
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            return receipt
        except Exception as e:
            raise Exception(f"Failed to get transaction receipt: {str(e)}")
    
    def wait_for_transaction(self, tx_hash, timeout=120):
        """Wait for transaction to be mined"""
        try:
            receipt = self.w3.eth.wait_for_transaction_receipt(
                tx_hash, 
                timeout=timeout
            )
            return receipt
        except Exception as e:
            raise Exception(f"Transaction confirmation failed: {str(e)}")
    
    def get_contract_balance(self, contract_address):
        """Get ETH balance of contract"""
        try:
            address = BlockchainConfig.to_checksum_address(contract_address)
            balance = self.w3.eth.get_balance(address)
            return BlockchainConfig.from_wei(balance, 'ether')
        except Exception as e:
            raise Exception(f"Failed to get balance: {str(e)}")
    
    def get_wallet_balance(self, wallet_address):
        """Get ETH balance of wallet"""
        try:
            address = BlockchainConfig.to_checksum_address(wallet_address)
            balance = self.w3.eth.get_balance(address)
            return BlockchainConfig.from_wei(balance, 'ether')
        except Exception as e:
            raise Exception(f"Failed to get wallet balance: {str(e)}")
    
    def _get_erc20_abi(self):
        """Return standard ERC20 ABI"""
        return []
    
    def _get_compensation_abi(self):
        """Return Compensation Contract ABI"""
        return []
