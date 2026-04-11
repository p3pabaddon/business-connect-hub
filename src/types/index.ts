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
  rating: number;
  review_count: number;
  price_range?: string;
  working_hours?: Record<string, { start: string; end: string }>;
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
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  appointment_date: string;
  appointment_time: string;
  staff_id?: string;
  total_price: number;
  total_duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show" | "waitlist";
}

export interface Review {
  id: string;
  business_id: string;
  customer_name: string;
  rating: number;
  comment?: string;
  is_visible: boolean;
  created_at: string;
}
