# Production Build Instructions

This document explains how to create the two required production artifacts.

---

## Artifact 1: Production Build (`pomodoro-app-prod-build.zip`)

This contains the compiled, optimized static files ready to deploy.

### Creating the Build:

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. The build output is in .next/ folder
# For static hosting, you can also run:
npm run export  # Creates 'out' folder with static HTML

# 4. Create the ZIP
# Include either .next/ (for Node.js hosting) or out/ (for static hosting)
```

### What's Inside:
```
pomodoro-app-prod-build/
├── out/                    # Static HTML, CSS, JS (from next export)
│   ├── index.html
│   ├── _next/
│   ├── sessions.html
│   └── settings.html
├── .env.example            # Environment variable template
└── README-PROD.md          # How to deploy this build
```

### How to Use:

**Option A - Static File Server**:
```bash
# Serve the 'out' folder
cd out
python -m http.server 3000
# or
npx serve . -p 3000
```

**Option B - Upload to CDN**:
- Upload `out/` contents to:
  - Netlify Drop
  - AWS S3 + CloudFront
  - Azure Static Web Apps
  - Any web server

**Option C - Node.js Server**:
```bash
# Set environment variables first!
export NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
export NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Run the production server
npm run start
```

---

## Artifact 2: Full Source with Dependencies (`pomodoro-app-full.zip`)

This contains everything needed to run locally without `npm install`.

### Creating the Full Package:

```bash
# 1. Install ALL dependencies (including node_modules)
npm install

# 2. Create ZIP including node_modules
zip -r pomodoro-app-full.zip . -x "*.git*" "*.next/*" "out/*"

# This will be large (~200-300MB) because of node_modules
```

### What's Inside:
```
pomodoro-app-full/
├── node_modules/           # All dependencies pre-installed
├── app/                    # Source code
├── components/
├── lib/
├── public/
├── supabase/
├── package.json
├── next.config.js
├── .env.example
├── README.md
└── START.md                # How to run without npm install
```

### How to Use:

**Prerequisites**: Node.js must be installed (but no npm install needed!)

```bash
# 1. Extract the ZIP
unzip pomodoro-app-full.zip
cd pomodoro-app-full

# 2. Create .env.local file
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Build (uses pre-installed node_modules)
npm run build

# 4. Start the production server
npm run start

# App runs at http://localhost:3000
```

**Note**: Since node_modules includes binary dependencies, this may have platform-specific issues:
- Built on Linux → Works on Linux
- Built on Mac → Works on Mac  
- Built on Windows → Works on Windows

For cross-platform compatibility, users may still need to run `npm rebuild` if binaries don't work.

---

## Quick Build Script

Save this as `build-artifacts.sh`:

```bash
#!/bin/bash

echo "🏗️  Building Production Artifacts..."

# Clean previous builds
rm -rf out .next *.zip

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building application..."
npm run build

# Create static export
echo "📤 Creating static export..."
npm run export

# Create production build ZIP (static files only)
echo "📦 Creating pomodoro-app-prod-build.zip..."
mkdir -p temp-prod
cp -r out temp-prod/
cp .env.example temp-prod/
cat > temp-prod/README-PROD.md << 'EOF'
# Production Build - Ready to Deploy

## Quick Start

### Serve Locally:
```bash
cd out
python -m http.server 3000
# or
npx serve . -p 3000
```

### Deploy to Netlify:
- Drag and drop the `out` folder to https://app.netlify.com/drop

### Deploy to Vercel:
```bash
vercel --prod
```

### Configure Environment:
Before deploying, set these environment variables in your hosting platform:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL

See .env.example for details.
EOF

cd temp-prod && zip -r ../pomodoro-app-prod-build.zip . && cd ..
rm -rf temp-prod

# Create full source ZIP (with node_modules)
echo "📦 Creating pomodoro-app-full.zip..."
zip -r pomodoro-app-full.zip . \
  -x "*.git*" \
  -x "*/.next/*" \
  -x "*/out/*" \
  -x "*.zip" \
  -x "*/temp-prod/*"

echo "✅ Done!"
echo ""
echo "Created artifacts:"
echo "  📦 pomodoro-app-prod-build.zip (static files, ~5MB)"
echo "  📦 pomodoro-app-full.zip (full source + node_modules, ~200MB)"
echo ""
echo "Next steps:"
echo "  1. Upload to GitHub releases"
echo "  2. Deploy prod build to Vercel/Netlify"
echo "  3. Share URLs with users"
```

Run it:
```bash
chmod +x build-artifacts.sh
./build-artifacts.sh
```

---

## Deployment Checklist

Before creating artifacts:

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] README.md updated
- [ ] Database migration tested
- [ ] Google OAuth configured
- [ ] Tests passing
- [ ] No hardcoded secrets in code
- [ ] Sound files added (or placeholder documented)

After creating artifacts:

- [ ] Test prod build on clean machine
- [ ] Verify all env vars work
- [ ] Test on target hosting platform
- [ ] Create GitHub release
- [ ] Tag version (e.g., v1.0.0)
- [ ] Attach both ZIP files to release
- [ ] Update deployment documentation

---

## File Size Estimates

- `pomodoro-app-prod-build.zip`: ~5-10 MB (static files only)
- `pomodoro-app-full.zip`: ~150-250 MB (includes node_modules)

To reduce size:
- Production build: Already optimized
- Full source: Remove dev dependencies with `npm install --production`

---

## Troubleshooting

### Build fails
**Solution**: Check Node.js version (needs 18+), clear cache:
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Static export has broken links
**Solution**: Next.js API routes don't work in static export. This app uses Supabase for all backend, so it's fine.

### node_modules too large
**Solution**: Use production dependencies only:
```bash
npm install --production
```

### Platform-specific binaries don't work
**Solution**: User needs to run `npm rebuild` or `npm install` on their platform.

---

## Alternative: Docker Image

For the most reliable cross-platform deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t pomodoro-app .
docker run -p 3000:3000 --env-file .env.local pomodoro-app
```

This eliminates platform-specific issues entirely.

---

**Both artifacts are designed for zero local setup for end users! 🚀**
