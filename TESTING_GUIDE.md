# Compensation System - Testing Guide

## ✅ What's Been Implemented

### 1. **Database-Driven CompensatePage** 
The frontend now fetches real flight bookings from the database instead of manual form entry.

**File:** [frontend/src/pages/Compensate/CompensatePageSimple.jsx](frontend/src/pages/Compensate/CompensatePageSimple.jsx)

Features:
- ✅ Fetches user bookings from `/api/bookings/user/<user_id>` on page load
- ✅ Displays bookings in cards with flight details and delay duration
- ✅ Shows calculated compensation amount based on delay
- ✅ Allows selection between token or voucher claim
- ✅ Submits claim to backend via `/api/bookings/compensation/<booking_id>`
- ✅ Proper error handling and loading states

### 2. **Bookings API Backend**
All compensation calculation and claim processing is now in the backend.

**File:** [backend/api/bookings.py](backend/api/bookings.py)

Endpoints:
- `GET /api/bookings/user/<user_id>` - Get user's bookings with calculated compensation
- `POST /api/bookings/create` - Create new booking
- `POST /api/bookings/compensation/<booking_id>` - File compensation claim
- `GET /api/bookings/<booking_id>` - Get single booking

Compensation Rules Implemented:
- Delay ≥ 2 hours: 50 FLY (meals)
- Delay ≥ 3 hours: 75 FLY (meals)
- Delay ≥ 4 hours: 100 FLY (meals/hotel)
- Delay > 24 hours: 300 FLY (hotel + transfers)
- Cancellation ≥ 2 weeks: 0 FLY (refund only)
- Cancellation < 2 weeks: 250 FLY (compensation + refund)

### 3. **Test Data Insertion Script**
Create sample bookings for testing.

**File:** [backend/insert_test_bookings.py](backend/insert_test_bookings.py)

---

## 🚀 Testing the System

### Step 1: Register a User (if not already done)

1. Go to **http://localhost:5176** (Frontend)
2. Click "Register"
3. Enter details:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
4. ✅ Account created with automatic wallet

### Step 2: Insert Test Bookings

From the project root directory, run:

```bash
cd backend
python insert_test_bookings.py
```

This will:
- Find an existing user in the database
- Insert 6 sample flight bookings with different delay scenarios:
  1. **AA1001**: 2-hour delay → 50 FLY
  2. **UA2002**: 3-hour delay → 75 FLY
  3. **DL3003**: 4-hour delay → 100 FLY
  4. **SW4004**: 30-hour delay → 300 FLY
  5. **NW5005**: Cancelled <2 weeks → 250 FLY
  6. **BA6006**: Cancelled ≥2 weeks → 0 FLY

### Step 3: Login and Test Compensation

1. Go to **http://localhost:5176**
2. Click "Login"
3. Enter: test@example.com / password123
4. ✅ Redirected to Dashboard
5. Click on **"Compensate"** in the sidebar
6. ✅ You should see all 6 test bookings displayed

### Step 4: Claim Compensation

1. Click on a booking card (e.g., AA1001 with 2-hour delay)
   - ✅ Card highlights in blue
   - ✅ Shows compensation: 50 FLY
   - ✅ Flight details displayed

2. Choose compensation method:
   - **As FLY Tokens 🪙** - Direct to wallet
   - **As Voucher 🎫** - For immediate use

3. Click **"Claim Compensation"** button

4. ✅ Claim processed:
   - Success message displayed
   - Bookings refresh
   - Database updated

---

## 🔍 Verification Checklist

### Frontend
- [ ] CompensatePage loads without errors
- [ ] User bookings display with flight details
- [ ] Delay duration shown correctly
- [ ] Compensation amount calculated correctly
- [ ] Token/Voucher selection works
- [ ] Claim button submits successfully
- [ ] Loading states display during fetch
- [ ] Error messages show if API fails

### Backend
- [ ] `/api/bookings/user/<user_id>` returns user's bookings
- [ ] Compensation calculated correctly per rules
- [ ] `/api/bookings/compensation/<booking_id>` creates claim
- [ ] Claims stored in MongoDB successfully
- [ ] JWT token validation working

### Database
- [ ] User has wallet address from registration
- [ ] Test bookings inserted in `bookings` collection
- [ ] Claims created in `claims` collection
- [ ] Booking structure matches expected schema

---

## 📊 Database Schema

### Bookings Collection
```json
{
  "_id": ObjectId,
  "user_id": "user_string_id",
  "flight_number": "AA1001",
  "departure_city": "New York",
  "arrival_city": "Los Angeles",
  "departure_time": ISODate,
  "arrival_time": ISODate,
  "delay_minutes": 120,
  "is_cancellation": false,
  "cancellation_notice_days": null,
  "status": "completed",
  "created_at": ISODate,
  "compensation": {
    "type": "meal",
    "fly_amount": 50,
    "description": "Free meals & refreshments (2-3 hour delay)"
  }
}
```

### Claims Collection
```json
{
  "_id": ObjectId,
  "user_id": "user_string_id",
  "user_address": "0x...",
  "booking_id": "booking_string_id",
  "flight_number": "AA1001",
  "delay_minutes": 120,
  "compensation_type": "meal",
  "fly_amount": 50,
  "voucher_type": "meal",
  "claim_method": "tokens",
  "status": "pending",
  "created_at": ISODate
}
```

---

## 🐛 Troubleshooting

### "No flight bookings found"
- [ ] Check if test bookings were inserted
- [ ] Run `insert_test_bookings.py` again
- [ ] Verify user_id matches in database

### API returns 404
- [ ] Check backend logs
- [ ] Verify bookings blueprint registered in app.py
- [ ] Ensure MongoDB connection working

### Frontend shows loading spinner indefinitely
- [ ] Check browser console for fetch errors
- [ ] Verify backend running on http://localhost:5000
- [ ] Check VITE_API_URL env variable

### Compensation amounts not shown
- [ ] Verify bookings include delay_minutes field
- [ ] Check calculate_compensation() function logic
- [ ] Ensure compensation object returned in API response

---

## 📝 Next Steps

1. ✅ **Complete**: Database-driven bookings display
2. ✅ **Complete**: Compensation calculation backend
3. ⏳ **TODO**: Test booking claim with blockchain transfer
4. ⏳ **TODO**: Implement voucher creation service
5. ⏳ **TODO**: Add duplicate claim prevention
6. ⏳ **TODO**: Dashboard wallet balance display
7. ⏳ **TODO**: CSS refinements

---

## 🔧 Key Files Modified

1. [frontend/src/pages/Compensate/CompensatePageSimple.jsx](frontend/src/pages/Compensate/CompensatePageSimple.jsx)
   - Switched from manual form to database-driven bookings

2. [backend/api/bookings.py](backend/api/bookings.py)
   - All compensation calculation and API endpoints

3. [backend/api/app.py](backend/api/app.py)
   - Registered bookings blueprint

4. [backend/insert_test_bookings.py](backend/insert_test_bookings.py)
   - Test data insertion for validation

---

## 💡 Tips

- Test with all 6 sample bookings to verify different compensation amounts
- Check browser DevTools → Network tab to see API calls
- Check MongoDB Compass to verify data insertion
- Review console logs for detailed error messages
