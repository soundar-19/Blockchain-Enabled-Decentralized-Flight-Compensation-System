# CORS & Routing Fixes - Complete Guide

## 🔧 Issues Fixed

### 1. **CORS Error**: `http://localhost:5000/apiVITE_CHAIN_ID=11155111/auth/login`
**Root Cause**: Environment variables weren't properly configured in frontend

**Solution**: 
- Created `frontend/.env.local` with proper configuration
- Updated `vite.config.js` with explicit API URL definition
- Updated backend CORS configuration to whitelist frontend

### 2. **Navigation Issue**: Can't navigate to register page
**Root Cause**: `onSwitchToRegister` callback was empty `() => {}`

**Solution**:
- Refactored `AppRouter.jsx` to use `useNavigate` hook from React Router
- Wrapped Router content in separate component `AppRouterContent`
- Now properly navigates between `/login` and `/register`

### 3. **Auto-redirect after login/register**
**Solution**: Added `navigate()` calls in success handlers to auto-redirect to `/dashboard`

---

## 📝 Changes Made

### File: `frontend/.env.local` (NEW)
```env
VITE_API_URL=http://localhost:5000/api
VITE_CHAIN_ID=11155111
VITE_CONTRACT_ADDRESS=0xDAf5b99d2268c3f50dACa240c3bF254E2954Feb4
VITE_FLY_TOKEN_ADDRESS=0xd7Ad8368461964e6Fa4F82994948Aec12370dc7C
```

### File: `frontend/vite.config.js` (UPDATED)
- Changed port from `5173` to `5176`
- Added explicit `VITE_API_URL` in define config
- Proper proxy configuration for `/api` routes

### File: `backend/api/app.py` (UPDATED)
```python
# Before: CORS(app) - allows all origins
# After: Explicit whitelist for frontend ports
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5176", "http://localhost:5173", ...],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### File: `frontend/src/AppRouter.jsx` (UPDATED)
Key changes:
1. Created `AppRouterContent` component that uses `useNavigate()` hook
2. Navigation callbacks now properly route:
   - `onSwitchToRegister={() => navigate('/register')}`
   - `onSwitchToLogin={() => navigate('/login')}`
3. Success handlers auto-redirect to `/dashboard`
4. Logout handler redirects to `/login`
5. Wrapped in `AppRouter` component with `<Router>` wrapper

---

## 🚀 How to Test

### Step 1: Stop current servers
```bash
# Close all running terminals
# Ctrl+C on backend and frontend
```

### Step 2: Restart servers
```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### Step 3: Test login flow
1. Open `http://localhost:5176/login`
2. Click "Create one here" → Should navigate to `/register`
3. Fill register form → Submit
4. Should redirect to `/dashboard` automatically
5. Try login/logout cycles

### Step 4: Verify API calls
- Open browser DevTools → Network tab
- Login attempt should show: `POST http://localhost:5000/api/auth/login`
- Status should be `200 OK` (not preflight error)

---

## 🔍 Debugging Tips

### If you still get CORS error:
1. Check backend is running on `http://localhost:5000`
2. Verify frontend is running on `http://localhost:5176`
3. Check `frontend/.env.local` exists with correct URL
4. Inspect Network tab - look for preflight `OPTIONS` request
5. Check if backend console shows errors

### Check environment variables:
```bash
# Frontend
echo %VITE_API_URL%  # Should show or be loaded from .env.local

# Or in browser console:
console.log(import.meta.env.VITE_API_URL)  # Should show http://localhost:5000/api
```

### Test API directly:
```bash
# Test backend is responding
curl http://localhost:5000/api/health

# Should return:
# {
#   "status": "healthy",
#   "service": "SkyGuard DAO Backend",
#   "blockchain": "connected"
# }
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5176
- [ ] `.env.local` file exists in frontend folder
- [ ] Login page loads without errors
- [ ] Can click "Create one here" and navigate to register
- [ ] Can submit registration form
- [ ] No CORS errors in console
- [ ] Auto-redirect to dashboard after login
- [ ] Logout redirects back to login
- [ ] Console shows "✅ Login/Register successful" messages

---

## 📚 Key Files

| File | Purpose | Status |
|------|---------|--------|
| `frontend/.env.local` | Environment variables | ✅ Created |
| `frontend/vite.config.js` | Dev server config | ✅ Updated |
| `frontend/src/AppRouter.jsx` | Navigation routing | ✅ Updated |
| `backend/api/app.py` | CORS configuration | ✅ Updated |

---

## 🎯 Summary

**Before**: 
- CORS blocked all requests
- API URL malformed with `VITE_CHAIN_ID=11155111`
- Can't navigate between login/register
- No auto-redirect after auth

**After**: 
- ✅ CORS properly configured
- ✅ API URL correct: `http://localhost:5000/api`
- ✅ Navigation working between auth pages
- ✅ Auto-redirect to dashboard after success
- ✅ Frontend port: 5176
- ✅ Backend port: 5000

---

## 🐛 If Issues Persist

1. **Clear browser cache:**
   - Ctrl+Shift+Del → Clear browsing data
   - Or use incognito window

2. **Clear node modules (if needed):**
   ```bash
   cd frontend
   rm -r node_modules
   npm install
   npm run dev
   ```

3. **Verify MongoDB is running** (required for backend)

4. **Check for typos** in `.env.local`:
   - Exact URL: `http://localhost:5000/api` (not `5173`)
   - No trailing slashes

5. **Restart npm dev server:**
   - Stop with Ctrl+C
   - Run: `npm run dev` again
   - Vite should show "ready in XXms"

---

**System is ready for testing! 🎉**
