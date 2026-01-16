# backend/database/db_manager.py
import sqlite3
import json
from typing import List, Dict, Optional
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_path: str = "skyguard.db"):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                address TEXT PRIMARY KEY,
                balance REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                tx_id TEXT PRIMARY KEY,
                sender TEXT,
                recipient TEXT,
                amount REAL,
                tx_type TEXT,
                metadata TEXT,
                timestamp TIMESTAMP,
                block_index INTEGER
            )
        ''')
        
        # Compensations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS compensations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_address TEXT,
                flight_number TEXT,
                delay_minutes INTEGER,
                comp_type TEXT,
                amount REAL,
                status TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Staking table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS staking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_address TEXT,
                route_id INTEGER,
                amount REAL,
                start_date TIMESTAMP,
                status TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_user(self, address: str, initial_balance: float = 5000):
        """Add new user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR IGNORE INTO users (address, balance) VALUES (?, ?)
        ''', (address, initial_balance))
        conn.commit()
        conn.close()
    
    def add_transaction(self, tx_data: Dict):
        """Add transaction to database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO transactions 
            (tx_id, sender, recipient, amount, tx_type, metadata, timestamp, block_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            tx_data['tx_id'],
            tx_data['sender'],
            tx_data['recipient'],
            tx_data['amount'],
            tx_data['tx_type'],
            json.dumps(tx_data.get('metadata', {})),
            tx_data['timestamp'],
            tx_data.get('block_index', 0)
        ))
        conn.commit()
        conn.close()
    
    def get_user_transactions(self, address: str) -> List[Dict]:
        """Get all transactions for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM transactions 
            WHERE sender = ? OR recipient = ?
            ORDER BY timestamp DESC
        ''', (address, address))
        
        transactions = []
        for row in cursor.fetchall():
            transactions.append({
                "tx_id": row[0],
                "sender": row[1],
                "recipient": row[2],
                "amount": row[3],
                "tx_type": row[4],
                "metadata": json.loads(row[5]),
                "timestamp": row[6],
                "block_index": row[7]
            })
        
        conn.close()
        return transactions