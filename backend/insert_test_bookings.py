#!/usr/bin/env python3
"""Insert test bookings into MongoDB for testing compensation claims"""

from datetime import datetime, timedelta
from bson import ObjectId
from database.db import get_db

def insert_test_bookings():
    """Insert test flight bookings with various delay durations"""
    
    db = get_db()
    
    # Sample user IDs (you'll need to update these with actual user IDs from your database)
    # Get an existing user
    users_collection = db['users']
    existing_user = users_collection.find_one()
    
    if not existing_user:
        print("❌ No users found in database. Please register a user first.")
        return False
    
    user_id = existing_user['_id']
    print(f"✓ Using user: {existing_user.get('email', 'Unknown')} (ID: {user_id})")
    
    # Sample bookings with different delay scenarios
    bookings = [
        {
            'user_id': user_id,
            'flight_number': 'AA1001',
            'departure_city': 'New York',
            'arrival_city': 'Los Angeles',
            'departure_time': datetime.now() - timedelta(days=2),
            'arrival_time': datetime.now() - timedelta(days=2, hours=5),
            'delay_minutes': 120,  # 2 hours - Should get 50 FLY
            'is_cancellation': False,
            'cancellation_notice_days': None,
            'status': 'completed',
            'created_at': datetime.now(),
            'compensation': {
                'type': 'meal',
                'fly_amount': 50,
                'description': 'Free meals & refreshments (2-3 hour delay)'
            }
        },
        {
            'user_id': user_id,
            'flight_number': 'UA2002',
            'departure_city': 'Los Angeles',
            'arrival_city': 'Chicago',
            'departure_time': datetime.now() - timedelta(days=5),
            'arrival_time': datetime.now() - timedelta(days=5, hours=5),
            'delay_minutes': 180,  # 3 hours - Should get 75 FLY
            'is_cancellation': False,
            'cancellation_notice_days': None,
            'status': 'completed',
            'created_at': datetime.now(),
            'compensation': {
                'type': 'meal',
                'fly_amount': 75,
                'description': 'Free meals & refreshments (3 hour delay)'
            }
        },
        {
            'user_id': user_id,
            'flight_number': 'DL3003',
            'departure_city': 'Chicago',
            'arrival_city': 'Miami',
            'departure_time': datetime.now() - timedelta(days=7),
            'arrival_time': datetime.now() - timedelta(days=7, hours=6),
            'delay_minutes': 240,  # 4 hours - Should get 100 FLY
            'is_cancellation': False,
            'cancellation_notice_days': None,
            'status': 'completed',
            'created_at': datetime.now(),
            'compensation': {
                'type': 'hotel',
                'fly_amount': 100,
                'description': 'Hotel accommodation & ground transport (4+ hour delay)'
            }
        },
        {
            'user_id': user_id,
            'flight_number': 'SW4004',
            'departure_city': 'Miami',
            'arrival_city': 'Denver',
            'departure_time': datetime.now() - timedelta(days=10),
            'arrival_time': datetime.now() - timedelta(days=10, hours=30),
            'delay_minutes': 1800,  # 30 hours - Should get 300 FLY
            'is_cancellation': False,
            'cancellation_notice_days': None,
            'status': 'completed',
            'created_at': datetime.now(),
            'compensation': {
                'type': 'hotel',
                'fly_amount': 300,
                'description': 'Hotel accommodation & transfers (>24 hour delay)'
            }
        },
        {
            'user_id': user_id,
            'flight_number': 'NW5005',
            'departure_city': 'Denver',
            'arrival_city': 'Seattle',
            'departure_time': datetime.now() + timedelta(days=3),
            'arrival_time': datetime.now() + timedelta(days=3, hours=3),
            'delay_minutes': 0,
            'is_cancellation': True,
            'cancellation_notice_days': 1,  # Cancelled 1 day before - Should get 250 FLY
            'status': 'cancelled',
            'created_at': datetime.now(),
            'compensation': {
                'type': 'refund',
                'fly_amount': 250,
                'description': 'Refund + compensation (Cancelled <2 weeks notice)'
            }
        },
        {
            'user_id': user_id,
            'flight_number': 'BA6006',
            'departure_city': 'Seattle',
            'arrival_city': 'Boston',
            'departure_time': datetime.now() + timedelta(days=20),
            'arrival_time': datetime.now() + timedelta(days=20, hours=5),
            'delay_minutes': 0,
            'is_cancellation': True,
            'cancellation_notice_days': 21,  # Cancelled 21 days before - Should get 0 FLY
            'status': 'cancelled',
            'created_at': datetime.now(),
            'compensation': {
                'type': 'refund',
                'fly_amount': 0,
                'description': 'Refund only (Cancelled ≥2 weeks notice)'
            }
        }
    ]
    
    # Insert bookings
    bookings_collection = db['bookings']
    result = bookings_collection.insert_many(bookings)
    
    print("\n✅ Test bookings inserted successfully!")
    print(f"   Total bookings: {len(result.inserted_ids)}\n")
    
    # Display inserted bookings
    for i, booking in enumerate(bookings, 1):
        print(f"{i}. Flight {booking['flight_number']}")
        print(f"   Route: {booking['departure_city']} → {booking['arrival_city']}")
        print(f"   Delay: {booking['delay_minutes']} min | Compensation: {booking['compensation']['fly_amount']} FLY")
        print(f"   Description: {booking['compensation']['description']}\n")
    
    return True

if __name__ == '__main__':
    try:
        insert_test_bookings()
        print("✓ All test data inserted successfully!")
    except Exception as e:
        print(f"❌ Error inserting test data: {e}")
        import traceback
        traceback.print_exc()
