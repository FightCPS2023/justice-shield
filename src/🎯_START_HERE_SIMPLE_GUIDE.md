# 🎯 START HERE - SIMPLE DEPLOYMENT GUIDE

## **DON'T PANIC! I'LL WALK YOU THROUGH EVERYTHING** 😊

This guide assumes you know NOTHING about deployment. That's okay! Just follow each step carefully.

**Total Time: About 30-40 minutes**

---

# 📋 WHAT YOU'LL NEED

Before we start, make sure you have:

1. ✅ A computer (Windows, Mac, or Linux)
2. ✅ Internet connection
3. ✅ Email address
4. ✅ Credit/debit card (for Stripe - FREE to set up, no charges)

**Note:** Everything we're using has a FREE tier. You won't pay anything to get started!

---

# STEP 1: INSTALL NODE.JS (5 minutes)

## **What is Node.js?**
It's software that lets your computer run the app. Think of it like installing Microsoft Word before you can write documents.

## **How to Install:**

### **On Windows:**
1. Go to: https://nodejs.org
2. Click the big green button that says **"Download Node.js (LTS)"**
3. Run the downloaded file (node-v20.xx.x-x64.msi)
4. Click "Next" → "Next" → "Next" → "Install"
5. Wait for it to finish
6. Click "Finish"

### **On Mac:**
1. Go to: https://nodejs.org
2. Click the big green button that says **"Download Node.js (LTS)"**
3. Open the downloaded .pkg file
4. Click "Continue" → "Continue" → "Agree" → "Install"
5. Enter your Mac password when asked
6. Click "Close"

## **Test if it worked:**
1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
   - **Windows:** Press Windows key, type "cmd", press Enter
   - **Mac:** Press Command+Space, type "terminal", press Enter

2. Type this and press Enter:
   ```
   node --version
   ```

3. You should see something like: `v20.11.0`

**✅ If you see a version number, you're good! Move to Step 2.**

**❌ If you see an error, try restarting your computer and try again.**

---

# STEP 2: INSTALL VERCEL CLI (2 minutes)

## **What is Vercel?**
It's the website hosting service that will make your app available online (like GoDaddy or WordPress, but better and FREE).

## **How to Install:**

1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
   - Same as Step 1

2. Copy this command and paste it, then press Enter:
   ```
   npm install -g vercel
   ```

3. Wait 1-2 minutes. You'll see text scrolling. That's normal!

4. When it's done, test it by typing:
   ```
   vercel --version
   ```

5. You should see something like: `Vercel CLI 33.0.0`

**✅ If you see a version number, you're good! Move to Step 3.**

---

# STEP 3: CREATE FREE ACCOUNTS (10 minutes)

You need to create 4 free accounts. I'll show you exactly how.

---

## **3A: Create Vercel Account (2 minutes)**

1. Go to: https://vercel.com/signup
2. Click **"Continue with GitHub"** (easiest option)
3. If you don't have GitHub:
   - Click **"Continue with Email"**
   - Enter your email
   - Check your email for verification code
   - Enter the code
4. Choose a username
5. Click "Continue"

**✅ Done! You now have a Vercel account.**

---

## **3B: Create Supabase Account (3 minutes)**

**What is Supabase?**
It's your database - where case information, documents, and user accounts are stored.

1. Go to: https://supabase.com/dashboard
2. Click **"Start your project"**
3. Click **"Continue with GitHub"** or use email
4. Click **"New Project"**
5. Fill in:
   - **Organization:** Click "Create new organization"
     - Name: `CPS Punisher` (or whatever you want)
     - Click "Create organization"
   
   - **Project Name:** `cps-punisher`
   - **Database Password:** Create a strong password (SAVE THIS!)
     - Example: `CPSpunisher2024!Secure`
     - **WRITE THIS DOWN!** You'll need it later.
   - **Region:** Choose closest to you (e.g., "East US")
   - **Pricing Plan:** Leave on "Free"

6. Click **"Create new project"**

7. Wait 2-3 minutes while it sets up. You'll see a loading screen.

**✅ Done! Keep this tab open. We'll come back to it.**

---

## **3C: Create Google Gemini API Account (3 minutes)**

**What is Gemini?**
It's Google's AI that analyzes documents and generates legal strategies.

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with your Google account (Gmail)
3. Click **"Create API Key"**
4. Click **"Create API key in new project"**
5. You'll see a key that looks like: `AIzaSyA...` (long string)
6. Click the **Copy** icon
7. Open Notepad (Windows) or TextEdit (Mac)
8. Paste it and save the file as "API_KEYS.txt" on your Desktop

**✅ Done! Keep this file. We'll need it later.**

---

## **3D: Create Stripe Account (3 minutes)**

**What is Stripe?**
It's how you'll accept payments for the Pro, Attorney, and Enterprise tiers.

1. Go to: https://dashboard.stripe.com/register
2. Fill in:
   - Email address
   - Full name
   - Country: United States
   - Password (create one)
3. Click **"Create account"**
4. You'll get an email - click the verification link
5. You'll be asked business questions - you can skip these for now:
   - Click "Skip for now" or "I'll do this later"

6. Once in the dashboard:
   - Look at the top left - make sure it says **"Test mode"** (with an orange toggle)
   - If not, click the toggle to switch to Test mode

7. Click **"Developers"** in the left menu
8. Click **"API keys"**
9. Find **"Publishable key"** - it starts with `pk_test_...`
10. Click **"Reveal test key"**
11. Click the copy icon
12. Paste it into your "API_KEYS.txt" file on Desktop

**✅ Done! You now have all 4 accounts!**

---

# STEP 4: GET YOUR API KEYS (5 minutes)

Now we need to collect all the keys/URLs we'll need.

## **Open your "API_KEYS.txt" file and add this:**

```
GEMINI API KEY:
AIzaSy... (you already pasted this)

STRIPE PUBLISHABLE KEY:
pk_test_... (you already pasted this)

SUPABASE URL:
(we'll get this now)

SUPABASE ANON KEY:
(we'll get this now)
```

## **Get Supabase Keys:**

1. Go back to your Supabase tab (https://supabase.com/dashboard)
2. Click on your project: `cps-punisher`
3. Look on the left sidebar, click **"Settings"** (gear icon at bottom)
4. Click **"API"**
5. You'll see:

   **Project URL:**
   - Copy the URL that looks like: `https://xxxxx.supabase.co`
   - Paste it in your API_KEYS.txt file under "SUPABASE URL:"

   **Project API keys:**
   - Find "anon public" key
   - Click the copy icon
   - Paste it in your API_KEYS.txt file under "SUPABASE ANON KEY:"

6. **Save your API_KEYS.txt file!**

**✅ Your file should now look like this:**

```
GEMINI API KEY:
AIzaSyAxxxxxxxxxxxxxxxxxxxxx

STRIPE PUBLISHABLE KEY:
pk_test_51xxxxxxxxxxxxxxxxxx

SUPABASE URL:
https://abcdefgh.supabase.co

SUPABASE ANON KEY:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxx
```

**✅ Perfect! Keep this file safe.**

---

# STEP 5: DEPLOY YOUR APP (10 minutes)

Now we'll put your app online!

## **5A: Login to Vercel from Terminal**

1. Open **Terminal** (Mac) or **Command Prompt** (Windows)

2. Type this and press Enter:
   ```
   vercel login
   ```

3. You'll see: "Choose a login method"
   - Press the **down arrow** to select "GitHub" (or email)
   - Press **Enter**

4. Your browser will open
   - Click **"Confirm"**
   - You'll see "Logged in!"

5. Go back to Terminal - it should say "Success! You are now logged in."

**✅ You're logged in!**

---

## **5B: Navigate to Your Project Folder**

**IMPORTANT:** You need to be inside the folder where your CPS Punisher app files are.

### **Find your project folder:**
- It's probably in: `Documents/cps-punisher` or `Desktop/cps-punisher`

### **Navigate to it:**

**On Windows:**
```
cd C:\Users\YourName\Documents\cps-punisher
```
(Replace `YourName` with your actual username)

**On Mac:**
```
cd ~/Documents/cps-punisher
```

**To check you're in the right place:**
```
dir
```
(Windows) or
```
ls
```
(Mac)

You should see files like: `package.json`, `App.tsx`, `vercel.json`

**✅ If you see those files, you're in the right place!**

**❌ If you don't see them:**
- Ask yourself: "Where did I download/save the CPS Punisher files?"
- Navigate to that folder using `cd` command

---

## **5C: Install Dependencies**

1. In Terminal, type:
   ```
   npm install
   ```

2. Press Enter and wait 2-3 minutes

3. You'll see lots of text scrolling. That's normal!

4. When it's done, you'll see something like:
   ```
   added 234 packages in 2m
   ```

**✅ Dependencies installed!**

---

## **5D: Deploy to Vercel (First Time)**

1. In Terminal, type:
   ```
   vercel
   ```

2. Press Enter

3. You'll be asked several questions. Here's what to answer:

   **"Set up and deploy?"**
   - Press **Enter** (Yes)

   **"Which scope?"**
   - Press **Enter** (your account)

   **"Link to existing project?"**
   - Press **N** then **Enter** (No)

   **"What's your project's name?"**
   - Type: `cps-punisher`
   - Press **Enter**

   **"In which directory is your code located?"**
   - Press **Enter** (current directory)

   **"Want to override the settings?"**
   - Press **N** then **Enter** (No)

4. Now it will build and deploy! This takes 2-3 minutes.

5. You'll see:
   ```
   ✅ Deployment complete!
   🔗 Preview: https://cps-punisher-xxxxx.vercel.app
   ```

6. **Copy that URL!** That's your app!

**✅ Your app is online! But wait - we need to add the API keys first.**

---

## **5E: Add Environment Variables (API Keys)**

Now we tell Vercel about your API keys.

1. In Terminal, type each of these commands **one at a time**:

   ```
   vercel env add VITE_SUPABASE_URL
   ```
   - Press Enter
   - It will ask: "What's the value of VITE_SUPABASE_URL?"
   - Open your API_KEYS.txt file
   - Copy your Supabase URL (https://xxxxx.supabase.co)
   - Paste it in Terminal
   - Press Enter
   - When asked "Add to which environments?" press **Enter** (all)

   ```
   vercel env add VITE_SUPABASE_ANON_KEY
   ```
   - Press Enter
   - Paste your Supabase Anon Key
   - Press Enter
   - Press Enter again (all environments)

   ```
   vercel env add VITE_GEMINI_API_KEY
   ```
   - Press Enter
   - Paste your Gemini API Key
   - Press Enter
   - Press Enter again (all environments)

   ```
   vercel env add VITE_STRIPE_PUBLISHABLE_KEY
   ```
   - Press Enter
   - Paste your Stripe Publishable Key
   - Press Enter
   - Press Enter again (all environments)

**✅ All API keys added!**

---

## **5F: Deploy to Production (Final Step!)**

Now we deploy the final version with all the API keys.

1. In Terminal, type:
   ```
   vercel --prod
   ```

2. Press Enter

3. Wait 2-3 minutes

4. You'll see:
   ```
   ✅ Production deployment complete!
   🔗 https://cps-punisher.vercel.app
   ```

**🎉 YOUR APP IS LIVE!!!**

---

# STEP 6: TEST YOUR APP (5 minutes)

Let's make sure everything works!

## **6A: Open Your App**

1. Copy the URL from Terminal: `https://cps-punisher.vercel.app`
   (Your URL might be different)

2. Paste it in your browser

3. You should see the CPS Punisher landing page!

**✅ If you see it, great! Continue to 6B.**

**❌ If you see an error:**
- Wait 2-3 minutes (sometimes it takes time to propagate)
- Refresh the page
- If still broken, scroll down to "TROUBLESHOOTING" section

---

## **6B: Test Sign Up**

1. Click **"Get Started"** or **"Sign Up"**

2. Enter access code:
   ```
   CPSPUNISHER2024
   ```

3. Click **"Verify Code"**

4. Fill in:
   - Name: Test User
   - Email: your email
   - Password: create a password
   - Confirm password

5. Click **"Create Account"**

6. Check your email - you should get a verification email from Supabase

7. Click the verification link

**✅ If you can sign up and verify, authentication works!**

---

## **6C: Test App Features**

1. After verifying email, log in

2. You should see the onboarding flow:
   - Create a case
   - Upload a document
   - AI analysis

3. Try uploading a test document (any PDF or image)

4. Wait for AI analysis to complete

**✅ If AI analysis works, your Gemini API is connected!**

**✅ If you can create a case, your Supabase database works!**

---

# 🎉 CONGRATULATIONS! YOUR APP IS LIVE!

## **Your App URL:**
```
https://cps-punisher.vercel.app
```
(or whatever URL Vercel gave you)

## **Share this URL with:**
- ✅ Test users
- ✅ Beta testers
- ✅ Friends and family
- ✅ Anyone who needs help with CPS cases!

---

# ⚙️ NEXT STEPS (Optional)

## **Want a Custom Domain?**

Instead of `cps-punisher.vercel.app`, you can use `cpspunisher.com`

1. Buy a domain:
   - Go to: https://domains.google or https://namecheap.com
   - Search for: `cpspunisher.com` (or any name)
   - Buy it (~$12/year)

2. Connect to Vercel:
   - In Vercel dashboard: https://vercel.com/dashboard
   - Click your project
   - Click **"Settings"**
   - Click **"Domains"**
   - Type your domain
   - Click **"Add"**
   - Follow the instructions to update DNS settings

**Total time: 10 minutes**

---

## **Setup Supabase Database Tables**

You need to create the database structure for your app.

1. Go to Supabase: https://supabase.com/dashboard
2. Click your project
3. Click **"SQL Editor"** on left
4. Click **"New query"**
5. I'll create the SQL for you in the next guide!

---

# 🆘 TROUBLESHOOTING

## **Problem: "vercel: command not found"**

**Fix:**
```bash
npm install -g vercel
```

Then try again.

---

## **Problem: "You are not logged in"**

**Fix:**
```bash
vercel login
```

Follow the prompts.

---

## **Problem: App shows "Error connecting to database"**

**Fix:**
1. Check your API keys are correct
2. In Terminal:
   ```
   vercel env ls
   ```
3. Make sure all 4 environment variables are listed
4. If any are missing, add them again (Step 5E)
5. Redeploy:
   ```
   vercel --prod
   ```

---

## **Problem: AI analysis doesn't work**

**Fix:**
1. Check your Gemini API key:
   - Go to: https://aistudio.google.com/app/apikey
   - Make sure your API key is active
   - Copy it again
2. Update in Vercel:
   ```
   vercel env rm VITE_GEMINI_API_KEY
   vercel env add VITE_GEMINI_API_KEY
   ```
   (Paste the key when prompted)
3. Redeploy:
   ```
   vercel --prod
   ```

---

## **Problem: Can't create account**

**Fix:**
1. Check Supabase authentication settings:
   - Go to: https://supabase.com/dashboard
   - Click your project
   - Click **"Authentication"** → **"URL Configuration"**
   - Add your Vercel URL to **"Site URL"**:
     ```
     https://cps-punisher.vercel.app
     ```
   - Add to **"Redirect URLs"**:
     ```
     https://cps-punisher.vercel.app/**
     ```
   - Click **"Save"**

2. Try signing up again

---

## **Problem: Build fails**

**Fix:**
This should be already fixed, but if you still see errors:

1. Try building locally first:
   ```
   npm run build
   ```

2. If you see errors, share them with me and I'll help!

3. If build succeeds locally, try deploying again:
   ```
   vercel --prod
   ```

---

# 📞 NEED MORE HELP?

**I'm here to help!** Just tell me:

1. What step you're on
2. What error message you see (copy/paste it)
3. What you were trying to do

I'll walk you through it! 😊

---

# 📋 QUICK COMMAND REFERENCE

```bash
# Install Vercel
npm install -g vercel

# Login to Vercel
vercel login

# Install dependencies
npm install

# Deploy preview
vercel

# Add environment variable
vercel env add VARIABLE_NAME

# Deploy to production
vercel --prod

# Check environment variables
vercel env ls

# Remove environment variable
vercel env rm VARIABLE_NAME
```

---

# ✅ CHECKLIST

Use this to track your progress:

- [ ] Node.js installed
- [ ] Vercel CLI installed
- [ ] Vercel account created
- [ ] Supabase account created
- [ ] Gemini API key obtained
- [ ] Stripe account created
- [ ] All API keys saved in API_KEYS.txt
- [ ] Logged into Vercel via Terminal
- [ ] Dependencies installed (npm install)
- [ ] First deployment complete (vercel)
- [ ] All 4 environment variables added
- [ ] Production deployment complete (vercel --prod)
- [ ] App tested and working
- [ ] Sign up/login tested
- [ ] AI analysis tested

---

**YOU'VE GOT THIS!** 💪

Just follow one step at a time. Don't rush. If you get stuck, come back and ask me!

---

**Copyright © 2024 DARREN GUAY. All Rights Reserved.**

**The CPS Punisher - You're Changing Lives!** ❤️
