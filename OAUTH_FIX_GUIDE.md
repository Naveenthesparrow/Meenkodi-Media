# Google OAuth "Missing Scope" Error - Fix Guide

## Problem
Error: `Access blocked: Authorization Error - Missing required parameter: scope`

## Root Cause
The Google OAuth redirect URI configuration in your Google Cloud Console was incomplete for the production domain.

---

## ✅ Solution - Complete Checklist

### 1. Update Google Cloud Console (CRITICAL)

**Go to:** [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials

**Find:** Your "Meenkodi" OAuth 2.0 Client

**Update Authorized redirect URIs to:**

```
URIs 1: http://localhost:5000/auth/google/callback
URIs 2: https://meenkodi-media.onrender.com/auth/google/callback  
URIs 3: https://www.meenkodi.com/auth/google/callback
```

**⚠️ IMPORTANT:** Your current URI 3 is missing `/auth/google/callback` - add it!

**Save Changes** in Google Cloud Console

---

### 2. Verify Environment Variables

Make sure your server has these environment variables set:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
BACKEND_URL=https://meenkodi-media.onrender.com
CLIENT_URL=https://www.meenkodi.com
SESSION_SECRET=your_secure_random_string
MONGO_URI=your_mongodb_connection_string
```

**For Render.com deployment:**
- Go to your Render dashboard
- Select your backend service
- Go to "Environment" tab
- Verify all variables are set correctly
- Make sure `BACKEND_URL` matches one of your authorized redirect URIs

---

### 3. Code Changes Applied

The following improvements have been made to [server/index.js](server/index.js):

✅ Added explicit scope configuration to GoogleStrategy  
✅ Added logging to OAuth flow for debugging  
✅ Added `accessType` and `prompt` parameters for better OAuth handling  
✅ Created `/auth/config-check` endpoint to verify configuration  

---

### 4. Testing Steps

#### Test Configuration Endpoint
Visit: `https://meenkodi-media.onrender.com/auth/config-check`

This should return:
```json
{
  "hasClientID": true,
  "hasClientSecret": true,
  "backendURL": "https://meenkodi-media.onrender.com",
  "clientURL": "https://www.meenkodi.com",
  "callbackURL": "https://meenkodi-media.onrender.com/auth/google/callback",
  "environment": "production"
}
```

#### Test OAuth Flow
1. Clear your browser cache and cookies
2. Go to your website: https://www.meenkodi.com
3. Click "Login" or sign-in button
4. You should be redirected to Google's consent screen
5. After selecting your Google account, you should be redirected back successfully

---

### 5. Common Issues & Solutions

#### Issue: Still getting scope error
**Solution:** 
- Double-check the redirect URI in Google Console matches EXACTLY
- Wait 5-10 minutes after saving changes in Google Console (changes can take time to propagate)
- Clear browser cache and try again

#### Issue: Redirect URI mismatch
**Solution:**
- The redirect URI in Google Console must match: `${BACKEND_URL}/auth/google/callback`
- Check your `BACKEND_URL` environment variable
- Ensure no trailing slashes

#### Issue: Session not persisting
**Solution:**
- Check `SESSION_SECRET` is set
- Verify cookie settings in production (secure, sameSite)
- Check CORS configuration allows credentials

---

### 6. Deployment Steps

After making these changes:

```bash
# If testing locally
cd server
npm install
npm start

# For production (Render.com)
# Simply push to your connected Git repository
git add .
git commit -m "Fix OAuth scope configuration"
git push origin main
```

Render will automatically deploy the changes.

---

### 7. Monitoring & Logs

**Check Render Logs:**
1. Go to Render dashboard
2. Select your backend service
3. Click "Logs" tab
4. Look for these messages:
   - "Initiating Google OAuth flow..."
   - "Google Strategy callback - Profile: [id]"
   - "OAuth callback success, redirecting to client..."

**If you see errors:**
- "Google Strategy error:" - Check your Google credentials
- "CORS blocked origin:" - Add the origin to allowed origins
- "Session ID: undefined" - Check session configuration

---

### 8. Security Checklist

✅ Never commit `.env` files to Git  
✅ Use strong `SESSION_SECRET` (generate with: `openssl rand -base64 32`)  
✅ Keep `GOOGLE_CLIENT_SECRET` secure  
✅ Use HTTPS in production (`secure: true` for cookies)  
✅ Limit authorized domains to only those you control  

---

## Quick Reference: OAuth Flow

```
User clicks Login
    ↓
Browser redirects to: /auth/google
    ↓
Server initiates OAuth with scope: ["profile", "email"]
    ↓
Google shows consent screen
    ↓
User approves
    ↓
Google redirects to: /auth/google/callback
    ↓
Server verifies & creates/finds user
    ↓
Server creates session
    ↓
Browser redirects to: CLIENT_URL/auth/google/callback
    ↓
Client fetches: /auth/user
    ↓
User logged in! ✅
```

---

## Need Help?

If you're still experiencing issues after following this guide:

1. Check the `/auth/config-check` endpoint response
2. Review server logs on Render
3. Verify Google Cloud Console settings match exactly
4. Test with a fresh browser/incognito window
5. Check if Google OAuth consent screen is properly configured

---

**Last Updated:** December 16, 2025
