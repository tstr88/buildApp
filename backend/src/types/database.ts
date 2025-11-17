// Database Type Definitions for buildApp
// Auto-generated from PostgreSQL schema

// =============================================================================
// ENUMS
// =============================================================================

export type UserType = 'buyer' | 'supplier' | 'admin';
export type BuyerRole = 'homeowner' | 'contractor';
export type LanguagePreference = 'ka' | 'en';
export type OrderType = 'material' | 'rental';
export type DeliveryOption = 'pickup' | 'delivery' | 'both';

export type RfqStatus = 'draft' | 'active' | 'expired' | 'closed';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export type ConfirmationType = 'confirm' | 'dispute';

export type DisputeCategory =
  | 'quantity_mismatch'
  | 'quality_issue'
  | 'specification_mismatch'
  | 'damage'
  | 'late_delivery'
  | 'wrong_item'
  | 'other';

export type InvoiceStatus = 'pending' | 'issued' | 'paid' | 'overdue' | 'cancelled';

export type NotificationType =
  | 'rfq_received'
  | 'offer_received'
  | 'offer_accepted'
  | 'order_confirmed'
  | 'delivery_scheduled'
  | 'delivery_completed'
  | 'confirmation_reminder'
  | 'dispute_raised'
  | 'payment_due'
  | 'rental_due'
  | 'return_reminder'
  | 'system_message';

export type NotificationChannel = 'push' | 'sms' | 'email' | 'in_app';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'overdue'
  | 'disputed'
  | 'cancelled';

export type PaymentTerms = 'cod' | 'net_7' | 'net_15' | 'net_30' | 'advance_50' | 'advance_100';

// =============================================================================
// TABLE INTERFACES
// =============================================================================

export interface User {
  id: string;
  phone: string;
  name: string;
  user_type: UserType;
  buyer_role: BuyerRole | null;
  language: LanguagePreference;
  email: string | null;
  profile_photo_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  refresh_token: string;
  device_info: Record<string, unknown> | null;
  ip_address: string | null;
  expires_at: Date;
  created_at: Date;
  last_used_at: Date;
}

export interface Otp {
  id: string;
  phone: string;
  otp_code: string;
  purpose: string;
  attempts: number;
  is_used: boolean;
  expires_at: Date;
  created_at: Date;
}

export interface Supplier {
  id: string;
  user_id: string;
  business_name: string;
  depot_latitude: number | null;
  depot_longitude: number | null;
  depot_address: string | null;
  delivery_zones: unknown | null; // JSONB
  categories: string[];
  payment_terms: PaymentTerms[];
  about: string | null;
  logo_url: string | null;
  cover_photo_url: string | null;
  business_registration_number: string | null;
  tax_id: string | null;
  is_verified: boolean;
  is_active: boolean;
  min_order_value: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Sku {
  id: string;
  supplier_id: string;
  name: string;
  spec_string: string | null;
  category: string;
  unit: string;
  base_price: number;
  images: string[];
  direct_order_available: boolean;
  delivery_options: DeliveryOption;
  approx_lead_time_label: string | null;
  negotiable: boolean;
  description: string | null;
  specifications: Record<string, unknown> | null;
  min_order_quantity: number | null;
  max_order_quantity: number | null;
  is_active: boolean;
  stock_status: string;
  created_at: Date;
  updated_at: Date;
}

export interface SkuPriceHistory {
  id: string;
  sku_id: string;
  old_price: number | null;
  new_price: number;
  changed_by: string | null;
  created_at: Date;
}

export interface SupplierCategory {
  id: number;
  slug: string;
  name_ka: string;
  name_en: string;
  icon_name: string | null;
  parent_id: number | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
}

export interface SupplierOperatingHours {
  id: string;
  supplier_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

export interface Rfq {
  id: string;
  project_id: string;
  title: string | null;
  lines: RfqLine[];
  preferred_window_start: Date | null;
  preferred_window_end: Date | null;
  delivery_location_lat: number | null;
  delivery_location_lng: number | null;
  delivery_address: string | null;
  additional_notes: string | null;
  status: RfqStatus;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface RfqLine {
  sku_id?: string;
  description: string;
  quantity: number;
  unit: string;
  spec_notes?: string;
}

export interface RfqRecipient {
  id: string;
  rfq_id: string;
  supplier_id: string;
  viewed_at: Date | null;
  notified_at: Date;
  created_at: Date;
}

export interface Offer {
  id: string;
  rfq_id: string;
  supplier_id: string;
  line_prices: OfferLine[];
  total_amount: number;
  delivery_window_start: Date | null;
  delivery_window_end: Date | null;
  payment_terms: PaymentTerms;
  delivery_fee: number;
  notes: string | null;
  expires_at: Date;
  status: OfferStatus;
  accepted_at: Date | null;
  rejected_at: Date | null;
  rejection_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OfferLine {
  line_index: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface RfqAttachment {
  id: string;
  rfq_id: string;
  file_url: string;
  file_type: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  uploaded_at: Date;
}

export interface OfferAttachment {
  id: string;
  offer_id: string;
  file_url: string;
  file_type: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  uploaded_at: Date;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  supplier_id: string;
  project_id: string | null;
  offer_id: string | null;
  order_type: OrderType;
  items: OrderItem[];
  total_amount: number;
  delivery_fee: number;
  tax_amount: number;
  grand_total: number;
  pickup_or_delivery: DeliveryOption;
  delivery_address: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  promised_window_start: Date | null;
  promised_window_end: Date | null;
  payment_terms: PaymentTerms;
  negotiable: boolean;
  status: OrderStatus;
  notes: string | null;
  buyer_notes: string | null;
  supplier_notes: string | null;
  confirmed_at: Date | null;
  delivered_at: Date | null;
  completed_at: Date | null;
  cancelled_at: Date | null;
  cancellation_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  sku_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

export interface DeliveryEvent {
  id: string;
  order_id: string;
  photos: string[];
  quantities_delivered: Record<string, unknown>;
  delivery_notes: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  timestamp: Date;
  supplier_user_id: string | null;
  vehicle_info: string | null;
  driver_name: string | null;
  is_partial: boolean;
  created_at: Date;
}

export interface Confirmation {
  id: string;
  order_id: string;
  delivery_event_id: string | null;
  buyer_user_id: string;
  confirmation_type: ConfirmationType;
  dispute_reason: string | null;
  dispute_category: DisputeCategory | null;
  evidence_photos: string[];
  resolution_notes: string | null;
  resolved_at: Date | null;
  resolved_by: string | null;
  timestamp: Date;
  created_at: Date;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by: string | null;
  notes: string | null;
  created_at: Date;
}

export interface OrderCommunication {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  attachments: string[];
  is_internal: boolean;
  read_at: Date | null;
  created_at: Date;
}

export interface RentalTool {
  id: string;
  supplier_id: string;
  name: string;
  spec_string: string | null;
  category: string;
  day_rate: number;
  week_rate: number | null;
  month_rate: number | null;
  deposit_info: string | null;
  deposit_amount: number | null;
  delivery_option: DeliveryOption;
  direct_booking_available: boolean;
  images: string[];
  description: string | null;
  specifications: Record<string, unknown> | null;
  condition_notes: string | null;
  is_available: boolean;
  is_active: boolean;
  quantity_available: number;
  created_at: Date;
  updated_at: Date;
}

export interface RentalBooking {
  id: string;
  booking_number: string;
  buyer_id: string;
  supplier_id: string;
  project_id: string | null;
  rental_tool_id: string;
  start_date: Date;
  end_date: Date;
  actual_start_date: Date | null;
  actual_end_date: Date | null;
  rental_duration_days: number;
  day_rate: number;
  total_rental_amount: number;
  deposit_amount: number;
  delivery_fee: number;
  pickup_or_delivery: DeliveryOption;
  delivery_address: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  payment_terms: PaymentTerms;
  status: BookingStatus;
  notes: string | null;
  buyer_notes: string | null;
  supplier_notes: string | null;
  confirmed_at: Date | null;
  cancelled_at: Date | null;
  cancellation_reason: string | null;
  late_return_fee: number;
  damage_fee: number;
  created_at: Date;
  updated_at: Date;
}

export interface Handover {
  id: string;
  booking_id: string;
  photos: string[];
  condition_flags: Record<string, unknown> | null;
  odometer_reading: string | null;
  fuel_level: string | null;
  handover_notes: string | null;
  timestamp: Date;
  supplier_user_id: string | null;
  buyer_signature: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  created_at: Date;
}

export interface Return {
  id: string;
  booking_id: string;
  photos: string[];
  condition_flags: Record<string, unknown> | null;
  odometer_reading: string | null;
  fuel_level: string | null;
  damage_notes: string | null;
  damage_assessment: Record<string, unknown> | null;
  timestamp: Date;
  supplier_user_id: string | null;
  buyer_signature: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  is_late_return: boolean;
  days_overdue: number;
  created_at: Date;
}

export interface RentalAvailability {
  id: string;
  rental_tool_id: string;
  blocked_start_date: Date;
  blocked_end_date: Date;
  reason: string | null;
  booking_id: string | null;
  created_at: Date;
}

export interface TrustMetrics {
  id: string;
  supplier_id: string;
  spec_reliability_pct: number;
  on_time_pct: number;
  issue_rate_pct: number;
  sample_size: number;
  total_orders: number;
  total_disputes: number;
  total_late_deliveries: number;
  total_spec_mismatches: number;
  average_rating: number | null;
  total_ratings: number;
  response_time_hours: number | null;
  updated_at: Date;
  created_at: Date;
}

export interface BillingLedger {
  id: string;
  supplier_id: string;
  order_id: string | null;
  booking_id: string | null;
  transaction_type: string;
  order_type: OrderType | null;
  effective_value: number;
  fee_percentage: number;
  fee_amount: number;
  net_amount: number;
  invoice_number: string | null;
  invoice_status: InvoiceStatus;
  invoice_issued_at: Date | null;
  payment_due_date: Date | null;
  paid_at: Date | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SupplierPayment {
  id: string;
  supplier_id: string;
  ledger_ids: string[];
  payment_amount: number;
  payment_method: string | null;
  payment_reference: string | null;
  payment_date: Date;
  notes: string | null;
  created_at: Date;
}

export interface BuyerPayment {
  id: string;
  buyer_id: string;
  order_id: string | null;
  booking_id: string | null;
  payment_amount: number;
  payment_method: string | null;
  payment_status: string;
  payment_reference: string | null;
  payment_date: Date | null;
  notes: string | null;
  created_at: Date;
}

export interface SupplierReview {
  id: string;
  supplier_id: string;
  buyer_id: string;
  order_id: string | null;
  booking_id: string | null;
  rating: number;
  review_text: string | null;
  response_text: string | null;
  response_date: Date | null;
  is_verified: boolean;
  is_visible: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  deep_link: string | null;
  data: Record<string, unknown> | null;
  delivered_at: Date;
  read_at: Date | null;
  is_read: boolean;
  expires_at: Date | null;
  created_at: Date;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  push_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  updated_at: Date;
  created_at: Date;
}

export interface Template {
  id: string;
  slug: string;
  title_ka: string;
  title_en: string;
  description_ka: string | null;
  description_en: string | null;
  fields: TemplateField[];
  bom_logic: string | null;
  instructions: TemplateInstruction[] | null;
  safety_notes_ka: string | null;
  safety_notes_en: string | null;
  images: string[];
  estimated_duration_days: number | null;
  difficulty_level: string | null;
  category: string | null;
  version: number;
  is_published: boolean;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TemplateField {
  name: string;
  type: string;
  label_ka: string;
  label_en: string;
  required: boolean;
  options?: string[];
}

export interface TemplateInstruction {
  step: number;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
}

export interface TemplateUsage {
  id: string;
  template_id: string;
  user_id: string;
  project_id: string | null;
  input_values: Record<string, unknown> | null;
  generated_bom: Record<string, unknown> | null;
  created_at: Date;
}

export interface UserSavedTemplate {
  id: string;
  user_id: string;
  template_id: string;
  created_at: Date;
}

export interface SystemLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  request_data: Record<string, unknown> | null;
  response_data: Record<string, unknown> | null;
  is_error: boolean;
  error_message: string | null;
  timestamp: Date;
}

export interface ScheduledTask {
  id: string;
  task_type: string;
  task_data: Record<string, unknown> | null;
  scheduled_for: Date;
  executed_at: Date | null;
  status: string;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  created_at: Date;
}

// =============================================================================
// QUERY RESULT TYPES
// =============================================================================

export interface SupplierInRadius {
  supplier_id: string;
  business_name: string;
  distance_km: number;
}

export interface SupplierStatistics {
  supplier_id: string;
  business_name: string;
  total_orders: number;
  total_rentals: number;
  total_order_value: number;
  total_rental_value: number;
  average_rating: number;
  total_reviews: number;
  spec_reliability_pct: number | null;
  on_time_pct: number | null;
  issue_rate_pct: number | null;
}
