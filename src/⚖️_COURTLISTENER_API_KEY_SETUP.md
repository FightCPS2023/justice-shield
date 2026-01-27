# ⚖️ HOW TO ADD COURTLISTENER API KEY (3 MINUTES)

## 📍 WHAT TO DO

**Add this line to your `.env` file:**

```env
VITE_COURTLISTENER_API_KEY=your-actual-key-here
```

---

## ✅ STEP-BY-STEP

### Step 1: Get Your CourtListener API Key (2 minutes)

1. **Go to:** https://www.courtlistener.com/api/
2. **Click "Sign Up"** (top right)
3. **Create free account**
4. **After signup, go to:** https://www.courtlistener.com/profile/api/
5. **Click "Generate API Key"**
6. **Copy the key** (looks like: `abc123def456ghi789`)

---

### Step 2: Add to Your `.env` File (1 minute)

**Open your `.env` file (in project root folder) and add this line:**

```env
VITE_COURTLISTENER_API_KEY=abc123def456ghi789
```

**Replace `abc123def456ghi789` with your actual key!**

---

### Step 3: Restart Your Dev Server

```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

**Done! ✅**

---

## 📁 WHERE IS THE `.env` FILE?

**Location:** Root folder of your project

```
your-project/
├── .env  👈 OPEN THIS FILE!
├── App.tsx
├── package.json
└── ...
```

---

## ✅ COMPLETE EXAMPLE

**Your `.env` file should look like this:**

```env
# ============================================
# THE CPS PUNISHER - API KEYS
# ============================================

# Database & Auth (REQUIRED)
VITE_SUPABASE_URL=https://abcdefghij.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Analysis (REQUIRED)
VITE_GEMINI_API_KEY=AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54

# Payments (OPTIONAL)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51abc123...

# Legal Research (OPTIONAL) 👈 ADD THIS!
VITE_COURTLISTENER_API_KEY=abc123def456ghi789
```

---

## ❓ WHY DO I NEED THIS?

**Without CourtListener key:**
- ✅ App works fine
- ✅ Basic legal search works
- ❌ Limited to 100 search results per day

**With CourtListener key (FREE):**
- ✅ 5,000 search results per day
- ✅ Access to 50M+ court opinions
- ✅ Full PACER documents
- ✅ Attorney and party information
- ✅ Citation networks

---

## 🚨 TROUBLESHOOTING

### "I don't see a `.env` file!"

**Create it:**

1. Open your code editor
2. Create new file named `.env`
3. Save in project root folder
4. Paste the template above

**Or in terminal:**

```bash
# Mac/Linux
touch .env

# Windows (PowerShell)
New-Item .env
```

---

### "My key isn't working!"

**Checklist:**

- [ ] Key is on its own line
- [ ] No spaces around the `=` sign
- [ ] Key starts with `VITE_` prefix
- [ ] Restarted dev server
- [ ] File is named `.env` (not `.env.txt`)

---

### "Where do I find the API key after signing up?"

**Direct link after signup:**
https://www.courtlistener.com/profile/api/

**Or navigate:**
1. Click your username (top right)
2. Click "Profile"
3. Click "API" tab
4. Click "Generate API Key"

---

## 📊 WHAT YOU GET

### Free Tier Benefits:

| Feature | Without Key | With Free Key |
|---------|-------------|---------------|
| Search Results | 100/day | 5,000/day |
| Court Opinions | Basic | 50M+ full access |
| PACER Documents | Limited | Full access |
| Attorney Info | No | Yes |
| Party Info | No | Yes |
| Citation Networks | No | Yes |
| Oral Arguments | Limited | Full access |
| Judge Research | Limited | Full access |

**Cost:** $0 (FREE forever!)

---

## ✅ QUICK CHECK

**Test if it's working:**

1. Add key to `.env`
2. Restart server: `npm run dev`
3. Open browser console (F12)
4. Look for: "CourtListener API configured"
5. Try legal research feature
6. Should work! ✅

---

## 🎯 SUMMARY

**3 simple steps:**

1. **Get key:** https://www.courtlistener.com/profile/api/
2. **Add to `.env`:** `VITE_COURTLISTENER_API_KEY=your-key`
3. **Restart server:** `npm run dev`

**That's it! 🎉**

---

## 📚 MORE INFO

**Full API documentation:**
- CourtListener: https://www.courtlistener.com/help/api/
- Our guide: `/✅_COURTLISTENER_API_V4_ENHANCED.md`
- All API keys: `/🔑_WHERE_API_KEYS_GO.md`

---

*Last Updated: January 9, 2026*  
*Status: OPTIONAL (but highly recommended!)*  
*Time to Setup: 3 minutes*  
*Cost: FREE*

**FREE 5,000 searches/day vs 100/day - worth 3 minutes! 🚀**
