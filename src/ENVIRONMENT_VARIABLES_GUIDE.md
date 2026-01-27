# 🔐 Environment Variables Configuration Guide

## ✅ Complete List of Environment Variables

This application requires the following environment variables to function properly:

### **Required Variables:**

| Variable Name | Type | Description | Where to Get It |
|--------------|------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Database | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Database | Supabase anonymous/public API key | Supabase Dashboard → Settings → API |
| `VITE_GEMINI_API_KEY` | AI | Google Gemini API key for AI analysis | Google AI Studio |

### **Optional Variables:**

| Variable Name | Type | Description | Where to Get It |
|--------------|------|-------------|-----------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Payment | Stripe publishable key for payments | Stripe Dashboard → Developers → API Keys |

---

## 📋 Quick Setup Guide

### **1. Create `.env` File**

In your project root, create a file named `.env`:

```bash
# Windows Command Prompt
echo. > .env

# Mac/Linux Terminal
touch .env
```

### **2. Add Your Environment Variables**

Copy this template into your `.env` file and replace with your actual values:

```env
# Database & Authentication (Supabase)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Analysis (Google Gemini)
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX

# Payment Processing (Stripe) - Optional
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXX
```

### **3. Restart Your Development Server**

```bash
npm run dev
```

---

## 🔑 How to Get Each API Key

### **Supabase (Database & Authentication)**

1. **Go to:** https://supabase.com/dashboard
2. **Sign up/Login** (free tier available)
3. **Create a new project** or select existing project
4. Click **Settings** (⚙️ icon in left sidebar)
5. Click **API** in the settings menu
6. Copy these values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **Project API keys → anon public** → This is your `VITE_SUPABASE_ANON_KEY`

**Security Note:** The anon key is safe to expose on the client side as it's protected by Row Level Security (RLS) policies.

---

### **Google Gemini AI (AI Analysis Features)**

1. **Go to:** https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account
3. Click **"Create API Key"**
4. **Select or create a Google Cloud project**
5. **Copy the API key** → This is your `VITE_GEMINI_API_KEY`

**Free Tier:** Gemini offers a generous free tier for testing and development.

**Pricing:** https://ai.google.dev/pricing

---

### **Stripe (Payment Processing) - OPTIONAL**

1. **Go to:** https://dashboard.stripe.com/register
2. **Create an account** (test mode is free)
3. Navigate to **Developers → API Keys**
4. Copy **Publishable key** (starts with `pk_test_`) → This is your `VITE_STRIPE_PUBLISHABLE_KEY`

**Note:** You can use `pk_test_placeholder` if you're not implementing payments yet.

---

## 🚀 Vercel Deployment Setup

When deploying to Vercel, add environment variables through the dashboard:

### **Method 1: Vercel Dashboard (Recommended)**

1. **Go to:** https://vercel.com/dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add each variable:
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** Your Supabase URL
   - **Environments:** Check all (Production, Preview, Development)
   - Click **Save**
5. Repeat for all variables
6. **Redeploy** your project

### **Method 2: Vercel CLI**

```bash
# Add Supabase URL
vercel env add VITE_SUPABASE_URL
# (Paste value, select all environments)

# Add Supabase Anon Key
vercel env add VITE_SUPABASE_ANON_KEY
# (Paste value, select all environments)

# Add Gemini API Key
vercel env add VITE_GEMINI_API_KEY
# (Paste value, select all environments)

# Add Stripe Key (optional)
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
# (Paste value, select all environments)

# Verify all variables are set
vercel env ls

# Redeploy with new environment variables
vercel --prod
```

---

## ✅ Verify Configuration

After setting up your environment variables, you can verify they're working:

1. **Start your dev server:** `npm run dev`
2. **Open the app** in your browser
3. **Scroll to the footer**
4. **Click "View Environment Variables"** button
5. **Check status indicators:**
   - ✅ Green checkmark = Variable is configured
   - ⚠️ Red warning = Required variable missing
   - ⚠️ Yellow warning = Optional variable missing

---

## 🔒 Security Best Practices

### **DO:**
- ✅ Keep your `.env` file out of version control (it's in `.gitignore`)
- ✅ Use environment variables for all sensitive data
- ✅ Rotate API keys regularly
- ✅ Use Supabase Row Level Security (RLS) policies
- ✅ Store API keys in Vercel's secure environment variables

### **DON'T:**
- ❌ Commit `.env` to Git
- ❌ Share API keys publicly
- ❌ Use production keys in development
- ❌ Hardcode secrets in source code
- ❌ Include secrets in screenshots or documentation

---

## 🐛 Troubleshooting

### **Issue: "Environment variable not defined"**

**Solution:**
1. Verify `.env` file exists in project root
2. Restart your development server
3. Check variable names match exactly (case-sensitive)

### **Issue: "Supabase connection failed"**

**Solution:**
1. Verify `VITE_SUPABASE_URL` format: `https://xxxxx.supabase.co`
2. Verify `VITE_SUPABASE_ANON_KEY` is the **anon/public** key, not service key
3. Check Supabase project is active

### **Issue: "Gemini API error"**

**Solution:**
1. Verify API key is valid
2. Check you haven't exceeded free tier limits
3. Verify billing is enabled in Google Cloud Console (required after free tier)

### **Issue: "Variables work locally but not on Vercel"**

**Solution:**
1. Add variables in Vercel Dashboard → Settings → Environment Variables
2. Make sure all environments are selected (Production, Preview, Development)
3. Redeploy the project after adding variables

---

## 📞 Need Help?

### **Check Configuration Status:**
- Use the **"View Environment Variables"** button in the app footer
- Shows which variables are configured and which are missing

### **Common Resources:**
- **Supabase Docs:** https://supabase.com/docs
- **Gemini AI Docs:** https://ai.google.dev/docs
- **Vercel Docs:** https://vercel.com/docs/environment-variables
- **Stripe Docs:** https://stripe.com/docs/keys

---

## 🎯 Quick Reference

```env
# Copy this template to your .env file

# ============================================
# REQUIRED ENVIRONMENT VARIABLES
# ============================================

# Supabase Database & Authentication
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Google Gemini AI
VITE_GEMINI_API_KEY=

# ============================================
# OPTIONAL ENVIRONMENT VARIABLES
# ============================================

# Stripe Payment Processing
VITE_STRIPE_PUBLISHABLE_KEY=
```

---

**Last Updated:** January 2025  
**App Version:** 1.0.0  
**Copyright:** DARREN GUAY - The CPS Punisher
