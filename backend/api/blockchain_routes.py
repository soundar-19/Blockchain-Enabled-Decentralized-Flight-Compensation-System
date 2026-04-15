#!/usr/bin/env python3
"""
Blockchain API Routes
Real blockchain integration with Sepolia testnet
"""

import datetime
from flask import Blueprint, jsonify, request
from bson.objectid import ObjectId
try:
    from ..blockchain.blockchain_service import BlockchainService
    from ..blockchain.wallet_manager import WalletManager
    from ..blockchain.web3_config import BlockchainConfig
    from ..database.db import get_db
except ImportError:
    # Fallback for when running as a script
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from blockchain.blockchain_service import BlockchainService
    from blockchain.wallet_manager import WalletManager
    from blockchain.web3_config import BlockchainConfig
    from database.db import get_db

# JSON helpers

def get_json_field(data, snake_key, camel_key=None, default=None):
    if data is None:
        return default
    if snake_key in data and data[snake_key] is not None:
        return data[snake_key]
    if camel_key and camel_key in data and data[camel_key] is not None:
        return data[camel_key]
    return default


# Voucher metadata helpers
def get_voucher_type(claim_type):
    types = {
        0: 'food',
        1: 'hotel',
        2: 'transport',
        3: 'refund'
    }
    return types.get(int(claim_type), 'refund')


def get_voucher_description(claim_type):
    descriptions = {
        0: 'Meal voucher for airport refreshments and partner cafes.',
        1: 'Hotel voucher for overnight accommodation and lounge access.',
        2: 'Transport voucher for ground transfers and ride-share services.',
        3: 'Refund voucher for direct reimbursement or flight credits.'
    }
    return descriptions.get(int(claim_type), 'Voucher for partner services.')


blockchain_bp = Blueprint('blockchain', __name__, url_prefix='/api/blockchain')

# Initialize blockchain service
try:
    blockchain_service = BlockchainService()
except Exception as e:
    print(f"Warning: Blockchain service initialization failed: {e}")
    blockchain_service = None

@blockchain_bp.route('/status', methods=['GET'])
def get_blockchain_status():
    """Get blockchain connection status"""
    try:
        if not blockchain_service:
            return jsonify({
                'status': 'error',
                'message': 'Blockchain service not initialized. Check contract addresses in .env'
            }), 503
        
        w3 = BlockchainConfig.get_web3_instance()
        
        return jsonify({
            'status': 'connected',
            'network': 'Sepolia',
            'chainId': w3.eth.chain_id,
            'blockNumber': w3.eth.block_number,
            'gasPrice': float(BlockchainConfig.from_wei(w3.eth.gas_price, 'gwei')),
            'timestamp': w3.eth.get_block('latest')['timestamp'],
            'compensationContract': BlockchainConfig.COMPENSATION_CONTRACT_ADDRESS,
            'flyTokenContract': BlockchainConfig.FLY_TOKEN_ADDRESS
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 503

@blockchain_bp.route('/wallet/create', methods=['POST'])
def create_wallet():
    """Create a new wallet"""
    try:
        result = WalletManager.create_wallet()
        
        if result['status'] == 'success':
            return jsonify(result), 201
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@blockchain_bp.route('/wallet/import', methods=['POST'])
def import_wallet():
    """Import wallet from private key"""
    try:
        data = request.get_json()
        private_key = data.get('privateKey')
        
        if not private_key:
            return jsonify({'status': 'error', 'message': 'Private key required'}), 400
        
        result = WalletManager.import_wallet(private_key)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@blockchain_bp.route('/wallet/validate', methods=['POST'])
def validate_wallet():
    """Validate wallet address"""
    try:
        data = request.get_json()
        address = data.get('address')
        
        if not address:
            return jsonify({'status': 'error', 'message': 'Address required'}), 400
        
        is_valid = WalletManager.validate_address(address)
        
        return jsonify({
            'address': address,
            'isValid': is_valid
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@blockchain_bp.route('/wallet/balance/<address>', methods=['GET'])
def get_wallet_balance(address):
    """Get wallet balance (ETH and FLY tokens)"""
    try:
        if not blockchain_service:
            return jsonify({'status': 'error', 'message': 'Blockchain service not available'}), 503
        
        if not BlockchainConfig.validate_address(address):
            return jsonify({'status': 'error', 'message': 'Invalid address'}), 400
        
        eth_balance = blockchain_service.get_eth_balance(address)
        fly_balance = blockchain_service.get_token_balance(address)
        
        return jsonify({
            'address': address,
            'ethBalance': eth_balance,
            'flyTokenBalance': fly_balance,
            'network': 'Sepolia'
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@blockchain_bp.route('/compensation/file-claim', methods=['POST'])
def file_compensation_claim():
    """
    File a compensation claim on blockchain with database verification
    
    Flow:
    1. Validate flight exists in database
    2. Check delay meets minimum threshold
    3. Calculate compensation amount
    4. Execute token transfer from main wallet to user wallet
    5. Log transaction in database
    """
    try:
        if not blockchain_service:
            return jsonify({'status': 'error', 'message': 'Blockchain service not available'}), 503
        
        data = request.get_json()
        user_address = get_json_field(data, 'user_address', 'userAddress')
        flight_number = get_json_field(data, 'flight_number', 'flightNumber')
        delay_minutes = get_json_field(data, 'delay_minutes', 'delayMinutes')
        claim_type = get_json_field(data, 'claim_type', 'claimType')
        route_id = get_json_field(data, 'route_id', 'routeId', 1)
        
        # Validation
        if not all([user_address, flight_number, delay_minutes is not None, claim_type is not None]):
            return jsonify({
                'status': 'error', 
                'message': 'Missing required fields: user_address, flight_number, delay_minutes, claim_type'
            }), 400
        
        # Minimum delay check (must be at least 180 minutes = 3 hours)
        delay_min_threshold = 180
        if int(delay_minutes) < delay_min_threshold:
            return jsonify({
                'status': 'error',
                'message': f'Delay must be at least {delay_min_threshold} minutes (3 hours)'
            }), 400
        
        # Get database connection
        db = get_db()
        
        # Calculate compensation amount based on delay and type
        compensation_amount = blockchain_service.calculate_compensation(
            int(delay_minutes),
            int(claim_type)
        )
        
        if compensation_amount <= 0:
            return jsonify({
                'status': 'error',
                'message': 'Compensation amount is invalid'
            }), 400
        
        # File claim on blockchain and transfer tokens
        result = blockchain_service.file_compensation_claim_with_transfer(
            user_address=user_address,
            flight_number=flight_number,
            delay_minutes=int(delay_minutes),
            claim_type=int(claim_type),
            route_id=int(route_id),
            compensation_amount=compensation_amount
        )
        
        if result['status'] == 'success':
            # Save claim to database
            claim_record = {
                'userAddress': user_address.lower(),
                'flightNumber': flight_number,
                'delayMinutes': int(delay_minutes),
                'claimType': int(claim_type),
                'compensationAmount': compensation_amount,
                'transactionHash': result.get('transaction_hash'),
                'blockNumber': result.get('block_number'),
                'status': 'approved',
                'createdAt': __import__('datetime').datetime.utcnow(),
                'verificationStatus': 'verified'
            }
            
            db_result = db.claims.insert_one(claim_record)
            
            # Return success with transaction details
            return jsonify({
                'status': 'success',
                'message': 'Compensation claim filed and processed successfully',
                'claimId': str(db_result.inserted_id),
                'transaction_hash': result.get('transaction_hash'),
                'block_number': result.get('block_number'),
                'compensationAmount': compensation_amount,
                'compensationTokens': f'{compensation_amount} FLY',
                'etherscanLink': f'https://sepolia.etherscan.io/tx/{result.get("transaction_hash")}',
                'network': 'Sepolia',
                'confirmations': result.get('confirmations', 0)
            }), 201
        else:
            # Save failed claim attempt to database
            db.claims.insert_one({
                'userAddress': user_address.lower(),
                'flightNumber': flight_number,
                'delayMinutes': int(delay_minutes),
                'claimType': int(claim_type),
                'status': 'failed',
                'errorMessage': result.get('message'),
                'createdAt': __import__('datetime').datetime.utcnow()
            })
            
            return jsonify(result), 400
            
    except Exception as e:
        print(f"Error filing compensation claim: {str(e)}")
        return jsonify({
            'status': 'error', 
            'message': f'Failed to file compensation claim: {str(e)}'
        }), 500

@blockchain_bp.route('/compensation/claims/<user_address>', methods=['GET'])
def get_user_compensation_claims(user_address):
    """Get all compensation claims for a user from blockchain"""
    try:
        if not blockchain_service:
            return jsonify({'status': 'error', 'message': 'Blockchain service not available'}), 503
        
        if not BlockchainConfig.validate_address(user_address):
            return jsonify({'status': 'error', 'message': 'Invalid address'}), 400
        
        # Get claim IDs from blockchain
        claim_ids = blockchain_service.get_user_claims(user_address)
        
        claims = []
        for claim_id in claim_ids:
            try:
                claim_details = blockchain_service.get_claim_details(claim_id)
                claim_details['claimId'] = claim_id.hex() if hasattr(claim_id, 'hex') else str(claim_id)
                claims.append(claim_details)
            except:
                continue
        
        return jsonify({
            'userAddress': user_address,
            'totalClaims': len(claims),
            'claims': claims,
            'network': 'Sepolia'
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@blockchain_bp.route('/compensation/claim/<claim_id>', methods=['GET'])
def get_claim_details(claim_id):
    """Get details of a specific claim from blockchain"""
    try:
        if not blockchain_service:
            return jsonify({'status': 'error', 'message': 'Blockchain service not available'}), 503
        
        # Convert claim_id if needed
        if not claim_id.startswith('0x'):
            claim_id = '0x' + claim_id
        
        claim_details = blockchain_service.get_claim_details(claim_id)
        
        return jsonify({
            'claimId': claim_id,
            'details': claim_details,
            'network': 'Sepolia'
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@blockchain_bp.route('/compensation/stats', methods=['GET'])
def get_compensation_stats():
    """Get compensation system statistics from blockchain"""
    try:
        if not blockchain_service:
            return jsonify({'status': 'error', 'message': 'Blockchain service not available'}), 503
        
        total_claims = blockchain_service.get_total_claims_count()
        total_paid = blockchain_service.get_total_compensation_paid()
        
        return jsonify({
            'totalClaims': total_claims,
            'totalPaidFLY': total_paid,
            'averageCompensation': total_paid / total_claims if total_claims > 0 else 0,
            'network': 'Sepolia',
            'contractAddress': BlockchainConfig.COMPENSATION_CONTRACT_ADDRESS
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@blockchain_bp.route('/transaction/status/<tx_hash>', methods=['GET'])
def get_transaction_status(tx_hash):
    """Get status of a transaction on Sepolia"""
    try:
        if not blockchain_service:
            return jsonify({'status': 'error', 'message': 'Blockchain service not available'}), 503
        
        if not tx_hash.startswith('0x'):
            tx_hash = '0x' + tx_hash
        
        status = blockchain_service.get_transaction_status(tx_hash)
        
        return jsonify({
            'txHash': tx_hash,
            'transactionStatus': status,
            'network': 'Sepolia'
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@blockchain_bp.route('/sign-transaction', methods=['POST'])
def sign_and_send_transaction():
    """Sign and send a transaction"""
    try:
        data = request.get_json()
        tx_dict = data.get('transaction')
        private_key = data.get('privateKey')
        
        if not tx_dict or not private_key:
            return jsonify({'status': 'error', 'message': 'Transaction and private key required'}), 400
        
        if not blockchain_service:
            return jsonify({'status': 'error', 'message': 'Blockchain service not available'}), 503
        
        result = blockchain_service.sign_and_send_transaction(tx_dict, private_key)
        
        if result['status'] == 'success':
            return jsonify(result), 201
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@blockchain_bp.route('/send-compensation', methods=['POST'])
def send_compensation():
    """
    Record a compensation transaction to the database.
    The actual transaction is signed and sent on the frontend via MetaMask.
    This endpoint tracks the compensation for audit purposes.
    """
    try:
        from database.db import db
        
        data = request.get_json()
        user_wallet = data.get('userWallet')
        amount = data.get('amount')
        token_type = data.get('tokenType', 'ETH')  # ETH or FLY
        booking_id = data.get('bookingId')
        transaction_hash = data.get('transactionHash')
        
        if not user_wallet or not amount:
            return jsonify({'status': 'error', 'message': 'User wallet and amount required'}), 400
        
        # Get current user from JWT
        user_id = request.headers.get('user_id')
        
        compensation_record = {
            'user_id': user_id,
            'user_wallet': user_wallet,
            'amount': float(amount),
            'token_type': token_type,
            'booking_id': booking_id,
            'transaction_hash': transaction_hash,
            'status': 'completed' if transaction_hash else 'pending',
            'timestamp': datetime.datetime.utcnow()
        }
        
        # Store in database
        compensations = db.compensations
        result = compensations.insert_one(compensation_record)
        
        return jsonify({
            'status': 'success',
            'message': f'Compensation of {amount} {token_type} recorded',
            'record_id': str(result.inserted_id),
            'transaction_hash': transaction_hash
        }), 201
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500




@blockchain_bp.route('/compensation/file-voucher-claim', methods=['POST', 'OPTIONS'])
def file_voucher_claim():
    """
    File a compensation claim as a voucher
    
    Flow:
    1. Validate flight and delay
    2. Calculate compensation amount
    3. Transfer ETH to voucher wallet
    4. Create voucher record in database
    5. Return voucher code
    """
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        if not blockchain_service:
            return jsonify({'status': 'error', 'message': 'Blockchain service not available'}), 503
        
        print(f"\n🔵 FILE VOUCHER CLAIM REQUEST RECEIVED")
        print(f"   Content-Type: {request.content_type}")
        print(f"   Content-Length: {request.content_length}")
        print(f"   Raw Data Length: {len(request.get_data())}")
        print(f"   Raw Data: {request.get_data()}")
        
        # Try to get JSON
        data = request.get_json(force=True)
        print(f"   Parsed JSON: {data}")
        
        user_address = get_json_field(data, 'user_address', 'userAddress')
        flight_number = get_json_field(data, 'flight_number', 'flightNumber')
        delay_minutes = get_json_field(data, 'delay_minutes', 'delayMinutes')
        claim_type = get_json_field(data, 'claim_type', 'claimType')
        route_id = get_json_field(data, 'route_id', 'routeId', 1)
        booking_id = get_json_field(data, 'booking_id', 'bookingId')
        
        print(f"\n   Extracted values:")
        print(f"   - user_address: {user_address} (type: {type(user_address)})")
        print(f"   - flight_number: {flight_number} (type: {type(flight_number)})")
        print(f"   - delay_minutes: {delay_minutes} (type: {type(delay_minutes)})")
        print(f"   - claim_type: {claim_type} (type: {type(claim_type)})")
        print(f"   - route_id: {route_id} (type: {type(route_id)})")
        print(f"   - booking_id: {booking_id} (type: {type(booking_id)})")
        
        # Validation
        if not all([user_address, flight_number, delay_minutes is not None, claim_type is not None]):
            print(f"❌ Missing fields validation failed")
            return jsonify({
                'status': 'error', 
                'message': 'Missing required fields: user_address, flight_number, delay_minutes, claim_type'
            }), 400

        # Voucher claims can be generated for any delay amount that maps to a voucher value.
        # The compensation calculation already returns a minimum voucher amount for short delays.
        db = get_db()
        print(f"✓ Database connection obtained")

        # Protect against repeated voucher claims by checking the related booking
        booking = None
        if booking_id:
            try:
                booking = db.bookings.find_one({'_id': ObjectId(booking_id)})
            except Exception:
                booking = None

        if not booking:
            user = db.users.find_one({
                '$or': [
                    {'address': user_address.lower()},
                    {'metamask_address': user_address.lower()}
                ]
            })
            if user:
                booking = db.bookings.find_one({'user_id': str(user['_id']), 'flight_number': flight_number})

        if booking and booking.get('compensation_claimed'):
            print(f"❌ Voucher claim rejected: booking already claimed")
            return jsonify({
                'status': 'error',
                'message': 'This booking has already been claimed for compensation'
            }), 400
        
        # Calculate compensation amount based on delay and type
        compensation_amount = blockchain_service.calculate_compensation(
            int(delay_minutes),
            int(claim_type)
        )
        print(f"✓ Compensation calculated: {compensation_amount} ETH")
        
        if compensation_amount <= 0:
            print(f"❌ Invalid compensation amount: {compensation_amount}")
            return jsonify({
                'status': 'error',
                'message': 'Compensation amount is invalid'
            }), 400
        
        # Transfer to voucher wallet
        print(f"🟡 Calling transfer_to_voucher_wallet()...")
        result = blockchain_service.transfer_to_voucher_wallet(
            amount_eth=compensation_amount,
            user_address=user_address,
            flight_number=flight_number,
            delay_minutes=int(delay_minutes),
            claim_type=int(claim_type)
        )
        
        print(f"✓ Transfer result status: {result.get('status')}")
        
        if result['status'] == 'success':
            print(f"✓ ETH Transfer successful: {result.get('transaction_hash')}")
            print(f"✓ Voucher Code: {result.get('voucher_code')}")
            
            # Create voucher record in database
            created_at = __import__('datetime').datetime.utcnow()
            expires_at = created_at + datetime.timedelta(days=30)
            voucher_record = {
                'userAddress': user_address.lower(),
                'flightNumber': flight_number,
                'delayMinutes': int(delay_minutes),
                'claimType': int(claim_type),
                'voucherType': get_voucher_type(claim_type),
                'voucher_description': get_voucher_description(claim_type),
                'compensationAmount': compensation_amount,
                'voucherCode': result['voucher_code'],
                'transactionHash': result.get('transaction_hash'),
                'blockNumber': result.get('block_number'),
                'status': 'active',  # active, redeemed, expired
                'voucherWallet': '0x32C532f9b48334c3F3f4410494163ec5Af109c62',
                'createdAt': created_at,
                'expiresAt': expires_at,
                'redeemedAt': None,
                'verificationStatus': 'verified'
            }
            
            print(f"🟡 Inserting voucher record into database...")
            # Insert into vouchers collection
            try:
                voucher_result = db.vouchers.insert_one(voucher_record)
                print(f"✓ Voucher inserted with ID: {voucher_result.inserted_id}")
            except Exception as db_error:
                print(f"❌ Database insertion error: {str(db_error)}")
                raise
            
            # Mark booking as claimed when related booking is available
            if booking:
                booking_update = {
                    'compensation_claimed': True,
                    'claim_method': 'voucher',
                    'claimed_at': __import__('datetime').datetime.utcnow(),
                    'claimed_by_address': user_address.lower(),
                    'voucher_id': str(voucher_result.inserted_id),
                    'voucher_code': result['voucher_code'],
                    'tx_hash': result.get('transaction_hash')
                }
                try:
                    db.bookings.update_one({'_id': booking['_id']}, {'$set': booking_update})
                    print(f"✓ Related booking {booking.get('_id')} marked as claimed")
                except Exception as update_error:
                    print(f"❌ Failed to mark booking as claimed: {str(update_error)}")

            # Also create a claim record for tracking
            claim_record = {
                'userAddress': user_address.lower(),
                'flightNumber': flight_number,
                'delayMinutes': int(delay_minutes),
                'claimType': int(claim_type),
                'compensationAmount': compensation_amount,
                'transactionHash': result.get('transaction_hash'),
                'blockNumber': result.get('block_number'),
                'status': 'approved',
                'claimMethod': 'voucher',
                'voucherId': str(voucher_result.inserted_id),
                'createdAt': __import__('datetime').datetime.utcnow(),
                'verificationStatus': 'verified'
            }
            
            print(f"🟡 Inserting claim record into database...")
            try:
                claim_result = db.claims.insert_one(claim_record)
                print(f"✓ Claim inserted with ID: {claim_result.inserted_id}")
            except Exception as db_error:
                print(f"❌ Claim database insertion error: {str(db_error)}")
                raise
            
            # Return success with voucher details
            response = {
                'status': 'success',
                'message': 'Voucher claim filed and processed successfully',
                'claim_id': str(claim_result.inserted_id),
                'voucher_id': str(voucher_result.inserted_id),
                'voucher_code': result['voucher_code'],
                'transaction_hash': result.get('transaction_hash'),
                'block_number': result.get('block_number'),
                'compensationAmount': compensation_amount,
                'etherscanLink': f'https://sepolia.etherscan.io/tx/{result.get("transaction_hash")}',
                'network': 'Sepolia',
                'confirmations': result.get('confirmations', 0),
                'voucherWallet': '0x32C532f9b48334c3F3f4410494163ec5Af109c62'
            }
            print(f"✅ VOUCHER CLAIM COMPLETE - Returning successful response")
            return jsonify(response), 201
        else:
            print(f"❌ Transfer failed: {result.get('message')}")
            # Save failed claim attempt to database
            db.claims.insert_one({
                'userAddress': user_address.lower(),
                'flightNumber': flight_number,
                'delayMinutes': int(delay_minutes),
                'claimType': int(claim_type),
                'status': 'failed',
                'claimMethod': 'voucher',
                'error': result.get('message'),
                'createdAt': __import__('datetime').datetime.utcnow()
            })
            
            return jsonify({
                'status': 'error',
                'message': f'Failed to file voucher claim: {result.get("message")}',
                'error': result.get('message')
            }), 400
    
    except Exception as e:
        print(f'❌ EXCEPTION in file_voucher_claim: {str(e)}')
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}',
            'error': str(e)
        }), 500


@blockchain_bp.route('/vouchers/<user_address>', methods=['GET'])
def get_user_vouchers(user_address):
    """
    Get all vouchers for a user
    
    Args:
        user_address: User's wallet address
    
    Returns:
        List of vouchers for the user
    """
    try:
        db = get_db()
        
        # Validate address
        if not user_address or len(user_address) != 42:
            return jsonify({'status': 'error', 'message': 'Invalid user address'}), 400
        
        vouchers = list(db.vouchers.find(
            {'userAddress': user_address.lower()},
            {'_id': 1, 'voucherCode': 1, 'compensationAmount': 1, 'status': 1,
             'createdAt': 1, 'expiresAt': 1, 'redeemedAt': 1, 'flightNumber': 1,
             'transactionHash': 1, 'claimType': 1, 'delayMinutes': 1, 'voucherType': 1,
             'voucher_description': 1}
        ).sort('createdAt', -1))
        
        # Convert ObjectIds to strings and format dates
        for voucher in vouchers:
            voucher['_id'] = str(voucher['_id'])
            voucher['createdAt'] = voucher['createdAt'].isoformat() if voucher.get('createdAt') else None
            voucher['expiresAt'] = voucher['expiresAt'].isoformat() if voucher.get('expiresAt') else None
            voucher['redeemedAt'] = voucher['redeemedAt'].isoformat() if voucher.get('redeemedAt') else None
            voucher['voucherType'] = voucher.get('voucherType') or get_voucher_type(voucher.get('claimType', 3))
            voucher['voucher_description'] = voucher.get('voucher_description') or get_voucher_description(voucher.get('claimType', 3))
        
        return jsonify({
            'status': 'success',
            'vouchers': vouchers,
            'count': len(vouchers)
        }), 200
        
    except Exception as e:
        print(f'✗ Error getting vouchers: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500


@blockchain_bp.route('/vouchers/verify/<voucher_code>', methods=['GET'])
def verify_voucher(voucher_code):
    """
    Verify a voucher code and get its details
    
    Args:
        voucher_code: The voucher code to verify
    
    Returns:
        Voucher details if valid
    """
    try:
        db = get_db()
        
        # Find voucher by code
        voucher = db.vouchers.find_one({'voucherCode': voucher_code.upper()})
        
        if not voucher:
            return jsonify({'status': 'error', 'message': 'Voucher not found'}), 404
        
        voucher['_id'] = str(voucher['_id'])
        voucher['createdAt'] = voucher['createdAt'].isoformat() if voucher.get('createdAt') else None
        voucher['expiresAt'] = voucher['expiresAt'].isoformat() if voucher.get('expiresAt') else None
        if voucher.get('redeemedAt'):
            voucher['redeemedAt'] = voucher['redeemedAt'].isoformat()
        voucher['voucherType'] = voucher.get('voucherType') or get_voucher_type(voucher.get('claimType', 3))
        voucher['voucher_description'] = voucher.get('voucher_description') or get_voucher_description(voucher.get('claimType', 3))
        
        return jsonify({
            'status': 'success',
            'voucher': voucher,
            'isValid': voucher['status'] == 'active',
            'isRedeemed': voucher['status'] == 'redeemed'
        }), 200
        
    except Exception as e:
        print(f'✗ Error verifying voucher: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500


@blockchain_bp.route('/vouchers/redeem', methods=['POST'])
def redeem_voucher():
    """
    Redeem a voucher and transfer funds to user's wallet
    
    Flow:
    1. Verify voucher code
    2. Check if voucher is active
    3. Transfer ETH from voucher wallet to user's wallet (separate transaction)
    4. Mark voucher as redeemed
    
    Note: This requires a separate transaction from the voucher wallet.
    For now, we'll just mark it as redeemed in the database.
    """
    try:
        data = request.get_json()
        voucher_code = get_json_field(data, 'voucher_code', 'voucherCode')
        user_address = get_json_field(data, 'user_address', 'userAddress')
        
        if not voucher_code or not user_address:
            return jsonify({'status': 'error', 'message': 'Voucher code and user address required'}), 400
        
        db = get_db()
        
        # Find and verify voucher
        voucher = db.vouchers.find_one({'voucherCode': voucher_code.upper()})
        
        if not voucher:
            return jsonify({'status': 'error', 'message': 'Voucher not found'}), 404
        
        if voucher['status'] != 'active':
            return jsonify({
                'status': 'error', 
                'message': f'Voucher is {voucher["status"]}, cannot be redeemed'
            }), 400
        
        expires_at = voucher.get('expiresAt')
        if expires_at:
            if isinstance(expires_at, str):
                expires_at = datetime.datetime.fromisoformat(expires_at)
            if expires_at < datetime.datetime.utcnow():
                db.vouchers.update_one(
                    {'voucherCode': voucher_code.upper()},
                    {'$set': {'status': 'expired'}}
                )
                return jsonify({
                    'status': 'error',
                    'message': 'Voucher has expired and cannot be redeemed'
                }), 400

        db.vouchers.update_one(
            {'voucherCode': voucher_code.upper()},
            {'$set': {
                'status': 'redeemed',
                'redeemedAt': __import__('datetime').datetime.utcnow(),
                'redeemedByAddress': user_address.lower()
            }}
        )
        
        return jsonify({
            'status': 'success',
            'message': f'Voucher redeemed successfully',
            'voucherCode': voucher_code.upper(),
            'amount': voucher['compensationAmount'],
            'note': 'Voucher marked as redeemed. Manual ETH transfer from voucher wallet may be required.'
        }), 200
        
    except Exception as e:
        print(f'✗ Error redeeming voucher: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500


@blockchain_bp.route('/compensation-history', methods=['GET'])
def get_compensation_history():
    """
    Get compensation history for the current user
    """
    try:
        from database.db import db
        
        user_id = request.headers.get('user_id')
        if not user_id:
            return jsonify({'status': 'error', 'message': 'User ID required'}), 400
        
        compensations = db.compensations
        history = list(compensations.find(
            {'user_id': user_id},
            {'_id': 1, 'amount': 1, 'token_type': 1, 'booking_id': 1, 
             'transaction_hash': 1, 'status': 1, 'timestamp': 1}
        ).sort('timestamp', -1))
        
        # Convert ObjectIds to strings
        for record in history:
            record['_id'] = str(record['_id'])
            record['timestamp'] = record['timestamp'].isoformat()
        
        return jsonify({
            'status': 'success',
            'history': history,
            'count': len(history)
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500