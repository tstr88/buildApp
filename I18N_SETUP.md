# buildApp Internationalization (i18n) Setup

Complete documentation for the Georgian (KA) and English (EN) internationalization system in buildApp.

## 📋 Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Translation Files](#translation-files)
- [Frontend Usage](#frontend-usage)
- [Backend Integration](#backend-integration)
- [Formatting Utilities](#formatting-utilities)
- [Components](#components)
- [Testing](#testing)

---

## Overview

buildApp supports two languages:
- **Georgian (KA)** - Default language
- **English (EN)** - Secondary language

### Key Features

- ✅ Automatic language detection from browser/localStorage
- ✅ User language preference stored in database
- ✅ Language synced across frontend and backend
- ✅ Georgian fonts (FiraGO, Noto Sans Georgian) properly configured
- ✅ Formatting utilities for currency, dates, numbers with localization
- ✅ Easy-to-use translation hooks and components

---

## Setup

### Dependencies Installed

**Frontend:**
```json
{
  "i18next": "^23.x",
  "react-i18next": "^14.x",
  "i18next-browser-languagedetector": "^7.x",
  "i18next-http-backend": "^2.x"
}
```

### Configuration Files

**1. i18n Configuration** - `frontend/src/i18n/config.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ka',           // Georgian is default
    defaultNS: 'common',
    supportedLngs: ['ka', 'en'],
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'buildapp_language',
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });
```

**2. Initialize in App** - `frontend/src/App.tsx`

```typescript
import './i18n/config'; // Import at the top
```

---

## Translation Files

### Structure

```
frontend/public/locales/
├── ka/
│   └── common.json    (Georgian translations)
└── en/
    └── common.json    (English translations)
```

### Available Namespaces

All translations are currently in the `common` namespace with the following categories:

#### Navigation
```json
{
  "navigation": {
    "home": "მთავარი / Home",
    "projects": "პროექტები / Projects",
    "catalog": "კატალოგი / Catalog",
    "factories": "ქარხნები / Factories",
    "rfqs": "მოთხოვნები და შეთავაზებები / RFQs & Offers",
    "orders": "შეკვეთები / Orders",
    "rentals": "იჯარა / Rentals",
    "profile": "პროფილი / Profile"
  }
}
```

#### User Types
```json
{
  "userTypes": {
    "buyer": "მყიდველი / Buyer",
    "supplier": "მიმწოდებელი / Supplier",
    "homeowner": "მეპატრონე / Homeowner",
    "contractor": "კონტრაქტორი / Contractor"
  }
}
```

#### Actions
```json
{
  "actions": {
    "send": "გაგზავნა / Send",
    "sendRFQ": "მოთხოვნის გაგზავნა / Send RFQ",
    "placeOrder": "შეკვეთის განთავსება / Place Order",
    "confirm": "დადასტურება / Confirm",
    "dispute": "დავა / Dispute"
  }
}
```

#### Status Labels
```json
{
  "status": {
    "created": "შექმნილი / Created",
    "pending": "მიმდინარე / Pending",
    "scheduled": "დაგეგმილი / Scheduled",
    "delivered": "მიწოდებული / Delivered",
    "completed": "დასრულებული / Completed",
    "disputed": "სადავო / Disputed"
  }
}
```

#### Units
```json
{
  "units": {
    "m": "მ / m",
    "m2": "მ² / m²",
    "m3": "მ³ / m³",
    "pcs": "ც. / pcs",
    "kg": "კგ / kg"
  }
}
```

### Adding New Translations

1. Add the key to both `ka/common.json` and `en/common.json`
2. Use the translation in your component:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return <button>{t('actions.send')}</button>;
}
```

---

## Frontend Usage

### 1. Using the Translation Hook

```typescript
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <p>Current language: {i18n.language}</p>

      {/* With interpolation */}
      <p>{t('messages.welcome', { name: 'John' })}</p>

      {/* With count (pluralization) */}
      <p>{t('trust.totalReviews', { count: 5 })}</p>
    </div>
  );
}
```

### 2. Changing Language

```typescript
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <button onClick={() => changeLanguage('ka')}>ქართული</button>
      <button onClick={() => changeLanguage('en')}>English</button>
    </div>
  );
}
```

### 3. Using LanguageToggle Component

```typescript
import LanguageToggle from '../components/LanguageToggle';

function Header() {
  return (
    <header>
      <LanguageToggle />
    </header>
  );
}
```

### 4. Translation with AuthContext

The `AuthContext` automatically syncs language preference:

```typescript
import { useAuth } from '../context/AuthContext';

function Settings() {
  const { updateLanguage } = useAuth();

  const handleLanguageChange = async (lang: 'ka' | 'en') => {
    await updateLanguage(lang); // Updates both frontend and backend
  };

  return (
    <select onChange={(e) => handleLanguageChange(e.target.value as 'ka' | 'en')}>
      <option value="ka">ქართული</option>
      <option value="en">English</option>
    </select>
  );
}
```

---

## Backend Integration

### Database Schema

The `users` table includes a `language` column:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  user_type user_type NOT NULL,
  buyer_role buyer_role,
  language language_preference DEFAULT 'ka',  -- Language preference
  ...
);
```

### API Endpoints

#### 1. Complete Registration with Language
```http
POST /api/auth/complete-registration
Content-Type: application/json

{
  "temp_token": "...",
  "name": "ნიკა",
  "user_type": "buyer",
  "buyer_role": "homeowner",
  "language": "ka"  // Optional, defaults to 'ka'
}
```

#### 2. Update User Preferences
```http
PATCH /api/auth/update-preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "en"
}

Response:
{
  "success": true,
  "user": {
    "id": "...",
    "phone": "+995555123456",
    "name": "ნიკა",
    "user_type": "buyer",
    "buyer_role": "homeowner",
    "language": "en"
  }
}
```

### Backend Controller

File: `backend/src/controllers/authController.ts`

```typescript
export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const { language } = req.body;

  // Validate language
  const validLanguages = ['ka', 'en'];
  if (!validLanguages.includes(language)) {
    res.status(400).json({
      success: false,
      error: 'Invalid language. Must be: ka or en',
    });
    return;
  }

  // Update user language
  await pool.query(
    'UPDATE users SET language = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [language, req.user.id]
  );

  // Return updated user
  res.json({ success: true, user: updatedUser });
}
```

---

## Formatting Utilities

File: `frontend/src/utils/formatters.ts`

### Currency Formatting

```typescript
import { formatCurrency, formatCurrencyDetailed } from '../utils/formatters';

formatCurrency(3600, 'ka');         // "3 600 ₾"
formatCurrency(3600, 'en');         // "3,600 ₾"
formatCurrencyDetailed(3600.50, 'ka'); // "3 600.50 ₾"
```

### Date Formatting

```typescript
import { formatDate, formatDateWithWeekday, formatDateShort } from '../utils/formatters';

const date = new Date(2024, 9, 30); // October 30, 2024

formatDate(date, 'ka');              // "30 ოქტომბერი"
formatDate(date, 'en');              // "October 30"
formatDate(date, 'ka', true);        // "30 ოქტომბერი 2024"
formatDateWithWeekday(date, 'ka');   // "კვი, 30 ოქტომბერი"
formatDateShort(date);               // "30.10.2024"
```

### Time Formatting

```typescript
import { formatTime, formatTimeRange, formatDateTime } from '../utils/formatters';

const time = new Date(2024, 9, 30, 9, 0);

formatTime(time);                    // "09:00"
formatTime('09:00');                 // "09:00"
formatTimeRange('09:00', '11:00');   // "09:00–11:00"
formatDateTime(time, 'ka');          // "30 ოქტომბერი, 09:00"
```

### Number Formatting

```typescript
import { formatNumber, formatDistance, formatPercentage } from '../utils/formatters';

formatNumber(12500, 'ka');    // "12 500"
formatNumber(12500, 'en');    // "12,500"
formatDistance(0.5, 'ka');    // "500 მ"
formatDistance(2.3, 'ka');    // "2.3 კმ"
formatPercentage(95.5);       // "95.5%"
```

### Phone Formatting

```typescript
import { formatPhone } from '../utils/formatters';

formatPhone('+995555123456');  // "+995 555 12 34 56"
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function OrderSummary({ total, deliveryDate }) {
  const { i18n } = useTranslation();

  return (
    <div>
      <p>Total: {formatCurrency(total, i18n.language)}</p>
      <p>Delivery: {formatDate(deliveryDate, i18n.language)}</p>
    </div>
  );
}
```

---

## Components

### LanguageToggle Component

**File:** `frontend/src/components/LanguageToggle.tsx`

#### Standard Toggle (Pills)

```typescript
import LanguageToggle from '../components/LanguageToggle';

<LanguageToggle />
```

Renders:
```
┌─────────┐
│ KA | EN │  (KA active by default)
└─────────┘
```

#### Compact Toggle

```typescript
import { LanguageToggleCompact } from '../components/LanguageToggle';

<LanguageToggleCompact />
```

Renders a single button showing the opposite language.

### Features

- ✅ Automatically syncs with AuthContext if user is logged in
- ✅ Updates database via API when authenticated
- ✅ Falls back to local i18next change if not authenticated
- ✅ Loading state while updating
- ✅ Error handling

---

## Georgian Fonts

### Configured Fonts

1. **FiraGO** (Primary)
   - Optimized for Georgian script
   - Loaded from CDN: `jsdelivr.net/gh/StefanPeev/FiraGO`
   - Weights: 400, 500, 600, 700

2. **Noto Sans Georgian** (Fallback)
   - Google Fonts
   - Variable font weights: 100-900

### Configuration

**HTML** (`frontend/index.html`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@100..900&display=swap" rel="stylesheet">
```

**CSS** (`frontend/src/index.css`):
```css
@font-face {
  font-family: 'FiraGO';
  src: url('https://cdn.jsdelivr.net/gh/StefanPeev/FiraGO@master/WOFF2/FiraGO-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

@theme {
  --font-firago: 'FiraGO', sans-serif;
  --font-noto-georgian: 'Noto Sans Georgian', sans-serif;
}

body {
  font-family: var(--font-firago);
}
```

### Testing Georgian Fonts

To verify Georgian fonts render correctly:

1. Open your browser DevTools
2. Inspect a Georgian text element
3. Check the "Computed" tab → "font-family"
4. Should show: `FiraGO, "Noto Sans Georgian", sans-serif`

Test string: **"buildApp - ქართული სამშენებლო მასალების ბაზარი"**

---

## Testing

### Manual Testing Checklist

#### 1. Language Detection
- [ ] Open app in browser with Georgian locale → Should default to KA
- [ ] Open app in browser with English locale → Should default to EN
- [ ] Change language, refresh page → Language should persist

#### 2. Authentication Flow
- [ ] Register new user with KA selected → User language saved as 'ka'
- [ ] Register new user with EN selected → User language saved as 'en'
- [ ] Login as existing user → Language syncs from database

#### 3. Language Toggle
- [ ] Click KA/EN toggle → UI updates immediately
- [ ] When logged in → API call updates database
- [ ] When logged out → Only frontend updates
- [ ] Check localStorage → `buildapp_language` key updated

#### 4. Formatting
- [ ] Currency displays correctly: "3 600 ₾" (KA) vs "3,600 ₾" (EN)
- [ ] Dates display correctly: "30 ოქტომბერი" (KA) vs "October 30" (EN)
- [ ] Numbers use correct separators: "12 500" (KA) vs "12,500" (EN)

#### 5. Fonts
- [ ] Georgian text renders with FiraGO font
- [ ] No tofu (□) characters for Georgian script
- [ ] Font weights (400, 500, 600, 700) load correctly

### API Testing

**Test Update Preferences Endpoint:**

```bash
# Get auth token first
TOKEN="your_jwt_token"

# Update to English
curl -X PATCH http://localhost:5000/api/auth/update-preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language": "en"}'

# Verify update
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "language": "en"
  }
}
```

### Database Testing

```sql
-- Check user language preferences
SELECT id, name, phone, language FROM users;

-- Update language manually
UPDATE users SET language = 'ka' WHERE id = 'user_id';

-- Verify language enum constraint
INSERT INTO users (phone, name, user_type, language)
VALUES ('+995555999888', 'Test', 'buyer', 'fr'); -- Should fail (invalid language)
```

---

## Common Issues & Solutions

### Issue: Translations not loading

**Solution:**
- Check that translation files exist in `frontend/public/locales/{lng}/common.json`
- Verify file paths in backend config: `loadPath: '/locales/{{lng}}/{{ns}}.json'`
- Check browser console for 404 errors

### Issue: Language not persisting after refresh

**Solution:**
- Check localStorage for `buildapp_language` key
- Verify i18next-browser-languagedetector is installed
- Check detection config in `i18n/config.ts`

### Issue: Georgian fonts not rendering

**Solution:**
- Check network tab for font file 404s
- Verify font-face declarations in `index.css`
- Check font-family in computed styles
- Try clearing browser cache

### Issue: Language not syncing with backend

**Solution:**
- Check that user is authenticated (`isAuthenticated === true`)
- Verify `/api/auth/update-preferences` endpoint is working
- Check AuthContext `updateLanguage` function
- Verify database `language` column accepts 'ka' and 'en'

---

## Future Enhancements

- [ ] Add more namespaces (e.g., `errors`, `forms`, `notifications`)
- [ ] Implement RTL support if needed for other languages
- [ ] Add translation management UI for admins
- [ ] Set up translation memory/TMS integration
- [ ] Add pluralization rules for Georgian
- [ ] Implement lazy loading of translation files
- [ ] Add language-specific number/date formats via Intl API

---

## Resources

- **i18next Documentation:** https://www.i18next.com/
- **react-i18next Documentation:** https://react.i18next.com/
- **FiraGO Font:** https://github.com/StefanPeev/FiraGO
- **Noto Sans Georgian:** https://fonts.google.com/noto/specimen/Noto+Sans+Georgian
- **Georgian Typography:** https://georgianfonts.ge/

---

**Last Updated:** October 30, 2024
**Version:** 1.0.0
