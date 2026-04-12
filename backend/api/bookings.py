#!/usr/bin/env python3
"""User flight bookings and compensation management"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from bson.objectid import ObjectId
import os
from web3 import Web3

# Try importing from database module, fall back to direct MongoDB
try:
    from database.db import get_db
except ImportError:
    from ..database.db import get_db

bookings_bp = Blueprint('bookings', __name__, url_prefix='/api/bookings')


def calculate_compensation(delay_minutes, is_cancellation=False, cancellation_notice_days=0):
    """
    Calculate compensation in ETH based on delay or cancellation
    
    Delay Rules:
    - Delay >= 2 hours: 0.01 ETH (~$20 USD) in meals/refreshments
    - Delay >= 3 hours: 0.015 ETH (~$30 USD) in meals/refreshments
    - Delay >= 4 hours: 0.02 ETH (~$40 USD) in meals/refreshments
    - Delay > 24 hours: 0.05 ETH (~$100 USD) hotel accommodation + transfers
    
    Cancellation Rules:
    - Cancellation >= 2 weeks notice: No compensation (only refund)
    - Cancellation < 2 weeks notice: 0.05 ETH (~$100 USD) + refund
    """
    
    if is_cancellation:
        if cancellation_notice_days >= 14:
            return {
                'type': 'refund_only',
                'eth_amount': 0,
                'usd_value': 0,
                'voucher_type': None,
                'description': 'Refund/Alternate flight (≥2 weeks notice)',
                'compensation_days': 0
            }
        else:
            return {
                'type': 'cancellation_compensation',
                'eth_amount': 0.05,  # 0.05 ETH (~$100 USD)
                'usd_value': 100,
                'voucher_type': 'all_inclusive',
                'description': 'Compensation + Refund/Alternate flight (<2 weeks notice)',
                'compensation_days': 1
            }
    
    # Delay-based compensation in ETH
    if delay_minutes >= 1440:  # > 24 hours
        return {
            'type': 'hotel_accommodation',
            'eth_amount': 0.05,  # 0.05 ETH (~$100 USD)
            'usd_value': 100,
            'voucher_type': 'hotel_and_transfer',
            'description': 'Free hotel accommodation + transfers',
            'hours': delay_minutes // 60,
            'meals': True
        }
    elif delay_minutes >= 240:  # >= 4 hours
        return {
            'type': 'meal_refreshment',
            'eth_amount': 0.02,  # 0.02 ETH (~$40 USD)
            'usd_value': 40,
            'voucher_type': 'meal',
            'description': 'Free meals/refreshments',
            'hours': delay_minutes // 60
        }
    elif delay_minutes >= 180:  # >= 3 hours
        return {
            'type': 'meal_refreshment',
            'eth_amount': 0.015,  # 0.015 ETH (~$30 USD)
            'usd_value': 30,
            'voucher_type': 'meal',
            'description': 'Free meals/refreshments',
            'hours': delay_minutes // 60
        }
    elif delay_minutes >= 120:  # >= 2 hours
        return {
            'type': 'meal_refreshment',
            'eth_amount': 0.01,  # 0.01 ETH (~$20 USD)
            'usd_value': 20,
            'voucher_type': 'meal',
            'description': 'Free meals/refreshments',
            'hours': delay_minutes // 60
        }
    else:
        return {
            'type': 'no_compensation',
            'eth_amount': 0,
            'usd_value': 0,
            'voucher_type': None,
            'description': 'No compensation (delay < 2 hours)',
            'hours': 0
        }


@bookings_bp.route('/user/<user_id>', methods=['GET'])
def get_user_bookings(user_id):
    """Get all flight bookings for a user"""
    try:
        print(f"\n{'='*80}")
        print(f"🔄 FETCHING BOOKINGS FOR USER: {user_id}")
        print(f"{'='*80}")
        
        db = get_db()
        
        # Fetch user's bookings (all, past and future for testing)
        bookings = list(db.bookings.find({
            'user_id': user_id
        }).sort('created_at', -1))
        
        print(f"📊 Found {len(bookings)} bookings in database for this user")
        
        # Convert ObjectIds to strings and add compensation info
        for i, booking in enumerate(bookings):
            booking['_id'] = str(booking['_id'])
            
            print(f"\n📋 Booking {i+1}: {booking.get('flight_number', 'N/A')}")
            print(f"   ID: {booking['_id']}")
            print(f"   Current delay_minutes in DB: {booking.get('delay_minutes')}")
            print(f"   Current status in DB: {booking.get('status')}")
            
            # Use stored delay_minutes from database (set via Testing panel)
            delay_minutes = booking.get('delay_minutes', 0)
            
            # If delay_minutes is 0, try to calculate from actual/scheduled arrival
            if delay_minutes == 0 and 'actual_arrival' in booking and 'scheduled_arrival' in booking:
                try:
                    scheduled = datetime.fromisoformat(booking['scheduled_arrival'])
                    actual = datetime.fromisoformat(booking['actual_arrival'])
                    calculated_delay = int((actual - scheduled).total_seconds() / 60)
                    if calculated_delay > 0:
                        delay_minutes = calculated_delay
                        print(f"   Calculated delay from times: {calculated_delay}")
                except:
                    pass
            
            booking['delay_minutes'] = delay_minutes
            
            # Calculate compensation
            is_cancelled = booking.get('status') == 'cancelled'
            cancel_notice = booking.get('cancellation_notice_days', 0)
            booking['compensation'] = calculate_compensation(
                delay_minutes, 
                is_cancelled, 
                cancel_notice
            )
            print(f"   Calculated compensation: {booking['compensation']['eth_amount']} ETH")
        
        print(f"\n✅ RETURNING {len(bookings)} bookings")
        print(f"{'='*80}\n")
        
        return jsonify({
            'status': 'success',
            'bookings': bookings,
            'count': len(bookings)
        }), 200
        
    except Exception as e:
        print(f"❌ ERROR in get_user_bookings: {str(e)}")
        print(f"{'='*80}\n")
        return jsonify({'error': str(e)}), 500


@bookings_bp.route('/create', methods=['POST'])
def create_booking():
    """Create a new flight booking for user"""
    try:
        db = get_db()
        data = request.get_json()
        
        if not all(k in data for k in ['user_id', 'flight_number', 'airline', 'departure_city', 'arrival_city', 'scheduled_departure', 'scheduled_arrival']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        booking_doc = {
            'user_id': data['user_id'],
            'flight_number': data['flight_number'],
            'airline': data['airline'],
            'departure_city': data['departure_city'],
            'arrival_city': data['arrival_city'],
            'scheduled_departure': data['scheduled_departure'],
            'scheduled_arrival': data['scheduled_arrival'],
            'actual_arrival': data.get('actual_arrival', data['scheduled_arrival']),
            'delay_minutes': data.get('delay_minutes', 0),
            'status': data.get('status', 'completed'),  # 'scheduled', 'completed', 'cancelled'
            'cancellation_notice_days': data.get('cancellation_notice_days', 0),
            'seat': data.get('seat', ''),
            'ticket_class': data.get('ticket_class', 'economy'),
            'created_at': datetime.utcnow(),
            'flight_date': data['scheduled_departure']
        }
        
        result = db.bookings.insert_one(booking_doc)
        
        return jsonify({
            'status': 'success',
            'booking_id': str(result.inserted_id),
            'message': 'Booking created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bookings_bp.route('/compensation/<booking_id>', methods=['POST'])
@bookings_bp.route('/compensation/<booking_id>', methods=['POST'])
def claim_compensation(booking_id):
    """File a compensation claim for a booking - transfers real ETH"""
    try:
        print(f'\n{"="*80}')
        print(f'🔄 CLAIM COMPENSATION REQUEST')
        print(f'{"="*80}')
        print(f'🔄 Claim request received for booking: {booking_id}')
        
        db = get_db()
        data = request.get_json()
        
        if not data.get('user_address'):
            print(f'❌ ERROR: User wallet address required')
            return jsonify({'error': 'User wallet address required'}), 400
        
        user_address = data['user_address'].strip()
        print(f'👤 User address: {user_address}')
        
        # Get booking
        try:
            booking = db.bookings.find_one({'_id': ObjectId(booking_id)})
        except Exception as e:
            print(f'❌ ERROR finding booking: {e}')
            return jsonify({'error': 'Invalid booking ID'}), 400
        
        if not booking:
            print(f'❌ ERROR: Booking not found')
            return jsonify({'error': 'Booking not found'}), 404
        
        print(f'✅ Booking found: {booking.get("flight_number")}')
        
        # Check if already claimed
        if booking.get('compensation_claimed'):
            print(f'⚠️ Already claimed')
            return jsonify({'error': 'Compensation already claimed for this booking'}), 400
        
        # Calculate compensation
        is_cancelled = booking.get('status') == 'cancelled'
        cancel_notice = booking.get('cancellation_notice_days', 0)
        compensation = calculate_compensation(
            booking.get('delay_minutes', 0),
            is_cancelled,
            cancel_notice
        )
        
        print(f'💰 Compensation calculated: {compensation["eth_amount"]} ETH (~${compensation["usd_value"]})')
        
        # Check if there's compensation to send
        if compensation['eth_amount'] <= 0:
            print(f'❌ No compensation available')
            return jsonify({'error': 'No compensation available for this booking'}), 400
        
        # Perform ETH transfer
        tx_hash = None
        blockchain_success = False
        error_message = None
        
        try:
            # Setup Web3 connection
            print(f'\n⛓️  BLOCKCHAIN CONNECTION SETUP')
            print(f'{"="*80}')
            rpc_url = os.getenv('RPC_URL')
            deployer_account = os.getenv('DEPLOYER_ACCOUNT')
            deployer_private_key = os.getenv('DEPLOYER_PRIVATE_KEY')
            chain_id = os.getenv('CHAIN_ID', '11155111')
            
            print(f'RPC_URL: {rpc_url[:60] if rpc_url else "NOT SET"}...')
            print(f'DEPLOYER_ACCOUNT: {deployer_account}')
            print(f'DEPLOYER_PRIVATE_KEY: {"SET ✓" if deployer_private_key else "NOT SET ✗"}')
            print(f'CHAIN_ID: {chain_id}')
            
            if not rpc_url or not deployer_account:
                raise Exception('Missing RPC_URL or DEPLOYER_ACCOUNT in .env')
            
            if not deployer_private_key:
                raise Exception('❌ CRITICAL: DEPLOYER_PRIVATE_KEY not found in environment!')
            
            print(f'\n✅ Connecting to Sepolia RPC...')
            w3 = Web3(Web3.HTTPProvider(rpc_url))
            
            if not w3.is_connected():
                raise Exception('Failed to connect to Sepolia RPC')
            
            print(f'✅ Connected to RPC')
            
            # Validate user address
            print(f'\n👤 Validating user address...')
            if not Web3.is_address(user_address):
                raise Exception(f'Invalid user address: {user_address}')
            
            print(f'✅ User address is valid')
            
            # Check deployer account has balance
            print(f'\n🔍 Checking deployer balance...')
            deployer_balance = w3.eth.get_balance(deployer_account)
            eth_to_send = w3.to_wei(compensation['eth_amount'], 'ether')
            balance_eth = w3.from_wei(deployer_balance, "ether")
            
            print(f'   Deployer balance: {balance_eth} ETH')
            print(f'   Amount to send: {compensation["eth_amount"]} ETH')
            
            if deployer_balance < eth_to_send:
                raise Exception(f'Insufficient balance. Have {balance_eth} ETH, need {compensation["eth_amount"]} ETH')
            
            # Get nonce
            print(f'\n📊 Building transaction...')
            nonce = w3.eth.get_transaction_count(deployer_account)
            gas_price = w3.eth.gas_price
            print(f'   Nonce: {nonce}')
            print(f'   Gas Price: {w3.from_wei(gas_price, "gwei")} Gwei')
            
            # Build transaction
            tx = {
                'from': deployer_account,
                'to': user_address,
                'value': eth_to_send,
                'gas': 21000,
                'gasPrice': gas_price,
                'nonce': nonce,
                'chainId': int(chain_id)
            }
            
            print(f'   Value: {w3.from_wei(eth_to_send, "ether")} ETH')
            print(f'   Gas Limit: 21000')
            
            print(f'\n🔐 Signing transaction with deployer private key...')
            signed_tx = w3.eth.account.sign_transaction(tx, deployer_private_key)
            print(f'✅ Transaction signed successfully')
            
            print(f'\n📤 Sending raw transaction to Sepolia blockchain...')
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction).hex()
            blockchain_success = True
            
            print(f'\n{"="*80}')
            print(f'✅✅✅ COMPENSATION TRANSFER SUCCESSFUL!')
            print(f'{"="*80}')
            print(f'TX Hash: {tx_hash}')
            print(f'From: {deployer_account}')
            print(f'To: {user_address}')
            print(f'Amount: {compensation["eth_amount"]} ETH (~${compensation["usd_value"]})')
            print(f'Status: Pending (will confirm in ~15 seconds)')
            print(f'Explore: https://sepolia.etherscan.io/tx/{tx_hash}')
            print(f'{"="*80}\n')
                
        except Exception as e:
            error_message = str(e)
            print(f'\n{"="*80}')
            print(f'❌ BLOCKCHAIN TRANSACTION FAILED')
            print(f'{"="*80}')
            print(f'Error: {error_message}')
            import traceback
            traceback.print_exc()
            print(f'{"="*80}\n')
            blockchain_success = False
        
        # Mark booking as claimed in database
        print(f'💾 Updating database...')
        update_data = {
            'compensation_claimed': True,
            'claim_method': data.get('claim_method', 'tokens'),
            'claimed_at': datetime.utcnow(),
            'claimed_by_address': user_address,
            'tx_hash': tx_hash,
            'blockchain_success': blockchain_success,
            'error_message': error_message if not blockchain_success else None
        }
        
        db.bookings.update_one(
            {'_id': ObjectId(booking_id)},
            {'$set': update_data}
        )
        
        # Create claim record
        claim_doc = {
            'user_id': booking['user_id'],
            'user_address': user_address,
            'booking_id': str(booking_id),
            'flight_number': booking['flight_number'],
            'delay_minutes': booking.get('delay_minutes', 0),
            'compensation_type': compensation['type'],
            'eth_amount': compensation['eth_amount'],
            'usd_value': compensation['usd_value'],
            'voucher_type': compensation.get('voucher_type'),
            'claim_method': data.get('claim_method', 'tokens'),
            'status': 'completed' if blockchain_success else 'pending',
            'tx_hash': tx_hash,
            'error_message': error_message if not blockchain_success else None,
            'created_at': datetime.utcnow()
        }
        
        db.claims.insert_one(claim_doc)
        
        print(f'✅ Database updated')
        print(f'📊 Returning response to frontend: tx_hash={tx_hash}, success={blockchain_success}\n')
        
        return jsonify({
            'status': 'success',
            'compensation': compensation,
            'tx_hash': tx_hash,
            'blockchain_success': blockchain_success,
            'error_message': error_message,
            'message': f'Compensation of {compensation["eth_amount"]} ETH (~${compensation["usd_value"]}) processed' + (f'\nTX: {tx_hash}' if tx_hash else f'\nError: {error_message}')
        }), 200
        
    except Exception as e:
        error_msg = str(e)
        print(f'\n{"="*80}')
        print(f'❌ FATAL ERROR IN CLAIM_COMPENSATION')
        print(f'{"="*80}')
        print(f'Error: {error_msg}')
        import traceback
        traceback.print_exc()
        print(f'{"="*80}\n')
        return jsonify({
            'error': error_msg,
            'compensation': None,
            'tx_hash': None
        }), 500, 200
        
    except Exception as e:
        print(f'❌ CLAIM ERROR: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@bookings_bp.route('/<booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get single booking details"""
    try:
        db = get_db()
        booking = db.bookings.find_one({'_id': ObjectId(booking_id)})
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        booking['_id'] = str(booking['_id'])
        
        # Calculate compensation
        delay = booking.get('delay_minutes', 0)
        booking['compensation'] = calculate_compensation(delay)
        
        return jsonify({
            'status': 'success',
            'booking': booking
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bookings_bp.route('/<booking_id>/delay', methods=['PUT'])
def update_booking_delay(booking_id):
    """Update delay minutes for a booking (for testing purposes)"""
    try:
        db = get_db()
        data = request.get_json()
        
        if 'delay_minutes' not in data:
            return jsonify({'error': 'delay_minutes is required'}), 400
        
        delay_minutes = int(data['delay_minutes'])
        
        if delay_minutes < 0:
            return jsonify({'error': 'Delay minutes cannot be negative'}), 400
        
        # Update booking
        result = db.bookings.update_one(
            {'_id': ObjectId(booking_id)},
            {'$set': {'delay_minutes': delay_minutes}}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Get updated booking
        booking = db.bookings.find_one({'_id': ObjectId(booking_id)})
        booking['_id'] = str(booking['_id'])
        
        # Calculate new compensation
        booking['compensation'] = calculate_compensation(delay_minutes)
        
        return jsonify({
            'status': 'success',
            'message': 'Booking delay updated',
            'booking': booking
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
