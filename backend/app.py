#!/usr/bin/env python3
"""
SkyGuard DAO Backend API
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import jwt
import bcrypt
import os
from dotenv import load_dotenv
import sys
from pathlib import Path

# Add root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Load .env from backend directory explicitly
backend_dir = Path(__file__).parent
env_file = backend_dir / '.env'
print(f"📁 Loading .env from: {env_file}")
load_dotenv(dotenv_path=env_file)

# Verify key variables loaded
deployer_pk = os.getenv('DEPLOYER_PRIVATE_KEY')
print(f"✅ DEPLOYER_PRIVATE_KEY loaded: {'YES ✓' if deployer_pk else 'NO ✗'}")
print(f"✅ RPC_URL loaded: {'YES ✓' if os.getenv('RPC_URL') else 'NO ✗'}")
print(f"✅ DEPLOYER_ACCOUNT loaded: {'YES ✓' if os.getenv('DEPLOYER_ACCOUNT') else 'NO ✗'}\n")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

# Import blueprints AFTER app is created
try:
    from api.bookings import bookings_bp
    app.register_blueprint(bookings_bp)
except Exception as e:
    print(f"Warning: Could not import bookings blueprint: {e}")

try:
    from api.blockchain_routes import blockchain_bp
    app.register_blueprint(blockchain_bp)
except Exception as e:
    print(f"Warning: Could not import blockchain blueprint: {e}")

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DB = os.getenv('MONGO_DB', 'flight')
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]

SECRET_KEY = os.getenv('SECRET_KEY', 'skyguard-secret-key')
JWT_SECRET = os.getenv('JWT_SECRET', 'skyguard-jwt-secret-2026')


def json_serialize(obj):
    """Convert MongoDB objects to JSON-serializable format"""
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def serialize_doc(doc):
    """Recursively serialize a MongoDB document"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        return {k: serialize_doc(v) for k, v in doc.items()}
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
    return doc


def get_user_from_token(request):
    """Extract user from JWT token"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except:
        return None


def calculate_compensation(delay_minutes, status='delayed'):
    """Calculate compensation based on EU261 rules - Returns ETH amounts"""
    delay = int(delay_minutes or 0)

    if status == 'cancelled':
        return {
            'eth_amount': 0.05,
            'usd_value': 100.00,
            'description': 'Flight cancelled with less than 2 weeks notice - Full refund + 0.05 ETH compensation',
            'type': 'cancellation'
        }

    if delay >= 1440:  # 24+ hours
        return {
            'eth_amount': 0.05,
            'usd_value': 100.00,
            'description': 'Major delay (24+ hours): Hotel + meals + transport + 0.05 ETH (~$100)',
            'type': 'major_delay_24h'
        }
    elif delay >= 240:  # 4+ hours
        return {
            'eth_amount': 0.02,
            'usd_value': 40.00,
            'description': 'Long delay (4+ hours): Hotel + meals + local transport + 0.02 ETH (~$40)',
            'type': 'long_delay'
        }
    elif delay >= 180:  # 3+ hours
        return {
            'eth_amount': 0.015,
            'usd_value': 30.00,
            'description': 'Significant delay (3+ hours): Meals and refreshments + 0.015 ETH (~$30)',
            'type': 'standard_delay'
        }
    elif delay >= 120:  # 2+ hours
        return {
            'eth_amount': 0.01,
            'usd_value': 20.00,
            'description': 'Minor delay (2-3 hours): Refreshments and snacks + 0.01 ETH (~$20)',
            'type': 'minor_delay'
        }
    else:
        return {
            'eth_amount': 0,
            'usd_value': 0.00,
            'description': 'No compensation (delay < 2 hours)',
            'type': 'no_compensation'
        }


# ============================================================
# AUTH ROUTES
# ============================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user with auto-generated blockchain wallet"""
    try:
        data = request.get_json()
        full_name = data.get('fullName', '').strip()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')

        if not full_name or not email or not password:
            return jsonify({'message': 'All fields required'}), 400

        # Check if user exists
        if db.users.find_one({'email': email}):
            return jsonify({'message': 'Email already registered'}), 409

        # Hash password
        hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

        # Initially, no wallet (user will connect MetaMask later)
        wallet_address = None
        wallet_created = False
        wallet_private_key = None
        try:
            # Try to create a backup wallet for fallback, but don't require it
            from blockchain.wallet_manager import WalletManager
            wallet_result = WalletManager.create_wallet()
            if wallet_result['status'] == 'success':
                # Store as backup only
                wallet_private_key = wallet_result['privateKey']
                print(f"✓ Backup wallet created for {email}")
        except Exception as e:
            print(f"Warning: Could not create blockchain wallet: {e}")
            # Fallback: generate a mock address (Sepolia format)
            import secrets
            wallet_address = '0x' + secrets.token_hex(20)
            wallet_private_key = '0x' + secrets.token_hex(32)
            wallet_created = False

        # Create user document
        user_doc = {
            'name': full_name,
            'email': email,
            'password': hashed_pw,
            'address': wallet_address,
            'private_key_encrypted': wallet_private_key,  # In production: encrypt this!
            'wallet_created': wallet_created,
            'fly_balance': 0,
            'created_at': datetime.utcnow()
        }

        result = db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)

        # Generate JWT
        token = jwt.encode(
            {'user_id': user_id, 'email': email, 'exp': datetime.utcnow() + timedelta(days=1)},
            JWT_SECRET, algorithm='HS256'
        )

        return jsonify({
            'token': token,
            'user': {
                'id': user_id,
                'name': full_name,
                'email': email,
                'address': wallet_address,
                'wallet_created': wallet_created
            }
        }), 201

    except Exception as e:
        print(f"Register error: {e}")
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')

        user = db.users.find_one({'email': email})
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401

        if not bcrypt.checkpw(password.encode(), user['password'].encode()):
            return jsonify({'message': 'Invalid credentials'}), 401

        user_id = str(user['_id'])
        token = jwt.encode(
            {'user_id': user_id, 'email': email, 'exp': datetime.utcnow() + timedelta(days=1)},
            JWT_SECRET, algorithm='HS256'
        )

        return jsonify({
            'token': token,
            'user': {
                'id': user_id,
                'name': user.get('name'),
                'email': email,
                'address': user.get('address'),
                'wallet_created': user.get('wallet_created', False)
            }
        })

    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500


@app.route('/api/auth/connect-wallet', methods=['POST'])
def connect_wallet():
    """Connect user's MetaMask wallet address"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        wallet_address = data.get('wallet_address', '').strip()

        if not user_id or not wallet_address:
            return jsonify({'error': 'user_id and wallet_address required'}), 400

        # Validate Ethereum address format
        if not wallet_address.startswith('0x') or len(wallet_address) != 42:
            return jsonify({'error': 'Invalid Ethereum address'}), 400

        try:
            user = db.users.find_one({'_id': ObjectId(user_id)})
        except:
            return jsonify({'error': 'Invalid user_id'}), 400

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Update user with MetaMask wallet
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {
                '$set': {
                    'address': wallet_address,
                    'wallet_created': True,
                    'wallet_type': 'metamask'
                }
            }
        )

        return jsonify({
            'message': 'Wallet connected successfully',
            'wallet': wallet_address
        })

    except Exception as e:
        return jsonify({'error': f'Wallet connection failed: {str(e)}'}), 500


# ============================================================
# BOOKING ROUTES
# ============================================================

@app.route('/api/bookings/create', methods=['POST'])
def create_booking():
    """Create a flight booking for a user"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        # Verify user exists
        try:
            user = db.users.find_one({'_id': ObjectId(user_id)})
        except:
            return jsonify({'error': 'Invalid user_id'}), 400

        if not user:
            return jsonify({'error': 'User not found'}), 404

        delay_minutes = int(data.get('delay_minutes', 0))
        status = data.get('status', 'completed')
        compensation = calculate_compensation(delay_minutes, status)

        booking_doc = {
            'user_id': ObjectId(user_id),
            'flight_number': data.get('flight_number'),
            'airline': data.get('airline'),
            'departure_city': data.get('departure_city'),
            'arrival_city': data.get('arrival_city'),
            'scheduled_departure': data.get('scheduled_departure'),
            'scheduled_arrival': data.get('scheduled_arrival'),
            'seat': data.get('seat'),
            'ticket_class': data.get('ticket_class', 'Economy'),
            'status': status,
            'delay_minutes': delay_minutes,
            'compensation': compensation if compensation['eth_amount'] > 0 else None,
            'compensation_claimed': False,
            'created_at': datetime.utcnow()
        }

        result = db.bookings.insert_one(booking_doc)
        booking_doc['_id'] = str(result.inserted_id)
        booking_doc['user_id'] = str(booking_doc['user_id'])

        return jsonify({'booking': serialize_doc(booking_doc), 'message': 'Booking created'}), 201

    except Exception as e:
        print(f"Booking error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/bookings/user/<user_id>', methods=['GET'])
def get_user_bookings(user_id):
    """Get all bookings for a user"""
    try:
        try:
            bookings = list(db.bookings.find({'user_id': ObjectId(user_id)}).sort('created_at', -1))
        except:
            return jsonify({'bookings': []})

        return jsonify({'bookings': serialize_doc(bookings)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/bookings/compensation/<booking_id>', methods=['POST'])
def claim_compensation(booking_id):
    """Claim compensation for a booking - triggers real blockchain transfer"""
    try:
        data = request.get_json()
        user_address = data.get('user_address')
        claim_method = data.get('claim_method', 'tokens')

        # Get booking
        try:
            booking = db.bookings.find_one({'_id': ObjectId(booking_id)})
        except:
            return jsonify({'error': 'Invalid booking ID'}), 400

        if not booking:
            return jsonify({'error': 'Booking not found'}), 404

        if booking.get('compensation_claimed'):
            return jsonify({'error': 'Compensation already claimed'}), 400

        compensation = booking.get('compensation')
        if not compensation or compensation.get('eth_amount', 0) == 0:
            return jsonify({'error': 'No compensation available for this booking'}), 400

        eth_amount = compensation['eth_amount']
        tx_hash = None
        blockchain_success = False

        # Attempt real blockchain transfer
        if user_address and claim_method == 'tokens':
            try:
                from backend.blockchain.blockchain_service import BlockchainService
                bs = BlockchainService()
                result = bs.file_compensation_claim_with_transfer(
                    user_address=user_address,
                    flight_number=booking.get('flight_number', 'UNKNOWN'),
                    delay_minutes=booking.get('delay_minutes', 0),
                    claim_type=1,  # hotel/general
                    route_id=0,
                    compensation_amount=eth_amount
                )
                if result.get('status') == 'success':
                    tx_hash = result.get('transaction_hash')
                    blockchain_success = True
                    print(f"✓ Blockchain transfer successful: {tx_hash}")
                else:
                    print(f"⚠ Blockchain transfer failed: {result.get('message')}")
            except Exception as e:
                print(f"⚠ Blockchain service error: {e}")

        # Update booking as claimed
        update_data = {
            'compensation_claimed': True,
            'claim_method': claim_method,
            'claimed_at': datetime.utcnow(),
            'tx_hash': tx_hash,
            'blockchain_success': blockchain_success
        }
        db.bookings.update_one({'_id': ObjectId(booking_id)}, {'$set': update_data})

        # Update user eth_balance in DB (track off-chain too)
        db.users.update_one(
            {'_id': booking['user_id']},
            {'$inc': {'eth_balance': eth_amount}}
        )

        return jsonify({
            'compensation': serialize_doc(compensation),
            'tx_hash': tx_hash,
            'blockchain_success': blockchain_success,
            'message': f'Compensation of {eth_amount} ETH (~${compensation.get("usd_value", 0)}) processed'
        })

    except Exception as e:
        print(f"Claim error: {e}")
        return jsonify({'error': str(e)}), 500


# ============================================================
# TESTING / ADMIN ROUTES
# ============================================================

@app.route('/api/test/update-delay', methods=['POST'])
def update_flight_delay():
    """TEST ROUTE: Update delay minutes on a booking and recalculate compensation"""
    try:
        print("\n" + "="*80)
        print("🔄 UPDATE DELAY REQUEST RECEIVED")
        print("="*80)
        
        data = request.get_json()
        booking_id = data.get('booking_id')
        delay_minutes = int(data.get('delay_minutes', 0))
        status = data.get('status', 'delayed')

        print(f"📤 Request Data:")
        print(f"   booking_id: {booking_id}")
        print(f"   delay_minutes: {delay_minutes}")
        print(f"   status: {status}")

        if not booking_id:
            print("❌ ERROR: booking_id required")  
            return jsonify({'error': 'booking_id required'}), 400

        try:
            booking = db.bookings.find_one({'_id': ObjectId(booking_id)})
            print(f"✅ Found booking: {booking['flight_number'] if booking else 'NOT FOUND'}")
        except Exception as e:
            print(f"❌ ERROR finding booking: {e}")
            return jsonify({'error': 'Invalid booking_id'}), 400

        if not booking:
            print(f"❌ ERROR: Booking not found for ID {booking_id}")
            return jsonify({'error': 'Booking not found'}), 404

        # Recalculate compensation
        compensation = calculate_compensation(delay_minutes, status)
        print(f"💰 Compensation calculated: {compensation['eth_amount']} ETH (~${compensation['usd_value']})")

        # Update database
        result = db.bookings.update_one(
            {'_id': ObjectId(booking_id)},
            {'$set': {
                'delay_minutes': delay_minutes,
                'status': status,
                'compensation': compensation if compensation['eth_amount'] > 0 else None,
                'compensation_claimed': False  # Reset claim status
            }}
        )
        print(f"📊 Database Update Result:")
        print(f"   Matched: {result.matched_count}")
        print(f"   Modified: {result.modified_count}")

        # Verify update
        updated = db.bookings.find_one({'_id': ObjectId(booking_id)})
        print(f"✅ Verified Update:")
        print(f"   delay_minutes in DB: {updated.get('delay_minutes')}")
        print(f"   status in DB: {updated.get('status')}")
        print(f"   compensation eth_amount: {updated.get('compensation', {}).get('eth_amount', 0) if updated.get('compensation') else 'None'}")
        print("="*80 + "\n")

        return jsonify({
            'booking': serialize_doc(updated),
            'compensation': serialize_doc(compensation),
            'message': f'✅ Delay updated to {delay_minutes} min. Compensation: {compensation["eth_amount"]} ETH (~${compensation["usd_value"]})'
        })

    except Exception as e:
        print(f"❌ ERROR in update_flight_delay: {str(e)}")
        print("="*80 + "\n")
        return jsonify({'error': str(e)}), 500


@app.route('/api/test/all-bookings', methods=['GET'])
def get_all_bookings():
    """TEST ROUTE: Get all bookings with user info"""
    try:
        pipeline = [
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            {'$sort': {'created_at': -1}}
        ]
        bookings = list(db.bookings.aggregate(pipeline))
        return jsonify({'bookings': serialize_doc(bookings)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/test/verify-tx/<tx_hash>', methods=['GET'])
def verify_transaction(tx_hash):
    """TEST ROUTE: Verify a blockchain transaction"""
    try:
        from blockchain.blockchain_service import BlockchainService
        bs = BlockchainService()
        status = bs.get_transaction_status(tx_hash)
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500


@app.route('/api/test/wallet-balance/<address>', methods=['GET'])
def get_wallet_balance(address):
    """TEST ROUTE: Get ETH balance for a wallet and convert to USD"""
    try:
        from blockchain.blockchain_service import BlockchainService
        bs = BlockchainService()
        eth_balance_raw = bs.get_eth_balance(address)
        
        print(f"\n💻 ===== WALLET BALANCE FETCH =====")
        print(f"  Address: {address}")
        print(f"  Raw balance type: {type(eth_balance_raw).__name__}")
        print(f"  Raw balance value: {eth_balance_raw}")
        
        # Ensure eth_balance is a float - handle Decimal, string, or any type
        eth_balance_float = 0.0
        try:
            if isinstance(eth_balance_raw, (int, float)):
                eth_balance_float = float(eth_balance_raw)
            elif isinstance(eth_balance_raw, str):
                eth_balance_float = float(eth_balance_raw)
            else:
                # Try to convert any object to float
                eth_balance_float = float(str(eth_balance_raw))
        except (ValueError, TypeError) as e:
            print(f"  ⚠️ Conversion error: {e}, setting to 0")
            eth_balance_float = 0.0
        
        print(f"  ✅ Converted ETH: {eth_balance_float}")
        
        # Convert ETH to USD - ALWAYS do this calculation
        ETH_USD_RATE = 2000.0
        usd_value = float(eth_balance_float) * float(ETH_USD_RATE)
        
        print(f"  📈 USD Calculation: {eth_balance_float} * {ETH_USD_RATE} = {usd_value}")
        
        # Round values
        eth_rounded = round(float(eth_balance_float), 8)
        usd_rounded = round(float(usd_value), 2)
        
        print(f"  ⛽ Final ETH: {eth_rounded}")
        print(f"  💵 Final USD: ${usd_rounded}")
        
        response_data = {
            'address': address,
            'eth_balance': eth_rounded,
            'usd_value': usd_rounded,
            'network': 'Sepolia'
        }
        
        print(f"  📤 Response: {response_data}")
        print(f"================================\n")
        
        return jsonify(response_data)
    except Exception as e:
        print(f"❌ Error in get_wallet_balance: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'address': address}), 500


@app.route('/api/test/users', methods=['GET'])
def get_all_users():
    """TEST ROUTE: Get all users (without passwords)"""
    try:
        users = list(db.users.find({}, {'password': 0, 'private_key_encrypted': 0}))
        return jsonify({'users': serialize_doc(users)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'time': datetime.utcnow().isoformat()})


if __name__ == '__main__':
    app.run(
        host=os.getenv('API_HOST', '0.0.0.0'),
        port=int(os.getenv('API_PORT', 5000)),
        debug=True,
        use_reloader=False
    )


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)