#!/usr/bin/env python3
# backend/api/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
from datetime import datetime, timedelta
from database.db import db
from bson.objectid import ObjectId
from blockchain.wallet_manager import WalletManager

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key')
wallet_manager = WalletManager()


def create_token(user_id, email):
    """Create JWT token"""
    payload = {
        'user_id': str(user_id),
        'email': email,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user with automatic wallet creation"""
    try:
        data = request.get_json()

        if not data or not data.get('fullName') or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if user exists
        existing_user = db.find_user_by_email(data['email'])
        if existing_user:
            return jsonify({"error": "Email already exists"}), 400

        password_hash = generate_password_hash(data['password'])

        # Create wallet for the user
        wallet = wallet_manager.create_wallet()
        if not wallet or 'address' not in wallet:
            return jsonify({"error": "Failed to create wallet"}), 500

        user_doc = {
            'name': data['fullName'],
            'email': data['email'],
            'password_hash': password_hash,
            'address': wallet['address'],  # Real wallet address
            'wallet_created_at': datetime.utcnow(),
            'fly_balance': 0.0,
        }

        created = db.create_user(user_doc)
        if not created:
            return jsonify({"error": "Could not create user"}), 500

        # Also store wallet in wallets collection for tracking
        wallet_record = {
            'user_id': str(created['_id']),
            'address': wallet['address'],
            'created_at': datetime.utcnow(),
            'source': 'registration'
        }
        db.wallets.insert_one(wallet_record)

        token = create_token(created['_id'], created['email'])

        return jsonify({
            "message": "User registered successfully with wallet",
            "token": token,
            "user": {
                "id": str(created['_id']),
                "name": created['name'],
                "email": created['email'],
                "address": wallet['address'],
                "wallet_created": True
            }
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user (MongoDB)"""
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password required"}), 400

        user = db.find_user_by_email(data['email'])
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        if not check_password_hash(user.get('password_hash', ''), data['password']):
            return jsonify({"error": "Invalid email or password"}), 401

        token = create_token(user['_id'], user['email'])

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user['_id']),
                "name": user.get('name'),
                "email": user.get('email'),
                "address": user.get('address'),  # Return wallet address
                "fly_balance": float(user.get('fly_balance', 0)),
                "wallet_created": True if user.get('address') else False
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/connect-wallet', methods=['POST'])
def connect_wallet():
    """Connect MetaMask wallet to user account"""
    try:
        data = request.get_json()
        
        if not data or not data.get('user_id') or not data.get('wallet_address'):
            return jsonify({"error": "user_id and wallet_address required"}), 400

        user_id = data['user_id']
        wallet_address = data['wallet_address']
        
        # Validate Ethereum address format
        if not wallet_manager.validate_address(wallet_address):
            return jsonify({"error": "Invalid Ethereum address format"}), 400
        
        try:
            user_id_obj = ObjectId(user_id)
        except:
            return jsonify({"error": "Invalid user_id"}), 400
        
        # Find user
        user = db.find_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Update user's MetaMask wallet address
        update_result = db.users.update_one(
            {'_id': user_id_obj},
            {
                '$set': {
                    'metamask_address': wallet_address,
                    'metamask_connected_at': datetime.utcnow()
                }
            }
        )
        
        if update_result.modified_count == 0:
            return jsonify({"error": "Failed to update wallet"}), 500
        
        # Log wallet connection
        wallet_connection = {
            'user_id': user_id,
            'metamask_address': wallet_address,
            'connected_at': datetime.utcnow(),
            'source': 'metamask_extension'
        }
        db.wallet_connections.insert_one(wallet_connection)
        
        # Get updated user
        updated_user = db.find_user_by_id(user_id)
        
        return jsonify({
            "message": "MetaMask wallet connected successfully",
            "user": {
                "id": str(updated_user['_id']),
                "name": updated_user.get('name'),
                "email": updated_user.get('email'),
                "address": updated_user.get('address'),  # Backend-generated wallet
                "metamask_address": updated_user.get('metamask_address'),  # User's MetaMask wallet
                "fly_balance": float(updated_user.get('fly_balance', 0))
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """Verify JWT token and return user info"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({"error": "Token required"}), 401

        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = db.find_user_by_id(payload['user_id'])
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "user": {
                "id": str(user['_id']),
                "name": user.get('name'),
                "email": user.get('email'),
                "address": user.get('address'),
                "metamask_address": user.get('metamask_address'),
                "fly_balance": float(user.get('fly_balance', 0))
            }
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
