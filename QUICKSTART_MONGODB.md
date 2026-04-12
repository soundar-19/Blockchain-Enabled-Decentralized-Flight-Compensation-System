# MongoDB Integration - Quick Start Guide

## What Changed?

Your project now uses **MongoDB** as the primary database instead of mock data. All user bookings, compensation claims, and user accounts are persisted in MongoDB.

## Architecture Overview

```
Frontend (React)
    ↓
[authService] ← JWT Authentication
    ↓
Backend (Flask/Python)
    ↓
[MongoDB] ← Persistent Storage
    ↓
[Blockchain] ← Token Transfers (Sepolia)
```

## Step 1: Setup MongoDB

### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# Windows: Download from mongodb.com/try/download/community

# Start MongoDB daemon
mongod

# Verify connection
mongo  # or mongosh
> use flight
> db.users.count()
```

### Option B: MongoDB Atlas (Cloud)
```bash
# Create account at mongodb.com
# Create cluster
# Get connection string
# Set in .env:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

## Step 2: Environment Setup

Create `.env` in project root:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DB=flight

# JWT & Security
JWT_SECRET=skyguard-jwt-secret-2026
SECRET_KEY=skyguard-secret-key

# Frontend API
VITE_API_URL=http://localhost:5000/api
```

## Step 3: Start the Application

### Terminal 1 - Backend
```bash
cd backend
pip install -r requirements.txt  # if needed
python app.py
```
✓ Backend runs at `http://localhost:5000`

### Terminal 2 - Frontend
```bash
cd frontend
npm install  # if needed
npm run dev
```
✓ Frontend runs at `http://localhost:5173` (or http://localhost:5174)

## Step 4: Test the Integration

### 1. Register New User
1. Go to `http://localhost:5173` → Click "Register"
2. Fill in details (Name, Email, Password)
3. Click "Register"
4. ✓ User created in MongoDB `users` collection
5. ✓ Wallet auto-generated
6. Redirected to Dashboard

### 2. Book a Flight
1. Navigate to "Booking" page
2. Select a flight
3. Enter seat number (e.g., "12A")
4. Click "Book This Flight"
5. ✓ Booking saved to MongoDB `bookings` collection
6. ✓ Compensation auto-calculated based on delay
7. Booking appears under "Your Bookings"

### 3. View Booking in Database
Open MongoDB shell:
```bash
use flight
db.bookings.findOne()
```

Expected output:
```json
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "flight_number": "AA101",
  "airline": "American Airlines",
  "delay_minutes": 0,
  "compensation": {
    "fly_amount": 0,
    "type": "no_compensation"
  }
}
```

### 4. Modify Delay (Testing)
1. Go to "Testing" page
2. All bookings fetched from database
3. Click "Edit" on a booking
4. Change delay to 120+ minutes
5. Click "Save"
6. ✓ Delay updated in MongoDB
7. ✓ Compensation recalculated
8. Booking refreshed with new values

### 5. Claim Compensation
1. Go to "Compensate" page
2. Select booking with available compensation
3. Choose "FLY Tokens" or "Voucher"
4. Click "Claim"
5. ✓ Blockchain transaction attempted
6. ✓ Booking marked as `compensation_claimed: true`
7. ✓ User's `fly_balance` increased

## API Endpoints (Quick Reference)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Create user + wallet |
| POST | `/api/auth/login` | Login user |
| POST | `/api/bookings/create` | Create booking |
| GET | `/api/bookings/user/<id>` | Get user bookings |
| POST | `/api/bookings/compensation/<id>` | Claim compensation |
| POST | `/api/test/update-delay` | Update delay (test) |
| GET | `/api/test/all-bookings` | All bookings (test) |
| GET | `/api/test/users` | All users (test) |
| GET | `/api/test/wallet-balance/<addr>` | Check balance |

## Key Database Collections

### users
```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  address: "0x...",
  wallet_created: true,
  fly_balance: 0,
  created_at: ISODate
}
```

### bookings
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  flight_number: "AA101",
  delay_minutes: 120,
  compensation: {
    fly_amount: 50,
    type: "minor_delay",
    description: "Minor delay (2-3 hours)..."
  },
  compensation_claimed: false,
  created_at: ISODate
}
```

## Data Flow Examples

### Example 1: User Registration
```
Frontend: POST /api/auth/register
  └─ name: "Alice", email: "alice@test.com", password: "****"

Backend: 
  └─ Hash password with bcrypt
  └─ Generate wallet address
  └─ Create user doc
  └─ db.users.insertOne(user_doc)
  └─ Generate JWT token

Frontend:
  └─ Store token in localStorage
  └─ Store user in localStorage
  └─ Normalize user object (_id = id)
  └─ Redirect to /dashboard
```

### Example 2: Book Flight
```
Frontend: POST /api/bookings/create
  └─ user_id: "65a7b8c9...", flight: "AA101", delay: 0

Backend:
  └─ Verify user exists
  └─ Calculate compensation(0 mins) → 0 FLY
  └─ Create booking doc
  └─ db.bookings.insertOne(booking_doc)
  └─ Return booking with ID

Frontend:
  └─ Fetch updated bookings
  └─ Display in "Your Bookings"
```

### Example 3: Update Delay (for testing)
```
Frontend: POST /api/test/update-delay
  └─ booking_id: "65a7b8c9...", delay_minutes: 120

Backend:
  └─ db.bookings.updateOne({_id}, {delay_minutes: 120})
  └─ Calculate compensation(120) → 50 FLY
  └─ Update booking compensation
  └─ Reset compensation_claimed = false
  └─ Return updated booking

Frontend:
  └─ Show success message
  └─ Refresh booking display
  └─ User sees new compensation amount
```

## Troubleshooting

### MongoDB Not Running
```
Error: MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017

Solution:
1. Check MongoDB is installed and started
2. Run: mongod --dbpath ~/data/db
3. Or verify connection string in .env
```

### User Not Found
```
Error: User not found (when booking)

Solution:
1. Login first to create user account
2. Check email is correct
3. Clear localStorage and login again
```

### Bookings Not Showing
```
Problem: Booked flights but not showing in list

Solution:
1. Check MongoDB is running: use flight; db.bookings.count()
2. Check user_id matches in URL
3. Try refreshing the page
4. Check browser console for errors
```

### Compensation Not Calculating
```
Problem: Booking shows 0 FLY even with delay > 120 mins

Solution:
1. Verify delay_minutes is integer (not string)
2. Ensure delay >= 120 for compensation
3. Check calculation logic in app.py
```

### JWT Token Invalid
```
Error: Invalid token or no token provided

Solution:
1. Clear localStorage: localStorage.clear()
2. Login again
3. Check JWT_SECRET in .env matches backend
```

## Verification Checklist

- [ ] MongoDB running (locally or cloud)
- [ ] `.env` file configured
- [ ] Backend starting on :5000
- [ ] Frontend starting on :5173/5174
- [ ] Can register new user
- [ ] User stored in MongoDB
- [ ] Can book flight
- [ ] Booking stored in MongoDB
- [ ] Can modify delay in Testing page
- [ ] Compensation updates correctly
- [ ] Can claim compensation (or see error if blockchain not set up)

## Next Steps

1. ✅ **Basic Setup** - MongoDB + Flask + React running
2. 🔄 **Test Workflow** - Register → Book → Claim
3. 🔧 **Blockchain** - Configure wallet/contract for real transfers
4. 📊 **Admin Dashboard** - Monitor all bookings/users
5. 🚀 **Deployment** - Docker + production database

## Support

- Check logs in terminal for errors
- Verify endpoints with Postman
- Use browser DevTools Network tab
- Check MongoDB directly for data

```bash
# Terminal test
curl http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/bookings/user/65a7b8c9d1e8f9g0h1i2j3k4

# MongoDB test
mongo
> use flight
> db.users.find()
> db.bookings.find()
```

---

**Your system is now fully integrated with MongoDB!** 🎉

All bookings, users, and compensation claims are now permanently stored in the database. Users can't lose their data, and compensation calculations are consistent across sessions.
