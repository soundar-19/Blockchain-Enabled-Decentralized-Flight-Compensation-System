import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    
    # Blockchain
    BLOCK_TIME = 10  # seconds
    MIN_STAKE = 50
    TRANSACTION_FEE = 0.01
    
    # Database
    DATABASE_PATH = os.getenv('DATABASE_PATH', 'skyguard.db')
    
    # API
    API_HOST = os.getenv('API_HOST', '0.0.0.0')
    API_PORT = int(os.getenv('API_PORT', 5000))
    
    # Smart Contracts
    STAKING_REWARD_RATE = 0.12  # 12% APY
    LOYALTY_EXCHANGE_RATE = 0.85
    LOYALTY_FEE = 0.02
    VOTING_PERIOD_DAYS = 3
    
    # Compensation Rates (in FLY tokens)
    COMPENSATION_RATES = {
        "food": 25,
        "hotel": 150,
        "refund": 200,
        "transport": 50
    }
    
    # Oracle
    ORACLE_UPDATE_INTERVAL = 300  # 5 minutes
    FLIGHT_API_KEY = os.getenv('FLIGHT_API_KEY', '')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
