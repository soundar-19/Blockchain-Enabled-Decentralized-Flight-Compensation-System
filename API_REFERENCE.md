# API Reference & Troubleshooting

## Complete API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Create a new user account with auto-generated blockchain wallet.

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "65a7b8c9d1e8f9g0h1i2j3k4",
    "name": "John Doe",
    "email": "john@example.com",
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "wallet_created": true
  }
}
```

**Error (409):**
```json
{
  "message": "Email already registered"
}
```

---

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "65a7b8c9d1e8f9g0h1i2j3k4",
    "name": "John Doe",
    "email": "john@example.com",
    "address": "0x...",
    "wallet_created": true
  }
}
```

**Error (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### Booking Endpoints

#### POST /api/bookings/create
Create a new flight booking (saves to MongoDB, auto-calculates compensation).

**Request:**
```json
{
  "user_id": "65a7b8c9d1e8f9g0h1i2j3k4",
  "flight_number": "AA101",
  "airline": "American Airlines",
  "departure_city": "New York",
  "arrival_city": "Los Angeles",
  "scheduled_departure": "2026-02-28T08:00:00",
  "scheduled_arrival": "2026-02-28T11:30:00",
  "seat": "12A",
  "ticket_class": "Economy",
  "status": "completed",
  "delay_minutes": 0
}
```

**Response (201):**
```json
{
  "booking": {
    "_id": "65a7b8c9d1e8f9g0h1i2j3k5",
    "user_id": "65a7b8c9d1e8f9g0h1i2j3k4",
    "flight_number": "AA101",
    "airline": "American Airlines",
    "departure_city": "New York",
    "arrival_city": "Los Angeles",
    "seat": "12A",
    "ticket_class": "Economy",
    "status": "completed",
    "delay_minutes": 0,
    "compensation": null,
    "compensation_claimed": false,
    "created_at": "2026-02-25T10:30:00"
  },
  "message": "Booking created"
}
```

---

#### GET /api/bookings/user/<user_id>
Retrieve all bookings for a user.

**Response (200):**
```json
{
  "bookings": [
    {
      "_id": "65a7b8c9d1e8f9g0h1i2j3k5",
      "flight_number": "AA101",
      "delay_minutes": 120,
      "compensation": {
        "fly_amount": 50,
        "type": "minor_delay",
        "description": "Minor delay (2-3 hours): Refreshments and snacks provided"
      },
      "compensation_claimed": false
    }
  ]
}
```

---

#### POST /api/bookings/compensation/<booking_id>
Claim compensation for a booking (initiates blockchain transfer).

**Request:**
```json
{
  "user_address": "0x1234567890abcdef1234567890abcdef12345678",
  "claim_method": "tokens"
}
```

**Response (200):**
```json
{
  "compensation": {
    "fly_amount": 50,
    "type": "minor_delay",
    "description": "Minor delay (2-3 hours)..."
  },
  "tx_hash": "0xabcd1234efgh5678ijkl9012mnop3456",
  "blockchain_success": true,
  "message": "Compensation of 50 FLY processed"
}
```

**Error (400):**
```json
{
  "error": "Compensation already claimed for this booking"
}
```

---

### Testing/Admin Endpoints

#### POST /api/test/update-delay
Update flight delay and recalculate compensation (for testing).

**Request:**
```json
{
  "booking_id": "65a7b8c9d1e8f9g0h1i2j3k5",
  "delay_minutes": 300,
  "status": "delayed"
}
```

**Response (200):**
```json
{
  "booking": {
    "_id": "65a7b8c9d1e8f9g0h1i2j3k5",
    "delay_minutes": 300,
    "compensation": {
      "fly_amount": 100,
      "type": "standard_delay",
      "description": "Significant delay (3+ hours)..."
    }
  },
  "message": "Delay updated to 300 min. Compensation: 100 FLY"
}
```

---

#### GET /api/test/all-bookings
Get all bookings in the system with user information (debugging).

**Response (200):**
```json
{
  "bookings": [
    {
      "_id": "65a7b8c9d1e8f9g0h1i2j3k5",
      "user_id": "65a7b8c9d1e8f9g0h1i2j3k4",
      "flight_number": "AA101",
      "delay_minutes": 300,
      "compensation_claimed": false,
      "user": [
        {
          "name": "John Doe",
          "email": "john@example.com",
          "address": "0x..."
        }
      ]
    }
  ]
}
```

---

#### GET /api/test/users
Get all users in the system (without passwords).

**Response (200):**
```json
{
  "users": [
    {
      "_id": "65a7b8c9d1e8f9g0h1i2j3k4",
      "name": "John Doe",
      "email": "john@example.com",
      "address": "0x...",
      "wallet_created": true,
      "fly_balance": 50,
      "created_at": "2026-02-25T10:00:00"
    }
  ]
}
```

---

#### GET /api/test/wallet-balance/<address>
Check FLY token and ETH balance for a wallet address.

**Response (200):**
```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "fly_balance": 50,
  "eth_balance": 0.5,
  "network": "Sepolia"
}
```

---

#### GET /api/test/verify-tx/<tx_hash>
Verify a blockchain transaction status.

**Response (200):**
```json
{
  "tx_hash": "0xabcd1234efgh5678ijkl9012mnop3456",
  "status": "confirmed",
  "from": "0x...",
  "to": "0x...",
  "value": "50",
  "gas_used": "21000"
}
```

---

## Common Error Codes

| Code | Error | Solution |
|------|-------|----------|
| 400 | Bad Request | Check request format and required fields |
| 401 | Unauthorized | Login first or check JWT token validity |
| 404 | Not Found | Resource doesn't exist (user/booking/wallet) |
| 409 | Conflict | Email already registered or booking already claimed |
| 500 | Server Error | Check backend logs and MongoDB connection |

---

## Frontend Integration Examples

### React Component - Booking
```javascript
const [loading, setLoading] = useState(false);

const handleBookFlight = async (flightData) => {
  try {
    setLoading(true);
    const response = await fetch('http://localhost:5000/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        user_id: account._id,
        flight_number: flightData.number,
        airline: flightData.airline,
        departure_city: flightData.from,
        arrival_city: flightData.to,
        scheduled_departure: flightData.departTime,
        scheduled_arrival: flightData.arrivalTime,
        seat: selectedSeat,
        ticket_class: flightData.class,
        status: 'completed',
        delay_minutes: 0
      })
    });

    if (!response.ok) throw new Error('Booking failed');
    
    const data = await response.json();
    console.log('Booking saved:', data.booking);
    // Refresh bookings list
    await fetchUserBookings();
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};
```

### React Component - Claim Compensation
```javascript
const handleClaimCompensation = async (bookingId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/bookings/compensation/${bookingId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_address: account.address,
          claim_method: 'tokens'
        })
      }
    );

    const data = await response.json();
    
    if (data.tx_hash) {
      console.log('Transaction:', data.tx_hash);
      console.log('View on Sepolia:', `https://sepolia.etherscan.io/tx/${data.tx_hash}`);
    }
    
  } catch (error) {
    console.error('Claim failed:', error);
  }
};
```

---

## Compensation Calculation Reference

### EU261 Rules Implementation

```python
def calculate_compensation(delay_minutes, status='delayed'):
    """Calculate based on EU261 regulations"""
    
    delay = int(delay_minutes or 0)
    
    # Cancelled flight
    if status == 'cancelled':
        return {'fly_amount': 250, 'type': 'cancellation'}
    
    # Delay-based calculation
    if delay >= 360:      # 6+ hours
        return {'fly_amount': 300, 'type': 'major_delay'}
    elif delay >= 240:    # 4+ hours
        return {'fly_amount': 200, 'type': 'long_delay'}
    elif delay >= 180:    # 3+ hours
        return {'fly_amount': 100, 'type': 'standard_delay'}
    elif delay >= 120:    # 2+ hours
        return {'fly_amount': 50, 'type': 'minor_delay'}
    else:
        return {'fly_amount': 0, 'type': 'no_compensation'}
```

### Compensation Table

| Condition | Compensation | Details |
|-----------|--------------|---------|
| Delay < 2h | 0 FLY | No eligibility |
| Delay 2-3h | 50 FLY | Refreshments |
| Delay 3-4h | 100 FLY | Meals |
| Delay 4-6h | 200 FLY | Hotel + meals |
| Delay 6+h | 300 FLY | Hotel + refund |
| Cancelled | 250 FLY | <2 weeks notice |

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  address: String (wallet address),
  private_key_encrypted: String,
  wallet_created: Boolean,
  fly_balance: Number,
  created_at: Date,
  updated_at: Date
}

// Indexes:
// { email: 1 } - unique
```

### Bookings Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users),
  flight_number: String,
  airline: String,
  departure_city: String,
  arrival_city: String,
  scheduled_departure: Date,
  scheduled_arrival: Date,
  seat: String,
  ticket_class: String,
  status: String ('scheduled', 'completed', 'cancelled'),
  delay_minutes: Number,
  compensation: {
    fly_amount: Number,
    type: String,
    description: String
  },
  compensation_claimed: Boolean,
  claim_method: String ('tokens', 'voucher'),
  tx_hash: String,
  blockchain_success: Boolean,
  created_at: Date,
  claimed_at: Date
}

// Indexes:
// { user_id: 1 }
// { flight_number: 1 }
// { compensation_claimed: 1 }
```

---

## Deployment Checklist

- [ ] MongoDB production instance configured
- [ ] Environment variables set for production
- [ ] Backend deployed (Flask with Gunicorn)
- [ ] Frontend built (npm run build)
- [ ] CORS configured for production domain
- [ ] HTTPS enabled
- [ ] Blockchain network configured (mainnet)
- [ ] Smart contracts deployed
- [ ] Monitoring setup (logs, errors)
- [ ] Backup strategy for MongoDB

---

## Support Resources

- MongoDB: https://docs.mongodb.com/
- Flask: https://flask.palletsprojects.com/
- PyJWT: https://pyjwt.readthedocs.io/
- Blockchain Sepolia: https://sepolia.etherscan.io/
- EU261 Official: https://ec.europa.eu/transport/themes/passengers/air_en
