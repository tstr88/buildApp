# Hostinger VPS Deployment Guide

Complete step-by-step guide to deploy buildApp on Hostinger VPS.

---

## Prerequisites

- ✅ Hostinger KVM 1 VPS with Ubuntu 22.04/24.04
- ✅ SSH key generated and added to VPS
- ✅ VPS IP address (will receive via email)
- ✅ Namecheap domain (optional, for custom domain)

---

## Step 1: Connect to VPS

Once you receive the VPS IP address via email, connect using:

```bash
ssh -i ~/.ssh/buildapp_hostinger root@YOUR_VPS_IP
```

**First time connecting:**
- You'll see a message about host authenticity
- Type `yes` and press Enter

---

## Step 2: Initial Server Setup

### Update System

```bash
apt update && apt upgrade -y
```

### Create Non-Root User (Security Best Practice)

```bash
# Create new user
adduser buildapp

# Add to sudo group
usermod -aG sudo buildapp

# Copy SSH keys to new user
rsync --archive --chown=buildapp:buildapp ~/.ssh /home/buildapp
```

### Setup Firewall

```bash
# Allow SSH
ufw allow OpenSSH

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### Switch to New User

```bash
su - buildapp
```

---

## Step 3: Install Node.js 20

```bash
# Install Node.js 20 from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x
```

---

## Step 4: Install PostgreSQL 16

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null

# Update and install PostgreSQL 16
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16

# Verify installation
sudo systemctl status postgresql
```

### Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user (run these commands in psql)
CREATE DATABASE buildapp_prod;
CREATE USER buildapp_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE buildapp_prod TO buildapp_user;

# Grant schema privileges
\c buildapp_prod
GRANT ALL ON SCHEMA public TO buildapp_user;

# Exit psql
\q
```

**IMPORTANT:** Save your database password! You'll need it for the environment variables.

---

## Step 5: Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## Step 6: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

## Step 7: Clone and Deploy Backend

```bash
# Create application directory
sudo mkdir -p /var/www
sudo chown -R buildapp:buildapp /var/www

# Clone repository
cd /var/www
git clone https://github.com/tstr88/buildApp.git
cd buildApp/backend

# Install dependencies
npm install

# Create production environment file
nano .env
```

**Copy this into .env file** (press Ctrl+O to save, Ctrl+X to exit):

```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://buildapp_user:your_secure_password_here@localhost:5432/buildapp_prod

# JWT
JWT_SECRET=your_random_jwt_secret_min_32_characters_change_this
JWT_EXPIRE=7d

# OTP
OTP_EXPIRY=5m

# Notifications
NOTIFICATIONS_ENABLED=false
SMS_PROVIDER=console

# URLs (update with your domain later)
API_URL=http://YOUR_VPS_IP
FRONTEND_URL=http://YOUR_VPS_IP
```

**Replace:**
- `your_secure_password_here` with your PostgreSQL password
- `your_random_jwt_secret_min_32_characters_change_this` with a random 32+ character string
- `YOUR_VPS_IP` with your actual VPS IP address

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### Build Backend

```bash
npm run build
```

### Run Database Migrations

```bash
npm run migrate
```

You should see: `✅ All migrations completed successfully`

### Start Backend with PM2

```bash
pm2 start dist/index.js --name buildapp-backend
pm2 save
pm2 startup
```

**Copy and run the command that PM2 outputs** (it will look like `sudo env PATH=...`)

---

## Step 8: Deploy Frontend

```bash
cd /var/www/buildApp/frontend

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

**Add this to .env.production:**

```env
VITE_API_URL=http://YOUR_VPS_IP
```

Replace `YOUR_VPS_IP` with your actual IP.

### Build Frontend

```bash
npm run build
```

This creates a `dist` folder with your production frontend.

---

## Step 9: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/buildapp
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name YOUR_VPS_IP;

    # Frontend
    location / {
        root /var/www/buildApp/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Replace `YOUR_VPS_IP` with your actual IP.

### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/buildapp /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 10: Test Your Application

1. **Open browser and visit:** `http://YOUR_VPS_IP`
2. **You should see the login page**
3. **Check backend API:** `http://YOUR_VPS_IP/api-docs`

### Test Login Flow

1. Enter phone: `+995555123456`
2. Request OTP
3. Check OTP in backend logs:
   ```bash
   pm2 logs buildapp-backend
   ```
4. Look for: `[OTP] Code for +995555123456: XXXXXX`
5. Enter the OTP code
6. Complete registration

---

## Step 11: Setup Custom Domain (Namecheap)

### A. Point Domain to VPS

1. **Log in to Namecheap**
2. **Go to Domain List → Manage**
3. **Advanced DNS → Add New Record:**
   - **Type:** A Record
   - **Host:** @
   - **Value:** YOUR_VPS_IP
   - **TTL:** Automatic

4. **Add www subdomain:**
   - **Type:** CNAME Record
   - **Host:** www
   - **Value:** @
   - **TTL:** Automatic

**DNS propagation takes 5-60 minutes**

### B. Update Nginx for Domain

```bash
sudo nano /etc/nginx/sites-available/buildapp
```

**Change `server_name` line to:**
```nginx
server_name yourdomain.com www.yourdomain.com YOUR_VPS_IP;
```

**Reload Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### C. Update Environment Variables

**Backend:**
```bash
cd /var/www/buildApp/backend
nano .env
```

Update:
```env
API_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Frontend:**
```bash
cd /var/www/buildApp/frontend
nano .env.production
```

Update:
```env
VITE_API_URL=https://yourdomain.com
```

**Rebuild and restart:**
```bash
# Rebuild frontend
cd /var/www/buildApp/frontend
npm run build

# Restart backend
pm2 restart buildapp-backend
```

---

## Step 12: Setup SSL Certificate (HTTPS)

**Install Certbot:**
```bash
sudo apt install -y certbot python3-certbot-nginx
```

**Get SSL Certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Follow prompts:**
1. Enter email address
2. Agree to terms
3. Choose whether to redirect HTTP to HTTPS (choose Yes/2)

**Auto-renewal is configured automatically!**

**Test renewal:**
```bash
sudo certbot renew --dry-run
```

---

## Step 13: Monitoring and Maintenance

### View Backend Logs
```bash
pm2 logs buildapp-backend
```

### Check Backend Status
```bash
pm2 status
```

### Restart Backend
```bash
pm2 restart buildapp-backend
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check Database
```bash
sudo -u postgres psql buildapp_prod -c "SELECT COUNT(*) FROM users;"
```

---

## Step 14: Deploy Updates

When you push code changes to GitHub:

```bash
cd /var/www/buildApp

# Pull latest code
git pull origin main

# Update backend
cd backend
npm install
npm run build
npm run migrate  # If there are new migrations
pm2 restart buildapp-backend

# Update frontend
cd ../frontend
npm install
npm run build
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs buildapp-backend

# Check if port 3001 is in use
sudo lsof -i :3001

# Restart
pm2 restart buildapp-backend
```

### Frontend Shows 502 Bad Gateway

```bash
# Check backend is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
sudo -u postgres psql -l

# Check user can connect
psql -U buildapp_user -d buildapp_prod -h localhost
```

### Can't Connect via SSH

```bash
# From your Mac, check SSH key
ls -la ~/.ssh/buildapp_hostinger*

# Try with verbose output
ssh -v -i ~/.ssh/buildapp_hostinger root@YOUR_VPS_IP
```

---

## Security Checklist

- ✅ Firewall enabled (UFW)
- ✅ Non-root user created
- ✅ SSH key authentication
- ✅ PostgreSQL with password
- ✅ JWT secret configured
- ✅ SSL certificate installed
- ✅ Regular updates: `sudo apt update && sudo apt upgrade`

---

## Performance Monitoring

### Check System Resources

```bash
# CPU and Memory
htop

# Disk space
df -h

# Check what's using memory
free -h
```

### Database Performance

```bash
# Check database size
sudo -u postgres psql buildapp_prod -c "SELECT pg_size_pretty(pg_database_size('buildapp_prod'));"

# Check connections
sudo -u postgres psql buildapp_prod -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Backup Strategy

### Database Backup

```bash
# Create backup
sudo -u postgres pg_dump buildapp_prod > backup_$(date +%Y%m%d).sql

# Restore from backup
sudo -u postgres psql buildapp_prod < backup_20250118.sql
```

### Automated Daily Backups

```bash
# Create backup script
nano ~/backup.sh
```

**Add:**
```bash
#!/bin/bash
BACKUP_DIR="/home/buildapp/backups"
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump buildapp_prod > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

**Make executable and schedule:**
```bash
chmod +x ~/backup.sh
crontab -e
```

**Add this line:**
```
0 2 * * * /home/buildapp/backup.sh
```

This runs daily at 2 AM.

---

## Success Checklist

- [ ] VPS created and accessible via SSH
- [ ] Node.js 20 installed
- [ ] PostgreSQL 16 installed and configured
- [ ] Nginx installed and running
- [ ] Backend deployed and running with PM2
- [ ] Frontend built and served by Nginx
- [ ] Database migrations completed
- [ ] Application accessible via IP
- [ ] Custom domain pointing to VPS
- [ ] SSL certificate installed
- [ ] Login/OTP working
- [ ] No errors in logs

---

## Next Steps After Deployment

1. **Test all features thoroughly**
2. **Set up monitoring** (optional: UptimeRobot, Pingdom)
3. **Configure backups**
4. **Update DNS TTL to 1 hour** (after confirming everything works)
5. **Share app with users!** 🚀

---

## Need Help?

If you encounter issues during deployment, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-16-main.log`

Share the error messages and I'll help debug!
