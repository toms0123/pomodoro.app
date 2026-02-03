# 🏢 Corporate User Quick Start

**For users on locked-down Windows laptops who cannot run `npm install`**

---

## 🎯 Goal

Access a fully functional Pomodoro timer **without installing anything** on your local machine.

---

## ✅ Option 1: Use the Hosted Version (RECOMMENDED)

### What You Get:
- Instant access via web browser
- No installation required
- Works from corporate networks
- HTTPS secured
- Backed by CDN for fast global access

### How to Use:

1. **Get the deployment URL** from your team/deployment manager
   - Format: `https://pomodoro-timer-xxxxx.vercel.app`

2. **Open in your browser**:
   - Chrome, Edge, Firefox, Safari all supported
   - Works on desktop and mobile

3. **Sign in with Google**:
   - Click "Sign in with Google"
   - Use your corporate Google account (if allowed)
   - Or use personal Gmail

4. **Start using immediately**:
   - Select timer mode (25min, 50min, breaks)
   - Press Space to start/pause
   - All data auto-saves to cloud

### Features Available:
- ✅ Timer with accurate tracking
- ✅ Session history and analytics
- ✅ Customizable settings
- ✅ Keyboard shortcuts
- ✅ Auto-start options
- ✅ CSV export of your sessions
- ✅ Monthly email reports (opt-in)

---

## 📦 Option 2: Run from Static Files (Fallback)

**If your IT blocks Vercel domains**, use the static build:

### Prerequisites:
- Access to a local web server OR
- Permission to run Python/Node OR  
- Ability to upload files to internal hosting

### Steps:

1. **Download** `pomodoro-app-prod-build.zip`

2. **Extract** the ZIP file

3. **Serve the files**:

   **Option A - Python** (if available):
   ```bash
   cd pomodoro-app-prod-build
   python -m http.server 3000
   ```
   
   **Option B - Node** (if available):
   ```bash
   cd pomodoro-app-prod-build
   npx serve out -p 3000
   ```
   
   **Option C - IIS** (Windows Server):
   - Copy `out` folder to `C:\inetpub\wwwroot\pomodoro`
   - Configure as new website
   - Access via `http://localhost/pomodoro`
   
   **Option D - Upload to internal server**:
   - Upload `out` folder contents to your company's file server
   - Access via internal URL

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

### ⚠️ Important Notes:
- You'll still need Supabase for data persistence
- Ask IT to allowlist `*.supabase.co` if blocked
- Local mode (localStorage) works without backend but doesn't sync

---

## 🔧 Option 3: Full Local Instance (Advanced)

**Only if you have Node.js access and IT approval**

### What's Included in `pomodoro-app-full.zip`:
- Complete source code
- Pre-installed `node_modules`
- All dependencies bundled
- Ready-to-run scripts

### Steps:

1. **Extract** `pomodoro-app-full.zip`

2. **Create** `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   (Get these values from your deployment manager)

3. **Run**:
   ```bash
   npm run build
   npm run start
   ```

4. **Access**:
   ```
   http://localhost:3000
   ```

---

## 🚫 What You DON'T Need

- ❌ No Node.js installation required (for hosted version)
- ❌ No npm install (for hosted version)
- ❌ No build steps (for hosted version)
- ❌ No command line access (for hosted version)
- ❌ No admin rights (for hosted version)
- ❌ No firewall changes (uses standard HTTPS)
- ❌ No VPN (if using public deployment)

---

## 🔐 Corporate IT Checklist

**What IT needs to allowlist** (if applicable):

### Domains:
- `*.vercel.app` - Frontend hosting
- `*.supabase.co` - Backend database
- `accounts.google.com` - OAuth login
- `*.resend.com` - Monthly emails (optional)

### Ports:
- 443 (HTTPS) - Standard, usually already open
- 80 (HTTP) - Redirects to HTTPS

### Protocols:
- HTTPS/TLS 1.2+
- WebSocket (for real-time features, optional)

---

## 📱 Device Compatibility

Works on:
- ✅ Windows 10/11
- ✅ macOS
- ✅ Linux
- ✅ iOS (iPhone/iPad)
- ✅ Android
- ✅ ChromeOS

Browsers:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

---

## 🎯 Quick Start Workflow

**First Time (One-time, 2 minutes)**:
1. Open deployment URL
2. Sign in with Google
3. Browse to Settings → Configure preferences

**Daily Use (5 seconds)**:
1. Open bookmark/URL
2. Press `1` (select 25-min mode)
3. Press `Space` (start timer)
4. Focus!

**Keyboard Shortcuts**:
- `Space` - Start/Pause
- `R` - Reset
- `1` - Short Pomodoro (25 min)
- `2` - Long Pomodoro (50 min)
- `3` - Short Break (5 min)
- `4` - Long Break (10 min)

---

## 🆘 Troubleshooting

### "Site can't be reached"
**Solution**: Check with IT - Vercel might be blocked. Use static files instead.

### "Sign in failed"
**Solution**: Check if Google OAuth is blocked. Ask IT to allowlist `accounts.google.com`.

### "Sessions not saving"
**Solution**: Supabase might be blocked. Ask IT to allowlist `*.supabase.co`.

### Works at home but not at office
**Solution**: Corporate firewall is blocking. Request IT allowlist (see checklist above).

### Audio doesn't play
**Solution**: Click anywhere on page first (browser security). Check system volume.

---

## 📞 Getting Help

1. **Check browser console** (F12 → Console tab) for errors
2. **Contact deployment manager** for credentials/URL
3. **Contact IT** for network/firewall issues
4. **Use local mode** (no login) as temporary workaround

---

## 🎉 Benefits for Corporate Users

- **No installation** - Works in browser
- **No admin rights** - Standard user access is fine
- **Cross-platform** - Use on any device
- **Secure** - All data encrypted (HTTPS)
- **Compliant** - No data leaves approved domains
- **Portable** - Access from anywhere with internet
- **Team-friendly** - Multiple users, separate data
- **Audit trail** - Full session history with timestamps

---

**Get the URL from your team and start focusing! 🎯**
