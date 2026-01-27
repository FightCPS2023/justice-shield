# 🔧 Login 401 Error - Fix Guide

## Problem
Getting a 401 error when trying to sign in to The CPS Punisher app.

---

## ✅ Quick Fix Options

### **Option 1: Enable Dev Mode (Temporary - for testing)**

This bypasses authentication so you can use the app immediately while we fix the real issue.

1. Open `/App.tsx`
2. Find line 78: `const DEV_MODE = false;`
3. Change to: `const DEV_MODE = true;`
4. Save and refresh

**You'll be automatically logged in!**

⚠️ **This is for testing only - turn it back to `false` for production**

---

### **Option 2: Check Server Logs (Debug the real issue)**

The 401 error means authentication is failing. Let's debug:

#### Step 1: Open Browser Console
1. Press `F12` in your browser
2. Click "Console" tab
3. Try to sign in again
4. Look for error messages

#### Step 2: Check what the logs say:

**If you see:** `"SUPABASE_URL exists: false"` or `"SUPABASE_ANON_KEY exists: false"`
- **Problem:** Environment variables not set in server
- **Fix:** See Option 3 below

**If you see:** `"Supabase auth error: Invalid login credentials"`
- **Problem:** Wrong email or password
- **Fix:** Try signing up first, then log in

**If you see:** `"Network error"` or `"Failed to fetch"`
- **Problem:** Server not running
- **Fix:** Check if Supabase functions are deployed

---

### **Option 3: Fix Environment Variables**

The server needs these environment variables to work:

#### Check if they exist:
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `rewgkrgmcmikivxjnfdq`
3. Go to **Settings** → **Edge Functions**
4. Check environment variables

#### Required variables:
```
SUPABASE_URL=https://rewgkrgmcmikivxjnfdq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
```

#### How to add/update:
1. In Supabase Dashboard → **Settings** → **Edge Functions**
2. Click "Add secret" or "Edit"
3. Add each variable with exact names and values
4. Save
5. **Redeploy** the edge function

---

### **Option 4: Create a New Account**

If you haven't created an account yet:

1. Click **"Sign Up"** (not Sign In)
2. Enter:
   - Name: Your name
   - Email: your@email.com
   - Password: At least 6 characters
3. Click "Create Account"
4. It will auto-login you after signup

Then you can sign in with those credentials.

---

## 🔍 Detailed Troubleshooting

### Check 1: Are you signing up or signing in?

**Sign Up = Create new account** (if you're new)
**Sign In = Login** (if you already have an account)

If you don't have an account, you MUST sign up first!

---

### Check 2: Server Response

Look at the browser Network tab:

1. Press `F12` → "Network" tab
2. Try to log in
3. Click on the `login` request
4. Look at "Response" tab

**Common responses:**

**401 - Invalid login credentials**
```json
{
  "error": "Invalid login credentials"
}
```
**Fix:** Email or password is wrong, or account doesn't exist

**500 - Server configuration error**
```json
{
  "error": "Server configuration error: Missing authentication credentials"
}
```
**Fix:** Environment variables not set (see Option 3)

**200 - Success**
```json
{
  "success": true,
  "accessToken": "...",
  "userId": "..."
}
```
**This means it worked!** If you still see error, check frontend code.

---

### Check 3: Test the Server Endpoint Directly

Open a new tab and test:

```
https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/health
```

**Expected response:**
```json
{"status":"ok"}
```

If this works, server is running!

If this fails, server is not deployed.

---

## 🚀 Deployment Checklist

Make sure the server is deployed:

### For Local Development:
```bash
supabase functions serve
```

### For Production:
```bash
supabase functions deploy server
```

After deploying, set environment variables in Supabase Dashboard.

---

## 🎯 Most Likely Solutions

### **90% of 401 errors are caused by:**

1. **Trying to sign in without an account** → Sign up first!
2. **Wrong password** → Check your password
3. **Environment variables not set** → Add them in Supabase Dashboard
4. **Server not deployed** → Deploy edge functions

---

## 📝 Quick Test Script

Run this in browser console to test the login endpoint:

```javascript
// Test login endpoint
fetch('https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

This will show you exactly what the server is returning.

---

## ✅ Step-by-Step Fix

### 1. First, try signing UP (not IN):
- Click "Sign Up"
- Create a new account
- Should auto-login

### 2. If that fails, enable Dev Mode:
- Edit `/App.tsx`
- Set `DEV_MODE = true`
- Use the app (temporarily)

### 3. Then fix the real issue:
- Check browser console for errors
- Check server logs
- Verify environment variables
- Redeploy if needed

### 4. Turn Dev Mode back off:
- Set `DEV_MODE = false`
- Test real login

---

## 🆘 Still Not Working?

### Share these details:

1. **What do you see in browser console?**
2. **What's the exact error message?**
3. **Are you signing up or signing in?**
4. **Is this first time using the app?**
5. **What does the Network tab show?**

### Quick workaround while debugging:

Set `DEV_MODE = true` in `/App.tsx` and you can use the app immediately!

---

## 📧 Common Error Messages Decoded

| Error Message | What It Means | How to Fix |
|--------------|---------------|------------|
| "Invalid login credentials" | Email or password wrong | Check your credentials or sign up |
| "Email and password are required" | Form validation failed | Make sure both fields filled |
| "Server configuration error" | Environment variables missing | Add vars to Supabase Dashboard |
| "Failed to fetch" | Server not responding | Deploy edge functions |
| "Unauthorized" | Token invalid/expired | Sign in again |

---

**Need immediate access?** Set `DEV_MODE = true` in `/App.tsx` line 78!

This bypasses auth so you can use the app while we fix the login issue.

---

**Created:** December 5, 2024  
**For:** The CPS Punisher - Login Issues  
**Owner:** Darren Guay
