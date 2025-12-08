# Backend 500 Error - Fix Guide

## Issues Fixed

### 1. **Improved Error Handling in Signup**
- Added input validation
- Better error messages for different error types
- Made email sending non-blocking (signup succeeds even if email fails)
- Added detailed logging

### 2. **Email Configuration Safety**
- Email sending now gracefully fails if credentials not configured
- Won't crash signup process if email service is unavailable
- Added checks for missing EMAIL_ID and EMAIL_PASSWORD

### 3. **CORS Configuration**
- Updated to allow multiple origins including:
  - `voyar.vercel.app`
  - `www.voyareyewear.com`
  - `localhost` (for development)
- Better CORS error logging

### 4. **Request Logging**
- Added timestamp logging for all requests
- Helps diagnose issues in production

## Vercel Deployment - Environment Variables

### Required Environment Variables in Vercel:

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

1. **MONGODB_URI** (Required)
   - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/voyar?retryWrites=true&w=majority`

2. **JWT_SECRET** (Required)
   - A strong random string
   - Example: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **FRONTEND_URL** (Required)
   - Your deployed frontend URL
   - Example: `https://voyar.vercel.app`

4. **EMAIL_ID** (Optional - for verification emails)
   - Your Gmail address
   - Example: `your-email@gmail.com`

5. **EMAIL_PASSWORD** (Optional - for verification emails)
   - Gmail App Password (not regular password)
   - Generate at: https://myaccount.google.com/apppasswords
   - Note: Requires 2FA enabled on Google account

6. **NODE_ENV**
   - Set to: `production`

### Important Notes:

- **Signup will work without email configuration**, users just won't receive verification emails
- You can verify users manually in the database if needed
- EMAIL_ID and EMAIL_PASSWORD are optional - the app won't crash without them

## Testing After Deployment

### 1. Test Health Endpoint
```bash
curl https://backend.voyareyewear.com/api/health
```
Should return: `{"status":"OK","message":"Voyar API is running"}`

### 2. Test Signup
```bash
curl -X POST https://backend.voyareyewear.com/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 3. Check Logs
In Vercel Dashboard → Your Project → Deployments → Click latest deployment → View Function Logs

Look for:
- "MongoDB Connected" - Database is working
- "Server is running on port 5000" - Server started
- Any error messages

## Common Issues & Solutions

### Issue 1: "User already exists"
**Solution:** The email is already registered. Use a different email or login.

### Issue 2: "Server error during registration"
**Cause:** Usually database connection issue
**Solution:** 
1. Check MONGODB_URI in Vercel environment variables
2. Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. Check MongoDB Atlas cluster is running

### Issue 3: Email not sending
**Not a blocker!** Signup will still work.
**To fix:**
1. Add EMAIL_ID and EMAIL_PASSWORD in Vercel
2. Enable 2FA on Google account
3. Generate App Password
4. Use App Password (not regular password)

### Issue 4: CORS errors
**Solution:** Already fixed in server.js - backend now allows voyar.vercel.app

## MongoDB Atlas Configuration

If using MongoDB Atlas:

1. **Whitelist all IPs** (for Vercel serverless functions):
   - Go to Network Access
   - Add IP: `0.0.0.0/0` (Allow access from anywhere)
   - Or specific Vercel IPs if you know them

2. **Check Connection String**:
   - Should include `/voyar` database name
   - Should have correct username/password
   - Should have `retryWrites=true&w=majority`

## Files Modified

- ✅ `backend/controllers/userController.js` - Better error handling
- ✅ `backend/config/email.js` - Safe email sending
- ✅ `backend/server.js` - Fixed CORS, added logging
- ✅ `backend/.env.example` - Documentation for env vars

## Deploy to Vercel

```bash
cd backend
git add .
git commit -m "Fix: Improve error handling and CORS configuration"
git push origin main
```

Vercel will automatically redeploy.
