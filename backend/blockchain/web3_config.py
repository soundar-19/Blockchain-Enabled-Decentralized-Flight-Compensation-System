#!/usr/bin/env python3
"""
Web3 Configuration for Ethereum Sepolia Testnet
Real blockchain integration - no dummy data
"""

from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()

class BlockchainConfig:
    """Ethereum testnet configuration"""
    
    # Sepolia Testnet Configuration
    NETWORK = 'sepolia'
    RPC_URL = os.getenv('RPC_URL', 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY')
    CHAIN_ID = 11155111  # Sepolia chain ID
    
    # Contract addresses (must be deployed on Sepolia)
    FLY_TOKEN_ADDRESS = os.getenv('FLY_TOKEN_ADDRESS')
    COMPENSATION_CONTRACT_ADDRESS = os.getenv('COMPENSATION_CONTRACT_ADDRESS')
    
    # Deployer account for contract interactions
    DEPLOYER_ACCOUNT = os.getenv('DEPLOYER_ACCOUNT')
    DEPLOYER_PRIVATE_KEY = os.getenv('DEPLOYER_PRIVATE_KEY')
    
    @staticmethod
    def get_web3_instance():
        """Get Web3 instance connected to Sepolia testnet"""
        if not BlockchainConfig.RPC_URL:
            raise ValueError("RPC_URL not configured. Set RPC_URL environment variable.")
        
        try:
            w3 = Web3(Web3.HTTPProvider(BlockchainConfig.RPC_URL))
            
            if not w3.is_connected():
                raise ConnectionError(f"Failed to connect to Sepolia testnet at {BlockchainConfig.RPC_URL}")
            
            # Verify we're on Sepolia
            chain_id = w3.eth.chain_id
            if chain_id != BlockchainConfig.CHAIN_ID:
                print(f"Warning: Expected chain ID {BlockchainConfig.CHAIN_ID}, got {chain_id}")
            
            return w3
        except Exception as e:
            raise Exception(f"Web3 connection error: {str(e)}")
    
    @staticmethod
    def validate_contract_addresses():
        """Validate that contract addresses are configured"""
        if not BlockchainConfig.FLY_TOKEN_ADDRESS:
            raise ValueError("FLY_TOKEN_ADDRESS not configured")
        if not BlockchainConfig.COMPENSATION_CONTRACT_ADDRESS:
            raise ValueError("COMPENSATION_CONTRACT_ADDRESS not configured")
        
        if not Web3.is_address(BlockchainConfig.FLY_TOKEN_ADDRESS):
            raise ValueError("Invalid FLY_TOKEN_ADDRESS format")
        if not Web3.is_address(BlockchainConfig.COMPENSATION_CONTRACT_ADDRESS):
            raise ValueError("Invalid COMPENSATION_CONTRACT_ADDRESS format")
    
    @staticmethod
    def validate_address(address):
        """Validate Ethereum address format"""
        return Web3.is_address(address)
    
    @staticmethod
    def to_checksum_address(address):
        """Convert address to checksum format"""
        try:
            return Web3.to_checksum_address(address)
        except:
            return None
    
    @staticmethod
    def to_wei(amount, unit='ether'):
        """Convert amount to Wei"""
        return Web3.to_wei(amount, unit)
    
    @staticmethod
    def from_wei(amount, unit='ether'):
        """Convert amount from Wei"""
        return Web3.from_wei(amount, unit)
