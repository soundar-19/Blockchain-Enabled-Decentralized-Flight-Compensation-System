#!/usr/bin/env python3
"""
Blockchain Service
Real blockchain integration with Sepolia testnet
No dummy data - all data from actual smart contracts
"""

from .contract_manager import ContractManager
from .web3_config import BlockchainConfig
from eth_account import Account
import os

class BlockchainService:
    """Service for blockchain operations on Sepolia"""
    
    def __init__(self):
        # Validate contract addresses are configured
        BlockchainConfig.validate_contract_addresses()
        
        self.contract_manager = ContractManager()
        self.compensation_contract_address = BlockchainConfig.COMPENSATION_CONTRACT_ADDRESS
        self.fly_token_address = BlockchainConfig.FLY_TOKEN_ADDRESS
        
        # Load real contracts from Sepolia
        self._load_contracts()
    
    def _load_contracts(self):
        """Load deployed contracts from Sepolia"""
        try:
            print(f"Loading FLY Token from: {self.fly_token_address}")
            self.contract_manager.load_contract('FlightToken', self.fly_token_address)
            
            print(f"Loading Compensation Contract from: {self.compensation_contract_address}")
            self.contract_manager.load_contract('CompensationContract', self.compensation_contract_address)
            
            print("✓ All contracts loaded successfully")
        except Exception as e:
            raise Exception(f"Failed to load contracts from Sepolia: {e}")
    
    def file_compensation_claim(self, user_address, flight_number, delay_minutes, claim_type, route_id=0):
        """
        File a real compensation claim on Sepolia blockchain
        
        Args:
            user_address: User's wallet address
            flight_number: Flight number string
            delay_minutes: Delay in minutes
            claim_type: Type of compensation (0=food, 1=hotel, 2=transport, 3=refund)
            route_id: Route ID for the claim
        
        Returns:
            Transaction dict ready for signing
        """
        try:
            # Validate inputs
            if not BlockchainConfig.validate_address(user_address):
                raise ValueError("Invalid user address")
            
            if not flight_number or len(flight_number) == 0:
                raise ValueError("Flight number is required")
            
            if int(delay_minutes) < 0:
                raise ValueError("Delay minutes must be positive")
            
            if int(claim_type) not in [0, 1, 2, 3]:
                raise ValueError("Invalid claim type (must be 0-3)")
            
            # Build transaction to file claim on blockchain
            tx = self.contract_manager.build_transaction(
                'CompensationContract',
                'fileClaim',
                user_address,
                flight_number,
                int(delay_minutes),
                int(claim_type),
                int(route_id)
            )
            
            return {
                'status': 'success',
                'transaction': tx,
                'estimatedGas': tx.get('gas'),
                'network': 'Sepolia',
                'message': f'Transaction prepared - Flight: {flight_number}, Delay: {delay_minutes}min'
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to prepare claim transaction: {str(e)}'
            }
    
    def get_user_claims(self, user_address):
        """
        Get all claims for a user from blockchain
        
        Args:
            user_address: User's wallet address
        
        Returns:
            List of claim IDs from smart contract
        """
        try:
            contract = self.contract_manager.get_contract('CompensationContract')
            user_addr = BlockchainConfig.to_checksum_address(user_address)
            
            # Query actual claims from blockchain
            claim_ids = contract.functions.userClaims(user_addr).call()
            return list(claim_ids)
        except Exception as e:
            raise Exception(f"Error fetching user claims from blockchain: {str(e)}")
    
    def get_claim_details(self, claim_id):
        """
        Get details of a specific claim from blockchain
        
        Args:
            claim_id: Claim ID (bytes32)
        
        Returns:
            Claim details from smart contract
        """
        try:
            contract = self.contract_manager.get_contract('CompensationContract')
            claim_data = contract.functions.claims(claim_id).call()
            
            # Map status enum to string
            status_map = {0: 'PENDING', 1: 'APPROVED', 2: 'REJECTED', 3: 'PAID'}
            
            return {
                'claimant': claim_data[0],
                'flightNumber': claim_data[1],
                'delayMinutes': claim_data[2],
                'compensationAmount': float(BlockchainConfig.from_wei(claim_data[3], 'ether')),
                'status': status_map.get(claim_data[4], 'UNKNOWN'),
                'timestamp': claim_data[5],
                'paidAt': claim_data[6],
                'requestId': claim_data[7].hex() if claim_data[7] else None
            }
        except Exception as e:
            raise Exception(f"Error fetching claim details from blockchain: {str(e)}")
    
    def get_token_balance(self, wallet_address):
        """
        Get FLY token balance from Sepolia blockchain
        
        Args:
            wallet_address: Wallet address
        
        Returns:
            Token balance in FLY
        """
        try:
            contract = self.contract_manager.get_contract('FlightToken')
            balance_wei = contract.functions.balanceOf(
                BlockchainConfig.to_checksum_address(wallet_address)
            ).call()
            
            balance_fly = float(BlockchainConfig.from_wei(balance_wei, 'ether'))
            return balance_fly
        except Exception as e:
            raise Exception(f"Error fetching token balance from blockchain: {str(e)}")
    
    def get_eth_balance(self, wallet_address):
        """
        Get ETH balance from Sepolia
        
        Args:
            wallet_address: Wallet address
        
        Returns:
            ETH balance as float
        """
        try:
            return float(self.contract_manager.get_wallet_balance(wallet_address))
        except Exception as e:
            raise Exception(f"Error fetching ETH balance from blockchain: {str(e)}")
    
    def get_total_compensation_paid(self):
        """Get total compensation paid from Sepolia contract"""
        try:
            contract = self.contract_manager.get_contract('CompensationContract')
            total_paid = contract.functions.totalPaid().call()
            
            return float(BlockchainConfig.from_wei(total_paid, 'ether'))
        except Exception as e:
            raise Exception(f"Error fetching total paid from blockchain: {str(e)}")
    
    def get_total_claims_count(self):
        """Get total number of claims from Sepolia contract"""
        try:
            contract = self.contract_manager.get_contract('CompensationContract')
            total_claims = contract.functions.totalClaims().call()
            
            return int(total_claims)
        except Exception as e:
            raise Exception(f"Error fetching total claims from blockchain: {str(e)}")
    
    def sign_and_send_transaction(self, tx_dict, private_key):
        """
        Sign and send a transaction
        
        Args:
            tx_dict: Transaction dictionary
            private_key: Private key to sign with
        
        Returns:
            Transaction hash
        """
        try:
            # Sign transaction
            account = Account.from_key(private_key)
            signed_tx = account.sign_transaction(tx_dict)
            
            # Send transaction
            tx_hash = self.contract_manager.send_transaction(signed_tx.rawTransaction)
            
            return {
                'status': 'success',
                'txHash': tx_hash,
                'message': 'Transaction sent to blockchain'
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Transaction failed: {str(e)}'
            }
    
    def calculate_compensation(self, delay_minutes, claim_type):
        """
        Calculate compensation amount based on delay and type
        
        Delay thresholds:
        - 180+ minutes (3h): Standard compensation
        - 240+ minutes (4h): 1.5x compensation
        - 360+ minutes (6h): 2x compensation
        
        Claim types:
        - 0: Food (base multiplier: 0.5)
        - 1: Hotel (base multiplier: 1.0) 
        - 2: Transport (base multiplier: 0.75)
        - 3: Refund (base multiplier: 1.5)
        
        Args:
            delay_minutes: Minutes delayed
            claim_type: 0=food, 1=hotel, 2=transport, 3=refund
        
        Returns:
            Compensation amount in FLY tokens
        """
        try:
            delay = int(delay_minutes)
            claim_type = int(claim_type)
            
            # Base compensation multipliers by type
            type_multipliers = {
                0: 0.5,      # Food
                1: 1.0,      # Hotel
                2: 0.75,     # Transport
                3: 1.5       # Refund
            }
            
            # Get type multiplier
            type_multiplier = type_multipliers.get(claim_type, 1.0)
            
            # Delay-based compensation (in FLY tokens)
            if delay >= 360:  # 6+ hours
                base_compensation = 300 * type_multiplier
            elif delay >= 240:  # 4+ hours
                base_compensation = 200 * type_multiplier
            elif delay >= 180:  # 3+ hours
                base_compensation = 100 * type_multiplier
            else:
                base_compensation = 0
            
            # Round to nearest whole number
            compensation = int(base_compensation)
            
            return max(50, compensation)  # Minimum 50 FLY tokens
            
        except Exception as e:
            print(f"Error calculating compensation: {str(e)}")
            return 0
    
    def file_compensation_claim_with_transfer(self, user_address, flight_number, delay_minutes, 
                                             claim_type, route_id, compensation_amount):
        """
        File compensation claim AND transfer FLY tokens from main wallet to user wallet
        
        This is the complete flow:
        1. Call smart contract to file claim (logs on-chain)
        2. Transfer FLY tokens from deployer wallet to user wallet
        3. Return transaction details
        
        Args:
            user_address: User's wallet address
            flight_number: Flight number
            delay_minutes: Minutes delayed
            claim_type: Type of compensation (0-3)
            route_id: Route ID
            compensation_amount: Amount to transfer in FLY
        
        Returns:
            Dict with transaction hash and details
        """
        try:
            # Validate inputs
            if not BlockchainConfig.validate_address(user_address):
                raise ValueError("Invalid user address format")
            
            if compensation_amount <= 0:
                raise ValueError("Compensation amount must be positive")
            
            # Get contracts
            fly_token_contract = self.contract_manager.get_contract('FlightToken')
            w3 = self.contract_manager.w3
            
            # Convert to checksum address
            user_checksum = BlockchainConfig.to_checksum_address(user_address)
            deployer = BlockchainConfig.to_checksum_address(BlockchainConfig.DEPLOYER_ACCOUNT)
            
            # Amount in wei (FLY token has 18 decimals)
            amount_wei = BlockchainConfig.to_wei(compensation_amount, 'ether')
            
            # Build transfer transaction from deployer wallet to user wallet
            tx_data = fly_token_contract.functions.transfer(
                user_checksum,
                int(amount_wei)
            ).build_transaction({
                'from': deployer,
                'nonce': w3.eth.get_transaction_count(deployer),
                'gas': 100000,
                'gasPrice': w3.eth.gas_price,
                'chainId': w3.eth.chain_id
            })
            
            # Sign and send the transaction
            private_key = os.getenv('DEPLOYER_PRIVATE_KEY')
            if not private_key:
                raise ValueError("DEPLOYER_PRIVATE_KEY not configured in environment")
            
            account = Account.from_key(private_key)
            signed_tx = account.sign_transaction(tx_data)
            
            # Send transaction
            tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            tx_hash_str = tx_hash.hex()
            
            print(f"✓ Token transfer transaction sent: {tx_hash_str}")
            
            # Wait for receipt (optional, but good for confirmation)
            try:
                receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
                block_number = receipt['blockNumber']
                confirmations = w3.eth.block_number - block_number
                
                print(f"✓ Transaction confirmed in block {block_number}")
                
            except Exception as e:
                print(f"⚠ Transaction pending (may not be mined yet): {str(e)}")
                block_number = None
                confirmations = 0
            
            return {
                'status': 'success',
                'transaction_hash': tx_hash_str,
                'block_number': block_number,
                'confirmations': confirmations,
                'from_address': deployer,
                'to_address': user_checksum,
                'amount_transferred': compensation_amount,
                'amount_wei': int(amount_wei),
                'flight_number': flight_number,
                'delay_minutes': delay_minutes,
                'claim_type': claim_type,
                'message': f'Successfully transferred {compensation_amount} FLY tokens to {user_checksum}'
            }
            
        except Exception as e:
            print(f"✗ Error transferring tokens: {str(e)}")
            return {
                'status': 'error',
                'message': f'Failed to transfer compensation: {str(e)}'
            }
    
    def get_transaction_status(self, tx_hash):
        """
        Get status of a transaction on Sepolia
        
        Args:
            tx_hash: Transaction hash
        
        Returns:
            Transaction status from blockchain
        """
        try:
            receipt = self.contract_manager.get_transaction_receipt(tx_hash)
            
            if receipt:
                gas_used = receipt['gasUsed']
                gas_price = receipt.get('gasPrice', 0)
                
                return {
                    'status': 'confirmed',
                    'blockNumber': receipt['blockNumber'],
                    'gasUsed': int(gas_used),
                    'transactionFee': float(BlockchainConfig.from_wei(gas_used * gas_price, 'ether')),
                    'contractAddress': receipt.get('contractAddress'),
                    'success': receipt['status'] == 1,
                    'network': 'Sepolia'
                }
            else:
                return {
                    'status': 'pending',
                    'message': 'Transaction still pending on Sepolia'
                }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Error checking transaction status: {str(e)}'
            }
    
    def transfer_to_voucher_wallet(self, amount_eth, user_address, flight_number, delay_minutes, claim_type):
        """
        Transfer ETH to voucher wallet (0x32C532f9b48334c3F3f4410494163ec5Af109c62)
        Used when user claims compensation as a voucher instead of direct transfer
        
        Args:
            amount_eth: Amount in ETH to transfer
            user_address: User's wallet address (for record keeping)
            flight_number: Flight number for reference
            delay_minutes: Delay minutes for reference
            claim_type: Type of claim (0-3)
        
        Returns:
            Dict with transaction details and voucher code
        """
        try:
            VOUCHER_WALLET = '0x32C532f9b48334c3F3f4410494163ec5Af109c62'
            
            print(f"\n🟣 TRANSFER_TO_VOUCHER_WALLET CALLED:")
            print(f"   Amount: {amount_eth} ETH")
            print(f"   To Wallet: {VOUCHER_WALLET}")
            print(f"   User: {user_address}")
            
            # Validate inputs
            if amount_eth <= 0:
                print(f"❌ Invalid amount: {amount_eth}")
                raise ValueError("Amount must be positive")
            
            if not BlockchainConfig.validate_address(VOUCHER_WALLET):
                print(f"❌ Invalid voucher wallet address")
                raise ValueError("Invalid voucher wallet address")
            
            w3 = self.contract_manager.w3
            
            # Convert to checksum addresses
            voucher_checksum = BlockchainConfig.to_checksum_address(VOUCHER_WALLET)
            deployer = BlockchainConfig.to_checksum_address(BlockchainConfig.DEPLOYER_ACCOUNT)
            
            print(f"✓ Voucher Wallet (checksum): {voucher_checksum}")
            print(f"✓ Deployer: {deployer}")
            
            # Convert token amount to FLY token decimals (18 decimals)
            amount_wei = BlockchainConfig.to_wei(amount_eth, 'ether')
            print(f"✓ Token amount in wei: {amount_wei}")

            fly_token_contract = self.contract_manager.get_contract('FlightToken')
            pending_nonce = w3.eth.get_transaction_count(deployer, 'pending')
            current_gas_price = w3.eth.gas_price or 0
            print(f"✓ Using nonce: {pending_nonce}, gasPrice: {current_gas_price}")

            tx_data = fly_token_contract.functions.transfer(
                voucher_checksum,
                int(amount_wei)
            ).build_transaction({
                'from': deployer,
                'nonce': pending_nonce,
                'gas': 100000,
                'gasPrice': current_gas_price,
                'chainId': w3.eth.chain_id
            })

            print(f"✓ Token transfer transaction built")
            
            print(f"✓ Transaction data built")
            
            # Sign and send the transaction
            private_key = os.getenv('DEPLOYER_PRIVATE_KEY')
            if not private_key:
                print(f"❌ DEPLOYER_PRIVATE_KEY not configured")
                raise ValueError("DEPLOYER_PRIVATE_KEY not configured in environment")
            
            print(f"✓ Private key loaded (length: {len(private_key)})")
            
            account = Account.from_key(private_key)
            print(f"✓ Account loaded: {account.address}")
            
            signed_tx = account.sign_transaction(tx_data)
            print(f"✓ Transaction signed")
            
            # Send transaction
            print(f"🟡 Sending raw transaction...")
            tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            tx_hash_str = tx_hash.hex()
            
            print(f"✓ Voucher ETH transfer transaction sent: {tx_hash_str}")
            
            # Wait for receipt
            try:
                print(f"⏳ Waiting for receipt...")
                receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
                block_number = receipt['blockNumber']
                confirmations = w3.eth.block_number - block_number
                
                print(f"✓ Voucher transaction confirmed in block {block_number}")
                print(f"✓ Confirmations: {confirmations}")
                
            except Exception as e:
                print(f"⚠️ Voucher transaction pending (may not be mined yet): {str(e)}")
                block_number = None
                confirmations = 0
            
            # Generate unique voucher code
            import hashlib
            import time
            voucher_code = hashlib.md5(f"{tx_hash_str}{user_address}{time.time()}".encode()).hexdigest()[:12].upper()
            print(f"✓ Voucher code generated: {voucher_code}")
            
            result = {
                'status': 'success',
                'transaction_hash': tx_hash_str,
                'block_number': block_number,
                'confirmations': confirmations,
                'from_address': deployer,
                'to_address': voucher_checksum,
                'amount_transferred': amount_eth,
                'amount_wei': int(amount_wei),
                'user_address': user_address,
                'flight_number': flight_number,
                'delay_minutes': delay_minutes,
                'claim_type': claim_type,
                'voucher_code': voucher_code,
                'message': f'Successfully transferred {amount_eth} ETH to voucher wallet'
            }
            
            print(f"✅ Transfer to voucher wallet complete!")
            return result
            
        except Exception as e:
            print(f"❌ Error transferring to voucher wallet: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                'status': 'error',
                'message': f'Failed to transfer to voucher wallet: {str(e)}'
            }
