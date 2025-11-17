# buildApp - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd buildapp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment

**Backend** - Copy and edit `.env`:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=buildapp
DB_USER=postgres
DB_PASSWORD=your_password
```

**Frontend** - Copy `.env` (defaults are fine):
```bash
cd ../frontend
cp .env.example .env
```

### Step 3: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✓ Backend runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✓ Frontend runs on http://localhost:5173

## ✅ Verify Setup

Open http://localhost:5173 in your browser

Test API:
```bash
curl http://localhost:5000/api/health
```

Expected: `{"status":"ok","message":"buildApp API is running"}`

## 📁 What's Included

- ✅ React 19 + TypeScript + Vite
- ✅ Tailwind CSS v4 (custom Georgian design system)
- ✅ Node.js + Express + PostgreSQL
- ✅ Georgian (KA) & English (EN) i18n ready
- ✅ FiraGO font support
- ✅ ESLint + Prettier configured
- ✅ TypeScript strict mode
- ✅ API service, utilities, type definitions
- ✅ Folder structure ready for features

## 🎨 Using Custom Colors

```tsx
<div className="bg-[var(--color-charcoal)] text-[var(--color-concrete-light)]">
  Content
</div>
```

Available colors:
- `--color-charcoal` (#121212)
- `--color-concrete` (#E6E6E6)
- `--color-concrete-light` (#F2F2F2)
- `--color-graphite` (#222222)
- `--color-success` (#2E7D32)
- `--color-caution` (#F5A300)
- `--color-action` (#2563EB)

## 🌐 Using i18n

```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();

  return (
    <>
      <h1>{t('app.name')}</h1>
      <button onClick={() => i18n.changeLanguage('ka')}>ქართული</button>
      <button onClick={() => i18n.changeLanguage('en')}>English</button>
    </>
  );
}
```

## 📝 Common Commands

```bash
# Root level (from buildapp/)
npm run dev:backend         # Start backend
npm run dev:frontend        # Start frontend
npm run build:backend       # Build backend
npm run build:frontend      # Build frontend

# Backend (from backend/)
npm run dev                 # Dev server
npm run build               # Compile TS
npm run lint                # Check code
npm run format              # Format code

# Frontend (from frontend/)
npm run dev                 # Dev server
npm run build               # Build for prod
npm run lint                # Check code
npm run format              # Format code
```

## 📚 Documentation

- [README.md](./README.md) - Full documentation
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Architecture details
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Complete setup checklist

## 🎯 Next Steps

Start building features:

1. Create database tables
2. Add authentication
3. Build API endpoints
4. Create UI components
5. Implement pages

Happy coding! 🚀
