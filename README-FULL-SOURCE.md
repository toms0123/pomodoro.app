# Pomodoro Timer - Full Source Package

**This package contains the complete source code** ready to run locally without `npm install`.

---

## 📦 What's Inside

```
pomodoro-app-full/
├── app/                    # Next.js pages and routes
├── components/             # React components
├── lib/                    # Utilities and hooks
├── supabase/              # Database migrations and functions
├── public/                # Static assets
├── __tests__/             # Unit tests
├── node_modules/          # Pre-installed dependencies (if included)
├── package.json           # Dependencies and scripts
├── .env.example           # Environment template
├── README.md              # Full documentation
├── DEPLOYMENT.md          # Deployment guide
└── server.js              # Standalone production server
```

---

## ⚡ Quick Start (2 Minutes)

### Prerequisites

**Only requirement**: Node.js 18+ installed

Check your version:
```bash
node --version  # Should be v18.0.0 or higher
```

Don't have Node.js? Download from [nodejs.org](https://nodejs.org)

---

### Step 1: Extract the ZIP

```bash
unzip pomodoro-app-full.zip
cd pomodoro-app-full
```

---

### Step 2: Set Up Environment

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Don't have Supabase credentials yet?**
See "Backend Setup" section below.

---

### Step 3: Install Dependencies (if node_modules not included)

If the ZIP doesn't include `node_modules`:

```bash
npm install
```

If included, skip this step!

---

### Step 4: Build and Run

```bash
# Build for production
npm run build

# Start the server
npm run start
```

**OR** use the standalone server:

```bash
node server.js
```

---

### Step 5: Open in Browser

```
http://localhost:3000
```

**Done!** 🎉

---

## 🗄️ Backend Setup (Supabase)

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up (free tier is perfect)
3. Click "New Project"
4. Name: `pomodoro-app`
5. Create strong password
6. Wait 2 minutes

### Run Database Migration

1. Supabase dashboard → SQL Editor
2. Click "New Query"
3. Copy ALL contents from `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Verify: Table Editor should show 4 tables

### Get Your Credentials

Supabase dashboard → Settings → API

Copy these 3 values to your `.env.local`:
- Project URL
- anon public key
- service_role secret key

---

## 🔐 Enable Google Login

### Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI:
   ```
   https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
   ```

### Enable in Supabase

1. Authentication → Providers → Google
2. Toggle ON
3. Paste Client ID and Secret from Google
4. Save

---

## 🎯 Available Scripts

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint
```

---

## 📁 Project Structure

```
app/
├── page.tsx              # Main timer page (/)
├── sessions/page.tsx     # Analytics dashboard (/sessions)
├── settings/page.tsx     # Settings page (/settings)
├── auth/callback/        # OAuth callback handler
├── layout.tsx            # Root layout
└── globals.css           # Global styles

components/
└── Navigation.tsx        # Top navigation bar

lib/
├── useTimer.ts           # Timer hook with state machine
├── audioManager.ts       # Sound system
├── useLocalStorage.ts    # Local storage utilities
└── supabase.ts           # Database client

supabase/
├── migrations/           # Database schema
└── functions/            # Edge functions (monthly emails)
```

---

## 🧪 Running Tests

```bash
# All tests
npm test

# Specific file
npm test timer.test.ts

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

Tests cover:
- Timer state machine
- Time calculations
- Email idempotency
- Session statistics

---

## 🚀 Deployment

### To Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Or one command
vercel --prod
```

### To Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### To Any Server

```bash
# Build
npm run build

# Copy build output
scp -r .next server.js package.json user@server:/app/

# On server
cd /app
npm install --production
node server.js
```

---

## 🔧 Configuration

### Change Timer Durations

Edit `lib/useTimer.ts`:

```typescript
const DURATIONS: Record<TimerMode, number> = {
  'short': 25 * 60,        // 25 minutes
  'long': 50 * 60,         // 50 minutes
  'short-break': 5 * 60,   // 5 minutes
  'long-break': 10 * 60,   // 10 minutes
}
```

### Customize Colors

Edit `tailwind.config.js` - modify the `mono` color palette.

### Add Custom Sounds

Place MP3 files in `public/sounds/`:
- `default-start.mp3`
- `default-end1.mp3`
- `default-end2.mp3`
- (Plus soft and loud variants)

---

## 📧 Optional: Monthly Email Reports

### Requirements
- Resend account ([resend.com](https://resend.com))
- Supabase CLI

### Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy Edge Function
supabase functions deploy send-monthly-reports

# Set Resend API key
supabase secrets set RESEND_API_KEY=re_xxxxx
```

### Schedule Monthly Emails

Supabase dashboard → SQL Editor:

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

---

## ✅ Verification Checklist

After setup:

- [ ] App runs at http://localhost:3000
- [ ] Can sign in with Google
- [ ] Timer starts and counts down
- [ ] Keyboard shortcuts work (Space, R, 1-4)
- [ ] Audio plays (after first click)
- [ ] Sessions save to database
- [ ] Analytics page shows data
- [ ] Settings persist
- [ ] CSV export works

---

## 🆘 Troubleshooting

### "Module not found" errors
**Solution**: Run `npm install` (if node_modules not included)

### "Cannot find module 'next'"
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build fails
**Solution**: Check Node.js version (needs 18+)
```bash
node --version
npm cache clean --force
npm install
```

### Port 3000 already in use
**Solution**: Use different port:
```bash
PORT=3001 npm run start
```

### Supabase connection fails
**Solution**: 
- Check `.env.local` values are correct
- Verify Supabase project is active
- Check network connectivity

### Google login doesn't work
**Solution**:
- Verify redirect URI is exact
- Check OAuth credentials in Google Console
- Ensure Google provider enabled in Supabase

---

## 📚 Documentation

Comprehensive guides included:

- `README.md` - Full documentation
- `DEPLOYMENT.md` - Production deployment guide
- `CORPORATE_QUICKSTART.md` - For locked-down environments
- `BUILD_INSTRUCTIONS.md` - How to create artifacts
- `VERIFICATION.md` - Complete testing checklist

---

## 🔒 Security Notes

- Never commit `.env.local` to git (already in .gitignore)
- Keep service_role key secret
- Use environment variables for all secrets
- HTTPS required for production

---

## 📞 Need Help?

1. Check browser console (F12) for errors
2. Read DEPLOYMENT.md for detailed setup
3. Verify environment variables
4. Check Supabase project status
5. Review VERIFICATION.md checklist

---

## 📄 License

MIT License - Free to use for personal or commercial projects

---

**Everything you need is included. Start building focused work habits! 🎯**
