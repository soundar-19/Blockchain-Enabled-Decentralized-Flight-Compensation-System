# backend/services/oracle_service.py
import random
from datetime import datetime, timedelta
from typing import Dict, Optional

class FlightOracle:
    """Simulates flight data oracle for testing"""
    
    def __init__(self):
        self.flight_data = self._generate_dummy_flights()
    
    def _generate_dummy_flights(self) -> Dict:
        """Generate dummy flight data"""
        flights = {}
        flight_numbers = [
            "AA1234", "UA5678", "DL9012", "BA3456", "EK7890",
            "AF2345", "LH6789", "QR1234", "EY5678", "TK9012"
        ]
        
        for flight_num in flight_numbers:
            flights[flight_num] = {
                "flight_number": flight_num,
                "departure_time": (datetime.now() - timedelta(hours=random.randint(1, 48))).isoformat(),
                "arrival_time": (datetime.now() - timedelta(hours=random.randint(0, 24))).isoformat(),
                "delay_minutes": random.randint(0, 180),
                "status": random.choice(["On Time", "Delayed", "Cancelled"]),
                "gate": f"{random.choice(['A', 'B', 'C', 'D'])}{random.randint(1, 50)}",
                "airline": random.choice(["Delta", "United", "American", "Emirates"])
            }
        
        return flights
    
    def get_flight_data(self, flight_number: str) -> Optional[Dict]:
        """Get flight data for a specific flight"""
        if flight_number in self.flight_data:
            return self.flight_data[flight_number]
        
        # Generate random data for unknown flights
        return {
            "flight_number": flight_number,
            "delay_minutes": random.randint(30, 180),
            "status": "Delayed",
            "verified": True
        }
    
    def verify_delay(self, flight_number: str, claimed_delay: int) -> bool:
        """Verify if claimed delay matches oracle data"""
        data = self.get_flight_data(flight_number)
        if not data:
            return False
        
        # Allow 5 minute tolerance
        return abs(data["delay_minutes"] - claimed_delay) <= 5