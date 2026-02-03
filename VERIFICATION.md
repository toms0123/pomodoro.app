# Production Verification Checklist

**Use this checklist to verify the production deployment is working correctly.**

---

## 🎯 Pre-Deployment Verification

### Environment Setup
- [ ] Supabase project created
- [ ] Database migration executed successfully
- [ ] All 4 tables visible in Table Editor (profiles, preferences, sessions, email_reports)
- [ ] RLS policies active (check Database → Policies)
- [ ] Google OAuth configured in Google Cloud Console
- [ ] Google OAuth enabled in Supabase (Authentication → Providers)
- [ ] Redirect URI matches exactly: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

### Vercel Deployment
- [ ] Project deployed to Vercel
- [ ] All 4 environment variables set:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXT_PUBLIC_APP_URL
- [ ] Deployment successful (no build errors)
- [ ] Production URL accessible via HTTPS
- [ ] SSL certificate valid (no browser warnings)

---

## 🧪 Functional Testing

### 1. Initial Load & Navigation

**Test**: Open the app
- [ ] App loads without errors
- [ ] No console errors in browser DevTools (F12)
- [ ] Navigation bar visible
- [ ] Three menu items: Timer, Sessions, Settings
- [ ] Active state highlights current page
- [ ] Mobile responsive (test on phone or resize browser)

**Expected**: Clean, minimal interface with large timer display

---

### 2. Authentication Flow

**Test**: Sign in with Google

**Steps**:
1. Click "Sign in with Google" button
2. Complete Google OAuth flow
3. Redirected back to app

**Verify**:
- [ ] Sign-in button present when logged out
- [ ] Google OAuth popup opens
- [ ] Can select/login with Google account
- [ ] Redirected to app after auth
- [ ] User email shown in navigation
- [ ] "Sign out" button visible
- [ ] No "local mode" prompt shown when logged in

**Expected**: Seamless OAuth flow, user stays logged in on refresh

---

### 3. Timer Functionality

**Test**: Basic timer operations

**Steps**:
1. Select "Short Pomodoro" (or press `1`)
2. Click "Start" (or press `Space`)
3. Wait 5 seconds
4. Click "Pause"
5. Click "Resume"
6. Click "Reset" (or press `R`)

**Verify**:
- [ ] Timer displays 25:00 initially
- [ ] Mode selector shows 4 options
- [ ] Clicking mode changes duration
- [ ] Timer starts counting down
- [ ] Progress circle animates
- [ ] Timer can be paused
- [ ] Timer resumes from paused time
- [ ] Reset returns to initial duration
- [ ] Timer state persists on page refresh (while running)

**Expected**: Accurate countdown, smooth animations, persistent state

---

### 4. Keyboard Shortcuts

**Test**: All keyboard controls

**Verify**:
- [ ] `Space` starts timer from idle
- [ ] `Space` pauses timer when running
- [ ] `Space` resumes timer when paused
- [ ] `R` resets timer
- [ ] `1` selects Short Pomodoro (25 min)
- [ ] `2` selects Long Pomodoro (50 min)
- [ ] `3` selects Short Break (5 min)
- [ ] `4` selects Long Break (10 min)
- [ ] Shortcuts don't work when typing in input fields

**Expected**: All shortcuts work instantly, no conflicts

---

### 5. Audio System

**Test**: Sound playback

**Prerequisites**: Click anywhere on page first (unlocks audio context)

**Steps**:
1. Go to Settings
2. Set volume to 70%
3. Click "Test Sound"
4. Return to Timer
5. Start a session
6. Let it complete (or manually finish for testing)

**Verify**:
- [ ] Test sound plays in Settings
- [ ] Start sound plays when timer starts
- [ ] End sounds play when timer finishes (2 sounds in sequence)
- [ ] Volume slider changes loudness
- [ ] Sound theme selector works (default/soft/loud)
- [ ] Mute works (no sound at 0% volume)
- [ ] Audio unlocks after first click

**Expected**: Clear sounds, proper volume control, sequential end sounds

---

### 6. Session Logging

**Test**: Complete a Pomodoro session

**Steps**:
1. Start a Short Pomodoro
2. Let it run to completion (or wait 25 minutes!)
   - For testing: Temporarily change duration in code to 5 seconds
3. Check "Completed!" screen
4. Navigate to Sessions page

**Verify**:
- [ ] Timer completes and shows "Completed!"
- [ ] Session count displayed ("That's X sessions today")
- [ ] End sounds play
- [ ] Session logged in database
- [ ] Session visible in Sessions page
- [ ] Today count increased by 1
- [ ] Session has correct type (short/long)
- [ ] Session has accurate timestamps

**Expected**: Every completed Pomodoro is logged with full details

---

### 7. Analytics Dashboard

**Test**: Sessions page features

**Prerequisites**: Complete at least 3 sessions across different days

**Navigate to**: `/sessions`

**Verify**:
- [ ] "Today" count shows today's sessions
- [ ] "This Week" count shows week's sessions
- [ ] "This Month" count shows month's sessions
- [ ] "Streak" shows consecutive days with sessions
- [ ] Chart displays last 30 days
- [ ] Chart data points match session dates
- [ ] Table shows all sessions
- [ ] Date range filter works
- [ ] Type filter works (short/long)
- [ ] CSV export downloads
- [ ] CSV contains correct data
- [ ] Mobile responsive

**Expected**: Comprehensive analytics with accurate data

---

### 8. Settings & Preferences

**Test**: All settings save correctly

**Navigate to**: `/settings`

**Verify**:
- [ ] Auto-start sessions toggle works
- [ ] Auto-start breaks toggle works
- [ ] Volume slider moves smoothly
- [ ] Sound theme selector works
- [ ] Monthly email opt-in toggle works (if logged in)
- [ ] Email preference only shown when logged in
- [ ] "Save Preferences" button confirms save
- [ ] Preferences persist on page refresh
- [ ] Preferences sync across devices (log in on phone)

**Expected**: All settings save and sync properly

---

### 9. Auto-Start Behavior

**Test**: Auto-start toggles

**Setup**:
1. Enable "Auto-start breaks" in Settings
2. Enable "Auto-start sessions" in Settings
3. Save preferences

**Steps**:
1. Complete a Pomodoro session
2. Observe auto-start of break
3. Complete the break
4. Observe auto-start of next Pomodoro

**Verify**:
- [ ] Break starts automatically after Pomodoro
- [ ] Pomodoro starts automatically after break
- [ ] Correct break type selected (you can customize this)
- [ ] 1-second delay before auto-start
- [ ] Can disable auto-start mid-session

**Disable auto-start and verify**:
- [ ] "Start next" button appears on completion
- [ ] Manual start required

**Expected**: Smart auto-progression with user control

---

### 10. Offline/Local Mode

**Test**: App works without login

**Steps**:
1. Sign out
2. Complete a Pomodoro
3. Check Sessions page
4. Change settings

**Verify**:
- [ ] Timer works without login
- [ ] Session saved to localStorage
- [ ] Sessions visible in Sessions page
- [ ] Settings save to localStorage
- [ ] Prompt to "Sign in to sync" appears
- [ ] Data persists on page refresh
- [ ] Signing in later doesn't lose local data

**Expected**: Full functionality in local mode with sync prompts

---

### 11. Cross-Browser Testing

**Test on multiple browsers**:

Chrome/Edge:
- [ ] All features work
- [ ] Audio plays
- [ ] OAuth works
- [ ] No console errors

Firefox:
- [ ] All features work
- [ ] Audio plays
- [ ] OAuth works
- [ ] No console errors

Safari (Mac/iOS):
- [ ] All features work
- [ ] Audio plays (after first click)
- [ ] OAuth works
- [ ] No console errors

**Expected**: Consistent behavior across browsers

---

### 12. Mobile Testing

**Test on mobile devices**:

iPhone/iPad:
- [ ] Responsive layout
- [ ] Touch controls work
- [ ] OAuth works
- [ ] Audio plays
- [ ] Keyboard doesn't block UI
- [ ] Landscape mode works

Android:
- [ ] Responsive layout
- [ ] Touch controls work
- [ ] OAuth works
- [ ] Audio plays
- [ ] Keyboard doesn't block UI

**Expected**: Full functionality on mobile

---

### 13. Timer Accuracy

**Test**: Timer remains accurate

**Steps**:
1. Start a timer
2. Switch tabs/minimize browser
3. Wait 2 minutes
4. Return to tab

**Verify**:
- [ ] Timer shows correct elapsed time
- [ ] No drift or freeze
- [ ] Continues counting in background
- [ ] Completes accurately even when tab inactive

**Expected**: Timer uses Date.now() timestamps for accuracy

---

### 14. Data Persistence

**Test**: Data survives across sessions

**Steps**:
1. Log in
2. Complete 3 sessions
3. Change settings
4. Log out
5. Close browser
6. Reopen and log in

**Verify**:
- [ ] All 3 sessions still visible
- [ ] Settings preserved
- [ ] Preferences intact
- [ ] OAuth session persists

**Expected**: All data stored securely in Supabase

---

### 15. Corporate Network Compatibility

**Test**: Works from locked-down environment

**Verify**:
- [ ] HTTPS works (no cert errors)
- [ ] No mixed content warnings
- [ ] Works without VPN
- [ ] No CORS errors
- [ ] Loads over standard port 443
- [ ] No websocket requirements (optional feature only)

**Expected**: Accessible from any corporate network

---

## 🔧 Optional Features Testing

### 16. Monthly Email Reports (If Configured)

**Prerequisites**:
- Resend API key configured
- Edge Function deployed
- pg_cron scheduled

**Test manually**:
```bash
# Trigger function manually
curl -X POST \
  https://[PROJECT_ID].supabase.co/functions/v1/send-monthly-reports \
  -H "Authorization: Bearer [ANON_KEY]"
```

**Verify**:
- [ ] Function executes without errors
- [ ] Email sent to opted-in users
- [ ] Email contains correct data
- [ ] Email not sent to opted-out users
- [ ] Record created in email_reports table
- [ ] No duplicate emails sent

**Check idempotency**:
- [ ] Running function twice doesn't send twice
- [ ] last_sent_month tracked correctly

**Expected**: Reliable, idempotent monthly emails

---

## 🚨 Error Handling

### 17. Network Errors

**Test**: App handles failures gracefully

**Steps**:
1. Disconnect internet
2. Try to start timer
3. Try to view sessions
4. Reconnect internet

**Verify**:
- [ ] Appropriate error messages
- [ ] App doesn't crash
- [ ] Recovers when connection restored
- [ ] Local timer still works
- [ ] Clear user feedback

**Expected**: Graceful degradation, clear error states

---

### 18. Invalid States

**Test**: App handles edge cases

**Verify**:
- [ ] Can't start timer twice
- [ ] Can't pause when idle
- [ ] Reset works from any state
- [ ] Session logging handles network failures
- [ ] Invalid auth tokens trigger re-login

**Expected**: Robust state management, no crashes

---

## 📊 Performance Testing

### 19. Load Time

**Test**: Fast initial load

**Metrics**:
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 90
- [ ] Bundle size < 200KB gzipped

**Expected**: Fast, optimized performance

---

### 20. Memory Usage

**Test**: No memory leaks

**Steps**:
1. Open DevTools → Performance
2. Record
3. Run 10 complete Pomodoro cycles
4. Stop recording

**Verify**:
- [ ] Memory stable (no continuous growth)
- [ ] requestAnimationFrame cleaned up
- [ ] No dangling event listeners

**Expected**: Stable memory usage over time

---

## ✅ Sign-Off Checklist

**Before going to production**:

Core Functionality:
- [ ] All 4 timer modes work
- [ ] Start/Pause/Resume/Reset work
- [ ] Audio system functional
- [ ] Session logging accurate
- [ ] Analytics dashboard correct
- [ ] Settings save properly

Authentication:
- [ ] Google OAuth works
- [ ] Local mode works
- [ ] Data syncs when logging in

Cross-Platform:
- [ ] Works on Windows
- [ ] Works on macOS
- [ ] Works on Linux
- [ ] Works on iOS
- [ ] Works on Android

Browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

Network:
- [ ] Works over HTTPS
- [ ] Works from corporate network
- [ ] Handles offline gracefully

Optional:
- [ ] Monthly emails configured (or documented as optional)
- [ ] Sound files added (or placeholder noted)

Documentation:
- [ ] README complete
- [ ] DEPLOYMENT.md clear
- [ ] Environment variables documented
- [ ] Troubleshooting guide included

**Final approval**: _______________  Date: _______________

---

## 📹 Demo Video Script

**Record a 2-minute screen capture showing**:

1. **Login** (15 seconds):
   - Open URL
   - Click "Sign in with Google"
   - Complete OAuth
   - Show logged-in state

2. **Complete Pomodoro** (45 seconds):
   - Select Short Pomodoro
   - Press Space to start
   - Show timer counting
   - Fast-forward or speed up
   - Show "Completed!" screen
   - Note session count

3. **View Dashboard** (45 seconds):
   - Navigate to Sessions
   - Show today/week/month counts
   - Show streak
   - Show chart
   - Show session table
   - Export CSV

4. **Settings** (15 seconds):
   - Navigate to Settings
   - Show toggles
   - Test sound
   - Show save confirmation

**Upload to**: YouTube (unlisted) or Loom or attach MP4 to release

---

**All tests passing? Ship it! 🚀**
