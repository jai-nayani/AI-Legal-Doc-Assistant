# 🔐 Google OAuth Setup Guide

## Step 1: Google Cloud Console Setup

### 1.1 Create/Select Project
1. Go to: https://console.cloud.google.com/
2. Click dropdown at top → **"New Project"** or select existing
3. Name: `Legal Document Assistant`
4. Click **"Create"**

### 1.2 Enable Google+ API (Optional but Recommended)
1. Go to **APIs & Services** → **Library**
2. Search: `Google+ API`
3. Click **"Enable"**

### 1.3 Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **"External"** → Click **"Create"**
3. Fill in:
   - **App name**: `Legal Document Assistant`
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **"Save and Continue"**
5. **Scopes**: Click **"Add or Remove Scopes"**
   - Select: `.../auth/userinfo.email`
   - Select: `.../auth/userinfo.profile`
6. Click **"Save and Continue"**
7. **Test users**: Add your email
8. Click **"Save and Continue"**

### 1.4 Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **Web application**
4. Name: `Legal Document Assistant - Web`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   ```
6. **Authorized redirect URIs**:
   ```
   https://aniuponeoyobbpqcdwpt.supabase.co/auth/v1/callback
   ```
7. Click **"Create"**
8. **COPY YOUR CREDENTIALS:**
   - ✅ Client ID (starts with numbers, ends with `.apps.googleusercontent.com`)
   - ✅ Client Secret (random string)

---

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Go to: https://supabase.com/dashboard/project/aniuponeoyobbpqcdwpt/auth/providers
2. Find **"Google"** in the list
3. Click to expand it
4. Toggle **"Enable Google provider"** to ON

### 2.2 Enter Credentials
1. **Client ID**: Paste from Google Cloud Console
2. **Client Secret**: Paste from Google Cloud Console
3. **Authorized Client IDs**: Leave empty (optional)

### 2.3 Configure URLs
1. **Site URL**: 
   ```
   http://localhost:3000
   ```
2. **Redirect URLs**: 
   ```
   http://localhost:3000/**
   ```

### 2.4 Save
Click **"Save"** at the bottom

---

## Step 3: Test Google OAuth

### 3.1 Test Login
1. Go to: http://localhost:3000/login
2. Click **"Continue with Google"**
3. Select your Google account
4. Grant permissions
5. ✅ You should be redirected to `/dashboard`

### 3.2 Test Signup
1. Go to: http://localhost:3000/signup
2. Click **"Continue with Google"**
3. Same flow as login

---

## 🎉 Success Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created (Client ID + Secret)
- [ ] Supabase Google provider enabled
- [ ] Credentials pasted into Supabase
- [ ] Redirect URL configured
- [ ] Test login works
- [ ] User appears in Supabase dashboard

---

## 🐛 Troubleshooting

### "Access blocked: This app's request is invalid"
- Make sure you added your email to **Test users** in OAuth consent screen

### "Redirect URI mismatch"
- Double-check the redirect URI in Google Cloud Console:
  ```
  https://aniuponeoyobbpqcdwpt.supabase.co/auth/v1/callback
  ```

### "Provider not enabled" error
- Make sure you clicked **"Save"** in Supabase after enabling Google provider
- Wait 30 seconds and try again

### Google login works but redirects to wrong page
- Check that `/auth/callback` route exists
- Check that `next.config.ts` does NOT have `output: 'export'`

---

## 📝 For Production Deployment

When you deploy to production (e.g., Vercel, Netlify):

1. **Add production URL to Google Cloud Console**:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://your-supabase-id.supabase.co/auth/v1/callback`

2. **Update Supabase Site URL**:
   - Change from `http://localhost:3000` to `https://yourdomain.com`

3. **Add production redirect URLs**:
   - `https://yourdomain.com/**`

---

## 🔗 Quick Links

- **Google Cloud Console**: https://console.cloud.google.com/
- **Supabase Auth Settings**: https://supabase.com/dashboard/project/aniuponeoyobbpqcdwpt/auth/providers
- **Test Login**: http://localhost:3000/login
- **Test Signup**: http://localhost:3000/signup

