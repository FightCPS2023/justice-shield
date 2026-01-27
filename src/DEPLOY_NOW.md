# 🚀 DEPLOY TO SUPABASE - QUICK START

## ⚡ SUPER FAST VERSION (5 Minutes)

```bash
# 1. Install CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Deploy
supabase functions deploy server --project-ref rewgkrgmcmikivxjnfdq

# 4. Test
curl https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/community/advocates

# DONE! ✅
```

---

## 📋 WHAT THIS DOES

Deploys your server code to Supabase so:
- ✅ Community data can seed
- ✅ Advocate directory works
- ✅ Resource hub works
- ✅ No more console errors
- ✅ All features functional

---

## 🎯 YOUR PROJECT DETAILS

| Setting | Value |
|---------|-------|
| **Project ID** | `rewgkrgmcmikivxjnfdq` |
| **Server URL** | `https://rewgkrgmcmikivxjnfdq.supabase.co` |
| **Function Name** | `server` |
| **Function URL** | `https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/` |

---

## ✅ WHAT'S ALREADY DONE

- ✅ Server code written (in `/supabase/functions/server/`)
- ✅ Database table created (`kv_store_a24eaa40`)
- ✅ Environment variables set
- ✅ All routes configured
- ✅ Error handling in place

---

## 🚀 WHAT YOU NEED TO DO

**Just deploy the function!**

That's it. One command:

```bash
supabase functions deploy server --project-ref rewgkrgmcmikivxjnfdq
```

---

## 🧪 TEST AFTER DEPLOYMENT

### **1. Test Advocate Endpoint:**
```bash
curl https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/community/advocates
```

**Should return:** `{"data": []}`

---

### **2. Seed Community Data:**
```bash
curl -X POST https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/community/admin/seed-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ"
```

**Should return:**
```json
{
  "message": "Data seeded successfully",
  "advocates": 5,
  "resources": 10
}
```

---

### **3. Refresh Your App:**
- Open app
- Press F12 (console)
- Refresh page
- Should see: ✅ "Community data seeded" (no errors!)

---

## 🔍 CHECK DEPLOYMENT STATUS

**Dashboard:**
https://supabase.com/dashboard/project/rewgkrgmcmikivxjnfdq/functions

**Logs:**
https://supabase.com/dashboard/project/rewgkrgmcmikivxjnfdq/logs/edge-functions

---

## 🎉 THAT'S IT!

**3 commands, 5 minutes, done!**

Need more details? See `/SUPABASE_SETUP_GUIDE.md`

---

**Quick Links:**
- [Supabase Dashboard](https://supabase.com/dashboard/project/rewgkrgmcmikivxjnfdq)
- [Edge Functions](https://supabase.com/dashboard/project/rewgkrgmcmikivxjnfdq/functions)
- [Function Logs](https://supabase.com/dashboard/project/rewgkrgmcmikivxjnfdq/logs/edge-functions)
