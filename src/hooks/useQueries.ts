import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getBusinesses, getBusinessBySlug, getMyBusiness, 
  getBusinessAppointments, getBusinessStats, 
  createAppointment, updateAppointmentStatus,
  getOccupiedSlots, getInventory, updateMyBusiness
} from "@/lib/api";
import { getBizAnalytics, getBizCoupons, getBizReviews, getWaitlist, getBizServices, getBizStaff } from "@/lib/biz-api";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ---- Business Queries ----

export function useBusinesses(filters?: { city?: string; category?: string; search?: string }) {
  return useQuery({
    queryKey: ["businesses", filters],
    queryFn: () => getBusinesses(filters),
    staleTime: 30_000,
  });
}

export function useBusinessBySlug(slug: string) {
  return useQuery({
    queryKey: ["business", slug],
    queryFn: () => getBusinessBySlug(slug),
    enabled: !!slug,
  });
}

export function useMyBusiness() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myBusiness", user?.id],
    queryFn: () => getMyBusiness(user?.id),
    enabled: !!user,
  });
}

// ---- Dashboard Queries ----

export function useBizAnalytics(businessId: string) {
  return useQuery({
    queryKey: ["bizAnalytics", businessId],
    queryFn: () => getBizAnalytics(businessId),
    enabled: !!businessId,
    refetchInterval: 60_000,
  });
}

export function useBusinessStats(businessId: string) {
  return useQuery({
    queryKey: ["bizStats", businessId],
    queryFn: () => getBusinessStats(businessId),
    enabled: !!businessId,
  });
}

export function useBusinessAppointments(businessId: string, status?: string) {
  return useQuery({
    queryKey: ["bizAppointments", businessId, status],
    queryFn: () => getBusinessAppointments(businessId, status),
    enabled: !!businessId,
  });
}

export function useBizCoupons(businessId: string) {
  return useQuery({
    queryKey: ["bizCoupons", businessId],
    queryFn: () => getBizCoupons(businessId),
    enabled: !!businessId,
  });
}

export function useBizReviews(businessId: string) {
  return useQuery({
    queryKey: ["bizReviews", businessId],
    queryFn: () => getBizReviews(businessId),
    enabled: !!businessId,
  });
}

export function useBizServices(businessId: string) {
  return useQuery({
    queryKey: ["bizServices", businessId],
    queryFn: () => getBizServices(businessId),
    enabled: !!businessId,
  });
}

export function useBizStaff(businessId: string) {
  return useQuery({
    queryKey: ["bizStaff", businessId],
    queryFn: () => getBizStaff(businessId),
    enabled: !!businessId,
  });
}

export function useWaitlist(businessId: string) {
  return useQuery({
    queryKey: ["waitlist", businessId],
    queryFn: () => getWaitlist(businessId),
    enabled: !!businessId,
  });
}

export function useInventory(businessId: string) {
  return useQuery({
    queryKey: ["inventory", businessId],
    queryFn: () => getInventory(businessId),
    enabled: !!businessId,
  });
}

export function useOccupiedSlots(businessId: string, date: string, staffId?: string) {
  return useQuery({
    queryKey: ["occupiedSlots", businessId, date, staffId],
    queryFn: () => getOccupiedSlots(businessId, date, staffId),
    enabled: !!businessId && !!date,
  });
}

// ---- User Queries ----

export function useMyAppointments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myAppointments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("appointments")
        .select("*, businesses(name, slug, city)")
        .eq("customer_id", user.id)
        .order("appointment_date", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });
}

export function useMyFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myFavorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("favorites")
        .select("*, businesses(id, name, slug, city, category, rating, review_count, image_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });
}

// ---- Mutations ----

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["bizAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["occupiedSlots"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bizAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["bizStats"] });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateMyBusiness(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBusiness"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
}
