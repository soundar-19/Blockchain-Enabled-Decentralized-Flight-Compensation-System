#!/usr/bin/env python3
# backend/api/app.py
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
import os
from dotenv import load_dotenv

load_dotenv()

# Create Flask app
app = Flask(__name__)

# Configure CORS - Allow all origins with credentials
CORS(app, 
     origins="*",
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key')
app.config['DEBUG'] = os.getenv('DEBUG', True)

# Import blueprints
from .auth import auth_bp
from .blockchain_routes import blockchain_bp
from .bookings import bookings_bp

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(blockchain_bp)
app.register_blueprint(bookings_bp)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        from ..blockchain.web3_config import BlockchainConfig
        w3 = BlockchainConfig.get_web3_instance()
        blockchain_status = "connected"
    except:
        blockchain_status = "disconnected"
    
    return jsonify({
        "status": "healthy",
        "service": "SkyGuard DAO Backend",
        "version": "1.0.0",
        "blockchain": blockchain_status,
        "network": "Sepolia"
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Server error"}), 500

if __name__ == '__main__':
    app.run(
        host=os.getenv('API_HOST', '0.0.0.0'),
        port=int(os.getenv('API_PORT', 5000)),
        debug=True
    )
