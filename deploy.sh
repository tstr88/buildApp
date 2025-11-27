#!/bin/bash
# BuildApp Deployment Script
#
# VPS Connection Details:
#   Host: 72.62.37.82
#   User: root
#   SSH Key: ~/.ssh/buildapp_hostinger
#   App Directory: /var/www/buildApp
#
# Usage: ./deploy.sh

set -e

echo "=== BuildApp Deployment ==="

# SSH connection details
SSH_KEY="~/.ssh/buildapp_hostinger"
SSH_USER="root"
SSH_HOST="72.62.37.82"
APP_DIR="/var/www/buildApp"

echo "1. Pushing to GitHub..."
git push origin main

echo "2. Deploying to VPS..."
ssh -i $SSH_KEY $SSH_USER@$SSH_HOST "cd $APP_DIR && git pull origin main && cd backend && npm run build && cd ../frontend && npm run build && pm2 restart all"

echo "=== Deployment Complete ==="
