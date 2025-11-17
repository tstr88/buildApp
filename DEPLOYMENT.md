# buildApp Deployment Guide

## Current Server Status
- **Namecheap Stellar Shared Hosting** - ❌ Not compatible
- Server: server347.web-hosting.com
- IP: 66.29.153.214
- Issue: No Node.js or PostgreSQL support on shared hosting

---

## Recommended Deployment Options

### Option 1: Railway.app (Recommended ⭐)

**Cost:** $5/month for hobby plan + usage
**Why:** Easiest deployment, built for Node.js + PostgreSQL

**Steps:**

1. **Sign up at Railway.app**
   - Go to https://railway.app
   - Sign up with GitHub account

2. **Deploy from GitHub**
   ```bash
   # Push your code to GitHub (already done)
   # In Railway dashboard:
   # 1. Click "New Project"
   # 2. Select "Deploy from GitHub repo"
   # 3. Choose "tstr88/buildApp"
   ```

3. **Add PostgreSQL Database**
   ```bash
   # In Railway project:
   # 1. Click "New" → "Database" → "Add PostgreSQL"
   # 2. Railway will auto-create DATABASE_URL environment variable
   ```

4. **Set Environment Variables**
   ```bash
   # In Railway project settings → Variables, add:
   NODE_ENV=production
   PORT=3001

   # JWT Configuration
   JWT_SECRET=your_production_jwt_secret_min_32_chars_change_this_in_production
   JWT_EXPIRE=7d

   # OTP Configuration
   OTP_EXPIRY=5m

   # Frontend URL (update after deploying frontend)
   FRONTEND_URL=https://your-frontend-url.railway.app

   # Notifications
   NOTIFICATIONS_ENABLED=false
   SMS_PROVIDER=console

   # Database (automatically set by Railway when you add PostgreSQL)
   # DATABASE_URL is auto-configured

   # API URL (Railway will provide this)
   API_URL=https://your-backend-url.railway.app
   ```

5. **Deploy**
   - Railway auto-deploys on git push
   - Get your URLs from Railway dashboard

6. **Run Migrations**
   ```bash
   # In Railway backend service, go to Settings → Deploy Triggers
   # Add this as a deploy command:
   npm run migrate
   ```

---

### Option 2: DigitalOcean App Platform

**Cost:** $12/month (includes database)
**Why:** Reliable, good documentation

**Steps:**

1. **Create DigitalOcean Account**
   - https://www.digitalocean.com
   - Get $200 credit for 60 days with GitHub Student Pack

2. **Deploy via GitHub**
   ```bash
   # 1. Go to Apps → Create App
   # 2. Connect GitHub account
   # 3. Select tstr88/buildApp repo
   # 4. DigitalOcean auto-detects Node.js app
   ```

3. **Add Database**
   - Add PostgreSQL database component
   - DigitalOcean auto-injects DATABASE_URL

4. **Configure Environment Variables** (same as Railway)

5. **Deploy**
   - Auto-deploys on git push to main

---

### Option 3: Render.com

**Cost:** Free tier available (spins down after inactivity)
**Why:** Good free option for testing

**Steps:**

1. **Sign up at Render.com**
   - https://render.com
   - Connect GitHub

2. **Create Web Service**
   ```bash
   # 1. New → Web Service
   # 2. Connect tstr88/buildApp repo
   # 3. Configure:
   Name: buildapp-backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run start
   ```

3. **Add PostgreSQL Database**
   ```bash
   # 1. New → PostgreSQL
   # 2. Copy Internal Database URL
   # 3. Add to backend environment variables as DATABASE_URL
   ```

4. **Set Environment Variables** (same as above)

5. **Deploy Frontend**
   ```bash
   # Create separate Static Site for frontend:
   Name: buildapp-frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

---

### Option 4: Heroku

**Cost:** $7/month (Eco plan)
**Why:** Classic, well-documented

**Steps:**

1. **Install Heroku CLI**
   ```bash
   brew tap heroku/brew && brew install heroku
   # or
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create buildapp-backend
   heroku create buildapp-frontend
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:essential-0 -a buildapp-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production -a buildapp-backend
   heroku config:set JWT_SECRET=your_secret -a buildapp-backend
   # ... add all other variables
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Run Migrations**
   ```bash
   heroku run npm run migrate -a buildapp-backend
   ```

---

### Option 5: VPS (DigitalOcean Droplet)

**Cost:** $6/month
**Why:** Full control, best for learning

**Steps:**

1. **Create Droplet**
   - OS: Ubuntu 22.04
   - Plan: Basic $6/month (1GB RAM)
   - Region: Choose closest to Georgia

2. **Initial Server Setup**
   ```bash
   # SSH into server
   ssh root@your_droplet_ip

   # Update system
   apt update && apt upgrade -y

   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs

   # Install PostgreSQL
   apt install -y postgresql postgresql-contrib

   # Install Nginx
   apt install -y nginx

   # Install PM2 (process manager)
   npm install -g pm2
   ```

3. **Setup PostgreSQL**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE buildapp_prod;
   CREATE USER buildapp_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE buildapp_prod TO buildapp_user;
   \q
   ```

4. **Deploy Application**
   ```bash
   # Clone repo
   cd /var/www
   git clone https://github.com/tstr88/buildApp.git
   cd buildApp

   # Install dependencies
   cd backend
   npm install

   # Create .env file
   nano .env
   # Add all environment variables

   # Build
   npm run build

   # Run migrations
   npm run migrate

   # Start with PM2
   pm2 start dist/index.js --name buildapp-backend
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```bash
   nano /etc/nginx/sites-available/buildapp
   ```

   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           root /var/www/buildApp/frontend/dist;
           try_files $uri /index.html;
       }
   }
   ```

   ```bash
   ln -s /etc/nginx/sites-available/buildapp /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

6. **Setup SSL (Let's Encrypt)**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d your_domain.com
   ```

---

## Use Your Namecheap Domain

Once deployed to any option above, you can use your Namecheap domain:

1. **Get deployment URL** (e.g., `buildapp-backend.railway.app`)

2. **In Namecheap cPanel → DNS Settings**
   ```
   Type: A
   Host: @
   Value: [Your deployment IP or use CNAME]
   TTL: Automatic

   Type: CNAME
   Host: www
   Value: your-app.railway.app
   ```

3. **Update environment variables**
   ```
   FRONTEND_URL=https://yourdomain.com
   API_URL=https://api.yourdomain.com
   ```

---

## Comparison Table

| Platform | Cost | Difficulty | PostgreSQL | Auto-Deploy | Free Tier |
|----------|------|------------|------------|-------------|-----------|
| Railway.app | $5/mo | ⭐ Easy | ✅ Included | ✅ Yes | ❌ No |
| Render.com | Free | ⭐ Easy | ✅ Included | ✅ Yes | ✅ Yes (limited) |
| DigitalOcean App | $12/mo | ⭐⭐ Medium | ✅ Included | ✅ Yes | ❌ No |
| Heroku | $7/mo | ⭐⭐ Medium | ✅ Add-on | ✅ Yes | ❌ No |
| VPS Droplet | $6/mo | ⭐⭐⭐ Hard | ⚙️ Self-setup | ❌ Manual | ❌ No |

---

## My Recommendation

**Start with Railway.app:**
1. Easiest setup (5 minutes)
2. Auto-deploys from GitHub
3. Includes PostgreSQL
4. $5/month is reasonable
5. Can migrate to VPS later if needed

Then use your Namecheap domain to point to Railway deployment.

---

## Quick Start with Railway

```bash
# 1. Push latest changes to GitHub
git add .
git commit -m "Prepare for Railway deployment"
git push origin main

# 2. Go to railway.app and sign up with GitHub
# 3. Create new project → Deploy from GitHub repo
# 4. Select tstr88/buildApp
# 5. Add PostgreSQL database
# 6. Add environment variables
# 7. Deploy!

# Your app will be live at:
# Backend: https://buildapp-backend.railway.app
# Frontend: https://buildapp-frontend.railway.app

# 8. Point your Namecheap domain to Railway
```

Need help with any specific deployment option? Let me know!
