# 🚀 SUPABASE SETUP - COMPLETE STEP-BY-STEP GUIDE

**App:** The CPS Punisher  
**Goal:** Connect your app to Supabase so everything works properly  
**Time:** 15-30 minutes  
**Difficulty:** Easy (just follow the steps!)

---

## 📋 TABLE OF CONTENTS

1. [What You Already Have](#what-you-already-have)
2. [What Needs Supabase](#what-needs-supabase)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Create Database Tables](#create-database-tables)
5. [Enable Authentication](#enable-authentication)
6. [Deploy the Server Function](#deploy-the-server-function)
7. [Test Everything](#test-everything)
8. [Troubleshooting](#troubleshooting)

---

## ✅ WHAT YOU ALREADY HAVE

**Good news!** Your app is already configured to connect to Supabase:

```
Project ID: rewgkrgmcmikivxjnfdq
Supabase URL: https://rewgkrgmcmikivxjnfdq.supabase.co
Anon Key: eyJhbGci... (already in your code)
```

✅ **Credentials are already in the app** (`/utils/supabase/info.tsx`)  
✅ **App is ready to connect**  
✅ **You just need to set up the database!**

---

## 🎯 WHAT NEEDS SUPABASE

Your app has these features that require Supabase to be set up:

### **1. User Accounts & Authentication**
- Sign up / Log in
- Password reset
- User profiles
- Multi-user support

### **2. Multi-Case Management**
- Save multiple cases
- Store case data in cloud
- Access cases from any device
- Share cases with attorneys

### **3. Document Storage**
- Upload documents to cloud
- Store PDFs, images, evidence
- Retrieve documents anytime

### **4. AI Analysis History**
- Save AI analysis results
- Track all document analyses
- Review past AI insights

### **5. Community Hub** (Optional)
- Advocate directory
- Resource links
- User submissions

---

## 🚀 STEP-BY-STEP SETUP

### **STEP 1: Verify Supabase Project Exists**

1. **Go to:** https://supabase.com
2. **Log in** with your account
3. **Look for project:** `rewgkrgmcmikivxjnfdq`
4. **If you see it:** Great! Continue to Step 2
5. **If you DON'T see it:** You need to create the project first

---

### **STEP 2: Create Supabase Project** (If Needed)

**If project doesn't exist yet:**

1. **Go to:** https://app.supabase.com
2. **Click:** "New Project"
3. **Enter:**
   - **Project Name:** `The CPS Punisher`
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to you (e.g., `us-east-1`)
4. **Click:** "Create new project"
5. **Wait:** 2-3 minutes for setup

**IMPORTANT:** If you create a NEW project, you'll need to update the credentials in `/utils/supabase/info.tsx`

---

### **STEP 3: Get Your Supabase Credentials**

1. **In Supabase Dashboard, click:** "Project Settings" (gear icon, bottom left)
2. **Click:** "API" in the sidebar
3. **You'll see:**
   - **Project URL:** `https://[your-project].supabase.co`
   - **anon public key:** Long token starting with `eyJh...`
   - **service_role key:** Another long token (keep this SECRET!)

4. **Verify these match your app:**
   - Open `/utils/supabase/info.tsx`
   - Check that `projectId` and `publicAnonKey` match
   - If they DON'T match, update the file

---

### **STEP 4: Install Supabase CLI** (On Your Computer)

**You need the Supabase CLI to deploy the server function.**

**On macOS:**
```bash
brew install supabase/tap/supabase
```

**On Windows:**
```bash
scoop install supabase
```

**Or using npm (any OS):**
```bash
npm install -g supabase
```

**Verify installation:**
```bash
supabase --version
```

Should show version number like `1.x.x`

---

### **STEP 5: Log In to Supabase CLI**

1. **Run this command:**
   ```bash
   supabase login
   ```

2. **Browser will open** for authentication

3. **Log in** with your Supabase account

4. **Return to terminal**

5. **Verify login:**
   ```bash
   supabase projects list
   ```
   
   Should show your project: `rewgkrgmcmikivxjnfdq`

---

### **STEP 6: Link Your Local Project**

**From your project directory:**

```bash
# Make sure you're in the project root
cd /path/to/your/cps-punisher-project

# Link to your Supabase project
supabase link --project-ref rewgkrgmcmikivxjnfdq
```

**Enter your database password** when prompted (from Step 2)

✅ **Success message:** "Linked to project rewgkrgmcmikivxjnfdq"

---

## 📊 CREATE DATABASE TABLES

Now you need to create the database tables for your app to store data.

### **STEP 7: Create Tables in Supabase**

1. **Go to Supabase Dashboard**
2. **Click:** "Table Editor" (database icon on left)
3. **Click:** "New Table" (top right)

---

#### **Table 1: `cases` - Store User Cases**

**Create table with these settings:**

**Table Name:** `cases`

**Columns:**
| Column Name | Type | Default | Primary | Nullable | Unique |
|-------------|------|---------|---------|----------|--------|
| `id` | uuid | `uuid_generate_v4()` | ✅ Yes | ❌ No | ✅ Yes |
| `user_id` | uuid | | ❌ No | ❌ No | ❌ No |
| `created_at` | timestamptz | `now()` | ❌ No | ❌ No | ❌ No |
| `updated_at` | timestamptz | `now()` | ❌ No | ❌ No | ❌ No |
| `case_name` | text | | ❌ No | ❌ No | ❌ No |
| `case_number` | text | | ❌ No | ✅ Yes | ❌ No |
| `status` | text | `'active'` | ❌ No | ❌ No | ❌ No |
| `data` | jsonb | `'{}'::jsonb` | ❌ No | ❌ No | ❌ No |

**Enable Row Level Security (RLS):**
- ✅ Check "Enable Row Level Security"

**RLS Policy:**
```sql
-- Allow users to see only their own cases
CREATE POLICY "Users can view own cases"
ON cases FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert own cases
CREATE POLICY "Users can insert own cases"
ON cases FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update own cases
CREATE POLICY "Users can update own cases"
ON cases FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete own cases
CREATE POLICY "Users can delete own cases"
ON cases FOR DELETE
USING (auth.uid() = user_id);
```

**Click:** "Save" to create table

---

#### **Table 2: `documents` - Store Document Metadata**

**Table Name:** `documents`

**Columns:**
| Column Name | Type | Default | Primary | Nullable | Unique |
|-------------|------|---------|---------|----------|--------|
| `id` | uuid | `uuid_generate_v4()` | ✅ Yes | ❌ No | ✅ Yes |
| `case_id` | uuid | | ❌ No | ❌ No | ❌ No |
| `user_id` | uuid | | ❌ No | ❌ No | ❌ No |
| `created_at` | timestamptz | `now()` | ❌ No | ❌ No | ❌ No |
| `name` | text | | ❌ No | ❌ No | ❌ No |
| `type` | text | | ❌ No | ❌ No | ❌ No |
| `storage_path` | text | | ❌ No | ❌ No | ❌ No |
| `size` | bigint | | ❌ No | ✅ Yes | ❌ No |
| `ai_analysis` | jsonb | `'{}'::jsonb` | ❌ No | ✅ Yes | ❌ No |

**Enable RLS:**
```sql
CREATE POLICY "Users can view own documents"
ON documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
ON documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
ON documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
ON documents FOR DELETE
USING (auth.uid() = user_id);
```

---

#### **Table 3: `user_profiles` - Store User Information**

**Table Name:** `user_profiles`

**Columns:**
| Column Name | Type | Default | Primary | Nullable | Unique |
|-------------|------|---------|---------|----------|--------|
| `id` | uuid | `uuid_generate_v4()` | ✅ Yes | ❌ No | ✅ Yes |
| `user_id` | uuid | | ❌ No | ❌ No | ✅ Yes |
| `created_at` | timestamptz | `now()` | ❌ No | ❌ No | ❌ No |
| `updated_at` | timestamptz | `now()` | ❌ No | ❌ No | ❌ No |
| `full_name` | text | | ❌ No | ✅ Yes | ❌ No |
| `email` | text | | ❌ No | ❌ No | ✅ Yes |
| `subscription_tier` | text | `'free'` | ❌ No | ❌ No | ❌ No |
| `preferences` | jsonb | `'{}'::jsonb` | ❌ No | ❌ No | ❌ No |

**Enable RLS:**
```sql
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

#### **Table 4: `ai_analyses` - Store AI Analysis History**

**Table Name:** `ai_analyses`

**Columns:**
| Column Name | Type | Default | Primary | Nullable | Unique |
|-------------|------|---------|---------|----------|--------|
| `id` | uuid | `uuid_generate_v4()` | ✅ Yes | ❌ No | ✅ Yes |
| `user_id` | uuid | | ❌ No | ❌ No | ❌ No |
| `case_id` | uuid | | ❌ No | ✅ Yes | ❌ No |
| `document_id` | uuid | | ❌ No | ✅ Yes | ❌ No |
| `created_at` | timestamptz | `now()` | ❌ No | ❌ No | ❌ No |
| `analysis_type` | text | | ❌ No | ❌ No | ❌ No |
| `input_text` | text | | ❌ No | ❌ No | ❌ No |
| `result` | jsonb | `'{}'::jsonb` | ❌ No | ❌ No | ❌ No |

**Enable RLS:**
```sql
CREATE POLICY "Users can view own analyses"
ON ai_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
ON ai_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

### **STEP 8: Set Up Storage Buckets**

**For document uploads:**

1. **In Supabase Dashboard, click:** "Storage" (folder icon on left)
2. **Click:** "New Bucket"
3. **Create bucket:**
   - **Name:** `documents`
   - **Public:** ❌ No (private)
   - **File size limit:** 50 MB
4. **Click:** "Create bucket"

**Set up storage policies:**

Click on `documents` bucket → "Policies" tab → "New Policy"

```sql
-- Allow users to upload their own files
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view own files
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete own files
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### **STEP 9: Enable Authentication**

**Email/Password Authentication:**

1. **In Supabase Dashboard, click:** "Authentication" (user icon on left)
2. **Click:** "Providers" tab
3. **Enable:** "Email" provider (should already be enabled)
4. **Settings:**
   - ✅ Enable email confirmations
   - ✅ Enable password recovery
   - Set "Site URL" to your app URL (for dev: `http://localhost:5173`)

**Email Templates (Optional but Recommended):**

Go to "Email Templates" and customize:
- Confirmation email
- Password reset email
- Magic link email

---

## 🖥️ DEPLOY THE SERVER FUNCTION

### **STEP 10: Deploy Edge Function**

**Your app has a server function for the Community Hub. Deploy it:**

1. **Make sure you're in project root:**
   ```bash
   cd /path/to/your/cps-punisher-project
   ```

2. **Deploy the function:**
   ```bash
   supabase functions deploy make-server-a24eaa40 --project-ref rewgkrgmcmikivxjnfdq
   ```

3. **Wait for deployment** (30-60 seconds)

4. **Success message:**
   ```
   Deployed Function make-server-a24eaa40 version xxx
   ```

5. **Verify deployment:**
   ```bash
   curl https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/health
   ```
   
   Should return: `{"status":"ok"}`

---

### **STEP 11: Create Community Tables** (For Community Hub)

**Table 5: `advocates`**

**Table Name:** `advocates`

**Columns:**
| Column Name | Type | Default | Primary | Nullable | Unique |
|-------------|------|---------|---------|----------|--------|
| `id` | uuid | `uuid_generate_v4()` | ✅ Yes | ❌ No | ✅ Yes |
| `created_at` | timestamptz | `now()` | ❌ No | ❌ No | ❌ No |
| `type` | text | | ❌ No | ❌ No | ❌ No |
| `name` | text | | ❌ No | ❌ No | ❌ No |
| `email` | text | | ❌ No | ❌ No | ❌ No |
| `phone` | text | | ❌ No | ❌ No | ❌ No |
| `state` | text | | ❌ No | ❌ No | ❌ No |
| `verified` | boolean | `false` | ❌ No | ❌ No | ❌ No |
| `data` | jsonb | `'{}'::jsonb` | ❌ No | ❌ No | ❌ No |

**Enable RLS:**
```sql
-- Anyone can view verified advocates
CREATE POLICY "Public can view verified advocates"
ON advocates FOR SELECT
USING (verified = true);

-- Only authenticated users can submit
CREATE POLICY "Authenticated users can submit"
ON advocates FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

---

**Table 6: `resources`**

**Table Name:** `resources`

**Columns:**
| Column Name | Type | Default | Primary | Nullable | Unique |
|-------------|------|---------|---------|----------|--------|
| `id` | uuid | `uuid_generate_v4()` | ✅ Yes | ❌ No | ✅ Yes |
| `created_at` | timestamptz | `now()` | ❌ No | ❌ No | ❌ No |
| `title` | text | | ❌ No | ❌ No | ❌ No |
| `url` | text | | ❌ No | ❌ No | ❌ No |
| `description` | text | | ❌ No | ❌ No | ❌ No |
| `category` | text | | ❌ No | ❌ No | ❌ No |
| `verified` | boolean | `false` | ❌ No | ❌ No | ❌ No |
| `upvotes` | integer | `0` | ❌ No | ❌ No | ❌ No |
| `data` | jsonb | `'{}'::jsonb` | ❌ No | ❌ No | ❌ No |

**Enable RLS:**
```sql
-- Anyone can view verified resources
CREATE POLICY "Public can view verified resources"
ON resources FOR SELECT
USING (verified = true);

-- Authenticated users can submit
CREATE POLICY "Authenticated users can submit"
ON resources FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

---

### **STEP 12: Seed Community Data**

**Populate initial data for Community Hub:**

```bash
curl -X POST https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/community/admin/seed-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ"
```

**Success response:**
```json
{
  "message": "Data seeded successfully",
  "advocates": 5,
  "resources": 10
}
```

---

## ✅ TEST EVERYTHING

### **STEP 13: Test Your App**

1. **Open your app** in browser
2. **Open console** (F12)
3. **Refresh page**

**Check console for:**
```
✅ Initializing community data...
✅ Community data seeded: { advocates: 5, resources: 10 }
```

---

### **STEP 14: Test User Authentication**

1. **Click "Sign Up"** in your app
2. **Create account:**
   - Email: `test@example.com`
   - Password: `TestPassword123!`
3. **Check email** for confirmation link
4. **Click confirmation link**
5. **Log in** to your app

**Verify:**
- ✅ User can sign up
- ✅ User receives confirmation email
- ✅ User can log in
- ✅ User profile is created

---

### **STEP 15: Test Case Management**

1. **Create a case** in your app
2. **Add case details**
3. **Save case**
4. **Refresh page**
5. **Case should still be there** (loaded from Supabase)

**Verify in Supabase:**
1. Go to "Table Editor"
2. Open `cases` table
3. You should see your case data

---

### **STEP 16: Test Document Upload**

1. **Upload a document** to a case
2. **Check Storage:**
   - Supabase Dashboard → Storage → `documents` bucket
   - You should see your uploaded file

---

### **STEP 17: Test Community Hub**

1. **Go to Community Hub** in app
2. **Advocate Directory:**
   - Should show 5 sample advocates
3. **Resource Library:**
   - Should show 10 sample resources

---

## 🐛 TROUBLESHOOTING

### **Problem: "Failed to connect to Supabase"**

**Solution:**
1. Check your internet connection
2. Verify Supabase project is running (not paused)
3. Check credentials in `/utils/supabase/info.tsx` match your project
4. Clear browser cache and reload

---

### **Problem: "Row Level Security policy violation"**

**Solution:**
1. Make sure RLS policies are created (Step 7)
2. User must be logged in to access data
3. Check that policies match user_id correctly

---

### **Problem: "Storage upload failed"**

**Solution:**
1. Check storage bucket exists (`documents`)
2. Verify storage policies are created (Step 8)
3. Check file size is under 50 MB
4. User must be authenticated

---

### **Problem: "Community data seed failed"**

**Solution:**
1. Make sure server function is deployed (Step 10)
2. Check that `advocates` and `resources` tables exist (Step 11)
3. Run seed command manually (Step 12)
4. Check Supabase function logs for errors

---

### **Problem: "Can't log in / Sign up doesn't work"**

**Solution:**
1. Check email provider is enabled (Step 9)
2. Verify Site URL is set correctly
3. Check email inbox (including spam)
4. Try password reset flow
5. Check Supabase Auth logs for errors

---

## 📊 VERIFICATION CHECKLIST

**Before considering setup complete, verify:**

- [ ] ✅ Supabase project exists and is active
- [ ] ✅ Credentials in `/utils/supabase/info.tsx` are correct
- [ ] ✅ Database tables created: `cases`, `documents`, `user_profiles`, `ai_analyses`
- [ ] ✅ RLS policies created for all tables
- [ ] ✅ Storage bucket `documents` created
- [ ] ✅ Storage policies created
- [ ] ✅ Email authentication enabled
- [ ] ✅ Server function deployed successfully
- [ ] ✅ Community tables created: `advocates`, `resources`
- [ ] ✅ Community data seeded
- [ ] ✅ Can create user account
- [ ] ✅ Can log in successfully
- [ ] ✅ Can create and save case
- [ ] ✅ Can upload document
- [ ] ✅ Community Hub shows data
- [ ] ✅ All features working properly

---

## 🎯 QUICK SETUP SCRIPT (ADVANCED)

**If you're comfortable with SQL, run this all at once:**

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

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Cases policies
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

-- Create advocates table
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

-- Create resources table
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

**Run this in:** Supabase Dashboard → SQL Editor → "New Query" → Paste → "Run"

---

## 🎉 YOU'RE DONE!

**Your Supabase setup is complete!**

✅ **Database tables created**  
✅ **Authentication enabled**  
✅ **Storage configured**  
✅ **Server function deployed**  
✅ **Community data seeded**  
✅ **App fully connected**

---

## 📞 NEXT STEPS

1. **Test all features** thoroughly
2. **Create a few test cases** to verify everything works
3. **Upload some documents** to test storage
4. **Try the Community Hub** to see advocates and resources
5. **Ready for production!** 🚀

---

## 🇺🇸 FOCUS ON YOUR CONGRESSIONAL MEETING!

**Good news:** The app works WITHOUT Supabase setup for demo purposes!

For tomorrow's congressional meeting:
- ✅ App runs fine locally
- ✅ All UI features work
- ✅ You can demonstrate everything
- ✅ Supabase can be set up later for production

**Complete Supabase setup AFTER your meeting when you have more time!**

---

**Questions? Issues? Check the troubleshooting section or Supabase documentation at https://supabase.com/docs**

🚀 **Good luck with your setup and your congressional meeting!** 🇺🇸
