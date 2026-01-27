# DNS Configuration Guide for cpspunisher.com
# Step-by-step DNS setup for popular domain registrars

---

## DNS Records You Need to Add

### For cpspunisher.com (root domain):
```
Type: A
Name: @ (or leave blank, or cpspunisher.com)
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

### For www.cpspunisher.com (www subdomain):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

---

## GoDaddy DNS Setup

1. **Login** to https://account.godaddy.com
2. Click **My Products**
3. Find **cpspunisher.com** → Click **DNS**
4. Scroll to **Records** section

### Add A Record:
- Click **Add** button
- **Type:** A
- **Name:** @ 
- **Value:** 76.76.21.21
- **TTL:** 1 Hour (or leave default)
- Click **Save**

### Add CNAME Record:
- Click **Add** button
- **Type:** CNAME
- **Name:** www
- **Value:** cname.vercel-dns.com
- **TTL:** 1 Hour
- Click **Save**

**Note:** You may need to delete existing A or CNAME records for @ and www first.

**Propagation Time:** Usually 10-30 minutes, up to 48 hours

---

## Namecheap DNS Setup

1. **Login** to https://www.namecheap.com
2. Go to **Domain List**
3. Find **cpspunisher.com** → Click **Manage**
4. Click **Advanced DNS** tab

### Add A Record:
- Click **Add New Record**
- **Type:** A Record
- **Host:** @
- **Value:** 76.76.21.21
- **TTL:** Automatic
- Click green checkmark to save

### Add CNAME Record:
- Click **Add New Record**
- **Type:** CNAME Record
- **Host:** www
- **Value:** cname.vercel-dns.com
- **TTL:** Automatic
- Click green checkmark to save

**Propagation Time:** Usually instant to 30 minutes

---

## Cloudflare DNS Setup

1. **Login** to https://dash.cloudflare.com
2. Select **cpspunisher.com**
3. Click **DNS** in the left menu
4. Go to **Records** section

### Add A Record:
- Click **Add record**
- **Type:** A
- **Name:** @ (or cpspunisher.com)
- **IPv4 address:** 76.76.21.21
- **Proxy status:** Orange cloud (Proxied) - **RECOMMENDED**
  - This enables Cloudflare's CDN and SSL
  - Or gray cloud (DNS only) if you prefer Vercel's CDN
- **TTL:** Auto
- Click **Save**

### Add CNAME Record:
- Click **Add record**
- **Type:** CNAME
- **Name:** www
- **Target:** cname.vercel-dns.com
- **Proxy status:** Orange cloud (Proxied) - **RECOMMENDED**
- **TTL:** Auto
- Click **Save**

**Important for Cloudflare:**
- If using orange cloud (Proxied), Cloudflare handles SSL automatically
- If using gray cloud (DNS only), Vercel handles SSL
- **Recommended:** Use orange cloud for extra security and performance

**Propagation Time:** Usually instant to 5 minutes

---

## Google Domains DNS Setup

1. **Login** to https://domains.google.com
2. Find **cpspunisher.com** → Click **Manage**
3. Click **DNS** in the left menu
4. Scroll to **Custom records**

### Add A Record:
- **Host name:** @ (leave blank)
- **Type:** A
- **TTL:** 3600
- **Data:** 76.76.21.21
- Click **Add**

### Add CNAME Record:
- **Host name:** www
- **Type:** CNAME
- **TTL:** 3600
- **Data:** cname.vercel-dns.com
- Click **Add**

**Propagation Time:** Usually 10-15 minutes

---

## Bluehost DNS Setup

1. **Login** to https://my.bluehost.com
2. Go to **Domains** → **Zone Editor**
3. Find **cpspunisher.com**

### Add A Record:
- Click **Add Record**
- **Type:** A
- **Host Record:** @ (or leave blank)
- **Points To:** 76.76.21.21
- **TTL:** 14400 (or leave default)
- Click **Add Record**

### Add CNAME Record:
- Click **Add Record**
- **Type:** CNAME
- **Host Record:** www
- **Points To:** cname.vercel-dns.com
- **TTL:** 14400
- Click **Add Record**

**Propagation Time:** Usually 30 minutes to 4 hours

---

## HostGator DNS Setup

1. **Login** to your HostGator cPanel
2. Go to **Domains** → **Zone Editor**
3. Find **cpspunisher.com** → Click **Manage**

### Add A Record:
- **Name:** @ (or cpspunisher.com)
- **Type:** A
- **Record:** 76.76.21.21
- **TTL:** 14400
- Click **Add An A Record**

### Add CNAME Record:
- **Name:** www
- **Type:** CNAME
- **CNAME:** cname.vercel-dns.com
- **TTL:** 14400
- Click **Add a CNAME Record**

**Propagation Time:** Usually 30 minutes to 4 hours

---

## Domain.com DNS Setup

1. **Login** to https://www.domain.com
2. Go to **My Domains**
3. Find **cpspunisher.com** → Click **Manage**
4. Click **DNS & Nameservers** in left menu

### Add A Record:
- Click **Add DNS Record**
- **Type:** A
- **Name:** @ (leave blank for root)
- **Content:** 76.76.21.21
- **TTL:** 3600
- Click **Add DNS Record**

### Add CNAME Record:
- Click **Add DNS Record**
- **Type:** CNAME
- **Name:** www
- **Content:** cname.vercel-dns.com
- **TTL:** 3600
- Click **Add DNS Record**

**Propagation Time:** Usually 15-30 minutes

---

## Hover DNS Setup

1. **Login** to https://www.hover.com/signin
2. Click on **cpspunisher.com**
3. Click **DNS** tab

### Add A Record:
- Click **Add New**
- **Type:** A
- **Hostname:** @
- **IP Address:** 76.76.21.21
- **TTL:** Default
- Click **Save**

### Add CNAME Record:
- Click **Add New**
- **Type:** CNAME
- **Hostname:** www
- **Target Name:** cname.vercel-dns.com
- **TTL:** Default
- Click **Save**

**Propagation Time:** Usually 15-60 minutes

---

## Generic Registrar Instructions

If your registrar isn't listed above, follow these general steps:

1. **Login** to your domain registrar's control panel
2. Find **DNS Management**, **DNS Settings**, or **Zone Editor**
3. Look for **cpspunisher.com**
4. **Add or edit records:**

### A Record (Root Domain):
```
Type/Record Type: A
Host/Name/Hostname: @ or blank or cpspunisher.com
Value/Points To/IP Address: 76.76.21.21
TTL: 3600 or Auto or Default
```

### CNAME Record (WWW Subdomain):
```
Type/Record Type: CNAME
Host/Name/Hostname: www
Value/Points To/Target: cname.vercel-dns.com
TTL: 3600 or Auto or Default
```

5. **Save** the records
6. **Wait** for DNS propagation (5 minutes to 48 hours)

---

## Important Notes

### Delete Conflicting Records
Before adding new records, you may need to **delete existing records** for:
- @ (root domain) A record
- www CNAME record
- Any parking page redirects

### Don't Use CNAME for Root Domain
- ❌ **Wrong:** CNAME @ → cname.vercel-dns.com
- ✅ **Correct:** A @ → 76.76.21.21

Why? DNS standards don't allow CNAME records for root domains. Always use A record for @.

### Cloudflare Users - Special Instructions
If you use Cloudflare:
1. You can use **either** Vercel's DNS setup **or** Cloudflare Proxy
2. **Recommended:** Use Cloudflare Proxy (orange cloud) for:
   - Extra DDoS protection
   - Additional CDN layer
   - Cloudflare's WAF (Web Application Firewall)
3. If proxying through Cloudflare, you still use the same DNS records

### Multiple Domains or Subdomains
If you want additional domains (e.g., thecpspunisher.com):
1. Add each domain in Vercel: `vercel domains add thecpspunisher.com`
2. Add the same DNS records for each domain

---

## Verify DNS Configuration

After adding DNS records, verify they're working:

### Method 1: Online DNS Checker
- Visit: https://dnschecker.org
- Enter: cpspunisher.com
- Check if it resolves to 76.76.21.21 globally

### Method 2: Command Line (Windows)
```cmd
nslookup cpspunisher.com
```

### Method 3: Command Line (Mac/Linux)
```bash
dig cpspunisher.com
```

You should see 76.76.21.21 in the response.

### Check CNAME for www:
```bash
dig www.cpspunisher.com
# or
nslookup www.cpspunisher.com
```

You should see cname.vercel-dns.com in the response.

---

## DNS Propagation Timeline

| Registrar | Typical Time | Maximum Time |
|-----------|--------------|--------------|
| Cloudflare | Instant - 5 min | 30 min |
| Namecheap | 5-30 min | 2 hours |
| Google Domains | 10-15 min | 1 hour |
| GoDaddy | 10-30 min | 48 hours |
| Bluehost | 30 min - 2 hours | 4 hours |
| HostGator | 30 min - 2 hours | 4 hours |
| Domain.com | 15-30 min | 4 hours |
| Hover | 15-60 min | 4 hours |
| Others | 30 min - 4 hours | 48 hours |

**Note:** These are estimates. DNS propagation depends on:
- Your registrar's systems
- Your local ISP's DNS cache
- Global DNS cache servers

---

## Troubleshooting DNS Issues

### Problem: "Domain not resolving after 48 hours"
**Solutions:**
1. Double-check DNS records are correct
2. Ensure no typos in IP address or CNAME target
3. Contact your registrar's support
4. Try flushing your local DNS cache:
   - **Windows:** `ipconfig /flushdns`
   - **Mac:** `sudo dscacheutil -flushcache`
   - **Linux:** `sudo systemd-resolve --flush-caches`

### Problem: "SSL certificate not working"
**Solutions:**
1. Wait 24 hours for Vercel to provision SSL (usually takes 5 minutes)
2. Ensure DNS is fully propagated
3. Check Vercel Dashboard → Settings → Domains for SSL status
4. Vercel automatically provisions Let's Encrypt certificates

### Problem: "Some locations can see site, others can't"
**Solution:**
- This is normal during DNS propagation
- Wait for global propagation (up to 48 hours)
- Check propagation status: https://dnschecker.org

### Problem: "Getting 'Domain Not Found' error in Vercel"
**Solutions:**
1. Make sure you added domain in Vercel: `vercel domains add cpspunisher.com`
2. Check Vercel Dashboard → Settings → Domains
3. Re-add the domain if needed

### Problem: "www works but root domain doesn't (or vice versa)"
**Solutions:**
1. Make sure you added BOTH DNS records (A and CNAME)
2. Check both domains in Vercel: `vercel domains ls`
3. Add missing domain: `vercel domains add cpspunisher.com` or `vercel domains add www.cpspunisher.com`

---

## After DNS is Working

Once your DNS is configured and propagated:

1. ✅ Visit https://cpspunisher.com - should load your app
2. ✅ Visit https://www.cpspunisher.com - should redirect or also work
3. ✅ Check for HTTPS (padlock icon in browser)
4. ✅ Test all app functionality (login, document upload, etc.)
5. ✅ Update Supabase Site URL and Redirect URLs
6. ✅ Update Stripe settings if needed
7. ✅ Announce your launch! 🎉

---

## Quick Reference - DNS Records

Copy and paste these values into your registrar:

```
RECORD 1 (Root Domain - A Record):
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

RECORD 2 (WWW Subdomain - CNAME):
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

**Copyright © 2024 DARREN GUAY. All Rights Reserved.**
**The CPS Punisher™** - Professional CPS Defense Analyzer

For deployment help, see: VERCEL_DEPLOYMENT_GUIDE.md
