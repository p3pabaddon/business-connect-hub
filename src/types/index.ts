export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  email?: string;
  phone?: string;
  city?: string;
  district?: string;
  address?: string;
  cover_image?: string;
  logo?: string;
  is_verified: boolean;
  is_boosted: boolean;
  is_active: boolean;
  is_featured?: boolean;
  featured_until?: string | null;
  is_premium?: boolean;
  premium_until?: string | null;
  rating: number;
  review_count: number;
  price_range?: string;
  working_hours?: Record<string, { start: string; end: string }>;
  owner_id?: string;
  created_at?: string;
  branding_config?: Record<string, any>;
  personnel_limit?: number;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  is_active: boolean;
}

export interface Staff {
  id: string;
  business_id: string;
  name: string;
  role: string;
  avatar?: string;
  experience?: string;
  rating: number;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  business_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  appointment_date: string;
  appointment_time: string;
  staff_id?: string;
  service_name?: string;
  total_price: number;
  total_duration: number;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show" | "waitlist";
  created_at?: string;
}

export interface Review {
  id: string;
  business_id: string;
  customer_name: string;
  rating: number;
  comment?: string;
  reply?: string;
  replied_at?: string;
  is_visible: boolean;
  created_at: string;
}

export interface PromoCode {
  id: string;
  business_id?: string;
  customer_id?: string;
  code: string;
  title?: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  is_active: boolean;
  is_used?: boolean;
  valid_from?: string;
  valid_until?: string;
  expires_at?: string;
  max_uses?: number;
  used_count?: number;
  created_at?: string;
  business?: { name: string };
}

export interface Coupon {
  id: string;
  business_id: string;
  title: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  is_active: boolean;
  created_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  business_id: string;
  name: string;
  quantity: number;
  unit?: string;
  min_stock?: number;
  cost?: number;
  last_updated?: string;
  created_at?: string;
}

export interface WaitlistEntry {
  id: string;
  business_id: string;
  user_id?: string;
  date: string;
  is_notified: boolean;
  notified_at?: string;
  created_at?: string;
}

export interface CustomerNote {
  id: string;
  business_id: string;
  customer_phone: string;
  note: string;
  updated_at?: string;
}

export interface BusinessApplication {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  district?: string;
  address?: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "user" | "admin" | "business_owner" | "hq_staff";
  created_at: string;
  updated_at: string;
}
