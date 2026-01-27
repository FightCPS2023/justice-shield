# ⚡ SUPABASE QUICK START - 5 MINUTE SETUP

**For:** The CPS Punisher  
**Time:** 5-10 minutes  
**Goal:** Get app connected to Supabase database

---

## 🎯 FASTEST PATH TO WORKING APP

Your credentials are already configured! You just need to set up the database.

---

## ✅ YOUR CREDENTIALS (Already in App)

```
Project ID: rewgkrgmcmikivxjnfdq
Project URL: https://rewgkrgmcmikivxjnfdq.supabase.co
Anon Key: eyJhbGci... (already configured)
```

**Location:** `/utils/supabase/info.tsx`

---

## 🚀 5-STEP QUICK SETUP

### **STEP 1: Verify Supabase Project** (30 seconds)

1. Go to: https://app.supabase.com
2. Log in
3. Find project: `rewgkrgmcmikivxjnfdq`
4. Click to open it

**If project doesn't exist:** Create new project with that ID or update credentials

---

### **STEP 2: Create Database Tables** (2 minutes)

**Copy this entire SQL script:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  case_name TEXT NOT NULL,
  case_number TEXT,
  status TEXT DEFAULT 'active',
  data JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cases" ON cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cases" ON cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cases" ON cases FOR DELETE USING (auth.uid() = user_id);

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  size BIGINT,
  ai_analysis JSONB
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  preferences JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create ai_analyses table
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  analysis_type TEXT NOT NULL,
  input_text TEXT NOT NULL,
  result JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON ai_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON ai_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community Hub tables
CREATE TABLE advocates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  state TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE advocates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view verified advocates" ON advocates FOR SELECT USING (verified = true);
CREATE POLICY "Authenticated users can submit" ON advocates FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view verified resources" ON resources FOR SELECT USING (verified = true);
CREATE POLICY "Authenticated users can submit" ON resources FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

**Run it:**
1. In Supabase Dashboard, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Paste the entire SQL script above
4. Click "Run" button (or press Ctrl+Enter)
5. Wait for "Success" message

✅ **All tables created!**

---

### **STEP 3: Create Storage Bucket** (1 minute)

1. Click "Storage" in left sidebar
2. Click "New Bucket"
3. Enter:
   - **Name:** `documents`
   - **Public:** ❌ Uncheck (keep private)
4. Click "Create bucket"

**Set permissions:**
1. Click on `documents` bucket
2. Click "Policies" tab
3. Click "New Policy"
4. Choose "Custom Policy"
5. Paste this:

```sql
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

6. Click "Save"

✅ **Storage ready!**

---

### **STEP 4: Enable Authentication** (30 seconds)

1. Click "Authentication" in left sidebar
2. Click "Providers" tab
3. Make sure "Email" is enabled (should already be ✅)
4. Click "URL Configuration" tab
5. Set "Site URL" to: `http://localhost:5173` (for development)
6. Click "Save"

✅ **Authentication ready!**

---

### **STEP 5: Test Your App** (1 minute)

1. **Refresh your app** in browser
2. **Open console** (F12)
3. **Try to sign up:**
   - Email: `test@example.com`
   - Password: `TestPassword123!`
4. **Check console** - should see no errors
5. **Check email** for confirmation link

✅ **App connected to Supabase!**

---

## 🎉 DONE! YOUR APP IS CONNECTED!

**What you can do now:**
- ✅ Create user accounts
- ✅ Save cases to cloud
- ✅ Upload documents
- ✅ Access from any device
- ✅ Multi-case management

---

## 📋 QUICK VERIFICATION

**Check these work:**

1. **Sign up** - Creates user account ✅
2. **Create case** - Saves to database ✅
3. **Refresh page** - Case still there ✅
4. **Upload document** - Stores in Supabase ✅

**Check in Supabase:**
1. Go to "Table Editor"
2. Click `cases` table
3. You should see your test case

---

## 🐛 TROUBLESHOOTING

### **Problem: "Can't connect to Supabase"**
**Fix:** 
- Check internet connection
- Verify project is running (not paused)
- Check credentials in `/utils/supabase/info.tsx`

### **Problem: "RLS policy violation"**
**Fix:**
- Make sure you ran the SQL script (Step 2)
- User must be logged in
- Try logging out and back in

### **Problem: "Can't upload documents"**
**Fix:**
- Make sure storage bucket exists (Step 3)
- Check storage policies are created
- User must be logged in

---

## ⚡ OPTIONAL: Deploy Community Server

**Only needed for Community Hub features (can skip for now):**

```bash
# Install Supabase CLI
npm install -g supabase

# Log in
supabase login

# Deploy server function
supabase functions deploy make-server-a24eaa40 --project-ref rewgkrgmcmikivxjnfdq

# Seed community data
curl -X POST https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/community/admin/seed-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ"
```

---

## 🇺🇸 FOR YOUR CONGRESSIONAL MEETING

**Good news:** App works WITHOUT Supabase for demo!

You can:
- ✅ Demo all features locally
- ✅ Show UI and functionality
- ✅ Present proposal
- ✅ Set up Supabase later for production

**Priority:** Focus on congressional meeting prep!  
**Supabase setup:** Can wait until after meeting

---

## 📚 NEED MORE HELP?

**Full detailed guide:** See `/🚀_SUPABASE_SETUP_STEP_BY_STEP.md`

**Supabase docs:** https://supabase.com/docs

**Common issues:** Check troubleshooting section above

---

## ✅ CHECKLIST

- [ ] Supabase project exists
- [ ] SQL script run successfully
- [ ] All 6 tables created
- [ ] Storage bucket `documents` created
- [ ] Storage policies created
- [ ] Email authentication enabled
- [ ] App can connect (no errors)
- [ ] Can create user account
- [ ] Can save case data
- [ ] Can upload documents

**All checked?** ✅ **You're ready to go!** 🚀

---

**Total time: 5-10 minutes**  
**Difficulty: Easy**  
**Status: Production-ready**

🎉 **Congratulations! Your app is now connected to Supabase!** 🎉
