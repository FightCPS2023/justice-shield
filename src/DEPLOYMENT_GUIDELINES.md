# CPS PUNISHER - AI DEPLOYMENT GUIDELINES
**Complete Checklist for Vercel Deployment**

---

## 🎯 CRITICAL: Read This First

This is **The CPS Punisher** - a comprehensive CPS case defense analyzer with 320+ features including:
- Multi-case management system
- Federal Civil Rights Litigation tools
- AI document analysis
- Community Hub with Attorney Directory
- Online notarization service
- Special access code system (`CPSPUNISHER2024`)
- 5-tier subscription model (Free, Essential $39, Professional $79, Attorney $299, Enterprise $999)

**Copyright Owner:** DARREN GUAY (permanent)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. **Verify Core Files Exist**
Check that these critical files are present and correct:

```
✓ /package.json - Contains all dependencies
✓ /vite.config.ts - Vite configuration with React plugin
✓ /vercel.json - Deployment configuration (outputDirectory: "dist")
✓ /tsconfig.json - TypeScript configuration
✓ /postcss.config.js - PostCSS with Tailwind v4
✓ /index.html - Entry point
✓ /App.tsx - Main application component (default export)
✓ /styles/globals.css - Global styles with Tailwind v4 imports
✓ /contexts/SubscriptionContext.tsx - Access control system
```

### 2. **Verify Build Configuration**

**In `/vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**In `/package.json` scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 3. **Verify Import Paths Are Correct**

❌ **DO NOT USE:**
- `import { ... } from 'package@version'` (except for sonner@2.0.3)
- Relative paths like `../../../components`
- Missing file extensions for TypeScript

✅ **CORRECT USAGE:**
- `import { toast } from "sonner@2.0.3"` (only sonner needs version)
- `import { motion } from "motion/react"` (NOT framer-motion)
- All other packages: `import { ... } from 'package-name'`
- Use proper relative paths: `./components/ComponentName`

### 4. **Check for JSX Syntax Errors**

Common issues that **WILL BREAK THE BUILD:**

❌ **WRONG:**
```tsx
<button>More ></button>              // Unescaped >
<span>< 1 minute</span>              // Unescaped <
const x = { text: 'America's' }      // Unescaped apostrophe in single quotes
<div>One</div><div>Two</div>         // Adjacent elements without wrapper
<path d= "M 0 0" />                  // Space before attribute value
```

✅ **CORRECT:**
```tsx
<button>More ></button>
<span>< 1 minute</span>
const x = { text: "America's" }      // Double quotes for apostrophes
<><div>One</div><div>Two</div></>    // Wrapped in fragment
<path d="M 0 0" />                   // No space before value
```

### 5. **Verify Protected Files Are NOT Modified**

These files **MUST NOT** be edited:
```
/components/figma/ImageWithFallback.tsx
```

### 6. **Check Typography Classes**

❌ **DO NOT ADD** unless specifically requested:
- Font size classes: `text-xl`, `text-2xl`, etc.
- Font weight classes: `font-bold`, `font-semibold`, etc.
- Line height classes: `leading-tight`, `leading-none`, etc.

Reason: `/styles/globals.css` has default typography that should not be overridden.

### 7. **Verify Special Access Code System**

**File:** `/contexts/SubscriptionContext.tsx`

Must have:
```typescript
const SPECIAL_ACCESS_CODE = 'CPSPUNISHER2024';
const [hasSpecialAccess, setHasSpecialAccess] = useState(false);
```

Access code unlocks all Enterprise features for trusted users.

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Verify Build Locally (If Possible)
```bash
npm install
npm run build
```
- Should create `/dist` folder
- Should complete without errors
- Check for TypeScript errors
- Check for JSX syntax errors

### Step 2: Vercel Configuration

**In Vercel Dashboard:**
1. Framework Preset: `Vite`
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Install Command: `npm install`
5. Node Version: `18.x` or higher

### Step 3: Environment Variables (Optional)

The app works **WITHOUT** environment variables (uses localStorage by default).

If using Supabase (optional):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Step 4: Domain Configuration

For `cpspunisher.com`:
1. Add domain in Vercel → Project Settings → Domains
2. Add both:
   - `cpspunisher.com`
   - `www.cpspunisher.com`
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate (automatic)

---

## 🔍 POST-DEPLOYMENT VERIFICATION

After deployment, verify these features work:

### Core Functionality:
- [ ] Landing page loads correctly
- [ ] Can create a new case
- [ ] Can upload documents (stored in localStorage)
- [ ] Can add timeline events
- [ ] Violation checker loads all violations
- [ ] Defense strategy generator works
- [ ] Rights guide is accessible
- [ ] Evidence checklist opens

### Premium Features:
- [ ] Special access code dialog appears in header
- [ ] Can enter code: `CPSPUNISHER2024`
- [ ] All features unlock after entering code
- [ ] Federal Civil Rights section accessible
- [ ] Community Hub loads
- [ ] Attorney Directory is functional
- [ ] Notarization service panel opens
- [ ] Multi-case switching works

### UI/UX:
- [ ] Dark mode toggle works
- [ ] Mobile responsive layout works
- [ ] All navigation tabs accessible
- [ ] No console errors in browser DevTools
- [ ] Images and icons load correctly

### Legal Disclaimers:
- [ ] Initial disclaimer modal appears on first load
- [ ] Footer disclaimer is visible
- [ ] AI content disclaimers show where appropriate
- [ ] Copyright shows: "© 2024 DARREN GUAY. All Rights Reserved."

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "No Output Directory named 'dist' found"
**Fix:** Verify `/vercel.json` has `"outputDirectory": "dist"`

### Issue 2: Build fails with JSX syntax error
**Fix:** Check for:
- Unescaped `<`, `>`, `{`, `}` in JSX text
- Apostrophes in single-quoted strings
- Adjacent JSX elements without wrapper
- Spaces before attribute values

### Issue 3: "Cannot read properties of undefined"
**Fix:** Add safety checks to all `.map()` calls:
```typescript
{items?.map((item) => ...) ?? []}
// or
{(items || []).map((item) => ...)}
```

### Issue 4: Page refreshes show 404
**Fix:** Verify `/vercel.json` has rewrites:
```json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

### Issue 5: Tailwind styles not working
**Fix:** Check `/styles/globals.css` has:
```css
@import "tailwindcss";
```

### Issue 6: "Module not found" errors
**Fix:** 
- Verify all imports use correct relative paths
- Check that all imported files exist
- Ensure file extensions match (`.tsx` for React components)

---

## 📋 FINAL PRE-PUBLISH CHECKLIST

Before clicking "Deploy":

- [ ] All files are saved
- [ ] No TypeScript errors in code
- [ ] No JSX syntax errors
- [ ] `/vercel.json` is correctly configured
- [ ] `/package.json` has all required dependencies
- [ ] `/App.tsx` has default export
- [ ] Special access code system is implemented
- [ ] All legal disclaimers are in place
- [ ] Copyright shows DARREN GUAY
- [ ] Protected files not modified
- [ ] Build command is `npm run build`
- [ ] Output directory is `dist`

---

## 🎯 SPECIAL FEATURES TO PRESERVE

### 1. Multi-Case Management
- Must allow creating multiple cases
- Must allow switching between cases
- Case data stored in localStorage or Supabase

### 2. Special Access Code
- Code: `CPSPUNISHER2024`
- Button in header navigation
- Unlocks all Enterprise features
- Persists across sessions

### 3. Subscription Tiers
All 5 tiers must work:
- Free: Limited features
- Essential ($39): Community access
- Professional ($79): AI analysis
- Attorney ($299): Federal tools
- Enterprise ($999): All features

### 4. Federal Civil Rights Section
- Section 1983 lawsuit generator
- Notice of Liability documents
- Federal court removal forms
- Constitutional hearing briefs

### 5. Community Hub
- Advocate & Attorney Directory
- Success stories
- Resource sharing
- Private forums

### 6. Online Notarization
- NotarizationService component
- Integration with third-party service
- Document preparation tools

---

## 📞 DEPLOYMENT SUCCESS CRITERIA

The deployment is successful when:

✅ App loads at cpspunisher.com (or Vercel URL)
✅ No build errors in Vercel deployment logs
✅ No 404 errors on page refresh
✅ All navigation tabs work
✅ Can create and manage cases
✅ Special access code works
✅ Dark mode toggle functions
✅ Mobile responsive design works
✅ All 320+ features are accessible
✅ Legal disclaimers are visible
✅ Copyright shows DARREN GUAY

---

## 🔒 SECURITY & LEGAL NOTES

1. **Data Storage:** App uses localStorage by default (no backend required)
2. **Access Code:** `CPSPUNISHER2024` is visible in frontend code (by design)
3. **Legal Disclaimers:** Must be visible and prominent
4. **Not For:** Collecting PII or securing sensitive data (clearly stated)
5. **Copyright:** DARREN GUAY is permanent copyright holder

---

## 📝 QUICK DEPLOYMENT COMMAND

If using Vercel CLI:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Add domain
vercel domains add cpspunisher.com
```

---

## ✨ FINAL NOTES FOR AI

When deploying or modifying this app:

1. **NEVER** remove or change DARREN GUAY as copyright holder
2. **PRESERVE** the special access code system
3. **MAINTAIN** all 5 subscription tiers
4. **KEEP** all legal disclaimers prominent
5. **ENSURE** all 320+ features remain functional
6. **TEST** multi-case management after any changes
7. **VERIFY** Federal Civil Rights section works
8. **CHECK** Community Hub loads correctly
9. **CONFIRM** notarization service is accessible
10. **VALIDATE** special access code: `CPSPUNISHER2024`

---

**This app represents months of development work to help parents fight for their children. Treat it with care and ensure every feature works perfectly.**

**Copyright © 2024 DARREN GUAY. All Rights Reserved.**

---

**END OF DEPLOYMENT GUIDELINES**
