# ⚡ Quick Deploy - 5 Steps Only!

**Goal:** Get your site live on Netlify in ~20 minutes

---

## 🚀 Step 1: Push to GitHub (5 min)

```bash
cd /Users/jaiadithyaramnayani/Desktop/Lexsy/Project_Final

# Initialize git
git init
git add .
git commit -m "Initial commit - Legal Document Assistant"

# Create repo on GitHub.com (make it PRIVATE!)
# Then run these (replace YOUR_USERNAME):
git remote add origin https://github.com/YOUR_USERNAME/legal-document-assistant.git
git branch -M main
git push -u origin main
```

**✅ Done!** Code is on GitHub.

---

## 🌐 Step 2: Deploy on Netlify (3 min)

1. Go to: https://app.netlify.com/
2. Sign up with GitHub
3. **"Add new site"** → **"Import from GitHub"**
4. Select your `legal-document-assistant` repo
5. Click **"Deploy"**
6. **Wait 2-3 minutes...**
7. **Copy your URL:** `https://something-random.netlify.app`

**✅ Done!** Site is deployed (but needs env vars).

---

## 🔧 Step 3: Add Environment Variables (2 min)

In Netlify Dashboard:
1. **Site settings** → **Environment variables**
2. Add these 3 variables:

```
NEXT_PUBLIC_SUPABASE_URL
https://aniuponeoyobbpqcdwpt.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuaXVwb25lb3lvYmJwcWNkd3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzY1OTYsImV4cCI6MjA3NzUxMjU5Nn0.hi8CHLurx5XcyffOx6QoxsonCw1T_1RYeavUbypEWSM

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuaXVwb25lb3lvYmJwcWNkd3B0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkzNjU5NiwiZXhwIjoyMDc3NTEyNTk2fQ.o1HugfLk2-wEUsbEDDuo9OdcgoN_wrFpbGi-vf6QMkE
```

3. Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy**
4. Wait 2-3 minutes again

**✅ Done!** Env vars are set.

---

## 🔐 Step 4: Update Supabase OAuth (2 min)

1. Go to: https://supabase.com/dashboard/project/aniuponeoyobbpqcdwpt/auth/url-configuration

2. **Site URL:** Change to your Netlify URL
   ```
   https://your-site.netlify.app
   ```

3. **Redirect URLs:** Add (keep localhost too!)
   ```
   https://your-site.netlify.app/auth/callback
   https://your-site.netlify.app/**
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

4. Click **Save**

**✅ Done!** OAuth configured.

---

## 🧪 Step 5: Test Everything (5 min)

Visit your Netlify URL: `https://your-site.netlify.app`

**Test these:**
- [ ] Login page appears
- [ ] Sign up with email/password works
- [ ] Upload a document works
- [ ] AI detects placeholders
- [ ] Fill and download works
- [ ] Document history shows documents
- [ ] Template upload works

**✅ Everything works!** You're live! 🎉

---

## 📧 For Your Job Application

**Create demo account:**
- Email: `demo@yourname.com`
- Password: `DemoPass123!`

**Share with Director:**
```
🔗 Live Site: https://your-site.netlify.app
👤 Demo Email: demo@yourname.com
🔑 Demo Password: DemoPass123!

Features: AI placeholder detection, Google OAuth, 
Cloud storage, Template library, DOCX/PDF export

Tech: Next.js 16, TypeScript, Supabase, Gemini AI
```

---

## 🐛 If Something Goes Wrong

**Build failed?**
→ Check Netlify deploy logs

**Login not working?**
→ Check you updated Supabase redirect URLs

**Document upload fails?**
→ Check environment variables are set and redeployed

**AI not working?**
→ Check Gemini API quota at https://aistudio.google.com/app/apikey

---

## 🎯 That's It!

Your site is live and the Director can test it immediately!

**Need detailed steps?** See `NETLIFY_DEPLOYMENT.md`

**Good luck! 🚀**

