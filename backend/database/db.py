#!/usr/bin/env python3
# backend/database/db.py
"""MongoDB wrapper for application.

Provides a `db` object with convenience access to collections and helper
functions used by the API. Reads `MONGO_URI` from environment or falls back
to a local MongoDB instance.
"""
import os
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from bson.objectid import ObjectId

load_dotenv()


class Database:
    def __init__(self):
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
        db_name = os.getenv('MONGO_DB', 'skyguard')

        self.client = MongoClient(mongo_uri)
        self._db = self.client[db_name]

        # Ensure indexes
        self._db.users.create_index('email', unique=True)

    @property
    def users(self):
        return self._db.users

    def __getattr__(self, name):
        """Allow access to any collection as db.collection_name"""
        if name.startswith('_'):
            raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")
        return self._db[name]

    def find_user_by_email(self, email):
        return self.users.find_one({'email': email})

    def find_user_by_id(self, user_id):
        try:
            return self.users.find_one({'_id': ObjectId(user_id)})
        except Exception:
            return None

    def create_user(self, user_doc):
        user_doc = dict(user_doc)
        user_doc.setdefault('created_at', datetime.utcnow())
        user_doc.setdefault('updated_at', datetime.utcnow())
        try:
            result = self.users.insert_one(user_doc)
            user = self.users.find_one({'_id': result.inserted_id})
            return user
        except DuplicateKeyError:
            return None


# Global database instance
db = Database()

def get_db():
    """Get the global database instance"""
    return db