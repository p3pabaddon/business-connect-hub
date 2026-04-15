import { supabase } from "@/lib/supabase";

export async function getBusinesses(filters?: { city?: string; district?: string; category?: string; search?: string }) {
  let query = supabase
    .from("businesses")
    .select("id, name, slug, category, rating, review_count, city, district, logo, cover_image, is_verified, is_featured, is_active")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false });

  if (filters?.city && filters.city !== "all") {
    query = query.eq("city", filters.city);
  }
  if (filters?.district && filters.district !== "all") {
    query = query.eq("district", filters.district);
  }
  if (filters?.category) {
    query = query.ilike("category", filters.category);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  // Inject mock latitude and longitude based on city or name for location sorting to work
  // This is a fallback until `latitude` and `longitude` are added to the DB schema
  const mappedData = data?.map((biz: any) => {
    // Generate deterministic pseudo-random offset based on ID
    const hash = biz.id.charCodeAt(0) + (biz.id.charCodeAt(biz.id.length-1) || 0);
    const offsetLat = (hash % 100) * 0.001;
    const offsetLng = (hash % 100) * 0.001;
    
    let baseLat = 41.0082; // Istanbul default
    let baseLng = 28.9784;
    
    if (biz.city === "Ankara") { baseLat = 39.9334; baseLng = 32.8597; }
    else if (biz.city === "İzmir") { baseLat = 38.4192; baseLng = 27.1287; }
    else if (biz.city === "Bursa") { baseLat = 40.1826; baseLng = 29.0669; }

    return {
      ...biz,
      latitude: baseLat + offsetLat,
      longitude: baseLng + offsetLng
    };
  });

  return mappedData;
}

export async function getBusinessBySlug(slug: string) {
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  const [servicesRes, staffRes, reviewsRes] = await Promise.all([
    supabase.from("services").select("*").eq("business_id", business.id).eq("is_active", true).order("created_at"),
    supabase.from("staff").select("*").eq("business_id", business.id).eq("is_active", true),
    supabase.from("reviews").select("*").eq("business_id", business.id).eq("is_visible", true).order("created_at", { ascending: false }).limit(10),
  ]);

  return {
    ...business,
    services: servicesRes.data || [],
    staff: staffRes.data || [],
    reviews: reviewsRes.data || [],
  };
}

export async function getMyBusiness(userId?: string) {
  let uid = userId;
  if (!uid) {
    const { data: { session } } = await supabase.auth.getSession();
    uid = session?.user?.id;
  }
  if (!uid) return null;

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", uid);

  if (error) {
    console.error("getMyBusiness error:", error);
    throw error;
  }
  
  if (!data || data.length === 0) return null;
  
  // If multiple businesses exist, we might want to let the user choose eventually,
  // but for now return the first active one or just the first one.
  return data[0];
}

export async function getBusinessAppointments(businessId: string, status?: string) {
  let query = supabase
    .from("appointments")
    .select("id, appointment_date, appointment_time, status, total_price, customer_name, customer_phone, service_name, notes, total_duration, staff(name)")
    .eq("business_id", businessId)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateAppointmentStatus(id: string, status: string) {
  const { data: apt, error: fetchError } = await supabase
    .from("appointments")
    .select("*, business:businesses(name)")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) throw error;

  // Trigger notification & Loyalty Automation
  if (apt) {
    sendNotification({
      type: "status_change",
      to: apt.customer_email || apt.customer_phone,
      data: {
        status,
        businessName: apt.business?.name,
        date: apt.appointment_date,
        time: apt.appointment_time
      }
    });

    // Automate Loyalty if completed
    if (status === 'completed' && apt.customer_id) {
        await awardLoyaltyStamp(apt.business_id, apt.customer_id);
        
        // Referral Award Logic
        const { data: refRecord } = await supabase
          .from("referrals")
          .select("*")
          .eq("referred_id", apt.customer_id)
          .eq("is_rewarded", false)
          .single();

        if (refRecord) {
          await awardReferralReward(apt.business_id, refRecord.referrer_id, apt.customer_id);
          // Mark this referral as rewarded so they don't get rewards multiple times
          await supabase.from("referrals").update({ 
            is_rewarded: true,
            status: 'completed',
            completed_at: new Date().toISOString(),
            business_id: apt.business_id // Track which business paid the reward
          }).eq("id", refRecord.id);
        }
        
        await supabase.from("loyalty_logs").insert({
         customer_id: apt.customer_id,
         business_id: apt.business_id,
         appointment_id: id,
         action_type: 'appointment_complete'
       });
    }

    // Waitlist logic: if cancelled, notify people waiting for this day
    if (status === "cancelled") {
      const { data: waitlist } = await supabase
        .from("waitlist")
        .select("*")
        .eq("business_id", apt.business_id)
        .eq("desired_date", apt.appointment_date);
      
      if (waitlist && waitlist.length > 0) {
        waitlist.forEach((entry: any) => {
          sendNotification({
            type: "waitlist_alert",
            to: entry.customer_id || entry.user_id, // Fixed: use generic identifier
            data: {
              businessName: apt.business?.name,
              date: apt.appointment_date
            }
          });
        });
      }
    }
  }
}

export async function updateBusinessStatus(id: string, updates: { status?: string, is_active?: boolean }) {
  const { data, error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function joinWaitlist(data: { 
  business_id: string; 
  user_id: string; 
  date: string; 
  time?: string;
  customer_name?: string; 
  customer_phone?: string; 
  customer_email?: string 
}) {
  // 1. Profil bilgilerini güncelle (Fallback olarak)
  if (data.user_id && (data.customer_name || data.customer_phone)) {
    try {
      await supabase.from("profiles").update({
        full_name: data.customer_name,
        phone: data.customer_phone,
      }).eq("id", data.user_id);
    } catch (e) {
      console.warn("Profile update failed during waitlist join:", e);
    }
  }

  // 2. Waitlist tablosuna ekle
  // Tablo sütunları: id, user_id, business_id, desired_date, desired_time, customer_name, customer_phone, customer_email, created_at
  const { error } = await supabase.from("waitlist").insert({
    business_id: data.business_id,
    user_id: data.user_id,
    desired_date: data.date,
    desired_time: data.time || null,
    customer_name: data.customer_name || null,
    customer_phone: data.customer_phone || null,
    customer_email: data.customer_email || null
  });
  
  if (error) throw error;
  return true;
}

export interface Business {
  id: string;
  name: string;
  description: string | null;
  category: string;
  address: string;
  city: string;
  district: string;
  image_url: string | null;
  working_hours: Record<string, any>;
  rating: number;
  review_count: number;
  slug: string;
  phone: string | null;
  amenities: string[];
  created_at: string;
  is_premium?: boolean;
  premium_until?: string | null;
  personnel_limit?: number;
  is_featured?: boolean;
  featured_until?: string | null;
  branding_config?: Record<string, any>;
}

const NOTIFICATION_TEMPLATES = {
  status_change: (data: any) => `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #3b82f6;">Randevu Güncellemesi</h2>
      <p>Merhaba,</p>
      <p><strong>${data.businessName}</strong> işletmesindeki randevunuzun durumu güncellendi.</p>
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Yeni Durum:</strong> ${data.statusLabel}</p>
        <p><strong>Tarih:</strong> ${data.date}</p>
        <p><strong>Saat:</strong> ${data.time}</p>
      </div>
      <p>Sorularınız için işletme ile iletişime geçebilirsiniz.</p>
    </div>
  `,
  waitlist_alert: (data: any) => `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #10b981;">Bekleme Listesi Müjdesi!</h2>
      <p>Merhaba,</p>
      <p><strong>${data.businessName}</strong> işletmesinde <strong>${data.date}</strong> tarihi için beklediğiniz yer açıldı!</p>
      <p>Vakit kaybetmeden hemen randevunuzu oluşturun.</p>
      <a href="#" style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Randevu Al</a>
    </div>
  `
};

async function sendNotification(params: { type: string, to: string, data: any }) {
  const statusLabels: any = { 
    confirmed: "Onaylandı ✅", 
    cancelled: "İptal Edildi ❌", 
    completed: "Tamamlandı ✨" 
  };
  
  const templateData = {
    ...params.data,
    statusLabel: statusLabels[params.data.status] || params.data.status
  };

  const html = (NOTIFICATION_TEMPLATES as any)[params.type]?.(templateData);
  
  if (html) {
    console.log(`[REAL NOTIFICATION SIMULATION] to: ${params.to}`);
    console.log(`SUBJECT: ${params.type === 'waitlist_alert' ? 'Yer Açıldı!' : 'Randevu Güncellemesi'}`);
    console.log(`CONTENT: ${html}`);
  }
}

export async function getBusinessStats(businessId: string) {
  const today = new Date().toISOString().split("T")[0];
  
  const [totalRes, todayRes, pendingRes, revenueRes] = await Promise.all([
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("business_id", businessId),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("appointment_date", today),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("status", "pending"),
    supabase.from("appointments").select("total_price").eq("business_id", businessId).eq("status", "completed"),
  ]);

  const totalRevenue = (revenueRes.data || []).reduce((sum: number, a: any) => sum + (Number(a.total_price) || 0), 0);

  return {
    totalAppointments: totalRes.count || 0,
    todayAppointments: todayRes.count || 0,
    pendingAppointments: pendingRes.count || 0,
    totalRevenue,
  };
}

export async function createAppointment(data: any) {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Kara liste (banned users) kontrolü
  if (data.customer_phone) {
    const { data: banRecord } = await supabase
      .from("banned_users")
      .select("id")
      .eq("phone", data.customer_phone)
      .limit(1)
      .single();
      
    if (banRecord) {
      throw new Error("İşlem reddedildi: Bu telefon numarası platform kuralları ihlali nedeniyle kalıcı olarak askıya alınmıştır.");
    }
  }
  // No-Show ceza kontrolü
  const NO_SHOW_LIMIT = 3;
  if (user?.id) {
    const { count } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", user.id)
      .eq("status", "no_show");

    if ((count || 0) >= NO_SHOW_LIMIT) {
      // Forced prepayment — müşteri 3+ kez gelmemiş, ön ödeme zorunlu
      if (!data.is_paid && data.total_price > 0) {
        throw new Error(
          `Geçmişte ${count} kez randevunuza gelmediniz. Yeni randevu alabilmeniz için ön ödeme yapmanız gerekmektedir.`
        );
      }
    }
  }

  // Embed duration metadata in notes field since DB may not have total_duration column
  const durationTag = `[DURATION:${data.total_duration || 30}]`;
  const notesWithDuration = data.notes ? `${durationTag} ${data.notes}` : durationTag;

  const insertData: Record<string, any> = {
    business_id: data.business_id,
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email || null,
    appointment_date: data.appointment_date,
    appointment_time: data.appointment_time,
    total_price: data.total_price || 0,
    notes: notesWithDuration,
    status: data.total_price > 0 && data.is_paid ? "confirmed" : "pending",
    service_name: data.service_name || "",
  };

  if (data.staff_id) insertData.staff_id = data.staff_id;
  if (user?.id) insertData.customer_id = user.id;

  const { error } = await supabase.from("appointments").insert(insertData);
  if (error) throw error;
}

export async function getOccupiedSlots(businessId: string, date: string, staffId?: string) {
  try {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 5000)
    );

    let query = supabase
      .from("appointments")
      .select("appointment_time, staff_id, notes")
      .eq("business_id", businessId)
      .eq("appointment_date", date)
      .in("status", ["pending", "confirmed", "completed"]);

    if (staffId) {
      query = query.eq("staff_id", staffId);
    }

    const { data, error } = await Promise.race([query, timeout]) as any;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Slot fetch optimization error:", err);
    return []; // Return empty on error/timeout to unblock UI
  }
}

// --- Loyalty & Growth Functions ---

export async function getLoyaltyProgram(businessId: string) {
   const { data, error } = await supabase
     .from("loyalty_programs")
     .select("*")
     .eq("business_id", businessId)
     .eq("is_active", true)
     .single();
   
   if (error && error.code !== "PGRST116") throw error;
   return data;
}

export async function joinLoyaltyProgram(businessId: string) {
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) throw new Error("Giriş yapmalısınız");

   const { data, error } = await supabase
     .from("customer_loyalty")
     .insert({
       business_id: businessId,
       customer_id: user.id,
       current_stamps: 0,
       total_completed_appointments: 0
     })
     .select()
     .single();
   
   if (error) throw error;
   return data;
}

export async function getCustomerLoyalty(businessId: string) {
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return null;

   const { data, error } = await supabase
     .from("customer_loyalty")
     .select("*")
     .eq("business_id", businessId)
     .eq("customer_id", user.id)
     .single();
   
   if (error && error.code !== "PGRST116") throw error;
   return data;
}

async function awardLoyaltyStamp(businessId: string, customerId: string) {
   // Check if business has an active loyalty program
   const program = await getLoyaltyProgram(businessId);
   if (!program) return;

   // Update or Insert loyalty progress
   const { data: current } = await supabase
     .from("customer_loyalty")
     .select("*")
     .eq("business_id", businessId)
     .eq("customer_id", customerId)
     .single();

   if (current) {
     const newStamps = current.current_stamps + 1;
     const totalCompleted = current.total_completed_appointments + 1;
     
     // Check for reward
     if (newStamps >= program.target_stamps) {
       // Reset stamps and generate a promo code
       await supabase.from("customer_loyalty").update({
         current_stamps: 0,
         total_completed_appointments: totalCompleted,
         updated_at: new Date().toISOString()
       }).eq("id", current.id);
       
       // Generate Reward Code
       await createPromoCode({
         business_id: businessId,
         customer_id: customerId,
         discount_type: program.reward_type === 'free_service' ? 'percent' : program.reward_type,
         discount_value: program.reward_type === 'free_service' ? 100 : program.reward_value,
         code: `LOYALTY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
       });
     } else {
       await supabase.from("customer_loyalty").update({
         current_stamps: newStamps,
         total_completed_appointments: totalCompleted,
         updated_at: new Date().toISOString()
       }).eq("id", current.id);
     }
   } else {
     await supabase.from("customer_loyalty").insert({
       business_id: businessId,
       customer_id: customerId,
       current_stamps: 1,
       total_completed_appointments: 1
     });
   }
}

export async function createPromoCode(params: any) {
   const { error } = await supabase.from("promo_codes").insert({
     ...params,
     expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
   });
   if (error) throw error;
}

export async function getMyPromoCodes() {
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return [];

   const { data, error } = await supabase
     .from("promo_codes")
     .select("*, business:businesses(name)")
     .eq("customer_id", user.id)
     .eq("is_used", false)
     .gt("expires_at", new Date().toISOString());
   
   if (error) throw error;
   return data;
}

export async function claimReferral(referralCode: string) {
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) throw new Error("Giriş yapmalısınız");

   // 1. Find referral
   const { data: referral, error: refError } = await supabase
     .from("referrals")
     .select("*")
     .eq("referral_code", referralCode)
     .eq("status", "pending")
     .single();
   
   if (refError || !referral) throw new Error("Geçersiz veya kullanılmış kod");
   if (referral.referrer_id === user.id) throw new Error("Kendi kodunuzu kullanamazsınız");

   // 2. Mark as completed
   await supabase.from("referrals").update({
     referred_id: user.id,
     status: "completed",
     completed_at: new Date().toISOString()
   }).eq("id", referral.id);

   // 3. Give rewards (Global 50 TL discount)
   await createPromoCode({
     customer_id: user.id,
     discount_type: "fixed",
     discount_value: 50,
     code: `REF-WELCOME-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
   });

   await createPromoCode({
     customer_id: referral.referrer_id,
     discount_type: "fixed",
     discount_value: 50,
     code: `REF-BONUS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
   });

   return true;
}

export async function getReferralStats() {
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return { count: 0, earnings: 0 };

   const [countRes, earningsRes] = await Promise.all([
     supabase.from("referrals").select("id", { count: "exact" }).eq("referrer_id", user.id).eq("status", "completed"),
     supabase.from("promo_codes").select("discount_value").eq("customer_id", user.id).ilike("code", "REF-%")
   ]);

   const totalEarnings = (earningsRes.data || []).reduce((sum, p) => sum + (Number(p.discount_value) || 0), 0);
   
   return {
     count: countRes.count || 0,
     earnings: totalEarnings
   };
}

export async function awardReferralReward(businessId: string, referrerId: string, refereeId: string) {
   // 1. Get business referral config
   const { data: biz } = await supabase.from("businesses").select("is_referral_active, referral_reward_type, referral_reward_value, referral_reward_target").eq("id", businessId).single();
   
   if (!biz || !biz.is_referral_active) return;

   // 2. Award to Referrer
   if (biz.referral_reward_target === 'referrer' || biz.referral_reward_target === 'both') {
     await createPromoCode({
       business_id: businessId,
       customer_id: referrerId,
       discount_type: biz.referral_reward_type === 'percent' ? 'percent' : 'fixed',
       discount_value: biz.referral_reward_value,
       code: `REF-B-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
     });
   }

   // 3. Award to Referee
   if (biz.referral_reward_target === 'referee' || biz.referral_reward_target === 'both') {
     await createPromoCode({
       business_id: businessId,
       customer_id: refereeId,
       discount_type: biz.referral_reward_type === 'percent' ? 'percent' : 'fixed',
       discount_value: biz.referral_reward_value,
       code: `REF-W-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
     });
   }
}

// --- Intelligence & AI Functions ---

export async function getPricingRules(businessId: string) {
   const { data, error } = await supabase
     .from("pricing_rules")
     .select("id, rule_name, discount_percentage, day_of_week, start_time, end_time")
     .eq("business_id", businessId)
     .eq("is_active", true);
   
   if (error) throw error;
   return data || [];
}

export async function getChurnSentinelData(businessId: string) {
   // 1. Get all completed appointments for this business
   const { data: appointments, error } = await supabase
     .from("appointments")
     .select("customer_id, customer_name, customer_email, customer_phone, appointment_date")
     .eq("business_id", businessId)
     .eq("status", "completed")
     .order("appointment_date", { ascending: false });

   if (error) throw error;
   if (!appointments || appointments.length === 0) return [];

   // 2. Group by customer and find latest visit
   const customerMap = new Map();
   const fortyFiveDaysAgo = new Date();
   fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

   appointments.forEach(a => {
     if (!a.customer_email && !a.customer_phone) return;
     const key = a.customer_id || a.customer_email || a.customer_phone;
     
     if (!customerMap.has(key)) {
       customerMap.set(key, {
         name: a.customer_name,
         email: a.customer_email,
         phone: a.customer_phone,
         last_visit: new Date(a.appointment_date),
         visit_count: 1
       });
     } else {
       customerMap.get(key).visit_count += 1;
     }
   });

   // 3. Filter for churn risk: last visit > 45 days ago AND had at least 1 visit
   const churned = Array.from(customerMap.values())
     .filter(c => c.last_visit < fortyFiveDaysAgo && c.visit_count >= 1)
     .sort((a, b) => a.last_visit.getTime() - b.last_visit.getTime());

   return churned;
}

// --- Inventory Management Functions ---

export async function getInventory(businessId: string) {
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("business_id", businessId)
    .order("name", { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function addInventoryItem(itemData: any) {
  const { data, error } = await supabase
    .from("inventory")
    .insert(itemData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateInventoryItem(id: string, updates: any) {
  const { data, error } = await supabase
    .from("inventory")
    .update({ ...updates, last_updated: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabase
    .from("inventory")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
  return true;
}

export async function updateMyBusiness(businessId: string, updates: any) {
  const { data, error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", businessId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAdminSystemStats() {
  const [bizRes, userRes, revRes] = await Promise.all([
    supabase.from("businesses").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.rpc('get_total_revenue') // Assuming an RPC is more efficient, otherwise fallback to a lightweight select
  ]);

  // Fallback if RPC doesn't exist yet
  let totalRevenue = (revRes as any).data;
  if (revRes.error) {
    const { data } = await supabase.from("appointments").select("total_price").eq("status", "completed");
    totalRevenue = (data || []).reduce((sum, a) => sum + (Number(a.total_price) || 0), 0);
  }

  return {
    totalBusinesses: bizRes.count || 0,
    totalUsers: userRes.count || 0,
    totalAppointments: 0, // Simplified for now as it's not used in current summary
    totalRevenue
  };
}

