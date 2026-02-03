# 🚀 One-Click Production Deployment Guide

**Total Time: 5-7 minutes | Zero Local Setup Required**

This guide will get you a fully hosted, production-ready Pomodoro app accessible from any corporate network.

---

## ⚡ Quick Deploy (Recommended Path)

### Step 1: Deploy Frontend to Vercel (2 minutes)

1. **Upload the code to GitHub** (if not already there):
   - Extract `pomodoro-app-full.zip`
   - Create a new GitHub repository
   - Push the code

2. **Click the Deploy Button**:
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

3. **Sign in to Vercel** (free account, use GitHub)

4. **Import your repository**:
   - Vercel will auto-detect Next.js
   - Framework Preset: **Next.js**
   - Click **Deploy**

5. **Wait 60 seconds** - You'll get a URL like:
   ```
   https://pomodoro-timer-abc123.vercel.app
   ```

✅ Frontend is live! (But won't work yet - needs backend)

---

### Step 2: Set Up Supabase Backend (2 minutes)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up (free tier)
   - Click "New Project"
   - Name: `pomodoro-app`
   - Create strong database password
   - Region: Choose closest to you
   - Click "Create new project"
   - **Wait 2 minutes** for initialization

2. **Run Database Migration**:
   - Go to **SQL Editor** tab
   - Click "+ New Query"
   - Copy ALL contents from `supabase/migrations/001_initial_schema.sql`
   - Paste into editor
   - Click "Run" (bottom right)
   - ✅ Check **Table Editor** - should see 4 tables

3. **Get API Credentials**:
   - Go to **Settings** (gear icon) → **API**
   - Copy these 3 values:
     - `Project URL`: `https://xxxxx.supabase.co`
     - `anon public` key: `eyJ...` (very long)
     - `service_role` key: `eyJ...` (very long, keep secret!)

---

### Step 3: Connect Frontend to Backend (1 minute)

1. **Go to Vercel Dashboard**:
   - Find your deployed project
   - Click **Settings** → **Environment Variables**

2. **Add 4 Environment Variables**:

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbG...
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   ```

3. **Redeploy**:
   - Go to **Deployments** tab
   - Click ••• on latest deployment
   - Click "Redeploy"
   - Wait 30 seconds

✅ **App is now fully functional!**

---

### Step 4: Enable Google Login (2 minutes)

1. **Google Cloud Console**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create project or select existing
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Configure consent screen (External, basic info only)
   - Application type: **Web application**
   - Name: `Pomodoro App`
   - Authorized redirect URIs - add:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
     (Use YOUR Supabase project URL from Step 2.3)
   - Click **Create**
   - Copy **Client ID** and **Client Secret**

2. **Enable in Supabase**:
   - Supabase dashboard → **Authentication** → **Providers**
   - Toggle **Google** ON
   - Paste Client ID and Client Secret
   - Click **Save**

✅ **Google login enabled!**

---

## 🎉 YOU'RE DONE!

### Your Production URLs:
- **App**: `https://your-app.vercel.app`
- **Supabase**: `https://app.supabase.com`

### Test It:
1. Open your Vercel URL
2. Click "Sign in with Google"
3. Start a 25-min Pomodoro (or press "1" then Space)
4. Complete it (or wait!)
5. Visit `/sessions` to see analytics
6. Visit `/settings` to configure

---

## 📦 Alternative: Static File Hosting

If you can't use Vercel, use the **production build**:

1. Extract `pomodoro-app-prod-build.zip`
2. Upload the `out/` folder to:
   - Netlify Drop (drag & drop)
   - AWS S3 + CloudFront
   - Azure Static Web Apps
   - Any static file server

3. Set environment variables in your hosting platform

---

## 🔧 Optional: Monthly Email Reports

### Requirements:
- Resend account (free tier: 100 emails/day)
- Supabase CLI installed locally (only for initial setup)

### Setup (5 minutes):

1. **Get Resend API Key**:
   - Sign up at [resend.com](https://resend.com)
   - Verify domain or use test domain
   - Create API key

2. **Deploy Edge Function**:
   ```bash
   # Install CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Deploy
   supabase functions deploy send-monthly-reports
   
   # Set secret
   supabase secrets set RESEND_API_KEY=re_xxxxx
   ```

3. **Schedule Monthly Run**:
   - Supabase dashboard → **Database** → **Extensions**
   - Enable `pg_cron`
   - Go to **SQL Editor**, run:
   
   ```sql
   SELECT cron.schedule(
     'monthly-reports',
     '59 23 28-31 * *',
     $$
     SELECT net.http_post(
       url:='https://YOUR_PROJECT.supabase.co/functions/v1/send-monthly-reports',
       headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     );
     $$
   );
   ```

✅ Emails will send automatically on last day of each month!

---

## 📋 Verification Checklist

Test these features:

- [ ] App loads at your Vercel URL
- [ ] Google OAuth sign-in works
- [ ] Can select timer mode (keyboard: 1, 2, 3, 4)
- [ ] Timer starts/pauses (keyboard: Space)
- [ ] Timer resets (keyboard: R)
- [ ] Audio plays after first interaction
- [ ] Completing a Pomodoro logs it
- [ ] Session appears in `/sessions` dashboard
- [ ] Today/week/month counts update
- [ ] Streak calculation works
- [ ] Chart displays 30-day trend
- [ ] CSV export downloads
- [ ] Settings save (auto-start, volume, theme)
- [ ] Timer stays accurate when tab inactive
- [ ] Works on mobile devices
- [ ] Works in corporate network (HTTPS)

---

## 🆘 Troubleshooting

### CORS or "Failed to fetch" errors
**Solution**: Check environment variables in Vercel, then redeploy

### Google login fails
**Solution**: Verify redirect URI is EXACT:
```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```

### Sessions don't save
**Solution**: 
- Check browser console
- Verify Supabase env vars
- Check RLS policies exist (they should from migration)

### Timer drifts or stops
**Solution**: This shouldn't happen - timer uses timestamps. Check browser console for errors.

### No audio
**Solution**: Click anywhere first (browser autoplay restriction). Check volume isn't muted.

### Monthly emails don't send
**Solution**:
- Check Edge Function logs in Supabase
- Verify Resend API key is set
- Test function manually

---

## 🎬 Video Walkthrough

[Screen recording placeholder - will show]:
1. Vercel deploy (60 seconds)
2. Supabase setup (2 minutes)
3. Connect everything (1 minute)
4. Test: Login → Pomodoro → Dashboard

---

## 🔒 Security & Corporate Compatibility

✅ **Corporate-Friendly**:
- Works over HTTPS (required for corporate networks)
- No special network configuration needed
- No SSL certificate issues
- Accessible from locked-down environments

✅ **Secure**:
- All data encrypted in transit (HTTPS)
- Row-level security (users see only their data)
- OAuth through Google (no password storage)
- Service role key never exposed to client

---

## 📞 Support

Issues? Check:
1. All environment variables set correctly
2. Vercel deployment succeeded
3. Supabase migration ran successfully
4. Google OAuth redirect URI matches exactly
5. Browser console for errors

---

**Your production Pomodoro app is ready! No npm install required. 🎉**
