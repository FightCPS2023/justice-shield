# 🛡️ The CPS Punisher

**Child Protective Services Case Defense Analyzer**

A comprehensive legal defense application helping parents analyze CPS cases, identify violations, track criminal charges, and develop winning defense strategies.

---

## 🌟 **Overview**

The CPS Punisher is a production-ready web application designed to empower parents fighting CPS cases. With 315+ features including AI-powered document analysis, criminal case tracking, federal litigation tools, and a comprehensive community hub, this platform provides everything needed to defend your family and work toward reunification.

**Copyright © 2024 Darren Guay - All Rights Reserved**

---

## ✨ **Key Features**

### **Core Capabilities**
- 🗂️ **Multi-Case Management** - Manage unlimited CPS cases
- 📄 **Document Management** - Upload, analyze, and organize case documents
- ⏱️ **Timeline Builder** - Track events chronologically
- 🚨 **Violation Detection** - Identify 20+ types of rights violations
- ⚖️ **Criminal Case Integration** - Track related criminal charges
- 🛡️ **Defense Strategy** - AI-powered defense recommendations
- 📝 **Document Generation** - 15+ legal document templates
- ⚖️ **Federal Litigation** - Section 1983 lawsuit tools

### **AI-Powered Features**
- 🤖 Automatic violation detection from documents
- 🧠 Timeline event extraction
- 💡 Strategic recommendations
- 📊 Case analysis and insights
- 🎙️ AI-generated case podcasts

### **Professional Tools**
- 👨‍⚖️ Attorney Dashboard with litigation support
- 🔍 Legal research assistant
- 📚 Multi-state law database
- 🌐 Court Listener integration
- 📊 Advanced analytics

### **Community Support**
- 💬 Discussion forums
- 👥 Advocate & Attorney directory (50+ professionals)
- ✅ Success stories
- 📱 Help bot with live support

---

## 🚀 **Tech Stack**

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4.0
- **UI Components:** Radix UI + Custom Components
- **Backend:** Supabase (Auth, Database, Storage)
- **AI Integration:** Google Gemini API
- **Icons:** Lucide React
- **Analytics:** Google Analytics + Sentry
- **Deployment:** Vercel/Netlify Ready

---

## 📋 **Prerequisites**

- Node.js 18+ and npm/yarn
- Supabase account (free tier available)
- Google Gemini API key (optional, for AI features)

---

## 🛠️ **Installation**

### **1. Clone the Repository**
```bash
git clone https://github.com/YOUR_USERNAME/cps-punisher.git
cd cps-punisher
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

### **3. Environment Configuration**

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Analytics (Optional)
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id

# Sentry (Optional)
VITE_SENTRY_DSN=your_sentry_dsn

# Google Gemini API (Optional - can be set by users in-app)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### **4. Start Development Server**
```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`

---

## 🏗️ **Build for Production**

```bash
npm run build
# or
yarn build
```

Production files will be in the `/dist` directory.

### **Preview Production Build**
```bash
npm run preview
# or
yarn preview
```

---

## 🌐 **Deployment**

### ⚠️ **CSS FIX APPLIED** - Ready to Deploy!

**Important:** This app uses Tailwind CSS v4.0. If you previously deployed and saw only black & white HTML, that issue is now **FIXED**! ✅

The following files were updated to ensure CSS loads correctly:
- ✅ `postcss.config.js` - Added autoprefixer
- ✅ `vite.config.ts` - Added build configuration
- ✅ `package.json` - Fixed dependencies and build script

**Quick Deploy Guide:** See `🎨_CSS_FIXED_DEPLOY_NOW.txt` for the fastest path to deployment!

### **Option 1: Vercel Dashboard (EASIEST - Recommended)**

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository (or drag & drop this folder)
4. Settings auto-detect from `vercel.json` ✓
5. Click "Deploy" - Done!

### **Option 2: Vercel CLI**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login and Deploy:
```bash
vercel login
vercel --prod
```

### **Option 3: Automated Deployment Script**

We've created scripts that test, build, and verify CSS compilation:

**Windows:**
```bash
DEPLOY_CSS_FIXED.bat
```

**Mac/Linux:**
```bash
bash DEPLOY_CSS_FIXED.sh
```

These scripts will:
- Clean previous builds
- Install dependencies
- Build with CSS compilation
- Verify CSS files are generated ✓
- Start a local preview for testing
- Show you deployment options

3. Configure custom domain:
```bash
vercel domains add cpspunisher.com
```

### **Option 2: Netlify**

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Configure custom domain in Netlify dashboard

### **Option 3: GitHub Pages**

See detailed GitHub Pages instructions below.

---

## 🔑 **Supabase Setup**

### **1. Create Supabase Project**
- Go to [supabase.com](https://supabase.com)
- Create new project
- Copy Project URL and Anon Key

### **2. Run Database Migration**

Execute this SQL in your Supabase SQL Editor:

```sql
-- Create KV Store Table
CREATE TABLE IF NOT EXISTS kv_store_a24eaa40 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store_a24eaa40(key);

-- Enable Row Level Security (RLS)
ALTER TABLE kv_store_a24eaa40 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" 
ON kv_store_a24eaa40 FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON kv_store_a24eaa40 FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
ON kv_store_a24eaa40 FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Enable delete for authenticated users" 
ON kv_store_a24eaa40 FOR DELETE 
TO authenticated 
USING (true);
```

### **3. Configure Authentication**

In Supabase Dashboard:
- Go to Authentication > Providers
- Enable Email provider
- (Optional) Enable OAuth providers (Google, GitHub, Facebook)

### **4. Set Environment Variables**

Add to your deployment platform:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🎨 **Custom Domain Setup (cpspunisher.com)**

### **For Vercel:**

1. Add domain in Vercel dashboard
2. Configure DNS records at your domain registrar:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### **For Netlify:**

1. Add domain in Netlify dashboard
2. Configure DNS records:
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

### **SSL Certificate**
SSL is automatically provisioned by Vercel/Netlify (free)

---

## 🔐 **Environment Variables**

Required for production:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ Yes |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics ID | ❌ Optional |
| `VITE_SENTRY_DSN` | Sentry error tracking | ❌ Optional |
| `VITE_GEMINI_API_KEY` | Google Gemini API | ❌ Optional* |

*Users can add their own Gemini API key in Settings

---

## 📱 **Features Overview**

### **Tier 1: Free** 🆓
- Multi-case management
- 3 documents per case
- 5 timeline events
- Basic violation checker
- Rights guide
- Community forum access

### **Tier 2: Essential** 💳 $39/month
- Unlimited documents
- Unlimited timeline events
- Full violation checker
- Evidence checklist
- Document generator

### **Tier 3: Professional** 💼 $79/month
- All Essential features
- AI document analysis
- Virtual case binder
- Violation reports
- Criminal case tracking
- Case podcast

### **Tier 4: Attorney** ⚖️ $299/month
- All Professional features
- Attorney dashboard
- Legal research tools
- Court Listener integration
- Advanced analytics
- Citation network

### **Tier 5: Enterprise** 🏢 $999/month
- All Attorney features
- Bulk data management
- Priority support
- Custom integrations
- White-label options

---

## 🧪 **Development**

### **Dev Mode**
Set `DEV_MODE = true` in `/App.tsx` to bypass authentication during development.

⚠️ **IMPORTANT:** Set `DEV_MODE = false` before production deployment!

### **Code Structure**
```
/components          # React components
/contexts           # React contexts
/utils              # Utility functions
/styles             # Global styles
/supabase           # Supabase configuration
/public             # Static assets
```

---

## 🐛 **Error Tracking**

Sentry is integrated for production error monitoring:

1. Create account at [sentry.io](https://sentry.io)
2. Create new project
3. Add `VITE_SENTRY_DSN` to environment variables

---

## 📊 **Analytics**

Google Analytics 4 is integrated:

1. Create GA4 property
2. Add `VITE_GA_MEASUREMENT_ID` to environment variables

---

## 🔧 **Troubleshooting**

### **Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Supabase Connection Issues**
- Verify environment variables
- Check Supabase project status
- Ensure RLS policies are configured

### **CSS Not Loading**
- Check Tailwind configuration
- Verify `/styles/globals.css` is imported in `/App.tsx`

---

## 📄 **License**

**Copyright © 2024 Darren Guay - All Rights Reserved**

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

---

## 🤝 **Support**

For support, please use the in-app Help Bot or contact:
- **Email:** support@cpspunisher.com (configure with your email)
- **Website:** https://cpspunisher.com

---

## 🎯 **Roadmap**

- [ ] Mobile app (iOS/Android)
- [ ] Court deadline reminders
- [ ] Attorney collaboration tools
- [ ] Video evidence uploads
- [ ] Multi-language support
- [ ] State-specific case law database

---

## 🙏 **Acknowledgments**

Built to help families fight for their children and constitutional rights.

**Every family deserves a fighting chance. Every child deserves to be home.**

---

## 📈 **Stats**

- **315+ Features**
- **50+ React Components**
- **20+ AI-Powered Tools**
- **5 Subscription Tiers**
- **Multi-Case Support**
- **100% Type-Safe with TypeScript**

---

**🛡️ Fight Back. Defend Your Family. The CPS Punisher.**

**Copyright © 2024 Darren Guay - All Rights Reserved**