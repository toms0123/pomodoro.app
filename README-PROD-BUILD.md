# Pomodoro Timer - Production Build

**This is the production-ready, optimized build** ready to deploy to any static hosting or Next.js-compatible server.

---

## 📦 What's Inside

```
pomodoro-app-prod-build/
├── .next/              # Production build output (for Next.js servers)
├── out/                # Static HTML export (for static hosting)
├── public/             # Static assets (sounds, etc.)
├── .env.example        # Environment variables template
└── README-DEPLOY.md    # This file
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - 1 Click)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Upload this ZIP or connect to your GitHub repo
5. Add environment variables (see below)
6. Click "Deploy"

**Done!** Your app is live in 60 seconds.

---

### Option 2: Netlify (Static Export)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `out/` folder to Netlify Drop
3. Add environment variables in Site Settings
4. Done!

---

### Option 3: Any Static Web Server

The `out/` folder contains pure HTML/CSS/JS that can be served from any web server:

**Python**:
```bash
cd out
python -m http.server 3000
```

**Node.js**:
```bash
npx serve out -p 3000
```

**Nginx** (copy to web root):
```bash
cp -r out/* /var/www/html/
```

**Apache** (copy to htdocs):
```bash
cp -r out/* /var/www/htdocs/
```

---

### Option 4: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t pomodoro-app .
docker run -p 3000:3000 --env-file .env.local pomodoro-app
```

---

## 🔧 Environment Variables

**REQUIRED**: Create a `.env.local` file with these variables:

```env
# Supabase Configuration (from your Supabase project)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Your deployment URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### How to Get These Values:

1. **Create Supabase Project** (if you haven't):
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait 2 minutes for initialization

2. **Get API Keys**:
   - Supabase dashboard → Settings → API
   - Copy Project URL
   - Copy anon public key
   - Copy service_role secret

3. **Set in Your Platform**:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Build & Deploy → Environment
   - **Local**: Create `.env.local` file

---

## 🗄️ Database Setup

**Run this SQL in Supabase** (one time only):

1. Supabase dashboard → SQL Editor
2. New Query
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run"
5. Verify in Table Editor: 4 tables created

---

## 🔐 Google OAuth Setup

1. **Google Cloud Console**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

2. **Enable in Supabase**:
   - Authentication → Providers → Google
   - Toggle ON
   - Paste Client ID and Secret
   - Save

---

## ✅ Verification

After deployment:

1. Open your deployment URL
2. Click "Sign in with Google"
3. Start a Pomodoro
4. Check Sessions page

All working? You're done! 🎉

---

## 📞 Troubleshooting

### "Failed to fetch" errors
- Check environment variables are set correctly
- Redeploy after setting env vars

### Google login fails
- Verify redirect URI matches exactly
- Check OAuth is enabled in Supabase

### Sessions not saving
- Check Supabase connection
- Verify database migration ran
- Check browser console for errors

---

## 📚 Full Documentation

See the main repository for:
- Complete setup guide
- Feature documentation
- Development instructions
- Monthly email setup

---

**Questions?** Check DEPLOYMENT.md in the main repository.
