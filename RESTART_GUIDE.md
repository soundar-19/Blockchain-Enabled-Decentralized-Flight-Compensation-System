# Server Restart Instructions - CORS Fix

## 🔴 Stop Current Servers

**In each terminal, press: `Ctrl+C`** to stop the running processes

```
Terminal 1 (Backend - Python): Press Ctrl+C
Terminal 2 (Frontend - Node): Press Ctrl+C  
Terminal 3 (Any other): Press Ctrl+C
```

Wait for both to fully shut down (should see "^C" in output).

---

## 🟢 Start Fresh - Backend First

### Terminal 1: Backend
```bash
# Make sure you're in the backend folder
cd D:\Blockchain_Enabled_Flight_Compensation_System\backend

# Start the Flask API
python run.py
```

**Expected output:**
```
🚀 SkyGuard DAO Backend - Starting
📍 Running on http://localhost:5000
✓ Debugger is active! Debugger PIN: XXX-XXX-XXX
```

✅ Wait until you see "Running on http://localhost:5000"

---

## 🟢 Start Fresh - Frontend Second

### Terminal 2: Frontend
```bash
# Make sure you're in the frontend folder
cd D:\Blockchain_Enabled_Flight_Compensation_System\frontend

# Clear cache and reinstall (recommended after config changes)
npm install

# Start the development server
npm run dev
```

**Expected output:**
```
VITE vX.X.X  ready in XXX ms

➜  Local:   http://localhost:XXXX/
➜  press h to show help
```

✅ Note the port number (should be 5176 or 5180)

---

## 🧪 Test the Fix

1. **Open the frontend:**
   - Go to the URL shown in terminal (e.g., `http://localhost:5176` or `http://localhost:5180`)

2. **Test Registration:**
   - Click "Create one here" to go to register page
   - Fill in the form (any test email/password)
   - Click "Sign Up"
   
3. **Check Console:**
   - Should see "✅ Registration successful!" message
   - NO CORS errors
   - NO "Failed to fetch" errors

4. **Verify Success:**
   - You should be redirected to Dashboard
   - Welcome message should appear
   - No error dialogs

---

## 🚨 If Still Getting CORS Error

### Quick Checklist:

- [ ] Backend running on `http://localhost:5000` ✅
- [ ] Frontend running on `http://localhost:5XXX` ✅
- [ ] No error messages in backend console ✅
- [ ] Check DevTools Network tab → Registration request
  - Status should be `200` (not `CORS error`)
  - Response should have `Access-Control-Allow-Origin` header

### Troubleshooting Steps:

1. **Check Backend CORS is loaded:**
   ```bash
   # In backend console, should NOT show any import errors
   # Look for these lines:
   # from flask_cors import CORS, cross_origin
   # CORS(app, origins="*", ...)
   ```

2. **Verify Flask-CORS is installed:**
   ```bash
   cd backend
   pip list | grep -i cors
   # Should show: Flask-CORS  4.0.0
   ```

3. **Test API directly via browser:**
   - Open: `http://localhost:5000/api/health`
   - You should see JSON response
   - Look for CORS headers in Response (DevTools → Network tab)

4. **Browser Network Tab Analysis:**
   - Right-click → Inspect → Network tab
   - Try registering
   - Click on the `/api/auth/register` request
   - Check Response Headers section:
     - Should have: `Access-Control-Allow-Origin: *`
     - Should have: `Access-Control-Allow-Methods: GET, POST, ...`

---

## 🔄 Why These Changes Work

| Problem | Old Solution | New Solution |
|---------|--------------|--------------|
| Wrong port | Hardcoded 5176 in config | Flexible port (5176 or next available) |
| Hard API URL | `http://localhost:5000/api` | Relative path `/api` |
| CORS restriction | Whitelist specific origins | Allow all origins `*` |
| CORS headers | May not be sent | Flask-CORS sends automatically |

---

## ✅ What Should Work Now

- ✅ Register with any email/password
- ✅ Automatic wallet creation
- ✅ Redirect to dashboard
- ✅ Already logged in after registration
- ✅ Navigate between pages
- ✅ Logout and login again
- ✅ No CORS errors in console

---

## 📝 Summary of Changes Made

1. **`backend/api/app.py`**
   - CORS now allows all origins: `origins="*"`
   - Explicit method/header configuration
   - Works regardless of frontend port

2. **`frontend/vite.config.js`**
   - `strictPort: false` - Uses next available port if 5176 taken
   - `host: localhost` - Explicit host

3. **API Calls in components**
   - Now use relative URLs: `/api/auth/login`
   - Vite proxy handles routing to backend
   - Works through any port

---

## 🎯 Expected Result

Frontend: `http://localhost:5180` (or any port)  
Backend: `http://localhost:5000`  
API calls: Via Vite proxy → Backend CORS allows it  
✅ **Registration works!**

---

**Let me know if you're still seeing the CORS error after restarting!**
