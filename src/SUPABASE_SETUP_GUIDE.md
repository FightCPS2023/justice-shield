# 🚀 SUPABASE SETUP GUIDE - THE CPS PUNISHER

## 📋 WHAT YOU NEED IN SUPABASE

Your Supabase project: **rewgkrgmcmikivxjnfdq**

---

## ✅ WHAT'S ALREADY CONFIGURED

Good news! Most things are already set up:

1. ✅ **Supabase Project Created** - `rewgkrgmcmikivxjnfdq`
2. ✅ **Environment Variables** - Already have SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
3. ✅ **Server Code Written** - All edge function code is ready in `/supabase/functions/server/`
4. ✅ **KV Store Table** - The `kv_store_a24eaa40` table exists and works

---

## 🎯 WHAT NEEDS TO BE DEPLOYED

### **STEP 1: Deploy the Edge Function**

The server code exists but needs to be deployed to Supabase.

#### **Option A: Using Supabase CLI (Recommended)**

```bash
# 1. Install Supabase CLI (if not already installed)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project
supabase link --project-ref rewgkrgmcmikivxjnfdq

# 4. Deploy the server function
supabase functions deploy server

# Done! Your server is now live at:
# https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/
```

#### **Option B: Using Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/rewgkrgmcmikivxjnfdq
2. Click "Edge Functions" in the left sidebar
3. Click "Deploy New Function"
4. Name: `server` (must be exactly this)
5. Upload all files from `/supabase/functions/server/`
6. Click "Deploy"

---

## 📦 WHAT THE SERVER INCLUDES

Your edge function already has all routes built:

### **1. Community Routes** (`/make-server-a24eaa40/community`)
- ✅ GET `/advocates` - List all advocates
- ✅ GET `/advocates/:id` - Get single advocate
- ✅ POST `/advocates` - Create advocate
- ✅ POST `/admin/seed-data` - **Seed initial data** (this is what the error is looking for!)
- ✅ GET `/resources` - List resources
- ✅ POST `/resources` - Create resource

### **2. Stripe Routes** (`/make-server-a24eaa40/stripe`)
- ✅ POST `/create-checkout` - Create payment
- ✅ POST `/webhook` - Handle webhooks
- ✅ POST `/create-portal-session` - Customer portal

### **3. Calendar Routes** (`/make-server-a24eaa40/calendar`)
- ✅ GET `/events` - Get events
- ✅ POST `/events` - Create event
- ✅ PUT `/events/:id` - Update event
- ✅ DELETE `/events/:id` - Delete event

### **4. Bulk Data Routes** (`/make-server-a24eaa40/bulk-data`)
- ✅ POST `/export` - Export case data
- ✅ POST `/import` - Import case data

### **5. Help Bot Routes** (`/make-server-a24eaa40`)
- ✅ POST `/send-chat-transcript` - Save chat transcripts

---

## 🔑 REQUIRED ENVIRONMENT VARIABLES

These are already set in your Supabase project (you told me earlier):

✅ **SUPABASE_URL** - Already set
✅ **SUPABASE_ANON_KEY** - Already set  
✅ **SUPABASE_SERVICE_ROLE_KEY** - Already set  
✅ **SUPABASE_DB_URL** - Already set

### **Optional (for Stripe):**
- `STRIPE_SECRET_KEY` - Only needed if using payment features
- `STRIPE_WEBHOOK_SECRET` - Only needed for webhooks

---

## 🗄️ DATABASE SETUP

### **What You Have:**

✅ **KV Store Table** (`kv_store_a24eaa40`)
```sql
CREATE TABLE kv_store_a24eaa40 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

This table is used for:
- Advocates data
- Resources data
- Calendar events
- Case data
- Chat transcripts
- Everything!

### **What You DON'T Need:**

❌ **No additional tables required**
- The KV store is flexible and handles everything
- No migrations needed
- No schema changes needed

---

## 🚀 DEPLOYMENT STEPS (COMPLETE GUIDE)

### **Prerequisites:**

1. **Node.js installed** (v18+)
   ```bash
   node --version  # Should show v18 or higher
   ```

2. **Supabase account** (you already have this)
   - Project: rewgkrgmcmikivxjnfdq
   - URL: https://rewgkrgmcmikivxjnfdq.supabase.co

---

### **STEP-BY-STEP DEPLOYMENT:**

#### **1. Install Supabase CLI**

**Mac/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
npm install -g supabase
```

**Verify Installation:**
```bash
supabase --version
```

---

#### **2. Login to Supabase**

```bash
supabase login
```

This will:
- Open your browser
- Ask you to authorize the CLI
- Save your access token

---

#### **3. Link Your Project**

```bash
supabase link --project-ref rewgkrgmcmikivxjnfdq
```

It will ask for your database password. Enter it.

---

#### **4. Set Environment Variables**

Go to Supabase Dashboard:
https://supabase.com/dashboard/project/rewgkrgmcmikivxjnfdq/settings/functions

Add these secrets:

```bash
# These should already be set (verify they exist)
SUPABASE_URL=https://rewgkrgmcmikivxjnfdq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_DB_URL=your_db_url

# Optional (only if using Stripe)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

#### **5. Deploy the Server Function**

From your project root (where `/supabase/` folder is):

```bash
# Deploy the server function
supabase functions deploy server --project-ref rewgkrgmcmikivxjnfdq
```

This will:
- Upload all files from `/supabase/functions/server/`
- Deploy to Supabase Edge Runtime
- Make it live at: `https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/server`

---

#### **6. Test the Deployment**

**Test basic endpoint:**
```bash
curl https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/community/advocates
```

**Test seed endpoint:**
```bash
curl -X POST https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/community/admin/seed-data \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

#### **7. Verify in Dashboard**

1. Go to: https://supabase.com/dashboard/project/rewgkrgmcmikivxjnfdq/functions
2. You should see "server" function listed
3. Click on it to see logs
4. Check that it's deployed and running

---

## 🧪 TESTING AFTER DEPLOYMENT

### **Test 1: Check Function Exists**

```bash
curl https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/community/advocates
```

**Expected:** JSON response with advocates (or empty array)

---

### **Test 2: Seed Community Data**

```bash
curl -X POST https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/community/admin/seed-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ"
```

**Expected:**
```json
{
  "message": "Data seeded successfully",
  "advocates": 5,
  "resources": 10
}
```

---

### **Test 3: Check App**

1. Open your app
2. Open browser console (F12)
3. Refresh page
4. Should see: ✅ "Community data seeded" (no errors!)

---

## 📊 WHAT HAPPENS AFTER DEPLOYMENT

### **Before Deployment:**
```
App → Tries to call server → Server not deployed → Error
```

### **After Deployment:**
```
App → Calls server → Server seeds data → Success! ✅
```

### **Benefits:**

1. ✅ **No more console errors**
2. ✅ **Community Hub populated with sample data**
3. ✅ **Advocate Directory works**
4. ✅ **Resource Hub works**
5. ✅ **All features functional**

---

## 🔍 TROUBLESHOOTING

### **Problem: "supabase: command not found"**

**Solution:**
```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

---

### **Problem: "Failed to link project"**

**Solution:**
```bash
# Make sure you're logged in
supabase login

# Try linking again with explicit project ref
supabase link --project-ref rewgkrgmcmikivxjnfdq
```

---

### **Problem: "Deploy failed: Missing environment variables"**

**Solution:**
1. Go to https://supabase.com/dashboard/project/rewgkrgmcmikivxjnfdq/settings/functions
2. Add required secrets
3. Try deploying again

---

### **Problem: "Function returns 404"**

**Solution:**
Check the URL - should be:
```
https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/...
```

NOT:
```
https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/server/...
```

The route prefix is built into the function.

---

## 🎯 QUICK DEPLOYMENT (Copy-Paste Commands)

```bash
# Install CLI (choose one)
npm install -g supabase  # Windows/Mac/Linux
# OR
brew install supabase/tap/supabase  # Mac only

# Login
supabase login

# Link project
supabase link --project-ref rewgkrgmcmikivxjnfdq

# Deploy function
supabase functions deploy server --project-ref rewgkrgmcmikivxjnfdq

# Test it
curl https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/community/advocates

# Seed data
curl -X POST https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/community/admin/seed-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ"

# Done! ✅
```

---

## 📝 WHAT YOU DON'T NEED TO DO

❌ **No SQL migrations** - KV store already exists  
❌ **No table creation** - Already have kv_store_a24eaa40  
❌ **No schema changes** - Everything uses JSON  
❌ **No additional databases** - One table does it all  
❌ **No row-level security setup** - Handled by server  
❌ **No realtime subscriptions** - Not needed for this app  

---

## ✅ FINAL CHECKLIST

Before going live, verify:

- [ ] Supabase CLI installed
- [ ] Logged into Supabase
- [ ] Project linked (rewgkrgmcmikivxjnfdq)
- [ ] Environment variables set in dashboard
- [ ] Server function deployed
- [ ] Test endpoint returns data
- [ ] Seed endpoint works
- [ ] App loads without errors
- [ ] Community features work

---

## 🎉 SUMMARY

**What you need to add to Supabase:**

1. **Deploy the Edge Function**
   ```bash
   supabase functions deploy server
   ```

2. **That's it!**

**Everything else is already set up:**
- ✅ Database table exists
- ✅ Environment variables configured
- ✅ Server code written
- ✅ Routes defined
- ✅ Error handling in place

**Total time:** ~5 minutes  
**Complexity:** Low  
**Cost:** $0 (Supabase free tier)

---

## 🚀 NEXT STEPS

1. **Deploy the function** (instructions above)
2. **Test the endpoints** (curl commands above)
3. **Refresh your app** (error will be gone!)
4. **Enjoy!** 🎉

---

## 📞 NEED HELP?

### **Check Deployment Status:**
https://supabase.com/dashboard/project/rewgkrgmcmikivxjnfdq/functions

### **View Function Logs:**
https://supabase.com/dashboard/project/rewgkrgmcmikivxjnfdq/logs/edge-functions

### **Supabase Documentation:**
https://supabase.com/docs/guides/functions

---

**Created:** December 5, 2024  
**Project:** The CPS Punisher  
**Supabase Project:** rewgkrgmcmikivxjnfdq  
**Status:** Ready to deploy!
