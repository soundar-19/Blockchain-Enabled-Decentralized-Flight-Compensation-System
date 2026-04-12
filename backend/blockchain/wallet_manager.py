#!/usr/bin/env python3
"""
Wallet Manager
Handles wallet creation, import, and management
"""

from eth_account import Account
from eth_keys import keys
from .web3_config import BlockchainConfig
import os

class WalletManager:
    """Manage Ethereum wallets"""
    
    @staticmethod
    def create_wallet():
        """
        Create a new Ethereum wallet
        
        Returns:
            Dictionary with wallet details
        """
        try:
            account = Account.create()
            
            return {
                'status': 'success',
                'address': account.address,
                'privateKey': account.key.hex(),
                'publicKey': account.address,
                'message': 'Wallet created successfully'
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to create wallet: {str(e)}'
            }
    
    @staticmethod
    def import_wallet(private_key):
        """
        Import wallet from private key
        
        Args:
            private_key: Private key (with or without 0x prefix)
        
        Returns:
            Dictionary with wallet details
        """
        try:
            # Ensure proper format
            if not private_key.startswith('0x'):
                private_key = '0x' + private_key
            
            account = Account.from_key(private_key)
            
            return {
                'status': 'success',
                'address': account.address,
                'privateKey': account.key.hex(),
                'message': 'Wallet imported successfully'
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to import wallet: {str(e)}'
            }
    
    @staticmethod
    def validate_address(address):
        """
        Validate Ethereum address
        
        Args:
            address: Address to validate
        
        Returns:
            Boolean
        """
        return BlockchainConfig.validate_address(address)
    
    @staticmethod
    def validate_private_key(private_key):
        """
        Validate private key format
        
        Args:
            private_key: Private key to validate
        
        Returns:
            Boolean
        """
        try:
            if not private_key.startswith('0x'):
                private_key = '0x' + private_key
            
            Account.from_key(private_key)
            return True
        except:
            return False
    
    @staticmethod
    def sign_message(message, private_key):
        """
        Sign a message with private key
        
        Args:
            message: Message to sign
            private_key: Private key to sign with
        
        Returns:
            Signature dictionary
        """
        try:
            if not private_key.startswith('0x'):
                private_key = '0x' + private_key
            
            account = Account.from_key(private_key)
            
            # Convert message to bytes if needed
            if isinstance(message, str):
                message_bytes = message.encode('utf-8')
            else:
                message_bytes = message
            
            signed_message = account.sign_message(message_bytes)
            
            return {
                'status': 'success',
                'signature': signed_message.signature.hex(),
                'messageHash': signed_message.messageHash.hex(),
                'address': account.address
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to sign message: {str(e)}'
            }
    
    @staticmethod
    def recover_address_from_signature(message, signature):
        """
        Recover wallet address from message and signature
        
        Args:
            message: Original message
            signature: Signature
        
        Returns:
            Recovered address
        """
        try:
            if isinstance(message, str):
                message_bytes = message.encode('utf-8')
            else:
                message_bytes = message
            
            recovered_address = Account.recover_message(message_bytes, signature=signature)
            
            return {
                'status': 'success',
                'address': recovered_address
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to recover address: {str(e)}'
            }
    
    @staticmethod
    def get_address_from_private_key(private_key):
        """
        Get address from private key
        
        Args:
            private_key: Private key
        
        Returns:
            Address
        """
        try:
            if not private_key.startswith('0x'):
                private_key = '0x' + private_key
            
            account = Account.from_key(private_key)
            return account.address
        except:
            return None
    
    @staticmethod
    def create_account_signature(address, message, nonce):
        """
        Create a signature for account verification
        
        Args:
            address: User address
            message: Message to sign
            nonce: Nonce for uniqueness
        
        Returns:
            Signature request details
        """
        verification_message = f"Sign this message to verify your wallet: {address}\nNonce: {nonce}\nMessage: {message}"
        
        return {
            'address': address,
            'message': verification_message,
            'nonce': nonce
        }
