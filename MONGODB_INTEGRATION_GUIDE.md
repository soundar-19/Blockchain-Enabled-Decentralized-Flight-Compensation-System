# MongoDB Integration Guide

## Overview
Your project now has complete MongoDB integration with the new `app.py` backend. All user bookings and compensation claims are stored in MongoDB.

## Architecture

### Database Collections

#### 1. `users` Collection
```json
{
  "_id": ObjectId,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "address": "0x...",
  "private_key_encrypted": "0x...",
  "wallet_created": true,
  "fly_balance": 0,
  "created_at": ISODate
}
```

#### 2. `bookings` Collection
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "flight_number": "AA101",
  "airline": "American Airlines",
  "departure_city": "NYC",
  "arrival_city": "LAX",
  "scheduled_departure": "2026-02-28T08:00:00",
  "scheduled_arrival": "2026-02-28T11:30:00",
  "seat": "12A",
  "ticket_class": "Economy",
  "status": "completed",
  "delay_minutes": 120,
  "compensation": {
    "fly_amount": 50,
    "description": "Minor delay (2-3 hours)...",
    "type": "minor_delay"
  },
  "compensation_claimed": false,
  "created_at": ISODate
}
```

#### 3. `claims` Collection (Future)
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "booking_id": ObjectId,
  "user_address": "0x...",
  "fly_amount": 50,
  "status": "pending|completed",
  "tx_hash": "0x...",
  "claimed_at": ISODate
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user with auto-generated wallet
- `POST /api/auth/login` - Login and receive JWT token

### Bookings
- `POST /api/bookings/create` - Create booking (auto-calculates compensation)
- `GET /api/bookings/user/<user_id>` - Get user's bookings
- `POST /api/bookings/compensation/<booking_id>` - Claim compensation (blockchain transfer)

### Testing (Admin)
- `POST /api/test/update-delay` - Update booking delay (for testing)
- `GET /api/test/all-bookings` - Get all bookings with user info
- `GET /api/test/users` - Get all users
- `GET /api/test/wallet-balance/<address>` - Check wallet balance
- `GET /api/test/verify-tx/<tx_hash>` - Verify blockchain transaction

## Compensation Calculation (EU261 Rules)

| Delay | Compensation | Description |
|-------|--------------|-------------|
| < 2 hours | 0 FLY | No compensation |
| 2-3 hours | 50 FLY | Refreshments |
| 3-4 hours | 100 FLY | Meals |
| 4-6 hours | 200 FLY | Hotel + meals |
| 6+ hours | 300 FLY | Full hotel + refund |
| Cancelled | 250 FLY | Full compensation |

## Frontend Components Integration

### 1. BookingPageSimple.jsx
- ✅ Fetches user bookings from MongoDB
- ✅ Creates bookings and saves to MongoDB
- ✅ Displays bookings with compensation info
- Uses field: `account._id` or `account.id`

### 2. CompensatePageSimple.jsx
- ✅ Shows claimable bookings from database
- ✅ Processes compensation claims
- ✅ Handles blockchain transfers
- Shows already claimed bookings

### 3. TestingPage.jsx
- ✅ Admin testing interface
- ✅ All bookings view
- ✅ Update delay for testing
- ✅ Transaction verification
- ✅ Wallet balance checking

## Data Flow

```
User Registration
    ↓
[app.py] Creates user + wallet
    ↓
Store in MongoDB `users` collection
    ↓
Return user object with id, address, wallet_created

User Books Flight
    ↓
[BookingPageSimple] Submits flight + seat
    ↓
[app.py] POST /api/bookings/create
    ↓
Calculate compensation (EU261)
    ↓
Store in MongoDB `bookings` collection
    ↓
Return booking with compensation

User Claims Compensation
    ↓
[CompensatePageSimple] Selects booking + address
    ↓
[app.py] POST /api/bookings/compensation/<booking_id>
    ↓
Attempt blockchain transfer
    ↓
Update booking: compensation_claimed = true
    ↓
Update user: fly_balance += compensation
    ↓
Return tx_hash (if successful)
```

## Setup Requirements

### Environment Variables (.env)
```
MONGO_URI=mongodb://localhost:27017
MONGO_DB=flight
JWT_SECRET=skyguard-jwt-secret-2026
SECRET_KEY=skyguard-secret-key
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend**
   ```bash
   cd backend
   python app.py
   ```
   Backend runs on `http://localhost:5000`

3. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## Testing Workflow

### 1. Register & Login
- Go to `/login` → Switch to `/register`
- Register new user
- Wallet auto-created (or mocked)
- JWT token stored in localStorage

### 2. Book Flight
- Navigate to `/booking`
- Select flight + seat
- Click "Book This Flight"
- Booking saved to MongoDB

### 3. Edit Delay (Testing)
- Go to `/testing` (admin page)
- Click "Update Delay" on any booking
- Change delay_minutes
- Compensation recalculates automatically
- Changes saved to MongoDB

### 4. Claim Compensation
- Go to `/compensate`
- Select booking with available compensation
- Choose "FLY Tokens" or "Voucher"
- Click "Claim"
- Blockchain transfer attempted
- Booking marked as claimed

## Key Features

✅ **Full MongoDB Integration**
- All data persisted in database
- No in-memory state loss
- Real-time sync with backend

✅ **EU261 Compliance**
- Automatic compensation calculation
- Based on flight delay/cancellation
- Configurable thresholds

✅ **Blockchain Ready**
- Token transfers on Sepolia testnet
- Fallback to off-chain if needed
- Transaction verification

✅ **Admin Testing**
- Modify delays for testing
- View all bookings network-wide
- Check wallet balances
- Verify transactions

## Common Issues & Solutions

### 1. MongoDB Connection Failed
**Error**: `MongoServerSelectionError`
**Solution**: Ensure MongoDB is running
```bash
mongod --dbpath ~/data/db
```

### 2. User Data Not Persisting
**Issue**: Bookings created but not showing in database
**Solution**: Check MongoDB is actually running and storing data
```javascript
// In browser console
const response = await fetch('http://localhost:5000/api/test/all-bookings');
const data = await response.json();
console.log(data);
```

### 3. Compensation Not Calculating
**Issue**: Booking has null compensation
**Solution**: Ensure delay_minutes is set and > 120
```python
# Check calculation
delay_minutes = 120  # Should give 50 FLY
```

### 4. Can't Find User ID in Frontend
**Issue**: `account` object doesn't have `_id` or `id`
**Solution**: AuthService returns `id` field
```javascript
// Both work:
account.id      // From new app.py
account._id     // From old system
```

## Next Steps

1. **Configure .env** with correct MongoDB URI
2. **Test End-to-End** using testing workflow above
3. **Monitor Blockchain** transfers on Sepolia
4. **Scale Database** indices as needed
5. **Implement Notifications** for claim status

## Support Resources

- MongoDB Docs: https://docs.mongodb.com/
- Flask-CORS: https://flask-cors.readthedocs.io/
- PyJWT: https://pyjwt.readthedocs.io/
- EU261 Rules: https://ec.europa.eu/transport/themes/passengers/air_en
