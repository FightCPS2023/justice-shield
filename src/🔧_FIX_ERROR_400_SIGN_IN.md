# 🔧 FIX: ERROR 400 ON SIGN IN

## ❌ THE PROBLEM:
You're seeing "Error 400" when trying to sign in or create an account.

## ✅ THE SOLUTION:
We need to tell Supabase about your app's URL. Takes 2 minutes!

---

# STEP-BY-STEP FIX:

## STEP 1: Get Your App's URL

**Where is your app deployed?**

If you already deployed, your URL looks like:
```
https://cps-punisher.vercel.app
```
or
```
https://cps-punisher-xxxxx.vercel.app
```

**To find it:**

### Option A: Check Terminal
Look at your Terminal/Command Prompt from when you ran `vercel --prod`

You should see:
```
✅ Production deployment complete!
🔗 https://your-app-url.vercel.app
```

Copy that URL!

### Option B: Check Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Click on your project: `cps-punisher`
3. Look at the top - you'll see: "Domains"
4. Copy the main domain (usually ends in `.vercel.app`)

**Write your URL here:**
```
https://________________________________
```

---

## STEP 2: Configure Supabase

Now we tell Supabase about your URL:

### 2A: Open Supabase Settings

1. Go to: https://supabase.com/dashboard

2. Click on your project: `cps-punisher`

3. On the left sidebar, scroll down and click **"Authentication"**
   (It has a key icon 🔑)

4. Click **"URL Configuration"**

---

### 2B: Add Site URL

1. Find the field labeled **"Site URL"**

2. Delete whatever is there (probably `http://localhost:3000`)

3. Paste your Vercel URL:
   ```
   https://cps-punisher.vercel.app
   ```
   (Use YOUR actual URL from Step 1!)

4. **Important:** Make sure there's NO slash at the end!
   - ✅ Good: `https://cps-punisher.vercel.app`
   - ❌ Bad: `https://cps-punisher.vercel.app/`

---

### 2C: Add Redirect URLs

1. Scroll down to **"Redirect URLs"**

2. You'll see a text box. Add these URLs (one per line):

   ```
   https://cps-punisher.vercel.app
   https://cps-punisher.vercel.app/**
   http://localhost:3000
   http://localhost:3000/**
   ```

   **Important:** Replace `cps-punisher.vercel.app` with YOUR actual URL!

3. Click inside the text box after pasting to make sure it registers

---

### 2D: Save Changes

1. Scroll to the bottom

2. Click the **"Save"** button

3. Wait for the green success message: "Successfully updated settings"

---

## STEP 3: Test Your App

1. Go to your app URL: `https://cps-punisher.vercel.app`

2. Click **"Get Started"** or **"Sign Up"**

3. Enter access code: `CPSPUNISHER2024`

4. Try creating an account:
   - Name: Test User
   - Email: your email
   - Password: (create a password)

5. It should work now! ✅

---

## ✅ CHECKLIST:

- [ ] Found my Vercel app URL
- [ ] Opened Supabase → Authentication → URL Configuration
- [ ] Updated Site URL with my Vercel URL (no slash at end)
- [ ] Added Redirect URLs (4 lines)
- [ ] Clicked Save
- [ ] Tested sign up - IT WORKS! 🎉

---

## 🆘 STILL GETTING ERROR 400?

Try these additional fixes:

### Fix #1: Wait 30 Seconds
Supabase takes a moment to update. Wait 30 seconds, then try again.

### Fix #2: Clear Browser Cache
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Check "Cached images and files"
3. Click "Clear data"
4. Go to your app URL again

### Fix #3: Hard Refresh
1. Go to your app
2. Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
3. Try signing up again

### Fix #4: Check for Typos
Go back to Supabase URL Configuration and make sure:
- ✅ No extra spaces
- ✅ Starts with `https://` (not `http://`)
- ✅ No slash at the end
- ✅ Correct domain name

### Fix #5: Add More Redirect Patterns
If still not working, add these to Redirect URLs:
```
https://cps-punisher.vercel.app/auth/**
https://cps-punisher.vercel.app/auth/callback
```

Click Save, wait 30 seconds, try again.

---

## 🔍 DOUBLE-CHECK YOUR SETTINGS:

Your Supabase URL Configuration should look like this:

```
┌─────────────────────────────────────────────────┐
│ URL Configuration                                │
├─────────────────────────────────────────────────┤
│                                                  │
│ Site URL:                                        │
│ https://cps-punisher.vercel.app                 │
│                                                  │
│ Redirect URLs:                                   │
│ https://cps-punisher.vercel.app                 │
│ https://cps-punisher.vercel.app/**              │
│ http://localhost:3000                            │
│ http://localhost:3000/**                         │
│                                                  │
│              [Save]                              │
└─────────────────────────────────────────────────┘
```

---

## 💡 WHY DID THIS HAPPEN?

When you create a Supabase project, it defaults to `localhost:3000` (for local development).

But now your app is deployed at `cps-punisher.vercel.app` (live on the internet).

Supabase needs to know: "Hey, requests from this new URL are okay!"

That's what we just did. Now Supabase trusts your app. ✅

---

## 📞 STILL STUCK?

Tell me:

1. **Your app URL:** https://________________
2. **What you see:** (screenshot or copy/paste the error)
3. **What you entered in Supabase:**
   - Site URL: ________________
   - Redirect URLs: ________________

I'll help you fix it! 😊

---

## ✅ NEXT STEPS AFTER IT WORKS:

Once sign up works:

1. ✅ Create a test account
2. ✅ Check your email for verification
3. ✅ Click the verification link
4. ✅ Log in
5. ✅ Test creating a case
6. ✅ Test uploading a document
7. ✅ Test AI analysis

Your app should work perfectly now! 🎉

---

**Copyright © 2024 DARREN GUAY. All Rights Reserved.**

**The CPS Punisher - Error 400 FIXED!** ✅
