# buildApp Local Development Testing Guide

This guide will help you test the buildApp marketplace locally in your browser.

## Prerequisites

- PostgreSQL installed and running
- Node.js 18+ installed
- npm or yarn installed

## Starting the Application

### 1. Start PostgreSQL

**macOS:**
```bash
brew services start postgresql@14
```

**Linux:**
```bash
sudo systemctl start postgresql
```

**Verify PostgreSQL is running:**
```bash
pg_isready
```

### 2. Set Up the Database (First Time Only)

```bash
# From the backend directory
cd backend

# Create database and user
npm run db:setup

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

### 3. Start Backend Server

```bash
# From the backend directory
cd backend
npm run dev
```

The backend should start at: **http://localhost:3001**

**Verify backend is running:**
Open http://localhost:3001/api/health in your browser. You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

### 4. Start Frontend Server

Open a new terminal:

```bash
# From the frontend directory
cd frontend
npm run dev
```

The frontend should start at: **http://localhost:5173**

## Test Accounts

All test accounts use the hardcoded OTP: **123456** in development mode.

### Admin Account
- **Phone:** +995555000001
- **Name:** Admin User
- **Type:** admin
- **OTP:** 123456

### Buyer Accounts

**Homeowner:**
- **Phone:** +995555000002
- **Name:** Giorgi Beridze
- **Role:** homeowner
- **OTP:** 123456

**Contractor:**
- **Phone:** +995555000003
- **Name:** Nino Kapanadze
- **Role:** contractor
- **OTP:** 123456

### Supplier Accounts

**Concrete Supplier:**
- **Phone:** +995555000004
- **Name:** Tbilisi Concrete Plant
- **Type:** supplier
- **OTP:** 123456

**Materials Supplier:**
- **Phone:** +995555000005
- **Name:** Kavkaz Materials
- **Type:** supplier
- **OTP:** 123456

**Tools Rental:**
- **Phone:** +995555000006
- **Name:** ProTools Rental
- **Type:** supplier
- **OTP:** 123456

## Testing Flows

### 1. Buyer Journey - Template-Based Order (RFQ)

**Objective:** Test the complete flow from template selection to order placement.

1. **Sign In:**
   - Go to http://localhost:5173
   - Click "Sign In" or "შესვლა" (Georgian)
   - Enter phone: `+995555000002`
   - Enter OTP: `123456`
   - You should be logged in as Giorgi Beridze (Homeowner)

2. **Select Template:**
   - From home screen, click on "Fence" or "Slab" template
   - You should see the template details page

3. **Fill Template:**
   - Enter project details (e.g., for Fence: length, height, type)
   - The calculator should show estimated materials
   - Click "Create RFQ" or "შექმენი მოთხოვნა"

4. **Review RFQ:**
   - RFQ should be created and visible in "My RFQs"
   - Status should be "pending"
   - Multiple suppliers should be notified

5. **View Quotes:**
   - Wait for supplier quotes (you'll need to sign in as supplier to create quotes)
   - Compare quotes
   - Select best quote

6. **Create Order:**
   - Click "Accept Quote"
   - Review order details
   - Confirm order
   - Order should be created with status "pending"

### 2. Supplier Journey - Responding to RFQ

**Objective:** Test supplier viewing and responding to RFQs.

1. **Sign In as Supplier:**
   - Sign out if logged in
   - Sign in with: `+995555000004` (Tbilisi Concrete Plant)
   - OTP: `123456`

2. **View Incoming RFQs:**
   - Navigate to "RFQs" or "მოთხოვნები"
   - You should see RFQs that match your products

3. **Create Quote:**
   - Click on an RFQ
   - Review buyer requirements
   - Click "Create Quote" or "შექმენი შეთავაზება"
   - Enter pricing for each line item
   - Add delivery details and notes
   - Submit quote

4. **View Order (if accepted):**
   - If buyer accepts your quote, order appears in "Orders"
   - Status should be "pending"

### 3. Accept & Deliver Flow

**Objective:** Test the complete order fulfillment flow.

1. **Supplier Accepts Order:**
   - Sign in as supplier: `+995555000004`
   - Go to "Orders"
   - Click on pending order
   - Click "Accept Order"
   - Enter estimated delivery date
   - Status changes to "accepted"

2. **Supplier Delivers:**
   - Click "Mark as Delivered"
   - Upload delivery photos (optional)
   - Add delivery notes
   - Status changes to "delivered"

3. **Buyer Confirms Delivery:**
   - Sign in as buyer: `+995555000002`
   - Go to "Orders"
   - Click on delivered order
   - Review delivery details
   - Click "Confirm Receipt"
   - Status changes to "completed"

4. **Leave Review:**
   - Rate the supplier (1-5 stars)
   - Write review text
   - Submit review
   - Review should appear on supplier profile

### 4. Direct Order Flow (Skip RFQ)

**Objective:** Test direct ordering for common items.

1. **Sign In as Buyer:**
   - Sign in with: `+995555000003` (Nino Kapanadze - Contractor)
   - OTP: `123456`

2. **Browse Catalog:**
   - Click "Catalog" or "კატალოგი"
   - Browse categories: Concrete, Steel, Aggregates, etc.

3. **Add to Cart:**
   - Click on a product (e.g., "Concrete M300")
   - Select quantity
   - Click "Add to Cart"
   - Continue shopping or go to cart

4. **Checkout:**
   - Review cart
   - Select delivery address
   - Select delivery date
   - Click "Place Order"
   - Order is created directly with supplier

5. **Track Order:**
   - Go to "My Orders"
   - View order status
   - See delivery updates

### 5. Tools Rental Flow

**Objective:** Test equipment rental functionality.

1. **Browse Rental Tools:**
   - Sign in as buyer
   - Navigate to "Rental Tools" or "ხელსაწყოების დაქირავება"
   - Browse available tools

2. **Rent Tool:**
   - Select a tool (e.g., "Concrete Mixer 180L")
   - Choose rental period (start date, end date)
   - Review daily rate and total cost
   - View deposit requirement
   - Click "Rent Now"

3. **View Rental Order:**
   - Go to "My Rentals"
   - See rental details, pickup location, return date
   - Status should be "pending"

4. **Supplier Confirms Rental:**
   - Sign in as supplier (ProTools Rental: `+995555000006`)
   - View rental request
   - Accept or reject
   - Set pickup instructions

5. **Complete Rental:**
   - Mark as "picked_up" when buyer collects
   - Mark as "returned" when buyer returns
   - Release deposit

### 6. Admin Testing

**Objective:** Test admin dashboard and management features.

1. **Sign In as Admin:**
   - Sign in with: `+995555000001`
   - OTP: `123456`

2. **View Dashboard:**
   - Should see admin dashboard with statistics
   - Total users, orders, revenue, etc.

3. **Manage Users:**
   - View all users
   - Search/filter users
   - Activate/deactivate accounts
   - View user activity

4. **Manage Suppliers:**
   - View supplier list
   - Verify/unverify suppliers
   - View supplier performance metrics
   - Manage supplier categories

5. **View Orders:**
   - See all orders across platform
   - Filter by status, date, supplier
   - View order details

6. **Analytics:**
   - View platform analytics
   - Revenue reports
   - Popular products
   - Supplier performance

### 7. Language Toggle Testing

**Objective:** Test Georgian/English language switching.

1. **Switch Language:**
   - Click language toggle (KA/EN) in header
   - All UI text should switch language
   - Forms, buttons, labels all translated

2. **Test in Both Languages:**
   - Sign in
   - Navigate pages
   - Create RFQ
   - Fill forms
   - Verify translations are correct

### 8. Maps Integration Testing

**Objective:** Test Google Maps integration for locations.

1. **Supplier Location:**
   - View supplier profile
   - Map should show supplier location
   - Can see address and directions

2. **Delivery Location:**
   - When creating order, select delivery location
   - Click "Select on Map"
   - Map modal opens
   - Click to select location
   - Coordinates saved

3. **Nearby Suppliers:**
   - Enter your location
   - View suppliers near you
   - Map shows supplier markers
   - Can click for details

## Database Checking

You can inspect the database using `psql`:

```bash
# Connect to database
psql -U buildapp_user -d buildapp_dev

# View users
SELECT id, phone, name, user_type FROM users;

# View RFQs
SELECT id, project_name, status, created_at FROM rfqs;

# View orders
SELECT id, order_number, status, total_amount FROM orders;

# View suppliers
SELECT s.id, u.name, s.business_name, s.is_verified
FROM suppliers s
JOIN users u ON s.user_id = u.id;

# Exit
\q
```

## Common Issues

### Backend won't start

**Error:** `EADDRINUSE: address already in use :::3001`
- **Fix:** Another process is using port 3001. Find and kill it:
  ```bash
  lsof -ti:3001 | xargs kill -9
  ```

**Error:** `Connection refused to PostgreSQL`
- **Fix:** PostgreSQL is not running. Start it:
  ```bash
  brew services start postgresql@14  # macOS
  sudo systemctl start postgresql     # Linux
  ```

### Frontend won't connect to API

**Error:** Network errors, CORS errors
- **Check:** Backend is running on http://localhost:3001
- **Check:** Frontend .env has `VITE_API_URL=http://localhost:3001/api`
- **Restart:** Both frontend and backend servers

### OTP not working

**Error:** "Invalid OTP" when entering 123456
- **Check:** You're using a test account phone (+99555500000X)
- **Check:** Backend .env has `NODE_ENV=development`
- **Check:** Check backend console for OTP log message

### Database errors

**Error:** "relation does not exist" or "column does not exist"
- **Fix:** Run migrations:
  ```bash
  cd backend
  npm run db:migrate
  ```

**Error:** "duplicate key value violates unique constraint"
- **Fix:** Reset database:
  ```bash
  cd backend
  npm run db:reset
  ```

### Maps not loading

**Error:** Maps show blank or error
- **Check:** Google Maps API key is set in frontend .env
- **Check:** API key has Maps JavaScript API enabled
- **Check:** Browser console for specific error

## Resetting the Database

If you need to start fresh:

```bash
cd backend

# Option 1: Reset script (drops all tables, runs migrations, seeds)
npm run db:reset

# Option 2: Manual reset
npm run db:migrate        # Run migrations
npm run db:seed          # Seed data

# Option 3: Complete fresh start
dropdb -U postgres buildapp_dev
npm run db:setup
npm run db:migrate
npm run db:seed
```

## Development Best Practices

### Browser DevTools

Always keep browser DevTools open while testing:
- **Console:** View errors, warnings, API responses
- **Network:** Monitor API calls, check request/response
- **Application:** View localStorage, sessionStorage
- **React DevTools:** Inspect component state

### Backend Console

Monitor backend console for:
- OTP codes (logged in development)
- SQL queries (if enabled)
- API request logs
- Errors and stack traces

### PostgreSQL Client

Use a PostgreSQL client for easier database inspection:
- **pgAdmin** (GUI)
- **DBeaver** (GUI)
- **TablePlus** (GUI)
- **psql** (CLI)

Connection details:
- Host: localhost
- Port: 5432
- Database: buildapp_dev
- User: buildapp_user
- Password: buildapp_password

## Quick Verification Checklist

After setup, verify these work:

- [ ] Frontend loads at http://localhost:5173
- [ ] Backend health check: http://localhost:3001/api/health returns `{"status":"healthy"}`
- [ ] Can sign in with test buyer: +995555000002, OTP: 123456
- [ ] Home screen shows "Fence" and "Slab" templates
- [ ] Can navigate to Catalog and see SKUs
- [ ] Language toggle switches KA ↔ EN
- [ ] Can sign in as supplier: +995555000004, OTP: 123456
- [ ] Can sign in as admin: +995555000001, OTP: 123456
- [ ] Maps load properly (if API key configured)
- [ ] Backend console logs OTP codes

## Next Steps

Once basic testing is complete:

1. **Create your first RFQ** using the Fence template
2. **Respond to the RFQ** as a supplier
3. **Accept a quote** and create an order
4. **Test the complete order flow** from creation to delivery
5. **Try direct ordering** from the catalog
6. **Rent a tool** and complete the rental flow
7. **Explore admin features** for platform management

## Need Help?

- Check backend console for errors
- Check browser console for frontend errors
- Verify all environment variables are set correctly
- Ensure PostgreSQL is running
- Try resetting the database with `npm run db:reset`
- Review the API documentation at http://localhost:3001/api/docs (if Swagger is enabled)

Happy testing!
