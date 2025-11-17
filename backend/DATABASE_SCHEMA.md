# buildApp Database Schema Documentation

## Overview

The buildApp database schema is designed to support a comprehensive construction materials marketplace with the following key features:

- User authentication and profiles (buyers, suppliers, admins)
- Supplier catalogs with SKUs (Stock Keeping Units)
- Request for Quote (RFQ) system
- Order management with delivery tracking
- Rental tool system
- Trust metrics and reputation
- Billing and payments
- Notifications
- Construction project templates

## Database Structure

### Total Tables: 40+

## Core Entities

### 1. Users & Authentication

**users**
- Primary user accounts for all user types (buyer, supplier, admin)
- Phone-based authentication
- Language preferences (Georgian/English)
- Buyer roles (homeowner/contractor)

**user_sessions**
- JWT refresh token management
- Device tracking for security

**otps**
- One-time passwords for phone verification
- Used for registration, login, password reset

**projects**
- Construction projects linked to buyers
- Geographic location for delivery calculations

### 2. Suppliers & Catalog

**suppliers**
- Supplier business profiles
- Depot location for delivery range
- Delivery zones (JSONB polygons)
- Categories and payment terms
- Verification status

**skus** (Stock Keeping Units)
- Product catalog for each supplier
- Pricing, specifications, units
- Delivery options (pickup/delivery/both)
- Direct order availability

**sku_price_history**
- Audit trail of price changes

**supplier_categories**
- Predefined hierarchical categories

**supplier_operating_hours**
- Weekly operating schedule

### 3. RFQ System (Request for Quote)

**rfqs**
- Buyer requests for quotes
- Multiple line items (JSONB)
- Preferred delivery window
- Geographic delivery location

**rfq_recipients**
- Tracks which suppliers received RFQs
- View tracking

**offers**
- Supplier responses to RFQs
- Line-by-line pricing
- Delivery window and terms
- Expiration dates

**rfq_attachments** / **offer_attachments**
- File attachments (photos, PDFs, drawings)

**rfq_views**
- Analytics tracking for supplier views

### 4. Orders & Delivery

**orders**
- Material and rental orders
- Order lifecycle tracking
- Promised delivery windows
- Payment terms
- Auto-generated order numbers (ORD-YYYYMM-XXXXX)

**delivery_events**
- Actual delivery documentation
- Photos and quantities
- GPS location
- Partial delivery support

**confirmations**
- Buyer confirms or disputes delivery
- Evidence photos for disputes
- Dispute categories and resolution

**order_status_history**
- Audit trail of status changes

**order_communications**
- Messages between buyer and supplier

### 5. Rental System

**rental_tools**
- Equipment and tool catalog
- Day/week/month rates
- Deposit requirements
- Availability tracking

**rental_bookings**
- Rental reservations
- Duration and pricing
- Auto-generated booking numbers (RNT-YYYYMM-XXXXX)

**handovers**
- Tool handover documentation
- Condition photos and assessment
- Digital signatures

**returns**
- Tool return documentation
- Damage assessment
- Late return tracking

**rental_availability**
- Availability calendar
- Blocked dates for maintenance/bookings

### 6. Trust & Reputation

**trust_metrics**
- Supplier performance metrics
- Spec reliability percentage
- On-time delivery percentage
- Issue/dispute rate
- Automatically updated via triggers

**supplier_reviews**
- Star ratings and text reviews
- Verified purchase/rental
- Supplier responses

### 7. Billing & Payments

**billing_ledger**
- Financial transactions tracking
- Platform fee calculations (configurable %)
- Invoice management
- Auto-generated from completed orders/rentals

**supplier_payments**
- Payments made to suppliers
- Batch payment tracking

**buyer_payments**
- Payments received from buyers
- Multiple payment methods

### 8. Notifications

**notifications**
- Multi-channel notifications (push, SMS, email, in-app)
- Deep links for navigation
- Read/unread tracking
- Auto-expiration

**notification_preferences**
- Per-user, per-type preferences
- Channel enablement

### 9. Templates

**templates**
- Construction project templates
- Bilingual (Georgian/English)
- Form fields (JSONB)
- BOM (Bill of Materials) calculation logic
- Step-by-step instructions
- Safety notes

**template_usage**
- Usage analytics
- Saved user inputs

**user_saved_templates**
- User favorites

### 10. System

**system_logs**
- Comprehensive audit trail
- Request/response logging
- Error tracking

**scheduled_tasks**
- Background job queue
- Retry mechanism

## Key Features

### 1. Geographic Search
- Earthdistance extension for radius-based queries
- Functions: `find_suppliers_in_radius()`, `find_nearest_suppliers()`
- GIST indexes on lat/lng fields

### 2. Auto-Generated IDs
- Order numbers: ORD-YYYYMM-XXXXX
- Booking numbers: RNT-YYYYMM-XXXXX
- Invoice numbers (in billing_ledger)

### 3. Automatic Triggers

**Trust Metrics Updates**
- Triggered on confirmation insert
- Recalculates spec_reliability_pct, on_time_pct, issue_rate_pct

**Billing Ledger Creation**
- Triggered when order/rental completes
- Calculates platform fees automatically

**Order Status Updates**
- Delivery event → sets order to 'delivered'
- Confirmation → sets order to 'completed' or 'disputed'

**Rental Status Updates**
- Handover → sets booking to 'active'
- Return → sets booking to 'completed', calculates late fees

**Availability Blocking**
- Confirmed booking → blocks rental tool availability

### 4. JSONB Fields

Used for flexible, structured data:
- **rfqs.lines**: Array of line items with specs
- **offers.line_prices**: Matching pricing array
- **orders.items**: Order line items
- **delivery_events.quantities_delivered**: Actual quantities
- **confirmations.evidence_photos**: Dispute evidence
- **handovers/returns.condition_flags**: Condition assessment
- **templates.fields**: Form field definitions
- **templates.instructions**: Step-by-step guides

### 5. Full-Text Search

- `pg_trgm` extension for fuzzy matching
- GIN indexes on:
  - skus.name
  - skus.spec_string
  - rental_tools.name
  - suppliers.business_name

### 6. Materialized View

**supplier_statistics**
- Aggregated supplier metrics
- Total orders/rentals
- Total revenue
- Average ratings
- Refresh with: `SELECT refresh_supplier_statistics();`

## Enums

### User Types
- `user_type`: buyer, supplier, admin
- `buyer_role`: homeowner, contractor
- `language_preference`: ka (Georgian), en (English)

### Order & Status
- `order_type`: material, rental
- `order_status`: pending, confirmed, in_transit, delivered, completed, disputed, cancelled
- `booking_status`: pending, confirmed, active, completed, overdue, disputed, cancelled
- `delivery_option`: pickup, delivery, both

### RFQ & Offers
- `rfq_status`: draft, active, expired, closed
- `offer_status`: pending, accepted, rejected, expired, withdrawn

### Disputes
- `confirmation_type`: confirm, dispute
- `dispute_category`: quantity_mismatch, quality_issue, specification_mismatch, damage, late_delivery, wrong_item, other

### Financial
- `payment_terms`: cod, net_7, net_15, net_30, advance_50, advance_100
- `invoice_status`: pending, issued, paid, overdue, cancelled

### Notifications
- `notification_type`: rfq_received, offer_received, order_confirmed, delivery_completed, etc.
- `notification_channel`: push, sms, email, in_app

## Indexes

### Performance Indexes
- Composite indexes on common query patterns
- Partial indexes for active/pending records
- GIN indexes for JSONB fields
- GIST indexes for geographic queries
- Full-text search indexes

### Geographic Indexes
- Users: `ll_to_earth()` on project locations
- Suppliers: `ll_to_earth()` on depot locations

## Constraints

### Data Integrity
- Foreign keys with appropriate CASCADE/SET NULL
- CHECK constraints for:
  - Valid percentages (0-100)
  - Positive amounts and prices
  - Valid coordinate ranges
  - Date range validations
  - Conditional requirements (e.g., dispute fields when disputing)

### Unique Constraints
- One supplier per user
- One trust_metrics per supplier
- One handover/return per booking
- Unique RFQ-supplier pairs for recipients and offers

## Migration System

### Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:rollback

# Rollback last 3 migrations
npm run migrate:rollback 3

# Create new migration
npm run migrate:create add_feature_name
```

### Migration Files

Located in: `src/database/migrations/`

1. **001_create_enums_and_base_types.sql**
   - All enum types
   - Required extensions (uuid-ossp, btree_gin)

2. **002_create_users_and_projects.sql**
   - Users, projects, sessions, OTPs
   - Updated_at trigger function

3. **003_create_suppliers_and_skus.sql**
   - Suppliers, SKUs, categories
   - Operating hours, price history

4. **004_create_rfqs_and_offers.sql**
   - RFQs, recipients, offers
   - Attachments, view tracking

5. **005_create_orders_and_delivery.sql**
   - Orders, delivery events
   - Confirmations, status history
   - Communications, auto-numbering

6. **006_create_rental_system.sql**
   - Rental tools, bookings
   - Handovers, returns, availability

7. **007_create_trust_and_billing.sql**
   - Trust metrics with auto-updates
   - Billing ledger with triggers
   - Payments, reviews

8. **008_create_notifications_and_templates.sql**
   - Notifications, preferences
   - Templates, usage tracking
   - System logs, scheduled tasks

9. **009_additional_indexes_and_extensions.sql**
   - Geographic extensions (cube, earthdistance)
   - Full-text search (pg_trgm)
   - Performance indexes
   - Distance calculation functions
   - Supplier statistics view

## Usage Examples

### Find Nearby Suppliers

```sql
-- Suppliers within 10km
SELECT * FROM find_suppliers_in_radius(41.7151, 44.8271, 10);

-- 5 nearest suppliers
SELECT * FROM find_nearest_suppliers(41.7151, 44.8271, 5);
```

### Send Notification

```sql
SELECT create_notification(
  'user-uuid',
  'order_confirmed',
  'Order Confirmed',
  'Your order #ORD-202501-00001 has been confirmed',
  '/orders/order-uuid',
  '{"order_id": "order-uuid"}'::jsonb
);
```

### Get Supplier Statistics

```sql
SELECT * FROM supplier_statistics
WHERE supplier_id = 'supplier-uuid';

-- Refresh stats
SELECT refresh_supplier_statistics();
```

### Calculate Distance

```sql
SELECT calculate_distance_km(41.7151, 44.8271, 41.6938, 44.8015) as distance_km;
```

## Best Practices

### For Developers

1. **Always use migrations** - Never modify schema directly
2. **Test migrations locally** first before production
3. **Add comments** to migrations for complex logic
4. **Use transactions** - Migrations run in transactions automatically
5. **Index strategically** - Based on query patterns
6. **Leverage JSONB** for flexible data, but index appropriately
7. **Use enums** for fixed value sets
8. **Document changes** in migration files

### For Queries

1. **Use prepared statements** to prevent SQL injection
2. **Leverage indexes** - Check with EXPLAIN ANALYZE
3. **Use JSONB operators** efficiently (@>, ->, etc.)
4. **Batch operations** when possible
5. **Use materialized views** for expensive aggregations
6. **Geographic queries** - Use earthdistance functions

## Security Considerations

1. **Row-level security** - Can be added per table if needed
2. **Audit trails** - All status changes logged
3. **Session management** - Refresh tokens tracked
4. **Phone verification** - OTP-based authentication
5. **Soft deletes** - Consider for critical data (currently hard deletes with CASCADE)

## Maintenance

### Regular Tasks

```bash
# Refresh supplier statistics (run daily)
SELECT refresh_supplier_statistics();

# Clean up old notifications (run weekly)
SELECT cleanup_old_notifications();

# Vacuum analyze (database maintenance)
VACUUM ANALYZE;
```

### Monitoring

- Monitor index usage: `pg_stat_user_indexes`
- Track slow queries: `pg_stat_statements`
- Check table sizes: `pg_total_relation_size`
- Monitor connection pool

## Future Enhancements

Potential schema additions:

1. **Messaging system** - Direct messaging between users
2. **Inventory tracking** - Real-time stock levels
3. **Price negotiations** - Back-and-forth negotiation flow
4. **Subscription plans** - Premium supplier features
5. **Analytics tables** - Pre-aggregated metrics
6. **Document management** - Contracts, invoices, receipts
7. **Loyalty programs** - Points and rewards
8. **Multi-currency support** - Currently GEL only
9. **Multi-language content** - Content localization
10. **API rate limiting** - Request throttling

## Support

For schema questions or issues:
1. Check migration files for detailed comments
2. Review this documentation
3. Use `npm run migrate:status` to check current state
4. Test migrations in development first

---

**Schema Version**: 1.0
**Last Updated**: 2025-01
**Total Tables**: 40+
**Total Migrations**: 9
