# Render.com One-Click Deployment Guide

This guide uses **render.yaml** Blueprint for automated deployment.

---

## ⚡ Super Quick Setup (3 Clicks)

### Step 1: Deploy Using Blueprint (One Click!)

1. **Click this button** (after pushing render.yaml to GitHub):

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tstr88/buildApp)

   **OR manually:**

2. Go to Render Dashboard: https://dashboard.render.com
3. Click **"New +"** → **"Blueprint"**
4. Connect your GitHub account (if not connected)
5. Select repository: **`tstr88/buildApp`**
6. Click **"Apply"**

That's it! Render will automatically create:
- ✅ Backend API service
- ✅ Frontend static site
- ✅ PostgreSQL database
- ✅ All environment variables
- ✅ Database connection

---

### Step 2: Run Database Migrations (One Command)

After deployment completes (5-10 minutes):

1. Go to **buildapp-backend** service in Render dashboard
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run migrate
   ```

4. Wait for success messages:
   ```
   ✅ All migrations completed successfully
   ```

---

### Step 3: Test Your App

1. **Frontend URL:**
   - Go to `https://buildapp-frontend.onrender.com`
   - Should see login page

2. **Backend API:**
   - Go to `https://buildapp-backend.onrender.com/api-docs`
   - Should see Swagger documentation

3. **Test Login:**
   - Enter phone: `+995555123456`
   - Request OTP
   - Check backend logs for OTP code:
     - Dashboard → buildapp-backend → Logs
     - Look for: `[OTP] Code for +995555123456: 123456`
   - Enter OTP code
   - Complete registration

---

## 🔧 Manual Setup (If Blueprint Doesn't Work)

If the Blueprint button doesn't work, follow these steps:

### A. Create PostgreSQL Database

1. Dashboard → **New +** → **PostgreSQL**
2. Configure:
   ```
   Name: buildapp-db
   Database: buildapp_prod
   User: buildapp_user
   Region: Frankfurt
   Plan: Free
   ```
3. Click **Create Database**
4. **Copy Internal Database URL** (we'll use it next)

### B. Create Backend Service

1. Dashboard → **New +** → **Web Service**
2. Connect GitHub → Select `tstr88/buildApp`
3. Configure:
   ```
   Name: buildapp-backend
   Region: Frankfurt
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start
   Plan: Free
   ```

4. Click **Advanced** → **Add Environment Variables:**

   ```bash
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your_random_secure_string_min_32_characters_long
   JWT_EXPIRE=7d
   OTP_EXPIRY=5m
   NOTIFICATIONS_ENABLED=false
   SMS_PROVIDER=console
   DATABASE_URL=[paste Internal Database URL from Step A]
   API_URL=https://buildapp-backend.onrender.com
   FRONTEND_URL=https://buildapp-frontend.onrender.com
   ```

5. Click **Create Web Service**

### C. Create Frontend Service

1. Dashboard → **New +** → **Static Site**
2. Connect GitHub → Select `tstr88/buildApp`
3. Configure:
   ```
   Name: buildapp-frontend
   Region: Frankfurt
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   Plan: Free
   ```

4. Click **Advanced** → **Add Environment Variable:**
   ```
   VITE_API_URL=https://buildapp-backend.onrender.com
   ```

5. Click **Create Static Site**

### D. Run Migrations

Same as Step 2 above.

---

## 🎯 URLs You'll Get

After deployment:

- **Backend API:** `https://buildapp-backend.onrender.com`
- **Frontend App:** `https://buildapp-frontend.onrender.com`
- **API Docs:** `https://buildapp-backend.onrender.com/api-docs`
- **Database:** Internal connection (not public)

---

## 📝 What to Share With Claude

After deployment, share:

1. **Backend URL** (so I can update configs)
2. **Frontend URL** (so I can update configs)
3. **Any error messages** from logs

Then I can help troubleshoot or optimize!

---

## ⚠️ Important Notes

### Free Tier Limitations

- **Backend sleeps** after 15 min inactivity
- **First request** takes 30-60 seconds (cold start)
- **Database free** for 90 days, then $7/month
- **Build time:** 5-10 minutes per service

### Auto-Deploy

- Pushes to `main` branch = automatic redeployment
- Check deployment status in Dashboard

### View Logs

1. Go to service (backend or frontend)
2. Click **Logs** tab
3. Real-time logs appear

### Run Commands

1. Go to backend service
2. Click **Shell** tab
3. Run commands like:
   ```bash
   npm run migrate          # Run migrations
   npm run migrate:status   # Check migration status
   node -v                  # Check Node version
   ```

---

## 🚀 Next Steps

### 1. Connect Custom Domain (Optional)

Use your Namecheap domain:

**In Render:**
1. Service → Settings → Custom Domain
2. Add: `api.yourdomain.com` (backend)
3. Add: `yourdomain.com` (frontend)
4. Copy CNAME target

**In Namecheap cPanel:**
1. DNS Settings → Add Record
2. Type: CNAME
3. Host: `api` (for backend) or `www` (for frontend)
4. Value: [paste CNAME from Render]
5. Save

**Update Environment Variables:**
```bash
# Backend
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

### 2. Upgrade to Paid Plan ($7/month)

Benefits:
- ✅ No cold starts
- ✅ Better performance
- ✅ Custom domains included
- ✅ SSL certificates
- ✅ Priority support

### 3. Enable Monitoring

Render provides:
- CPU/Memory usage
- Request metrics
- Error tracking
- Deployment history

### 4. Set Up Alerts

Get notified:
- Failed deployments
- Service downtime
- High memory usage

---

## 🐛 Troubleshooting

### Build Failed

Check build logs for errors:
- Missing dependencies? Run `npm install` locally first
- TypeScript errors? Fix them locally and push

### Database Connection Failed

1. Check DATABASE_URL is correct
2. Ensure database is in same region as backend
3. Check database status (should be "Available")

### Frontend Shows Error

1. Check VITE_API_URL is correct
2. Check backend is running (visit /api-docs)
3. Check browser console for CORS errors

### OTP Not Working

1. Backend logs → Look for `[OTP] Code for...`
2. If no logs, check phone number format: `+995XXXXXXXXX`
3. SMS_PROVIDER should be `console` for testing

### Migration Failed

Common issues:
1. Database not ready → Wait 1 minute, try again
2. Migrations already run → Check `migrate:status`
3. PostgreSQL version mismatch → Use version 16

---

## 📞 Need Help?

If stuck, share with Claude:
1. Which step you're on
2. Error message (full text)
3. Screenshot of error
4. Service logs (copy/paste)

I'll help debug!

---

## ✅ Deployment Checklist

- [ ] GitHub account connected to Render
- [ ] render.yaml pushed to GitHub
- [ ] Blueprint deployed (or manual setup complete)
- [ ] PostgreSQL database created
- [ ] Backend service running
- [ ] Frontend service running
- [ ] Database migrations run successfully
- [ ] Frontend loads at URL
- [ ] Backend API docs accessible
- [ ] Login works (OTP in logs)
- [ ] No errors in logs

---

## 🎉 Success Criteria

You've successfully deployed when:

1. ✅ Frontend URL loads login page
2. ✅ Backend API docs show at /api-docs
3. ✅ Can request OTP (appears in backend logs)
4. ✅ Can complete registration
5. ✅ No errors in service logs

Congrats! Your app is live! 🚀
