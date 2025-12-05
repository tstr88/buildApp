/**
 * Project Management Types
 */

export interface ProjectLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Summary counts
  rfq_count?: number;
  order_count?: number;
  delivery_count?: number;
  rental_count?: number;
  // Instructions data
  instructions?: any[];
  safety_notes?: any[];
  template_slug?: string | null;
  template_inputs?: Record<string, any> | null;
}

export interface ProjectFormData {
  name: string;
  location: ProjectLocation;
  notes?: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  location: ProjectLocation;
  orderCount: number;
  createdAt: string;
}

export interface ProjectDetail {
  project: Project;
  rfqs: ProjectRFQ[];
  orders: ProjectOrder[];
  deliveries: ProjectDelivery[];
  rentals: ProjectRental[];
}

export interface ProjectRFQ {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'expired' | 'closed';
  deadline: string;
  created_at: string;
  offer_count: number;
}

export interface ProjectOrder {
  id: string;
  order_number: string;
  order_type: 'material' | 'rental';
  total_amount: number;
  grand_total: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'disputed' | 'cancelled';
  created_at: string;
  supplier_name: string;
}

export interface ProjectDelivery {
  id: string;
  order_id: string;
  delivered_at: string;
  delivered_by_name: string;
  notes: string | null;
  order_number: string;
  supplier_name: string;
}

export interface ProjectRental {
  id: string;
  booking_number: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'overdue' | 'disputed' | 'cancelled';
  total_cost: number;
  created_at: string;
  tool_name: string;
  supplier_name: string;
}

// Georgia bounds for validation
export const GEORGIA_BOUNDS = {
  minLat: 41.0,
  maxLat: 43.6,
  minLng: 40.0,
  maxLng: 46.8,
};

// Default Tbilisi center
export const TBILISI_CENTER: ProjectLocation = {
  latitude: 41.7151,
  longitude: 44.8271,
};
