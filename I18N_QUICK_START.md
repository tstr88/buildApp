# i18n Quick Start Guide

## 🚀 Quick Setup (Already Complete!)

The i18n system is fully configured and ready to use. Here's how to get started:

## Using Translations in Components

### Basic Usage

```typescript
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <button>{t('actions.send')}</button>
      <p>{t('status.completed')}</p>
    </div>
  );
}
```

### Language Toggle

```typescript
import LanguageToggle from '../components/LanguageToggle';

export default function Header() {
  return (
    <header>
      <h1>buildApp</h1>
      <LanguageToggle />  {/* KA/EN toggle pills */}
    </header>
  );
}
```

### Formatting

```typescript
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function OrderCard({ total, date }) {
  const { i18n } = useTranslation();

  return (
    <div>
      <p>Total: {formatCurrency(total, i18n.language)}</p>
      <p>Date: {formatDate(date, i18n.language)}</p>
    </div>
  );
}
```

## Available Translation Keys

### Navigation
- `navigation.home` → "მთავარი / Home"
- `navigation.projects` → "პროექტები / Projects"
- `navigation.catalog` → "კატალოგი / Catalog"
- `navigation.orders` → "შეკვეთები / Orders"

### Actions
- `actions.send` → "გაგზავნა / Send"
- `actions.confirm` → "დადასტურება / Confirm"
- `actions.cancel` → "გაუქმება / Cancel"

### User Types
- `userTypes.buyer` → "მყიდველი / Buyer"
- `userTypes.supplier` → "მიმწოდებელი / Supplier"
- `userTypes.homeowner` → "მეპატრონე / Homeowner"
- `userTypes.contractor` → "კონტრაქტორი / Contractor"

### Status
- `status.created` → "შექმნილი / Created"
- `status.completed` → "დასრულებული / Completed"
- `status.pending` → "მიმდინარე / Pending"

### Units
- `units.m` → "მ / m"
- `units.m2` → "მ² / m²"
- `units.pcs` → "ც. / pcs"

See full list in `frontend/public/locales/ka/common.json`

## Formatting Functions

```typescript
import {
  formatCurrency,      // "3 600 ₾"
  formatDate,          // "30 ოქტომბერი"
  formatTime,          // "09:00"
  formatNumber,        // "12 500"
  formatPhone,         // "+995 555 12 34 56"
  formatDistance,      // "2.3 კმ"
} from '../utils/formatters';
```

## Testing

```bash
# Start both servers
npm run dev          # In frontend/
npm run dev          # In backend/

# Open browser
http://localhost:5173

# Test language toggle
1. Click KA/EN toggle
2. UI should update immediately
3. Check localStorage: buildapp_language
4. Register/login → language saves to database
```

## Common Patterns

### Button with translation
```typescript
<button>{t('actions.placeOrder')}</button>
```

### Status badge
```typescript
<span className={getStatusClass(status)}>
  {t(`status.${status}`)}
</span>
```

### Form labels
```typescript
<label>{t('terms.name')}</label>
<input type="text" />
```

### Currency display
```typescript
const { i18n } = useTranslation();
<p>{formatCurrency(price, i18n.language)}</p>
```

## Add New Translation

1. Edit `frontend/public/locales/ka/common.json`:
```json
{
  "mySection": {
    "myKey": "ქართული ტექსტი"
  }
}
```

2. Edit `frontend/public/locales/en/common.json`:
```json
{
  "mySection": {
    "myKey": "English text"
  }
}
```

3. Use in component:
```typescript
{t('mySection.myKey')}
```

## Language Preference Flow

1. **First Visit:**
   - Detects browser language
   - Defaults to Georgian (ka) if not EN/KA
   - Saves to localStorage

2. **Registration:**
   - Current language saved to user profile
   - Syncs with backend

3. **Login:**
   - Loads user's language preference from database
   - Updates i18next and localStorage

4. **Toggle:**
   - Updates i18next immediately
   - If logged in → saves to database
   - If not logged in → saves to localStorage only

## Files Structure

```
frontend/
├── public/locales/
│   ├── ka/common.json       # Georgian translations
│   └── en/common.json       # English translations
├── src/
│   ├── i18n/config.ts       # i18next configuration
│   ├── utils/formatters.ts  # Formatting utilities
│   ├── components/
│   │   └── LanguageToggle.tsx
│   └── context/AuthContext.tsx  # Language sync
backend/
└── src/
    ├── controllers/authController.ts  # updatePreferences endpoint
    └── routes/authRoutes.ts
```

## API Endpoints

**Update Language:**
```http
PATCH /api/auth/update-preferences
Authorization: Bearer <token>

{
  "language": "en"
}
```

**Register with Language:**
```http
POST /api/auth/complete-registration

{
  "temp_token": "...",
  "name": "John",
  "user_type": "buyer",
  "buyer_role": "homeowner",
  "language": "ka"
}
```

## Troubleshooting

**Translations not showing?**
- Check browser console for 404 errors
- Verify files exist: `frontend/public/locales/{ka,en}/common.json`

**Language not persisting?**
- Check localStorage key: `buildapp_language`
- For logged-in users, check database: `SELECT language FROM users WHERE id = ?`

**Georgian fonts not rendering?**
- Check Network tab for font 404s
- Inspect element → Computed → font-family should show "FiraGO"

## Resources

- Full documentation: [I18N_SETUP.md](./I18N_SETUP.md)
- i18next docs: https://www.i18next.com/
- react-i18next: https://react.i18next.com/

---

**Ready to use! 🎉**
